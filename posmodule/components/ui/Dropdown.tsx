"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DropdownOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

type DropdownProps = {
  children: ReactNode;
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
};

export default function Dropdown({
  children,
  id,
  name,
  value,
  defaultValue,
  className = "",
  error = false,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  onChange,
}: DropdownProps) {
  const generatedId = useId();
  const menuId = `${id || generatedId}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child) || child.type !== "option") {
      return [];
    }

    return [{
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }];
  });
  const firstValue = options.find((option) => !option.disabled)?.value ?? "";
  const [localValue, setLocalValue] = useState(String(defaultValue ?? firstValue));
  const selectedValue = value === undefined ? localValue : String(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const filteredOptions = options.filter((option) =>
    getOptionText(option.label).toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    function positionMenu() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(120, window.innerHeight - rect.bottom - 16),
      });
    }

    positionMenu();
    searchRef.current?.focus();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  function openMenu() {
    const selectedIndex = filteredOptions.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActiveIndex(Math.max(0, selectedIndex >= 0 ? selectedIndex : filteredOptions.findIndex((option) => !option.disabled)));
    setOpen(true);
  }

  function choose(option: DropdownOption) {
    if (option.disabled) return;
    if (value === undefined) setLocalValue(option.value);
    onChange?.({ target: { name, value: option.value } });
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setActiveIndex(0);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      let nextIndex = index;
      for (let step = 0; step < filteredOptions.length; step += 1) {
        nextIndex = (nextIndex + direction + filteredOptions.length) % filteredOptions.length;
        if (!filteredOptions[nextIndex].disabled) {
          setActiveIndex(nextIndex);
          optionButtons.current[nextIndex]?.focus();
          break;
        }
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      choose(filteredOptions[index]);
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input type="hidden" name={name} value={selectedValue} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        data-dropdown-trigger
        disabled={disabled}
        aria-label={ariaLabel}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-required={required || undefined}
        aria-invalid={error || undefined}
        aria-describedby={ariaDescribedBy}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => open ? setOpen(false) : openMenu()}
        className={`admin-select-trigger min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] focus-visible:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60 ${className} ${error ? "border-red-500 hover:border-red-500 focus-visible:border-red-500" : ""}`}
      >
        <span className={!selectedOption ? "text-[var(--muted)]" : ""}>{selectedOption?.label ?? "Select an option"}</span>
        <svg className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && menuPosition && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
          className="admin-select-menu fixed z-[100]"
          style={menuPosition}
        >
          {options.length > 3 && (
            <div className="p-1.5">
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  }
                  if (event.key === "ArrowDown" && filteredOptions.length > 0) {
                    event.preventDefault();
                    optionButtons.current[activeIndex]?.focus();
                  }
                }}
                placeholder="Search..."
                className="mb-1 h-9 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
          {filteredOptions.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              ref={(element) => { optionButtons.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              onClick={() => choose(option)}
              className={`admin-select-option w-full text-left ${index === activeIndex ? "is-active" : ""} ${option.value === selectedValue ? "is-selected" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="min-w-0 flex-1">{option.label}</span>
              {option.value === selectedValue && <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          ))}
          {filteredOptions.length === 0 && (
            <p className="px-3 py-2 text-sm text-[var(--muted)]">No options found</p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function getOptionText(label: ReactNode): string {
  if (typeof label === "string" || typeof label === "number") return String(label);
  if (Array.isArray(label)) return label.map(getOptionText).join(" ");
  if (isValidElement<{ children?: ReactNode }>(label)) return getOptionText(label.props.children);
  return "";
}
