import { useWarehouse } from "../../../context/WarehouseContext";
import { useAccounting } from "../../../context/AccountingContext";

interface Props {
  language: "en" | "ar";
  onToast: (msg: string) => void;
}

export default function WarehouseToolbar({ language, onToast }: Props) {
  const isAr = language === "ar";
  const { state, setDestination, addDestination, bulkReceive } = useWarehouse();
  const accounting = useAccounting();

  const handleAddDestination = () => {
    const newD = prompt(isAr ? "أدخل رمز الوجهة الجديدة (مثال: CLINIC_WEST):" : "Enter new destination code (e.g. CLINIC_WEST):");
    if (newD && newD.trim().length > 0) {
      const cleanD = newD.toUpperCase().trim();
      if (state.destinations.includes(cleanD)) {
        alert(isAr ? "الوجهة موجودة بالفعل" : "Destination already exists.");
      } else {
        addDestination(cleanD);
        setDestination(cleanD);
        onToast(`Added destination: ${cleanD}`);
      }
    }
  };

  const handleReceiveShipment = () => {
    const firstTwo = state.products.slice(0, 2).map(p => p.sku);
    const totalCost = firstTwo.reduce((sum, sku) => {
      const p = state.products.find(pr => pr.sku === sku);
      return sum + (p ? p.unitCost * 200 : 0);
    }, 0);
    accounting.postJournalEntry({
      narrative: `Receive cargo: ${firstTwo.join(", ")}`,
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
      trigger: "Receive Cargo",
      narrative: `Received cargo for ${firstTwo.length} SKUs. Total value: $${totalCost.toFixed(2)}`,
      timestamp: new Date().toLocaleTimeString(),
      ledgerEntryCreated: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
    }, ...accounting.state.automationLogs] });
    bulkReceive(firstTwo);
    onToast(isAr ? "تم استلام الشحنة بنجاح" : "Cargo batch received successfully");
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={state.activeDestination}
        onChange={e => { setDestination(e.target.value); onToast(`Switched to: ${e.target.value}`); }}
        className="appearance-none pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-neutral-150/70"
      >
        {state.destinations.map(d => (
          <option key={d} value={d}>📦 Depot: {d}</option>
        ))}
      </select>

      <button
        onClick={handleAddDestination}
        className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-350 dark:border-neutral-700 rounded-xl font-bold text-[9px] uppercase cursor-pointer transition active:scale-[0.98]"
      >
        ➕ ConfigLookups
      </button>

      <button
        onClick={handleReceiveShipment}
        className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition active:scale-[0.98] shadow-xs"
      >
        🚚 Receive Cargo Batch
      </button>
    </div>
  );
}
