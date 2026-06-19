import { useState, useMemo } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { CostCenter } from "../../../types/accounting";
import DataTable, { Column } from "../shared/DataTable";
import AccountingToolbar from "../layout/AccountingToolbar";
import { Filter, X } from "lucide-react";

interface Props {
  language: "en" | "ar";
}

const COST_CENTERS: { value: CostCenter | "All"; labelEn: string; labelAr: string }[] = [
  { value: "All", labelEn: "All Centers", labelAr: "جميع المراكز" },
  { value: "HOSPITAL", labelEn: "Hospital", labelAr: "المستشفى" },
  { value: "PHARMACY", labelEn: "Pharmacy", labelAr: "الصيدلية" },
  { value: "WAREHOUSE", labelEn: "Warehouse", labelAr: "المستودع" },
  { value: "OPTICS", labelEn: "Optics", labelAr: "البصريات" },
  { value: "EMPLOYEES", labelEn: "Employees", labelAr: "الموظفين" },
];

export default function GeneralLedger({ language }: Props) {
  const { state } = useAccounting();
  const { journal } = state;
  const [search, setSearch] = useState("");
  const [costCenterFilter, setCostCenterFilter] = useState<CostCenter | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    let result = journal;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(je => je.narrative.toLowerCase().includes(q) || je.id.toLowerCase().includes(q));
    }
    if (costCenterFilter !== "All") {
      result = result.filter(je => je.costCenter === costCenterFilter);
    }
    if (categoryFilter !== "All") {
      result = result.filter(je => je.category === categoryFilter);
    }
    return result;
  }, [journal, search, costCenterFilter, categoryFilter]);

  const hasFilters = search || costCenterFilter !== "All" || categoryFilter !== "All";

  const columns: Column<typeof journal[0]>[] = [
    {
      key: "id",
      header: language === "ar" ? "رقم القيد" : "Journal ID",
      render: row => <span className="text-indigo-600 dark:text-[#2BBFFF] font-bold">{row.id}</span>,
    },
    {
      key: "timestamp",
      header: language === "ar" ? "الوقت" : "Time",
      render: row => <span className="text-neutral-400">{row.timestamp}</span>,
    },
    {
      key: "narrative",
      header: language === "ar" ? "البيان" : "Narrative",
      render: row => (
        <div>
          <span className="font-sans font-semibold text-neutral-800 dark:text-neutral-200">{row.narrative}</span>
          {row.costCenter && (
            <span className="ml-2 text-[8px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1 py-0.5 rounded font-mono uppercase">
              {row.costCenter}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "debit",
      header: language === "ar" ? "مدين" : "Debit",
      align: "right",
      render: row => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          {row.debit > 0 ? `$${row.debit.toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      key: "credit",
      header: language === "ar" ? "دائن" : "Credit",
      align: "right",
      render: row => (
        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
          {row.credit > 0 ? `$${row.credit.toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      key: "drAccount",
      header: language === "ar" ? "حساب مدين" : "Dr Account",
      render: row => <span className="text-[9px] text-neutral-500 font-mono">{row.debitAccountCode || "-"}</span>,
    },
    {
      key: "crAccount",
      header: language === "ar" ? "حساب دائن" : "Cr Account",
      render: row => <span className="text-[9px] text-neutral-500 font-mono">{row.creditAccountCode || "-"}</span>,
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans">
          {language === "ar" ? "دفتر الأستاذ العام" : "General Ledger"}
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={costCenterFilter}
            onChange={e => setCostCenterFilter(e.target.value as CostCenter | "All")}
            className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
          >
            {COST_CENTERS.map(cc => (
              <option key={cc.value} value={cc.value}>{language === "ar" ? cc.labelAr : cc.labelEn}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
          >
            <option value="All">{language === "ar" ? "جميع التصنيفات" : "All Categories"}</option>
            <option value="Revenue">{language === "ar" ? "إيرادات" : "Revenue"}</option>
            <option value="Expenditure">{language === "ar" ? "مصروفات" : "Expenditure"}</option>
            <option value="InsuranceClaim">{language === "ar" ? "مطالبات" : "Insurance"}</option>
            <option value="Payroll">{language === "ar" ? "رواتب" : "Payroll"}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AccountingToolbar
          searchQuery={search}
          onSearchChange={setSearch}
          language={language}
        />
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setCostCenterFilter("All"); setCategoryFilter("All"); }}
            className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition active:scale-[0.98]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={row => row.id}
          emptyMessage={language === "ar" ? "لا توجد قيود. أضف قيداً جديداً." : "No journal entries found. Add a new entry."}
        />
      </div>
    </div>
  );
}
