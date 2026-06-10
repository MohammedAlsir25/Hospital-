import React, { useState } from "react";
import { AlertTriangle, Plus, CheckCircle, Coins } from "lucide-react";
import { TransactionJournal } from "../mockErpData";

interface Account {
  code: string;
  name: string;
  nameAr?: string;
  category: "Assets" | "Liabilities" | "Equity" | "Revenue" | "Expenses";
  balance: number;
  description: string;
}

interface HospitalManualJournalFormProps {
  chartOfAccounts: Account[];
  onPostJournal: (
    narrative: string,
    category: string,
    debitCode: string,
    debitAmt: number,
    creditCode: string,
    creditAmt: number,
    docRef: string
  ) => { success: boolean; error?: string };
}

export function HospitalManualJournalForm({
  chartOfAccounts,
  onPostJournal,
}: HospitalManualJournalFormProps) {
  const [narrative, setNarrative] = useState("");
  const [docRef, setDocRef] = useState("");
  const [category, setCategory] = useState("Revenue");
  const [debitCode, setDebitCode] = useState("ACC-1110-CASH");
  const [debitAmt, setDebitAmt] = useState<number | "">("");
  const [creditCode, setCreditCode] = useState("ACC-4100-REV-CONSULT");
  const [creditAmt, setCreditAmt] = useState<number | "">("");

  // Error/Success state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(false);

    if (!narrative.trim()) {
      setErrorMessage("Narrative description is required for GAAP compliance.");
      return;
    }
    if (!docRef.trim()) {
      setErrorMessage("Reference Document ID / PO / Invoice Code is required for the audit trail.");
      return;
    }
    if (debitAmt === "" || debitAmt <= 0) {
      setErrorMessage("Debit amount must be a positive number.");
      return;
    }
    if (creditAmt === "" || creditAmt <= 0) {
      setErrorMessage("Credit amount must be a positive number.");
      return;
    }

    // Call posting callback
    const result = onPostJournal(
      narrative,
      category,
      debitCode,
      Number(debitAmt),
      creditCode,
      Number(creditAmt),
      docRef
    );

    if (!result.success) {
      setErrorMessage(result.error || "Failed to commit journal entry.");
    } else {
      setSuccessMessage(true);
      // Reset form fields
      setNarrative("");
      setDocRef("");
      setDebitAmt("");
      setCreditAmt("");
      setTimeout(() => setSuccessMessage(false), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col justify-between">
      <div className="space-y-3.5">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
            ⚖️ POST MULTI-TIER LEDGER TRANSACTION
          </span>
          <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
            Every transaction requires a balanced debit and credit allocation. Unbalanced journal entries will trigger an automated validation failure roll-back.
          </p>
        </div>

        {/* Diagnostic Narrative Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
            Audit-Trail Journal Narrative:
          </label>
          <input
            type="text"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="e.g., Accrued premium trifocal lens import duties"
            className="w-full p-2 bg-[#FBFBF9] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-100 font-sans focus:outline-none focus:border-indigo-500 text-xs text-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Reference Document */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
              Reference Code:
            </label>
            <input
              type="text"
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              placeholder="e.g., PO-OPT-901 / INV-228"
              className="w-full p-2 bg-[#FBFBF9] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-100 font-mono focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Ledger Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
              Ledger Pipeline:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-[#FBFBF9] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-100 font-sans focus:outline-none focus:border-indigo-500 text-xs font-semibold"
            >
              <option value="Revenue">Revenue (Inflows)</option>
              <option value="Expenditure">Expenditure (Outflows)</option>
              <option value="InsuranceClaim">Insurance Allocation</option>
            </select>
          </div>
        </div>

        {/* DOUBLE ENTRY INPUT CORES */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-dashed border-[#EAE6DF] dark:border-neutral-800">
          
          {/* DEBIT SIDE (Active increase) */}
          <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider font-mono">
              [DEBIT ENTRY] +
            </span>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 font-mono block">DEBIT TARGET ACCOUNT:</label>
              <select
                value={debitCode}
                onChange={(e) => setDebitCode(e.target.value)}
                className="w-full p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200 text-[11px] font-mono"
              >
                {chartOfAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 font-mono block">DEBIT VALUE ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={debitAmt}
                onChange={(e) => setDebitAmt(e.target.value !== "" ? parseFloat(e.target.value) : "")}
                placeholder="0.00"
                className="w-full p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200 font-mono text-xs"
              />
            </div>
          </div>

          {/* CREDIT SIDE (Active decrease / Liability increase) */}
          <div className="p-3 bg-rose-500/[0.04] border border-rose-500/10 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-rose-500 block uppercase tracking-wider font-mono">
              [CREDIT ENTRY] -
            </span>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 font-mono block">CREDIT TARGET ACCOUNT:</label>
              <select
                value={creditCode}
                onChange={(e) => setCreditCode(e.target.value)}
                className="w-full p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200 text-[11px] font-mono"
              >
                {chartOfAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 font-mono block">CREDIT VALUE ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={creditAmt}
                onChange={(e) => setCreditAmt(e.target.value !== "" ? parseFloat(e.target.value) : "")}
                placeholder="0.00"
                className="w-full p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200 font-mono text-xs"
              />
            </div>
          </div>

        </div>

        {/* FEEDBACK WARNING BANNERS */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-xl flex items-start gap-2 animate-[shake_0.4s_ease-in-out]">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <div className="space-y-0.5">
              <span className="font-bold font-mono text-[9.5px] uppercase tracking-wider block">GAAP VALIDATION FAILURE ALERT</span>
              <p className="text-[10px] leading-relaxed font-sans">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold text-[9.5px] uppercase tracking-wider block font-mono">TRANSACTION COMMITTED</span>
              <p className="text-[10px] font-sans">Double-entry ledger balancing check verified as identical. Chart of Accounts recompiled.</p>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition duration-150 active:scale-[0.98] cursor-pointer"
      >
        Post Double-Entry Journal Log
      </button>
    </form>
  );
}
