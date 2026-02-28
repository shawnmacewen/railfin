"use client";

import React, { FormEvent, useMemo, useState } from "react";

type LoginResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

const DEFAULT_REDIRECT = "/";
const AUTH_ACTION_ENDPOINT = "/auth/login";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = useMemo(() => {
    if (typeof window === "undefined") return null;

    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw) return null;

    // Keep redirects internal for SEC middleware expectations.
    return raw.startsWith("/") ? raw : DEFAULT_REDIRECT;
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(AUTH_ACTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          ...(next ? { next } : {}),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as LoginResult;

      if (!response.ok || payload?.ok === false) {
        setError(payload?.error || payload?.message || "Unable to sign in.");
        return;
      }

      const redirectTo = payload?.redirectTo || next || DEFAULT_REDIRECT;
      window.location.assign(redirectTo);
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={submitting}
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={submitting}
      />

      {error ? (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
