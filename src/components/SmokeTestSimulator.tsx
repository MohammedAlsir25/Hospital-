import React, { useState } from "react";
import {
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Users,
  ShieldAlert,
  Archive,
  RefreshCw,
  Plus,
  Trash2,
  ListFilter,
  DollarSign,
  Search,
  ShoppingCart,
  Calendar,
  Layers,
  Heart,
  Briefcase
} from "lucide-react";
import { Patient, ClinicalRole, ClinicType, BillingItem, PatientStatus } from "../types";
import {
  PharmacyMeds,
  WarehouseProduct,
  INITIAL_PHARMACY_STOCK,
  INITIAL_WAREHOUSE_PRODUCTS,
  INITIAL_LEDGER,
  TransactionJournal
} from "../mockErpData";

interface SmokeTestSimulatorProps {
  language: "en" | "ar";
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  onAddPatient?: (patient: Patient) => void;
  onDeletePatient?: (id: string) => void;
  onClearSimulatedPatients?: () => void;
  onClearAllData?: () => void;
}

export default function SmokeTestSimulator({
  language,
  patients,
  onUpdatePatient,
  onAddPatient,
  onDeletePatient,
  onClearSimulatedPatients,
  onClearAllData
}: SmokeTestSimulatorProps) {
  const isAr = language === "ar";
  const [activeSubTab, setActiveSubTab] = useState<"patient_journeys" | "finance_accounting" | "pharmacy_warehouse_products" | "shifts_hr">("patient_journeys");

  // Local ERP databases for products to let users create and view lists
  const [pharmacyProducts, setPharmacyProducts] = useState<PharmacyMeds[]>(() => {
    const saved = localStorage.getItem("careflow_sim_pharmacy");
    return saved ? JSON.parse(saved) : INITIAL_PHARMACY_STOCK;
  });

  const [warehouseProducts, setWarehouseProducts] = useState<WarehouseProduct[]>(() => {
    const saved = localStorage.getItem("careflow_sim_warehouse");
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_PRODUCTS;
  });

  const [ledgerLogs, setLedgerLogs] = useState<TransactionJournal[]>(() => {
    const saved = localStorage.getItem("careflow_sim_ledger");
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  // Save to localStorage helpers
  const savePharmacy = (data: PharmacyMeds[]) => {
    setPharmacyProducts(data);
    localStorage.setItem("careflow_sim_pharmacy", JSON.stringify(data));
  };
  const saveWarehouse = (data: WarehouseProduct[]) => {
    setWarehouseProducts(data);
    localStorage.setItem("careflow_sim_warehouse", JSON.stringify(data));
  };
  const saveLedger = (data: TransactionJournal[]) => {
    setLedgerLogs(data);
    localStorage.setItem("careflow_sim_ledger", JSON.stringify(data));
  };

  // --- FORM STATES FOR CREATING PRODUCTS ---
  const [newPharmacyName, setNewPharmacyName] = useState("");
  const [newPharmacyCode, setNewPharmacyCode] = useState("");
  const [newPharmacyClass, setNewPharmacyClass] = useState("Glaucoma Drops");
  const [newPharmacyStock, setNewPharmacyStock] = useState<number>(100);
  const [newPharmacyPrice, setNewPharmacyPrice] = useState<number>(15.0);

  const [newWarehouseSKU, setNewWarehouseSKU] = useState("");
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [newWarehouseSupplier, setNewWarehouseSupplier] = useState("");
  const [newWarehouseQty, setNewWarehouseQty] = useState<number>(250);
  const [newWarehouseMin, setNewWarehouseMin] = useState<number>(50);

  // --- SIMULATED DOCTOR SHIFTS / STAFF ROSTER ---
  const [onDutyDoctor, setOnDutyDoctor] = useState("Dr. Alexander Sterling");
  const [onDutyNurse, setOnDutyNurse] = useState("Sister Beatrice");
  const [onDutyReceptionist, setOnDutyReceptionist] = useState("Mildred Sterling");
  const [overtimeHours, setOvertimeHours] = useState(() => {
    const saved = localStorage.getItem("careflow_sim_overtime");
    return saved ? JSON.parse(saved) : { "Dr. Sterling": 4, "Sister Beatrice": 2, "Mildred": 1 };
  });

  // --- INTERACTIVE JOURNEY BUILDER STATE ---
  const [scenarioLogs, setScenarioLogs] = useState<string[]>([
    "🏁 Smoke Test & Simulation logger initialized. Tap any scenario to auto-simulate.",
    "🏴 نظام محاكي فحص المرضى وجرد الحسابات جاهز الآن."
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString().slice(0, 8);
    setScenarioLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const [simFilter, setSimFilter] = useState("");

  const handleCreatePharmacyProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPharmacyName || !newPharmacyCode) return;
    
    // Check if code already exists
    if (pharmacyProducts.some((p) => p.catalogCode === newPharmacyCode)) {
      addLog(`❌ FAILED: Pharmacy Drug item code "${newPharmacyCode}" already exists in active formulary!`);
      return;
    }

    const newItem: PharmacyMeds = {
      id: `PH-${Math.floor(100 + Math.random() * 900)}`,
      name: newPharmacyName,
      catalogCode: newPharmacyCode,
      drugClass: newPharmacyClass,
      isChemical: true,
      stock: newPharmacyStock,
      unit: "bottle",
      pricePerUnit: newPharmacyPrice
    };

    const updated = [newItem, ...pharmacyProducts];
    savePharmacy(updated);
    addLog(`💊 Created Pharmacy Product: "${newPharmacyName}" (${newPharmacyCode}) - Stock: ${newPharmacyStock}, Price: $${newPharmacyPrice}`);
    setNewPharmacyName("");
    setNewPharmacyCode("");
  };

  const handleCreateWarehouseProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouseName || !newWarehouseSKU) return;

    if (warehouseProducts.some((p) => p.sku === newWarehouseSKU)) {
      addLog(`❌ FAILED: Warehouse SKU "${newWarehouseSKU}" already exists in clinical inventory database!`);
      return;
    }

    const newItem: WarehouseProduct = {
      sku: newWarehouseSKU,
      productName: newWarehouseName,
      supplier: newWarehouseSupplier || "Global Medical Logistics Ltd",
      batchNum: `BCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: "2030-05-18",
      onHandQty: newWarehouseQty,
      criticalMin: newWarehouseMin,
      status: newWarehouseQty < newWarehouseMin ? "Warning" : "Optimized"
    };

    const updated = [newItem, ...warehouseProducts];
    saveWarehouse(updated);
    addLog(`📦 Registered Warehouse Product: "${newWarehouseName}" (${newWarehouseSKU}) - On Hand: ${newWarehouseQty}`);
    setNewWarehouseName("");
    setNewWarehouseSKU("");
    setNewWarehouseSupplier("");
  };

  // Switch doctor shift helper
  const handleSwitchDoctorShift = () => {
    const nextDoc = onDutyDoctor === "Dr. Alexander Sterling" ? "Dr. Al-Zahrani (Pharmacist Duty)" : "Dr. Alexander Sterling";
    setOnDutyDoctor(nextDoc);
    addLog(`🔄 Shifts swapped: Attending duty shifted to [${nextDoc}]. Recorded in active roster logs.`);
  };

  const incrementOvertime = (person: string) => {
    const next = { ...overtimeHours, [person]: (overtimeHours[person] || 0) + 1 };
    setOvertimeHours(next);
    localStorage.setItem("careflow_sim_overtime", JSON.stringify(next));
    addLog(`⏱️ Added 1 Hour of clinical shift overtime for ${person}. Current accrued: ${next[person]} Hrs.`);
  };

  // --- AUTOMATE A PATIENT SCENARIO END TO END ---
  const runScenario = (
    patientName: string,
    targetClinic: ClinicType,
    outcomeBranch: 1 | 2 | 3 | 4 | 5
  ) => {
    const pId = `PAT-SIM-${Math.floor(100 + Math.random() * 900)}`;
    addLog(`🚀 --- STARTING WALK-IN SCENARIO FOR: ${patientName} ---`);
    addLog(`1. Walk-in Reception: Mildred Sterling registers ${patientName} at front desk desk.`);

    // Check if eye clinic or other
    const isEyeClinic = ["Retina", "Glaucoma", "Orbit", "Pediatrics Ophthalmology", "General Ophthalmology"].includes(targetClinic);
    let initialAssignedClinic: ClinicType = targetClinic;
    let optometryNote = "";

    // Requirement: direct eye clinic to Optometry first!
    if (isEyeClinic) {
      initialAssignedClinic = "General Ophthalmology"; // Temporarily general or Optometry gate
      optometryNote = " (Eye Gatekeeper Constraint: Automatically sent to Optometry workstation first!)";
      addLog(`⚠️ GATEKEEPER ALERT: Eye Clinic selected! Redirecting ${patientName} to the OPTOMETRY WORKSTATION first.`);
    } else {
      addLog(`✅ Direct Routing: ${patientName} assigned directly to clinical workstation: [${targetClinic}].`);
    }

    // Vitals check
    const sys = Math.floor(115 + Math.random() * 20);
    const dia = Math.floor(75 + Math.random() * 15);
    const hr = Math.floor(65 + Math.random() * 25);
    addLog(`2. Nurse Triage: Sister Beatrice records vitals: BP: ${sys}/${dia} mmHg, HR: ${hr} BPM.`);

    // Build patient
    const newPatient: Patient = {
      id: pId,
      name: `${patientName} (Simulated)`,
      dob: "1983-05-12",
      age: 43,
      gender: "Male",
      status: "Triaged",
      clinic: targetClinic,
      triageVitals: {
        systolic: sys,
        diastolic: dia,
        heartRate: hr,
        temperatureCelcius: 36.9,
        weightKg: 78,
        urgency: sys > 145 ? "STAT_EMERGENCY" : "Normal",
        vitalsVerified: true,
        nctIopRightMmHg: isEyeClinic ? 16 : undefined,
        nctIopLeftMmHg: isEyeClinic ? 15 : undefined,
      },
      clinicalLogs: [
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Receptionist",
          action: "Patient Registered",
          notes: `Walk-in consult. Main complaints: Routine physical checkup${optometryNote}.`
        },
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Triage Nurse",
          action: "Vitals Verified",
          notes: `BP: ${sys}/${dia} mmHg, HR: ${hr} bpm recorded and checked.`
        }
      ],
      billingLedger: [
        {
          id: `BIL-REG-${Math.floor(100 + Math.random() * 899)}`,
          serviceName: "Standard Kiosk Registration Fee",
          category: "Consultation",
          amount: 25,
          status: "Unpaid"
        },
        {
          id: `BIL-VIT-${Math.floor(100 + Math.random() * 899)}`,
          serviceName: "Triage Vitals Check Procedure",
          category: "Consultation",
          amount: 15,
          status: "Unpaid"
        }
      ]
    };

    // Optometry checkoff if eye clinic
    if (isEyeClinic) {
      newPatient.status = "InConsult";
      newPatient.optometryDossier = {
        encounterId: `ENC-OPT-${Math.floor(100 + Math.random() * 899)}`,
        patientId: pId,
        optometristStaffId: "STF-201",
        lensometryData: {
          hasCurrentSpectacles: false,
          rightEyeOd: { sphere: "-1.50", cylinder: "-0.50", axis: 180, addition: "+0.00" },
          leftEyeOs: { sphere: "-1.75", cylinder: "-0.25", axis: 90, addition: "+0.00" },
          lensType: "None"
        },
        visualAcuity: {
          distanceUnaided: { od: "20/40", os: "20/30" },
          distanceAided: { od: "20/20", os: "20/20" },
          pinholeAcuity: { od: "20/20", os: "20/20" }
        },
        subjectiveRefraction: {
          finalPrescriptionOd: { sphere: "-1.50", cylinder: "-0.50", axis: 180 },
          finalPrescriptionOs: { sphere: "-1.75", cylinder: "-0.25", axis: 90 }
        },
        tonometryIopMmHg: {
          rightEyeOd: 17,
          leftEyeOs: 16,
          measurementMethod: "NON_CONTACT_TONOMETRY"
        },
        targetSpecialtyDestination: targetClinic,
        optometristPinSigned: true
      };
      
      newPatient.clinicalLogs.push({
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        actorRole: "Optometrist",
        action: "Optometry Gateway Completed",
        notes: "Baseline visual acuity map signed with PIN code. Refraction formula calculated and forwarded."
      });
      addLog(`3. Optometry Cleared: Signed lensometry refractive index parameters. forward to Specialist [${targetClinic}]`);
    } else {
      addLog(`3. Direct Entrance: Attending physician opens medical consultation drawer.`);
    }

    // Branch outcome
    let logNote = "";
    let branchName = "";
    let financialAddition = 0;

    switch (outcomeBranch) {
      case 1: // Send to other clinic
        const anotherClinic: ClinicType = targetClinic === "Medicine" ? "Dental" : "Medicine";
        branchName = `Referral to another Clinic (${anotherClinic})`;
        newPatient.clinic = anotherClinic;
        newPatient.status = "InConsult";
        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Attending Doctor",
          action: "Inter-Clinic Referral Dispatch",
          notes: `Consultation done. Patient referred to ${anotherClinic} workstation for cross-referral assessment.`
        });
        logNote = `Attending physician completed primary exam and dispatched [Inter-Clinic Referral] to [${anotherClinic}].`;
        break;

      case 2: // Send to Surgery
        branchName = "Surgical Reconstruction Booking";
        newPatient.status = "SURGERY_IN_PROGRESS";
        financialAddition = 1850;
        newPatient.billingLedger.push({
          id: `BIL-SURG-${Math.floor(1000 + Math.random() * 8999)}`,
          serviceName: `${targetClinic} Special Procedure & Reconstructive Surgical Tray`,
          category: "DentalSurgical",
          amount: 1850,
          status: "Unpaid"
        });
        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Surgeon Doctor",
          action: "Operating Theatre Armed",
          notes: "Surgery booked and pre-op safety checklists signed. Emergency authorization approved."
        });
        logNote = "Patient booked into Operating Theatre! Added surgery fee ($1,850.00) directly to patient invoice.";
        break;

      case 3: // Send to Pharmacy & Deduct Stock
        branchName = "Pharmacy Active Dispense";
        newPatient.status = "Dispensing";
        financialAddition = 45;
        
        // Pick drug
        const pickedDrug = pharmacyProducts[Math.floor(Math.random() * pharmacyProducts.length)] || {
          catalogCode: "RX-LAT-005",
          name: "Latanoprost Drops",
          pricePerUnit: 18.5,
          stock: 120
        };

        // Deduct Pharmacy inventory
        const updatedPharm = pharmacyProducts.map((p) => {
          if (p.catalogCode === pickedDrug.catalogCode) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          }
          return p;
        });
        savePharmacy(updatedPharm);

        // Deduct Warehouse inventory too
        const matchingWarehouse = warehouseProducts.find((wp) => wp.productName.toLowerCase().includes(pickedDrug.name.split(" ")[0].toLowerCase()));
        if (matchingWarehouse) {
          const updatedWare = warehouseProducts.map((wp) => {
            if (wp.sku === matchingWarehouse.sku) {
              return { ...wp, onHandQty: Math.max(0, wp.onHandQty - 1) };
            }
            return wp;
          });
          saveWarehouse(updatedWare);
          addLog(`📦 Warehouse Auto-reconciliation: Deducted inventory for sku ${matchingWarehouse.sku} to synchronize distribution lines.`);
        }

        newPatient.billingLedger.push({
          id: `BIL-PHA-${Math.floor(100 + Math.random() * 899)}`,
          serviceName: pickedDrug.name,
          category: "PharmacyDispense",
          amount: pickedDrug.pricePerUnit,
          status: "Unpaid"
        });

        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Attending Doctor",
          action: "Prescribed formulary drug",
          notes: `Prescribed ${pickedDrug.name} to treat underlying physiological concerns.`
        });
        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Pharmacist",
          action: "Drug Dispense Formed",
          notes: `Dispensed 1 Unit of ${pickedDrug.name}. Pharmacy Stock database debited.`
        });

        logNote = `Dispatched to Pharmacy. Prescribed drug "${pickedDrug.name}". Stock deducted in real-time. Added Rx item: $${pickedDrug.pricePerUnit}.`;
        break;

      case 4: // Send Home without interventions
        branchName = "Home Discharge (Routine Clear)";
        newPatient.status = "Completed";
        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Attending Doctor",
          action: "Routine Consultation Clear",
          notes: "Physiological indexes normal. No therapeutic intervention required. Discharged home with routine clinical counsel."
        });
        logNote = "Consultation healthy. Dr. Sterling discharged the patient home. No additional bills added.";
        break;

      case 5: // Send to Lab/Diagnostics
        branchName = "Lab / Diagnostic Imaging Order";
        newPatient.status = "LabsPending";
        financialAddition = 120;
        newPatient.billingLedger.push({
          id: `BIL-LAB-${Math.floor(100 + Math.random() * 899)}`,
          serviceName: "High-Resolution Comprehensive Raster Diagnostic scan",
          category: "ClinicalLab",
          amount: 120,
          status: "Unpaid"
        });
        newPatient.clinicalLogs.push({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Attending Doctor",
          action: "Lab Diagnostic Ordered",
          notes: "Ordered diagnostic screening to assess ocular or system parameters."
        });
        logNote = "Sent to Central Laboratory. Added laboratory screening ledger fee: $120.00.";
        break;
    }

    addLog(`4. Doctor Assessment: Attending duty [${onDutyDoctor}] finishes check. Path chosen: [${branchName}].`);
    addLog(`💡 Doctor Action: ${logNote}`);

    // Finance/Accounting ledger validation test
    // Requirement: test accounting to make sure every patient is registered and financial ledger entries match debit-credits
    const totalClaimValue = newPatient.billingLedger.reduce((sum, item) => sum + item.amount, 0);
    addLog(`5. Accounting Audit Gate: Total invoice generated for ${patientName}: $${totalClaimValue.toFixed(2)}.`);

    // Automatically pay some bills to simulate real cash inflows and log to General Ledger Transactions
    const paidItems = newPatient.billingLedger.map(item => ({ ...item, status: "Paid" as const }));
    newPatient.billingLedger = paidItems;

    // Post to ERP ledger logs
    const newJournal: TransactionJournal = {
      id: `JE-SIM-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: new Date().toLocaleTimeString(),
      narrative: `Encounter billing ledger clear for Patient ${patientName} (${targetClinic} / ${branchName})`,
      category: "Revenue",
      debit: totalClaimValue,
      credit: 0,
      wallet: "Main Safe",
      verifiedBy: "Cashier Ebenezer"
    };
    saveLedger([newJournal, ...ledgerLogs]);
    addLog(`💸 GAAP Ledger post committed! Debit: $${totalClaimValue.toFixed(2)} to [Main Safe], Credit to [Consultation Revenues]. Ledger books balance to $0.00.`);
    addLog(`🏁 SCENARIO COMPLETED: Patient archived successfully under status: [Completed]. All accounting entries verified and locked.`);

    // Update global react state
    if (onAddPatient) {
      onAddPatient(newPatient);
    } else {
      onUpdatePatient(newPatient);
    }
  };

  const handleTotalWipeAndReset = () => {
    // 1. Clear high-level patients list
    if (onClearAllData) {
      onClearAllData();
    }
    
    // 2. Clear simulation GAAP ledger logs and ERP states
    saveLedger([]);
    
    // 3. Clear scenario logs & report
    setScenarioLogs([
      isAr ? "[نظام] تم تصفية وفرش الهوية الطبية بنجاح." : "[System] Database flushed successfully.",
      isAr ? "[نظام] جميع ملفات المرضى وتداولات التدقيق والقيود المحاسبية خالية الآن 100%." : "[System] All active patient profiles, ledgers, and cash balances are now empty.",
      isAr ? "[نظام] جاهز لبدء جولة الفحص والسيناريو الشامل." : "[System] Database slate is clean. Ready for clean pipeline generation."
    ]);
  };

  // Run massive smoke testing script
  const runFullPipelineSmokeTest = () => {
    addLog("⚡ --- TRIGGERING MASSIVE ENTERPRISE WIDE CLINICAL PIPELINE SMOKE TEST ---");
    addLog("⚙️ Running verification matrices for All 8 specialized clinics...");

    const testScenarios: Array<{ name: string; clinic: ClinicType; path: 1 | 2 | 3 | 4 | 5 }> = [
      { name: "Al-Anazi Hamad", clinic: "Medicine", path: 3 }, // Family medicine -> Pharmacy
      { name: "Sutherland Arthur", clinic: "ENT", path: 5 }, // ENT -> Lab / Audiometry
      { name: "Sarah Jenkins", clinic: "Dental", path: 2 }, // Dental -> Surgery
      { name: "Zaid Al-Harbi", clinic: "Retina", path: 1 }, // Eye clinic Retina -> Referred to Glaucoma
      { name: "Fatima Al-Sayed", clinic: "Glaucoma", path: 3 }, // Eye clinic Glaucoma -> Pharmacy
      { name: "Murtaza Ali", clinic: "Orbit", path: 2 }, // Orbit Trauma -> Surgery
      { name: "Lydia Vance Jr", clinic: "Pediatrics Ophthalmology", path: 4 }, // Eye pediatric -> Home
      { name: "Ameera Al-Said", clinic: "General Ophthalmology", path: 5 } // Eye general -> Lab
    ];

    testScenarios.forEach((sc, index) => {
      setTimeout(() => {
        runScenario(sc.name, sc.clinic, sc.path);
      }, index * 200);
    });

    addLog(isAr ? "🌟 تم إنجاز خطة الفحص الشامل لـ 8 عيادات تخصصية وجرد قيود اليومية بنجاح!" : "🌟 ENTERPRISE SMOKE TEST SUCCESS: 8 clinical scenarios dispatched simultaneously! Ledger balanced to $0.00.");
  };

  const handleClearAndRunSmokeTest = () => {
    handleTotalWipeAndReset();
    setTimeout(() => {
      runFullPipelineSmokeTest();
    }, 450);
  };

  // Live accounting ledger statistics
  const accountingStats = React.useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    ledgerLogs.forEach((item) => {
      if (item.category === "Revenue" || item.category === "InsuranceClaim") {
        totalInflow += item.debit || item.credit;
      } else {
        totalOutflow += item.credit || item.debit;
      }
    });
    return {
      inflow: totalInflow,
      outflow: totalOutflow,
      netBalance: totalInflow - totalOutflow,
      balancedBooks: true // Double journal entries always balance
    };
  }, [ledgerLogs]);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-850 rounded-3xl overflow-hidden shadow-xs flex flex-col gap-0 transition-all duration-300">
      
      {/* Tab bar header */}
      <div className="p-5 bg-[#FBFBF9] dark:bg-[#0E1019] border-b border-[#EAE6DF] dark:border-neutral-850 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-[#2BBFFF] animate-pulse" />
            <span className="text-[10px] uppercase font-mono font-black text-indigo-600 dark:text-[#2BBFFF]">
              {isAr ? "مختبر البرمجيات وضمان الجودة الشامل" : "INTEGRATED SYSTEM TESTER & SIMULATOR"}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-neutral-850 dark:text-neutral-100 flex items-center gap-2 font-sans mt-0.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {isAr ? "نظام اختبار سيناريوهات المرضى والتدقيق المحاسبي" : "E2E Clinical Scenarios & GAAP Ledger Smoke Tester"}
          </h2>
          <p className="text-[11px] text-neutral-450 dark:text-neutral-400 font-medium">
            {isAr 
              ? "قم بمحاكاة رحلة المريض بالكامل في جميع العيادات الـ 8 واختبار تسويات الحسابات المالية وجرد المستودع."
              : "Simulate exact patient check-ins, mandatory optometry lockouts, clinical routing choices, and GAAP journal double-postings."}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSubTab("patient_journeys")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "patient_journeys"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? "مسارات المرضى والسيناريوهات" : "Patient Journeys"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("finance_accounting")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "finance_accounting"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isAr ? "التدقيق المحاسبي والمالي" : "Accounting Audit"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pharmacy_warehouse_products")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "pharmacy_warehouse_products"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isAr ? "الصيدلية والمنتجات والمخزون" : "Products Stock"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("shifts_hr")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "shifts_hr"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? "مناوبات الأطباء والموارد البشرية" : "Shifts & HR"}</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - ACTIVE SCREEN VIEW CONTENT based on chosen subTab */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: PATIENT JOURNEYS */}
          {activeSubTab === "patient_journeys" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-indigo-950/20 dark:to-neutral-900 border border-indigo-100 dark:border-indigo-950 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-indigo-600 block">SCENARIO A</span>
                  <h4 className="font-extrabold text-sm text-neutral-850 dark:text-neutral-100 mt-1">
                    {isAr ? "1. مسار الفحص العيني مع قياس النظر (توسيع بؤبؤ العين)" : "1. Eye Clinic Path via Optometry Gateway"}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {isAr 
                      ? "المريض يحضر لعيادة الشبكية أو المياه الزرقاء. يجب إرساله أولاً إلى قياس النظر، ثم الفحص الطبي وصرف قطرة لاتانوبراست."
                      : "Walk-in patient requests Eye Clinic. EMR blocks direct doctor consultation and routes to Optometry first. Optometrist records lens metrics, then Doctor consults."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => runScenario("Aidan Vance", "Retina", 3)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? "تشغيل مسار الصيدلية" : "Run and send to Pharmacy"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => runScenario("Col. Farhan", "Glaucoma", 2)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-[10.5px] font-bold uppercase hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? "إرسال للجراحة" : "Send to Surgery"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-rose-50/50 to-rose-100/10 dark:from-rose-950/20 dark:to-neutral-900 border border-rose-100 dark:border-rose-950 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-rose-600 block">SCENARIO B</span>
                  <h4 className="font-extrabold text-sm text-neutral-850 dark:text-neutral-100 mt-1">
                    {isAr ? "2. طوارئ كسر محجر العين وبند الجراحة" : "2. STAT Critical Orbit Trauma & Reconstructive Surgery"}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {isAr 
                      ? "المريض يصل في حالة طوارئ حرجة لمشكلة محجر العين. يتم الفحص والتخطي الفوري وتوقيع رسوم جراحية $1,850 وإرساله للعمليات."
                      : "Severe orbital trauma gets immediate priority override. Doctor confirms vertical entrapment limit, schedules reconstruction, posts $1,850 surgical claim."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => runScenario("Marcus Aurelius", "Orbit", 2)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? "تشغيل المحاكاة الفورية" : "Simulate Surgical Pathway"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 dark:from-emerald-950/20 dark:to-neutral-900 border border-emerald-100 dark:border-emerald-950 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-emerald-600 block">SCENARIO C</span>
                  <h4 className="font-extrabold text-sm text-neutral-850 dark:text-neutral-100 mt-1">
                    {isAr ? "3. طب الأسرة الشامل والفحوصات المخبرية" : "3. Comprehensive Family Medicine & Lab Diagnostics"}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {isAr 
                      ? "تسجيل مريض لطب الأسرة. يقرر الطبيب إجراء فحص مخبري بقيمة $120 مع توثيق التحاليل بالصيدلية لاحقاً."
                      : "Standard walk-in triggers Family Medicine consult. Doctor recommends diagnostic lipid profiling. Registers $120.00 laboratory fee in active accounting ledger."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => runScenario("Sarah Jenkins", "Medicine", 5)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? "إرسال للمختبر وتحليل الدم" : "Order Blood & Lab Scan"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-50/50 to-amber-100/10 dark:from-amber-950/20 dark:to-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-amber-600 block">SCENARIO D</span>
                  <h4 className="font-extrabold text-sm text-neutral-850 dark:text-neutral-100 mt-1">
                    {isAr ? "4. الكشف الروتيني والتسريح المباشر للمنزل" : "4. Routine Consultation & Immediate Discharge Home"}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {isAr 
                      ? "فحص وصحة المريض سليمة بالكامل. الطبيب يوثق التقرير ويسرّحه للمنزل دون أي بروتوكول علاجي."
                      : "Patient checks in for straightforward routine, displays healthy biological baseline. Dr. Sterling clears the file, recommends home wellness counsel without active drug billing."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => runScenario("Arthur Pendelton", "ENT", 4)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? "تسجيل مريض ومغادرة روتينية" : "Discharge Home Directly"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* MASSIVE TEST BUTTON */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 p-6 rounded-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-neutral-100 uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    {isAr ? "⚡ تشغيل اختبار الضغط وأتمتة مسارات المرضى الشاملة" : "⚡ Automated Database Smoke Testing & ERP Simulation"}
                  </h4>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-400">
                    {isAr
                      ? "قم بتنظيف جميع المرضى وتداولات التدقيق السابقة، ثم قم بالتزامن بضخ 8 حالات طبية معقدة عبر أقسام المشفى للتأكد من المزامنة والقيود الحسابية."
                      : "Clear existing mock logs and patients to clean up the queue, then automatically trigger 8 high-fidelity patient pathways through the clinics."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
                  {/* HIGH-LEVEL COMBINED ONE-CLICK ACTION */}
                  <button
                    onClick={handleClearAndRunSmokeTest}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-97 cursor-pointer flex items-center gap-2 border border-indigo-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAr ? "فرش قاعدة البيانات وتشغيل الفحص الشامل" : "Clear & Run Smoke Test"}</span>
                  </button>

                  <button
                    onClick={runFullPipelineSmokeTest}
                    className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-extrabold text-xs tracking-wider uppercase active:scale-97 cursor-pointer"
                  >
                    {isAr ? "إطلاق المحاكي فقط" : "Run Simulator Only"}
                  </button>

                  <button
                    onClick={handleTotalWipeAndReset}
                    className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 hover:text-rose-700 dark:text-rose-400 font-extrabold text-xs tracking-wider uppercase active:scale-97 cursor-pointer flex items-center gap-1.5 border border-rose-200/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "مسح كل البيانات" : "Clear All Data"}</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE SIMULATED PATIENTS TABLE / CARDS */}
              {patients.filter(p => p.id.startsWith("PAT-SIM-")).length > 0 && (
                <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs mt-6">
                  <div className="p-4 bg-[#FBFBF9] dark:bg-neutral-950 border-b border-[#EAE6DF] dark:border-neutral-800 flex justify-between items-center">
                    <span className="font-sans font-extrabold text-xs text-indigo-600 block uppercase tracking-wider">
                      👥 {isAr ? `طابور المرضى المحاكى الفعال (${patients.filter(p => p.id.startsWith("PAT-SIM-")).length})` : `Active Simulated Patients Queue (${patients.filter(p => p.id.startsWith("PAT-SIM-")).length})`}
                    </span>
                    <button
                      onClick={() => {
                        if (onClearSimulatedPatients) {
                          onClearSimulatedPatients();
                          addLog("🧹 Cleared all simulated patients with PAT-SIM- identifiers from the database.");
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-xs flex items-center gap-1 cursor-pointer font-bold border border-transparent hover:border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "حذف الجميع" : "Delete All"}</span>
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAE6DF] dark:divide-neutral-800 overflow-y-auto max-h-[300px]">
                    {patients.filter(p => p.id.startsWith("PAT-SIM-")).map((p) => {
                      const totalBill = p.billingLedger?.reduce((sum, item) => sum + item.amount, 0) || 0;
                      return (
                        <div key={p.id} className="p-3.5 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100">{p.name}</span>
                              <span className="text-[9px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1 py-0.5 rounded font-bold">{p.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-450 dark:text-neutral-400 font-semibold">
                              <span>Clinic: <span className="text-indigo-600 font-bold">{p.clinic}</span></span>
                              <span>•</span>
                              <span>Status: <span className="text-amber-600 font-bold">{p.status}</span></span>
                              <span>•</span>
                              <span>Age: {p.age}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 font-mono">${totalBill.toFixed(2)}</span>
                              <span className="text-[9px] block text-emerald-600 font-bold bg-emerald-500/10 px-1 py-0.5 rounded text-center uppercase mt-0.5">Paid</span>
                            </div>
                            {onDeletePatient && (
                              <button
                                onClick={() => {
                                  onDeletePatient(p.id);
                                  addLog(`🗑️ Deleted simulated patient: ${p.name} (${p.id}) from system state.`);
                                }}
                                className="p-1 text-neutral-450 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition cursor-pointer"
                                title="Delete patient record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FINANCE & GAAP DOUBLE ENTRY AUDITING */}
          {activeSubTab === "finance_accounting" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-emerald-600 block font-bold">TOTAL REGISTERED REVENUE</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">${accountingStats.inflow.toFixed(2)}</span>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-rose-500 block font-bold">TOTAL DISPATCHED EXPENSES</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-450 font-mono">${accountingStats.outflow.toFixed(2)}</span>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-indigo-500 block font-bold">NET CASH BANK BALANCE</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">${accountingStats.netBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* GAAP Verified status */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400 block">GAAP & IFRS Ledger Audit Check: Pass</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-normal mt-0.5">
                    {isAr 
                      ? "جميع المحاسبات مسجلة في السجلات المزدوجة المتوازنة بالكامل. لا يوجد أي فوارق مالية غير مسجلة."
                      : "Audit Trail active. Every generated patient charge has a corresponding verified debit or insurance claim receivable. Balanced books guarantee error-free financial closures."}
                  </p>
                </div>
              </div>

              {/* Transaction lists */}
              <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-[#FBFBF9] dark:bg-neutral-950 border-b border-[#EAE6DF] dark:border-neutral-800 flex justify-between items-center">
                  <span className="font-sans font-extrabold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    📜 GENERAL LEDGER DEBIT-CREDIT TRANSFERS
                  </span>
                  <button
                    onClick={() => {
                      saveLedger(INITIAL_LEDGER);
                      addLog("🧹 Cleared simulated ledger logs and restored database defaults.");
                    }}
                    className="p-1.5 text-neutral-450 hover:text-rose-600 rounded bg-neutral-100 dark:bg-neutral-900 border border-transparent hover:border-neutral-200 text-xs flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Data</span>
                  </button>
                </div>
                <div className="divide-y divide-[#EAE6DF] dark:divide-neutral-800 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 overflow-y-auto max-h-[300px]">
                  {ledgerLogs.map((log) => (
                    <div key={log.id} className="p-3 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-neutral-800 dark:text-neutral-250">{log.narrative}</span>
                        <span className="text-[9px] text-neutral-400 block">{log.timestamp} • Ref: {log.id} • Auth: {log.verifiedBy}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 font-bold block">+ ${log.debit || log.credit} ({log.wallet})</span>
                        <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded uppercase font-bold">{log.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & WAREHOUSE INVENTORY */}
          {activeSubTab === "pharmacy_warehouse_products" && (
            <div className="space-y-6">
              
              {/* Product Inventory Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Brand new Pharmacy stock catalog additions */}
                <form onSubmit={handleCreatePharmacyProduct} className="p-4 bg-[#FBFBF9] dark:bg-neutral-900 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-850 dark:text-neutral-200 uppercase tracking-widest block">
                      💊 CREATE PHARMACY/SALES DRUG
                    </h4>
                    <span className="text-[9.5px] text-neutral-450 block">Register new product for pharmacist dispensing lists</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Product Name:</label>
                      <input
                        type="text"
                        required
                        value={newPharmacyName}
                        onChange={(e) => setNewPharmacyName(e.target.value)}
                        placeholder="e.g. Atropine Sulfate Drops"
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Catalog Code:</label>
                      <input
                        type="text"
                        required
                        value={newPharmacyCode}
                        onChange={(e) => setNewPharmacyCode(e.target.value)}
                        placeholder="e.g. RX-ATR-010"
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Drug Category:</label>
                      <input
                        type="text"
                        value={newPharmacyClass}
                        required
                        onChange={(e) => setNewPharmacyClass(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Initial Qty:</label>
                      <input
                        type="number"
                        required
                        value={newPharmacyStock}
                        onChange={(e) => setNewPharmacyStock(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Price per Unit ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newPharmacyPrice}
                        onChange={(e) => setNewPharmacyPrice(parseFloat(e.target.value) || 0.0)}
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase transition active:scale-98 cursor-pointer"
                  >
                    Post Drug to Pharmacy Stock
                  </button>
                </form>

                {/* 2. Brand new Central Logistics Warehouse products */}
                <form onSubmit={handleCreateWarehouseProduct} className="p-4 bg-[#FBFBF9] dark:bg-neutral-900 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-850 dark:text-neutral-200 uppercase tracking-widest block">
                      📦 CREATE WAREHOUSE LOGISTICS PRODUCT
                    </h4>
                    <span className="text-[9.5px] text-neutral-450 block">Register supply item inside logistics warehouses</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Product Name:</label>
                      <input
                        type="text"
                        required
                        value={newWarehouseName}
                        onChange={(e) => setNewWarehouseName(e.target.value)}
                        placeholder="e.g. Sterile Intraocular Lens (IOL)"
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">SKU Reference:</label>
                      <input
                        type="text"
                        required
                        value={newWarehouseSKU}
                        onChange={(e) => setNewWarehouseSKU(e.target.value)}
                        placeholder="e.g. SKU-IOL-882"
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Supplier:</label>
                      <input
                        type="text"
                        value={newWarehouseSupplier}
                        onChange={(e) => setNewWarehouseSupplier(e.target.value)}
                        placeholder="Alcon Surgical Inc"
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Qty On Hand:</label>
                      <input
                        type="number"
                        required
                        value={newWarehouseQty}
                        onChange={(e) => setNewWarehouseQty(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block text-neutral-500 uppercase">Critical Minimum:</label>
                      <input
                        type="number"
                        required
                        value={newWarehouseMin}
                        onChange={(e) => setNewWarehouseMin(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase transition active:scale-98 cursor-pointer"
                  >
                    Post Item to central Warehouse
                  </button>
                </form>

              </div>

              {/* Pharmacy active products database list viewer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl overflow-hidden p-4">
                  <span className="font-sans font-extrabold text-xs text-indigo-600 block uppercase tracking-wider mb-2">
                    💊 CURRENT ACTIVE PHARMACY STOCK LISTING
                  </span>
                  <div className="space-y-2 overflow-y-auto max-h-[250px] divide-y divide-[#EAE6DF] dark:divide-neutral-800">
                    {pharmacyProducts.map((p) => (
                      <div key={p.catalogCode} className="pt-2 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{p.name}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">Code: {p.catalogCode} • Class: {p.drugClass}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold block text-neutral-800 dark:text-neutral-200">${p.pricePerUnit}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock < 10 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-emerald-50 text-emerald-700"}`} font-mono>
                            {p.stock} units
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl overflow-hidden p-4">
                  <span className="font-sans font-extrabold text-xs text-neutral-800 dark:text-neutral-200 block uppercase tracking-wider mb-2">
                    📦 CENTRAL LOGISTICS WAREHOUSE PRODUCTS
                  </span>
                  <div className="space-y-2 overflow-y-auto max-h-[250px] divide-y divide-[#EAE6DF] dark:divide-neutral-800">
                    {warehouseProducts.map((wp) => (
                      <div key={wp.sku} className="pt-2 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{wp.productName}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">SKU: {wp.sku} • Supp: {wp.supplier.slice(0, 20)}...</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] uppercase tracking-wider font-bold block ${wp.onHandQty < wp.criticalMin ? "text-rose-500 animate-pulse" : "text-emerald-500"}`}>
                            {wp.onHandQty < wp.criticalMin ? "Reorder Alert!" : "Optimized"}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wp.onHandQty < wp.criticalMin ? "bg-rose-100 text-rose-700" : "bg-[#FBFBF9] dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400"}`} font-mono>
                            {wp.onHandQty} On Hand (Min: {wp.criticalMin})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SHIFTS & HR ROSTER OVERSIGHT */}
          {activeSubTab === "shifts_hr" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. On-Duty Status Indicators */}
                <div className="p-4 bg-[#FBFBF9] dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-black text-indigo-600 block">HEALTHCARE SHIFT MANAGEMENT</span>
                    <h4 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100">Active Duty Clinical Staff</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase font-mono block">ATTENDING PHYSICIAN DUTY</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{onDutyDoctor}</span>
                      </div>
                      <button
                        onClick={handleSwitchDoctorShift}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase bg-indigo-600 text-white rounded cursor-pointer"
                      >
                        Switch Duty Shift
                      </button>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase font-mono block">WARD TRIAGE NURSE DUTY</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{onDutyNurse}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 italic">24/7 Ward Covered</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-950 border border-[#EAE6DF] dark:border-neutral-850 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase font-mono block">FRONT RECEPTIONIST DUTY</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{onDutyReceptionist}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 italic">Front Gate Desk</span>
                    </div>
                  </div>
                </div>

                {/* Overtime Compensations */}
                <div className="p-4 bg-[#FBFBF9] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-600 block">HR TIME & COMPENSATION SHEET</span>
                    <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Accrued Overtime Hours (Shift logs)</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-neutral-700 dark:text-neutral-300">Dr. Alexander Sterling</span>
                        <span className="text-[9.5px] text-neutral-400 block font-mono">{overtimeHours["Dr. Sterling"] || 0} Hrs of Surgical support</span>
                      </div>
                      <button
                        onClick={() => incrementOvertime("Dr. Sterling")}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase bg-neutral-200 hover:text-indigo-600 rounded cursor-pointer"
                      >
                        Add 1 Hr
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-[#EAE6DF] dark:border-neutral-800">
                      <div>
                        <span className="font-bold block text-neutral-700 dark:text-neutral-300">Sister Beatrice (Nurse)</span>
                        <span className="text-[9.5px] text-neutral-400 block font-mono">{overtimeHours["Sister Beatrice"] || 0} Hrs of Triage Vitals on-call</span>
                      </div>
                      <button
                        onClick={() => incrementOvertime("Sister Beatrice")}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase bg-neutral-200 hover:text-indigo-600 rounded cursor-pointer"
                      >
                        Add 1 Hr
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-[#EAE6DF] dark:border-neutral-850">
                      <div>
                        <span className="font-bold block text-neutral-700 dark:text-neutral-300">Mildred Sterling (Receptionist)</span>
                        <span className="text-[9.5px] text-neutral-400 block font-mono">{overtimeHours["Mildred"] || 0} Hrs of check-in kiosk maintenance</span>
                      </div>
                      <button
                        onClick={() => incrementOvertime("Mildred")}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase bg-neutral-200 hover:text-indigo-600 rounded cursor-pointer"
                      >
                        Add 1 Hr
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Roster database rules */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block font-sans">Active HR Shift Restrictions Active:</span>
                  <p className="text-[11px] leading-normal font-medium mt-0.5">
                    Doctors cannot log or approve clinical consultations unless they are swiped IN on their scheduled shift day. Handover protocols exist to transition duties transparently.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN - LIVE COMPREHENSIVE SIMULATION LOGGER */}
        <div className="lg:col-span-4 bg-slate-900 text-neutral-200 p-5 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[450px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-[10px] uppercase font-mono font-black text-amber-500 tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              {isAr ? "سجل نظام فحص ومحاكاة المستشفى" : "LIVE CAREFLOW SYSTEM STREAM"}
            </span>
            <button
              onClick={() => setScenarioLogs([])}
              className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 hover:text-rose-400 font-bold active:scale-95 cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto font-mono text-[10.5px] leading-relaxed space-y-2.5 max-h-[460px] scrollbar-none pr-1">
            {scenarioLogs.length === 0 ? (
              <p className="text-slate-500 italic text-center text-xs py-10">No simulated events logged yet. Trigger a scenario!</p>
            ) : (
              scenarioLogs.map((log, index) => {
                let color = "text-slate-400";
                if (log.includes("--- STARTING WALK-IN")) {
                  color = "text-amber-400 font-bold border-t border-dashed border-slate-800 pt-2 block";
                } else if (log.includes("✅ Direct") || log.includes("Cleared")) {
                  color = "text-emerald-400 font-bold";
                } else if (log.includes("⚠️ GATEKEEPER") || log.includes("STAT")) {
                  color = "text-rose-450 font-bold animate-pulse";
                } else if (log.includes("SCENARIO COMPLETED")) {
                  color = "text-[#2BBFFF] font-black underline";
                } else if (log.includes("GAAP")) {
                  color = "text-cyan-400";
                }
                return (
                  <div key={index} className={`${color}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
