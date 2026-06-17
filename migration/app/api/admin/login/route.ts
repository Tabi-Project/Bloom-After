import { NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE,
  getServerApiBaseUrl,
  decodeJwtPayload,
} from "@/lib/auth";


export async function POST(request: Request) {
  let body: { email?: string; password?: string; rememberDevice?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${getServerApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        rememberDevice: Boolean(body.rememberDevice),
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the authentication server." },
      { status: 502 }
    );
  }

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    const message =
      (data as { error?: string; message?: string })?.error ||
      (data as { message?: string })?.message ||
      "Unable to sign in right now. Please try again.";
    return NextResponse.json({ error: message }, { status: backendRes.status });
  }

  const token = (data as { token?: string })?.token;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication server did not return a session token." },
      { status: 502 }
    );
  }

  const response = NextResponse.json({
    message: (data as { message?: string })?.message || "Login successful.",
    token,
    user: (data as { user?: unknown })?.user ?? null,
  });

  // Mirror the JWT lifetime where possible; fall back to 1 day.
  const payload = decodeJwtPayload(token);
  const maxAge =
    typeof payload?.exp === "number"
      ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
      : 60 * 60 * 24;

  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return response;
}
