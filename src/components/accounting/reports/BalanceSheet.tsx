import { useMemo } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { computeTrialBalance, computeBalanceSheet } from "../../../types/accounting";

interface Props {
  language: "en" | "ar";
}

export default function BalanceSheet({ language }: Props) {
  const { state } = useAccounting();
  const trialBalance = useMemo(() => computeTrialBalance(state.accounts, state.journal), [state.accounts, state.journal]);
  const bs = useMemo(() => computeBalanceSheet(trialBalance), [trialBalance]);

  const balanced = Math.abs(bs.totalAssets - (bs.totalLiabilities + bs.totalEquity)) < 0.001;

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans">
          {language === "ar" ? "الميزانية العمومية" : "Balance Sheet"}
        </h3>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold font-mono ${balanced ? "text-emerald-600" : "text-rose-600"}`}>
          <div className={`w-2 h-2 rounded-full ${balanced ? "bg-emerald-500" : "bg-rose-500"}`} />
          {balanced
            ? (language === "ar" ? "متوازنة" : "Balanced")
            : (language === "ar" ? "غير متوازنة" : "Unbalanced")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Section title={language === "ar" ? "الأصول" : "Assets"} items={bs.assets} total={bs.totalAssets} color="emerald" language={language} />
        <Section title={language === "ar" ? "الخصوم" : "Liabilities"} items={bs.liabilities} total={bs.totalLiabilities} color="rose" language={language} />
        <Section title={language === "ar" ? "حقوق الملكية" : "Equity"} items={bs.equity} total={bs.totalEquity} color="indigo" language={language} />
      </div>

      <div className="mt-4 bg-white dark:bg-[#121520] border-2 border-[#4F46E5]/20 dark:border-[#2BBFFF]/20 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest font-mono">
            {language === "ar" ? "محاسبة المعادلة" : "Accounting Equation"}
          </span>
          <span className="text-xs font-mono text-neutral-500">
            {language === "ar"
              ? `الأصول ($${bs.totalAssets.toFixed(2)}) = الخصوم ($${bs.totalLiabilities.toFixed(2)}) + حقوق الملكية ($${bs.totalEquity.toFixed(2)})`
              : `Assets ($${bs.totalAssets.toFixed(2)}) = Liabilities ($${bs.totalLiabilities.toFixed(2)}) + Equity ($${bs.totalEquity.toFixed(2)})`}
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, total, color, language }: {
  title: string;
  items: { name: string; amount: number }[];
  total: number;
  color: "emerald" | "rose" | "indigo";
  language: "en" | "ar";
}) {
  const colors = {
    emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900/50", text: "text-emerald-700 dark:text-emerald-400" },
    rose: { bg: "bg-rose-50/50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-900/50", text: "text-rose-700 dark:text-rose-400" },
    indigo: { bg: "bg-indigo-50/50 dark:bg-indigo-950/20", border: "border-indigo-200 dark:border-indigo-900/50", text: "text-indigo-700 dark:text-indigo-400" },
  };
  const c = colors[color];

  return (
    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
      <div className={`${c.bg} p-3 border-b ${c.border}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${c.text}`}>{title}</span>
      </div>
      <table className="w-full text-left">
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
          {items.length === 0 ? (
            <tr><td colSpan={2} className="p-4 text-center text-neutral-400">{language === "ar" ? "لا توجد بنود" : "No items"}</td></tr>
          ) : (
            items.map(item => (
              <tr key={item.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="p-3 font-sans text-neutral-700 dark:text-neutral-300">{item.name}</td>
                <td className="p-3 text-right font-mono font-bold">${Math.abs(item.amount).toFixed(2)}</td>
              </tr>
            ))
          )}
          <tr className={`${c.bg} border-t-2 ${c.border} text-xs font-bold`}>
            <td className={`p-3 uppercase tracking-wider font-mono ${c.text}`}>
              {language === "ar" ? `إجمالي` : "Total"} {title}
            </td>
            <td className={`p-3 text-right font-mono ${c.text}`}>${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
