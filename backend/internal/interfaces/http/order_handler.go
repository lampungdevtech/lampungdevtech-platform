package http

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/pkg/response"
	"github.com/oklog/ulid/v2"
)

type OrderHandler struct {
	orderService ports.OrderService
}

func NewOrderHandler(orderService ports.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

// CreateOrder handles POST /api/v1/pos/orders
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var order domain.Order
	if err := c.BodyParser(&order); err != nil {
		return response.BadRequest(c, "Payload pesanan tidak valid", err.Error())
	}

	if order.ID == "" {
		order.ID = ulid.Make().String()
	}

	staffID, _ := c.Locals("staff_id").(string)
	branchID, _ := c.Locals("branch_id").(string)
	merchantID, _ := c.Locals("merchant_id").(string)

	if order.CashierStaffID == "" {
		order.CashierStaffID = staffID
	}
	if order.BranchID == "" {
		order.BranchID = branchID
	}
	if order.MerchantID == "" {
		order.MerchantID = merchantID
	}

	// Hitung subtotal dan item ID jika belum di-set
	var calculatedSubtotal int64
	for i := range order.Items {
		if order.Items[i].ID == "" {
			order.Items[i].ID = ulid.Make().String()
		}
		if order.Items[i].Subtotal == 0 {
			order.Items[i].Subtotal = int64(order.Items[i].Quantity) * order.Items[i].UnitPrice
		}
		calculatedSubtotal += order.Items[i].Subtotal
	}

	if order.Subtotal == 0 {
		order.Subtotal = calculatedSubtotal
	}
	if order.TotalAmount == 0 {
		order.TotalAmount = order.Subtotal + order.TaxAmount - order.DiscountAmount
	}

	if err := h.orderService.CreateOrder(c.Context(), &order); err != nil {
		return response.InternalError(c, "Gagal memproses pesanan", err.Error())
	}

	return response.Created(c, "Pesanan berhasil dicatat", order)
}

// SyncBatchOrders handles POST /api/v1/pos/orders/sync
// Menerima antrean pesanan dari penyimpanan lokal SQLite aplikasi kasir offline
func (h *OrderHandler) SyncBatchOrders(c *fiber.Ctx) error {
	var req struct {
		Orders []domain.Order `json:"orders"`
	}

	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload sinkronisasi offline tidak valid", err.Error())
	}

	staffID, _ := c.Locals("staff_id").(string)
	branchID, _ := c.Locals("branch_id").(string)
	merchantID, _ := c.Locals("merchant_id").(string)

	syncedIDs := make([]string, 0, len(req.Orders))
	failedCount := 0

	for i := range req.Orders {
		order := &req.Orders[i]
		if order.CashierStaffID == "" {
			order.CashierStaffID = staffID
		}
		if order.BranchID == "" {
			order.BranchID = branchID
		}
		if order.MerchantID == "" {
			order.MerchantID = merchantID
		}
		if order.CreatedAt.IsZero() {
			order.CreatedAt = time.Now()
		}

		err := h.orderService.CreateOrder(c.Context(), order)
		if err != nil {
			failedCount++
			continue
		}
		syncedIDs = append(syncedIDs, order.ID)
	}

	return response.OK(c, "Proses sinkronisasi transaksi offline selesai", fiber.Map{
		"synced_count": len(syncedIDs),
		"failed_count": failedCount,
		"synced_ids":   syncedIDs,
	})
}

// GetOrderByID handles GET /api/v1/pos/orders/:id
func (h *OrderHandler) GetOrderByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.BadRequest(c, "ID pesanan wajib disertakan", nil)
	}

	order, err := h.orderService.GetOrderByID(c.Context(), id)
	if err != nil {
		return response.NotFound(c, "Pesanan tidak ditemukan")
	}

	return response.OK(c, "Data pesanan ditemukan", order)
}

// GetBranchOrders handles GET /api/v1/pos/orders
func (h *OrderHandler) GetBranchOrders(c *fiber.Ctx) error {
	branchID := c.Query("branch_id")
	if branchID == "" {
		if b, ok := c.Locals("branch_id").(string); ok && b != "" {
			branchID = b
		}
	}

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	orders, err := h.orderService.GetOrdersByBranch(c.Context(), branchID, limit)
	if err != nil {
		return response.InternalError(c, "Gagal mengambil daftar pesanan cabang", err.Error())
	}

	return response.OK(c, "Daftar pesanan cabang berhasil dimuat", orders)
}
