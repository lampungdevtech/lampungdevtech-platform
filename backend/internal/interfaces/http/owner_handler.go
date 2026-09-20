package http

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/pkg/response"
)

type OwnerHandler struct {
	repo    ports.OwnerRepository
	service ports.OwnerService
}

func NewOwnerHandler(repo ports.OwnerRepository, service ports.OwnerService) *OwnerHandler {
	return &OwnerHandler{repo: repo, service: service}
}

// 1. Finance & Banks
func (h *OwnerHandler) GetFinancialSummary(c *fiber.Ctx) error {
	merchantID := c.Query("merchantId", "MCH-01")
	branchID := c.Query("branchId", "ALL")

	summary, err := h.service.GetFinancialSummary(c.Context(), merchantID, branchID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Gagal mengambil ringkasan keuangan: "+err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat ringkasan keuangan", summary)
}

func (h *OwnerHandler) GetBanks(c *fiber.Ctx) error {
	merchantID := c.Query("merchantId", "MCH-01")
	banks, err := h.repo.GetBankAccounts(c.Context(), merchantID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat rekening bank", banks)
}

func (h *OwnerHandler) CreateBank(c *fiber.Ctx) error {
	var bank domain.BankAccount
	if err := c.BodyParser(&bank); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Payload request tidak valid")
	}

	if bank.ID == "" {
		bank.ID = fmt.Sprintf("BANK-%d", time.Now().UnixNano()%1000000)
	}
	if bank.MerchantID == "" {
		bank.MerchantID = "MCH-01"
	}
	bank.CreatedAt = time.Now()
	bank.UpdatedAt = time.Now()

	if err := h.repo.CreateBankAccount(c.Context(), &bank); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Rekening bank berhasil ditambahkan", bank)
}

func (h *OwnerHandler) UpdateBank(c *fiber.Ctx) error {
	id := c.Params("id")
	var bank domain.BankAccount
	if err := c.BodyParser(&bank); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Payload request tidak valid")
	}
	bank.ID = id

	if err := h.repo.UpdateBankAccount(c.Context(), &bank); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Saldo rekening berhasil diperbarui", bank)
}

func (h *OwnerHandler) DeleteBank(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.repo.DeleteBankAccount(c.Context(), id); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Rekening bank berhasil dihapus", nil)
}

func (h *OwnerHandler) WithdrawGateway(c *fiber.Ctx) error {
	type withdrawReq struct {
		TargetBankID string `json:"targetBankId"`
		Amount       int64  `json:"amount"`
	}
	var req withdrawReq
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Payload pencairan dana tidak valid")
	}

	if err := h.service.WithdrawGatewayFunds(c.Context(), "MCH-01", req.TargetBankID, req.Amount); err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Pencairan dana payment gateway berhasil", nil)
}

// 2. Sales Analytics
func (h *OwnerHandler) GetSalesAnalytics(c *fiber.Ctx) error {
	data := fiber.Map{
		"todaySales":        2830000,
		"monthSales":        84750000,
		"monthTarget":       100000000,
		"netProfitGlobal":   28700000,
		"netProfitMargin":   33.8,
		"averageOrderValue": 33700,
		"electricity": fiber.Map{
			"kwh":  1420,
			"cost": 2130000,
		},
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat analitik penjualan", data)
}

// 3. Inventory & PO
func (h *OwnerHandler) GetRawMaterials(c *fiber.Ctx) error {
	materials, err := h.repo.GetRawMaterials(c.Context(), "MCH-01", "01-MAIN")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat bahan baku", materials)
}

func (h *OwnerHandler) CreateRawMaterial(c *fiber.Ctx) error {
	var mat domain.RawMaterial
	if err := c.BodyParser(&mat); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid input")
	}
	if mat.ID == "" {
		mat.ID = fmt.Sprintf("MAT-%d", time.Now().UnixNano()%1000000)
	}
	mat.MerchantID = "MCH-01"
	mat.UpdatedAt = time.Now()

	if err := h.repo.CreateRawMaterial(c.Context(), &mat); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Bahan baku berhasil didaftarkan", mat)
}

func (h *OwnerHandler) UpdateStockOpname(c *fiber.Ctx) error {
	id := c.Params("id")
	type opnameReq struct {
		ActualStock float64 `json:"actualStock"`
	}
	var req opnameReq
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid opname payload")
	}

	if err := h.repo.UpdateRawMaterialStock(c.Context(), id, req.ActualStock); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Stok opname berhasil disimpan", nil)
}

func (h *OwnerHandler) DeleteRawMaterial(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.repo.DeleteRawMaterial(c.Context(), id); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Bahan baku berhasil dihapus", nil)
}

func (h *OwnerHandler) GetPurchaseOrders(c *fiber.Ctx) error {
	pos, err := h.repo.GetPurchaseOrders(c.Context(), "MCH-01", "01-MAIN")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat PO", pos)
}

func (h *OwnerHandler) CreatePurchaseOrder(c *fiber.Ctx) error {
	var po domain.PurchaseOrder
	if err := c.BodyParser(&po); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid PO input")
	}
	if po.ID == "" {
		po.ID = fmt.Sprintf("PO-%d", time.Now().UnixNano()%1000000)
	}
	if po.PONumber == "" {
		po.PONumber = fmt.Sprintf("PO-%s-%d", time.Now().Format("20060102"), time.Now().Unix()%1000)
	}
	po.MerchantID = "MCH-01"
	po.Status = "PENDING"
	po.OrderDate = time.Now().Format("2006-01-02")
	po.CreatedAt = time.Now()

	if err := h.repo.CreatePurchaseOrder(c.Context(), &po); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Purchase Order berhasil diterbitkan", po)
}

func (h *OwnerHandler) ReceivePurchaseOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.ReceivePO(c.Context(), id); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Barang PO telah diterima dan stok gudang bertambah", nil)
}

// 4. Staff & Shifts
func (h *OwnerHandler) GetStaffKPI(c *fiber.Ctx) error {
	kpis, err := h.repo.GetStaffKPIs(c.Context(), "MCH-01", "01-MAIN")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat KPI staff", kpis)
}

func (h *OwnerHandler) GetStaffShifts(c *fiber.Ctx) error {
	shifts, err := h.repo.GetStaffShifts(c.Context(), "MCH-01", "01-MAIN")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat roster shift", shifts)
}

func (h *OwnerHandler) CreateStaffShift(c *fiber.Ctx) error {
	var shift domain.StaffShift
	if err := c.BodyParser(&shift); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid shift input")
	}
	if shift.ID == "" {
		shift.ID = fmt.Sprintf("SFT-%d", time.Now().UnixNano()%1000000)
	}
	shift.MerchantID = "MCH-01"
	shift.CreatedAt = time.Now()

	if err := h.repo.CreateStaffShift(c.Context(), &shift); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Staf dan shift berhasil didaftarkan", shift)
}

func (h *OwnerHandler) RotateStaffShift(c *fiber.Ctx) error {
	id := c.Params("id")
	type rotateReq struct {
		ShiftType  string `json:"shiftType"`
		ShiftHours string `json:"shiftHours"`
	}
	var req rotateReq
	_ = c.BodyParser(&req)

	if req.ShiftType == "" {
		req.ShiftType = "MALAM"
		req.ShiftHours = "15:00 - 23:00"
	}

	if err := h.repo.UpdateStaffShift(c.Context(), id, req.ShiftType, req.ShiftHours); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Shift berhasil dirotasi", nil)
}

// 5. Promos & CRM
func (h *OwnerHandler) GetPromos(c *fiber.Ctx) error {
	promos, err := h.repo.GetPromotions(c.Context(), "MCH-01")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat promo", promos)
}

func (h *OwnerHandler) CreatePromo(c *fiber.Ctx) error {
	var promo domain.Promotion
	if err := c.BodyParser(&promo); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid input")
	}
	if promo.ID == "" {
		promo.ID = fmt.Sprintf("PRM-%d", time.Now().UnixNano()%1000000)
	}
	promo.MerchantID = "MCH-01"
	promo.CreatedAt = time.Now()

	if err := h.repo.CreatePromotion(c.Context(), &promo); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Promo berhasil diterbitkan", promo)
}

func (h *OwnerHandler) TogglePromo(c *fiber.Ctx) error {
	id := c.Params("id")
	type toggleReq struct {
		IsActive bool `json:"isActive"`
	}
	var req toggleReq
	_ = c.BodyParser(&req)

	if err := h.repo.TogglePromotion(c.Context(), id, req.IsActive); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Status promo berhasil diubah", nil)
}

func (h *OwnerHandler) DeletePromo(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.repo.DeletePromotion(c.Context(), id); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Promo berhasil dihapus", nil)
}

func (h *OwnerHandler) GetCustomers(c *fiber.Ctx) error {
	customers, err := h.repo.GetCustomers(c.Context(), "MCH-01")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat pelanggan", customers)
}

func (h *OwnerHandler) CreateCustomer(c *fiber.Ctx) error {
	var customer domain.CustomerMember
	if err := c.BodyParser(&customer); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid input")
	}
	if customer.ID == "" {
		customer.ID = fmt.Sprintf("CUST-%d", time.Now().UnixNano()%1000000)
	}
	customer.MerchantID = "MCH-01"
	customer.CreatedAt = time.Now()

	if err := h.repo.CreateCustomer(c.Context(), &customer); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Member berhasil didaftarkan", customer)
}

// 6. Operations: Assets, Parking, SOP, Audit
func (h *OwnerHandler) GetAssets(c *fiber.Ctx) error {
	assets, err := h.repo.GetAssets(c.Context(), "MCH-01")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat aset", assets)
}

func (h *OwnerHandler) CreateAsset(c *fiber.Ctx) error {
	var asset domain.EquipmentAsset
	if err := c.BodyParser(&asset); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid input")
	}
	if asset.ID == "" {
		asset.ID = fmt.Sprintf("AST-%d", time.Now().UnixNano()%1000000)
	}
	asset.MerchantID = "MCH-01"
	asset.CreatedAt = time.Now()

	if err := h.repo.CreateAsset(c.Context(), &asset); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Aset berhasil ditambahkan", asset)
}

func (h *OwnerHandler) UpdateAssetCondition(c *fiber.Ctx) error {
	id := c.Params("id")
	type condReq struct {
		Condition string `json:"condition"`
	}
	var req condReq
	_ = c.BodyParser(&req)

	if err := h.repo.UpdateAssetCondition(c.Context(), id, req.Condition); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Kondisi aset berhasil diperbarui", nil)
}

func (h *OwnerHandler) DeleteAsset(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.repo.DeleteAsset(c.Context(), id); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Aset berhasil dihapus", nil)
}

func (h *OwnerHandler) GetParkingReports(c *fiber.Ctx) error {
	reports, err := h.repo.GetParkingReports(c.Context(), "MCH-01", "01-MAIN")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat laporan parkir", reports)
}

func (h *OwnerHandler) CreateParkingReport(c *fiber.Ctx) error {
	var report domain.ParkingReport
	if err := c.BodyParser(&report); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid input")
	}
	if report.ID == "" {
		report.ID = fmt.Sprintf("PRK-%d", time.Now().UnixNano()%1000000)
	}
	report.MerchantID = "MCH-01"
	report.BranchID = "01-MAIN"
	report.StoreShare = int64(float64(report.GrossAmount) * 0.60)
	report.KeeperShare = int64(float64(report.GrossAmount) * 0.40)
	report.CreatedAt = time.Now()

	if err := h.repo.CreateParkingReport(c.Context(), &report); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusCreated, "Laporan parkir berhasil dicatat", report)
}

func (h *OwnerHandler) GetSOPs(c *fiber.Ctx) error {
	sops, err := h.repo.GetSOPItems(c.Context(), "MCH-01")
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat SOP", sops)
}

func (h *OwnerHandler) ToggleSOPStep(c *fiber.Ctx) error {
	id := c.Params("id")
	stepID := c.Params("stepId")

	if err := h.repo.ToggleSOPStep(c.Context(), id, stepID); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Status checklist SOP berhasil diperbarui", nil)
}

func (h *OwnerHandler) GetAuditLogs(c *fiber.Ctx) error {
	logs, err := h.repo.GetAuditLogs(c.Context(), "MCH-01", 50)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.Success(c, fiber.StatusOK, "Berhasil memuat audit log", logs)
}
