import React from "react";
import { useWarehouse } from "../../../context/WarehouseContext";
import { useAccounting } from "../../../context/AccountingContext";

interface Props {
  language: "en" | "ar";
}

export default function InventoryLedger({ language }: Props) {
  const isAr = language === "ar";
  const { state, setFilter, selectProduct, bulkReceive, bulkWriteOff, receiveStock } = useWarehouse();
  const accounting = useAccounting();

  const filtered = state.products.filter(p => {
    if (state.activeFilter === "All") return true;
    if (state.activeFilter === "Alerts") return p.status !== "Optimized";
    if (state.activeFilter === "Optimized") return p.status === "Optimized";
    return true;
  });

  const [checkedSkus, setCheckedSkus] = React.useState<string[]>([]);

  const toggleCheck = (sku: string) => {
    setCheckedSkus(prev => prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]);
  };

  const toggleAll = () => {
    if (checkedSkus.length === filtered.length) {
      setCheckedSkus([]);
    } else {
      setCheckedSkus(filtered.map(p => p.sku));
    }
  };

  const FILTERS = [
    { id: "All", labelEn: "All Inventory", labelAr: "جميع الأصناف" },
    { id: "Alerts", labelEn: "Critical Deficiencies", labelAr: "تنبيهات الأصناف" },
    { id: "Optimized", labelEn: "Sufficient Supply", labelAr: "المخزون السليم" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setCheckedSkus([]); }}
              className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all duration-200 ${
                state.activeFilter === f.id
                  ? "bg-white dark:bg-neutral-900 text-indigo-700 dark:text-[#2BBFFF] shadow-md border border-neutral-200/50 dark:border-neutral-800"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {isAr ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>
        {checkedSkus.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-mono">{checkedSkus.length} selected</span>
            <button
              onClick={() => {
                const totalCost = checkedSkus.reduce((sum, sku) => {
                  const p = state.products.find(pr => pr.sku === sku);
                  return sum + (p ? p.unitCost * 200 : 0);
                }, 0);
                accounting.postJournalEntry({
                  narrative: `Bulk restock of ${checkedSkus.length} SKUs (+200 units each)`,
                  category: "Expenditure",
                  debit: totalCost,
                  credit: totalCost,
                  wallet: "Standard Chartered Bank",
                  verifiedBy: "WAREHOUSE_AUTO",
                  debitAccountCode: "ACC-1210-PHARM-INV",
                  creditAccountCode: "ACC-2110-AP",
                  costCenter: "WAREHOUSE",
                });
                accounting.dispatch({ type: "SET_AUTOMATION_LOGS", payload: [{
                  id: `AUTO-${Date.now()}`,
                  originModule: "WAREHOUSE",
                  trigger: "Bulk Restock",
                  narrative: `Restocked ${checkedSkus.length} SKUs. Total value: $${totalCost.toFixed(2)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  ledgerEntryCreated: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
                }, ...accounting.state.automationLogs] });
                bulkReceive(checkedSkus); setCheckedSkus([]);
              }}
              className="px-2.5 py-1 text-[9px] font-black uppercase bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition active:scale-[0.98]"
            >
              {isAr ? "إعادة توريد" : "Restock"}
            </button>
            <button
              onClick={() => {
                const totalCost = checkedSkus.reduce((sum, sku) => {
                  const p = state.products.find(pr => pr.sku === sku);
                  return sum + (p ? p.unitCost * p.onHandQty : 0);
                }, 0);
                accounting.postJournalEntry({
                  narrative: `Write off ${checkedSkus.length} SKUs from inventory`,
                  category: "Expenditure",
                  debit: totalCost,
                  credit: totalCost,
                  wallet: "Standard Chartered Bank",
                  verifiedBy: "WAREHOUSE_AUTO",
                  debitAccountCode: "ACC-5110-EXP-SUPPLIES",
                  creditAccountCode: "ACC-1210-PHARM-INV",
                  costCenter: "WAREHOUSE",
                });
                accounting.dispatch({ type: "SET_AUTOMATION_LOGS", payload: [{
                  id: `AUTO-${Date.now()}`,
                  originModule: "WAREHOUSE",
                  trigger: "Bulk Write Off",
                  narrative: `Wrote off ${checkedSkus.length} SKUs. Total value: $${totalCost.toFixed(2)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  ledgerEntryCreated: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
                }, ...accounting.state.automationLogs] });
                bulkWriteOff(checkedSkus); setCheckedSkus([]);
              }}
              className="px-2.5 py-1 text-[9px] font-black uppercase bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition active:scale-[0.98]"
            >
              {isAr ? "شطب" : "Write Off"}
            </button>
            <button
              onClick={() => {
                const totalCost = checkedSkus.reduce((sum, sku) => {
                  const p = state.products.find(pr => pr.sku === sku);
                  return sum + (p ? p.unitCost * Math.min(p.onHandQty, 50) : 0);
                }, 0);
                accounting.postJournalEntry({
                  narrative: `Push ${checkedSkus.length} SKUs to Pharmacy dispensation`,
                  category: "Expenditure",
                  debit: totalCost,
                  credit: totalCost,
                  wallet: "Standard Chartered Bank",
                  verifiedBy: "WAREHOUSE_AUTO",
                  debitAccountCode: "ACC-5110-EXP-SUPPLIES",
                  creditAccountCode: "ACC-1210-PHARM-INV",
                  costCenter: "WAREHOUSE",
                });
                checkedSkus.forEach(sku => {
                  const p = state.products.find(pr => pr.sku === sku);
                  if (p) receiveStock(sku, -Math.min(p.onHandQty, 50));
                });
                accounting.dispatch({ type: "SET_AUTOMATION_LOGS", payload: [{
                  id: `AUTO-${Date.now()}`,
                  originModule: "WAREHOUSE",
                  trigger: "Push to Pharmacy",
                  narrative: `Pushed ${checkedSkus.length} SKUs to Pharmacy. Total value: $${totalCost.toFixed(2)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  ledgerEntryCreated: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
                }, ...accounting.state.automationLogs] });
                setCheckedSkus([]);
              }}
              className="px-2.5 py-1 text-[9px] font-black uppercase bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition active:scale-[0.98]"
            >
              {isAr ? "دفع للصيدلية" : "Push to Pharmacy"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 text-[10px] uppercase font-mono text-neutral-400 tracking-wider">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={checkedSkus.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-[#4F46E5] rounded cursor-pointer"
                  />
                </th>
                <th className="p-3">SKU</th>
                <th className="p-3">{isAr ? "المنتج" : "Product"}</th>
                <th className="p-3">{isAr ? "المورد" : "Supplier"}</th>
                <th className="p-3">{isAr ? "الدفعة" : "Batch"}</th>
                <th className="p-3">{isAr ? "تاريخ الصلاحية" : "Expiry"}</th>
                <th className="p-3 text-right">{isAr ? "الكمية" : "Qty"}</th>
                <th className="p-3 text-right">{isAr ? "التكلفة" : "Unit Cost"}</th>
                <th className="p-3 text-center">{isAr ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {filtered.map(p => (
                <tr
                  key={p.sku}
                  onClick={() => selectProduct(checkedSkus.length === 0 ? p : null)}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 cursor-pointer transition"
                >
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checkedSkus.includes(p.sku)}
                      onChange={() => toggleCheck(p.sku)}
                      className="w-3.5 h-3.5 accent-[#4F46E5] rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-mono text-[10px] text-neutral-500">{p.sku}</td>
                  <td className="p-3 font-bold text-neutral-800 dark:text-neutral-200 text-sm">{p.productName}</td>
                  <td className="p-3 text-[11px] text-neutral-500">{p.supplier}</td>
                  <td className="p-3 font-mono text-[10px] text-neutral-400">{p.batchNum}</td>
                  <td className={`p-3 font-mono text-[10px] ${p.status === "ExpiringSoon" ? "text-[#FF841A] font-extrabold" : "text-neutral-500"}`}>
                    {p.expiryDate}
                  </td>
                  <td className={`p-3 text-right font-black font-mono text-sm ${p.status === "Deficient" ? "text-rose-600" : "text-neutral-800 dark:text-neutral-200"}`}>
                    {p.onHandQty}
                  </td>
                  <td className="p-3 text-right font-mono text-[11px] text-neutral-500">${p.unitCost.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      p.status === "Optimized" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" :
                      p.status === "Warning" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40" :
                      p.status === "ExpiringSoon" ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40" :
                      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[11px] text-neutral-400">
            {isAr ? "لا توجد منتجات" : "No products found"}
          </div>
        )}
      </div>

      {state.selectedProduct && (
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              {state.selectedProduct.productName}
            </h3>
            <button onClick={() => selectProduct(null)} className="text-neutral-400 hover:text-neutral-600 text-[10px] font-bold">✕</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            <div><span className="text-neutral-400">{isAr ? "المورد" : "Supplier"}</span><p className="font-bold text-neutral-800 dark:text-neutral-200">{state.selectedProduct.supplier}</p></div>
            <div><span className="text-neutral-400">{isAr ? "الدفعة" : "Batch"}</span><p className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{state.selectedProduct.batchNum}</p></div>
            <div><span className="text-neutral-400">{isAr ? "تاريخ الصلاحية" : "Expiry"}</span><p className="font-mono font-bold text-[#FF841A]">{state.selectedProduct.expiryDate}</p></div>
            <div><span className="text-neutral-400">{isAr ? "الحد الأدنى" : "Min. Threshold"}</span><p className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{state.selectedProduct.criticalMin} {state.selectedProduct.unit}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

