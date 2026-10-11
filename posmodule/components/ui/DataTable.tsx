import type { ReactNode } from "react";

export type DataColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage = "No records found.",
}: {
  rows: T[];
  columns: DataColumn<T>[];
  emptyMessage?: string;
}) {
  if (!rows.length) {
    return <div className="admin-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="admin-table min-w-[680px]">
        <thead><tr>{columns.map((column) => <th key={column.key} className={column.className}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key} className={column.className}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
