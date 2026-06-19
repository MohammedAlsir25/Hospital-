import { useState } from "react";
import { useAccounting } from "../../../context/AccountingContext";
import { JournalCategory, CostCenter, WalletType } from "../../../types/accounting";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  language: "en" | "ar";
  onSuccess?: () => void;
}

interface FormErrors {
  narrative?: boolean;
  debitAccount?: boolean;
  creditAccount?: boolean;
  amount?: boolean;
  unbalanced?: boolean;
}

export default function ManualJournalForm({ language, onSuccess }: Props) {
  const { state, postJournalEntry } = useAccounting();
  const { accounts } = state;

  const [narrative, setNarrative] = useState("");
  const [category, setCategory] = useState<JournalCategory>("Revenue");
  const [costCenter, setCostCenter] = useState<CostCenter | "">("");
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [wallet, setWallet] = useState<WalletType>("Main Safe");
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const revenueAccounts = accounts.filter(a => a.category === "Revenue");
  const expenseAccounts = accounts.filter(a => a.category === "Expenses");
  const assetAccounts = accounts.filter(a => a.category === "Assets");
  const liabilityAccounts = accounts.filter(a => a.category === "Liabilities");
  const equityAccounts = accounts.filter(a => a.category === "Equity");

  const handleSubmit = () => {
    const newErrors: FormErrors = {};
    if (!narrative.trim()) newErrors.narrative = true;
    if (!debitAccount) newErrors.debitAccount = true;
    if (!creditAccount) newErrors.creditAccount = true;
    if (amount <= 0) newErrors.amount = true;
    if (debitAccount === creditAccount) newErrors.unbalanced = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess(false);
      return;
    }

    postJournalEntry({
      narrative: narrative.trim(),
      category,
      debit: amount,
      credit: amount,
      wallet,
      verifiedBy: "System Accountant",
      debitAccountCode: debitAccount,
      creditAccountCode: creditAccount,
      costCenter: costCenter || undefined,
    });

    setNarrative("");
    setDebitAccount("");
    setCreditAccount("");
    setAmount(0);
    setCostCenter("");
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    onSuccess?.();
  };

  return (
    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm animate-in fade-in duration-200">
      <div className="bg-[#EEEDE8]/45 dark:bg-neutral-900/60 p-4 border-b border-[#EAE6DF] dark:border-neutral-800">
        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest font-mono">
          {language === "ar" ? "قيد يومية يدوي" : "MANUAL JOURNAL ENTRY"}
        </span>
        <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
          {language === "ar" ? "قيد مزدوج متوازن" : "Balanced double-entry journal"}
        </p>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
            {language === "ar" ? "وصف القيد" : "Narrative"}
          </label>
          <input
            type="text"
            value={narrative}
            onChange={e => { setNarrative(e.target.value); setErrors(prev => ({ ...prev, narrative: false })); }}
            placeholder={language === "ar" ? "وصف المعاملة" : "e.g. Purchase of medical supplies"}
            className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5] ${errors.narrative ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              {language === "ar" ? "التصنيف" : "Category"}
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as JournalCategory)}
              className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="Revenue">Revenue</option>
              <option value="Expenditure">Expenditure</option>
              <option value="InsuranceClaim">InsuranceClaim</option>
              <option value="Payroll">Payroll</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              {language === "ar" ? "مركز التكلفة" : "Cost Center"}
            </label>
            <select
              value={costCenter}
              onChange={e => setCostCenter(e.target.value as CostCenter | "")}
              className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">{language === "ar" ? "-- اختر --" : "-- Select --"}</option>
              <option value="HOSPITAL">🏥 Hospital</option>
              <option value="PHARMACY">💊 Pharmacy</option>
              <option value="WAREHOUSE">📦 Warehouse</option>
              <option value="OPTICS">👓 Optics</option>
              <option value="EMPLOYEES">👥 Employees</option>
            </select>
          </div>
        </div>

        <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4">
          <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3">
            {language === "ar" ? "قيود القيد المزدوج" : "Double-Entry Accounts"}
          </p>

          {errors.unbalanced && (
            <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-lg text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {language === "ar" ? "يجب أن يختلف حساب المدين عن الدائن" : "Debit and Credit accounts must be different."}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {language === "ar" ? "حساب مدين" : "Debit Account"}
              </label>
              <select
                value={debitAccount}
                onChange={e => { setDebitAccount(e.target.value); setErrors(prev => ({ ...prev, debitAccount: false, unbalanced: false })); }}
                className={`w-full p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${errors.debitAccount ? "border-red-500" : "border-emerald-200 dark:border-emerald-900/50"}`}
              >
                <option value="">{language === "ar" ? "-- اختر --" : "-- Select --"}</option>
                {[...assetAccounts, ...expenseAccounts].map(acc => (
                  <option key={acc.code} value={acc.code}>{acc.code} — {language === "ar" && acc.nameAr ? acc.nameAr : acc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                {language === "ar" ? "حساب دائن" : "Credit Account"}
              </label>
              <select
                value={creditAccount}
                onChange={e => { setCreditAccount(e.target.value); setErrors(prev => ({ ...prev, creditAccount: false, unbalanced: false })); }}
                className={`w-full p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 ${errors.creditAccount ? "border-red-500" : "border-rose-200 dark:border-rose-900/50"}`}
              >
                <option value="">{language === "ar" ? "-- اختر --" : "-- Select --"}</option>
                {[...liabilityAccounts, ...equityAccounts, ...revenueAccounts].map(acc => (
                  <option key={acc.code} value={acc.code}>{acc.code} — {language === "ar" && acc.nameAr ? acc.nameAr : acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                {language === "ar" ? "المبلغ" : "Amount ($)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount || ""}
                onChange={e => { setAmount(parseFloat(e.target.value) || 0); setErrors(prev => ({ ...prev, amount: false })); }}
                className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-none focus:ring-1 focus:ring-[#4F46E5] ${errors.amount ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                {language === "ar" ? "المحفظة" : "Wallet"}
              </label>
              <select
                value={wallet}
                onChange={e => setWallet(e.target.value as WalletType)}
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="Main Safe">Main Safe</option>
                <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                <option value="Insurance Receivables">Insurance Receivables</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>
          </div>
        </div>

        {success && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {language === "ar" ? "تم تسجيل القيد بنجاح!" : "Journal entry posted successfully!"}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black rounded-xl shadow-sm transition active:scale-[0.98] uppercase tracking-wider"
        >
          {language === "ar" ? "تسجيل القيد" : "Post Journal Entry"}
        </button>
      </div>
    </div>
  );
}
