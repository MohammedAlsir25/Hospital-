import { useWarehouse } from "../../../context/WarehouseContext";
import { useAccounting } from "../../../context/AccountingContext";

interface Props {
  language: "en" | "ar";
}

export default function FreightLedger({ language }: Props) {
  const isAr = language === "ar";
  const { state } = useWarehouse();
  const accounting = useAccounting();

  const filtered = state.shipments.filter(shp => {
    if (state.activeFilter === "All") return true;
    if (state.activeFilter === "Alerts") return !shp.isOptimized;
    if (state.activeFilter === "Optimized") return shp.isOptimized;
    return true;
  });

  const pendingBills = accounting.state.vendorBills.filter(vb => vb.warehouseReceived < vb.purchaseQty);

  const handleConfirmReceipt = (billId: string) => {
    const updated = accounting.state.vendorBills.map(vb =>
      vb.id === billId ? { ...vb, warehouseReceived: vb.warehouseReceived + 1 } : vb
    );
    accounting.dispatch({ type: "SET_VENDOR_BILLS", payload: updated });
  };

  return (
    <div className="space-y-6">
      {/* Pending Receipts Section */}
      {pendingBills.length > 0 && (
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-[#EAE6DF] dark:border-neutral-850">
            <div>
              <h4 className="text-xs font-black text-neutral-800 dark:text-white uppercase">
                {isAr ? "شحنات معلقة" : "Pending Receipts"}
              </h4>
              <p className="text-[10px] text-neutral-400">
                {isAr ? "فواتير الموردين التي لم يتم استلامها بالكامل" : "Vendor bills awaiting full warehouse receipt confirmation"}
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 border border-amber-150 rounded-lg font-mono">
              {pendingBills.length} {isAr ? "معلقة" : "Pending"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300 border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6DF] dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="p-2">{isAr ? "المرجع" : "PO Ref"}</th>
                  <th className="p-2">{isAr ? "المورد" : "Supplier"}</th>
                  <th className="p-2">{isAr ? "الكمية" : "Qty"}</th>
                  <th className="p-2">{isAr ? "المستلم" : "Received"}</th>
                  <th className="p-2">{isAr ? "القيمة" : "Value"}</th>
                  <th className="p-2 text-center">{isAr ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]/40 dark:divide-neutral-800/40">
                {pendingBills.map(vb => (
                  <tr key={vb.id} className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/40">
                    <td className="p-2.5 font-mono font-bold text-neutral-800 dark:text-white">{vb.poReference}</td>
                    <td className="p-2.5 font-semibold text-neutral-700 dark:text-neutral-400">{vb.supplier}</td>
                    <td className="p-2.5 font-mono font-bold">{vb.purchaseQty}</td>
                    <td className="p-2.5 font-mono">{vb.warehouseReceived}</td>
                    <td className="p-2.5 font-bold text-emerald-600 font-mono">${vb.invoiceSum.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleConfirmReceipt(vb.id)}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition active:scale-[0.98] cursor-pointer ${
                          vb.warehouseReceived >= vb.purchaseQty
                            ? "bg-emerald-100 text-emerald-500 cursor-not-allowed"
                            : "bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                        }`}
                        disabled={vb.warehouseReceived >= vb.purchaseQty}
                      >
                        {vb.warehouseReceived >= vb.purchaseQty
                          ? (isAr ? "مكتمل" : "Complete")
                          : (isAr ? "تأكيد الاستلام" : "Confirm Receipt")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Freight Log Section */}
      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-[#EAE6DF] dark:border-neutral-850">
          <div>
            <h4 className="text-xs font-black text-neutral-800 dark:text-white uppercase">
              {isAr ? "سجل الشحنات الواردة" : "Inbound Bulk Freight Logistics Log"}
            </h4>
            <p className="text-[10px] text-neutral-400">
              {isAr ? "سجلات الشحنات المعتمدة من الجمارك السريرية" : "Import freight entry registries verified by clinical customs agents"}
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 border border-amber-150 rounded-lg font-mono">
            {isAr ? "الجمارك نشطة" : "Customs clear active"}
          </span>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300 border-collapse">
          <thead>
            <tr className="border-b border-[#EAE6DF] dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="p-2">{isAr ? "رقم الشحنة" : "Freight ID"}</th>
              <th className="p-2">{isAr ? "الناقل" : "Carrier"}</th>
              <th className="p-2">{isAr ? "البضاعة" : "Cargo"}</th>
              <th className="p-2">{isAr ? "الوزن" : "Weight"}</th>
              <th className="p-2">{isAr ? "القيمة" : "Value"}</th>
              <th className="p-2">{isAr ? "تاريخ الوصول" : "Arrival"}</th>
              <th className="p-2 text-center">{isAr ? "الحالة" : "Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]/40 dark:divide-neutral-800/40 text-neutral-800 dark:text-neutral-200">
            {filtered.map((shp, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/40">
                <td className="p-2.5 font-mono font-bold text-neutral-850 dark:text-white">{shp.id}</td>
                <td className="p-2.5 font-bold text-neutral-700 dark:text-neutral-400">{shp.carrier}</td>
                <td className="p-2.5 font-semibold text-neutral-600 dark:text-neutral-300">{shp.cargo}</td>
                <td className="p-2.5 font-mono text-[11px] text-neutral-500">{shp.weight}</td>
                <td className="p-2.5 font-bold text-emerald-600 font-mono">{shp.cost}</td>
                <td className="p-2.5 font-mono text-neutral-400 text-[10px]">{shp.date}</td>
                <td className="p-2 text-center font-bold">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    shp.isOptimized
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40"
                  }`}>
                    {shp.status}
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
