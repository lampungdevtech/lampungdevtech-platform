package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/services"
	"github.com/lampungdevtech/backend/internal/infrastructures/caching"
	"github.com/lampungdevtech/backend/internal/infrastructures/messaging"
	"github.com/lampungdevtech/backend/internal/infrastructures/repositories"
	httpInterface "github.com/lampungdevtech/backend/internal/interfaces/http"
	_ "github.com/lib/pq"
)

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func main() {
	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/pos_db?sslmode=disable")
	redisURL := getEnv("REDIS_URL", "redis://localhost:6379")
	rabbitmqURL := getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
	jwtSecret := getEnv("JWT_SECRET", "lampungdevtech-super-secret-pos-jwt-key-2026")
	rabbitmqExchange := getEnv("RABBITMQ_EXCHANGE", "pos.events")

	log.Println("==================================================")
	log.Println("  LampungDevTech POS Backend (Hexagonal Microservice) ")
	log.Println("==================================================")

	// 1. Inisialisasi Database PostgreSQL (dengan fallback aman jika belum terkoneksi)
	var db *sql.DB
	if dbURL != "" {
		conn, err := sql.Open("postgres", dbURL)
		if err == nil {
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			defer cancel()
			if err := conn.PingContext(ctx); err == nil {
				log.Println("[PostgreSQL] Terkoneksi ke database relasional PostgreSQL")
				db = conn
				defer db.Close()
			} else {
				log.Printf("[PostgreSQL] DB Ping gagal (%v), beralih ke in-memory store adapter\n", err)
			}
		}
	}

	// 2. Inisialisasi Driven Adapters (Repositories & Infrastruktur)
	staffRepo := repositories.NewPostgresStaffRepo(db)
	orderRepo := repositories.NewPostgresOrderRepo(db)
	shiftRepo := repositories.NewPostgresShiftRepo(db)

	lockRepo := caching.NewRedisLockRepo(redisURL)
	eventPublisher := messaging.NewRabbitMQPublisher(rabbitmqURL, rabbitmqExchange)

	// 3. Inisialisasi Domain Use Cases (Services)
	authService := services.NewAuthService(staffRepo, jwtSecret)
	orderService := services.NewOrderService(orderRepo, lockRepo, eventPublisher)
	shiftService := services.NewShiftService(shiftRepo, eventPublisher)

	// 4. Inisialisasi Driving Adapters (HTTP Handlers & Fiber Web Framework)
	authHandler := httpInterface.NewAuthHandler(authService)
	shiftHandler := httpInterface.NewShiftHandler(shiftService)
	orderHandler := httpInterface.NewOrderHandler(orderService)

	app := fiber.New(fiber.Config{
		AppName:      "LampungDevTech POS Microservice v1.0",
		ServerHeader: "GoFiber/Fasthttp",
	})

	httpInterface.SetupRouter(app, httpInterface.RouterConfig{
		AuthHandler:  authHandler,
		ShiftHandler: shiftHandler,
		OrderHandler: orderHandler,
		JWTSecret:    jwtSecret,
	})

	// 5. Start Server dengan Graceful Shutdown
	go func() {
		addr := fmt.Sprintf(":%s", port)
		log.Printf("[Server] Menjalankan POS Service pada port %s\n", port)
		if err := app.Listen(addr); err != nil {
			log.Printf("[Server] HTTP server listener exited: %v\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("[Server] Menerima sinyal terminasi, mematikan server secara graceful...")
	_ = app.Shutdown()
	log.Println("[Server] Server berhasil ditutup.")
}
