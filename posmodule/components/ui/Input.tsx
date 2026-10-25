import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className="block min-w-0" htmlFor={inputId}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
      <input
        id={inputId}
        className={`min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--color-focus)] ${className} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...props}
      />
      {error && <span id={errorId} role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
