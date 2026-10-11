export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeMobileNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}

export function isValidMobileNumber(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function getPasswordValidationError(value: string): string | null {
  if (!value) return "Please enter your password.";

  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one capital letter.";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must include at least one small letter.";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include at least one special symbol.";
  }

  return null;
}
