import Link from "next/link";
import Button from "@/components/ui/Button";

export default function FormActions({
  cancelHref,
  submitLabel = "Save changes",
  loading = false,
}: {
  cancelHref: string;
  submitLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
      <Link href={cancelHref} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-gray-50">Cancel</Link>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : submitLabel}</Button>
    </div>
  );
}
