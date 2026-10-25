"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { branding } from "@/lib/branding";
import { loginDemoUser } from "@/lib/auth";
import { getPasswordValidationError, isValidEmail } from "@/lib/validation";

type FieldErrors = {
  email?: string;
  password?: string;
};

const highlights = [
  {
    number: "01",
    title: "Restaurant management",
    text: "Create and manage your brands.",
  },
  {
    number: "02",
    title: "Multiple branches",
    text: "Keep each branch organized.",
  },
  {
    number: "03",
    title: "Menus and orders",
    text: "Manage your daily restaurant operations.",
  },
];

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
      password !== "Pos@123"
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
    "h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 pr-11 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:outline-none focus:ring-0";
  const inputErrorClass = "border-red-500 focus:border-red-500";

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1240px] grid-cols-1 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-48px)] lg:grid-cols-2">
        {/* Login panel */}
        <section className="flex flex-col p-6 sm:p-10 lg:p-12 xl:p-16">
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

          <div className="my-auto mx-auto w-full max-w-md py-10 lg:py-12">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Welcome back!
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {step === "email"
                ? "Enter your email to manage your brands, restaurants and orders."
                : "Enter your password to continue."}
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

                <div className="relative">
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
                    className={`${inputClass} read-only:bg-[var(--surface-muted)] ${fieldErrors.email ? inputErrorClass : ""}`}
                  />
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                  />
                </div>

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

                  <div className={`flex h-12 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] ${fieldErrors.password ? "border-red-500" : ""}`}>
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
                className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_var(--color-focus)] transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : step === "email"
                    ? "Continue"
                    : "Sign In"}
              </button>
            </form>
          </div>
        </section>

        {/* Info panel */}
        <section className="relative hidden flex-col justify-center overflow-hidden rounded-[140px_28px_28px_140px] bg-gradient-to-br from-[var(--primary)] to-[var(--color-primary-active)] p-10 text-left text-white lg:flex xl:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-black/10 blur-2xl" />

          <div className="relative mx-auto w-full max-w-md">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Restaurant Management
            </p>

            <h2
              className="mt-3 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl"
              style={{ color: "white" }}
            >
              Your restaurant.
              <br />
              Your business.
            </h2>

            <p
              className="mt-4 max-w-sm text-base leading-7"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Manage brands, restaurants, menus and orders from one simple
              workspace.
            </p>

            <div className="mt-8 space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.number}
                  className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold"
                    style={{ color: "white" }}
                  >
                    {item.number}
                  </span>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "white" }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-0.5 text-sm"
                      style={{ color: "rgba(255, 255, 255, 0.75)" }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p
              className="mt-6 text-sm font-medium"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Less complexity. More control.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}