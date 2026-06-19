import { useState, useCallback } from "react";
import { WarehouseTab } from "../../types/warehouse";
import { WarehouseProvider } from "../../context/WarehouseContext";
import WarehouseSidebar from "./layout/WarehouseSidebar";
import WarehouseToolbar from "./layout/WarehouseToolbar";
import WarehouseDashboard from "./dashboard/WarehouseDashboard";
import InventoryLedger from "./inventory/InventoryLedger";
import TransferForm from "./transfers/TransferForm";
import FreightLedger from "./freight/FreightLedger";
import { X } from "lucide-react";

interface Props {
  language: "en" | "ar";
  onClose: () => void;
}

function WarehouseContent({ language, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<WarehouseTab>("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <WarehouseDashboard language={language} />;
      case "inventory":
        return <InventoryLedger language={language} />;
      case "transfers":
        return <TransferForm language={language} onToast={triggerToast} />;
      case "freight":
        return <FreightLedger language={language} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FBFBF9] dark:bg-[#0B0E14]">
      <WarehouseSidebar activeTab={activeTab} onTabChange={setActiveTab} language={language} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-[#EAE6DF] dark:border-neutral-800 bg-white dark:bg-[#121520] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              {language === "ar" ? "نظام المستودع — مستشفى الجوارح" : "Warehouse System — Al Jawarih Eye Hospital"}
            </span>
            <WarehouseToolbar language={language} onToast={triggerToast} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition active:scale-[0.98]"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <main className="flex-1 overflow-auto p-5">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#0F172A] dark:bg-neutral-900 text-white text-[11px] font-bold rounded-xl shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function WarehouseModule(props: Props) {
  return (
    <WarehouseProvider>
      <WarehouseContent {...props} />
    </WarehouseProvider>
  );
}
