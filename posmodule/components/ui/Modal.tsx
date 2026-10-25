import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export default function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="admin-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 id="admin-modal-title" className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md px-2 py-1 text-xl text-[var(--muted)] hover:bg-gray-100">×</button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] bg-gray-50 px-5 py-4">{footer}</footer>}
      </section>
    </div>
  );
}
