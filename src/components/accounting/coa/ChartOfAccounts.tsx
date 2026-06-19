import { useState } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { Account, computeTrialBalance } from "../../../types/accounting";
import { ChevronRight, ChevronDown, Search } from "lucide-react";

const CATEGORY_ORDER: Account["category"][] = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"];

const CATEGORY_LABELS: Record<Account["category"], { en: string; ar: string }> = {
  Assets: { en: "Assets", ar: "الأصول" },
  Liabilities: { en: "Liabilities", ar: "الخصوم" },
  Equity: { en: "Equity", ar: "حقوق الملكية" },
  Revenue: { en: "Revenue", ar: "الإيرادات" },
  Expenses: { en: "Expenses", ar: "المصروفات" },
};

interface Props {
  language: "en" | "ar";
}

export default function ChartOfAccounts({ language }: Props) {
  const { state } = useAccounting();
  const { accounts, journal } = state;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const trialBalance = computeTrialBalance(accounts, journal);

  const toggleCategory = (cat: string) => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  const filtered = trialBalance.filter(tb => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tb.account.code.toLowerCase().includes(q) ||
      tb.account.name.toLowerCase().includes(q) ||
      tb.account.nameAr.includes(q)
    );
  });

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: language === "ar" ? CATEGORY_LABELS[cat].ar : CATEGORY_LABELS[cat].en,
    items: filtered.filter(tb => tb.account.category === cat),
  }));

  const relatedEntries = selectedAccount
    ? journal.filter(je => je.debitAccountCode === selectedAccount.code || je.creditAccountCode === selectedAccount.code)
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-200">
      <div className="md:col-span-7 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#EEEDE8]/45 dark:bg-neutral-900/60 p-4 border-b border-[#EAE6DF] dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest font-mono">
              {language === "ar" ? "دليل الحسابات" : "CHART OF ACCOUNTS"}
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                className="pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-[#4F46E5] w-40"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {grouped.map(group => {
            if (group.items.length === 0) return null;
            const isCollapsed = collapsed[group.category];
            const catTotal = group.items.reduce((s, tb) => s + tb.balance, 0);
            return (
              <div key={group.category}>
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition font-bold text-neutral-700 dark:text-neutral-300"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span className="text-[10px] uppercase tracking-wider">{group.label}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">({group.items.length})</span>
                  </div>
                  <span className={`font-mono text-[11px] font-bold ${catTotal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    ${Math.abs(catTotal).toLocaleString()}
                  </span>
                </button>
                {!isCollapsed && group.items.map(tb => (
                  <button
                    key={tb.account.code}
                    onClick={() => setSelectedAccount(tb.account)}
                    className={`w-full flex items-center justify-between px-6 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition border-t border-neutral-50 dark:border-neutral-800/30 ${
                      selectedAccount?.code === tb.account.code ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-[#2BBFFF] shrink-0">{tb.account.code}</span>
                      <span className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate">
                        {language === "ar" && tb.account.nameAr ? tb.account.nameAr : tb.account.name}
                      </span>
                    </div>
                    <span className={`font-mono text-[10px] font-bold shrink-0 ml-2 ${tb.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      ${tb.balance.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-5 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm p-4">
        {selectedAccount ? (
          <div className="space-y-3">
            <div className="border-b border-[#EAE6DF] dark:border-neutral-800 pb-3">
              <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-[#2BBFFF]">{selectedAccount.code}</span>
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans mt-1">
                {language === "ar" && selectedAccount.nameAr ? selectedAccount.nameAr : selectedAccount.name}
              </h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">{selectedAccount.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">{language === "ar" ? "التصنيف" : "Category"}:</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedAccount.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">{language === "ar" ? "الرصيد الحالي" : "Current Balance"}:</span>
              <span className={`font-bold font-mono text-sm ${selectedAccount.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                ${selectedAccount.balance.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[#EAE6DF] dark:border-neutral-800 pt-3 mt-3">
              <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mb-2">
                {language === "ar" ? "الحركات ذات الصلة" : "Related Entries"} ({relatedEntries.length})
              </h5>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {relatedEntries.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 text-center py-3">{language === "ar" ? "لا توجد حركات" : "No entries"}</p>
                ) : (
                  relatedEntries.slice(0, 20).map(je => (
                    <div key={je.id} className="text-[10px] flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-800/40">
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-indigo-600 dark:text-[#2BBFFF]">{je.id}</span>
                        <p className="text-neutral-500 truncate max-w-[160px]">{je.narrative}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">${je.debit > 0 ? je.debit.toFixed(2) : je.credit.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <BookOpenText className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-400">{language === "ar" ? "اختر حساباً لعرض التفاصيل" : "Select an account to view details"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BookOpenText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
