
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { isValidEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      setMessage("");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setMessage("");
      return;
    }

    setError("");
    setMessage(
      "Password reset will be available once authentication is connected."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
      <section className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9">
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--primary)]"
        >
          ← Back to login
        </Link>

        <div className="mt-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v3" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Forgot password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Enter your registered email address and we’ll help you reset
            your password.
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setMessage("");
              }}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "email-error" : undefined}
              className={`h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:outline-none focus:ring-0 ${error ? "border-red-500 focus:border-red-500" : ""}`}
            />

            {error && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
              {error}
              </p>
            )}
          </div>

          {message && (
            <p
              role="status"
              className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-5 text-blue-800"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            Reset password
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          Need help? Contact your system administrator.
        </p>
      </section>
    </main>
  );
}
