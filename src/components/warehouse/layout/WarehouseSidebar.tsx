import { WarehouseTab } from "../../../types/warehouse";
import { LayoutDashboard, Package, ArrowRightLeft, Truck } from "lucide-react";

interface Props {
  activeTab: WarehouseTab;
  onTabChange: (tab: WarehouseTab) => void;
  language: "en" | "ar";
}

const TABS: { id: WarehouseTab; icon: any; labelEn: string; labelAr: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, labelEn: "Dashboard", labelAr: "لوحة القيادة" },
  { id: "inventory", icon: Package, labelEn: "Inventory", labelAr: "المخزون" },
  { id: "transfers", icon: ArrowRightLeft, labelEn: "Transfers", labelAr: "التحويلات" },
  { id: "freight", icon: Truck, labelEn: "Freight", labelAr: "الشحنات" },
];

export default function WarehouseSidebar({ activeTab, onTabChange, language }: Props) {
  const isAr = language === "ar";
  return (
    <div className="w-56 bg-white dark:bg-[#0E1019] flex flex-col shrink-0 border-r border-[#EAE6DF] dark:border-neutral-800/60">
      <div className="p-4 border-b border-[#EAE6DF] dark:border-neutral-800/60">
        <span className="text-[9px] font-mono font-black text-[#4F46E5] dark:text-amber-500 uppercase tracking-widest">
          {isAr ? "المستودع" : "WAREHOUSE"}
        </span>
        <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">
          {isAr ? "الخدمات اللوجستية" : "Logistics Depot"}
        </span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? "bg-indigo-50 text-[#4F46E5] border border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 border border-transparent dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/40"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
