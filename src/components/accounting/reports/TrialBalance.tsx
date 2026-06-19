import { useMemo } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { computeTrialBalance } from "../../../types/accounting";

interface Props {
  language: "en" | "ar";
}

export default function TrialBalance({ language }: Props) {
  const { state } = useAccounting();
  const tb = useMemo(() => computeTrialBalance(state.accounts, state.journal), [state.accounts, state.journal]);

  const totalDebit = tb.reduce((s, r) => s + r.totalDebit, 0);
  const totalCredit = tb.reduce((s, r) => s + r.totalCredit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans">
          {language === "ar" ? "ميزان المراجعة" : "Trial Balance"}
        </h3>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold font-mono ${balanced ? "text-emerald-600" : "text-rose-600"}`}>
          <div className={`w-2 h-2 rounded-full ${balanced ? "bg-emerald-500" : "bg-rose-500"}`} />
          {balanced
            ? (language === "ar" ? "متوازن" : "Balanced")
            : (language === "ar" ? "غير متوازن" : "Unbalanced")}
        </div>
      </div>

      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500 font-mono">
              <th className="p-3 font-bold">{language === "ar" ? "كود الحساب" : "Account Code"}</th>
              <th className="p-3 font-bold">{language === "ar" ? "اسم الحساب" : "Account Name"}</th>
              <th className="p-3 font-bold text-right">{language === "ar" ? "مدين" : "Debit ($)"}</th>
              <th className="p-3 font-bold text-right">{language === "ar" ? "دائن" : "Credit ($)"}</th>
              <th className="p-3 font-bold text-right">{language === "ar" ? "الرصيد" : "Balance ($)"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px]">
            {tb.map(row => (
              <tr key={row.account.code} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-[#2BBFFF]">{row.account.code}</td>
                <td className="p-3 font-sans text-neutral-700 dark:text-neutral-300">
                  {language === "ar" && row.account.nameAr ? row.account.nameAr : row.account.name}
                  <span className="ml-2 text-[8px] text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{row.account.category}</span>
                </td>
                <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {row.totalDebit > 0 ? `$${row.totalDebit.toFixed(2)}` : "-"}
                </td>
                <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400 font-bold">
                  {row.totalCredit > 0 ? `$${row.totalCredit.toFixed(2)}` : "-"}
                </td>
                <td className="p-3 text-right font-mono font-bold">
                  <span className={row.balance >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    ${Math.abs(row.balance).toFixed(2)}
                    {row.balance >= 0 ? " Dr" : " Cr"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-700 text-xs font-bold">
              <td colSpan={2} className="p-3 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-mono">
                {language === "ar" ? "المجموع" : "Total"}
              </td>
              <td className="p-3 text-right font-mono text-emerald-600">${totalDebit.toFixed(2)}</td>
              <td className="p-3 text-right font-mono text-rose-600">${totalCredit.toFixed(2)}</td>
              <td className="p-3 text-right font-mono text-neutral-600">
                {balanced ? "✓" : "✗"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
