import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SearchFilter({
  value,
  onChange,
  placeholder = "Search records",
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
      <Input
        aria-label="Search records"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="sm:w-72"
      />
      {value && <Button variant="secondary" onClick={onClear}>Clear</Button>}
    </div>
  );
}
