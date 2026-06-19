import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getServerApiBaseUrl } from "@/lib/auth";


export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";

  // Best-effort backend logout; never block the local sign-out on it.
  try {
    await fetch(`${getServerApiBaseUrl()}/api/v1/auth/logout`, {
      method: "POST",
      headers: authHeader ? { authorization: authHeader } : undefined,
    });
  } catch {
    // Ignore — local cookie clearing below is what protects the app.
  }

  const response = NextResponse.json({ message: "Logged out successfully." });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
