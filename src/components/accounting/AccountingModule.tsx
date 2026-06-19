import { useState } from "react";
import { AccountingTab } from "../../types/accounting";
import AccountingSidebar from "./layout/AccountingSidebar";
import AccountingDashboard from "./dashboard/AccountingDashboard";
import ChartOfAccounts from "./coa/ChartOfAccounts";
import GeneralLedger from "./ledger/GeneralLedger";
import ManualJournalForm from "./journal/ManualJournalForm";
import ReportsView from "./reports/ReportsView";
import { X } from "lucide-react";

interface Props {
  language: "en" | "ar";
  onClose: () => void;
}

export default function AccountingModule({ language, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<AccountingTab>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AccountingDashboard language={language} />;
      case "coa":
        return <ChartOfAccounts language={language} />;
      case "ledger":
        return <GeneralLedger language={language} />;
      case "journal":
        return <ManualJournalForm language={language} />;
      case "reports":
        return <ReportsView language={language} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FBFBF9] dark:bg-[#0B0E14]">
      <AccountingSidebar activeTab={activeTab} onTabChange={setActiveTab} language={language} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-[#EAE6DF] dark:border-neutral-800 bg-white dark:bg-[#121520] flex items-center justify-between px-4 shrink-0">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
            {language === "ar" ? "نظام المحاسبة - مستشفى الجوارح" : "Accounting System — Al Jawarih Eye Hospital"}
          </span>
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
    </div>
  );
}
