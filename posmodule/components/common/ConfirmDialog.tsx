"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button></>}
    >
      <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
    </Modal>
  );
}
