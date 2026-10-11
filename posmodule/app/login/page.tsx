
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { branding } from "@/lib/branding";
import { loginDemoUser } from "@/lib/auth";
import { getPasswordValidationError, isValidEmail } from "@/lib/validation";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();
    setFieldErrors({});

    if (!value) {
      setFieldErrors({ email: "Please enter your email address." });
      return;
    }

    if (!isValidEmail(value)) {
      setFieldErrors({ email: "Please enter a valid email address." });
      return;
    }

    setEmail(value);
    setError("");
    setStep("password");
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const passwordError = getPasswordValidationError(password);
    setFieldErrors({});

    if (passwordError) {
      setFieldErrors({ password: passwordError });
      return;
    }

    if (
      email.trim().toLowerCase() !== "pos@admin.com" ||
      password !== "Admin@123"
    ) {
      setFieldErrors({ password: "Invalid email or password. Please try again." });
      return;
    }

    try {
      setLoading(true);

      loginDemoUser({
        id: "demo-pos-admin",
        email: "pos@admin.com",
        name: "Jamaluddin Khan",
        role: "Master Admin",
        staffType: "POS Staff",
      });

      router.push("/dashboard");
    } catch {
      setLoading(false);
      setError("Unable to start your session. Please try again.");
    }
  }

  function changeEmail() {
    setStep("email");
    setPassword("");
    setShowPassword(false);
    setError("");
    setFieldErrors({});
  }

  const inputClass =
    "h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:outline-none focus:ring-0";
  const inputErrorClass = "border-red-500 focus:border-red-500";

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1600px] grid-cols-1 gap-4 lg:min-h-[calc(100vh-48px)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-6">
        {/* Login panel */}
        <section className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9 lg:p-10">
          <div className="flex min-h-11 items-center">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.defaultName}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="max-h-12 max-w-[220px] object-contain object-left"
              />
            ) : (
              <span className="text-lg font-semibold text-[var(--foreground)]">
                {branding.defaultName}
              </span>
            )}
          </div>

          <div className="my-auto w-full max-w-md py-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Sign in to manage your brands, restaurants and orders.
            </p>

            <form
              noValidate
              onSubmit={step === "email" ? handleContinue : handleLogin}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setFieldErrors((current) => ({ ...current, email: undefined }));
                  }}
                  readOnly={step === "password"}
                  required
                  autoFocus={step === "email"}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`${inputClass} read-only:bg-[var(--background)] ${fieldErrors.email ? inputErrorClass : ""}`}
                />

                {fieldErrors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}

                {step === "password" && (
                  <button
                    type="button"
                    onClick={changeEmail}
                    className="mt-2 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Change email
                  </button>
                )}
              </div>

              {step === "password" && (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className={`flex h-12 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white ${fieldErrors.password ? "border-red-500" : ""}`}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                        setFieldErrors((current) => ({ ...current, password: undefined }));
                      }}
                      required
                      autoFocus
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? "password-error" : undefined}
                      className="h-full min-w-0 flex-1 rounded-[var(--radius-md)] bg-transparent px-4 text-sm outline-none focus:outline-none focus:ring-0"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="mr-3 flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--primary)]"
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                          <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.3 2.5-2.6 3.7" />
                          <path d="M6.2 6.2C3.9 7.7 2.8 10 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.6" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}

                  <div className="mt-3 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : step === "email"
                    ? "Continue"
                    : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[var(--muted)]">
            Restaurant Management
          </p>
        </section>

        {/* Information panel */}
        <section className="hidden flex-col justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-10 lg:flex xl:p-16">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Restaurant management
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--primary)] xl:text-5xl">
              Your restaurant.
              <span className="block">Your business.</span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
              Manage brands, restaurants, menus and orders from one simple workspace.
            </p>

            <div className="mt-10 space-y-4">
              {[
                [
                  "01",
                  "Restaurant management",
                  "Create and manage your brands.",
                ],
                [
                  "02",
                  "Multiple branches",
                  "Keep each branch organized.",
                ],
                [
                  "03",
                  "Menus and orders",
                  "Manage your daily restaurant operations.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex items-start gap-4 rounded-[var(--radius-md)] border border-[var(--border)] p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--background)] text-sm font-semibold text-[var(--primary)]">
                    {number}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-sm font-medium">
              Less complexity. More control.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
