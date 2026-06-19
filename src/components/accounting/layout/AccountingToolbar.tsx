import { Search, Filter, Download } from "lucide-react";

interface AccountingToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  language: "en" | "ar";
  onExportCSV?: () => void;
}

export default function AccountingToolbar({ searchQuery, onSearchChange, language, onExportCSV }: AccountingToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={language === "ar" ? "بحث..." : "Search journals..."}
          className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition"
        />
      </div>
      {onExportCSV && (
        <button
          onClick={onExportCSV}
          className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
