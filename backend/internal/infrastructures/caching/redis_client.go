package caching

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/redis/go-redis/v9"
)

type redisLockRepo struct {
	client  *redis.Client
	memLock sync.Map
}

func NewRedisLockRepo(redisURL string) ports.LockRepository {
	repo := &redisLockRepo{}
	if redisURL == "" {
		log.Println("[LockRepo] REDIS_URL kosong, menggunakan fallback in-memory lock")
		return repo
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("[LockRepo] Format Redis URL invalid (%v), fallback ke in-memory lock\n", err)
		return repo
	}

	client := redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("[LockRepo] Tidak dapat terkoneksi ke Redis (%v), fallback ke in-memory lock\n", err)
		return repo
	}

	log.Println("[LockRepo] Berhasil terhubung ke Redis Caching & Distributed Lock")
	repo.client = client
	return repo
}

func (r *redisLockRepo) AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	if r.client != nil {
		return r.client.SetNX(ctx, "lock:"+key, "1", ttl).Result()
	}

	// In-memory fallback
	_, loaded := r.memLock.LoadOrStore(key, time.Now().Add(ttl))
	if loaded {
		// Periksa apakah sudah expired
		val, _ := r.memLock.Load(key)
		if exp, ok := val.(time.Time); ok && time.Now().After(exp) {
			r.memLock.Store(key, time.Now().Add(ttl))
			return true, nil
		}
		return false, nil
	}
	return true, nil
}

func (r *redisLockRepo) ReleaseLock(ctx context.Context, key string) error {
	if r.client != nil {
		return r.client.Del(ctx, "lock:"+key).Err()
	}

	r.memLock.Delete(key)
	return nil
}
