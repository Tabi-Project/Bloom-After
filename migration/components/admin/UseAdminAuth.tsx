"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

const ADMIN_USER_KEY = "adminUser";
const ADMIN_AUTH_VERIFIED_KEY = "adminAuthVerified";
const ADMIN_TOKEN_KEY = "adminToken";

export interface AdminUser {
  name?: string;
  email?: string;
  isSuperAdmin?: boolean;
}

export function clearAdminSessionStorage() {
  sessionStorage.removeItem(ADMIN_USER_KEY);
  sessionStorage.removeItem(ADMIN_AUTH_VERIFIED_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function hasFreshAdminReferrer(): boolean {
  try {
    const refPath = new URL(document.referrer).pathname || "";
    return (
      Boolean(refPath) &&
      refPath.startsWith("/admin") &&
      refPath !== "/admin/login" &&
      !refPath.startsWith("/admin/accept-invite")
    );
  } catch {
    return false;
  }
}

function shouldSkipAuthCheck(): boolean {
  if (sessionStorage.getItem(ADMIN_AUTH_VERIFIED_KEY) !== "1") return false;
  return Boolean(getStoredAdminUser());
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!hasFreshAdminReferrer()) {
        sessionStorage.removeItem(ADMIN_AUTH_VERIFIED_KEY);
      }

      if (shouldSkipAuthCheck()) {
        setUser(getStoredAdminUser());
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user?: AdminUser; data?: { user?: AdminUser } }>("/api/v1/auth/session");
        const authedUser = response?.user || response?.data?.user || null;

        if (!authedUser) throw new Error("Missing authenticated user");

        sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(authedUser));
        sessionStorage.setItem(ADMIN_AUTH_VERIFIED_KEY, "1");
        setUser(authedUser);
      } catch {
        clearAdminSessionStorage();
        window.location.assign("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, []);

  return { user, loading };
}