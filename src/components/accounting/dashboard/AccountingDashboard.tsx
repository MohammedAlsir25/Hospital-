import { useAccounting } from "../../../context/AccountingContext";
import { computeTrialBalance, computeIncomeStatement } from "../../../types/accounting";
import KpiCard from "../shared/KpiCard";
import { TrendingUp, DollarSign, ShieldCheck } from "lucide-react";

interface Props {
  language: "en" | "ar";
}

export default function AccountingDashboard({ language }: Props) {
  const { state } = useAccounting();
  const { accounts, journal, patientInvoices, insuranceClaims } = state;

  const trialBalance = computeTrialBalance(accounts, journal);
  const incomeStatement = computeIncomeStatement(trialBalance);

  const netLiquidity = accounts
    .filter(a => a.code === "ACC-1110-CASH" || a.code === "ACC-1120-BANK")
    .reduce((s, a) => s + a.balance, 0);

  const arTotal = accounts
    .filter(a => a.code === "ACC-1130-AR" || a.code === "ACC-1140-AR-INSUR")
    .reduce((s, a) => s + a.balance, 0);

  const settledClaims = insuranceClaims.filter(c => c.status === "Settled").length;
  const totalClaims = insuranceClaims.length;
  const clearingRate = totalClaims > 0 ? ((settledClaims / totalClaims) * 100).toFixed(1) : "0.0";

  const totalRevenue = incomeStatement.revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpense = incomeStatement.expenses.reduce((s, e) => s + e.amount, 0);

  const pendingInvoices = patientInvoices.filter(i => i.status === "Split-Unpaid").length;

  const last10 = journal.slice(0, 10);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 font-sans">
        {language === "ar" ? "لوحة البيانات المالية" : "Financial Dashboard"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label={language === "ar" ? "صافي السيولة" : "Net Liquidity"}
          value={`$${netLiquidity.toLocaleString()}`}
          trend={netLiquidity >= 0 ? "up" : "down"}
          icon={<DollarSign className="w-4 h-4" />}
          sublabel={`Cash: $${(accounts.find(a => a.code === "ACC-1110-CASH")?.balance || 0).toLocaleString()} | Bank: $${(accounts.find(a => a.code === "ACC-1120-BANK")?.balance || 0).toLocaleString()}`}
        />
        <KpiCard
          label={language === "ar" ? "الذمم المدينة" : "Accounts Receivable"}
          value={`$${arTotal.toLocaleString()}`}
          trend={arTotal > 0 ? "neutral" : "up"}
          icon={<TrendingUp className="w-4 h-4" />}
          sublabel={`${pendingInvoices} ${language === "ar" ? "فاتورة معلقة" : "pending invoices"}`}
        />
        <KpiCard
          label={language === "ar" ? "صافي الدخل" : "Net Income"}
          value={`$${incomeStatement.netIncome.toLocaleString()}`}
          trend={incomeStatement.netIncome >= 0 ? "up" : "down"}
          icon={<TrendingUp className="w-4 h-4" />}
          sublabel={`${language === "ar" ? "إيرادات" : "Revenue"}: $${totalRevenue.toLocaleString()} | ${language === "ar" ? "مصروفات" : "Expenses"}: $${totalExpense.toLocaleString()}`}
        />
        <KpiCard
          label={language === "ar" ? "مطالبات التأمين" : "Insurance Clearing"}
          value={`${clearingRate}%`}
          trend={parseFloat(clearingRate) > 70 ? "up" : "neutral"}
          icon={<ShieldCheck className="w-4 h-4" />}
          sublabel={`${settledClaims}/${totalClaims} ${language === "ar" ? "مطالبة مسواة" : "claims settled"}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-2xl shadow-sm">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-3">
            {language === "ar" ? "تفصيل الإيرادات" : "Revenue Breakdown"}
          </h4>
          <div className="space-y-2">
            {incomeStatement.revenues.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">{language === "ar" ? "لا توجد إيرادات بعد" : "No revenue yet"}</p>
            ) : (
              incomeStatement.revenues.map(r => {
                const pct = totalRevenue > 0 ? ((r.amount / totalRevenue) * 100).toFixed(1) : "0";
                return (
                  <div key={r.name}>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{r.name}</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-100">${r.amount.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-2xl shadow-sm">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-3">
            {language === "ar" ? "آخر القيود" : "Recent Journal Entries"}
          </h4>
          <div className="space-y-2">
            {last10.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">{language === "ar" ? "لا توجد قيود بعد" : "No journal entries yet"}</p>
            ) : (
              last10.map(je => (
                <div key={je.id} className="flex items-center justify-between py-1.5 border-b border-[#EAE6DF]/50 dark:border-neutral-800/50 last:border-0">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-[#2BBFFF]">{je.id}</span>
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate max-w-[240px]">{je.narrative}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-emerald-600 font-mono block">${je.debit.toFixed(2)}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">{je.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
