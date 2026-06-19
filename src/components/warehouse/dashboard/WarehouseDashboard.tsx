import { useWarehouse } from "../../../context/WarehouseContext";
import { useAccounting } from "../../../context/AccountingContext";
import { Package, AlertTriangle, ArrowRightLeft, Truck, Receipt, BookOpen } from "lucide-react";

interface Props {
  language: "en" | "ar";
}

export default function WarehouseDashboard({ language }: Props) {
  const isAr = language === "ar";
  const { state } = useWarehouse();
  const accounting = useAccounting();

  const totalSKUs = state.products.length;
  const lowStockCount = state.products.filter(p => p.onHandQty <= p.criticalMin || p.status === "Deficient" || p.status === "ExpiringSoon").length;
  const totalUnits = state.products.reduce((sum, p) => sum + p.onHandQty, 0);
  const pendingTransfers = state.transfers.filter(t => t.status === "In Transit").length;
  const activeShipments = state.shipments.filter(s => !s.isOptimized).length;
  const totalValue = state.products.reduce((sum, p) => sum + p.onHandQty * p.unitCost, 0);

  const pendingBillCount = accounting.state.vendorBills.filter(vb => vb.warehouseReceived < vb.purchaseQty).length;
  const pendingBillValue = accounting.state.vendorBills
    .filter(vb => vb.warehouseReceived < vb.purchaseQty)
    .reduce((sum, vb) => sum + vb.invoiceSum, 0);
  const warehouseEntries = accounting.state.journal.filter(e => e.costCenter === "WAREHOUSE").length;
  const totalReceivedValue = state.products.reduce((sum, p) => sum + p.onHandQty * p.unitCost, 0);
  const totalWrittenOff = accounting.state.journal
    .filter(e => e.debitAccountCode === "ACC-5110-EXP-SUPPLIES" && e.costCenter === "WAREHOUSE")
    .reduce((sum, e) => sum + e.debit, 0);
  const consumptionRate = totalReceivedValue > 0 ? ((totalWrittenOff / totalReceivedValue) * 100).toFixed(1) : "0.0";

  const cards = [
    { icon: Package, label: isAr ? "إجمالي الأصناف" : "Total SKUs", value: totalSKUs, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
    { icon: AlertTriangle, label: isAr ? "تنبيهات النفاد" : "Low Stock Alerts", value: lowStockCount, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    { icon: ArrowRightLeft, label: isAr ? "تحويلات قيد النقل" : "In Transit", value: pendingTransfers, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
    { icon: Truck, label: isAr ? "شحنات نشطة" : "Active Shipments", value: activeShipments, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
    { icon: Receipt, label: isAr ? "فواتير معلقة" : "Pending Bills", value: pendingBillCount, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    { icon: BookOpen, label: isAr ? "قيد محاسبي" : "Journal Entries", value: warehouseEntries, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{card.value}</span>
              </div>
              <p className="mt-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            {isAr ? "قيمة المخزون الإجمالية" : "Total Inventory Value"}
          </h3>
          <span className="text-3xl font-black text-[#0F172A] dark:text-white font-mono">
            ${totalValue.toLocaleString()}
          </span>
          <p className="text-[10px] text-neutral-400 mt-1">
            {isAr ? `${totalUnits} وحدة عبر ${totalSKUs} صنف` : `${totalUnits} units across ${totalSKUs} SKUs`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            {isAr ? "الفواتير المعلقة" : "Pending Bills Value"}
          </h3>
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ${pendingBillValue.toLocaleString()}
          </span>
          <p className="text-[10px] text-neutral-400 mt-1">
            {isAr ? `${pendingBillCount} فاتورة غير مستلمة` : `${pendingBillCount} bills awaiting receipt`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            {isAr ? "معدل الاستهلاك" : "Consumption Rate"}
          </h3>
          <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {consumptionRate}%
          </span>
          <p className="text-[10px] text-neutral-400 mt-1">
            {isAr ? `من أصل $${totalReceivedValue.toLocaleString()} مقيد` : `of $${totalReceivedValue.toLocaleString()} written off`}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
          {isAr ? "أصناف منخفضة / منتهية" : "Low & Expiring Items"}
        </h3>
        <div className="space-y-2">
          {state.products.filter(p => p.status !== "Optimized").slice(0, 6).map(p => (
            <div key={p.sku} className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0">
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-neutral-800 dark:text-neutral-200 truncate block">{p.productName}</span>
                <span className="text-[9px] font-mono text-neutral-400">{p.sku}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-400">{p.onHandQty} {p.unit}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  p.status === "Deficient" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                  p.status === "ExpiringSoon" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                  "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
          {state.products.filter(p => p.status !== "Optimized").length === 0 && (
            <p className="text-[11px] text-neutral-400">{isAr ? "جميع الأصناف بحالة جيدة" : "All items in good standing"}</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
          {isAr ? "آخر القيود المحاسبية" : "Recent Warehouse Accounting Entries"}
        </h3>
        {warehouseEntries > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-neutral-600 dark:text-neutral-300 border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6DF] dark:border-neutral-800 text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="p-1.5">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="p-1.5">{isAr ? "الوصف" : "Description"}</th>
                  <th className="p-1.5">{isAr ? "مدين" : "Debit"}</th>
                  <th className="p-1.5">{isAr ? "دائن" : "Credit"}</th>
                  <th className="p-1.5">{isAr ? "الحساب" : "Account"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]/40 dark:divide-neutral-800/40">
                {accounting.state.journal.filter(e => e.costCenter === "WAREHOUSE").slice(-5).reverse().map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/40">
                    <td className="p-2 font-mono text-[10px] text-neutral-400">{entry.date}</td>
                    <td className="p-2 font-semibold text-neutral-700 dark:text-neutral-300">{entry.description}</td>
                    <td className="p-2 font-mono font-bold text-rose-600">${entry.debit.toLocaleString()}</td>
                    <td className="p-2 font-mono font-bold text-emerald-600">${entry.credit.toLocaleString()}</td>
                    <td className="p-2 font-mono text-[10px] text-neutral-400">{entry.debitAccountCode}/{entry.creditAccountCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400">
            {isAr ? "لا توجد قيود محاسبية متعلقة بالمستودع بعد" : "No warehouse-related accounting entries yet"}
          </p>
        )}
      </div>
    </div>
  );
}
