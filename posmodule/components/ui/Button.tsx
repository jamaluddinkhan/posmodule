import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "quiet";
  icon?: ReactNode;
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  icon,
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--color-primary-hover)]",
    secondary: "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-gray-50",
    danger: "border border-red-100 bg-red-50 text-red-700 hover:border-red-300",
    quiet: "text-[var(--muted)] hover:bg-gray-100",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
