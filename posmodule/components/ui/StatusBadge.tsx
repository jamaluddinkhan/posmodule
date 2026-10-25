export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = ["active", "available", "paid", "completed", "ready"].includes(normalized)
    ? "bg-green-50 text-green-700"
    : ["inactive", "cancelled", "refunded"].includes(normalized)
      ? "bg-gray-100 text-gray-600"
      : "bg-amber-50 text-amber-800";

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
