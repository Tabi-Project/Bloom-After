/**
 * Shared auth helpers used by the admin login/logout route handlers and the
 * root `proxy.ts` gate.
 *
 * The Express backend is the source of truth for authentication: it issues a
 * JWT (httpOnly `token` cookie + token in the login response body). Because the
 * backend runs on a different origin (e.g. :5000) than this Next app (:3000),
 * the backend cookie is never visible to Next's proxy. To get middleware-level
 * protection we mirror the JWT into our own httpOnly cookie on the Next origin
 * (`admin_token`) and read/validate it in `proxy.ts`.
 */

export const ADMIN_TOKEN_COOKIE = "admin_token";

/** Routes under /admin that must remain reachable without a session. */
export const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/accept-invite"];

/** Where authenticated admins land after signing in. */
export const ADMIN_HOME = "/admin/dashboard";

/**
 * Backend base URL for server-side (route handler / proxy) fetches.
 * Defaults to the local backend in development; override with env in prod.
 */
export const getServerApiBaseUrl = (): string => {
  const configured =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const base = configured?.trim() || "http://localhost:5000";
  return base.replace(/\/+$/, "");
};

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

/** Decode a JWT payload without verifying the signature (presence/expiry gate only). */
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Lightweight token validity check for the proxy gate: the token must be
 * present, decodable, and not expired. The backend still fully verifies the
 * signature on every real API call, so this is a UX gate, not the only guard.
 */
export const isTokenValid = (token: string | undefined | null): boolean => {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (typeof payload.exp === "number") {
    return payload.exp * 1000 > Date.now();
  }
  // No expiry claim: treat a well-formed token as valid.
  return true;
};
