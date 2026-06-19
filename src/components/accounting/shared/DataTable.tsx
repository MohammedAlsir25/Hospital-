import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  maxRows?: number;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, keyExtractor, maxRows = 100, emptyMessage = "No data to display." }: DataTableProps<T>) {
  const display = data.slice(0, maxRows);

  return (
    <div className="overflow-x-auto font-mono text-xs">
      {data.length > maxRows && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300">
          Showing top {maxRows} of {data.length.toLocaleString()} rows.
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500">
            {columns.map(col => (
              <th key={col.key} className={`p-3 font-bold ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"} ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
          {display.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            display.map(row => (
              <tr key={keyExtractor(row)} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`p-3 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""} ${col.className || ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
