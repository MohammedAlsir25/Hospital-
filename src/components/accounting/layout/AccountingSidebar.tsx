import { AccountingTab } from "../../../types/accounting";
import { LayoutDashboard, BookOpenText, ScrollText, PenLine, BarChart3 } from "lucide-react";

interface AccountingSidebarProps {
  activeTab: AccountingTab;
  onTabChange: (tab: AccountingTab) => void;
  language: "en" | "ar";
}

const tabs: { id: AccountingTab; labelEn: string; labelAr: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", labelEn: "Dashboard", labelAr: "لوحة البيانات", icon: LayoutDashboard },
  { id: "coa", labelEn: "Chart of Accounts", labelAr: "دليل الحسابات", icon: BookOpenText },
  { id: "ledger", labelEn: "General Ledger", labelAr: "دفتر الأستاذ العام", icon: ScrollText },
  { id: "journal", labelEn: "Journal Entry", labelAr: "قيد اليومية", icon: PenLine },
  { id: "reports", labelEn: "Financial Reports", labelAr: "التقارير المالية", icon: BarChart3 },
];

export default function AccountingSidebar({ activeTab, onTabChange, language }: AccountingSidebarProps) {
  return (
    <aside className="w-56 bg-white dark:bg-[#0E1019] border-r border-[#EAE6DF] dark:border-neutral-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-[#EAE6DF] dark:border-neutral-800">
        <h2 className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-widest font-sans">
          {language === "ar" ? "المحاسبة" : "Accounting"}
        </h2>
        <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
          AL JAWARIH EYE HOSPITAL
        </p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? "bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-[#2BBFFF]/10 dark:text-[#2BBFFF] border border-[#4F46E5]/20 dark:border-[#2BBFFF]/20"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{language === "ar" ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#EAE6DF] dark:border-neutral-800">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {language === "ar" ? "متصل" : "Live"}
            </span>
          </div>
          <p className="text-[8px] text-neutral-400 font-mono mt-1 leading-tight">
            {language === "ar" ? "جميع الأرصدة محدثة" : "All balances real-time"}
          </p>
        </div>
      </div>
    </aside>
  );
}
