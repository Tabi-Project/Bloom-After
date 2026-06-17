"use client";

/**
 * Client-side helpers for the admin session copy kept in sessionStorage.
 *
 * The httpOnly `admin_token` cookie (set by the login route handler) is what
 * `proxy.ts` checks. This sessionStorage copy holds the raw token so
 * `lib/api.ts` can send it as a Bearer header on direct browser → backend API
 * calls, plus the user object for quick UI access.
 */

export const ADMIN_TOKEN_KEY = "adminToken";
export const ADMIN_USER_KEY = "adminUser";

export interface AdminUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isSuperAdmin?: boolean;
  status?: string;
}

export const storeAdminSession = (token: string, user: AdminUser | null) => {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    if (user) {
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // sessionStorage may be unavailable (private mode); cookie auth still works.
  }
};

export const getAdminUser = (): AdminUser | null => {
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    // no-op
  }
};

const getStoredToken = (): string => {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

/** Clears server + client session and returns once both are done. */
export const logoutAdmin = async (): Promise<void> => {
  const token = getStoredToken();
  try {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    // Ignore network errors — clear the local copy regardless.
  }
  clearAdminSession();
};
