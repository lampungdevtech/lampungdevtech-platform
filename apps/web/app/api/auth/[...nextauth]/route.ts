import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileClearanceToken } from "@/lib/turnstile-security";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      try {
        if (token?.sub && session.user) {
          session.user.id = token.sub;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user?.id) {
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith(baseUrl) && process.env.PASS_TO_DASHBOARD === 'true') {
          return `${baseUrl}/dashboard`;
        }
        return url.startsWith(baseUrl) ? url : baseUrl;
      } catch (error) {
        console.error("Redirect callback error:", error);
        return baseUrl;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
});

async function isTurnstileVerified(req: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV !== "production" && process.env.TURNSTILE_BYPASS_DEV === "true") {
    return true;
  }

  const clearanceCookie = req.cookies.get("cf_turnstile_cleared")?.value;
  if (!clearanceCookie) {
    return false;
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  return verifyTurnstileClearanceToken(clearanceCookie, clientIp, "login");
}

export async function POST(req: NextRequest, ctx: any) {
  const { pathname } = req.nextUrl;

  // Menolak akses langsung via curl / console devtools ke /api/auth/signin/* tanpa Turnstile clearance
  if (pathname.includes("/signin/")) {
    const verified = await isTurnstileVerified(req);
    if (!verified) {
      return NextResponse.json(
        {
          error: "Tantangan Cloudflare Turnstile wajib diselesaikan sebelum melakukan login.",
          code: "TURNSTILE_CHALLENGE_REQUIRED",
        },
        { status: 403 }
      );
    }
  }

  return handler(req, ctx);
}

export async function GET(req: NextRequest, ctx: any) {
  const { pathname } = req.nextUrl;

  // Proteksi jika endpoint GET /api/auth/signin/* diakses langsung di browser
  if (pathname.includes("/signin/")) {
    const verified = await isTurnstileVerified(req);
    if (!verified) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "TurnstileRequired");
      return NextResponse.redirect(loginUrl);
    }
  }

  return handler(req, ctx);
}
