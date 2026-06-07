/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Pill,
  Glasses,
  Coins,
  Warehouse,
  Search,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  FileDown,
  Printer,
  X,
  History,
  KeyRound,
  Info,
  Maximize2,
  Columns,
  Check,
  Eye,
  Settings,
  CircleDot,
  FileSpreadsheet
} from "lucide-react";

import {
  INITIAL_PHARMACY_STOCK,
  INITIAL_WAREHOUSE_PRODUCTS,
  INITIAL_OPTICS_PRODUCTS,
  INITIAL_LEDGER,
  PharmacyMeds,
  WarehouseProduct,
  OpticsProduct,
  TransactionJournal
} from "../mockErpData";

interface ErpSpreadsheetAppProps {
  appType: "pharmacy" | "warehouse" | "optics" | "accounting";
  onClose: () => void;
  language: "en" | "ar";
}

export default function ErpSpreadsheetApp({ appType, onClose, language }: ErpSpreadsheetAppProps) {
  // Main databases as state so they are interactive
  const [pharmatechStock, setPharmatechStock] = useState<PharmacyMeds[]>(INITIAL_PHARMACY_STOCK);
  const [warehouseGrid, setWarehouseGrid] = useState<WarehouseProduct[]>(INITIAL_WAREHOUSE_PRODUCTS);
  const [opticsCatalog, setOpticsCatalog] = useState<OpticsProduct[]>(INITIAL_OPTICS_PRODUCTS);
  const [accountingJournal, setAccountingJournal] = useState<TransactionJournal[]>(INITIAL_LEDGER);

  // Layout & UI controls
  const [density, setDensity] = useState<"comfortable" | "compact" | "tiny">("compact");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "history" | "security">("overview");

  // Record Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPharmacyName, setNewPharmacyName] = useState("");
  const [newPharmacyCode, setNewPharmacyCode] = useState("");
  const [newPharmacyClass, setNewPharmacyClass] = useState("");
  const [newPharmacyStock, setNewPharmacyStock] = useState(100);

  // Invisible toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Visibility map of key columns (can be customized with column picker!)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    classCode: true,
    stock: true,
    unitPrice: true,
    supplier: true,
    batch: true,
    expiry: true,
    status: true,
    debit: true,
    credit: true,
    wallet: true
  });

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleSelectAll = (checked: boolean, ids: string[]) => {
    if (checked) {
      setCheckedIds(ids);
    } else {
      setCheckedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedIds(prev => [...prev, id]);
    } else {
      setCheckedIds(prev => prev.filter(item => item !== id));
    }
  };

  // CSV/JSON Export Simulators
  const triggerExport = (format: "csv" | "json") => {
    let dataToExport: any[] = [];
    if (appType === "pharmacy") dataToExport = pharmatechStock;
    else if (appType === "warehouse") dataToExport = warehouseGrid;
    else if (appType === "optics") dataToExport = opticsCatalog;
    else dataToExport = accountingJournal;

    const prefix = `AlJawarih_${appType}_ledger`;
    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${prefix}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast(language === "ar" ? "تم تصدير ملف JSON بنجاح" : "Successfully downloaded JSON schema payload.");
    } else {
      // Simple CSV mapper
      const headers = Object.keys(dataToExport[0] || {}).join(",");
      const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(","));
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers, ...rows].join("\n"));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", csvContent);
      downloadAnchor.setAttribute("download", `${prefix}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast(language === "ar" ? "تم تصدير ملف CSV بنجاح" : "Successfully downloaded parsed CSV spreadsheet.");
    }
  };

  // Copy cells to clipboard
  const copyRowsToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(checkedIds));
    triggerToast(language === "ar" ? "نسخ معرّفات الصفوف إلى الحافظة" : "Copied selected row tokens to clipboard.");
  };

  // Form Addition
  const handleAddNewRecord = () => {
    if (appType === "pharmacy") {
      if (!newPharmacyName || !newPharmacyCode) {
        alert("Please enter Name and Code formulations.");
        return;
      }
      const newMed: PharmacyMeds = {
        id: `PH-0${pharmatechStock.length + 1}`,
        name: newPharmacyName,
        catalogCode: newPharmacyCode,
        drugClass: newPharmacyClass || "General Formulation",
        isChemical: true,
        stock: Number(newPharmacyStock) || 50,
        unit: "bottle",
        pricePerUnit: 15.0
      };
      setPharmatechStock(prev => [...prev, newMed]);
      triggerToast(language === "ar" ? "تمت إضافة المستحضر الصيدلاني بنجاح" : "Formulation successfully registered in active ledger.");
      setShowAddModal(false);
      setNewPharmacyName("");
      setNewPharmacyCode("");
      setNewPharmacyClass("");
    } else {
      triggerToast(language === "ar" ? "وظيفة الإضافة متاحة للصيدلية حالياً" : "Quick Add is customized for pharmacy stock sheets.");
      setShowAddModal(false);
    }
  };

  // Inline Cell stock decrement (Double click standard feature)
  const decrementStock = (id: string) => {
    if (appType === "pharmacy") {
      setPharmatechStock(prev => prev.map(med => med.id === id ? { ...med, stock: Math.max(0, med.stock - 10) } : med));
      triggerToast("Adjusted stock formulation value.");
    }
  };

  // Bulk executions
  const handleBulkWriteOff = () => {
    if (appType === "pharmacy") {
      setPharmatechStock(prev => prev.map(med => checkedIds.includes(med.id) ? { ...med, stock: 0 } : med));
    } else if (appType === "warehouse") {
      setWarehouseGrid(prev => prev.map(p => checkedIds.includes(p.sku) ? { ...p, onHandQty: 0, status: "Deficient" } : p));
    }
    setCheckedIds([]);
    triggerToast(language === "ar" ? "تم تصفية المخزون المحدد بنجاح" : "Bulk audited selected items as zero write-off.");
  };

  const handleBulkReorder = () => {
    if (appType === "pharmacy") {
      setPharmatechStock(prev => prev.map(med => checkedIds.includes(med.id) ? { ...med, stock: med.stock + 100 } : med));
    } else if (appType === "warehouse") {
      setWarehouseGrid(prev => prev.map(p => checkedIds.includes(p.sku) ? { ...p, onHandQty: p.onHandQty + 200, status: "Optimized" } : p));
    }
    setCheckedIds([]);
    triggerToast(language === "ar" ? "تم إرسال طلب إعادة الطلب الفوري" : "Dispatched bulk reorder claims directly to suppliers.");
  };

  // Filter lists based on Search & Chip active filters
  const processedData = useMemo(() => {
    if (appType === "pharmacy") {
      return pharmatechStock.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || med.catalogCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "Chemical" && med.isChemical) || (activeFilter === "Standard" && !med.isChemical);
        return matchesSearch && matchesTab;
      });
    } else if (appType === "warehouse") {
      return warehouseGrid.filter(prod => {
        const matchesSearch = prod.productName.toLowerCase().includes(searchQuery.toLowerCase()) || prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "Alerts" && prod.status !== "Optimized") || (activeFilter === "Optimized" && prod.status === "Optimized");
        return matchesSearch && matchesTab;
      });
    } else if (appType === "optics") {
      return opticsCatalog.filter(opt => {
        const matchesSearch = opt.brand.toLowerCase().includes(searchQuery.toLowerCase()) || opt.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "RayBan" && opt.brand === "Ray-Ban") || (activeFilter === "Silhouette" && opt.brand === "Silhouette");
        return matchesSearch && matchesTab;
      });
    } else {
      return accountingJournal.filter(txn => {
        const matchesSearch = txn.narrative.toLowerCase().includes(searchQuery.toLowerCase()) || txn.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "Sales" && txn.category === "Revenue") || (activeFilter === "Expenses" && txn.category === "Expenditure");
        return matchesSearch && matchesTab;
      });
    }
  }, [appType, pharmatechStock, warehouseGrid, opticsCatalog, accountingJournal, searchQuery, activeFilter]);

  // Dynamic values representing the row that clicks open the RHS detailed drawer
  const activeDetailRow = useMemo(() => {
    if (!selectedRowId) return null;
    if (appType === "pharmacy") return pharmatechStock.find(m => m.id === selectedRowId) || null;
    if (appType === "warehouse") return warehouseGrid.find(p => p.sku === selectedRowId) || null;
    if (appType === "optics") return opticsCatalog.find(o => o.id === selectedRowId) || null;
    return accountingJournal.find(a => a.id === selectedRowId) || null;
  }, [selectedRowId, appType, pharmatechStock, warehouseGrid, opticsCatalog, accountingJournal]);

  return (
    <div className="fixed inset-0 bg-[#EEEDE8] dark:bg-[#070B17] z-50 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F1E46] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-mono flex items-center gap-2 border border-[#2BBFFF]/40 animate-bounce">
          <CircleDot className="w-4 h-4 text-[#2BBFFF] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#0F1E46] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#2BBFFF]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2BBFFF] text-[#0F1E46] rounded-xl flex items-center justify-center font-bold shadow-lg">
            {appType === "pharmacy" && <Pill className="w-6 h-6" />}
            {appType === "warehouse" && <Warehouse className="w-6 h-6" />}
            {appType === "optics" && <Glasses className="w-6 h-6" />}
            {appType === "accounting" && <Coins className="w-6 h-6" />}
          </div>
          <div>
            <div className="font-extrabold text-[#F8FAFC] tracking-wide text-sm md:text-base flex items-center gap-2">
              {appType === "pharmacy" && (language === "ar" ? "نظام إدارة الصيدلية الرئيسي" : "MAIN PHARMACY FORMULATION DISPATCH")}
              {appType === "warehouse" && (language === "ar" ? "نظام إدارة المستودع المركزي" : "CENTRAL WAREHOUSE & BATCH REGISTERS")}
              {appType === "optics" && (language === "ar" ? "معرض رعاية العيون والنظارات" : "OPTICAL SHOWROOM DESIGN SUITE & POS")}
              {appType === "accounting" && (language === "ar" ? "دفتر الأستاذ والمالية الموحد" : "ENTERPRISE FINANCE LEDGER JOURNAL")}
              <span className="text-[10px] bg-[#2BBFFF]/20 text-[#2BBFFF] border border-[#2BBFFF]/45 font-mono px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                AL JAWARIH ERP ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#D8D5C8] opacity-80 mt-0.5">
              Secure double-entry transactional sheets | Terminal verified via cloud HS256 algorithm
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#D8D5C8] hover:text-white transition"
          title="Close App"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Ribbon Control Panel */}
      <div className="bg-[#F5F1EA] dark:bg-[#1A1625] border-b border-[#E2E8F0] dark:border-neutral-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        
        {/* Left Side Controls: Search + Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === "ar" ? "ابحث في السجل..." : "Quick search parameters..."}
              className="w-full bg-[#EEEDE8] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 pl-9 pr-4 py-1.5 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-100"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dynamic Interactive Filter Chips based on Active App */}
          <div className="flex items-center gap-1.5">
            {appType === "pharmacy" && (
              <>
                {["All", "Chemical", "Standard"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`px-3 py-1 text-[11px] rounded-full font-bold transition ${
                      activeFilter === chip ? "bg-[#0F1E46] text-[#2BBFFF]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {chip === "All" && (language === "ar" ? "جميع المستحضرات" : "All Formulation Sheets")}
                    {chip === "Chemical" && (language === "ar" ? "كيميائية نشطة" : "Active RxNorm Agents")}
                    {chip === "Standard" && (language === "ar" ? "مستلزمات عامة" : "Clinical Dry Stocks")}
                  </button>
                ))}
              </>
            )}
            {appType === "warehouse" && (
              <>
                {["All", "Alerts", "Optimized"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`px-3 py-1 text-[11px] rounded-full font-bold transition ${
                      activeFilter === chip ? "bg-[#0F1E46] text-[#2BBFFF]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {chip === "All" && (language === "ar" ? "جميع الأصناف" : "All Warehouse Inventory")}
                    {chip === "Alerts" && (language === "ar" ? "تنبيهات نقص المخزون" : "Critical Deficiencies / Expiry")}
                    {chip === "Optimized" && (language === "ar" ? "مستقرة" : "Sufficient Supply")}
                  </button>
                ))}
              </>
            )}
            {appType === "optics" && (
              <>
                {["All", "RayBan", "Silhouette"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`px-3 py-1 text-[11px] rounded-full font-bold transition ${
                      activeFilter === chip ? "bg-[#0F1E46] text-[#2BBFFF]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {chip === "All" && "All Handguards"}
                    {chip === "RayBan" && "Ray-Ban Specials"}
                    {chip === "Silhouette" && "Silhouette Rimless"}
                  </button>
                ))}
              </>
            )}
            {appType === "accounting" && (
              <>
                {["All", "Sales", "Expenses"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`px-3 py-1 text-[11px] rounded-full font-bold transition ${
                      activeFilter === chip ? "bg-[#0F1E46] text-[#2BBFFF]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {chip === "All" && (language === "ar" ? "جميع المعاملات" : "Full Register Journal")}
                    {chip === "Sales" && (language === "ar" ? "إيرادات نقدية" : "Inflow Revenue")}
                    {chip === "Expenses" && (language === "ar" ? "مصروفات عامة" : "Operational Capital Outflow")}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Side Controls: Actions, Column Pickers, Density Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Density 3-mode selector segment */}
          <div className="bg-[#EEEDE8] dark:bg-neutral-900 rounded-lg p-1 flex items-center border border-neutral-200 dark:border-neutral-700">
            {(["comfortable", "compact", "tiny"] as const).map(dt => (
              <button
                key={dt}
                onClick={() => setDensity(dt)}
                className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition ${
                  density === dt ? "bg-white dark:bg-neutral-800 text-[#0F1E46] dark:text-[#2BBFFF] shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {dt === "comfortable" && (language === "ar" ? "مريح" : "Comfort")}
                {dt === "compact" && (language === "ar" ? "متوسط" : "Compact")}
                {dt === "tiny" && (language === "ar" ? "تكثيفي" : "Tiny")}
              </button>
            ))}
          </div>

          {/* Column Picker Button toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="p-1.5 bg-white dark:bg-neutral-900 text-[#0F1E46] dark:text-neutral-200 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 hover:bg-[#EEEDE8] text-xs font-bold transition"
            >
              <Columns className="w-4 h-4 text-[#2BBFFF]" />
              <span className="hidden md:inline">{language === "ar" ? "تعديل الأعمدة" : "Column Selector"}</span>
            </button>
            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-3 z-10 space-y-2 text-xs">
                <div className="font-bold border-b border-neutral-100 pb-1.5 mb-2 text-[#0F1E46] dark:text-[#2BBFFF] uppercase text-[10px]">
                  Visible Metadata Sheets
                </div>
                {Object.keys(visibleColumns).map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => toggleColumn(col)}
                      className="accent-[#2BBFFF]"
                    />
                    <span className="capitalize font-mono text-[10px]">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* EXPORTS segment */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => triggerExport("csv")}
              className="p-1.5 bg-white dark:bg-neutral-900 text-[#008000] rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 hover:bg-[#EEEDE8] text-xs font-bold transition"
              title="CSV Download"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden leading-none lg:inline">CSV</span>
            </button>
            <button
              onClick={() => triggerExport("json")}
              className="p-1.5 bg-white dark:bg-neutral-900 text-[#2BBFFF] rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 hover:bg-[#EEEDE8] text-xs font-bold transition"
              title="JSON Download"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden leading-none lg:inline">JSON</span>
            </button>
          </div>

          {/* Print entire spreadsheet option */}
          <button
            onClick={() => window.print()}
            className="p-1.5 bg-white dark:bg-neutral-900 text-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 hover:bg-[#EEEDE8] text-xs font-bold transition"
          >
            <Printer className="w-4 h-4 text-[#FF841A]" />
            <span className="hidden md:inline">{language === "ar" ? "طباعة" : "Print"}</span>
          </button>

          {/* Add Record trigger button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 bg-[#0F1E46] text-white hover:bg-[#1A2B5E] text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4 text-[#2BBFFF]" />
            <span>{language === "ar" ? "إضافة" : "Add Sheet"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid spreadsheet space */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-[var(--clr-bg-card)] dark:bg-[#151824] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-w-[700px]">
            <table className="w-full text-left border-collapse select-text">
              <thead>
                <tr className="bg-[#F5F0E8] dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={e => {
                        if (appType === "pharmacy") handleSelectAll(e.target.checked, pharmatechStock.map(m=>m.id));
                        else if (appType === "warehouse") handleSelectAll(e.target.checked, warehouseGrid.map(m=>m.sku));
                        else if (appType === "optics") handleSelectAll(e.target.checked, opticsCatalog.map(m=>m.id));
                        else handleSelectAll(e.target.checked, accountingJournal.map(m=>m.id));
                      }}
                      className="accent-[#2BBFFF]"
                    />
                  </th>
                  
                  {/* Pharmacy Column Headers */}
                  {appType === "pharmacy" && (
                    <>
                      {visibleColumns.id && <th className="p-3">{language === "ar" ? "كود الصفر" : "Formula ID"}</th>}
                      {visibleColumns.name && <th className="p-3">{language === "ar" ? "اسم المستحضر الكيميائي" : "Formulation Catalog Product"}</th>}
                      {visibleColumns.classCode && <th className="p-3">{language === "ar" ? "التصنيف الطبي" : "RxNorm Classification"}</th>}
                      {visibleColumns.stock && <th className="p-3 text-right">{language === "ar" ? "المخزون المتاح" : "System Stock"}</th>}
                      {visibleColumns.unitPrice && <th className="p-3 text-right">{language === "ar" ? "السعر للوحدة" : "Unit Price ($)"}</th>}
                    </>
                  )}

                  {/* Warehouse Column Headers */}
                  {appType === "warehouse" && (
                    <>
                      {visibleColumns.id && <th className="p-3">SKU Code</th>}
                      {visibleColumns.name && <th className="p-3">Logistics Item Description</th>}
                      {visibleColumns.supplier && <th className="p-3">Certified Lead Supplier</th>}
                      {visibleColumns.batch && <th className="p-3">Active Batch Code</th>}
                      {visibleColumns.expiry && <th className="p-3">Expiry Date</th>}
                      {visibleColumns.stock && <th className="p-3 text-right">Physical On Hand</th>}
                      {visibleColumns.status && <th className="p-3 text-center">Status</th>}
                    </>
                  )}

                  {/* Optics Column Headers */}
                  {appType === "optics" && (
                    <>
                      {visibleColumns.id && <th className="p-3">Product ID</th>}
                      {visibleColumns.name && <th className="p-3">Designer Brand & Frame Model</th>}
                      {visibleColumns.supplier && <th className="p-3">Frame Style Structure</th>}
                      {visibleColumns.batch && <th className="p-3">Shed Material Type</th>}
                      {visibleColumns.expiry && <th className="p-3">Prescribed Lens Coatings</th>}
                      {visibleColumns.stock && <th className="p-3 text-right">Showroom stock</th>}
                      {visibleColumns.unitPrice && <th className="p-3 text-right">Sales Price ($)</th>}
                    </>
                  )}

                  {/* Accounting Ledger Headers */}
                  {appType === "accounting" && (
                    <>
                      {visibleColumns.id && <th className="p-3">Journal Token</th>}
                      {visibleColumns.expiry && <th className="p-3">Executed Time</th>}
                      {visibleColumns.name && <th className="p-3">Double-Entry Audit Narrative</th>}
                      {visibleColumns.debit && <th className="p-3 text-right">Debit ($)</th>}
                      {visibleColumns.credit && <th className="p-3 text-right">Credit ($)</th>}
                      {visibleColumns.wallet && <th className="p-3">Target Safe Wallet</th>}
                      {visibleColumns.supplier && <th className="p-3">Verified Employee Sign</th>}
                    </>
                  )}

                  <th className="p-3 text-center">{language === "ar" ? "إجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs text-neutral-800 dark:text-neutral-200">
                {processedData.map((row: any, i) => {
                  const keyId = appType === "warehouse" ? row.sku : row.id;
                  const isChecked = checkedIds.includes(keyId);
                  const isLow = appType === "pharmacy" && row.stock < 50;
                  const isExpiring = appType === "warehouse" && row.status === "ExpiringSoon";
                  const isDeficient = appType === "warehouse" && row.status === "Deficient";

                  return (
                    <tr
                      key={keyId}
                      className={`hover:bg-[#EEEDE8]/50 dark:hover:bg-neutral-800/45 cursor-pointer transition ${
                        isChecked ? "bg-[#2BBFFF]/10 dark:bg-[#2BBFFF]/5" : ""
                      } ${
                        density === "comfortable" ? "h-14" : density === "tiny" ? "h-6 text-[11px]" : "h-10"
                      }`}
                      onClick={() => {
                        setSelectedRowId(keyId);
                        setDrawerOpen(true);
                      }}
                      onDoubleClick={() => decrementStock(keyId)}
                    >
                      {/* Checkbox column */}
                      <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleSelectOne(keyId, e.target.checked)}
                          className="accent-[#2BBFFF]"
                        />
                      </td>

                      {/* Pharmacy Cells */}
                      {appType === "pharmacy" && (
                        <>
                          {visibleColumns.id && <td className="p-2 font-mono text-neutral-500">{row.id}</td>}
                          {visibleColumns.name && (
                            <td className="p-2 font-semibold">
                              <span className="block leading-tight">{row.name}</span>
                              <span className="text-[9px] text-[#2BBFFF] bg-[#2BBFFF]/10 border border-[#2BBFFF]/20 rounded px-1 py-0.5 inline-block mt-0.5 font-mono">
                                {row.catalogCode}
                              </span>
                            </td>
                          )}
                          {visibleColumns.classCode && <td className="p-2 text-neutral-500 font-mono text-[10px]">{row.drugClass}</td>}
                          {visibleColumns.stock && (
                            <td className={`p-2 text-right font-bold font-mono ${isLow ? "text-rose-600 animate-pulse" : "text-neutral-700 dark:text-neutral-300"}`}>
                              {row.stock} {row.unit}s
                            </td>
                          )}
                          {visibleColumns.unitPrice && <td className="p-2 text-right font-bold text-neutral-800 dark:text-neutral-200 font-mono">${row.pricePerUnit.toFixed(2)}</td>}
                        </>
                      )}

                      {/* Warehouse Cells */}
                      {appType === "warehouse" && (
                        <>
                          {visibleColumns.id && <td className="p-2 font-mono text-neutral-500 text-[10px]">{row.sku}</td>}
                          {visibleColumns.name && <td className="p-2 font-bold text-neutral-800 dark:text-neutral-200">{row.productName}</td>}
                          {visibleColumns.supplier && <td className="p-2 text-neutral-500">{row.supplier}</td>}
                          {visibleColumns.batch && <td className="p-2 font-mono text-neutral-400 text-[10px]">{row.batchNum}</td>}
                          {visibleColumns.expiry && (
                            <td className={`p-2 font-mono text-[10px] ${isExpiring ? "text-[#FF841A] font-extrabold" : ""}`}>
                              {row.expiryDate}
                            </td>
                          )}
                          {visibleColumns.stock && (
                            <td className={`p-2 text-right font-black font-mono ${isDeficient ? "text-rose-600" : ""}`}>
                              {row.onHandQty} pcs
                            </td>
                          )}
                          {visibleColumns.status && (
                            <td className="p-2 text-center text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                                row.status === "Optimized" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                row.status === "Warning" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          )}
                        </>
                      )}

                      {/* Optics Cells */}
                      {appType === "optics" && (
                        <>
                          {visibleColumns.id && <td className="p-2 font-mono text-neutral-500">{row.id}</td>}
                          {visibleColumns.name && (
                            <td className="p-2">
                              <span className="font-extrabold text-[#0F1E46] dark:text-white block">{row.brand}</span>
                              <span className="text-neutral-600 font-medium">{row.model}</span>
                            </td>
                          )}
                          {visibleColumns.supplier && <td className="p-2 text-neutral-500 font-medium">{row.frameStyle}</td>}
                          {visibleColumns.batch && <td className="p-2 font-mono text-[10px] text-neutral-400">{row.material}</td>}
                          {visibleColumns.expiry && <td className="p-2 text-neutral-600 italic text-[11px]">{row.lensType}</td>}
                          {visibleColumns.stock && <td className="p-2 text-right font-bold text-neutral-700 dark:text-neutral-300 font-mono">{row.showroomStock} pcs</td>}
                          {visibleColumns.unitPrice && <td className="p-2 text-right font-black text-neutral-800 dark:text-[#2BBFFF] font-mono">${row.price}</td>}
                        </>
                      )}

                      {/* Accounting Cells */}
                      {appType === "accounting" && (
                        <>
                          {visibleColumns.id && <td className="p-2 font-mono text-[#2BBFFF] font-extrabold">{row.id}</td>}
                          {visibleColumns.expiry && <td className="p-2 font-mono text-neutral-400 text-[10px]">{row.timestamp}</td>}
                          {visibleColumns.name && (
                            <td className="p-2">
                              <span className="font-bold text-neutral-800 dark:text-neutral-100 block leading-tight">{row.narrative}</span>
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono mt-0.5 inline-block">{row.category}</span>
                            </td>
                          )}
                          {visibleColumns.debit && (
                            <td className="p-2 text-right font-mono font-bold text-emerald-600">
                              {row.debit > 0 ? `$${row.debit.toFixed(2)}` : "-"}
                            </td>
                          )}
                          {visibleColumns.credit && (
                            <td className="p-2 text-right font-mono font-bold text-rose-600">
                              {row.credit > 0 ? `$${row.credit.toFixed(2)}` : "-"}
                            </td>
                          )}
                          {visibleColumns.wallet && <td className="p-2 font-mono text-neutral-500 text-[10px]">{row.wallet}</td>}
                          {visibleColumns.supplier && <td className="p-2 text-neutral-400 font-sans italic">{row.verifiedBy}</td>}
                        </>
                      )}

                      {/* Action Cell */}
                      <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRowId(keyId);
                            setDrawerOpen(true);
                          }}
                          className="px-2 py-1 bg-[#EEEDE8] dark:bg-neutral-800 rounded font-bold text-[10px] text-neutral-880 hover:bg-[#D8D5C8] flex items-center justify-center gap-0.5 mx-auto transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2BBFFF]" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Audit Detail Drawer */}
        {drawerOpen && activeDetailRow && (
          <div className="w-80 bg-[var(--clr-bg-card)] dark:bg-[#1A1625] border-l border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-[#F5F0E8] dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#0F1E46] dark:text-[#2BBFFF] tracking-widest uppercase flex items-center gap-1">
                <Settings className="w-4 h-4 animate-spin" /> META AUDIT LEDGER
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segment tabs inside the drawer */}
            <div className="flex bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold">
              {(["overview", "history", "security"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`flex-1 py-2 text-center border-b-2 transition uppercase ${
                    drawerTab === tab ? "border-[#2BBFFF] text-[#0F1E46] dark:text-[#2BBFFF]" : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              
              {drawerTab === "overview" && (
                <div className="space-y-4">
                  <div className="bg-[#EEEDE8] dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-black block tracking-wider">Product Name / Identifier</span>
                    <span className="font-extrabold text-[#0f1e46] dark:text-white text-sm block mt-0.5">
                      {appType === "pharmacy" && activeDetailRow.name}
                      {appType === "warehouse" && activeDetailRow.productName}
                      {appType === "optics" && `${activeDetailRow.brand} - ${activeDetailRow.model}`}
                      {appType === "accounting" && activeDetailRow.narrative}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[8px] font-mono text-neutral-400 uppercase block">Ledger Key Token</span>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                        {appType === "warehouse" ? activeDetailRow.sku : activeDetailRow.id}
                      </span>
                    </div>
                    {visibleColumns.stock && (
                      <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase block">Logged Stock</span>
                        <span className="font-bold text-[#0F1E46] dark:text-[#2BBFFF] font-mono">
                          {appType === "pharmacy" && `${activeDetailRow.stock} bottles`}
                          {appType === "warehouse" && `${activeDetailRow.onHandQty} items`}
                          {appType === "optics" && `${activeDetailRow.showroomStock} units`}
                          {appType === "accounting" && `$${(activeDetailRow.debit || activeDetailRow.credit || 0).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {appType === "pharmacy" && (
                    <div className="border border-neutral-200/60 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">RxNorm Code:</span>
                        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{activeDetailRow.catalogCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Class:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{activeDetailRow.drugClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Active Compound:</span>
                        <span className="text-emerald-600 font-bold">{activeDetailRow.isChemical ? "Yes (Vetted)" : "Dry Supplement"}</span>
                      </div>
                    </div>
                  )}

                  {appType === "warehouse" && (
                    <div className="border border-neutral-200/60 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Assigned Supplier:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold text-[10px]">{activeDetailRow.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Active Batch Code:</span>
                        <span className="font-mono text-neutral-700 dark:text-neutral-300 font-bold">{activeDetailRow.batchNum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Expiry Date:</span>
                        <span className="text-[#FF841A] font-extrabold font-mono">{activeDetailRow.expiryDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === "history" && (
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">Operational Timeline Audits</span>
                  <div className="relative border-l-2 border-[#2BBFFF]/40 pl-3 space-y-4 py-1">
                    <div className="space-y-0.5 relative">
                      <div className="w-2 h-2 rounded-full bg-[#2BBFFF] absolute -left-[18px] top-1.5 ring-4 ring-[#2BBFFF]/20"></div>
                      <span className="text-[9px] font-mono text-neutral-400">Today at 18:05</span>
                      <p className="font-bold text-neutral-800 dark:text-white">Physical stocktake completed</p>
                      <span className="text-neutral-400 block text-[10px]">Verified by Pharmacist Vance (Employee Badge #PH-9002)</span>
                    </div>
                    <div className="space-y-0.5 relative">
                      <div className="w-2 h-2 rounded-full bg-neutral-300 absolute -left-[18px] top-1.5"></div>
                      <span className="text-[9px] font-mono text-neutral-400">Yesterday, 14:12</span>
                      <p className="font-bold text-neutral-700 dark:text-neutral-300">Internal warehouse batch transfer dispatch</p>
                      <span className="text-neutral-400 block text-[10px]">Assigned location: Main Clinic Vault room 12D</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "security" && (
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">Cryptographic Claims Verification</span>
                  <div className="bg-[#0F1E46] text-teal-300 p-3 rounded-lg font-mono text-[10px] space-y-2 border border-[#2BBFFF]/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">
                      <KeyRound className="w-4 h-4 text-[#2BBFFF]" />
                      <span>HS256 METADATA HASH</span>
                    </div>
                    <div className="break-all leading-normal opacity-80">
                      SHA-256: d8ec8e0f3bb221a973bb290efce18cc01815181b5fbcc99021a8c0816ef1
                    </div>
                    <div className="text-white">
                      Status: <strong className="text-emerald-400">VERIFIED SIGNATURE</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    This block transaction is locked under strict HIPAA cloud directives. Modifying cell elements forces local sync recalculations immediately.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bulk Action Bar */}
      {checkedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F1E46] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center justify-between gap-6 border border-[#2BBFFF]/40 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#2BBFFF] text-[#0F1E46] font-extrabold text-xs flex items-center justify-center">
              {checkedIds.length}
            </span>
            <span className="font-bold text-xs">
              {language === "ar" ? "صفوف محددة للتعديل الكلي" : "Bulk records selected for transaction processing"}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/20"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkReorder}
              className="px-3.5 py-1.5 bg-[#2BBFFF] text-[#0F1E46] hover:bg-[#5dd2ff] font-extrabold text-[10px] uppercase rounded-full transition"
            >
              🚀 {language === "ar" ? "إعادة الطلب" : "Reorder Batch"}
            </button>
            <button
              onClick={handleBulkWriteOff}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 font-extrabold text-[10px] uppercase rounded-full transition"
            >
              🗑️ {language === "ar" ? "شطب كلي" : "Bulk Write-Off"}
            </button>
            <button
              onClick={copyRowsToClipboard}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 font-extrabold text-[10px] uppercase rounded-full transition"
            >
              📋 {language === "ar" ? "نسخ المعرّفات" : "Copy Token Keys"}
            </button>
            <button
              onClick={() => setCheckedIds([])}
              className="text-white/40 hover:text-white transition font-bold text-xs px-1 ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Unified Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0F1E46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] w-full max-w-md rounded-2xl shadow-2xl border border-neutral-150 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#0f1e46] text-white px-6 py-4 flex items-center justify-between border-b border-[#2BBFFF]/20">
              <span className="font-bold text-sm tracking-wide flex items-center gap-1.5 uppercase">
                <Plus className="w-5 h-5 text-[#2BBFFF]" /> 
                {language === "ar" ? "إضافة مستند جديد" : "Append New Active Catalog Row"}
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Product / Formulation Name</label>
                <input
                  type="text"
                  placeholder="e.g. Moxifloxacin HCl Eye Drops"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                  value={newPharmacyName}
                  onChange={e => setNewPharmacyName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Catalog Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RX-MOX-050"
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono font-semibold focus:outline-[#2BBFFF]"
                    value={newPharmacyCode}
                    onChange={e => setNewPharmacyCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF]"
                    value={newPharmacyStock}
                    onChange={e => setNewPharmacyStock(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Drug Class / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Fluoroquinolone Antibiotic"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                  value={newPharmacyClass}
                  onChange={e => setNewPharmacyClass(e.target.value)}
                />
              </div>

              <p className="text-[10px] text-neutral-400 font-mono leading-relaxed bg-[#EEEDE8] dark:bg-neutral-900 p-2.5 rounded border">
                <strong>Cryptographic validation notice:</strong> Submitting files triggers local cache state append algorithms. Data is signed immediately.
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/60 px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-250 text-neutral-700 font-bold text-xs rounded-lg transition"
              >
                {language === "ar" ? "إلغاء الأمر" : "Dismiss"}
              </button>
              <button
                type="button"
                onClick={handleAddNewRecord}
                className="px-4 py-2 bg-[#0F1E46] hover:bg-[#1A2B5E] text-white font-bold text-xs rounded-lg transition"
              >
                {language === "ar" ? "حفظ المستند" : "Commit Record"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
