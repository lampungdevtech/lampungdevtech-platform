import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createTurnstileClearanceToken } from "@/lib/turnstile-security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token?.trim();
    const expectedAction = body?.action || "login";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Token Cloudflare Turnstile wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
      (process.env.NODE_ENV !== "production"
        ? "1x0000000000000000000000000000000AA"
        : "");

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "CLOUDFLARE_TURNSTILE_SECRET_KEY belum dikonfigurasi di server.",
        },
        { status: 500 }
      );
    }

    // Ekstrak IP client
    const headerList = await headers();
    const clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!verifyRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal menghubungi layanan Cloudflare Siteverify.",
        },
        { status: 502 }
      );
    }

    const outcome = await verifyRes.json();

    if (!outcome.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Verifikasi Cloudflare Turnstile gagal: terdeteksi sebagai bot atau replay token.",
          errorCodes: outcome["error-codes"],
        },
        { status: 403 }
      );
    }

    // Validasi tambahan: jika action ditentukan, pastikan sesuai
    if (outcome.action && outcome.action !== expectedAction) {
      return NextResponse.json(
        {
          success: false,
          error: "Action token Turnstile tidak cocok dengan permintaan.",
        },
        { status: 403 }
      );
    }

    // Buat clearance token terenkripsi HMAC-SHA256 untuk mencegah manipulasi client-side
    const clearanceToken = createTurnstileClearanceToken(clientIp, expectedAction);

    const response = NextResponse.json({
      success: true,
      challenge_ts: outcome.challenge_ts,
      hostname: outcome.hostname,
    });

    // Simpan dalam HttpOnly cookie dengan proteksi SameSite & Secure
    response.cookies.set({
      name: "cf_turnstile_cleared",
      value: clearanceToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // Berlaku 5 menit untuk menyelesaikan proses autentikasi
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Turnstile server verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal saat verifikasi token keamanan.",
      },
      { status: 500 }
    );
  }
}
