package domain

import "time"

// DemandForecast represents predicted inventory consumption for cafe raw materials
type DemandForecast struct {
	ID                       string    `json:"id"`
	BranchID                 string    `json:"branchId"`
	IngredientID             string    `json:"ingredientId"`
	IngredientName           string    `json:"ingredientName,omitempty"`
	ForecastDate             time.Time `json:"forecastDate"`
	PredictedConsumption     float64   `json:"predictedConsumption"`
	Unit                     string    `json:"unit"`
	ConfidenceScore          float64   `json:"confidenceScore"`
	RecommendationType       string    `json:"recommendationType"` // CRITICAL_RESTOCK, UPCOMING_DEPLETION, NORMAL
	Rationale                string    `json:"rationale"`
	RecommendedOrderQuantity float64   `json:"recommendedOrderQuantity"`
	CreatedAt                time.Time `json:"createdAt"`
}

// DemandForecastRequest DTO
type DemandForecastRequest struct {
	BranchID       string  `json:"branchId"`
	IngredientID   string  `json:"ingredientId"`
	IngredientName string  `json:"ingredientName"`
	CurrentStock   float64 `json:"currentStock"`
	MinThreshold   float64 `json:"minThreshold"`
	Unit           string  `json:"unit"`
	ForecastDays   int     `json:"forecastDays"`
}
