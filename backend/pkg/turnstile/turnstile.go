package turnstile

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// VerifyResponse merepresentasikan response payload dari Cloudflare Turnstile Siteverify API
type VerifyResponse struct {
	Success     bool     `json:"success"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes"`
	Action      string   `json:"action,omitempty"`
	CData       string   `json:"cdata,omitempty"`
}

type Verifier interface {
	Verify(ctx context.Context, token string, remoteIP string) (bool, error)
}

type cloudflareVerifier struct {
	secretKey  string
	httpClient *http.Client
}

// NewVerifier menginisialisasi verifier Cloudflare Turnstile
func NewVerifier(secretKey string) Verifier {
	return &cloudflareVerifier{
		secretKey: secretKey,
		httpClient: &http.Client{
			Timeout: 6 * time.Second,
		},
	}
}

// Verify memvalidasi token Turnstile yang dikirimkan client ke Cloudflare API endpoint
func (v *cloudflareVerifier) Verify(ctx context.Context, token string, remoteIP string) (bool, error) {
	trimmedToken := strings.TrimSpace(token)
	if trimmedToken == "" {
		return false, errors.New("token turnstile tidak boleh kosong (wajib lulus tantangan bot)")
	}

	secret := v.secretKey
	if secret == "" {
		secret = os.Getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY")
	}

	// Dukungan mock development: jika secret key belum diset di local development non-production
	if secret == "" {
		appEnv := os.Getenv("APP_ENV")
		if appEnv != "production" {
			// Mengizinkan token dummy Cloudflare di local testing
			if trimmedToken == "XXXX.DUMMY.TOKEN.XXXX" || strings.HasPrefix(trimmedToken, "mock-") {
				return true, nil
			}
			// Default key Cloudflare testing yang selalu lulus
			secret = "1x0000000000000000000000000000000AA"
		} else {
			return false, errors.New("CLOUDFLARE_TURNSTILE_SECRET_KEY belum dikonfigurasi di server")
		}
	}

	// Susun payload form URL encoded sesuai spesifikasi resmi Cloudflare
	formData := url.Values{}
	formData.Set("secret", secret)
	formData.Set("response", trimmedToken)
	if remoteIP != "" {
		formData.Set("remoteip", remoteIP)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		strings.NewReader(formData.Encode()),
	)
	if err != nil {
		return false, fmt.Errorf("gagal membuat request verifikasi turnstile: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := v.httpClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("koneksi ke cloudflare siteverify gagal: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("cloudflare mengembalikan status code tidak terduga: %d", resp.StatusCode)
	}

	var result VerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("gagal membaca respons JSON dari cloudflare: %w", err)
	}

	if !result.Success {
		errDetails := strings.Join(result.ErrorCodes, ", ")
		if errDetails == "" {
			errDetails = "invalid-token"
		}
		return false, fmt.Errorf("tantangan turnstile gagal (%s): indikasi bot atau replay attack", errDetails)
	}

	return true, nil
}
