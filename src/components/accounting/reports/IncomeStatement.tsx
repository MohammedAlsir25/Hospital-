import { useMemo } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { computeTrialBalance, computeIncomeStatement } from "../../../types/accounting";

interface Props {
  language: "en" | "ar";
}

export default function IncomeStatement({ language }: Props) {
  const { state } = useAccounting();
  const trialBalance = useMemo(() => computeTrialBalance(state.accounts, state.journal), [state.accounts, state.journal]);
  const income = useMemo(() => computeIncomeStatement(trialBalance), [trialBalance]);

  return (
    <div className="animate-in fade-in duration-200">
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans mb-4">
        {language === "ar" ? "قائمة الدخل" : "Income Statement"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border-b border-[#EAE6DF] dark:border-neutral-800">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
              {language === "ar" ? "الإيرادات" : "Revenues"}
            </span>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
              {income.revenues.length === 0 ? (
                <tr><td colSpan={2} className="p-4 text-center text-neutral-400">{language === "ar" ? "لا توجد إيرادات" : "No revenues"}</td></tr>
              ) : (
                income.revenues.map(r => (
                  <tr key={r.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                    <td className="p-3 font-sans text-neutral-700 dark:text-neutral-300">{r.name}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">${r.amount.toFixed(2)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-emerald-50/30 dark:bg-emerald-950/10 border-t-2 border-emerald-200 dark:border-emerald-900/50 text-xs font-bold">
                <td className="p-3 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono">
                  {language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
                </td>
                <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-300">
                  ${income.revenues.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 border-b border-[#EAE6DF] dark:border-neutral-800">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider font-mono">
              {language === "ar" ? "المصروفات" : "Expenses"}
            </span>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
              {income.expenses.length === 0 ? (
                <tr><td colSpan={2} className="p-4 text-center text-neutral-400">{language === "ar" ? "لا توجد مصروفات" : "No expenses"}</td></tr>
              ) : (
                income.expenses.map(e => (
                  <tr key={e.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                    <td className="p-3 font-sans text-neutral-700 dark:text-neutral-300">{e.name}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">${e.amount.toFixed(2)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-rose-50/30 dark:bg-rose-950/10 border-t-2 border-rose-200 dark:border-rose-900/50 text-xs font-bold">
                <td className="p-3 text-rose-800 dark:text-rose-300 uppercase tracking-wider font-mono">
                  {language === "ar" ? "إجمالي المصروفات" : "Total Expenses"}
                </td>
                <td className="p-3 text-right font-mono text-rose-700 dark:text-rose-300">
                  ${income.expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-white dark:bg-[#121520] border-2 border-[#4F46E5]/20 dark:border-[#2BBFFF]/20 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest font-mono">
            {language === "ar" ? "صافي الدخل" : "Net Income"}
          </span>
          <span className={`text-2xl font-extrabold font-mono ${income.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            ${Math.abs(income.netIncome).toFixed(2)}
            {income.netIncome >= 0 ? "" : " (Loss)"}
          </span>
        </div>
      </div>
    </div>
  );
}
