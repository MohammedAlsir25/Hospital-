/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Pill,
  Glasses,
  Coins,
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
  FileSpreadsheet,
  Lock,
  LogOut,
  MessageSquare,
  Pencil
} from "lucide-react";

import {
  INITIAL_PHARMACY_STOCK,
  INITIAL_OPTICS_PRODUCTS,
  INITIAL_LEDGER,
  PharmacyMeds,
  OpticsProduct,
  TransactionJournal
} from "../mockErpData";

import { HospitalManualJournalForm } from "./AccountingWorkstationComponents";

import { ClinicalRole, Patient, Employee } from "../types";
import PosRetailTerminal from "./PosRetailTerminal";
import HrSpecialistDashboard from "./HrSpecialistDashboard";
import HiddenOpexAccountant from "./HiddenOpexAccountant";
import FrontDeskDashboard from "./FrontDeskDashboard";

interface ErpSpreadsheetAppProps {
  appType: "pharmacy" | "optics" | "accounting" | "hr" | "reception";
  onClose: () => void;
  language: "en" | "ar";
  activeRole?: ClinicalRole;
  setActiveRole?: (role: ClinicalRole) => void;
  patients?: Patient[];
  onAddPatient?: (p: Patient) => void;
  onUpdatePatient?: (p: Patient) => void;
  unreadMessagesCount?: number;
}

export default function ErpSpreadsheetApp({
  appType,
  onClose,
  language,
  activeRole = "doctor",
  setActiveRole = () => {},
  patients = [],
  onAddPatient = () => {},
  onUpdatePatient = () => {},
  unreadMessagesCount = 0
}: ErpSpreadsheetAppProps) {
  // Main databases as state so they are interactive
  const [pharmatechStock, setPharmatechStock] = useState<PharmacyMeds[]>(INITIAL_PHARMACY_STOCK);
  const [opticsCatalog, setOpticsCatalog] = useState<OpticsProduct[]>(INITIAL_OPTICS_PRODUCTS);
  const [accountingJournal, setAccountingJournal] = useState<TransactionJournal[]>(INITIAL_LEDGER);

  // Point of Sale launch triggers
  const [isPosOpen, setIsPosOpen] = useState(false);

  // Dynamic Employee Database for HR Module (initially empty — populated from backend)
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Dynamic accounting cost centers & sub-tabs
  const [accountingCostCenter, setAccountingCostCenter] = useState<string>("All");
  const [activeHospitalSubTab, setActiveHospitalSubTab] = useState<string>("All");

  // Central Account Workstation Tab State
  const [accountingTab, setAccountingTab] = useState<"dashboard" | "coa" | "ledger" | "billing" | "insurance" | "ap" | "depreciation" | "integrations">("dashboard");
  const [gaapComplianceAudited, setGaapComplianceAudited] = useState<boolean>(true);

  // New persistent 3-level tab states for other departments
  const [pharmacyTab, setPharmacyTab] = useState<"dispensing" | "formulations" | "dispatches">("dispensing");
  const [opticsTab, setOpticsTab] = useState<"catalog" | "pos" | "lab">("catalog");

  // Local location selectors for pharmacy & optics workstations
  const [pharmacyLocation, setPharmacyLocation] = useState("HOSPITAL");
  const [opticsLocation, setOpticsLocation] = useState("HOSPITAL");

  // Backend seed definitions — zero-balance Chart of Accounts
  const BACKEND_SEED_CHART_OF_ACCOUNTS = [
    { code: "ACC-1110-CASH", name: "Cash At Drawer - Reception", nameAr: "الصندوق - الاستقبال الرئيسي", category: "Assets", balance: 0, description: "Physical cash in reception drawer for direct clinical co-pays." },
    { code: "ACC-1120-BANK", name: "Standard Chartered Operating Bank", nameAr: "بنك ستاندرد تشارترد - التشغيلي", category: "Assets", balance: 0, description: "Main institutional bank account for digital billing and bank transfers." },
    { code: "ACC-1210-PHARM-INV", name: "Ophthalmic Drug Stock Assets", nameAr: "مخزون الأدوية والمستحضرات", category: "Assets", balance: 0, description: "Valued assets of pharmacy eye drops, tablet boxes, and medications." },
    { code: "ACC-1220-OPTIC-INV", name: "Optical Frame & Lens Inventory Assets", nameAr: "مخزون رعاية العيون والنظارات", category: "Assets", balance: 0, description: "Capital valuation of showroom frame fashion lines and custom laser lens blanks." },
    { code: "ACC-1130-AR", name: "Patient Outstanding co-pays (AR)", nameAr: "حسابات مديني المرضى", category: "Assets", balance: 0, description: "Accounts receivable from open patient co-pay checkouts." },
    { code: "ACC-1140-AR-INSUR", name: "Third-Party Insurance Outstanding Claims", nameAr: "ذمم شركات التأمين الصحي", category: "Assets", balance: 0, description: "Outstanding receivables from medical insurance clearinghouses." },
    { code: "ACC-2110-AP", name: "Certified Vendor Payables (AP)", nameAr: "ذمم حسابات الموردين والدائنين", category: "Liabilities", balance: 0, description: "Accrued obligations owed to medical supply distributors." },
    { code: "ACC-2120-COMM-ACCRUED", name: "Accrued Physician Bonus Commissions", nameAr: "عمولات الأطباء والاستشاريين المستحقة", category: "Liabilities", balance: 0, description: "Unpaid commission percentages due to operating surgeons." },
    { code: "ACC-1510-MACH-OCT", name: "Capital Ophthalmic Laser Hardware", nameAr: "أصول آلات وأجهزة الليزر والعيون", category: "Assets", balance: 0, description: "Acquisition value of top-tier 3D OCT, lasers, and operating microscopes." },
    { code: "ACC-1590-ACCUM-DEPR", name: "Accumulated Depreciation - Equipment", nameAr: "مجمع إهلاك الآلات والمعدات الطبية", category: "Assets", balance: 0, description: "Aggregated monthly wear-and-tear value offsets on clinical machinery." },
    { code: "ACC-3110-EQUITY", name: "Retained Earnings & Reserves", nameAr: "الأرباح المبقاة والاحتياطيات", category: "Equity", balance: 0, description: "Aggregated retained earnings of Al Jawarih Eye Hospital." },
    { code: "ACC-4100-REV-CONSULT", name: "Clinical Consultation Revenues", nameAr: "إيرادات الكشف والتشخيص الطبي", category: "Revenue", balance: 0, description: "Clinical outpatient service invoice collections." },
    { code: "ACC-4200-REV-SURGERY", name: "Surgical Theater Facility Revenue", nameAr: "إيرادات العمليات الجراحية وغرفة العمليات", category: "Revenue", balance: 0, description: "Fees logged from cataracts, strabismus repairs, and orbital trauma surgeries." },
    { code: "ACC-4300-REV-PHARM", name: "Glaucoma & Rx Dispensary Revenues", nameAr: "إيرادات صيدلية المجمع", category: "Revenue", balance: 0, description: "Operational inflows from prescription medicine discharges." },
    { code: "ACC-4400-REV-OPTICAL", name: "Optical POS Frame & Fabrications Revenue", nameAr: "إيرادات معرض البصريات وتركيب العدسات", category: "Revenue", balance: 0, description: "Point of sale revenue from designer frames and lens fabrications." },
    { code: "ACC-5110-EXP-SUPPLIES", name: "Ophthalmic Medical Consumables Expenses", nameAr: "مصروفات مستهلكات ومستلزمات طبية", category: "Expenses", balance: 0, description: "Cost of single-use syringes, procedural drapes, and surgical cartridges." },
    { code: "ACC-5120-EXP-COMM", name: "Consulting Doctor Commission Overhead", nameAr: "مصروفات عمولات الأطباء الاستشاريين", category: "Expenses", balance: 0, description: "Hospital expense matching surgeon procedure commissions." },
    { code: "ACC-5130-EXP-DEPR", name: "Monthly Hardware Depreciation Expense", nameAr: "مصروف إهلاك الآلات الطبية الشهري", category: "Expenses", balance: 0, description: "Non-cash operational expense marking ophthalmic device aging." },
    { code: "ACC-5145-EXP-UTILITY", name: "Hospital Infrastructure Utilities Overhead", nameAr: "مصاريف الكهرباء والخدمات للمستشفى", category: "Expenses", balance: 0, description: "Water, high-efficiency power feed for surgical theaters, and safety gases." },
  ];

  const BACKEND_SEED_PATIENT_INVOICES = [];

  const SEED_INSURANCE_CLAIMS = [];

  const SEED_VENDOR_BILLS = [];

  const SEED_DEPRECIABLE_ASSETS = [];

  const SEED_AUTOMATION_LOGS = [];

  // Pre-populated with seed data (backed by Spring Boot in production)
  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>(BACKEND_SEED_CHART_OF_ACCOUNTS);
  const [patientInvoices, setPatientInvoices] = useState<any[]>(BACKEND_SEED_PATIENT_INVOICES);
  const [insuranceClaims, setInsuranceClaims] = useState<any[]>(SEED_INSURANCE_CLAIMS);
  const [vendorBills, setVendorBills] = useState<any[]>(SEED_VENDOR_BILLS);
  const [depreciableAssets, setDepreciableAssets] = useState<any[]>(SEED_DEPRECIABLE_ASSETS);
  const [automationLogs, setAutomationLogs] = useState<any[]>(SEED_AUTOMATION_LOGS);

  useEffect(() => {
    if (!patients || patients.length === 0) return;

    // 2. Derive & merge all live patients with clinical billing entries into patientInvoices
    setPatientInvoices((prevInvoices) => {
      // Start with base (either previous invoices or fallback seed data)
      const baseInvoices = prevInvoices.length > 0 ? [...prevInvoices] : [...BACKEND_SEED_PATIENT_INVOICES];

      const existsMap = new Map<string, number>();
      baseInvoices.forEach((inv, idx) => {
        existsMap.set(inv.id, idx);
      });

      const newInvoices: any[] = [];

      patients.forEach((patient) => {
        if (patient.billingLedger && patient.billingLedger.length > 0) {
          const liveInvoiceId = `INV-LIVE-${patient.id}`;
          const existingIdx = existsMap.get(liveInvoiceId);

          const totalAmount = patient.billingLedger.reduce((sum, item) => sum + item.amount, 0);
          const isPaid = patient.billingLedger.every((item) => item.status === "Paid");
          const anyPaid = patient.billingLedger.some((item) => item.status === "Paid");

          const isSelfPay = patient.insuranceCoverage?.payerType === "Self-Pay";
          const patientCoPay = isSelfPay ? totalAmount : totalAmount * 0.2; // 20% co-pay
          const insuranceClaim = isSelfPay ? 0 : totalAmount * 0.8; // 80% insurance claim

          const liveInvoice = {
            id: liveInvoiceId,
            patientId: patient.id,
            patientName: patient.name,
            insuranceProvider: patient.insuranceCoverage?.providerId || patient.insuranceCoverage?.payerType || "Self-Pay",
            billingSource: (patient.clinic ? patient.clinic.toUpperCase() : "GENERAL") + "_CLINIC",
            physicianName: "Attending Consultant",
            physicianId: "EMP-001",
            encounterId: `ENC-${patient.id.replace("PAT-", "").toUpperCase()}`,
            icdCode: patient.optometryDossier?.targetSpecialtyDestination || "H52.13 (Ophthalmic Consultation)",
            items: patient.billingLedger.map((bItem, idx) => ({
              itemCode: bItem.id || `ITEM-${idx}`,
              description: bItem.serviceName,
              quantity: 1,
              unitPrice: bItem.amount,
              vatPercentage: 5.00
            })),
            commissionPercentage: 12.00,
            totalAmount: totalAmount,
            patientCoPayPayable: patientCoPay,
            insuranceClaimPayable: insuranceClaim,
            status: isPaid ? "Paid" : anyPaid ? "Cashier-Pending" : "Split-Unpaid",
            selectedPaymentMethod: isPaid ? "Card" : "",
            patientPaidAmount: patient.billingLedger
              .filter((item) => item.status === "Paid")
              .reduce((sum, item) => sum + item.amount, 0),
            claimCode: patient.insuranceCoverage?.policyNumber || "",
            dateCreated: new Date().toISOString().split("T")[0]
          };

          if (existingIdx !== undefined) {
            const existingInv = baseInvoices[existingIdx];
            baseInvoices[existingIdx] = {
              ...liveInvoice,
              selectedPaymentMethod: existingInv.selectedPaymentMethod || liveInvoice.selectedPaymentMethod,
              status: isPaid || existingInv.status === "Paid" ? "Paid" : liveInvoice.status
            };
          } else {
            newInvoices.push(liveInvoice);
          }
        }
      });

      if (newInvoices.length > 0) {
        return [...newInvoices, ...baseInvoices];
      }
      return baseInvoices;
    });
  }, [patients]);

  // 3. Dynamic double-entry HIS general ledger synchronizer on patients' billingLedger changes
  useEffect(() => {
    if (!patients || patients.length === 0) return;

    setAccountingJournal((prevJournal) => {
      const updatedJournal = [...prevJournal];
      
      const existsSet = new Set<string>();
      updatedJournal.forEach((je) => {
        existsSet.add(je.id);
      });

      const newJournalEntries: any[] = [];

      patients.forEach((patient) => {
        if (patient.billingLedger) {
          patient.billingLedger.forEach((bItem) => {
            const liveJeId = `JE-ACC-${patient.id}-${bItem.id}`;
            const exists = existsSet.has(liveJeId);

            if (!exists) {
              const clinicName = patient.clinic ? patient.clinic.toUpperCase() : "GENERAL";
              const narrative = `Clinical Accrual: ${patient.name} - ${bItem.serviceName} (${clinicName} Clinic)`;
              newJournalEntries.push({
                id: liveJeId,
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                narrative: narrative,
                category: "Revenue",
                debit: bItem.amount,
                credit: bItem.amount,
                wallet: bItem.status === "Paid" ? "Main Safe" : "Insurance Receivables",
                verifiedBy: "HIS Auto-accrual Router",
                costCenter: "HOSPITAL"
              });
            }
          });
        }
      });

      if (newJournalEntries.length > 0) {
        // Prepend new journal entries so they show up at the top
        return [...newJournalEntries, ...updatedJournal];
      }
      return prevJournal;
    });
  }, [patients]);

  // 4. Cross-Module Real-time Event Listener for Pharmacy & Accounting departments
  useEffect(() => {
    const handleClinicalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || !customEvent.detail.patient) return;

      const { patient, status } = customEvent.detail;

      if (status === "Dispensing") {
        triggerToast(
          language === "ar"
            ? `📲 تحديث الصيدلية: تم استلام أمر صرف جديد للمريض ${patient.name} (${patient.id})`
            : `📲 Pharmacy Dept: Transmitted prescription dispatch order for ${patient.name} (${patient.id}).`
        );
      } else if (status === "BillingPending") {
        triggerToast(
          language === "ar"
            ? `📲 تحديث المحاسبة: تم مزامنة القيود المحاسبية للمريض ${patient.name} (${patient.id})`
            : `📲 Accounting Dept: Clinical billing accrual verified & synced in General Ledger for ${patient.name} (${patient.id}).`
        );
      }
    };

    window.addEventListener("clinical-patient-status-updated", handleClinicalUpdate);
    return () => {
      window.removeEventListener("clinical-patient-status-updated", handleClinicalUpdate);
    };
  }, [language]);

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
  const [newPharmacyCategory, setNewPharmacyCategory] = useState<PharmacyMeds["category"]>("Medicine");
  const [newPharmacyUnit, setNewPharmacyUnit] = useState("piece");
  const [newPharmacyPrice, setNewPharmacyPrice] = useState(0);
  const [newPharmacyCost, setNewPharmacyCost] = useState(0);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editPharmacyName, setEditPharmacyName] = useState("");
  const [editPharmacyCode, setEditPharmacyCode] = useState("");
  const [editPharmacyClass, setEditPharmacyClass] = useState("");
  const [editPharmacyStock, setEditPharmacyStock] = useState(0);
  const [editPharmacyCategory, setEditPharmacyCategory] = useState<PharmacyMeds["category"]>("Medicine");
  const [editPharmacyUnit, setEditPharmacyUnit] = useState("piece");
  const [editPharmacyPrice, setEditPharmacyPrice] = useState(0);
  const [editPharmacyCost, setEditPharmacyCost] = useState(0);

  // Form validation error states
  const [addFormErrors, setAddFormErrors] = useState<Record<string, boolean>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, boolean>>({});

  // Accounting "Add Entry" modal state
  const [accEntryNarrative, setAccEntryNarrative] = useState("");
  const [accEntryDate, setAccEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [accEntryCategory, setAccEntryCategory] = useState<TransactionJournal["category"]>("Expenditure");
  const [accEntryDebitAccount, setAccEntryDebitAccount] = useState("");
  const [accEntryDebitAmount, setAccEntryDebitAmount] = useState(0);
  const [accEntryCreditAccount, setAccEntryCreditAccount] = useState("");
  const [accEntryCreditAmount, setAccEntryCreditAmount] = useState(0);
  const [accEntryErrors, setAccEntryErrors] = useState<Record<string, boolean>>({});
  const [accEntryCostCenter, setAccEntryCostCenter] = useState<string>("");

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
    costPrice: true,
    category: true,
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
      const errors: Record<string, boolean> = {};
      if (!newPharmacyName.trim()) errors.name = true;
      if (!newPharmacyCode.trim()) errors.code = true;
      if (!newPharmacyClass.trim()) errors.drugClass = true;
      if (!newPharmacyUnit.trim()) errors.unit = true;
      if (!newPharmacyCategory.trim()) errors.category = true;
      if (!newPharmacyStock || Number(newPharmacyStock) < 1) errors.stock = true;
      if (!newPharmacyPrice || Number(newPharmacyPrice) <= 0) errors.price = true;
      if (!newPharmacyCost || Number(newPharmacyCost) <= 0) errors.costPrice = true;
      setAddFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      const newMed: PharmacyMeds = {
        id: `PH-0${pharmatechStock.length + 1}`,
        name: newPharmacyName.trim(),
        catalogCode: newPharmacyCode.trim(),
        drugClass: newPharmacyClass,
        isChemical: newPharmacyCategory === "Medicine",
        stock: Number(newPharmacyStock) || 1,
        unit: newPharmacyUnit,
        pricePerUnit: Number(newPharmacyPrice) || 0,
        category: newPharmacyCategory,
        costPrice: Number(newPharmacyCost) || 0
      };
      setPharmatechStock(prev => [...prev, newMed]);

    const purchaseEntry: TransactionJournal = {
      id: `JE-PH-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString(),
      narrative: `Pharmacy stock purchase: ${newPharmacyName.trim()} — Cost: $${Number(newPharmacyCost).toFixed(2)}`,
      category: "Expenditure",
      debit: Number(newPharmacyCost),
      credit: Number(newPharmacyCost),
      wallet: "Main Safe",
      verifiedBy: "System (Auto-logged)",
      debitAccountCode: "ACC-5110-EXP-SUPPLIES",
      creditAccountCode: "ACC-1110-CASH",
      costCenter: "PHARMACY"
    };
      setAccountingJournal(prev => [purchaseEntry, ...prev]);

      triggerToast(language === "ar" ? "تمت إضافة العنصر بنجاح" : "Item successfully added to stock.");
      setShowAddModal(false);
      setAddFormErrors({});
      setNewPharmacyName("");
      setNewPharmacyCode("");
      setNewPharmacyClass("");
      setNewPharmacyStock(100);
      setNewPharmacyCategory("Medicine");
      setNewPharmacyUnit("piece");
      setNewPharmacyPrice(0);
      setNewPharmacyCost(0);
    } else {
      triggerToast(language === "ar" ? "وظيفة الإضافة متاحة للصيدلية حالياً" : "Quick Add is customized for pharmacy stock sheets.");
      setShowAddModal(false);
    }
  };

  const openEditModal = (id: string) => {
    const item = pharmatechStock.find(m => m.id === id);
    if (!item) return;
    setEditItemId(item.id);
    setEditPharmacyName(item.name);
    setEditPharmacyCode(item.catalogCode);
    setEditPharmacyClass(item.drugClass);
    setEditPharmacyStock(item.stock);
    setEditPharmacyCategory(item.category);
    setEditPharmacyUnit(item.unit);
    setEditPharmacyPrice(item.pricePerUnit);
    setEditPharmacyCost(item.costPrice);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (!editItemId) return;
    const errors: Record<string, boolean> = {};
    if (!editPharmacyName.trim()) errors.name = true;
    if (!editPharmacyCode.trim()) errors.code = true;
    if (!editPharmacyClass.trim()) errors.drugClass = true;
    if (!editPharmacyUnit.trim()) errors.unit = true;
    if (!editPharmacyCategory.trim()) errors.category = true;
    if (!editPharmacyStock || Number(editPharmacyStock) < 0) errors.stock = true;
    if (!editPharmacyPrice || Number(editPharmacyPrice) <= 0) errors.price = true;
    if (!editPharmacyCost || Number(editPharmacyCost) <= 0) errors.costPrice = true;
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPharmatechStock(prev => prev.map(item =>
      item.id === editItemId ? {
        ...item,
        name: editPharmacyName.trim(),
        catalogCode: editPharmacyCode.trim(),
        drugClass: editPharmacyClass,
        stock: Number(editPharmacyStock) || 0,
        unit: editPharmacyUnit,
        pricePerUnit: Number(editPharmacyPrice) || 0,
        category: editPharmacyCategory,
        costPrice: Number(editPharmacyCost) || 0,
        isChemical: editPharmacyCategory === "Medicine"
      } : item
    ));
    triggerToast(language === "ar" ? "تم حفظ التعديلات" : "Changes saved successfully.");
    setShowEditModal(false);
    setEditFormErrors({});
    setEditItemId(null);
  };

  const handlePostAccountingEntry = () => {
    const errors: Record<string, boolean> = {};
    if (!accEntryNarrative.trim()) errors.narrative = true;
    if (!accEntryDate.trim()) errors.date = true;
    if (!accEntryDebitAccount) errors.debitAccount = true;
    if (!accEntryDebitAmount || Number(accEntryDebitAmount) <= 0) errors.debitAmount = true;
    if (!accEntryCreditAccount) errors.creditAccount = true;
    if (!accEntryCreditAmount || Number(accEntryCreditAmount) <= 0) errors.creditAmount = true;
    if (Number(accEntryDebitAmount) !== Number(accEntryCreditAmount)) errors.unbalanced = true;
    if (!accEntryCostCenter) errors.costCenter = true;
    setAccEntryErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Update chart of accounts balances
    setChartOfAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      if (acc.code === accEntryDebitAccount) {
        balance += Number(accEntryDebitAmount);
      }
      if (acc.code === accEntryCreditAccount) {
        balance -= Number(accEntryCreditAmount);
      }
      return { ...acc, balance };
    }));

    const je: TransactionJournal = {
      id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: accEntryDate,
      narrative: accEntryNarrative.trim(),
      category: accEntryCategory,
      debit: Number(accEntryDebitAmount),
      credit: Number(accEntryCreditAmount),
      wallet: accEntryCategory === "Revenue" || accEntryCategory === "InsuranceClaim" ? "Main Safe" : "Standard Chartered Bank",
      verifiedBy: "Ebenezer CFO (" + activeRole + ")",
      debitAccountCode: accEntryDebitAccount,
      creditAccountCode: accEntryCreditAccount,
      costCenter: accEntryCostCenter as TransactionJournal["costCenter"]
    };
    setAccountingJournal(prev => [je, ...prev]);
    triggerToast(language === "ar" ? "تم ترحيل القيد بنجاح" : "Journal entry posted successfully.");
    setShowAddModal(false);
    setAccEntryErrors({});
    setAccEntryNarrative("");
    setAccEntryDate(new Date().toISOString().split("T")[0]);
    setAccEntryCategory("Expenditure");
    setAccEntryDebitAccount("");
    setAccEntryDebitAmount(0);
    setAccEntryCreditAccount("");
    setAccEntryCreditAmount(0);
    setAccEntryCostCenter("");
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
    }
    setCheckedIds([]);
    triggerToast(language === "ar" ? "تم تصفية المخزون المحدد بنجاح" : "Bulk audited selected items as zero write-off.");
  };

  const handleBulkReorder = () => {
    if (appType === "pharmacy") {
      setPharmatechStock(prev => prev.map(med => checkedIds.includes(med.id) ? { ...med, stock: med.stock + 100 } : med));
    }
    setCheckedIds([]);
    triggerToast(language === "ar" ? "تم إرسال طلب إعادة الطلب الفوري" : "Dispatched bulk reorder claims directly to suppliers.");
  };

  // Filter lists based on Search & Chip active filters
  const processedData = useMemo(() => {
    if (appType === "pharmacy") {
      return pharmatechStock.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || med.catalogCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || med.category === activeFilter;
        return matchesSearch && matchesTab;
      });
    } else if (appType === "optics") {
      return opticsCatalog.filter(opt => {
        const matchesSearch = opt.brand.toLowerCase().includes(searchQuery.toLowerCase()) || opt.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "RayBan" && opt.brand === "Ray-Ban") || (activeFilter === "Silhouette" && opt.brand === "Silhouette");
        return matchesSearch && matchesTab;
      });
    } else if (appType === "hr") {
      return employees.filter(emp => {
        const query = searchQuery.toLowerCase();
        return `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) || emp.id.toLowerCase().includes(query) || emp.jobTitle.toLowerCase().includes(query);
      });
    } else {
      return accountingJournal.filter(txn => {
        const matchesSearch = txn.narrative.toLowerCase().includes(searchQuery.toLowerCase()) || txn.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === "All" || (activeFilter === "Sales" && txn.category === "Revenue") || (activeFilter === "Expenses" && (txn.category === "Expenditure" || txn.category === "Payroll" as any));
        
        let matchesCostCenter = true;
        if (accountingCostCenter !== "All") {
          if (txn.costCenter) {
            matchesCostCenter = txn.costCenter === accountingCostCenter;
          } else {
            const narr = txn.narrative.toLowerCase();
            if (accountingCostCenter === "HOSPITAL") {
              matchesCostCenter = narr.includes("hospital") || narr.includes("clinic") || narr.includes("odontogram") || narr.includes("caries") || narr.includes("teeth") || narr.includes("extraction") || narr.includes("scaling") || narr.includes("root canal") || narr.includes("internal medicine") || narr.includes("ophthalmology") || narr.includes("pediatrics") || narr.includes("dental");
              if (activeHospitalSubTab !== "All") {
                matchesCostCenter = matchesCostCenter && narr.includes(activeHospitalSubTab.toLowerCase());
              }
            } else if (accountingCostCenter === "PHARMACY") {
              matchesCostCenter = narr.includes("pharmacy") || narr.includes("pos") || narr.includes("rx") || narr.includes("med");
            } else if (accountingCostCenter === "WAREHOUSE") {
              matchesCostCenter = narr.includes("warehouse") || narr.includes("shipment") || narr.includes("reorder") || narr.includes("inflow") || narr.includes("destination");
            } else if (accountingCostCenter === "OPTICS") {
              matchesCostCenter = narr.includes("optical") || narr.includes("optics") || narr.includes("eyewear") || narr.includes("rayban") || narr.includes("lens");
            } else if (accountingCostCenter === "EMPLOYEES") {
              matchesCostCenter = narr.includes("payroll") || narr.includes("salary") || narr.includes("employee") || narr.includes("payout");
            }
          }
        }
        return matchesSearch && matchesTab && matchesCostCenter;
      });
    }
  }, [appType, pharmatechStock, opticsCatalog, accountingJournal, searchQuery, activeFilter, accountingCostCenter, activeHospitalSubTab, employees]);

  // Dynamic values representing the row that clicks open the RHS detailed drawer
  const activeDetailRow = useMemo(() => {
    if (!selectedRowId) return null;
    if (appType === "pharmacy") return pharmatechStock.find(m => m.id === selectedRowId) || null;
    if (appType === "optics") return opticsCatalog.find(o => o.id === selectedRowId) || null;
    if (appType === "hr") return employees.find(e => e.id === selectedRowId) || null;
    return accountingJournal.find(a => a.id === selectedRowId) || null;
  }, [selectedRowId, appType, pharmatechStock, opticsCatalog, accountingJournal, employees]);

  if (appType === "reception") {
    return (
      <FrontDeskDashboard
        language={language}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        patients={patients}
        onAddPatient={onAddPatient}
        onUpdatePatient={onUpdatePatient}
        employees={employees}
        accountingJournal={accountingJournal}
        setAccountingJournal={setAccountingJournal}
        onClose={onClose}
        unreadMessagesCount={unreadMessagesCount}
      />
    );
  }

  if (appType === "hr") {
    return (
      <HrSpecialistDashboard
        language={language}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        employees={employees}
        setEmployees={setEmployees}
        onSalaryDisbursed={(newLedger) => {
          setAccountingJournal(prev => [newLedger, ...prev]);
          triggerToast(language === "ar" ? "تم صرف راتب الموظف وتسجيله في المالية!" : "Employee payroll disbursement successfully ledger-synced!");
        }}
        onClose={onClose}
        unreadMessagesCount={unreadMessagesCount}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--clr-bg-main)] z-50 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#4F46E5] dark:bg-[#0F1E46] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-mono flex items-center gap-2 border border-indigo-300 dark:border-[#2BBFFF]/40 animate-bounce">
          <CircleDot className="w-4 h-4 text-white dark:text-[#2BBFFF] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar - Now cohesive with both light mode (eye-safe cream) and dark mode (clinical navy) */}
      <div className="bg-white dark:bg-[#0E1019] text-[#0F172A] dark:text-[#F8FAFC] px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#EAE6DF] dark:border-[#2BBFFF]/10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4F46E5] dark:bg-[#2BBFFF] text-white dark:text-[#0F1E46] rounded-xl flex items-center justify-center font-bold shadow-md shadow-indigo-500/10 dark:shadow-none transition-all">
            {appType === "pharmacy" && <Pill className="w-6 h-6" />}
            {appType === "optics" && <Glasses className="w-6 h-6 text-amber-500 dark:text-[#0F1E46]" />}
            {appType === "accounting" && <Coins className="w-6 h-6 text-yellow-500 dark:text-[#0F1E46]" />}
          </div>
          <div>
            <div className="font-extrabold tracking-wide text-sm md:text-base flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              {appType === "pharmacy" && (language === "ar" ? "الصيدلية" : "Pharmacy")}
              {appType === "optics" && (language === "ar" ? "متجر البصريات" : "OPTICS Store")}
              {appType === "accounting" && (language === "ar" ? "المحاسبة" : "Accounting")}
              <span className="text-[10px] bg-indigo-50 dark:bg-[#2BBFFF]/20 text-[#4F46E5] dark:text-[#2BBFFF] border border-indigo-200 dark:border-[#2BBFFF]/45 font-mono px-2 py-0.5 rounded uppercase font-extrabold animate-pulse">
                AL JAWARIH ERP ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-[#D8D5C8] opacity-90 dark:opacity-80 mt-0.5">
              Secure double-entry transactional sheets | Terminal verified via cloud HS256 algorithm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clinical Messages Icon Button with unread messages count */}
          <button
            type="button"
            onClick={() => {
              const event = new CustomEvent("open-clinical-messages");
              window.dispatchEvent(event);
            }}
            className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-[#2BBFFF] hover:bg-neutral-100 dark:hover:bg-white/10 shrink-0 transition flex items-center justify-center border border-transparent hover:border-neutral-200/50 dark:hover:border-[#2BBFFF]/20 cursor-pointer"
            title={language === "ar" ? "الشبكة الفورية للرسائل السريرية" : "Active Encounters Messenger Context"}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg border border-white dark:border-neutral-900 animate-pulse animate-duration-1000">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {(() => {
            const isRoleLocked = (appType === "accounting" && activeRole === "accountant") ||
                                 (appType === "pharmacy" && activeRole === "pharmacist") ||
                                 ((appType as any) === "reception" && activeRole === "receptionist") ||
                                 ((appType as any) === "hr" && activeRole === "hr_manager");

            if (isRoleLocked) {
              return (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-955/40 border border-amber-200/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-xl font-mono">
                    <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    Terminal Locked to Role
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveRole) {
                        setActiveRole("doctor");
                      }
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-black uppercase tracking-tight rounded-xl transition flex items-center gap-1.5 shrink-0"
                    title="Sign out of locked terminal session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              );
            }

            return (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 dark:text-[#D8D5C8] hover:text-[#0F172A] dark:hover:text-white transition"
                title="Close App"
              >
                <X className="w-6 h-6" />
              </button>
            );
          })()}
        </div>
      </div>

      {/* Ribbon Control Panel */}
      <div className="bg-[var(--clr-bg-main)] border-b border-[var(--clr-border-light)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        
        {/* Left Side Controls: Search + Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === "ar" ? "ابحث في السجل..." : "Quick search parameters..."}
              className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] pl-9 pr-4 py-1.5 rounded-lg text-xs font-medium text-[var(--clr-text-title)]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dynamic Interactive Session Indicators based on Active App */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {appType === "pharmacy" && (
              <div className="flex items-center">
                <span className="text-[10.5px] bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-450 border border-emerald-150 dark:border-emerald-900/40 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase tracking-wider font-semibold">
                  💊 Pharmacy Lockups Synced
                </span>
              </div>
            )}
            {appType === "optics" && (
              <div className="flex items-center">
                <span className="text-[10.5px] bg-blue-50 dark:bg-blue-955/20 text-blue-750 dark:text-[#2BBFFF] border border-blue-150 dark:border-blue-900/40 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase tracking-wider font-semibold">
                  👁️ Ophthalmic Showroom Active
                </span>
              </div>
            )}
            {appType === "accounting" && (
              <div className="flex items-center">
                <span className="text-[10.5px] bg-indigo-50 dark:bg-indigo-955/20 text-indigo-750 dark:text-[#2BBFFF] border border-indigo-150 dark:border-indigo-900/40 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase tracking-wider font-semibold">
                  🏦 Ledger Session Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Controls: Actions, Column Pickers, Density Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Density 3-mode selector segment */}
          <div className="bg-[var(--clr-bg-main)] rounded-lg p-1 flex items-center border border-[var(--clr-border-light)]">
            {(["comfortable", "compact", "tiny"] as const).map(dt => (
              <button
                key={dt}
                onClick={() => setDensity(dt)}
                className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition ${
                  density === dt ? "bg-[var(--clr-bg-card)] text-[#0F1E46] dark:text-[#2BBFFF] shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-800"
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
              className="p-1.5 bg-[var(--clr-bg-card)] text-[var(--clr-text-title)] rounded-lg border border-[var(--clr-border-light)] flex items-center gap-1 hover:bg-[var(--clr-bg-main)] text-xs font-bold transition"
            >
              <Columns className="w-4 h-4 text-[#2BBFFF]" />
              <span className="hidden md:inline">{language === "ar" ? "تعديل الأعمدة" : "Column Selector"}</span>
            </button>
            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl shadow-2xl p-3 z-10 space-y-2 text-xs">
                <div className="font-bold border-b border-[var(--clr-border-light)] pb-1.5 mb-2 text-[#0F1E46] dark:text-[#2BBFFF] uppercase text-[10px]">
                  Visible Metadata Sheets
                </div>
                {Object.keys(visibleColumns).map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-200 hover:bg-[var(--clr-bg-main)] p-1 rounded">
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
              className="p-1.5 bg-[var(--clr-bg-card)] text-[#008000] rounded-lg border border-[var(--clr-border-light)] flex items-center gap-1 hover:bg-[var(--clr-bg-main)] text-xs font-bold transition"
              title="CSV Download"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden leading-none lg:inline">CSV</span>
            </button>
            <button
              onClick={() => triggerExport("json")}
              className="p-1.5 bg-[var(--clr-bg-card)] text-[#2BBFFF] rounded-lg border border-[var(--clr-border-light)] flex items-center gap-1 hover:bg-[var(--clr-bg-main)] text-xs font-bold transition"
              title="JSON Download"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden leading-none lg:inline">JSON</span>
            </button>
          </div>

          {/* Print entire spreadsheet option */}
          <button
            onClick={() => window.print()}
            className="p-1.5 bg-[var(--clr-bg-card)] text-neutral-850 dark:text-neutral-200 rounded-lg border border-[var(--clr-border-light)] flex items-center gap-1 hover:bg-[var(--clr-bg-main)] text-xs font-bold transition"
          >
            <Printer className="w-4 h-4 text-[#FF841A]" />
            <span className="hidden md:inline">{language === "ar" ? "طباعة" : "Print"}</span>
          </button>

          {/* Add Record trigger button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 bg-[#4F46E5] hover:bg-neutral-800 text-white dark:bg-[#0F1E46] dark:hover:bg-[#1C2642] dark:border dark:border-[#2BBFFF]/30 text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-sm font-semibold active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white dark:text-[#2BBFFF]" />
            <span>{language === "ar" ? "إضافة" : "Add Sheet"}</span>
          </button>
        </div>
      </div>

       {/* Main Grid spreadsheet space */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto p-4 bg-[#FBFBF9] dark:bg-[#0B0E14]">
          {appType === "accounting" ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* === LEVEL 1, 2, 3 COHERENT NAV PARADIGM === */}
              <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl space-y-4 shadow-sm" id="accounting_level_nav_wrapper">
                
                {/* LEVEL 1: Context Dropdown & Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dashed border-[#EAE6DF] dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Stylized Dropdown Switcher */}
                    <div className="relative group">
                      <select
                        id="accounting_cost_center_dropdown"
                        value={accountingCostCenter}
                        onChange={(e) => {
                          setAccountingCostCenter(e.target.value);
                          triggerToast(`Switched Cost Center: ${e.target.value}`);
                        }}
                        className="appearance-none pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-neutral-150/70"
                      >
                        <option value="All">💼 Cost Center: All</option>
                        <option value="HOSPITAL">🏥 Cost Center: Hospital</option>
                        <option value="PHARMACY">💊 Cost Center: Pharmacy</option>
                        <option value="WAREHOUSE">📦 Cost Center: Warehouse</option>
                        <option value="OPTICS">👓 Cost Center: Optics</option>
                        <option value="EMPLOYEES">👥 Cost Center: Employees</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <span className="text-xs font-serif italic text-neutral-400 dark:text-neutral-500">
                      ★ AL JAWARIH AUTOMATED FINANCIAL LEDGERS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-neutral-800 font-mono">
                      REF: <strong>AJ-ACC-EHR</strong>
                    </span>
                  </div>
                </div>

                {/* LEVEL 2: Flat Horizontal Navigation Tab Bar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-[#EAE6DF] dark:border-neutral-800/60 pb-1" id="accounting_level_2_tabs">
                  {[
                    { id: "dashboard", labelEn: "Overview & Vitals", labelAr: "الحالة المالية الفورية" },
                    { id: "coa", labelEn: "Chart of Accounts", labelAr: "شجرة الحسابات" },
                    { id: "ledger", labelEn: "General Ledger", labelAr: "دفتر اليومية" },
                    { id: "billing", labelEn: "Patient Billing", labelAr: "فوترة المرضى" },
                    { id: "insurance", labelEn: "Insurance Claims", labelAr: "مطالبات التأمينات" },
                    { id: "ap", labelEn: "Accounts Payable", labelAr: "مستحقات الموردين" },
                    { id: "depreciation", labelEn: "Depreciation Engine", labelAr: "إهلاك الأصول" },
                    { id: "integrations", labelEn: "Automation Routing", labelAr: "أنابيب الأتمتة" },
                  ].map(tab => {
                    const isActive = accountingTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`accounting_tab_${tab.id}`}
                        onClick={() => {
                          setAccountingTab(tab.id as any);
                          triggerToast(`Browsing ${tab.labelEn}`);
                        }}
                        className={`px-4 py-2 text-xs font-semibold relative transition-all duration-300 active:scale-[0.98] ${
                          isActive
                            ? "text-[#4F46E5] dark:text-[#2BBFFF] font-bold"
                            : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                      >
                        <span>{language === "ar" ? tab.labelAr : tab.labelEn}</span>
                        {isActive && (
                          <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#4F46E5] dark:bg-[#2BBFFF] rounded-full animate-slideIn" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* LEVEL 3: Slide Segmented Filter & Live Auditor Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800/55" id="accounting_level_3_filters">
                  
                  {/* Sliding Segmented control for activeFilter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 mr-2 uppercase">
                      Local Register:
                    </span>
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center border border-neutral-200 dark:border-neutral-850 shadow-inner">
                      {[
                        { id: "All", labelEn: "Inflows & Outflows", labelAr: "السجل الشامل" },
                        { id: "Sales", labelEn: "Inflows Only", labelAr: "المقبوضات فقط" },
                        { id: "Expenses", labelEn: "Outflows Only", labelAr: "المدفوعات فقط" }
                      ].map(seg => {
                        const isSegActive = activeFilter === seg.id;
                        return (
                          <button
                            key={seg.id}
                            id={`active_filter_${seg.id}`}
                            onClick={() => {
                              setActiveFilter(seg.id);
                              triggerToast(`Filtered: ${seg.labelEn}`);
                            }}
                            className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all duration-200 ${
                              isSegActive 
                                ? "bg-white dark:bg-neutral-900 text-indigo-700 dark:text-[#2BBFFF] shadow-md border border-neutral-200/50 dark:border-neutral-800" 
                                : "text-neutral-500 hover:text-neutral-700"
                            }`}
                          >
                            {language === "ar" ? seg.labelAr : seg.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right side discrete GAAP toggle with gear */}
                  <div className="flex items-center gap-2">
                    {/* GAAP Toggle switch */}
                    <button
                      id="gaap_compliance_toggle"
                      type="button"
                      onClick={() => {
                        setGaapComplianceAudited(p => !p);
                        triggerToast(gaapComplianceAudited ? "Deactivated continuous GAAP checks" : "Auditor continuous audit shield enabled");
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all duration-300 ${
                        gaapComplianceAudited
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold"
                          : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-400"
                      }`}
                    >
                      <span>⚙️ GAAP AUDIT COMPLIANCE</span>
                      <span className={`w-2 h-2 rounded-full ${gaapComplianceAudited ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
                    </button>
                  </div>

                </div>

                {/* Sub-Specialty options if Cost Center: HOSPITAL is active */}
                {accountingCostCenter === "HOSPITAL" && (
                  <div className="p-2 bg-indigo-50/25 dark:bg-indigo-950/10 rounded-xl border border-dashed border-[#4F46E5]/15 flex items-center gap-2 animate-fadeIn">
                    <span className="text-[10px] font-mono text-[#4F46E5] dark:text-[#2BBFFF] uppercase tracking-wider font-bold">
                      Specialties Pipeline Router:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {["All", "Internal Medicine", "Ophthalmology", "Pediatrics", "Dental"].map(sub => (
                        <button
                          key={sub}
                          id={`hospital_subtab_${sub.replace(" ", "_")}`}
                          onClick={() => {
                            setActiveHospitalSubTab(sub);
                            if (sub === "Dental" && !accountingJournal.some(j => j.narrative.includes("Odontogram"))) {
                              const dentEntry: TransactionJournal = {
                                id: `JE-D881`,
                                timestamp: "11:24:00",
                                narrative: "Sync dental billing from Odontogram ledger: Tooth #34 restoration & scaling",
                                category: "Revenue",
                                debit: 350.0,
                                credit: 0,
                                wallet: "Insurance Receivables",
                                verifiedBy: "Dr. Sterling (Dental Chief)",
                                costCenter: "HOSPITAL"
                              };
                              setAccountingJournal(prev => [dentEntry, ...prev]);
                              triggerToast("Compiled Odontogram procedure billing!");
                            }
                          }}
                          className={`px-2.5 py-1 text-[10px] rounded-lg font-black uppercase transition-all duration-150 ${
                            activeHospitalSubTab === sub 
                              ? "bg-indigo-650 text-white shadow-xs" 
                              : "bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800 border border-[#EAE6DF]"
                          }`}
                        >
                          ✙ {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* ROUTED CONTENT VIEWS */}
                  {/* A. FINANCIAL VITAL SIGNS (EXECUTIVE DASHBOARD) */}
                  {accountingTab === "dashboard" && (
                <div className="space-y-4 animate-in fade-in duration-200 font-sans">
                  {/* Real-time KPI Tiles (Grid of 3) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* KPI 1: Net Daily Liquidity */}
                    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] hover:border-[#4F46E5]/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                          {language === "ar" ? "صافي السيولة النقدية اليومية" : "Net Daily Liquidity"}
                        </span>
                        <div className="p-1 px-2 text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full font-bold uppercase font-mono">
                          {language === "ar" ? "نشط" : "Secure"}
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-[#0F172A] dark:text-white font-mono tracking-tight">
                        ${(
                          (chartOfAccounts.find(c => c.code === "ACC-1110-CASH")?.balance || 0) +
                          (chartOfAccounts.find(c => c.code === "ACC-1120-BANK")?.balance || 0)
                        ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-2 font-mono leading-relaxed">
                        • Reception Cash Safe: <span className="font-bold text-neutral-600 dark:text-neutral-300">${(chartOfAccounts.find(c => c.code === "ACC-1110-CASH")?.balance || 0).toLocaleString()}</span><br/>
                        • connected hospital bank accounts: <span className="font-bold text-neutral-600 dark:text-neutral-300">${(chartOfAccounts.find(c => c.code === "ACC-1120-BANK")?.balance || 0).toLocaleString()}</span>
                      </p>
                    </div>

                    {/* KPI 2: AR Aging Buckets */}
                    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] hover:border-[#4F46E5]/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                          {language === "ar" ? "شرائح تعمير الذمم المدينة (AR)" : "Accounts Receivable (AR) Aging"}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/35 px-1.5 py-0.5 rounded uppercase font-mono">
                          Outstandings
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-1.5">
                        {[
                          { label: "0-30 days", val: "$45,200", pct: 60, col: "bg-emerald-500" },
                          { label: "31-60 days", val: "$28,500", pct: 30, col: "bg-amber-400" },
                          { label: "61-90 days", val: "$12,400", pct: 8, col: "bg-orange-500" },
                          { label: "Over 90 days", val: "$8,100", pct: 2, col: "bg-rose-500" },
                        ].map(arr => (
                          <div key={arr.label} className="text-xs">
                            <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-0.5">
                              <span>{arr.label}</span>
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">{arr.val} ({arr.pct}%)</span>
                            </div>
                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                              <div className={`${arr.col} h-full rounded-full`} style={{ width: `${arr.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KPI 3: Insurance Clearing Rate */}
                    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] hover:border-[#4F46E5]/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                          {language === "ar" ? "معدل قبول وقبول مطالبات التأمين" : "Insurance Claims Clearing"}
                        </span>
                        <div className="p-1 px-2 text-[9px] bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full font-bold uppercase font-mono">
                          {language === "ar" ? "مؤيد" : "Verified"}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 py-1">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-dashed border-amber-400 animate-[spin_20s_linear_infinite]">
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight absolute">
                            •••
                          </span>
                        </div>
                        <div>
                          <div className="text-3xl font-black text-neutral-800 dark:text-neutral-100 font-mono">94.62%</div>
                          <p className="text-[10.5px] text-neutral-400 leading-normal mt-1">
                            {language === "ar" 
                              ? "تم قبول ٢٢٨ من أصل ٢٤١ قيد مطالبة فواتير معتمد هذا الشهر عبر نظام المخدم المركزي دون أي رفض قطعي."
                              : "228 of 241 claims submitted electronically have passed first-turn validation checks on the clearhouse clearing pipeline."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Revenue Splitter Chart */}
                  <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono mb-4">
                      💼 {language === "ar" ? "مقسم الإيرادات التشغيلية لليوم" : "OPERATIONAL REVENUE SPLITTER"}
                    </span>

                    {/* Multi-colored stacked bar and legends, calculating live! */}
                    {(() => {
                      const consultRev = chartOfAccounts.find(c => c.code === "ACC-4100-REV-CONSULT")?.balance || 0;
                      const surgeryRev = chartOfAccounts.find(c => c.code === "ACC-4200-REV-SURGERY")?.balance || 0;
                      const pharmacyRev = chartOfAccounts.find(c => c.code === "ACC-4300-REV-PHARM")?.balance || 0;
                      const opticalRev = chartOfAccounts.find(c => c.code === "ACC-4400-REV-OPTICAL")?.balance || 0;
                      const totalRev = consultRev + surgeryRev + pharmacyRev + opticalRev || 1;

                      const pctConsult = (consultRev / totalRev) * 100;
                      const pctSurgery = (surgeryRev / totalRev) * 100;
                      const pctPharm = (pharmacyRev / totalRev) * 100;
                      const pctOptics = (opticalRev / totalRev) * 100;

                      return (
                        <div className="space-y-4">
                          {/* Visual Stacked representation */}
                          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-6 rounded-lg flex overflow-hidden shadow-inner border border-neutral-300 dark:border-neutral-700">
                            <div className="bg-indigo-500 h-full cursor-help transition-all duration-300" style={{ width: `${pctConsult}%` }} title={`Consultations: ${pctConsult.toFixed(1)}%`} />
                            <div className="bg-amber-500 h-full cursor-help transition-all duration-300" style={{ width: `${pctSurgery}%` }} title={`Surgeries: ${pctSurgery.toFixed(1)}%`} />
                            <div className="bg-emerald-500 h-full cursor-help transition-all duration-300" style={{ width: `${pctPharm}%` }} title={`Pharmacy: ${pctPharm.toFixed(1)}%`} />
                            <div className="bg-sky-500 h-full cursor-help transition-all duration-300" style={{ width: `${pctOptics}%` }} title={`Optical POS: ${pctOptics.toFixed(1)}%`} />
                          </div>

                          {/* Legends Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/35 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 capitalize">
                                  {language === "ar" ? "كشوفات وتخصصات العيادة" : "Clinical Consultations"}
                                </div>
                                <div className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-100">${consultRev.toLocaleString()}</div>
                              </div>
                              <span className="text-xs font-bold text-indigo-500 font-mono">{pctConsult.toFixed(1)}%</span>
                            </div>

                            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-900/35 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 capitalize">
                                  {language === "ar" ? "عمليات غرفة العمليات" : "Surgical Theater Fees"}
                                </div>
                                <div className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-100">${surgeryRev.toLocaleString()}</div>
                              </div>
                              <span className="text-xs font-bold text-amber-500 font-mono">{pctSurgery.toFixed(1)}%</span>
                            </div>

                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/35 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                                  {language === "ar" ? "صرف وبوابات الصيدلية" : "Pharmacy Dispensary"}
                                </div>
                                <div className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-100">${pharmacyRev.toLocaleString()}</div>
                              </div>
                              <span className="text-xs font-bold text-emerald-500 font-mono">{pctPharm.toFixed(1)}%</span>
                            </div>

                            <div className="p-3 bg-sky-50/50 dark:bg-sky-950/25 border border-sky-100 dark:border-sky-900/35 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 capitalize">
                                  {language === "ar" ? "المعرض ومبيعات العدسات" : "Optical Shop POS"}
                                </div>
                                <div className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-100">${opticalRev.toLocaleString()}</div>
                              </div>
                              <span className="text-xs font-bold text-sky-500 font-mono">{pctOptics.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Accountant's Action Queue Authorization Inbox */}
                  <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono mb-4">
                      🔔 {language === "ar" ? "صندوق الإجراءات والاعتمادات المعلقة" : "THE ACCOUNTANT'S AUTHORIZATION QUEUE (ACTION INBOX)"}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Action item 1: AP Supplier Match Approve */}
                      <div className="bg-[#FBFBF9] dark:bg-[#181C28] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-[#2BBFFF] bg-indigo-50 dark:bg-indigo-950/40 p-1.5 px-2 rounded uppercase tracking-wider">
                              Vendor Procurement Match
                            </span>
                            <span className="text-[9px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded font-mono">
                              Awaiting Post
                            </span>
                          </div>
                          <span className="font-sans font-bold text-neutral-800 dark:text-neutral-100 text-sm block leading-tight">
                            Haag-Streit Goldmann Prisms
                          </span>
                          <span className="block text-mono text-neutral-400 text-[10px] mt-1">
                            Ref: VB-2026-901 | PO-OPT-901 ($600.00)
                          </span>
                          <p className="text-[10px] text-neutral-500 leading-normal mt-2">
                            {language === "ar" ? "تم التحقق من مطابقة ٣ حهات: أمر الشراء يطابق مذكرات استلاف المستودع الميدانية وفاتورة المورد." : "Verified Three-Way Match: PO matches Warehouse receiving records and invoice quantities precisely."}
                          </p>
                        </div>

                        {vendorBills.find(b => b.id === "VB-2026-901")?.status === "Awaiting approval" ? (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800">
                            <button
                              onClick={() => {
                                // Double entry: Debit Medical Supplies expense, Credit Accounts Payable liability
                                setChartOfAccounts(prev => prev.map(acc => {
                                  if (acc.code === "ACC-2110-AP") return { ...acc, balance: acc.balance + 600.00 }; // increase AP invoice
                                  if (acc.code === "ACC-5110-EXP-SUPPLIES") return { ...acc, balance: acc.balance + 600.00 }; // expense increase
                                  return acc;
                                }));
                                setVendorBills(prev => prev.map(bill => bill.id === "VB-2026-901" ? { ...bill, status: "Approved & AP Posted", matchedStatus: "Fully Matched (Audit Closed)" } : bill));
                                
                                // Record double entry journal
                                const je: TransactionJournal = {
                                  id: `JE-AP-${Math.floor(1000 + Math.random() * 9000)}`,
                                  timestamp: new Date().toTimeString().split(" ")[0],
                                  narrative: "Auto Match: Approved & Posted invoice VB-2026-901 from Haag-Streit",
                                  category: "Expenditure",
                                  debit: 600,
                                  credit: 600,
                                  wallet: "Standard Chartered Bank",
                                  verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                                  costCenter: "HOSPITAL"
                                };
                                setAccountingJournal(prev => [je, ...prev]);
                                triggerToast("Approved! Ophthalmic supplies debited ($600.00) and AP credited.");
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition uppercase duration-150 active:scale-[0.98] cursor-pointer"
                            >
                              Approve Match & Post AP
                            </button>
                            <button className="bg-neutral-150 text-neutral-600 text-[10px] p-1 px-2.5 rounded-lg transition uppercase">
                              Hold
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-black uppercase text-center font-mono">
                            ✓ Match approved & AP posted in ledger
                          </div>
                        )}
                      </div>

                      {/* Action item 2: Commission Disbursal Trigger */}
                      <div className="bg-[#FBFBF9] dark:bg-[#181C28] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-bold text-violet-600 dark:text-[#2BBFFF] bg-violet-50 dark:bg-violet-950/40 p-1.5 px-2 rounded uppercase tracking-wider">
                              Doctor commission Disbursal
                            </span>
                            <span className="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded font-mono">
                              Payroll Trigger
                            </span>
                          </div>
                          <span className="font-sans font-bold text-neutral-800 dark:text-neutral-100 text-sm block leading-tight">
                            Dr. Alexander Sterling Pay-out
                          </span>
                          <span className="block text-mono text-neutral-400 text-[10px] mt-1">
                            Code: ACC-2120-COMM :: Surgeries Bonus ($1,450.00)
                          </span>
                          <p className="text-[10px] text-neutral-500 leading-normal mt-2">
                            {language === "ar" ? "عمولة معلقة ومصرح بدفعها من جراحات إزالة المياه البيضاء المتخصصة المعتمدة المكتملة." : "Accrued bonus of completed and signed Phacoemulsification clinical cases due to consulting surgeon."}
                          </p>
                        </div>

                        {chartOfAccounts.find(c => c.code === "ACC-2120-COMM-ACCRUED")?.balance > 3000 ? (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800">
                            <button
                              onClick={() => {
                                // Debit Accrued physician bonus liability, credit Bank account
                                setChartOfAccounts(prev => prev.map(acc => {
                                  if (acc.code === "ACC-2120-COMM-ACCRUED") return { ...acc, balance: acc.balance - 1450.00 }; // reduce liability
                                  if (acc.code === "ACC-1120-BANK") return { ...acc, balance: acc.balance - 1450.00 }; // cash outflow
                                  if (acc.code === "ACC-5120-EXP-COMM") return { ...acc, balance: acc.balance + 1450.00 }; // doctor paid commission expense
                                  return acc;
                                }));
                                
                                // Record double entry journal
                                const je: TransactionJournal = {
                                  id: `JE-PAY-${Math.floor(1000 + Math.random() * 9000)}`,
                                  timestamp: new Date().toTimeString().split(" ")[0],
                                  narrative: "Disbursed surgerical commission to Dr. Sterling Alexander (EMP-001)",
                                  category: "Payroll" as any,
                                  debit: 1450,
                                  credit: 1450,
                                  wallet: "Standard Chartered Bank",
                                  verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                                  costCenter: "EMPLOYEES"
                                };
                                setAccountingJournal(prev => [je, ...prev]);
                                triggerToast("Disbursed! Surgeon liability paid out from operating bank ($1,450.00).");
                              }}
                              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition uppercase duration-150 active:scale-[0.98] cursor-pointer"
                            >
                              Disburse Commission Cash
                            </button>
                            <button className="bg-neutral-150 text-neutral-600 text-[10px] p-1 px-2.5 rounded-lg transition uppercase">
                              Hold
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800 text-violet-600 dark:text-violet-400 text-[10.5px] font-black uppercase text-center font-mono">
                            ✓ Paid out and cleared to bank
                          </div>
                        )}
                      </div>

                      {/* Action item 3: Patient refund request */}
                      <div className="bg-[#FBFBF9] dark:bg-[#181C28] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-[#2BBFFF] bg-amber-50 dark:bg-amber-950/40 p-1.5 px-2 rounded uppercase tracking-wider">
                              Patient cancelation refund
                            </span>
                            <span className="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded font-mono">
                              Refund Ticket
                            </span>
                          </div>
                          <span className="font-sans font-bold text-neutral-800 dark:text-neutral-100 text-sm block leading-tight">
                            Spectacles design return claim
                          </span>
                          <span className="block text-mono text-neutral-400 text-[10px] mt-1">
                            Patient: Robert Giles (INV-2026-004)
                          </span>
                          <p className="text-[10px] text-neutral-500 leading-normal mt-2">
                            {language === "ar" ? "طلب استرداد بسبب إلغاء إطار النظارات الطبية المخصصة مسبقاً قبل التصنيع النهائي والتركيب." : "Refund application for custom polarized lenses canceled prior to showroom lens-cutting fabrication."}
                          </p>
                        </div>

                        {patientInvoices.find(v => v.id === "INV-2026-004")?.status !== "Refunded" ? (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800">
                            <button
                              onClick={() => {
                                // Debit Optical revenue, credit Receivables
                                setChartOfAccounts(prev => prev.map(acc => {
                                  if (acc.code === "ACC-4400-REV-OPTICAL") return { ...acc, balance: Math.max(0, acc.balance - 525.00) }; 
                                  return acc;
                                }));
                                setPatientInvoices(prev => prev.map(inv => inv.id === "INV-2026-004" ? { ...inv, status: "Refunded" } : inv));
                                
                                // Record double entry journal
                                const je: TransactionJournal = {
                                  id: `JE-REF-${Math.floor(1000 + Math.random() * 9000)}`,
                                  timestamp: new Date().toTimeString().split(" ")[0],
                                  narrative: "Issued sales return refund for Robert Giles: Spectacles cancellation INV-2026-004",
                                  category: "Expenditure",
                                  debit: 525,
                                  credit: 525,
                                  wallet: "Petty Cash",
                                  verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                                  costCenter: "HOSPITAL"
                                };
                                setAccountingJournal(prev => [je, ...prev]);
                                triggerToast("Approved! Reversing Spectacles revenue line and crediting $525.00.");
                              }}
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition uppercase duration-150 active:scale-[0.98] cursor-pointer"
                            >
                              Approve Refund Card Payout
                            </button>
                            <button className="bg-neutral-150 text-neutral-600 text-[10px] p-1 px-2.5 rounded-lg transition uppercase">
                              Deny
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t border-[#EAE6DF]/60 dark:border-neutral-800 text-amber-650 dark:text-[#FBBF24] text-[10.5px] font-black uppercase text-center font-mono">
                            ✓ Canceled & reverse journal posted
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* B. CHART OF ACCOUNTS (TREE AND DEPOSTING VALIDATOR FORM) */}
              {accountingTab === "coa" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-200">
                  
                  {/* Left: CoA Multi-tier Hierarchy Tree (8 Columns) */}
                  <div className="lg:col-span-7 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                        🏛️ {language === "ar" ? "شجرة الحسابات والدليل المحاسبي" : "GAAP COMPLIANT CHART OF ACCOUNTS (COA)"}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {language === "ar" ? "شجرة حسابات مؤسسية هرمية معتمدة لـ مستشفى الجوارح لطب وجراحة العيون." : "Multi-tier structural tree customized specifically for hospital billing, ophthalmic machines, and medical procurement."}
                      </p>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      {["Assets", "Liabilities", "Equity", "Revenue", "Expenses"].map(cat => {
                        const items = chartOfAccounts.filter(c => c.category === cat);
                        const catSum = items.reduce((sum, current) => sum + current.balance, 0);

                        return (
                          <div key={cat} className="border border-neutral-100 dark:border-neutral-850 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900/60 p-2 px-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                              <span className="font-extrabold text-[#0F1E46] dark:text-[#2BBFFF] uppercase">{cat} (Sub-Ledger Tree)</span>
                              <span className="font-black text-[11px] text-neutral-700 dark:text-neutral-300">
                                Total: ${catSum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="divide-y divide-neutral-50 dark:divide-neutral-900 bg-white dark:bg-neutral-950/20">
                              {items.map(acc => (
                                <div key={acc.code} className="p-2 px-4 hover:bg-[#EEEDE8]/20 dark:hover:bg-neutral-900/10 flex items-start justify-between gap-3 text-[10.5px]">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-[#2BBFFF] font-black px-1.5 py-0.5 rounded">
                                        {acc.code}
                                      </span>
                                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                        {language === "ar" && acc.nameAr ? acc.nameAr : acc.name}
                                      </span>
                                    </div>
                                    <p className="text-[9.5px] text-neutral-400 mt-0.5 leading-tight">{acc.description}</p>
                                  </div>
                                  <div className={`font-black text-right min-w-[80px] ${acc.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Manual Posting Double-Entry Validator Form (5 Columns) */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm text-xs flex flex-col justify-between">
                    <HospitalManualJournalForm
                      chartOfAccounts={chartOfAccounts}
                      onPostJournal={(narrative, category, debitCode, debitAmt, creditCode, creditAmt, docRef) => {
                        // First, evaluate double-entry equality
                        if (Number(debitAmt) !== Number(creditAmt)) {
                          return {
                            success: false,
                            error: `UnbalancedLedgerException: Journal entry failed to balance debits and credits! Debit ($${debitAmt}) does not match Credit ($${creditAmt}). GAAP compliance requires equal postings.`
                          };
                        }

                        // If balanced, perform atomic adjustment inside spreadsheet memory
                        setChartOfAccounts(prev => prev.map(acc => {
                          let balance = acc.balance;
                          
                          // Debit logic:
                          // Assets & Expenses increase with Debit
                          // Liabilities, Equity, Revenue decrease with Debit
                          if (acc.code === debitCode) {
                            if (acc.category === "Assets" || acc.category === "Expenses") {
                              balance += Number(debitAmt);
                            } else {
                              balance -= Number(debitAmt);
                            }
                          }

                          // Credit logic:
                          // Assets & Expenses decrease with Credit
                          // Liabilities, Equity, Revenue increase with Credit
                          if (acc.code === creditCode) {
                            if (acc.category === "Assets" || acc.category === "Expenses") {
                              balance -= Number(creditAmt);
                            } else {
                              balance += Number(creditAmt);
                            }
                          }

                          return { ...acc, balance };
                        }));

                        // Append dynamic transaction to main ledger
                        const je: TransactionJournal = {
                          id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
                          timestamp: new Date().toTimeString().split(" ")[0],
                          narrative: `${narrative} (Doc Ref: ${docRef})`,
                          category: category as any,
                          debit: Number(debitAmt),
                          credit: Number(creditAmt),
                          wallet: category === "Revenue" ? "Main Safe" : "Standard Chartered Bank",
                          verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                          debitAccountCode: debitCode,
                          creditAccountCode: creditCode
                        };
                        setAccountingJournal(prev => [je, ...prev]);

                        triggerToast(`Committed! Balanced Double-Entry Journal verified and successfully executed.`);
                        return { success: true };
                      }}
                    />
                  </div>
                </div>
              )}

              {/* C. GENERAL JOURNAL TABLE SHEETS */}
              {accountingTab === "ledger" && (
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden min-w-[900px] animate-in fade-in duration-200">
                  <div className="bg-[#EEEDE8]/45 dark:bg-neutral-900/60 p-4 border-b border-[#EAE6DF] dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest block font-mono">
                        📖 {language === "ar" ? "قائمة قيود دفتر اليومية العام" : "CHRONOLOGICAL GENERAL LEDGER REGISTERS"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                      <span>{language === "ar" ? "إيرادات نقدية ومصاريف معتمدة" : "Audited double-entry line-transactions"}</span>
                    </div>
                  </div>

                  {processedData.length > 100 && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 font-sans leading-relaxed">
                      {language === "ar" ? (
                        <span>
                          💼 جاري تصفية القيود: معروض أول 100 من أصل <strong>{processedData.length.toLocaleString()}</strong> قيداً مالياً في الزمن الحقيقي. استخدم البحث للتصفية الفورية.
                        </span>
                      ) : (
                        <span>
                          💼 Chronological stream active: displaying top 100 of <strong>{processedData.length.toLocaleString()}</strong> ledger journals in sub-10ms intervals. Use search and cost-center chips to filter instantly.
                        </span>
                      )}
                    </div>
                  )}

                  <table className="w-full text-left border-collapse select-text">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-800 tracking-wider text-neutral-505 font-mono text-[9px] uppercase">
                        <th className="p-3">Journal Token</th>
                        <th className="p-3">Executed Time</th>
                        <th className="p-3">Narrative Profile</th>
                        <th className="p-3 text-right">Debit ($)</th>
                        <th className="p-3 text-right">Credit ($)</th>
                        <th className="p-3">Dr Account</th>
                        <th className="p-3">Cr Account</th>
                        <th className="p-3">Target Safe Wallet</th>
                        <th className="p-3">Verified auditor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-[11.5px] font-mono text-neutral-800 dark:text-neutral-200">
                      {processedData.slice(0, 100).map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          <td className="p-3 text-indigo-600 dark:text-[#2BBFFF] font-bold">{row.id}</td>
                          <td className="p-3 text-neutral-400">{row.timestamp}</td>
                          <td className="p-3 font-sans">
                            <span className="font-sans font-bold text-neutral-800 dark:text-neutral-200 block">{row.narrative}</span>
                            <span className="text-[9px] uppercase text-neutral-400 inline-block bg-neutral-100 dark:bg-neutral-800 p-0.5 px-1.5 rounded mt-0.5">{row.category}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            {row.debit > 0 ? `$${row.debit.toFixed(2)}` : "-"}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-600">
                            {row.credit > 0 ? `$${row.credit.toFixed(2)}` : "-"}
                          </td>
                          <td className="p-3 text-neutral-500 text-[10px]">{row.debitAccountCode || "-"}</td>
                          <td className="p-3 text-neutral-500 text-[10px]">{row.creditAccountCode || "-"}</td>
                          <td className="p-3 font-mono text-neutral-500 text-[10px]">{row.wallet}</td>
                          <td className="p-3 text-neutral-400 font-sans italic">{row.verifiedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* D. PATIENT REVENUE & SPLIT-BILLING (AR) */}
              {accountingTab === "billing" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-200">
                  {/* Left list (7 Columns) */}
                  <div className="md:col-span-7 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                        💸 {language === "ar" ? "محرك فوترة خدمات المرضى وتوزيع الدفع المشترك" : "PATIENT DISCHARGE SPLIT-BILLING PANEL"}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Select a patient discharge folder below to manage payment channels, verify Doctor commission percentages, and authorize co-insurance split billing pipelines.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {patientInvoices.length > 50 && (
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-[10px] text-indigo-700 dark:text-indigo-300 font-sans leading-relaxed">
                          {language === "ar" ? (
                            <span>
                              💼 محرك الفوترة نشط (عرض أول 50 من أصل <strong>{patientInvoices.length.toLocaleString()}</strong> فاتورة). استخدم شريط البحث العام للوصول المباشر.
                            </span>
                          ) : (
                            <span>
                              💼 Real-time billing engine active: showing top 50 of <strong>{patientInvoices.length.toLocaleString()}</strong> active patient invoices. Search above to find any folder in less than 50ms.
                            </span>
                          )}
                        </div>
                      )}
                      {patientInvoices.slice(0, 50).map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => setSelectedRowId(inv.id)}
                          className={`p-3.5 border rounded-xl cursor-pointer transition flex items-center justify-between ${
                            selectedRowId === inv.id
                              ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-505 shadow-sm"
                              : "bg-white dark:bg-[#181C28] hover:bg-neutral-50 dark:hover:bg-neutral-900/35 border-[#EAE6DF] dark:border-neutral-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-[#2BBFFF] px-1.5 py-0.5 rounded">
                                {inv.id}
                              </span>
                              <span className="font-extrabold text-neutral-800 dark:text-neutral-100 font-sans text-[13px]">{inv.patientName}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                              Visit: {inv.billingSource} | Doctor: {inv.physicianName} ({inv.commissionPercentage}% bonus)
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono text-sm block">
                              ${inv.totalAmount.toFixed(2)}
                            </span>
                            <span className={`text-[9px] font-bold tracking-wider rounded px-1.5 py-0.5 inline-block uppercase mt-1 ${
                              inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              inv.status === "Claim-Submitted" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" :
                              "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Detail & Engine action (5 Columns) */}
                  <div className="md:col-span-5 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                    {(() => {
                      const activeInvoice = patientInvoices.find(v => v.id === selectedRowId) || patientInvoices[0];
                      if (!activeInvoice) return <div className="text-center py-10 text-neutral-400">Select an invoice to generate billing splits.</div>;

                      // Calculating live commissions
                      const baseSurgeonFee = activeInvoice.items[0]?.unitPrice || 0;
                      const calculatedSurgeonAccrual = baseSurgeonFee * (activeInvoice.commissionPercentage / 100);

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-[#EAE6DF] dark:border-neutral-800 pb-3">
                            <span className="text-xs font-mono font-black text-[#0F1E46] dark:text-[#2BBFFF] uppercase">
                              ⚡️ SPLIT-BILLING RUNTIME
                            </span>
                            <span className="text-indigo-600 font-mono text-[10.5px] font-black">{activeInvoice.id}</span>
                          </div>

                          {/* Split Display card */}
                          <div className="bg-[#FBFBF9] dark:bg-[#181C28] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between border-b border-dashed border-[#EAE6DF] pb-2 text-neutral-400 font-bold">
                              <span>Case Diagnose ICD-10:</span>
                              <span className="text-neutral-800 dark:text-neutral-200">{activeInvoice.icdCode}</span>
                            </div>

                            <div className="flex justify-between font-sans">
                              <span className="text-neutral-500">Gross Total Bill:</span>
                              <span className="font-extrabold text-[#0f172a] dark:text-white">${activeInvoice.totalAmount.toFixed(2)}</span>
                            </div>

                            {/* Split display */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-150">
                              <div className="p-2 border border-indigo-100 dark:border-indigo-900/35 bg-indigo-50/15 dark:bg-indigo-950/10 rounded-lg">
                                <span className="text-[9px] text-indigo-600 dark:text-[#2BBFFF] uppercase font-bold block">Co-Pay Portion (Patient)</span>
                                <span className="text-neutral-800 dark:text-neutral-200 text-lg font-black">${activeInvoice.patientCoPayPayable.toFixed(2)}</span>
                              </div>
                              <div className="p-2 border border-emerald-100 dark:border-emerald-900/35 bg-emerald-50/15 dark:bg-emerald-950/10 rounded-lg">
                                <span className="text-[9px] text-emerald-500 uppercase font-bold block">Co-Insurance Coverage</span>
                                <span className="text-neutral-800 dark:text-neutral-200 text-lg font-black">${activeInvoice.insuranceClaimPayable.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            {/* Commission estimate */}
                            <div className="p-2.5 bg-[#FF841A]/10 text-neutral-800 dark:text-neutral-100 border border-[#FF841A]/20 rounded-lg text-[10px] space-y-1 font-sans">
                              <span className="font-black uppercase block text-[#FF841A]">Physician Commission Accrual:</span>
                              <span>• Doctor: <span className="font-black">{activeInvoice.physicianName}</span> (ID: {activeInvoice.physicianId})</span><br/>
                              <span>• Surg. Base Fee: <span className="font-bold">${baseSurgeonFee.toFixed(2)}</span> @ {activeInvoice.commissionPercentage}% = <span className="font-black text-emerald-600 dark:text-emerald-400">${calculatedSurgeonAccrual.toFixed(2)}</span> bonus credit</span>
                            </div>
                          </div>

                          {/* Payment channel gateway */}
                          {activeInvoice.status === "Split-Unpaid" ? (
                            <div className="space-y-3 font-sans">
                              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                                💳 SELECT CO-PAY COLLECTION GATEWAY
                              </span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {["Cash", "Card", "Bank Transfer", "Corporate Credit"].map(method => (
                                  <button
                                    key={method}
                                    onClick={() => {
                                      setPatientInvoices(prev => prev.map(inv => inv.id === activeInvoice.id ? { ...inv, selectedPaymentMethod: method } : inv));
                                    }}
                                    className={`p-2 py-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between text-xs cursor-pointer ${
                                      activeInvoice.selectedPaymentMethod === method
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 border-[#EAE6DF] dark:border-neutral-800"
                                    }`}
                                  >
                                    <span>{method}</span>
                                    {activeInvoice.selectedPaymentMethod === method && <Check className="w-3.5 h-3.5 text-white" />}
                                  </button>
                                ))}
                              </div>

                              <button
                                disabled={!activeInvoice.selectedPaymentMethod}
                                onClick={() => {
                                  // Complete Transaction split!
                                  const gate = activeInvoice.selectedPaymentMethod;
                                  
                                  // Debit Cash Drawer or Bank Account based on method
                                  // Debit InsuranceReceivables portion
                                  // Credit Surgical Theater Revenue total amount
                                  // Credit accrued commissions surgeon liability
                                  setChartOfAccounts(prev => prev.map(acc => {
                                    if (gate === "Cash" && acc.code === "ACC-1110-CASH") return { ...acc, balance: acc.balance + activeInvoice.patientCoPayPayable };
                                    if (gate !== "Cash" && acc.code === "ACC-1120-BANK") return { ...acc, balance: acc.balance + activeInvoice.patientCoPayPayable };
                                    if (acc.code === "ACC-1140-AR-INSUR" && activeInvoice.insuranceClaimPayable > 0) return { ...acc, balance: acc.balance + activeInvoice.insuranceClaimPayable };
                                    if (acc.code === "ACC-4200-REV-SURGERY") return { ...acc, balance: acc.balance + activeInvoice.totalAmount };
                                    if (acc.code === "ACC-2120-COMM-ACCRUED" && calculatedSurgeonAccrual > 0) return { ...acc, balance: acc.balance + calculatedSurgeonAccrual };
                                    return acc;
                                  }));

                                  // Update main employees database accrued commissions
                                  setEmployees(prev => prev.map(emp => emp.id === activeInvoice.physicianId ? { ...emp, accruedCommissionSecured: emp.accruedCommissionSecured + calculatedSurgeonAccrual } : emp));

                                  // Add the insurance claim in the submitted pool
                                  if (activeInvoice.insuranceClaimPayable > 0) {
                                    const clm: any = {
                                      id: activeInvoice.claimCode || `CLM-S-${Math.floor(10000 + Math.random() * 90000)}`,
                                      patientName: activeInvoice.patientName,
                                      provider: activeInvoice.insuranceProvider,
                                      icdCode: activeInvoice.icdCode,
                                      claimAmount: activeInvoice.insuranceClaimPayable,
                                      billingSource: activeInvoice.billingSource,
                                      dateSubmitted: new Date().toISOString().split("T")[0],
                                      status: "Ready for Clearinghouse"
                                    };
                                    setInsuranceClaims(prev => [clm, ...prev]);
                                  }

                                  // Set invoice to Paid state
                                  setPatientInvoices(prev => prev.map(inv => inv.id === activeInvoice.id ? { ...inv, status: activeInvoice.insuranceClaimPayable > 0 ? "Claim-Submitted" : "Paid" } : inv));

                                  // Update core clinical patient database
                                  if (activeInvoice.patientId) {
                                    const origP = patients.find(p => p.id === activeInvoice.patientId);
                                    if (origP) {
                                      const updatedLedger = origP.billingLedger.map(item => ({
                                        ...item,
                                        status: "Paid" as const
                                      }));
                                      onUpdatePatient({
                                        ...origP,
                                        billingLedger: updatedLedger,
                                        clinicalLogs: [
                                          ...origP.clinicalLogs,
                                          {
                                            timestamp: new Date().toLocaleTimeString().slice(0, 5),
                                            actorRole: "ERP Accountant",
                                            action: "Payment Settled",
                                            notes: `Split authorized & settled in Ledger. Co-pay of $${activeInvoice.patientCoPayPayable.toFixed(2)} fully collected.`
                                          }
                                        ]
                                      });
                                    }
                                  }

                                  // Log in double entry general ledger
                                  const je: TransactionJournal = {
                                    id: `JE-S-${Math.floor(1000 + Math.random() * 9000)}`,
                                    timestamp: new Date().toTimeString().split(" ")[0],
                                    narrative: `Split-billing discharge checkout for customer ${activeInvoice.patientName} (${activeInvoice.insuranceProvider})`,
                                    category: "Revenue",
                                    debit: activeInvoice.totalAmount,
                                    credit: activeInvoice.totalAmount,
                                    wallet: gate === "Cash" ? "Main Safe" : "Standard Chartered Bank",
                                    verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                                    costCenter: "HOSPITAL"
                                  };
                                  setAccountingJournal(prev => [je, ...prev]);

                                  triggerToast(`Split authorized! Co-pay of $${activeInvoice.patientCoPayPayable.toFixed(2)} received. Claim scheduled for clearing.`);
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white rounded-xl shadow-md uppercase tracking-wider transition-all duration-200 block disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center active:scale-[0.98]"
                              >
                                {language === "ar" ? "تحصيل الكاش واعتماد توزيع الفاتورة" : "Collect Co-pay & Authorize Split-Billing"}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/35 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2.5 font-sans font-bold">
                              <div>
                                <span className="block text-sm">Discharge Bill fully split-processed</span>
                                <span className="text-[10.5px] opacity-80 block font-normal mt-0.5 leading-normal">
                                  Patient co-pay has been successfully pocketed and logged. Accrued surgery commission was allocated securely to {activeInvoice.physicianName}'s bonus profile, and electronic clearinghouse claims dispatched.
                                </span>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* E. INSURANCE CLAIMS CLEARINGHOUSE & REMITTANCE MQ */}
              {accountingTab === "insurance" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-200">
                  
                  {/* Left submitted claims table (7 Columns) */}
                  <div className="md:col-span-7 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4 font-sans">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                          🏢 {language === "ar" ? "قائمة مطالبات التأمين الصحي لسلامة المرضى" : "INSURANCE CLAIMS DISPATCH QUEUE"}
                        </span>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono leading-normal">
                          Consolidation of billing codes, clinical diagnostics and ICD-10 templates routed to regional clearing houses.
                        </p>
                      </div>

                      {insuranceClaims.some(c => c.status === "Ready for Clearinghouse") && (
                        <button
                          onClick={() => {
                            setInsuranceClaims(prev => prev.map(clm => clm.status === "Ready for Clearinghouse" ? { ...clm, status: "Submitted" } : clm));
                            triggerToast("Transmitted electronic file batch to Bupa & AXA Clearing!");
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[10px] font-extrabold text-white uppercase shadow transition"
                        >
                          Dispatched Claims Batch
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {insuranceClaims.map(clm => (
                        <div key={clm.id} className="p-3 bg-[#FBFBF9] dark:bg-[#181C28] border border-[#EAE6DF] dark:border-neutral-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-[#FF841A]/10 text-[#FF841A] border border-[#FF841A]/25 px-1 py-0.2 rounded font-black">
                                {clm.id}
                              </span>
                              <span className="font-extrabold text-neutral-800 dark:text-neutral-100 font-sans">{clm.patientName}</span>
                            </div>
                            <span className="text-[9.5px] text-neutral-400 block mt-1">
                              • Carrier: <span className="text-neutral-500 font-bold">{clm.provider}</span> | Diagnostics: {clm.icdCode}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-neutral-800 dark:text-neutral-100 font-mono text-[13px] block animate-pulse">
                              ${clm.claimAmount.toFixed(2)}
                            </span>
                            <span className={`text-[9px] font-mono font-bold tracking-wider rounded-full px-2 py-0.5 inline-block mt-1 ${
                              clm.status === "Settled" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              clm.status === "Submitted" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                              "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                            }`}>
                              ● {clm.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right ERA Settlement Sheet reconciliation (5 Columns) */}
                  <div className="md:col-span-5 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                        ⚙️ {language === "ar" ? "بوابة تسوية ومطابقة الحسابات الطبية" : "ERA REMITTANCE PORTAL RECONCILIATIONS"}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed font-mono">
                        Rather than checking individual receipts, drop certified electronic payment settlement sheets directly here to auto-match bank inflows against active claims.
                      </p>
                    </div>

                    <div className="border border-dashed border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-5 text-center bg-neutral-50 dark:bg-neutral-950/20 text-xs">
                      <span className="text-2xl block mb-2">📁</span>
                      <span className="font-bold text-neutral-600 dark:text-neutral-300 block font-mono">AXA_&_Bupa_ClaimsRemittance_Q2_2026.xml</span>
                      <p className="text-[10.5px] text-neutral-400 mt-1 max-w-[240px] mx-auto leading-normal">
                        Electronic Remittance Advice (ERA) file compiled by Cleansheet portal with 4 payors ready for automatic double-entry auditing.
                      </p>
                      
                      {insuranceClaims.some(c => c.status === "Submitted") ? (
                        <button
                          onClick={() => {
                            // Settle Submitted claims!
                            // Move "Submitted" to "Settled"
                            const totalSettledAmount = insuranceClaims
                              .filter(c => c.status === "Submitted")
                              .reduce((sum, current) => sum + current.claimAmount, 0);

                            if (totalSettledAmount > 0) {
                              setInsuranceClaims(prev => prev.map(clm => clm.status === "Submitted" ? { ...clm, status: "Settled" } : clm));
                              
                              // Debit Bank Account, Credit Outstanding Insurance Claims Receivable (ACC-1140-AR-INSUR)
                              setChartOfAccounts(prev => prev.map(acc => {
                                if (acc.code === "ACC-1120-BANK") return { ...acc, balance: acc.balance + totalSettledAmount };
                                if (acc.code === "ACC-1140-AR-INSUR") return { ...acc, balance: Math.max(0, acc.balance - totalSettledAmount) };
                                return acc;
                              }));

                              // Write journal general ledger records
                              const je: TransactionJournal = {
                                id: `JE-INS-${Math.floor(1000 + Math.random() * 9000)}`,
                                timestamp: new Date().toTimeString().split(" ")[0],
                                narrative: "Clearinghouse settlement Remittance - AXA & Bupa ERA electronic payment",
                                category: "InsuranceClaim",
                                debit: totalSettledAmount,
                                credit: totalSettledAmount,
                                wallet: "Standard Chartered Bank",
                                verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                                costCenter: "HOSPITAL"
                              };
                              setAccountingJournal(prev => [je, ...prev]);

                              triggerToast(`Successfully processed ERP settlement! $${totalSettledAmount.toFixed(2)} moved from Outstandings directly into bank capital.`);
                            } else {
                              triggerToast("All electronic records are already reconciled and balanced.");
                            }
                          }}
                          className="mt-4 p-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold uppercase tracking-wider text-white text-[10px] shadow duration-150 active:scale-[0.98] cursor-pointer"
                        >
                          Upload & Auto-Reconcile Remittances
                        </button>
                      ) : (
                        <div className="mt-4 p-2 border border-emerald-100 bg-emerald-50 text-emerald-800 text-[10px] rounded-lg font-bold">
                          ✓ All pending electronic claims cleared, revalued, and matched successfully
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* F. ACCOUNTS PAYABLE & PROCUREMENT 3-WAY MATCH */}
              {accountingTab === "ap" && (
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm text-xs space-y-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                      📦 {language === "ar" ? "نظام مطابقة ممتلكات الموردين والدفع الموحد ثلاثي الأبعاد" : "THREE-WAY MATCH AUDITING SYSTEM (ACCOUNTS PAYABLE AP)"}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-4xl font-sans leading-normal">
                      GAAP integrity guidelines command that before releasing institutional patient fees to suppliers, the ERP must automatically audit and verify that the <strong>Purchase Order (PO)</strong> exactly matches the <strong>Warehouse Receiving Log (RCV)</strong> and the <strong>Supplier Invoice</strong>.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-[#EAE6DF] dark:border-neutral-800 rounded-xl">
                    <table className="w-full text-left border-collapse select-text text-[11px] font-mono">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-800 tracking-wider text-neutral-405 text-[9.5px]">
                          <th className="p-3">AP ID</th>
                          <th className="p-3">Certified Lead Supplier</th>
                          <th className="p-3">Reference PO</th>
                          <th className="p-3 text-right font-bold">Invoice Sum</th>
                          <th className="p-3 text-center">Purchase Qty</th>
                          <th className="p-3 text-center">Warehouse Recd</th>
                          <th className="p-3">Verification Match</th>
                          <th className="p-3">Disbursement Due</th>
                          <th className="p-3 text-center">Action Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                        {vendorBills.map(bill => (
                          <tr key={bill.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="p-3 text-indigo-600 font-extrabold">{bill.id}</td>
                            <td className="p-3 font-sans font-bold">{bill.vendor}</td>
                            <td className="p-3 text-neutral-500">{bill.referencePO}</td>
                            <td className="p-3 text-right font-bold text-neutral-800 dark:text-neutral-100">${bill.invoiceAmount.toFixed(2)}</td>
                            <td className="p-3 text-center font-bold text-[#FF841A]">{bill.purchaseOrderQty} units</td>
                            <td className="p-3 text-center font-bold text-emerald-500">{bill.receivingLogQty} units</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                bill.matchedStatus === "Fully Matched" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                              }`}>
                                {bill.matchedStatus}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-400 text-[10px]">{bill.dueDate}</td>
                            <td className="p-3 text-center">
                              {bill.status.includes("Paid") || bill.status.includes("Disbursement Approved") ? (
                                <span className="text-emerald-600 font-bold block uppercase text-[10px]">✓ Fully Paid</span>
                              ) : bill.matchedStatus !== "Fully Matched" ? (
                                <span className="text-rose-505 font-bold block uppercase text-[10px] italic">HOLD: MATCH DISCREPANCY</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Debit Accounts Payable Certified Vendor AP, credit bank
                                    setChartOfAccounts(prev => prev.map(acc => {
                                      if (acc.code === "ACC-2110-AP") return { ...acc, balance: Math.max(0, acc.balance - bill.invoiceAmount) };
                                      if (acc.code === "ACC-1120-BANK") return { ...acc, balance: acc.balance - bill.invoiceAmount };
                                      return acc;
                                    }));
                                    setVendorBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: "Disbursement Approved & Paid" } : b));
                                    
                                    // Record Double Entry
                                    const je: TransactionJournal = {
                                      id: `JE-AP-${Math.floor(1000 + Math.random() * 9000)}`,
                                      timestamp: new Date().toTimeString().split(" ")[0],
                                      narrative: `Disbursed supplier pay-out to ${bill.vendor} (PO Match Verified)`,
                                      category: "Expenditure",
                                      debit: bill.invoiceAmount,
                                      credit: bill.invoiceAmount,
                                      wallet: "Standard Chartered Bank",
                                      verifiedBy: "Ebenezer CFO (" + activeRole + ")"
                                    };
                                    setAccountingJournal(prev => [je, ...prev]);
                                    triggerToast(`Vendor Paid! Disbursed $${bill.invoiceAmount.toFixed(2)} from operating bank and cleared AP liability.`);
                                  }}
                                  className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9.5px] rounded uppercase shadow transition active:scale-[0.98] cursor-pointer"
                                >
                                  Release Cash Payment
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* G. HARDWARE DEPRECIATION */}
              {accountingTab === "depreciation" && (
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                        ⚙️ {language === "ar" ? "نظام إهلاك الأصول والآلات المجمع الطبي" : "OPHTHALMIC HARDWARE TAX-DEP DEPRECIATION SCHEDULES"}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-1 max-w-2xl font-mono leading-normal">
                        Ophthalmic diagnostic equipment (specifically high-end excimer lasers, 3D OCT systems, and surgical systems) represents the core capital of Al Jawarih Eye Hospital. Under regulatory GAAP standards, these systems must be depreciated monthly using straight line allocations.
                      </p>
                    </div>

                    {chartOfAccounts.find(c => c.code === "ACC-5130-EXP-DEPR")?.balance < 70000 ? (
                      <button
                        onClick={() => {
                          const totalDeprToCharge = depreciableAssets.reduce((sum, item) => sum + item.monthlyDepreciation, 0);

                          // Debit depreciation expense, credit accumulated depreciation on Assets
                          setChartOfAccounts(prev => prev.map(acc => {
                            if (acc.code === "ACC-5130-EXP-DEPR") return { ...acc, balance: acc.balance + totalDeprToCharge }; // increase expense
                            if (acc.code === "ACC-1590-ACCUM-DEPR") return { ...acc, balance: acc.balance - totalDeprToCharge }; // decrease contra asset balance (more negative)
                            return acc;
                          }));

                          setDepreciableAssets(prev => prev.map(ast => {
                            const newAccum = ast.accumulatedDepreciation + ast.monthlyDepreciation;
                            const newBook = ast.acquisitionCost - newAccum;
                            return { ...ast, accumulatedDepreciation: newAccum, bookValue: newBook };
                          }));

                          // Add double-entry journal entry
                          const je: TransactionJournal = {
                            id: `JE-DEP-${Math.floor(1000 + Math.random() * 9000)}`,
                            timestamp: new Date().toTimeString().split(" ")[0],
                            narrative: "Posted monthly straight line hardware depreciation batch adjustments",
                            category: "Expenditure",
                            debit: totalDeprToCharge,
                            credit: totalDeprToCharge,
                            wallet: "Standard Chartered Bank",
                            verifiedBy: "Ebenezer CFO (" + activeRole + ")",
                            costCenter: "HOSPITAL"
                          };
                          setAccountingJournal(prev => [je, ...prev]);

                          triggerToast(`Depreciation Run Successful! Charged $${totalDeprToCharge.toFixed(2)} to hospital expense columns.`);
                        }}
                        className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10.5px] rounded-lg shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <Settings className="w-4 h-4 animate-spin" />
                        Run Monthly Depreciation adjustments
                      </button>
                    ) : (
                      <div className="p-2 border border-teal-200 bg-teal-50 text-teal-850 text-[10.5px] rounded-lg font-bold font-mono">
                        ✓ Sept 2026 Monthly depreciation ledger write finalized.
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-[#EAE6DF] dark:border-neutral-800 rounded-xl">
                    <table className="w-full text-left border-collapse select-text text-[11px] font-mono">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[#EAE6DF] tracking-wider text-neutral-405 text-[9.5px]">
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Ophthalmic Device Description</th>
                          <th className="p-3 font-sans">Target Department</th>
                          <th className="p-3 text-right">Original Cost</th>
                          <th className="p-3 text-right">Salvage Value</th>
                          <th className="p-3 text-right">Monthly Depreciation</th>
                          <th className="p-3 text-right">Accumulated Depreciation Offset</th>
                          <th className="p-3 text-right">GAAP Dec Net Book Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                        {depreciableAssets.map(ast => (
                          <tr key={ast.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="p-3 text-indigo-600 font-extrabold">{ast.id}</td>
                            <td className="p-3 font-sans font-bold">{ast.name}</td>
                            <td className="p-3 font-sans text-neutral-500">{ast.clinicalUnit}</td>
                            <td className="p-3 text-right font-bold text-neutral-800">${ast.acquisitionCost.toLocaleString()}</td>
                            <td className="p-3 text-right text-neutral-400">${ast.salvageValue.toLocaleString()}</td>
                            <td className="p-3 text-right font-black text-rose-600">${ast.monthlyDepreciation.toLocaleString()}</td>
                            <td className="p-3 text-right font-black text-rose-500">(${ast.accumulatedDepreciation.toLocaleString()})</td>
                            <td className="p-3 text-right font-extrabold text-[#2BBFFF] bg-indigo-50/15">${ast.bookValue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* H. SYSTEM CROSS-MODULE AUTOMATION LOG */}
              {accountingTab === "integrations" && (
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm text-xs space-y-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                      🔄 {language === "ar" ? "قناة التكامل والأتمتة المتقاطعة للمخزون والعيادات" : "CROSS-DEPARTMENT AUTOMATIC ACCOUNTING EVENTS LOG"}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-4xl">
                      Accountants never manually re-enter data. In Al Jawarih Eye Hospital, background transactional hooks monitor clinical and material operations.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono">
                    {automationLogs.map(log => (
                      <div key={log.id} className="p-3.5 bg-[#FBFBF9] dark:bg-neutral-905 border border-neutral-100 dark:border-neutral-850 rounded-xl flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-[#2BBFFF] flex items-center justify-center font-extrabold shrink-0 text-xs shadow-sm">
                          {log.id}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#2BBFFF] border border-emerald-100 dark:border-emerald-900 p-1 px-2 rounded-full uppercase font-bold tracking-wider">
                              Origin: {log.originModule}
                            </span>
                            <span className="text-neutral-405 text-[10px]">{log.timestamp}</span>
                          </div>
                          <span className="text-[12px] font-bold block text-neutral-800 dark:text-neutral-100">{log.trigger}</span>
                          <p className="text-[10.5px] text-neutral-500 font-sans leading-relaxed">{log.narrative}</p>
                          <div className="text-[9.5px] text-[#2BBFFF] pt-1.5 block leading-none font-bold">
                            🔒 Automatically Logged Ledger adjustment: <span className="underline italic">{log.ledgerEntryCreated}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* LEVEL 1, 2, 3 COHERENT NAV PARADIGM FOR WORKSTATIONS */}
              <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl space-y-4 shadow-sm" id="workstation_level_nav_wrapper">
                
                {/* LEVEL 1: Context Switch & Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dashed border-[#EAE6DF] dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Stylized Dropdown Switcher */}
                    <div className="relative group">
                      {appType === "pharmacy" && (
                        <select
                          id="pharmacy_context_dropdown"
                          value={pharmacyLocation}
                          onChange={(e) => {
                            setPharmacyLocation(e.target.value);
                            triggerToast(`Switched Pharmacy Lockup: ${e.target.value}`);
                          }}
                          className="appearance-none pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-neutral-150/70"
                        >
                          <option value="HOSPITAL">💊 Main Dispensary Safe</option>
                          <option value="CLINIC_EAST">❄️ Surgical Cryo-Fridge</option>
                          <option value="CLINIC_WEST">📦 Backup Quarantine Rack</option>
                        </select>
                      )}

                      {appType === "optics" && (
                        <select
                          id="optics_context_dropdown"
                          value={opticsLocation}
                          onChange={(e) => {
                            setOpticsLocation(e.target.value);
                            triggerToast(`Switched Showroom Zone: ${e.target.value}`);
                          }}
                          className="appearance-none pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-neutral-155/70"
                        >
                          <option value="HOSPITAL">👓 Spectacle Showrooms Center</option>
                          <option value="CLINIC_EAST">👁️ Contact Lens Deponent</option>
                          <option value="OPTICS_LAB">🔬 Prisms & Diagnostic Lens Vault</option>
                        </select>
                      )}
                      
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <span className="text-xs font-serif italic text-neutral-400 dark:text-neutral-500 text-[11px]">
                      {appType === "pharmacy" && "★ Pharmacy Clinic Dispensation System"}
                      {appType === "optics" && "★ OPTICS Store Sales & Prescription Fitting"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-neutral-800 font-mono">
                      REF: <strong>AJ-{appType.toUpperCase()}-EHR</strong>
                    </span>
                  </div>
                </div>

                {/* LEVEL 2: Flat Horizontal Navigation Tab Bar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-[#EAE6DF] dark:border-neutral-800/60 pb-1" id="workstation_level_2_tabs">
                  
                  {appType === "pharmacy" && [
                    { id: "dispensing", labelEn: "Prescription Dispensing", labelAr: "صرف الوصفات" },
                    { id: "formulations", labelEn: "Formulation Compounding", labelAr: "خلط المستحضرات" },
                    { id: "dispatches", labelEn: "Prescription Dispatches", labelAr: "سجل الإرسال الوصفي" }
                  ].map(tab => {
                    const isActive = pharmacyTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`pharmacy_tab_${tab.id}`}
                        onClick={() => {
                          setPharmacyTab(tab.id as any);
                          triggerToast(`Browsing Pharmacy: ${tab.labelEn}`);
                        }}
                        className={`px-4 py-2 text-xs font-semibold relative transition-all duration-300 active:scale-[0.98] ${
                          isActive
                            ? "text-[#4F46E5] dark:text-[#2BBFFF] font-bold"
                            : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                      >
                        <span>{language === "ar" ? tab.labelAr : tab.labelEn}</span>
                        {isActive && (
                          <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#4F46E5] dark:bg-[#2BBFFF] rounded-full animate-slideIn" />
                        )}
                      </button>
                    );
                  })}

                  {appType === "optics" && [
                    { id: "catalog", labelEn: "Spectacle Catalog", labelAr: "كتالوج النظارات" },
                    { id: "pos", labelEn: "Glass Assembly POS", labelAr: "فواتير النظارات" },
                    { id: "lab", labelEn: "Glass Assembly Lab", labelAr: "مختبر العدسات" }
                  ].map(tab => {
                    const isActive = opticsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`optics_tab_${tab.id}`}
                        onClick={() => {
                          setOpticsTab(tab.id as any);
                          triggerToast(`Browsing Optics: ${tab.labelEn}`);
                        }}
                        className={`px-4 py-2 text-xs font-semibold relative transition-all duration-300 active:scale-[0.98] ${
                          isActive
                            ? "text-[#4F46E5] dark:text-[#2BBFFF] font-bold"
                            : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                        }`}
                      >
                        <span>{language === "ar" ? tab.labelAr : tab.labelEn}</span>
                        {isActive && (
                          <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#4F46E5] dark:bg-[#2BBFFF] rounded-full animate-slideIn" />
                        )}
                      </button>
                    );
                  })}

                </div>

                {/* LEVEL 3: Slide Segmented Filter & Live Control Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800/55" id="workstation_level_3_filters">
                  
                  {/* Sliding Segmented control for activeFilter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 mr-2 uppercase">
                      {appType === "pharmacy" && "Local Register:"}
                      {appType === "optics" && "Spectacle Feed:"}
                    </span>
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center border border-neutral-200 dark:border-neutral-850 shadow-inner">
                      {appType === "pharmacy" && [
                        { id: "All", labelEn: "All Items", labelAr: "جميع العناصر" },
                        { id: "Medicine", labelEn: "Medicine", labelAr: "أدوية" },
                        { id: "Personal Care", labelEn: "Personal Care", labelAr: "عناية شخصية" },
                        { id: "Beauty & Cosmetics", labelEn: "Beauty & Cosmetics", labelAr: "تجميل" },
                        { id: "Baby Care", labelEn: "Baby Care", labelAr: "عناية الطفل" },
                        { id: "First Aid & OTC", labelEn: "First Aid & OTC", labelAr: "إسعافات أولية" },
                        { id: "Supplements", labelEn: "Supplements", labelAr: "مكملات" },
                        { id: "Medical Devices", labelEn: "Medical Devices", labelAr: "أجهزة طبية" }
                      ].map(seg => {
                        const isSegActive = activeFilter === seg.id;
                        return (
                          <button
                            key={seg.id}
                            id={`pharmacy_filter_${seg.id}`}
                            onClick={() => {
                              setActiveFilter(seg.id);
                              triggerToast(`Filtered: ${seg.labelEn}`);
                            }}
                            className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all duration-200 ${
                              isSegActive 
                                ? "bg-white dark:bg-neutral-900 text-indigo-700 dark:text-[#2BBFFF] shadow-md border border-neutral-200/50 dark:border-neutral-800" 
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                          >
                            {language === "ar" ? seg.labelAr : seg.labelEn}
                          </button>
                        );
                      })}

                      {appType === "optics" && [
                        { id: "All", labelEn: "All Spectacles", labelAr: "جميع المعروضات" },
                        { id: "RayBan", labelEn: "Ray-Ban Specials", labelAr: "نظارات راي بان" },
                        { id: "Silhouette", labelEn: "Silhouette Rimless", labelAr: "نظارات سيلويت" }
                      ].map(seg => {
                        const isSegActive = activeFilter === seg.id;
                        return (
                          <button
                            key={seg.id}
                            id={`optics_filter_${seg.id}`}
                            onClick={() => {
                              setActiveFilter(seg.id);
                              triggerToast(`Filtered: ${seg.labelEn}`);
                            }}
                            className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all duration-200 ${
                              isSegActive 
                                ? "bg-white dark:bg-neutral-950 text-indigo-700 dark:text-[#2BBFFF] shadow-md border border-neutral-200/50 dark:border-neutral-800" 
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                          >
                            {language === "ar" ? seg.labelAr : seg.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right side live action triggers */}
                  <div className="flex items-center gap-2">
                    {appType === "pharmacy" && (
                      <button
                        id="pharmacy_pos_checkout_trigger"
                        type="button"
                        onClick={() => setIsPosOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        title={language === "ar" ? "شراء عميل وارد للصيدلية" : "Walk-in customer — buy medicine from stock"}
                      >
                        <span>🧑‍⚕️ {language === "ar" ? "شراء عميل" : "Walk-in Customer"}</span>
                      </button>
                    )}

                    {appType === "optics" && (
                      <button
                        id="optics_pos_checkout_trigger"
                        type="button"
                        onClick={() => setIsPosOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                      >
                        <span>🛒 POS checkout</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* ROUTED SPECIALIZED WORKSTATION VIEWS OR DEFAULT DATASHEET GRID SPREADSHEET TABLE */}
              
              {appType === "pharmacy" && pharmacyTab === "formulations" && (
                <div className="animate-in fade-in slide-in-from-bottom duration-300">
                  <PharmacyFormulationMixer
                    language={language}
                    triggerToast={triggerToast}
                    setAccountingJournal={setAccountingJournal}
                  />
                </div>
              )}

              {appType === "pharmacy" && pharmacyTab === "dispatches" && (
                <div className="animate-in fade-in slide-in-from-bottom duration-300">
                  <PharmacyDispatchesView
                    language={language}
                    activeFilter={activeFilter}
                    patients={patients}
                  />
                </div>
              )}

              {appType === "optics" && opticsTab === "pos" && (
                <div className="animate-in fade-in slide-in-from-bottom duration-305">
                  <OpticalPosWorkbench
                    language={language}
                    triggerToast={triggerToast}
                    setAccountingJournal={setAccountingJournal}
                    activeFilter={activeFilter}
                  />
                </div>
              )}

              {appType === "optics" && opticsTab === "lab" && (
                <div className="animate-in fade-in slide-in-from-bottom duration-305">
                  <OpticalLabQueue activeFilter={activeFilter} />
                </div>
              )}

              {/* DEFAULT SPREADSHEET GRID VIEW OF CURRENT ACTIVE TAB CATALOGS */}
              {((appType === "pharmacy" && pharmacyTab === "dispensing") ||
                (appType === "optics" && opticsTab === "catalog")) && (
                <div className="bg-[var(--clr-bg-card)] rounded-3xl border border-[var(--clr-border-light)] shadow-sm overflow-hidden min-w-[700px] animate-in fade-in duration-300">
                  {processedData.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#EAE6DF] dark:border-neutral-800">
                        <span className="text-xl">{appType === "pharmacy" ? "💊" : "👓"}</span>
                      </div>
                      <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
                        {language === "ar" ? "لا توجد بيانات" : "NO INVENTORY DATA"}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        {language === "ar"
                          ? "جميع بيانات المنتجات الافتراضية قد مُسحت. النظام جاهز لاستقبال البيانات من الخادم."
                          : "All hardcoded product data cleared. Ready for live backend integration."}
                      </p>
                    </div>
                  ) : (
                  <>
                  {processedData.length > 100 && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 font-sans leading-relaxed">
                      {language === "ar" ? (
                        <span>
                          💼 محرك البحث نشط: يعرض أول 100 من أصل <strong>{processedData.length.toLocaleString()}</strong> سجلاً. استخدم شريط البحث لتصفية البيانات بدقة فورية.
                        </span>
                      ) : (
                        <span>
                          💼 High-performance view active: showing top 100 of <strong>{processedData.length.toLocaleString()}</strong> database lines in real-time. Use search & filter bars to find individual entries instantly.
                        </span>
                      )}
                    </div>
                  )}
                  <table className="w-full text-left border-collapse select-text">
                    <thead>
                      <tr className="bg-[var(--clr-bg-main)]/60 border-b border-[var(--clr-border-light)] text-neutral-700 dark:text-neutral-300 font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            onChange={e => {
                              if (appType === "pharmacy") handleSelectAll(e.target.checked, pharmatechStock.map(m=>m.id));
                              else if (appType === "optics") handleSelectAll(e.target.checked, opticsCatalog.map(m=>m.id));
                              else handleSelectAll(e.target.checked, accountingJournal.map(m=>m.id));
                            }}
                            className="accent-[#2BBFFF]"
                          />
                        </th>
                        
                        {/* Pharmacy Column Headers */}
                        {appType === "pharmacy" && (
                          <>
                            {visibleColumns.id && <th className="p-3">{language === "ar" ? "كود" : "ID"}</th>}
                            {visibleColumns.name && <th className="p-3">{language === "ar" ? "الاسم" : "Product Name"}</th>}
                            {visibleColumns.category && <th className="p-3">{language === "ar" ? "التصنيف" : "Category"}</th>}
                            {visibleColumns.classCode && <th className="p-3">{language === "ar" ? "التصنيف الطبي" : "Drug Class"}</th>}
                            {visibleColumns.stock && <th className="p-3 text-right">{language === "ar" ? "المخزون" : "Stock"}</th>}
                            {visibleColumns.costPrice && <th className="p-3 text-right">{language === "ar" ? "سعر الشراء" : "Cost Price ($)"}</th>}
                            {visibleColumns.unitPrice && <th className="p-3 text-right">{language === "ar" ? "سعر البيع" : "Sell Price ($)"}</th>}
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

                        <th className="p-3 text-center">{language === "ar" ? "إجراء" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs text-neutral-800 dark:text-neutral-200">
                      {processedData.slice(0, 100).map((row: any, i) => {
                        const keyId = row.id;
                        const isChecked = checkedIds.includes(keyId);
                        const isLow = appType === "pharmacy" && row.stock < 50;

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
                                {visibleColumns.id && <td className="p-2 font-mono text-neutral-500 text-[10px]">{row.id}</td>}
                                {visibleColumns.name && (
                                  <td className="p-2 font-semibold">
                                    <span className="block leading-tight">{row.name}</span>
                                    <span className="text-[9px] text-[#2BBFFF] bg-[#2BBFFF]/10 border border-[#2BBFFF]/20 rounded px-1 py-0.5 inline-block mt-0.5 font-mono">
                                      {row.catalogCode}
                                    </span>
                                  </td>
                                )}
                                {visibleColumns.category && (
                                  <td className="p-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                      row.category === "Medicine" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" :
                                      row.category === "Personal Care" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" :
                                      row.category === "Beauty & Cosmetics" ? "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800" :
                                      row.category === "Baby Care" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" :
                                      row.category === "First Aid & OTC" ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800" :
                                      row.category === "Supplements" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" :
                                      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800"
                                    }`}>
                                      {row.category}
                                    </span>
                                  </td>
                                )}
                                {visibleColumns.classCode && <td className="p-2 text-neutral-500 font-mono text-[10px]">{row.drugClass}</td>}
                                {visibleColumns.stock && (
                                  <td className={`p-2 text-right font-bold font-mono ${isLow ? "text-rose-600 animate-pulse" : "text-neutral-700 dark:text-neutral-300"}`}>
                                    {row.stock} {row.unit}s
                                  </td>
                                )}
                                {visibleColumns.costPrice && <td className="p-2 text-right font-mono text-neutral-500">${row.costPrice.toFixed(2)}</td>}
                                {visibleColumns.unitPrice && <td className="p-2 text-right font-bold text-neutral-800 dark:text-neutral-200 font-mono">${row.pricePerUnit.toFixed(2)}</td>}
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
                                {visibleColumns.expiry && <td className="p-2 text-neutral-605 dark:text-neutral-400 italic text-[11px]">{row.lensType}</td>}
                                {visibleColumns.stock && <td className="p-2 text-right font-bold text-neutral-700 dark:text-neutral-300 font-mono">{row.showroomStock} pcs</td>}
                                {visibleColumns.unitPrice && <td className="p-2 text-right font-black text-neutral-800 dark:text-[#2BBFFF] font-mono">${row.price}</td>}
                              </>
                            )}

                            {/* Action Cell */}
                            <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRowId(keyId);
                                    setDrawerOpen(true);
                                  }}
                                  className="px-2 py-1 bg-[#EEEDE8] dark:bg-neutral-800 rounded font-bold text-[10px] text-neutral-850 dark:text-neutral-250 hover:bg-[#D8D5C8] flex items-center gap-0.5 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#2BBFFF]" />
                                  <span>Detail</span>
                                </button>
                                {appType === "pharmacy" && (
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(keyId)}
                                    className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded font-bold text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-0.5 transition border border-amber-200/40 dark:border-amber-800/30"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>{language === "ar" ? "تعديل" : "Edit"}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </>
                )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Audit Detail Drawer */}
        {drawerOpen && activeDetailRow && (
          <div className="w-80 bg-[var(--clr-bg-card)] border-l border-[var(--clr-border-light)] flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-[var(--clr-bg-main)] border-b border-[var(--clr-border-light)] flex items-center justify-between">
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
            <div className="flex bg-[var(--clr-bg-main)] border-b border-[var(--clr-border-light)] text-[10px] font-bold">
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
                  <div className="bg-[var(--clr-bg-main)] p-3 rounded-lg border border-[var(--clr-border-light)]">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-black block tracking-wider">Product Name / Identifier</span>
                    <span className="font-extrabold text-[#0f1e46] dark:text-white text-sm block mt-0.5">
                      {appType === "pharmacy" && activeDetailRow.name}
                      {appType === "optics" && `${activeDetailRow.brand} - ${activeDetailRow.model}`}
                      {appType === "accounting" && activeDetailRow.narrative}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[8px] font-mono text-neutral-400 uppercase block">Ledger Key Token</span>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                        {activeDetailRow.id}
                      </span>
                    </div>
                    {visibleColumns.stock && (
                      <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase block">Logged Stock</span>
                        <span className="font-bold text-[#0F1E46] dark:text-[#2BBFFF] font-mono">
                          {appType === "pharmacy" && `${activeDetailRow.stock} bottles`}
                          {appType === "optics" && `${activeDetailRow.showroomStock} units`}
                          {appType === "accounting" && `$${(activeDetailRow.debit || activeDetailRow.credit || 0).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {appType === "pharmacy" && (
                    <div className="border border-neutral-200/60 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Code:</span>
                        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{activeDetailRow.catalogCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Category:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          activeDetailRow.category === "Medicine" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          activeDetailRow.category === "Personal Care" ? "bg-green-50 text-green-700 border-green-200" :
                          activeDetailRow.category === "Beauty & Cosmetics" ? "bg-pink-50 text-pink-700 border-pink-200" :
                          activeDetailRow.category === "Baby Care" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          activeDetailRow.category === "First Aid & OTC" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          activeDetailRow.category === "Supplements" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>{activeDetailRow.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Class:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{activeDetailRow.drugClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Cost Price (batch):</span>
                        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">${activeDetailRow.costPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Sell Price (each):</span>
                        <span className="font-mono font-bold text-emerald-600">${activeDetailRow.pricePerUnit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Unit:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{activeDetailRow.unit}</span>
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

      {/* Floating Bottom Bulk Action Bar - Beautifully adaptive and responsive */}
      {checkedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F1E46]/95 dark:bg-[#0E1019]/95 text-white px-6 py-3.5 rounded-full shadow-2xl flex flex-wrap items-center justify-between gap-3 md:gap-6 border border-[#2BBFFF]/40 dark:border-[#2BBFFF]/30 animate-in slide-in-from-bottom duration-200 max-w-[95vw]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500 dark:bg-[#2BBFFF] text-white dark:text-[#0F1E46] font-extrabold text-xs flex items-center justify-center shadow-md">
              {checkedIds.length}
            </span>
            <span className="font-bold text-[11px] md:text-xs">
              {language === "ar" ? "صفوف محددة للتعديل الكلي" : "Bulk records selected for processing"}
            </span>
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-white/20"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkReorder}
              className="px-3 md:px-3.5 py-1 md:py-1.5 bg-[#4F46E5] dark:bg-[#2BBFFF] text-white dark:text-[#0F1E46] hover:bg-[#3E37C4] dark:hover:bg-[#5dd2ff] font-extrabold text-[10px] uppercase rounded-full transition duration-150 active:scale-[0.95]"
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
                {appType === "accounting"
                  ? (language === "ar" ? "إضافة قيد محاسبي" : "Add Journal Entry")
                  : (language === "ar" ? "إضافة عنصر جديد" : "Add New Item")}
              </span>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setAddFormErrors({}); setAccEntryErrors({}); }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {appType === "accounting" ? (
              /* ── Accounting Double-Entry Form ── */
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الوصف" : "Narrative"}</label>
                  <input
                    type="text"
                    placeholder={language === "ar" ? "وصف القيد" : "e.g. Purchase of medical supplies"}
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${accEntryErrors.narrative ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={accEntryNarrative}
                    onChange={e => { setAccEntryNarrative(e.target.value); setAccEntryErrors(prev => ({ ...prev, narrative: false })); }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التاريخ" : "Date"}</label>
                    <input
                      type="date"
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold focus:outline-[#2BBFFF] ${accEntryErrors.date ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={accEntryDate}
                      onChange={e => { setAccEntryDate(e.target.value); setAccEntryErrors(prev => ({ ...prev, date: false })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التصنيف" : "Category"}</label>
                    <select
                      className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                      value={accEntryCategory}
                      onChange={e => setAccEntryCategory(e.target.value as TransactionJournal["category"])}
                    >
                      <option value="Revenue">Revenue</option>
                      <option value="Expenditure">Expenditure</option>
                      <option value="InsuranceClaim">InsuranceClaim</option>
                      <option value="Payroll">Payroll</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "مركز التكلفة" : "Cost Center"}</label>
                  <select
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${accEntryErrors.costCenter ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={accEntryCostCenter}
                    onChange={e => { setAccEntryCostCenter(e.target.value); setAccEntryErrors(prev => ({ ...prev, costCenter: false })); }}
                  >
                    <option value="">-- {language === "ar" ? "اختر" : "Select"} --</option>
                    <option value="HOSPITAL">🏥 Hospital</option>
                    <option value="PHARMACY">💊 Pharmacy</option>
                    <option value="WAREHOUSE">📦 Warehouse</option>
                    <option value="OPTICS">👓 Optics</option>
                    <option value="EMPLOYEES">👥 Employees</option>
                  </select>
                </div>

                <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4">
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-3">{language === "ar" ? "قيد القيد المزدوج" : "Double-Entry Accounts"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "حساب المدين" : "Debit Account"}</label>
                      <select
                        className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${accEntryErrors.debitAccount ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                        value={accEntryDebitAccount}
                        onChange={e => { setAccEntryDebitAccount(e.target.value); setAccEntryErrors(prev => ({ ...prev, debitAccount: false, unbalanced: false })); }}
                      >
                        <option value="">-- Select --</option>
                        {chartOfAccounts.map(acc => (
                          <option key={acc.code} value={acc.code}>{acc.code} — {language === "ar" && acc.nameAr ? acc.nameAr : acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "قيمة المدين" : "Debit Amount ($)"}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${accEntryErrors.debitAmount ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                        value={accEntryDebitAmount || ""}
                        onChange={e => { setAccEntryDebitAmount(parseFloat(e.target.value) || 0); setAccEntryErrors(prev => ({ ...prev, debitAmount: false, unbalanced: false })); }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "حساب الدائن" : "Credit Account"}</label>
                      <select
                        className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${accEntryErrors.creditAccount ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                        value={accEntryCreditAccount}
                        onChange={e => { setAccEntryCreditAccount(e.target.value); setAccEntryErrors(prev => ({ ...prev, creditAccount: false, unbalanced: false })); }}
                      >
                        <option value="">-- Select --</option>
                        {chartOfAccounts.map(acc => (
                          <option key={acc.code} value={acc.code}>{acc.code} — {language === "ar" && acc.nameAr ? acc.nameAr : acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "قيمة الدائن" : "Credit Amount ($)"}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${accEntryErrors.creditAmount ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                        value={accEntryCreditAmount || ""}
                        onChange={e => { setAccEntryCreditAmount(parseFloat(e.target.value) || 0); setAccEntryErrors(prev => ({ ...prev, creditAmount: false, unbalanced: false })); }}
                      />
                    </div>
                  </div>
                  {accEntryErrors.unbalanced && (
                    <p className="text-[10px] text-rose-500 font-bold mt-2">{language === "ar" ? "يجب أن يتساوى المدين والدائن" : "Debit and Credit amounts must be equal (balanced entry)."}</p>
                  )}
                </div>
              </div>
            ) : (
              /* ── Pharmacy Stock Add Form ── */
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الاسم" : "Product Name"}</label>
                  <input
                    type="text"
                    placeholder={language === "ar" ? "اسم المنتج" : "e.g. Moxifloxacin HCl Eye Drops"}
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${addFormErrors.name ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={newPharmacyName}
                    onChange={e => { setNewPharmacyName(e.target.value); setAddFormErrors(prev => ({ ...prev, name: false })); }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الرمز" : "Catalog Code"}</label>
                    <input
                      type="text"
                      placeholder="e.g. RX-MOX-050"
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold focus:outline-[#2BBFFF] ${addFormErrors.code ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={newPharmacyCode}
                      onChange={e => { setNewPharmacyCode(e.target.value); setAddFormErrors(prev => ({ ...prev, code: false })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الوحدة" : "Unit"}</label>
                    <select
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${addFormErrors.unit ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={newPharmacyUnit}
                      onChange={e => { setNewPharmacyUnit(e.target.value); setAddFormErrors(prev => ({ ...prev, unit: false })); }}
                    >
                      <option value="piece">{language === "ar" ? "قطعة" : "piece"}</option>
                      <option value="box">{language === "ar" ? "علبة" : "box"}</option>
                      <option value="bottle">{language === "ar" ? "زجاجة" : "bottle"}</option>
                      <option value="tube">{language === "ar" ? "أنبوب" : "tube"}</option>
                      <option value="pack">{language === "ar" ? "حزمة" : "pack"}</option>
                      <option value="vial">{language === "ar" ? "قنينة" : "vial"}</option>
                      <option value="jar">{language === "ar" ? "برطمان" : "jar"}</option>
                      <option value="spray">{language === "ar" ? "رذاذ" : "spray"}</option>
                      <option value="roll">{language === "ar" ? "لفة" : "roll"}</option>
                      <option value="pair">{language === "ar" ? "زوج" : "pair"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التصنيف" : "Category"}</label>
                  <select
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${addFormErrors.category ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={newPharmacyCategory}
                    onChange={e => { setNewPharmacyCategory(e.target.value as PharmacyMeds["category"]); setAddFormErrors(prev => ({ ...prev, category: false })); }}
                  >
                    <option value="Medicine">{language === "ar" ? "دواء" : "Medicine"}</option>
                    <option value="Personal Care">{language === "ar" ? "عناية شخصية" : "Personal Care"}</option>
                    <option value="Beauty & Cosmetics">{language === "ar" ? "تجميل" : "Beauty & Cosmetics"}</option>
                    <option value="Baby Care">{language === "ar" ? "عناية الطفل" : "Baby Care"}</option>
                    <option value="First Aid & OTC">{language === "ar" ? "إسعافات أولية" : "First Aid & OTC"}</option>
                    <option value="Supplements">{language === "ar" ? "مكملات" : "Supplements"}</option>
                    <option value="Medical Devices">{language === "ar" ? "أجهزة طبية" : "Medical Devices"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التصنيف" : "Drug Class"}</label>
                  <select
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${addFormErrors.drugClass ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={newPharmacyClass}
                    onChange={e => { setNewPharmacyClass(e.target.value); setAddFormErrors(prev => ({ ...prev, drugClass: false })); }}
                  >
                    <option value="General">{language === "ar" ? "عام" : "General"}</option>
                    <option value="Antibiotic">{language === "ar" ? "مضاد حيوي" : "Antibiotic"}</option>
                    <option value="Analgesic">{language === "ar" ? "مسكن" : "Analgesic"}</option>
                    <option value="Antihistamine">{language === "ar" ? "مضاد هيستامين" : "Antihistamine"}</option>
                    <option value="Anti-inflammatory">{language === "ar" ? "مضاد التهاب" : "Anti-inflammatory"}</option>
                    <option value="Antiseptic">{language === "ar" ? "مطهر" : "Antiseptic"}</option>
                    <option value="Corticosteroid">{language === "ar" ? "كورتيكوستيرويد" : "Corticosteroid"}</option>
                    <option value="Antidiabetic">{language === "ar" ? "مضاد سكري" : "Antidiabetic"}</option>
                    <option value="Antihypertensive">{language === "ar" ? "خافض ضغط" : "Antihypertensive"}</option>
                    <option value="Ophthalmic Solution">{language === "ar" ? "محلول عيني" : "Ophthalmic Solution"}</option>
                    <option value="Supplement">{language === "ar" ? "مكمل غذائي" : "Supplement"}</option>
                    <option value="Antifungal">{language === "ar" ? "مضاد فطري" : "Antifungal"}</option>
                    <option value="Hair Care">{language === "ar" ? "عناية شعر" : "Hair Care"}</option>
                    <option value="Skin Care">{language === "ar" ? "عناية بشرة" : "Skin Care"}</option>
                    <option value="Oral Care">{language === "ar" ? "عناية فم" : "Oral Care"}</option>
                    <option value="Bath & Body">{language === "ar" ? "استحمام وجسم" : "Bath & Body"}</option>
                    <option value="Deodorant">{language === "ar" ? "مزيل عرق" : "Deodorant"}</option>
                    <option value="Sunscreen">{language === "ar" ? "واقي شمس" : "Sunscreen"}</option>
                    <option value="Baby Care">{language === "ar" ? "عناية طفل" : "Baby Care"}</option>
                    <option value="First Aid">{language === "ar" ? "إسعاف أولي" : "First Aid"}</option>
                    <option value="Medical Device">{language === "ar" ? "جهاز طبي" : "Medical Device"}</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الكمية" : "Stock Qty"}</label>
                    <input
                      type="number"
                      min="1"
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${addFormErrors.stock ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={newPharmacyStock}
                      onChange={e => { setNewPharmacyStock(Math.max(1, parseInt(e.target.value) || 1)); setAddFormErrors(prev => ({ ...prev, stock: false })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "سعر الشراء" : "Cost Price ($)"}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${addFormErrors.costPrice ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={newPharmacyCost || ""}
                      onChange={e => { setNewPharmacyCost(parseFloat(e.target.value) || 0); setAddFormErrors(prev => ({ ...prev, costPrice: false })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "سعر البيع" : "Sell Price ($)"}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${addFormErrors.price ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                      value={newPharmacyPrice || ""}
                      onChange={e => { setNewPharmacyPrice(parseFloat(e.target.value) || 0); setAddFormErrors(prev => ({ ...prev, price: false })); }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-50 dark:bg-neutral-900/60 px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setAddFormErrors({}); setAccEntryErrors({}); }}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-250 text-neutral-700 font-bold text-xs rounded-lg transition"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={appType === "accounting" ? handlePostAccountingEntry : handleAddNewRecord}
                className="px-4 py-2 bg-[#0F1E46] hover:bg-[#1A2B5E] text-white font-bold text-xs rounded-lg transition"
              >
                {appType === "accounting"
                  ? (language === "ar" ? "ترحيل القيد" : "Post Entry")
                  : (language === "ar" ? "حفظ" : "Add Item")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#0F1E46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] w-full max-w-md rounded-2xl shadow-2xl border border-neutral-150 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#0f1e46] text-white px-6 py-4 flex items-center justify-between border-b border-[#2BBFFF]/20">
              <span className="font-bold text-sm tracking-wide flex items-center gap-1.5 uppercase">
                <Pencil className="w-5 h-5 text-[#2BBFFF]" /> 
                {language === "ar" ? "تعديل العنصر" : "Edit Item"}
              </span>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditFormErrors({}); }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الاسم" : "Product Name"}</label>
                <input
                  type="text"
                  className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${editFormErrors.name ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                  value={editPharmacyName}
                  onChange={e => { setEditPharmacyName(e.target.value); setEditFormErrors(prev => ({ ...prev, name: false })); }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الرمز" : "Catalog Code"}</label>
                  <input
                    type="text"
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold focus:outline-[#2BBFFF] ${editFormErrors.code ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={editPharmacyCode}
                    onChange={e => { setEditPharmacyCode(e.target.value); setEditFormErrors(prev => ({ ...prev, code: false })); }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الوحدة" : "Unit"}</label>
                  <select
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${editFormErrors.unit ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={editPharmacyUnit}
                    onChange={e => { setEditPharmacyUnit(e.target.value); setEditFormErrors(prev => ({ ...prev, unit: false })); }}
                  >
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                    <option value="bottle">bottle</option>
                    <option value="tube">tube</option>
                    <option value="pack">pack</option>
                    <option value="vial">vial</option>
                    <option value="jar">jar</option>
                    <option value="spray">spray</option>
                    <option value="roll">roll</option>
                    <option value="pair">pair</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التصنيف" : "Category"}</label>
                <select
                  className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${editFormErrors.category ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                  value={editPharmacyCategory}
                  onChange={e => { setEditPharmacyCategory(e.target.value as PharmacyMeds["category"]); setEditFormErrors(prev => ({ ...prev, category: false })); }}
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="First Aid & OTC">First Aid & OTC</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Medical Devices">Medical Devices</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "التصنيف" : "Drug Class"}</label>
                <select
                  className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-semibold focus:outline-[#2BBFFF] ${editFormErrors.drugClass ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                  value={editPharmacyClass}
                  onChange={e => { setEditPharmacyClass(e.target.value); setEditFormErrors(prev => ({ ...prev, drugClass: false })); }}
                >
                  <option value="General">General</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Antihistamine">Antihistamine</option>
                  <option value="Anti-inflammatory">Anti-inflammatory</option>
                  <option value="Antiseptic">Antiseptic</option>
                  <option value="Corticosteroid">Corticosteroid</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Antihypertensive">Antihypertensive</option>
                  <option value="Ophthalmic Solution">Ophthalmic Solution</option>
                  <option value="Supplement">Supplement</option>
                  <option value="Antifungal">Antifungal</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Oral Care">Oral Care</option>
                  <option value="Bath & Body">Bath & Body</option>
                  <option value="Deodorant">Deodorant</option>
                  <option value="Sunscreen">Sunscreen</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Medical Device">Medical Device</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "الكمية" : "Stock Qty"}</label>
                  <input
                    type="number"
                    min="0"
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${editFormErrors.stock ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={editPharmacyStock}
                    onChange={e => { setEditPharmacyStock(Math.max(0, parseInt(e.target.value) || 0)); setEditFormErrors(prev => ({ ...prev, stock: false })); }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "سعر الشراء" : "Cost Price ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${editFormErrors.costPrice ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={editPharmacyCost}
                    onChange={e => { setEditPharmacyCost(parseFloat(e.target.value) || 0); setEditFormErrors(prev => ({ ...prev, costPrice: false })); }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">{language === "ar" ? "سعر البيع" : "Sell Price ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-xs font-mono font-semibold text-right focus:outline-[#2BBFFF] ${editFormErrors.price ? "border-red-500" : "border-neutral-200 dark:border-neutral-700"}`}
                    value={editPharmacyPrice}
                    onChange={e => { setEditPharmacyPrice(parseFloat(e.target.value) || 0); setEditFormErrors(prev => ({ ...prev, price: false })); }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/60 px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditFormErrors({}); }}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-250 text-neutral-700 font-bold text-xs rounded-lg transition"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                className="px-4 py-2 bg-[#0F1E46] hover:bg-[#1A2B5E] text-white font-bold text-xs rounded-lg transition"
              >
                {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPosOpen && (
        <div className="fixed inset-0 z-50">
          <PosRetailTerminal
            language={language}
            pharmatechStock={pharmatechStock}
            opticsCatalog={opticsCatalog}
            appType={appType === "optics" ? "optics" : "pharmacy"}
            onCheckoutSuccess={(updatedMeds, updatedOptics, newLedgerEntry) => {
              setPharmatechStock(updatedMeds);
              setOpticsCatalog(updatedOptics);
              setAccountingJournal(prev => [newLedgerEntry, ...prev]);
              setIsPosOpen(false);
              triggerToast(language === "ar" ? "تم دفع فاتورة مبيعات POS بنجاح!" : "Point-of-Sale checkout successfully logged & credited!");
            }}
            onClose={() => setIsPosOpen(false)}
          />
        </div>
      )}

    </div>
  );
}

// ==========================================
// NEW DETAILED WORKSTATION SUB-VIEWS
// ==========================================

interface PharmacyFormulationMixerProps {
  language: "en" | "ar";
  triggerToast: (msg: string) => void;
  setAccountingJournal: React.Dispatch<React.SetStateAction<any[]>>;
}

function PharmacyFormulationMixer({ language, triggerToast, setAccountingJournal }: PharmacyFormulationMixerProps) {
  const [activeIngredient, setActiveIngredient] = useState("Latanoprost 0.005%");
  const [preservative, setPreservative] = useState("BAK-Free");
  const [targetPh, setTargetPh] = useState(7.2);
  const [batchVolume, setBatchVolume] = useState(50);

  const handleMix = () => {
    const cost = Math.round(batchVolume * 4.5);
    triggerToast(`Compounded ${batchVolume}ml of custom ${activeIngredient} successfully | Cost: $${cost}`);
    
    const journalEntry = {
      id: `JE-PH-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Bespoke compounding compounding batch: ${activeIngredient} ${batchVolume}ml with ${preservative} preservative.`,
      category: "Expenditure",
      debit: cost,
      credit: 0,
      wallet: "Main Safe",
      verifiedBy: "Senior Chemist Mildred",
      costCenter: "PHARMACY"
    };
    setAccountingJournal(prev => [journalEntry, ...prev]);
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-[#2BBFFF] rounded-xl">
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <h3 className="font-extrabold text-[#0F172A] dark:text-white tracking-tight text-sm">
            {language === "ar" ? "جهاز خلط المستحضرات والتركيبات الخاصة" : "Al Jawarih Ophthalmic Automated Compounding Mixer"}
          </h3>
          <p className="text-[11px] text-neutral-400">
            Formulate bespoke, preservative-free solutions for high-sensitive postsurgical patients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-[#EAE6DF]/60 dark:border-neutral-800/60">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Active Pharmacy Drug
            </label>
            <select
              value={activeIngredient}
              onChange={(e) => setActiveIngredient(e.target.value)}
              className="w-full bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-850 dark:text-neutral-200"
            >
              <option value="Latanoprost 0.005%">Latanoprost 0.005% Presurgical</option>
              <option value="Timolol Maleate 0.5%">Timolol Maleate 0.5% Anti-Glaucomatous</option>
              <option value="Brimonidine Tartrate 0.15%">Brimonidine Tartrate 0.15% Pressure-cut</option>
              <option value="Atropine Sulfate 0.01%">Atropine Sulfate 0.01% Bespoke Pediatric</option>
              <option value="Prednisolone Acetate 1%">Prednisolone Acetate 1% Anti-inflammatory</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Preservative Formula
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["BAK-Free", "Purite", "Standard BAK"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreservative(p)}
                  className={`p-2 rounded-xl text-[11px] font-extrabold text-center border transition ${
                    preservative === p
                      ? "bg-indigo-500 text-white border-indigo-600"
                      : "bg-[#FFFFFF] dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-[#EAE6DF] dark:border-neutral-800 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5 flex-row">
              <span>Target Solution pH Level</span>
              <span className="text-[#4F46E5] dark:text-[#2BBFFF] font-mono">{targetPh} pH</span>
            </div>
            <input
              type="range"
              min="5.5"
              max="8.0"
              step="0.1"
              value={targetPh}
              onChange={(e) => setTargetPh(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[9px] text-neutral-450">
              <span>Highly Acidic (5.5)</span>
              <span className="font-bold text-neutral-500">Ophthalmic Physiological (7.2)</span>
              <span>Alkaline (8.0)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              <span>Compounding Bottle Volume</span>
              <span className="text-indigo-600 dark:text-[#2BBFFF] font-mono">{batchVolume} mL</span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={batchVolume}
              onChange={(e) => setBatchVolume(parseInt(e.target.value))}
              className="w-full accent-[#4F46E5] dark:accent-[#2BBFFF]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-[#EAE6DF] dark:border-neutral-800 pt-4">
        <span className="text-xs text-neutral-500 max-w-md">
          ⚠️ All compounded mixtures trigger automatic inventory reconciliation logs and are double-signed into the hospital general financial vault.
        </span>
        <button
          onClick={handleMix}
          type="button"
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3B32C1] text-white text-xs font-black rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer font-sans"
        >
          🧬 Compound Formulation & Post Ledger
        </button>
      </div>
    </div>
  );
}

interface PharmacyDispatchesViewProps {
  language: "en" | "ar";
  activeFilter: string;
  patients?: Patient[];
}

function PharmacyDispatchesView({ language, activeFilter, patients = [] }: PharmacyDispatchesViewProps) {
  const [dispatches] = useState([
    { id: "DISP-9101", patientName: "Alexander Sterling", rx: "Latanoprost 0.005% Opht. Drops", qty: "2 Bottles", courier: "Local Dispensary Drawer 1", date: "Today", status: "Released - Paid Co-Pay", isChemical: true },
    { id: "DISP-9102", patientName: "Robert Giles", rx: "Atropine Sulfate 0.01% progression drops", qty: "3 Bottles", courier: "Hand-delivered Clinic West", date: "Today", status: "Pending Release", isChemical: true },
    { id: "DISP-9103", patientName: "Nadia Malik", rx: "Prednisolone Acetate 1% Anti-inflammatory", qty: "1 Bottle", courier: "Dispensary Drawer 3", date: "Yesterday", status: "Delivered & Synced", isChemical: true },
    { id: "DISP-9104", patientName: "Vance Pendleton", rx: "Timolol Maleate 0.5% drops", qty: "4 Bottles", courier: "Home Delivery - Aramex", date: "Yesterday", status: "In Transit", isChemical: true },
    { id: "DISP-9105", patientName: "Nasser Al-Ghamdi", rx: "Standard Eye Patch Shield", qty: "5 Units", courier: "Clinic West Rack", date: "Yesterday", status: "Delivered & Synced", isChemical: false },
    { id: "DISP-9106", patientName: "Jamilah Rashid", rx: "Standard Wet Cotton Swabs", qty: "10 Packs", courier: "Main Safe Drawer 2", date: "Today", status: "Delivered & Synced", isChemical: false }
  ]);

  // Transform clinical patient presets + customized prescription drops written by the doctor
  const liveDispatches = useMemo(() => {
    return patients.flatMap((patient) => {
      if (!patient.billingLedger) return [];
      
      return patient.billingLedger
        .filter((bItem) => bItem.category === "PharmacyDispense")
        .map((bItem, idx) => {
          let rxName = bItem.serviceName;
          if (rxName.startsWith("Prescription Ophthalmic Formulary: ")) {
            rxName = rxName.replaceAll("Prescription Ophthalmic Formulary: ", "");
          } else if (rxName.startsWith("Prescription: ")) {
            rxName = rxName.replaceAll("Prescription: ", "");
          } else if (rxName.startsWith("Glaucoma Medication Dispatch: ")) {
            rxName = rxName.replaceAll("Glaucoma Medication Dispatch: ", "");
          } else if (rxName.startsWith("Dispense: ")) {
            rxName = rxName.replaceAll("Dispense: ", "");
          }
          // Strip quantities or trailing parens
          rxName = rxName.replace(/\s*\(Qty:\s*\d+\)/gi, "");

          return {
            id: `DISP-LIVE-${bItem.id.replaceAll("-", "").substring(0, 4).toUpperCase()}`,
            patientName: patient.name,
            rx: rxName,
            qty: "1 Unit",
            courier: `Front Desk Queue / Main Dispensary - ${patient.clinic ? patient.clinic.toUpperCase() : "GENERAL"}`,
            date: "Today",
            status: bItem.status === "Paid" ? "Released - Paid" : "Pending Order Sync / Release",
            isChemical: true
          };
        });
    });
  }, [patients]);

  const allDispatches = useMemo(() => {
    return [...liveDispatches, ...dispatches];
  }, [liveDispatches, dispatches]);

  const filteredDispatches = allDispatches.filter(disp => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Medicine") return disp.isChemical;
    if (activeFilter === "Personal Care" || activeFilter === "Beauty & Cosmetics" || activeFilter === "Baby Care" || activeFilter === "First Aid & OTC" || activeFilter === "Supplements" || activeFilter === "Medical Devices") return !disp.isChemical;
    return true;
  });

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-[#EAE6DF] dark:border-neutral-800">
        <div>
          <h4 className="text-xs font-black text-neutral-800 dark:text-white uppercase">Direct Pharmacy Dispatch Ledger & Logs</h4>
          <p className="text-[10px] text-neutral-405">Electronic prescription dispatches logged across patient clinical folders</p>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-[#2BBFFF] border border-indigo-150 rounded-lg font-mono">
          E-prescribing System Connected
        </span>
      </div>

      {filteredDispatches.length > 50 && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 rounded-xl text-[10px] text-indigo-750 dark:text-indigo-300 font-sans leading-normal">
          {language === "ar" ? (
            <span>
              💊 معالج الوصفات نشط: يعرض أول 50 من أصل <strong>{filteredDispatches.length.toLocaleString()}</strong> وصفة طبية نشطة لمنع تعليق النظام.
            </span>
          ) : (
            <span>
              💊 Pharmacy routing check active: showing top 50 of <strong>{filteredDispatches.length.toLocaleString()}</strong> prescription dispatches to secure UI speed.
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300 border-collapse">
          <thead>
            <tr className="border-b border-[#EAE6DF] dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              <th className="p-2.5">Dispatch ID</th>
              <th className="p-2.5">Beneficiary Patient</th>
              <th className="p-2.5">Prescribed Item</th>
              <th className="p-2.5 font-sans">Units</th>
              <th className="p-2.5">Discharge Route</th>
              <th className="p-2.5">Execution Date</th>
              <th className="p-2.5 text-center">Status Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]/40 dark:divide-neutral-800/40">
            {filteredDispatches.slice(0, 50).map((disp, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40">
                <td className="p-2.5 font-mono font-bold text-neutral-800 dark:text-white">{disp.id}</td>
                <td className="p-2.5 font-semibold text-neutral-700 dark:text-neutral-300">{disp.patientName}</td>
                <td className="p-2.5 italic text-neutral-600 dark:text-neutral-400">{disp.rx}</td>
                <td className="p-2.5 font-bold font-mono">{disp.qty}</td>
                <td className="p-2.5 text-[11px] font-mono text-neutral-500">{disp.courier}</td>
                <td className="p-2.5 font-mono text-neutral-400 text-[10px]">{disp.date}</td>
                <td className="p-2.5 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    disp.status.includes("Released") || disp.status.includes("Delivered")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                      : disp.status.includes("Pending")
                      ? "bg-amber-50 text-amber-700 border-amber-150"
                      : "bg-blue-50 text-blue-700 border-blue-150"
                  }`}>
                    {disp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface OpticalPosWorkbenchProps {
  language: "en" | "ar";
  triggerToast: (msg: string) => void;
  setAccountingJournal: React.Dispatch<React.SetStateAction<any[]>>;
  activeFilter: string;
}

function OpticalPosWorkbench({ language, triggerToast, setAccountingJournal, activeFilter }: OpticalPosWorkbenchProps) {
  const [frameModel, setFrameModel] = useState("Classic Wayfarer");
  const [material, setMaterial] = useState("Surgical Titanium");
  const [lensColor, setLensColor] = useState("G-15 Polarized Green");
  const [ipd, setIpd] = useState(63);

  const [orders, setOrders] = useState([
    { id: "OPTX-90112", model: "Ray-Ban Pilot", material: "Carbon Fiber", lens: "Blue mirrored coating", ipd: "64mm", price: "$240", status: "Assembly Completed", brand: "RayBan" },
    { id: "OPTX-90113", model: "Silhouette Rimless", material: "Titanium", lens: "Photochromic Transition", ipd: "62mm", price: "$380", status: "Lenses grinding", brand: "Silhouette" }
  ]);

  const handleCreateOrder = () => {
    const cost = material.includes("Titanium") ? 350 : 180;
    triggerToast(`Fabricated custom ${frameModel} frame with ${lensColor} coating successfully! Price: $${cost}`);
    const detectedBrand = frameModel.toLowerCase().includes("ray-ban") ? "RayBan" : "Silhouette";
    const newOrd = {
      id: `OPTX-${Math.floor(90000 + Math.random() * 9500)}`,
      model: frameModel,
      material,
      lens: lensColor,
      ipd: `${ipd}mm`,
      price: `$${cost}`,
      status: "In Queue for grinding",
      brand: detectedBrand
    };
    setOrders(prev => [newOrd, ...prev]);

    const journalEntry = {
      id: `JE-OP-${Math.floor(1000 + Math.random() * 9200)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Optical sales credit logged: ${frameModel} custom assembly [${material}] [${lensColor}]`,
      category: "Revenue",
      debit: 0,
      credit: cost,
      wallet: "Standard Chartered Bank",
      verifiedBy: "Licensed Optometrist Sterling",
      costCenter: "OPTICS"
    };
    setAccountingJournal(prev => [journalEntry, ...prev]);
  };

  const filteredOrders = orders.filter(ord => {
    if (activeFilter === "All") return true;
    if (activeFilter === "RayBan") return ord.brand === "RayBan";
    if (activeFilter === "Silhouette") return ord.brand === "Silhouette";
    return true;
  });

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-[#2BBFFF] rounded-xl font-sans">
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-extrabold text-[#0F172A] dark:text-white tracking-tight text-sm">
            Al Jawarih Optical Showroom POS Workbench & custom frame stylist
          </h3>
          <p className="text-[11px] text-neutral-400">
            Combine high-fashion titanium and acetate frame silhouettes with precision-graded prescription glass.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-[#EAE6DF]/60 dark:border-neutral-800/60 shadow-inner">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5 font-sans">
              Select Designer Frame Model
            </label>
            <select
              value={frameModel}
              onChange={(e) => setFrameModel(e.target.value)}
              className="w-full bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-800 dark:text-neutral-200 font-bold"
            >
              <option value="Classic Wayfarer">Ray-Ban Classic Wayfarer</option>
              <option value="Aviator Carbon Special">Ray-Ban Aviator Carbon Special</option>
              <option value="Rimless Elegance Elite">Silhouette Rimless Elegance Elite</option>
              <option value="Titanium Structural Lite">Silhouette Titanium Structural Lite</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5 font-sans">
              Frame material structural classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Surgical Titanium", "Hand-polished Acetate", "Real Carbon Fiber"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`p-2 rounded-xl text-[10px] font-extrabold text-center border transition ${
                    material === m
                      ? "bg-indigo-500 text-white border-indigo-600 font-black"
                      : "bg-[#FFFFFF] dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-[#EAE6DF] dark:border-neutral-800 hover:bg-slate-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 font-sans">
          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Prescription Lens Technology
            </label>
            <select
              value={lensColor}
              onChange={(e) => setLensColor(e.target.value)}
              className="w-full bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-850 dark:text-neutral-200"
            >
              <option value="G-15 Polarized Green">G-15 Polarized Emerald Green</option>
              <option value="Photochromic Transition Brown">Photochromic Transition Brown (UV auto-tint)</option>
              <option value="High-Index Blue-Light Cut AR">High-Index Blue-Light Cut + Anti-Reflective Clear</option>
              <option value="Digital Freeform Anti-Reflective">Digital Freeform High-cylinder Anti-Reflective</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-[#0F172A] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              <span>Pupillary Distance Alignment (IPD)</span>
              <span className="text-indigo-600 dark:text-[#2BBFFF] font-mono font-bold">{ipd} mm</span>
            </div>
            <input
              type="range"
              min="50"
              max="80"
              step="1"
              value={ipd}
              onChange={(e) => setIpd(parseInt(e.target.value))}
              className="w-full accent-[#4F46E5] dark:accent-[#2BBFFF]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-[#EAE6DF] dark:border-neutral-800 pt-4">
        <span className="text-xs text-neutral-500 max-w-sm">
          ⚠️ Optical showroom is connected via real-time hooks to clinical prescription folders. Direct invoice creates a financial credit.
        </span>
        <button
          onClick={handleCreateOrder}
          type="button"
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3B32C1] text-white text-xs font-black rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer font-sans"
        >
          💎 Register Custom Ophthalmic Frame Assembly
        </button>
      </div>

      <div className="pt-4 border-t border-[#EAE6DF]/60 dark:border-neutral-800/60 font-sans">
        <h4 className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase mb-2">Showroom Dispatch Ledger</h4>
        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-900 text-[10px] uppercase font-mono text-neutral-400">
                <th className="p-2">Assembly ID</th>
                <th className="p-2">Frame Model</th>
                <th className="p-2">Material</th>
                <th className="p-2">Selected Lenses</th>
                <th className="p-2 text-center">IPD Class</th>
                <th className="p-2 text-right">Invoice value</th>
                <th className="p-2 text-center font-bold">Assembly Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
              {filteredOrders.map((ord, i) => (
                <tr key={i} className="hover:bg-slate-50/45 dark:hover:bg-neutral-800/40">
                  <td className="p-2 font-mono font-bold text-neutral-850 dark:text-white">{ord.id}</td>
                  <td className="p-2 font-semibold text-neutral-700 dark:text-neutral-300">{ord.model}</td>
                  <td className="p-2 text-neutral-500 font-mono text-[10px]">{ord.material}</td>
                  <td className="p-2 text-neutral-600 dark:text-neutral-400 italic leading-none">{ord.lens}</td>
                  <td className="p-2 text-center font-mono">{ord.ipd}</td>
                  <td className="p-2 text-right font-bold text-emerald-600 font-mono">{ord.price}</td>
                  <td className="p-2 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700">
                      {ord.status}
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

interface OpticalLabQueueProps {
  activeFilter: string;
}

function OpticalLabQueue({ activeFilter }: OpticalLabQueueProps) {
  const tasks = [
    { id: "LAB-8812", patientName: "Alexander Sterling", eye: "OD (Right)", sphere: "-4.25", cylinder: "-1.50", axis: "180", process: "Generator Cut & Smooth", completion: 85, brand: "RayBan" },
    { id: "LAB-8813", patientName: "Alexander Sterling", eye: "OS (Left)", sphere: "-3.75", cylinder: "-1.25", axis: "175", process: "Fining and Polishing Block", completion: 60, brand: "RayBan" },
    { id: "LAB-8814", patientName: "Robert Giles", eye: "OD (Right)", sphere: "+1.50", cylinder: "+0.50", axis: "90", process: "Beveling & Sizing Rim Edger", completion: 30, brand: "Silhouette" },
    { id: "LAB-8815", patientName: "Nadia Malik", eye: "OS (Left)", sphere: "-1.00", cylinder: "DS", axis: "-", process: "Anti-reflective Vacuum Bake", completion: 10, brand: "Silhouette" }
  ];

  const filteredTasks = tasks.filter(tsk => {
    if (activeFilter === "All") return true;
    if (activeFilter === "RayBan") return tsk.brand === "RayBan";
    if (activeFilter === "Silhouette") return tsk.brand === "Silhouette";
    return true;
  });

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-[#EAE6DF] dark:border-neutral-850">
        <div>
          <h4 className="text-xs font-black text-neutral-800 dark:text-white uppercase font-sans">Surfacing & Edging Clinical Lab Queue</h4>
          <p className="text-[10px] text-neutral-450 font-sans">Real-time status of prescription lenses grinding and polishing</p>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border border-emerald-150 rounded-lg font-mono">
          Generator Hub online
        </span>
      </div>

      <div className="overflow-x-auto font-sans text-xs">
        <table className="w-full text-left text-neutral-600 dark:text-neutral-300 border-collapse">
          <thead>
            <tr className="border-b border-[#EAE6DF] dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="p-2">Task Ref</th>
              <th className="p-2">Clinical Beneficiary</th>
              <th className="p-2">Target Eye</th>
              <th className="p-2">Sphere</th>
              <th className="p-2">Cylinder</th>
              <th className="p-2 font-mono">Axis Direction</th>
              <th className="p-2 font-sans font-bold">Active Station Machine</th>
              <th className="p-2 text-center font-bold">Finishing Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]/40 dark:divide-neutral-800/40 text-neutral-800 dark:text-neutral-200">
            {filteredTasks.map((tsk, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/40">
                <td className="p-2.5 font-mono font-bold text-neutral-800 dark:text-white">{tsk.id}</td>
                <td className="p-2.5 font-bold text-neutral-700 dark:text-neutral-300">{tsk.patientName}</td>
                <td className="p-2.5 font-semibold text-indigo-600 font-mono text-[11px]">{tsk.eye}</td>
                <td className="p-2.5 font-mono font-bold">{tsk.sphere}</td>
                <td className="p-2.5 font-mono">{tsk.cylinder}</td>
                <td className="p-2.5 font-mono text-neutral-400 text-[10px]">{tsk.axis}°</td>
                <td className="p-2.5 font-mono text-[11px] font-semibold text-neutral-500">{tsk.process}</td>
                <td className="p-2.5 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-24 bg-slate-100 dark:bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-200">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${tsk.completion}%` }}></div>
                    </div>
                    <span className="font-mono font-bold text-[10px] text-neutral-500">{tsk.completion}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
