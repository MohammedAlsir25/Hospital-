import { useState } from "react";
import { useWarehouse } from "../../../context/WarehouseContext";
import { useAccounting } from "../../../context/AccountingContext";

interface Props {
  language: "en" | "ar";
  onToast: (msg: string) => void;
}

export default function TransferForm({ language, onToast }: Props) {
  const isAr = language === "ar";
  const { state, addTransfer } = useWarehouse();
  const accounting = useAccounting();
  const [transferredItem, setTransferredItem] = useState("Sterile Ophthalmic Examination Packs");
  const [transferQty, setTransferQty] = useState(50);
  const [sourceBlock, setSourceBlock] = useState("BLOCK_A_SHELF_2");
  const [destinationStation, setDestinationStation] = useState("CLINIC_EAST");
  const [priority, setPriority] = useState("Routine");

  const filteredLogs = state.transfers.filter(log => {
    if (state.activeFilter === "All") return true;
    if (state.activeFilter === "Alerts") {
      return log.priority.toLowerCase().includes("urgent") || log.status.toLowerCase().includes("transit");
    }
    if (state.activeFilter === "Optimized") {
      return log.status.toLowerCase().includes("delivered") && !log.priority.toLowerCase().includes("urgent");
    }
    return true;
  });

  const ITEMS = [
    "Sterile Ophthalmic Examination Packs",
    "Glaucoma Custom Visual Field Papers",
    "Corneal Topographer Calibration Plates",
    "Standard Syringes & Micro-Cannulas",
  ];

  const SOURCES = [
    { value: "BLOCK_A_SHELF_2", label: "Block A - Shelf 2" },
    { value: "BLOCK_B_COLD_FIDGE", label: "Block B - Bio Fridge" },
    { value: "BLOCK_C_MONITOR", label: "Block C - Glass Vault" },
  ];

  const handleExecuteTransfer = () => {
    if (destinationStation === state.activeDestination) {
      alert(isAr ? "لا يمكن أن تكون وجهة المصدر والوجهة نفسها" : "Source and destination lockups cannot be identical.");
      return;
    }
    const shippingFee = 85;
    accounting.postJournalEntry({
      narrative: `Depot transfer: ${transferQty}x ${transferredItem} from ${sourceBlock} to ${destinationStation}`,
      category: "Expenditure",
      debit: shippingFee,
      credit: shippingFee,
      wallet: "Standard Chartered Bank",
      verifiedBy: "WAREHOUSE_AUTO",
      debitAccountCode: "ACC-5110-EXP-SUPPLIES",
      creditAccountCode: "ACC-1120-BANK",
      costCenter: "WAREHOUSE",
    });
    accounting.dispatch({ type: "SET_AUTOMATION_LOGS", payload: [{
      id: `AUTO-${Date.now()}`,
      originModule: "WAREHOUSE",
      trigger: "Depot Transfer",
      narrative: `Transfer ${transferQty}x ${transferredItem} to ${destinationStation}. Shipping fee: $${shippingFee}`,
      timestamp: new Date().toLocaleTimeString(),
      ledgerEntryCreated: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
    }, ...accounting.state.automationLogs] });
    onToast(`Executed transfer of ${transferQty}x ${transferredItem} → ${destinationStation}`);
    const newTx = {
      id: `TXF-${Math.floor(20000 + Math.random() * 9000)}`,
      item: transferredItem,
      qty: transferQty,
      source: sourceBlock,
      dest: destinationStation,
      priority,
      status: "In Transit",
    };
    addTransfer(newTx);
  };

  return (
    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-[#2BBFFF] rounded-xl">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div>
          <h3 className="font-extrabold text-[#0F172A] dark:text-white tracking-tight text-sm">
            {isAr ? "نظام التحويل الداخلي للمستودع" : "Hospital Internal Depot Transfer System"}
          </h3>
          <p className="text-[11px] text-neutral-400">
            {isAr ? "تتبع المواد الاستهلاكية البيولوجية والأجهزة التشخيصية" : "Secure tracking of consumables and diagnostic aids routed across hospital wings."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-[#EAE6DF]/60 dark:border-neutral-800/60 shadow-inner">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              {isAr ? "اختر صنف النقل" : "Select Depot Item for Transfer"}
            </label>
            <select
              value={transferredItem}
              onChange={e => setTransferredItem(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-800 dark:text-neutral-200"
            >
              {ITEMS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                {isAr ? "مصدر النقل" : "Source Depot Rack"}
              </label>
              <select
                value={sourceBlock}
                onChange={e => setSourceBlock(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2 text-xs text-neutral-800 dark:text-neutral-200"
              >
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                {isAr ? "الوجهة" : "Destination Wing"}
              </label>
              <select
                value={destinationStation}
                onChange={e => setDestinationStation(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2 text-xs text-neutral-800 dark:text-neutral-200"
              >
                {state.destinations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              <span>{isAr ? "كمية النقل" : "Transfer Qty"}</span>
              <span className="text-[#4F46E5] dark:text-[#2BBFFF] font-mono">{transferQty} pcs</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={transferQty}
              onChange={e => setTransferQty(parseInt(e.target.value))}
              className="w-full accent-indigo-600 dark:accent-[#2BBFFF]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              {isAr ? "مستوى الأولوية" : "Priority Level"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Routine", "Urgent / Cold Chain"].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-xl text-[11px] font-extrabold text-center border transition ${
                    priority === p
                      ? "bg-indigo-500 text-white border-indigo-600"
                      : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-[#EAE6DF] dark:border-neutral-800 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-[#EAE6DF] dark:border-neutral-800 pt-4">
        <span className="text-[11px] text-neutral-500 max-w-sm">
          ⚠️ {isAr ? "يتم تسجيل التحويل مباشرة في جداول المستودع" : "Dispatches log directly to inventory sheets; balance auto-debited."}
        </span>
        <button
          onClick={handleExecuteTransfer}
          type="button"
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3B32C1] text-white text-xs font-black rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer"
        >
          🚀 {isAr ? "تنفيذ التحويل" : "Authorise Depot Transfer"}
        </button>
      </div>

      <div className="pt-4 border-t border-[#EAE6DF]/60 dark:border-neutral-800/60">
        <h4 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase mb-2">
          {isAr ? "سجل التحويلات" : "Transfer History"}
        </h4>
        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-900 text-[10px] uppercase font-mono text-neutral-400">
                <th className="p-2">{isAr ? "المرجع" : "Ref"}</th>
                <th className="p-2">{isAr ? "الصنف" : "Item"}</th>
                <th className="p-2">{isAr ? "الكمية" : "Qty"}</th>
                <th className="p-2">{isAr ? "المصدر" : "Source"}</th>
                <th className="p-2">{isAr ? "الوجهة" : "Target"}</th>
                <th className="p-2">{isAr ? "الأولوية" : "Priority"}</th>
                <th className="p-2">{isAr ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
              {filteredLogs.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50/45 dark:hover:bg-neutral-800/40">
                  <td className="p-2 font-mono font-bold text-neutral-800 dark:text-white">{tx.id}</td>
                  <td className="p-2 font-semibold text-neutral-700 dark:text-neutral-300">{tx.item}</td>
                  <td className="p-2 text-center font-mono font-bold">{tx.qty}</td>
                  <td className="p-2 text-neutral-500 text-[10px] font-mono">{tx.source}</td>
                  <td className="p-2 text-indigo-600 dark:text-[#2BBFFF] text-[10px] font-bold font-mono">{tx.dest}</td>
                  <td className="p-2 text-neutral-600 dark:text-neutral-400 font-mono text-[10px]">{tx.priority}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status.includes("Delivered") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
