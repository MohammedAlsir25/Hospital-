/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Flame,
  Activity,
  Plus,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { TransactionJournal } from "../mockErpData";

interface HiddenOpexAccountantProps {
  language: "en" | "ar";
  onLogExpense: (newLedgerEntry: TransactionJournal) => void;
}

export default function HiddenOpexAccountant({
  language,
  onLogExpense
}: HiddenOpexAccountantProps) {
  const [toast, setToast] = useState<string | null>(null);

  const opexCategories = [
    {
      category: "Hazardous Utilities",
      opex: "Biohazard & Medical Waste Disposal",
      cost: 2400.0,
      description: "Specialized regulated collection services for clinical tissue, sharps, and hazardous surgical waste.",
      icon: Flame,
      color: "text-red-500 bg-red-500/10 border-red-500/30"
    },
    {
      category: "Asset Lifecycle",
      opex: "Biomedical Calibration & AMCs",
      cost: 4500.0,
      description: "Annual Maintenance Contracts (AMCs) and strict laser/slit-lamp optic calibrator clearance tests.",
      icon: Activity,
      color: "text-[#FF841A] bg-[#FF841A]/10 border-[#FF841A]/30"
    },
    {
      category: "Sanitation Systems",
      opex: "Linen, Autoclave & Sterilization Logistics",
      cost: 3200.0,
      description: "Continuous compliance autoclaving, sterilization consumables, and clinical linen logistics.",
      icon: Layers,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      category: "Facility Protection",
      opex: "Medical Malpractice & Liability",
      cost: 7800.0,
      description: "Institutional healthcare liability insurance premiums and group legal security clearances.",
      icon: ShieldAlert,
      color: "text-[#4F46E5] bg-[#4F46E5]/10 border-[#4F46E5]/30"
    },
    {
      category: "Digital Operations",
      opex: "IT Cloud Backups & Compliance audits",
      cost: 1900.0,
      description: "HIPAA-compliant encrypted server hosting, database audit trails, and certification processing fees.",
      icon: ShieldCheck,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30"
    }
  ];

  const handleInjectExpense = (item: typeof opexCategories[0]) => {
    const now = new Date();
    const cleanTime = now.toTimeString().split(" ")[0];

    const transaction: TransactionJournal = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: cleanTime,
      narrative: `Logged Hidden OpEx [${item.category}]: ${item.opex}`,
      category: "Expenditure",
      debit: 0,
      credit: item.cost, // ledger credit expenditure flow
      wallet: "Petty Cash",
      verifiedBy: "CFO Ebenezer"
    };

    onLogExpense(transaction);
    setToast(`Logged ${item.opex} - $${item.cost.toLocaleString()}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border-light)] p-5 space-y-4 shadow-sm relative overflow-hidden">
      
      {toast && (
        <div className="absolute top-3 right-3 bg-indigo-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-[#2BBFFF]/40 flex items-center gap-1.5 animate-bounce z-50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <span className="text-[9px] font-mono font-black text-[#FF841A] block uppercase tracking-widest mb-0.5">
          {language === "ar" ? "تسجيل مصاريف التشغيل المخفية" : "UNCOVER REGULATED HEALTHCARE OPEX"}
        </span>
        <h4 className="font-extrabold text-[#0F1E46] dark:text-white text-sm flex items-center gap-1.5 uppercase">
          <Coins className="w-4 h-4 text-[#4F46E5]" /> 
          Hidden Operational Outlay Injector
        </h4>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          Audits mandatory clinical compliance outlays directly into active financial double-entries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {opexCategories.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-[var(--clr-border-light)] flex flex-col justify-between hover:shadow-md transition gap-3 text-left"
            >
              <div>
                <div className={`p-2 rounded-xl w-fit border ${item.color} mb-2.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[8px] font-mono font-bold text-neutral-400 block uppercase mb-1">
                  {item.category}
                </span>
                <h5 className="font-bold text-xs text-neutral-800 dark:text-white leading-normal">
                  {item.opex}
                </h5>
                <p className="text-[9px] text-neutral-400 leading-normal mt-1">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-dashed pt-2 flex items-center justify-between w-full mt-1.5">
                <span className="text-sm font-black font-mono text-[#0F1E46] dark:text-[#2BBFFF]">
                  ${item.cost.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleInjectExpense(item)}
                  className="p-1 px-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[9px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 group active:scale-95 duration-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#2BBFFF] group-hover:scale-125 transition" /> Inject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
