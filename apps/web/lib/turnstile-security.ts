import crypto from "crypto";

// Mengambil secret key server untuk menandatangani clearance cookie
function getSecretKey(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    "lampungdevtech-secure-turnstile-signing-key"
  );
}

export interface ClearancePayload {
  ts: number;
  ip: string;
  action: string;
}

/**
 * Membuat token clearance bertanda tangan kriptografis (HMAC-SHA256)
 * Token ini disimpan dalam HttpOnly Cookie setelah Cloudflare Turnstile berhasil divalidasi oleh server.
 */
export function createTurnstileClearanceToken(
  clientIp = "",
  action = "login"
): string {
  const ts = Date.now();
  const normalizedIp = clientIp.trim();
  const rawData = `${ts}:${normalizedIp}:${action}`;

  const hmac = crypto
    .createHmac("sha256", getSecretKey())
    .update(rawData)
    .digest("hex");

  const encodedData = Buffer.from(rawData, "utf-8").toString("base64url");
  return `${encodedData}.${hmac}`;
}

/**
 * Memverifikasi validitas token clearance:
 * 1. Struktur token (data & HMAC)
 * 2. Integritas signature (anti-tampering)
 * 3. Masa berlaku (maksimal 5 menit)
 * 4. Kecocokan action
 */
export function verifyTurnstileClearanceToken(
  token: string,
  clientIp = "",
  expectedAction = "login"
): boolean {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const [encodedData, signature] = token.split(".");
  if (!encodedData || !signature) {
    return false;
  }

  try {
    const rawData = Buffer.from(encodedData, "base64url").toString("utf-8");
    const [tsStr, originalIp, action] = rawData.split(":");
    const ts = parseInt(tsStr, 10);

    // 1. Validasi timestamp (maksimal 5 menit untuk mencegah token replay/stale)
    const now = Date.now();
    const maxAgeMs = 5 * 60 * 1000;
    if (isNaN(ts) || now - ts > maxAgeMs || ts > now + 60 * 1000) {
      return false;
    }

    // 2. Validasi action
    if (expectedAction && action !== expectedAction) {
      return false;
    }

    // 3. Validasi IP jika IP client tersedia dan tidak dalam proxy dynamic internal
    if (originalIp && clientIp && originalIp !== "127.0.0.1" && originalIp !== "::1") {
      const currentIp = clientIp.trim();
      if (currentIp && currentIp !== originalIp) {
        // Jika IP terdeteksi beda drastis, tolak untuk mencegah session hijacking
        return false;
      }
    }

    // 4. Validasi keaslian kriptografis HMAC (Timing safe comparison)
    const expectedHmac = crypto
      .createHmac("sha256", getSecretKey())
      .update(rawData)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedHmac);

    if (sigBuf.length !== expBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
