import { useState } from "react";
import { ReportTab } from "../../../types/accounting";
import TrialBalance from "./TrialBalance";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import { BarChart3, Receipt, Scale } from "lucide-react";

interface Props {
  language: "en" | "ar";
}

const tabs: { id: ReportTab; labelEn: string; labelAr: string; icon: typeof BarChart3 }[] = [
  { id: "trial-balance", labelEn: "Trial Balance", labelAr: "ميزان المراجعة", icon: Scale },
  { id: "income-statement", labelEn: "Income Statement", labelAr: "قائمة الدخل", icon: BarChart3 },
  { id: "balance-sheet", labelEn: "Balance Sheet", labelAr: "الميزانية العمومية", icon: Receipt },
];

export default function ReportsView({ language }: Props) {
  const [activeReport, setActiveReport] = useState<ReportTab>("trial-balance");

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans">
        {language === "ar" ? "التقارير المالية" : "Financial Reports"}
      </h3>

      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl w-fit border border-[#EAE6DF] dark:border-neutral-800">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 active:scale-[0.98] uppercase tracking-wider ${
                isActive
                  ? "bg-white dark:bg-neutral-800 text-[#4F46E5] dark:text-[#2BBFFF] shadow-sm border border-[#EAE6DF] dark:border-neutral-700"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {language === "ar" ? tab.labelAr : tab.labelEn}
            </button>
          );
        })}
      </div>

      {activeReport === "trial-balance" && <TrialBalance language={language} />}
      {activeReport === "income-statement" && <IncomeStatement language={language} />}
      {activeReport === "balance-sheet" && <BalanceSheet language={language} />}
    </div>
  );
}
