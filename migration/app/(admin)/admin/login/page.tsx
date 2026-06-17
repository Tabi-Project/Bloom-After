"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { storeAdminSession, type AdminUser } from "@/lib/admin-session";
import { ADMIN_HOME } from "@/lib/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface LoginResponse {
  message?: string;
  token?: string;
  user?: AdminUser | null;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [status, setStatus] = useState<{ message: string; type: "is-error" | "is-success" | "" }>(
    { message: "", type: "" }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required.";
    if (!EMAIL_PATTERN.test(trimmed))
      return "Enter a valid email address (for example, name@domain.com).";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required.";
    if (value.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      setStatus({
        message: "Please correct the highlighted fields and try again.",
        type: "is-error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, rememberDevice }),
      });
      const response = (await res.json().catch(() => null)) as LoginResponse & {
        error?: string;
      } | null;

      if (!res.ok) {
        throw new ApiError(
          response?.error || response?.message || "Unable to sign in right now. Please try again.",
          { status: res.status }
        );
      }

      if (response?.token) {
        storeAdminSession(response.token, response.user ?? null);
      }

      setStatus({
        message: response?.message || "Login successful.",
        type: "is-success",
      });

      const redirectParam = new URLSearchParams(window.location.search).get("redirect");
      const redirectTarget = redirectParam?.startsWith("/admin") ? redirectParam : ADMIN_HOME;
      console.log("Redirecting to:", redirectTarget);
      router.replace(redirectTarget);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to sign in right now. Please try again.";
      setStatus({ message, type: "is-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page" style={{ display: "flex", flexDirection: "column" }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="admin-login-header" role="banner">
        <Link className="admin-brand-link" href="/" aria-label="Bloom After home">
          <Image
            src="/assets/logo/favicon.png"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
          />
          <span>Bloom After</span>
        </Link>
      </header>

      <main id="main-content" className="admin-login-main">
        <section className="admin-login-shell container" aria-labelledby="admin-login-title">
          <article className="admin-login-card">
            <header className="admin-login-copy">
              <h1 id="admin-login-title">Admin sign in</h1>
            </header>

            <form
              id="admin-login-form"
              className="admin-login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="field-group">
                <label htmlFor="admin-email">Admin email</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  aria-invalid={emailError ? "true" : undefined}
                  aria-describedby="email-error"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                />
                <p id="email-error" className="field-error" aria-live="polite">
                  {emailError}
                </p>
              </div>

              <div className="field-group">
                <label htmlFor="admin-password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                    value={password}
                    aria-invalid={passwordError ? "true" : undefined}
                    aria-describedby="password-help password-error"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(validatePassword(e.target.value));
                    }}
                    onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
                  />
                  <button
                    id="password-toggle"
                    type="button"
                    className={`password-toggle ${showPassword ? "is-visible" : ""}`}
                    aria-controls="admin-password"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      className="toggle-icon icon-eye"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M2 12S5.75 5.5 12 5.5S22 12 22 12s-3.75 6.5-10 6.5S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    <svg
                      className="toggle-icon icon-eye-off"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.9 9.9A3 3 0 0 1 14.1 14.1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.18 7.58C3.27 9.44 2 12 2 12s3.75 6.5 10 6.5c2.42 0 4.48-.78 6.15-1.86"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.2 5.68A9.6 9.6 0 0 1 12 5.5C18.25 5.5 22 12 22 12a15.6 15.6 0 0 1-2.18 3.1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="visually-hidden password-toggle-text">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                <p id="password-help" className="field-help">
                  Password must be at least 8 characters.
                </p>
                <p id="password-error" className="field-error" aria-live="polite">
                  {passwordError}
                </p>
              </div>

              <div className="form-row">
                <div className="checkbox-wrap">
                  <input
                    id="remember-device"
                    name="rememberDevice"
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                  />
                  <label htmlFor="remember-device">Remember me</label>
                </div>
              </div>

              <button
                id="submit-button"
                className={`btn btn-primary login-submit ${isSubmitting ? "is-loading" : ""}`}
                type="submit"
                disabled={isSubmitting}
              >
                <span
                  className="submit-label"
                  style={{ color: "var(--color-white)", fontWeight: 600 }}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </span>
              </button>

              <div
                id="form-status"
                className={`form-status ${status.type}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {status.message}
              </div>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
}
