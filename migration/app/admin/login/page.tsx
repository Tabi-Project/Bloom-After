"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate first login requiring password set
    setShowSetPassword(true);
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/dashboard/settings");
  };

  return (
    <>
      <div className="admin-login-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <a href="#main-content" className="skip-link">Skip to main content</a>

        <header className="admin-login-header" role="banner">
          <Link className="admin-brand-link" href="/" aria-label="Bloom After home">
            <Image
              src="/favicon.ico"
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

              <form id="admin-login-form" className="admin-login-form" onSubmit={handleSignIn}>
                <div className="field-group">
                  <label htmlFor="admin-email">Admin email</label>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    aria-describedby="email-help email-error"
                    defaultValue="admin@botanical.io"
                  />
                  <p id="email-error" className="field-error" aria-live="polite"></p>
                </div>

                <div className="field-group">
                  <label htmlFor="admin-password">Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      minLength={8}
                      required
                      aria-describedby="password-help password-error"
                      defaultValue="temp-password-123"
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
                      <span className="visually-hidden password-toggle-text">Show password</span>
                    </button>
                  </div>
                  <p id="password-help" className="field-help">Password must be at least 8 characters.</p>
                  <p id="password-error" className="field-error" aria-live="polite"></p>
                </div>

                <div className="form-row">
                  <div className="checkbox-wrap">
                    <input id="remember-device" name="rememberDevice" type="checkbox" />
                    <label htmlFor="remember-device">Remember me</label>
                  </div>
                </div>

                <button id="submit-button" className="btn btn-primary login-submit" type="submit">
                  <span className="submit-label" style={{ color: "var(--color-white)", fontWeight: 600 }}>Sign in</span>
                </button>

                <div
                  id="form-status"
                  className="form-status"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                ></div>
              </form>
            </article>
          </section>
        </main>
      </div>

      {/* Set Password Modal */}
      {showSetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSetPassword(false)}></div>
          
          <div className="relative bg-surface rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">lock_reset</span>
              </div>
              <h3 className="text-xl font-bold font-sans text-on-surface">Set your password</h3>
              <p className="text-sm text-on-surface-variant mt-2 font-sans">
                To secure your account, please replace the temporary password we sent you with a new, strong password.
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant block">
                  Temporary Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value="................"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-md px-4 py-3 text-sm text-on-surface-variant opacity-70"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">
                    lock
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Min. 12 characters"
                    className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-md px-4 py-3 text-sm transition-colors outline-none"
                    required
                    minLength={12}
                    defaultValue="ThisIsAStrongPassword123!"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer text-sm">
                    visibility
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1 px-1">
                  <span className="text-primary font-medium font-sans">Strong password</span>
                  <span className="text-primary font-medium font-sans">100% Secure</span>
                </div>
                <div className="h-1 w-full bg-surface-container-high rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-primary w-full rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repeat your new password"
                    className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-md px-4 py-3 text-sm transition-colors outline-none"
                    required
                    defaultValue="ThisIsAStrongPassword123!"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm font-bold">
                    check_circle
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-primary py-3 rounded-lg text-white font-semibold font-sans flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  Set password
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetPassword(false)}
                  className="w-full bg-surface border border-outline-variant py-3 rounded-lg text-on-surface font-semibold font-sans flex items-center justify-center hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[10px] text-center font-sans text-on-surface-variant leading-relaxed px-4 pt-2">
                By clicking "Set password", you agree to our <a href="#" className="underline">Security Policy</a> and will be logged out of other devices.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
