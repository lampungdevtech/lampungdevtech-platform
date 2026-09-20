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
	"github.com/lampungdevtech/backend/pkg/turnstile"
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
	appEnv := getEnv("APP_ENV", "development")
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if appEnv == "production" {
			log.Fatal("[FATAL SECURITY] Environment variable JWT_SECRET wajib dikonfigurasi pada production!")
		}
		jwtSecret = "lampungdevtech-super-secret-pos-jwt-key-2026"
		log.Println("[WARNING SECURITY] Menjalankan development mode dengan default development JWT_SECRET.")
	}
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
	ownerRepo := repositories.NewPostgresOwnerRepo(db)

	lockRepo := caching.NewRedisLockRepo(redisURL)
	eventPublisher := messaging.NewRabbitMQPublisher(rabbitmqURL, rabbitmqExchange)

	// 3. Inisialisasi Domain Use Cases (Services)
	authService := services.NewAuthService(staffRepo, jwtSecret)
	orderService := services.NewOrderService(orderRepo, lockRepo, eventPublisher)
	shiftService := services.NewShiftService(shiftRepo, eventPublisher)
	ownerService := services.NewOwnerService(ownerRepo)

	// 4. Inisialisasi Driving Adapters (HTTP Handlers & Fiber Web Framework)
	turnstileSecret := os.Getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY")
	if os.Getenv("APP_ENV") == "production" && turnstileSecret == "" {
		log.Fatalf("[FATAL] CLOUDFLARE_TURNSTILE_SECRET_KEY wajib dikonfigurasi pada environment production untuk perlindungan bot brute-force!")
	}
	turnstileVerifier := turnstile.NewVerifier(turnstileSecret)

	authHandler := httpInterface.NewAuthHandler(authService, turnstileVerifier)
	shiftHandler := httpInterface.NewShiftHandler(shiftService)
	orderHandler := httpInterface.NewOrderHandler(orderService)
	ownerHandler := httpInterface.NewOwnerHandler(ownerRepo, ownerService)

	app := fiber.New(fiber.Config{
		AppName:      "LampungDevTech POS Microservice v1.0",
		ServerHeader: "GoFiber/Fasthttp",
	})

	httpInterface.SetupRouter(app, httpInterface.RouterConfig{
		AuthHandler:  authHandler,
		ShiftHandler: shiftHandler,
		OrderHandler: orderHandler,
		OwnerHandler: ownerHandler,
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
