package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
)

type aiSummarizerService struct {
	apiKey     string
	httpClient *http.Client
}

// NewAISummarizerService creates an AI summarizer service
func NewAISummarizerService(apiKey string) ports.AISummarizerService {
	if apiKey == "" {
		apiKey = os.Getenv("GEMINI_API_KEY")
	}
	return &aiSummarizerService{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (s *aiSummarizerService) GenerateWeeklySummary(ctx context.Context, req domain.AIProgressRequest) (*domain.AIProgressResponse, error) {
	if req.StudentName == "" {
		req.StudentName = "Siswa"
	}
	if req.WeekNumber <= 0 {
		req.WeekNumber = 38
	}

	// Try calling Gemini API if API key is set
	if s.apiKey != "" {
		res, err := s.callGeminiAPI(ctx, req)
		if err == nil && res != nil {
			return res, nil
		}
		log.Printf("[AISummarizer] Gemini API call returned: %v. Using intelligent fallback synthesizer.\n", err)
	}

	// High quality child-friendly fallback synthesizer
	summary, tips, concepts := s.synthesizeProgress(req)
	return &domain.AIProgressResponse{
		StudentID:        req.StudentID,
		Summary:          summary,
		ConceptsMastered: concepts,
		EncouragementTip: tips,
	}, nil
}

func (s *aiSummarizerService) callGeminiAPI(ctx context.Context, req domain.AIProgressRequest) (*domain.AIProgressResponse, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", s.apiKey)

	systemPrompt := `You are an expert child educational psychologist and STEM tutor at Ottodot / LampungDevTech EdTech.
Convert raw teacher evaluation notes and homework metrics into an encouraging, warm, and constructive weekly progress summary for the student's parents.
Respond strictly in JSON format with keys:
- "summary": string (Warm narrative evaluation in Indonesian, 2-3 sentences praising effort and highlighting progress)
- "conceptsMastered": array of strings (Key skills or topics mastered)
- "encouragementTip": string (1 actionable, fun recommendation for parents to practice at home)`

	userContent := fmt.Sprintf(
		"Nama Siswa: %s\nMinggu Ke: %d\nSkor Tugas/Kuis: %d/100\nCatatan Guru: %s\nKonsep Terkait: %s",
		req.StudentName,
		req.WeekNumber,
		req.HomeworkScore,
		req.TeacherNotes,
		strings.Join(req.Concepts, ", "),
	)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": systemPrompt + "\n\n" + userContent},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
			"temperature":      0.7,
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini api error status %d: %s", resp.StatusCode, string(respBody))
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from gemini")
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text
	var parsed struct {
		Summary          string   `json:"summary"`
		ConceptsMastered []string `json:"conceptsMastered"`
		EncouragementTip string   `json:"encouragementTip"`
	}

	if err := json.Unmarshal([]byte(rawJSON), &parsed); err != nil {
		return nil, err
	}

	return &domain.AIProgressResponse{
		StudentID:        req.StudentID,
		Summary:          parsed.Summary,
		ConceptsMastered: parsed.ConceptsMastered,
		EncouragementTip: parsed.EncouragementTip,
	}, nil
}

func (s *aiSummarizerService) synthesizeProgress(req domain.AIProgressRequest) (string, string, []string) {
	concepts := req.Concepts
	if len(concepts) == 0 {
		concepts = []string{"Computational Thinking", "Problem Solving", "Visual Collaboration"}
	}

	summary := fmt.Sprintf(
		"🌟 Evaluasi Mingguan %s (Minggu %d): Ananda menunjukkan fokus dan antusiasme tinggi dengan skor tugas %d/100. %s Daya nalar kritis dan kreativitasnya berkembang sangat positif!",
		req.StudentName,
		req.WeekNumber,
		req.HomeworkScore,
		req.TeacherNotes,
	)

	tip := fmt.Sprintf(
		"💡 Tips Ayah Bunda: Ajak %s menceritakan kembali game atau teka-teki yang ia selesaikan hari ini selama 10 menit saat makan malam santai.",
		req.StudentName,
	)

	return summary, tip, concepts
}
