"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const handleSignIn = async (provider: string) => {
    setSecurityError(null);

    // Mencegah bypass/manipulasi payload jika token belum diverifikasi
    if (!turnstileToken) {
      setSecurityError("Selesaikan verifikasi keamanan Cloudflare Turnstile sebelum melanjutkan.");
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Validasi token Turnstile di sisi server Next.js API untuk mencegah manipulasi client
      const verifyRes = await fetch("/api/auth/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: turnstileToken,
          action: "login",
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setSecurityError(
          verifyData.error || "Tantangan keamanan gagal divalidasi. Muat ulang halaman dan coba kembali."
        );
        setTurnstileToken(null);
        setIsVerifying(false);
        return;
      }

      // 2. Jika validasi server lulus, lanjutkan ke NextAuth OAuth provider
      signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setSecurityError("Gagal menghubungi server verifikasi keamanan.");
      setIsVerifying(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Only show login page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 mb-3 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Proteksi Cloudflare Turnstile Aktif</span>
            </div>
            <h2 className="text-3xl font-bold">Selamat Datang</h2>
            <p className="text-muted-foreground mt-2">
              Masuk untuk mengakses fitur lengkap komunitas
            </p>
          </div>

          {securityError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{securityError}</span>
            </div>
          )}

          {/* Cloudflare Turnstile Challenge Widget */}
          <CloudflareTurnstile
            action="login"
            onSuccess={(token) => {
              setTurnstileToken(token);
              setSecurityError(null);
            }}
            onExpire={() => {
              setTurnstileToken(null);
              setSecurityError("Sesi verifikasi keamanan kedaluwarsa. Silakan centang kembali.");
            }}
            onError={() => {
              setTurnstileToken(null);
              setSecurityError("Gagal memuat Cloudflare Turnstile. Pastikan koneksi internet stabil.");
            }}
          />

          <div className="space-y-3 mt-4">
            <Button
              className="w-full"
              disabled={!turnstileToken || isVerifying}
              onClick={() => handleSignIn("google")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isVerifying ? "Memverifikasi Keamanan..." : "Masuk dengan Google"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              disabled={!turnstileToken || isVerifying}
              onClick={() => handleSignIn("github")}
            >
              <Github className="w-5 h-5 mr-2" />
              {isVerifying ? "Memverifikasi Keamanan..." : "Masuk dengan GitHub"}
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <a href="/terms" className="text-primary hover:underline">
              Ketentuan Layanan
            </a>{" "}
            dan{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>
        </Card>
      </div>
    );
  }

  return null;
}