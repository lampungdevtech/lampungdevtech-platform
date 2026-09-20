package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type RouterConfig struct {
	AuthHandler  *AuthHandler
	ShiftHandler *ShiftHandler
	OrderHandler *OrderHandler
	OwnerHandler *OwnerHandler
	JWTSecret    string
}

func SetupRouter(app *fiber.App, cfg RouterConfig) {
	// Global Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// Health check endpoint (for K8s liveness & readiness probe)
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "healthy",
			"service": "lampungdevtech-pos-backend",
		})
	})

	api := app.Group("/api/v1/pos")

	// Public Routes
	api.Post("/auth/login", cfg.AuthHandler.CashierLogin)

	// Owner Portal Routes (BI, Financial, Inventory, Staff, Promos, Operations)
	if cfg.OwnerHandler != nil {
		owner := api.Group("/owner")

		// 1. Finance & Bank Accounts
		owner.Get("/finance/summary", cfg.OwnerHandler.GetFinancialSummary)
		owner.Post("/finance/withdraw-gateway", cfg.OwnerHandler.WithdrawGateway)
		owner.Get("/banks", cfg.OwnerHandler.GetBanks)
		owner.Post("/banks", cfg.OwnerHandler.CreateBank)
		owner.Put("/banks/:id", cfg.OwnerHandler.UpdateBank)
		owner.Delete("/banks/:id", cfg.OwnerHandler.DeleteBank)

		// 2. Sales Analytics
		owner.Get("/analytics/sales", cfg.OwnerHandler.GetSalesAnalytics)

		// 3. Inventory & PO
		owner.Get("/inventory/materials", cfg.OwnerHandler.GetRawMaterials)
		owner.Post("/inventory/materials", cfg.OwnerHandler.CreateRawMaterial)
		owner.Put("/inventory/materials/:id/opname", cfg.OwnerHandler.UpdateStockOpname)
		owner.Delete("/inventory/materials/:id", cfg.OwnerHandler.DeleteRawMaterial)
		owner.Get("/inventory/purchase-orders", cfg.OwnerHandler.GetPurchaseOrders)
		owner.Post("/inventory/purchase-orders", cfg.OwnerHandler.CreatePurchaseOrder)
		owner.Put("/inventory/purchase-orders/:id/receive", cfg.OwnerHandler.ReceivePurchaseOrder)

		// 4. Staff & Shifts
		owner.Get("/staff/kpi", cfg.OwnerHandler.GetStaffKPI)
		owner.Get("/staff/shifts", cfg.OwnerHandler.GetStaffShifts)
		owner.Post("/staff/shifts", cfg.OwnerHandler.CreateStaffShift)
		owner.Put("/staff/shifts/:id/rotate", cfg.OwnerHandler.RotateStaffShift)

		// 5. Promos & CRM
		owner.Get("/promos", cfg.OwnerHandler.GetPromos)
		owner.Post("/promos", cfg.OwnerHandler.CreatePromo)
		owner.Put("/promos/:id/toggle", cfg.OwnerHandler.TogglePromo)
		owner.Delete("/promos/:id", cfg.OwnerHandler.DeletePromo)
		owner.Get("/customers", cfg.OwnerHandler.GetCustomers)
		owner.Post("/customers", cfg.OwnerHandler.CreateCustomer)

		// 6. Operations: Assets, Parking, SOP, Audit
		owner.Get("/operations/assets", cfg.OwnerHandler.GetAssets)
		owner.Post("/operations/assets", cfg.OwnerHandler.CreateAsset)
		owner.Put("/operations/assets/:id", cfg.OwnerHandler.UpdateAssetCondition)
		owner.Delete("/operations/assets/:id", cfg.OwnerHandler.DeleteAsset)
		owner.Get("/operations/parking", cfg.OwnerHandler.GetParkingReports)
		owner.Post("/operations/parking", cfg.OwnerHandler.CreateParkingReport)
		owner.Get("/operations/sops", cfg.OwnerHandler.GetSOPs)
		owner.Put("/operations/sops/:id/step/:stepId", cfg.OwnerHandler.ToggleSOPStep)
		owner.Get("/operations/audit-logs", cfg.OwnerHandler.GetAuditLogs)
	}

	// Protected Routes (Kasir & Staff)
	protected := api.Group("", JWTMiddleware(cfg.JWTSecret))

	// Shift Management
	protected.Post("/shifts/open", cfg.ShiftHandler.OpenShift)
	protected.Post("/shifts/close", cfg.ShiftHandler.CloseShift)
	protected.Get("/shifts/active", cfg.ShiftHandler.GetActiveShift)

	// Order & Transactions
	protected.Post("/orders", cfg.OrderHandler.CreateOrder)
	protected.Post("/orders/sync", cfg.OrderHandler.SyncBatchOrders)
	protected.Get("/orders/:id", cfg.OrderHandler.GetOrderByID)
	protected.Get("/orders", cfg.OrderHandler.GetBranchOrders)
}
