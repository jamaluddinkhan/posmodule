import Loader from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[var(--background)]">
      <Loader label="Loading workspace..." />
    </div>
  );
}
