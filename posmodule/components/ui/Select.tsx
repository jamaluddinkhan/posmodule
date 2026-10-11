import { useId } from "react";
import Dropdown from "@/components/ui/Dropdown";

type SelectProps = {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
};

export default function Select({
  label,
  error,
  options,
  id,
  className = "",
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="block min-w-0">
      {label && <label className="mb-2 block text-sm font-medium" htmlFor={selectId}>{label}</label>}
      <Dropdown
        id={selectId}
        className={`min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--color-focus)] ${className}`}
        error={Boolean(error)}
        aria-describedby={errorId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Dropdown>
      {error && <span id={errorId} role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
