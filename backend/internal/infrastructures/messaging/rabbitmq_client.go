package messaging

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/lampungdevtech/backend/internal/core/ports"
	amqp "github.com/rabbitmq/amqp091-go"
)

type rabbitMQPublisher struct {
	conn         *amqp.Connection
	channel      *amqp.Channel
	exchangeName string
	mu           sync.Mutex
	isAvailable  bool
}

func NewRabbitMQPublisher(amqpURL, exchange string) ports.EventPublisher {
	p := &rabbitMQPublisher{
		exchangeName: exchange,
	}

	if amqpURL == "" {
		log.Println("[RabbitMQ] AMQP_URL kosong, event dispatcher berjalan dalam mode mock/log")
		return p
	}

	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		log.Printf("[RabbitMQ] Gagal terhubung ke RabbitMQ (%v), mode fallback mock aktif\n", err)
		return p
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Printf("[RabbitMQ] Gagal membuka channel (%v)\n", err)
		conn.Close()
		return p
	}

	// Declare exchange: topic
	err = ch.ExchangeDeclare(
		exchange, // name
		"topic",  // type
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	if err != nil {
		log.Printf("[RabbitMQ] Gagal declare exchange (%v)\n", err)
		ch.Close()
		conn.Close()
		return p
	}

	p.conn = conn
	p.channel = ch
	p.isAvailable = true
	log.Printf("[RabbitMQ] Berhasil terhubung ke exchange '%s'\n", exchange)
	return p
}

func (p *rabbitMQPublisher) Publish(ctx context.Context, routingKey string, payload interface{}) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	if !p.isAvailable || p.channel == nil {
		log.Printf("[RabbitMQ Mock Dispatch] Topic: '%s' | Payload: %s\n", routingKey, string(body))
		return nil
	}

	return p.channel.PublishWithContext(
		ctx,
		p.exchangeName, // exchange
		routingKey,     // routing key (e.g. order.kitchen.print, order.created)
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now(),
			Body:         body,
		},
	)
}
