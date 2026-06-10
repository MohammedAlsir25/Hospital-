/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  Clock,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  UserPlus,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Inbox,
  Lock,
  ArrowRight,
  Printer,
  ChevronDown,
  Building,
  DollarSign,
  Briefcase,
  AlertCircle,
  QrCode,
  ShieldAlert
} from "lucide-react";
import { Patient, Employee, BillingItem, ClinicType, PatientStatus } from "../types";
import { TransactionJournal } from "../mockErpData";

interface FrontDeskDashboardProps {
  language: "en" | "ar";
  activeRole: string;
  setActiveRole: (role: string) => void;
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  employees: Employee[];
  accountingJournal: TransactionJournal[];
  setAccountingJournal: React.Dispatch<React.SetStateAction<TransactionJournal[]>>;
  onClose: () => void;
}

// Mock Insurance Providers for cleared tiers
const INSURANCE_PROVIDERS = [
  { id: "INS-AXA", name: "AXA Gulf Green Star", copayRate: 0.1, clearanceTime: "Real-time" },
  { id: "INS-DMN", name: "Daman Health Premium (CN1)", copayRate: 0.15, clearanceTime: "Real-time" },
  { id: "INS-BUPA", name: "BUPA Global Executive (Tier 1)", copayRate: 0.05, clearanceTime: "2 mins" },
  { id: "INS-MEDG", name: "Medgulf Standard Saudi Network", copayRate: 0.2, clearanceTime: "Real-time" }
];

export default function FrontDeskDashboard({
  language,
  activeRole,
  setActiveRole,
  patients,
  onAddPatient,
  onUpdatePatient,
  employees,
  accountingJournal,
  setAccountingJournal,
  onClose
}: FrontDeskDashboardProps) {
  // Authorization guard
  const isAuthorized = activeRole === "receptionist" || activeRole === "accountant" || activeRole === "hr_manager";

  // Navigation Tab State (Check-In & Flow, Appointments Scheduler, Front-Desk POS, Insurance Eligibility)
  const [activeTab, setActiveTab] = useState<"checkin" | "scheduler" | "pos" | "eligibility">("checkin");
  
  // Local Context Switcher Dropdown (Main Lobby | VIP Lounge | Self-Service Kiosk)
  const [lobbyContext, setLobbyContext] = useState<"Main Lobby" | "VIP Lounge" | "Self-Service Kiosk">("Main Lobby");

  // Local View Filters for Patient list (All | Waiting | In-Clinic | Discharged)
  const [patientFilter, setPatientFilter] = useState<"All" | "Waiting" | "In-Clinic" | "Discharged">("Waiting");

  // Local state for searching patients
  const [searchQuery, setSearchQuery] = useState("");

  // Appointments states
  const [appointmentDate, setAppointmentDate] = useState("2026-06-11");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [appointmentPatientName, setAppointmentPatientName] = useState("");
  const [appointmentPatientDob, setAppointmentPatientDob] = useState("1990-01-01");
  const [surgeryBlockClinic, setSurgeryBlockClinic] = useState<ClinicType>("General Ophthalmology");
  const [surgeryBlockTime, setSurgeryBlockTime] = useState("12:00");
  const [surgeryBlockNotes, setSurgeryBlockNotes] = useState("");

  // Switch POS Opening / Closing shift state
  const [isShiftActive, setIsShiftActive] = useState(true);
  const [openingFloat, setOpeningFloat] = useState(500);
  const [closingCashInput, setClosingCashInput] = useState(1750);
  const [receiptLog, setReceiptLog] = useState<any[]>([]);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [selectedPayingPatientId, setSelectedPayingPatientId] = useState<string>("");
  const [coPayCustomAmount, setCoPayCustomAmount] = useState<number>(50);

  // Surgery Deposit state
  const [depositPatientId, setDepositPatientId] = useState("");
  const [depositAmount, setDepositAmount] = useState(2500);
  const [depositNotes, setDepositNotes] = useState("Urgent Retinal Vitrectomy Reservation Deposit");

  // ID Swiper simulated state
  const [scannedIdData, setScannedIdData] = useState<any | null>(null);
  const [isSwipingId, setIsSwipingId] = useState(false);

  // Insurance Eligibility simulation state
  const [eligibilityPatientId, setEligibilityPatientId] = useState("");
  const [policyNum, setPolicyNum] = useState("POL-119283");
  const [selectedProviderId, setSelectedProviderId] = useState("INS-DMN");
  const [insuranceResult, setInsuranceResult] = useState<any | null>(null);
  const [isClearingInsurance, setIsClearingInsurance] = useState(false);

  // Mock appointments roster state
  const [appointmentsList, setAppointmentsList] = useState([
    { id: "APT-91", patientName: "Aishah Al-Kamil", dob: "1984-03-24", date: "2026-06-11", time: "08:30", doctorId: "EMP-001", doctorName: "Dr. Alexander Sterling", status: "CONFIRMED" },
    { id: "APT-92", patientName: "Eleanor Rowan", dob: "1972-11-09", date: "2026-06-11", time: "10:15", doctorId: "EMP-001", doctorName: "Dr. Alexander Sterling", status: "CONFIRMED" }
  ]);

  // Toast / Status notify banner
  const [localToast, setLocalToast] = useState<{ msg: string; type: "success" | "warning" | "info" | null }>({ msg: "", type: null });

  const triggerLocalToast = (msg: string, type: "success" | "warning" | "info") => {
    setLocalToast({ msg, type });
    setTimeout(() => {
      setLocalToast({ msg: "", type: null });
    }, 4500);
  };

  // Add Patient Modal State & Registration Fields
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientDob, setNewPatientDob] = useState("1995-01-01");
  const [newPatientGender, setNewPatientGender] = useState<"Male" | "Female">("Male");
  const [newPatientClinic, setNewPatientClinic] = useState<ClinicType>("General Ophthalmology");
  const [newPatientCoPay, setNewPatientCoPay] = useState<number>(50);

  const handleAddNewPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      alert("Name is required");
      return;
    }

    const birthYear = new Date(newPatientDob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    const patientId = `PAT-${Math.floor(100 + Math.random() * 900)}`;

    const newPatientObj: Patient = {
      id: patientId,
      name: newPatientName.trim(),
      dob: newPatientDob,
      age: age >= 0 ? age : 30,
      gender: newPatientGender,
      status: "Registered",
      clinic: newPatientClinic,
      clinicalLogs: [
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Front Desk Registration",
          action: "Patient Ingest Admission",
          notes: `Registered at ${lobbyContext}. Assigned to clinic queue.`
        }
      ],
      billingLedger: [
        {
          id: `BIL-${Math.floor(100 + Math.random() * 900)}`,
          serviceName: "Standard Consultation Co-Pay Fee",
          category: "Consultation",
          amount: Number(newPatientCoPay) || 50,
          status: "Unpaid"
        }
      ]
    };

    onAddPatient(newPatientObj);
    
    // Clear Form & Close
    setNewPatientName("");
    setNewPatientDob("1995-01-01");
    setNewPatientGender("Male");
    setNewPatientClinic("General Ophthalmology");
    setNewPatientCoPay(50);
    setIsAddPatientOpen(false);

    triggerLocalToast(
      language === "ar" 
        ? "تم تسجيل المريض الجديد وإدراجه بنجاح!" 
        : `Patient ${newPatientName} successfully registered in lobby queue!`,
      "success"
    );
  };

  // Live calculations for shift statistics based on Patients & Ledger
  const patientFlowStats = useMemo(() => {
    let list = patients;

    // Filter patients wait-times (average index based on simulated state)
    // Let's calculate lobby distribution count
    const waitingList = list.filter(p => p.status === "Registered" || p.status === "Triaged");
    const consultList = list.filter(p => p.status === "InConsult" || p.status === "LabsPending" || p.status === "Dispensing");
    const dischargedList = list.filter(p => p.status === "Completed" || p.status === "BillingPending");

    const averageWaitTimeMins = waitingList.length > 0 ? Math.floor(waitingList.length * 7.5 + 4) : 0;
    
    // Clinic load (patients per clinic type)
    const loadMap: Record<string, number> = {
      "General Ophthalmology": 0,
      "Retina": 0,
      "Glaucoma": 0,
      "Orbit": 0,
      "Pediatrics Ophthalmology": 0
    };

    list.forEach(p => {
      const c = p.clinic;
      if (c === "Retina" || c === "Glaucoma" || c === "Orbit" || c === "Pediatrics Ophthalmology" || c === "General Ophthalmology") {
        loadMap[c] = (loadMap[c] || 0) + 1;
      } else {
        loadMap["General Ophthalmology"] = (loadMap["General Ophthalmology"] || 0) + 1;
      }
    });

    // Total counts
    return {
      waitingCount: waitingList.length,
      consultingCount: consultList.length,
      dischargedCount: dischargedList.length,
      averageWaitTimeMins,
      clinicLoad: loadMap,
      noShowRate: 12.5 // Constant mock statistic
    };
  }, [patients]);

  // Outstanding patient balance for 1-click ledger pay selection
  const selectedPayingPatientObj = useMemo(() => {
    if (!selectedPayingPatientId) return null;
    return patients.find(p => p.id === selectedPayingPatientId) || null;
  }, [selectedPayingPatientId, patients]);

  const unpaidItemsList = useMemo(() => {
    if (!selectedPayingPatientObj) return [];
    return selectedPayingPatientObj.billingLedger.filter(item => item.status === "Unpaid");
  }, [selectedPayingPatientObj]);

  const totalOutstandingCopay = useMemo(() => {
    return unpaidItemsList.reduce((sum, item) => sum + item.amount, 0);
  }, [unpaidItemsList]);

  // Filter clinical flow table rows dynamically based on local view filters & text search
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // 1. Text filter
      const text = `${p.name} ${p.id} ${p.clinic}`.toLowerCase();
      const matchesText = text.includes(searchQuery.toLowerCase());

      // 2. Status toggle conversion
      // `Waiting` -> Registered | Triaged
      // `In-Clinic` -> InConsult | LabsPending | Dispensing | BillingPending
      // `Discharged` -> Completed
      if (patientFilter === "All") return matchesText;
      
      const status = p.status;
      if (patientFilter === "Waiting") {
        return matchesText && (status === "Registered" || status === "Triaged");
      }
      if (patientFilter === "In-Clinic") {
        return matchesText && (status === "InConsult" || status === "LabsPending" || status === "Dispensing" || status === "BillingPending");
      }
      if (patientFilter === "Discharged") {
        return matchesText && status === "Completed";
      }

      return matchesText;
    });
  }, [patients, patientFilter, searchQuery]);

  // Pagination states for high scaling
  const [lobbyPage, setLobbyPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page relative to filter changes
  useEffect(() => {
    setLobbyPage(1);
  }, [searchQuery, patientFilter]);

  const paginatedPatients = useMemo(() => {
    const startIdx = (lobbyPage - 1) * itemsPerPage;
    return filteredPatients.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredPatients, lobbyPage]);

  // Simulate Emirates ID card swiping / Passport Scanner
  const handleSwipeNationalIdSim = () => {
    setIsSwipingId(true);
    setScannedIdData(null);
    triggerLocalToast(
      language === "ar" ? "جاري قراءة بطاقة الهوية الإماراتية..." : "Initializing Emirates ID reader port...",
      "info"
    );

    setTimeout(() => {
      const mockScanned = {
        fullName: "Dr. Majid bin Rasheed",
        nationalId: "784-1988-1250239-1",
        dob: "1988-08-14",
        expiryDate: "2031-11-20",
        gender: "Male" as const,
        contact: "+971-50-449-3311"
      };
      setScannedIdData(mockScanned);
      setIsSwipingId(false);
      triggerLocalToast(
        language === "ar" ? "تم سحب بيانات الهوية بنجاح!" : "Emirates ID demographics decrypted successfully!",
        "success"
      );
    }, 1200);
  };

  // Convert Scanned Demographic file into a real Registered Patient
  const handleCreatePatientFromScan = () => {
    if (!scannedIdData) return;

    // Check age
    const birthYear = new Date(scannedIdData.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    const newPatient: Patient = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: scannedIdData.fullName,
      dob: scannedIdData.dob,
      age,
      gender: scannedIdData.gender,
      status: "Registered",
      clinic: "General Ophthalmology",
      clinicalLogs: [
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Front Desk Swiper",
          action: "Biometric Auto-Admission",
          notes: `Admitted via Emirati Smart Card biometric gate. Identity Hash 784-X99`
        }
      ],
      billingLedger: [
        {
          id: `BIL-${Math.floor(100 + Math.random() * 900)}`,
          serviceName: "Standard Eye Consultation Fee",
          category: "Consultation",
          amount: 50,
          status: "Unpaid"
        }
      ]
    };

    onAddPatient(newPatient);
    setScannedIdData(null);
    triggerLocalToast(
      language === "ar" ? "تم تسجيل الحساب الجديد وربطه بالملف الديموغرافي!" : "Patient demographic file permanently created in clinical ledger!",
      "success"
    );
  };

  // Check Insurance Eligibility simulated ping
  const handleQueryClearinghouse = () => {
    if (!eligibilityPatientId) {
      alert("Please select a target patient lookup first.");
      return;
    }
    const targetPatient = patients.find(p => p.id === eligibilityPatientId);
    if (!targetPatient) return;

    setIsClearingInsurance(true);
    setInsuranceResult(null);

    setTimeout(() => {
      const selectedProvider = INSURANCE_PROVIDERS.find(ins => ins.id === selectedProviderId) || INSURANCE_PROVIDERS[0];
      
      const mockResult = {
        patientName: targetPatient.name,
        patientId: targetPatient.id,
        status: "APPROVED_ELIGIBLE",
        tier: "VVIP Platinum Saudi Arabian Network A",
        copayPercentage: selectedProvider.copayRate * 100,
        policyNumber: policyNum || "POL-MAX-90111",
        creditThresholdMax: 45000,
        approvedDirectBilling: true
      };

      setInsuranceResult(mockResult);
      setIsClearingInsurance(false);

      // Trigger automatic update of Patient Billing items. We stamp the copay rate
      const updatedBilling = targetPatient.billingLedger.map(item => {
        if (item.status === "Unpaid") {
          // Adjust amount based on the insurance plan copay
          const baseOriginal = item.amount;
          const adjustedCopay = baseOriginal * selectedProvider.copayRate;
          return {
            ...item,
            amount: adjustedCopay,
            serviceName: `${item.serviceName} (Insured ${selectedProvider.name} ${mockResult.copayPercentage}% Co-Pay)`
          };
        }
        return item;
      });

      onUpdatePatient({
        ...targetPatient,
        billingLedger: updatedBilling
      });

      triggerLocalToast(
        language === "ar" ? "تمت الموافقة المباشرة للمطالبة بخصم التأمين!" : "Insurance Direct-Billing Approved! Consultation Co-Pay balance recomputed.",
        "success"
      );
    }, 1500);
  };

  // Handle direct 1-click consultation or balance co-pay collection
  const handleOneClickCoPay = (patientObj: Patient, item: BillingItem) => {
    // 1. Mark patient item as Paid
    const updatedLedger = patientObj.billingLedger.map(b => b.id === item.id ? { ...b, status: "Paid" as const } : b);
    
    // Add clinical audit notes
    const updatedPatient = {
      ...patientObj,
      status: "Triaged" as PatientStatus, // Advance status
      billingLedger: updatedLedger,
      clinicalLogs: [
        ...patientObj.clinicalLogs,
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Front Desk Cashier",
          action: "Direct Co-Pay Settlement",
          notes: `Settled consultation deposit for $${item.amount}. Synchronized active terminal receipt.`
        }
      ]
    };

    onUpdatePatient(updatedPatient);

    // 2. Push direct double-entry ledger post to the Central financial journal
    const newJournalEntry: TransactionJournal = {
      id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Co-Pay Consultation Clearance - Patient [${patientObj.name}] ID: ${patientObj.id}`,
      category: "Revenue",
      debit: item.amount,          // Dr. Wallet Cash
      credit: 0,                   // Cr. Clinic Consultation Sales
      wallet: "Main Safe",
      verifiedBy: "Mildred Desk-1 (receptionist)"
    };

    setAccountingJournal(prev => [newJournalEntry, ...prev]);
    
    // Accumulate local receipt log
    setReceiptLog(prev => [{
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      patientName: patientObj.name,
      patientId: patientObj.id,
      amount: item.amount,
      serviceName: item.serviceName,
      timestamp: new Date().toTimeString().split(" ")[0],
      method: "Credit Card Sweep"
    }, ...prev]);

    triggerLocalToast(
      language === "ar" ? "تم فك قفل الملف المالي وترحيله لكتاب القيود الموحد!" : "Payment ledger balanced and synchronized! Row advanced to Clinician.",
      "success"
    );
  };

  // Surgery Deposit Vault submission
  const handleCollectSurgeryDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositPatientId || !depositAmount) {
      alert("Please provide the patient register and down-payment deposit amount.");
      return;
    }

    const patientObj = patients.find(p => p.id === depositPatientId);
    if (!patientObj) return;

    // Add unearned revenue downpayment to patient ledger
    const depositItem: BillingItem = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      serviceName: `${depositNotes} (${patientObj.name})`,
      category: "DentalSurgical",
      amount: Number(depositAmount),
      status: "Paid"
    };

    const updatedPatient: Patient = {
      ...patientObj,
      billingLedger: [...patientObj.billingLedger, depositItem],
      clinicalLogs: [
        ...patientObj.clinicalLogs,
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Front Desk Cashier",
          action: "Surgical Down-payment Reserved",
          notes: `Accepted deposit of $${depositAmount}. Verified matching Operating Theater booking.`
        }
      ]
    };

    onUpdatePatient(updatedPatient);

    // Write to central finance ledger journal (Double-entry)
    const newJournalEntry: TransactionJournal = {
      id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Pre-Op Surgery Escrow Deposit: ${depositNotes} - Patient ${patientObj.name}`,
      category: "Revenue",
      debit: Number(depositAmount),
      credit: 0,
      wallet: "Standard Chartered Bank",
      verifiedBy: "Mildred Desk-1 (receptionist)"
    };

    setAccountingJournal(prev => [newJournalEntry, ...prev]);

    triggerLocalToast(
      language === "ar" ? "تم قفل وديعة الجراحة وترحيلها لدفتر الحسابات!" : "Surgical Escrow deposit securely collected, synchronized with General Ledger!",
      "success"
    );

    // Clear form
    setDepositAmount(2500);
    setDepositNotes("Cataract Phacoemulsification pre-op escrow deposit reservation");
  };

  // Booking scheduler verification against HR roster (Employees license status / ON_LEAVE checkout)
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentPatientName || !selectedDoctorId) {
      alert("Demographics and physician selections are mandatory.");
      return;
    }

    const selectedPhysician = employees.find(emp => emp.id === selectedDoctorId);
    if (!selectedPhysician) {
      alert("Target physician not found.");
      return;
    }

    // Checking 1: License Validity check
    if (selectedPhysician.licenseExpiryDate) {
      const expDate = new Date(selectedPhysician.licenseExpiryDate);
      const isExpired = expDate.getTime() < new Date().getTime();
      if (isExpired) {
        // Core compliance barrier
        alert(
          `🛑 CLINICAL LIABILITY BLOCK: Dr. ${selectedPhysician.firstName} ${selectedPhysician.lastName} has an EXPIRED medical license (${selectedPhysician.licenseExpiryDate}). The hospital is legally restricted from assigning clinical appointment files.`
        );
        return;
      }
    }

    // Checking 2: ON_LEAVE checkout check
    if (selectedPhysician.employmentStatus === "ON_LEAVE") {
      alert(
        `🛑 DEPUTY LEAVE COLLISION: Dr. ${selectedPhysician.firstName} ${selectedPhysician.lastName} is registered as [ON_LEAVE] inside the HR module. Automated rosters block appointment schedules on selected timeframe.`
      );
      return;
    }

    // Success: add appointment
    const newAppoint = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      patientName: appointmentPatientName,
      dob: appointmentPatientDob,
      date: appointmentDate,
      time: appointmentTime,
      doctorId: selectedPhysician.id,
      doctorName: `Dr. ${selectedPhysician.firstName} ${selectedPhysician.lastName}`,
      status: "CONFIRMED"
    };

    setAppointmentsList(prev => [...prev, newAppoint]);
    triggerLocalToast(
      language === "ar" ? "تم التحقق من رخصة الطبيب وتأكيد الحجز بنجاح!" : `Appointment Confirmed! Dr. ${selectedPhysician.firstName}'s credentials verified, double-entry logged.`,
      "success"
    );

    setAppointmentPatientName("");
  };

  // Block Surgery booking slot
  const handleBlockSurgeryTheater = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLocalToast(
      language === "ar" ? "تم حجز الصالة الجراحية الموحدة لثلاث ساعات!" : `Operating Theater 3-Hour Surgical Slot reserved successfully at ${surgeryBlockTime}!`,
      "success"
    );
    setSurgeryBlockNotes("");
  };

  // Emergency walk-in override: jumps straight to Orbit Trauma room
  const handleEmergencyQueueOverride = (patient: Patient) => {
    const upgradedPatient: Patient = {
      ...patient,
      status: "Triaged" as PatientStatus,
      clinic: "Orbit" as ClinicType, // Direct route to Orbit trauma
      pediatricRedirected: false,
      triageVitals: {
        systolic: 120,
        diastolic: 80,
        heartRate: 110,
        temperatureCelcius: 37,
        weightKg: 70,
        urgency: "STAT_EMERGENCY",
        vitalsVerified: true
      },
      clinicalLogs: [
        ...patient.clinicalLogs,
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Front Desk Overrider",
          action: "STAT EMERGENCY ROUTING OVERRIDE",
          notes: `Walk-in Chemical Splash/Trauma. Jumped clinical queue to direct trauma room.`
        }
      ]
    };

    onUpdatePatient(upgradedPatient);
    triggerLocalToast(
      language === "ar" ? "تم تفعيل حجز الطوارئ ودفع المريض لغرفة العمليات الحيوية!" : `STAT EMERGENCY trigger! ${patient.name} routed immediately to Orbit trauma queue.`,
      "warning"
    );
  };

  // Shift reconcilation calculations
  const shiftReconciliationData = useMemo(() => {
    // Total cash collected during the mock sesion
    const totalCash = openingFloat + receiptLog.reduce((sum, item) => sum + (item.method === "Cash Drop" ? item.amount : 0), 0);
    const totalTransactionsSum = receiptLog.reduce((sum, item) => sum + item.amount, 0);

    // Sum of revenue items in the ledger posted by "Mildred"
    const variance = closingCashInput - (openingFloat + totalTransactionsSum); // expected
    return {
      totalTransactionsSum,
      variance
    };
  }, [openingFloat, receiptLog, closingCashInput]);

  // Z-Report close Shift
  const handleCloseShiftPOS = () => {
    setIsShiftActive(false);
    setIsZReportOpen(true);

    // Post financial aggregated Z-Report into General Ledger
    const zReportLedger: TransactionJournal = {
      id: `ZREP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Aggregated Shift Closing POS Z-Report (Shift ID: DSF-991). Variance: $${shiftReconciliationData.variance.toFixed(2)}`,
      category: "Revenue",
      debit: shiftReconciliationData.totalTransactionsSum,
      credit: 0,
      wallet: "Standard Chartered Bank",
      verifiedBy: "Chief Accountant Ebenezer (Z-Report System Audit)"
    };

    setAccountingJournal(prev => [zReportLedger, ...prev]);
    triggerLocalToast(
      language === "ar" ? "تم قفل الوردية وإدراج قياسات تسوية الخزنة المالية!" : "Drawer shifts locked! Z-Report entries posted to General Ledger accounts.",
      "success"
    );
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F1E46]/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#FBFBF9] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#EAE6DF] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/10">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-[#0F1E46] text-lg uppercase tracking-wide">
              {language === "ar" ? "وصول معزول - كادر الاستقبال والدفع" : "RECEPTION CLEARANCE REQUIRED"}
            </h3>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Front desk registration files and billing co-pay logs require **RECEPTIONIST**, **ACCOUNTANT**, or **HR_MANAGER** administrative credentials in accordance with clinic protocol.
            </p>
          </div>

          <div className="bg-[#EEEDE8] border border-neutral-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 font-bold block">
              YOUR SYSTEM CLEARANCE STATE: <strong className="text-neutral-700 capitalize">{activeRole}</strong>
            </span>
            <button
              onClick={() => setActiveRole("receptionist")}
              className="mt-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black uppercase rounded-lg shadow-md transition-all active:scale-[0.98] duration-100"
            >
              🔐 Activate RECEPTIONIST clearance
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold transition"
          >
            Dismiss & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FBFBF9] z-50 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
        
        {/* Toast Notifier Banner */}
        {localToast.msg && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#0F1E46] border border-[#2BBFFF]/40 text-neutral-100 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl text-xs font-mono font-bold animate-bounce">
            <div className={`w-2.5 h-2.5 rounded-full ${localToast.type === "success" ? "bg-emerald-400" : localToast.type === "warning" ? "bg-amber-400" : "bg-[#2BBFFF]"} animate-pulse`}></div>
            <span>{localToast.msg}</span>
          </div>
        )}

        {/* Level 1: Clean Bright Header Bar */}
        <div className="bg-[#FFFFFF] px-6 py-4 flex items-center justify-between border-b border-[#EAE6DF] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2BBFFF]/10 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wide flex items-center gap-2 text-[#0F172A]">
                {language === "ar" ? "مركز إدارة الاستقبال والإيرادات" : "FRONT DESK & REVENUE COMMAND CENTER"}
                <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  RECEPTIONIST HUB
                </span>
              </h2>
              <p className="text-[10px] font-mono text-neutral-400">
                Lobby admissions, insurance verification, co-pay settlements and HR synchronized calendar schedules.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Local Context Switcher Dropdown */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
              <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase px-1">Lobby:</span>
              <select
                value={lobbyContext}
                onChange={e => {
                  setLobbyContext(e.target.value as any);
                  triggerLocalToast(`Switched terminal desk context to: ${e.target.value}`, "info");
                }}
                className="bg-white text-xs font-bold text-neutral-700 outline-none p-1 rounded border-none cursor-pointer"
              >
                <option value="Main Lobby">Main Lobby Desk</option>
                <option value="VIP Lounge">VIP Lounge Concierge</option>
                <option value="Self-Service Kiosk">Self-Service Desk</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition text-neutral-400 hover:text-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level 2: Bright Unified Flat Tab Bar & Local Filters */}
        <div className="bg-[#FFFFFF] border-b border-[#EAE6DF] px-6 py-3 flex flex-wrap gap-4 items-center justify-between shrink-0">
          
          {/* flat navigation tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("checkin")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 border ${
                activeTab === "checkin"
                  ? "bg-white border-indigo-100 text-indigo-600 shadow-sm font-extrabold"
                  : "border-transparent text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {language === "ar" ? "الدخول والتدفق الجاري" : "Check-In & Flow"}
            </button>
            <button
              onClick={() => setActiveTab("scheduler")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 border ${
                activeTab === "scheduler"
                  ? "bg-white border-indigo-100 text-indigo-600 shadow-sm font-extrabold"
                  : "border-transparent text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {language === "ar" ? "جدولة المواعيد الموحدة" : "Appointments Scheduler"}
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 border ${
                activeTab === "pos"
                  ? "bg-white border-indigo-100 text-indigo-600 shadow-sm font-extrabold"
                  : "border-transparent text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {language === "ar" ? "نقطة بيع الاستقبال" : "Front-Desk POS"}
            </button>
            <button
              onClick={() => setActiveTab("eligibility")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 border ${
                activeTab === "eligibility"
                  ? "bg-white border-indigo-100 text-indigo-600 shadow-sm font-extrabold"
                  : "border-transparent text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === "ar" ? "أهلية التأمين الطبي" : "Insurance Eligibility"}
            </button>
          </div>

          {/* Local View Filters depending on selected checkin tab */}
          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === "checkin" && (
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                {(["All", "Waiting", "In-Clinic", "Discharged"] as const).map(fl => (
                  <button
                    key={fl}
                    onClick={() => setPatientFilter(fl)}
                    className={`px-2.5 py-0.5 text-[10px] uppercase font-mono rounded ${
                      patientFilter === fl
                        ? "bg-indigo-600 text-white shadow-xs font-bold"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {fl === "All" && (language === "ar" ? "الكل" : "All Patients")}
                    {fl === "Waiting" && (language === "ar" ? "في الانتظار" : "Waiting")}
                    {fl === "In-Clinic" && (language === "ar" ? "بالداخل" : "In-Clinic")}
                    {fl === "Discharged" && (language === "ar" ? "تم الصرف" : "Discharged")}
                  </button>
                ))}
              </div>
            )}
            
            {/* Search filter text */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder={language === "ar" ? "اسم المريض أو الرقم..." : "Quick checkout search..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-neutral-100/60 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
              />
            </div>

            {/* BIG PROMINENT ADD PATIENT BUTTON */}
            <button
              id="add-patient-main-trigger-btn"
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all ml-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === "ar" ? "تسجيل مريض" : "Add Patient"}</span>
            </button>
          </div>

        </div>

        {/* Scrollable Workstation Body Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#FBFBF9]">

          {/* TAB 1: CHECK-IN & PATIENT FLOW (VITAL SIGNS) */}
          {activeTab === "checkin" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* Patient Flow Vital Signs Widgets Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Live Wait-time tracker card */}
                <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">🕒 Live Average Lobby Wait-Time</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${patientFlowStats.averageWaitTimeMins > 20 ? "text-amber-500 font-extrabold" : "text-neutral-800"}`}>
                        {patientFlowStats.averageWaitTimeMins} Minutes
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {patientFlowStats.averageWaitTimeMins > 20 
                        ? "⚠️ Flow congestion. Patients exceeding SLA threshold."
                        : "✓ Optimal clinic flow. All lobbies within 20min SLA limit."}
                    </p>
                  </div>
                  <div className={`p-3.5 rounded-xl ${patientFlowStats.averageWaitTimeMins > 20 ? "bg-amber-50 text-amber-500" : "bg-neutral-100 text-neutral-500"}`}>
                    <Clock className="w-6 h-6 shrink-0" />
                  </div>
                </div>

                {/* 2. Clinic Load distribution bar chart */}
                <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block mb-1.5">📊 Specialty Clinic Load Density</span>
                  <div className="space-y-2">
                    {Object.entries(patientFlowStats.clinicLoad).slice(0, 3).map(([clinic, count]) => {
                      const percentage = Math.min(100, Number(count) * 20 + 20); // Scale count visually
                      return (
                        <div key={clinic} className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold text-neutral-700">{clinic}</span>
                            <span className="font-mono font-bold text-indigo-600">{count} active</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. No-Show rate widget */}
                <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">📅 Lobby No-Show Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-neutral-800">
                        {patientFlowStats.noShowRate}%
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        triggerLocalToast("Automated SMS & WhatsApp reservation alerts broadcasted!", "success");
                      }}
                      className="mt-2 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"
                    >
                      Trigger Autodial Re-Bookings
                    </button>
                  </div>
                  <div className="bg-neutral-50 p-3.5 rounded-xl text-neutral-400">
                    <Building className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Active patient queue and check-in flow list */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-4 border-b border-[#EAE6DF] flex flex-wrap gap-3 items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs text-[#0f1e46] uppercase tracking-wider">
                      Patient Lobby Flow Matrix ({filteredPatients.length} Active in {lobbyContext})
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Row highlights flash in amber if patient wait-time crosses 20 minutes to alert staff of delays.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Quick walk-in registration shortcut
                        const walkIn: Patient = {
                          id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
                          name: "Walk-in Guest Patient " + Math.floor(10 + Math.random() * 90),
                          dob: "1994-10-10",
                          age: 32,
                          gender: "Female",
                          status: "Registered",
                          clinic: "General Ophthalmology",
                          clinicalLogs: [{
                            timestamp: new Date().toTimeString().split(" ")[0],
                            actorRole: "Front Desk Cashier",
                            action: "Rapid Walk-In Ingest",
                            notes: "Urgent walk-in assigned standard konsultation"
                          }],
                          billingLedger: [{
                            id: `BIL-${Math.floor(100 + Math.random() * 900)}`,
                            serviceName: "Clinical Urgent Assessment Fee",
                            category: "Consultation",
                            amount: 50,
                            status: "Unpaid"
                          }]
                        };
                        onAddPatient(walkIn);
                        triggerLocalToast("Walk-in Patient admitted directly to General queue!", "success");
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Rapid Walk-in Ingest
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/60 border-b border-[#EAE6DF] text-neutral-400 font-mono text-[9px] uppercase">
                        <th className="p-3">Patient demographics</th>
                        <th className="p-3">Assigned Clinical Queue</th>
                        <th className="p-3">Wait-Time</th>
                        <th className="p-3">Accounting Status (Direct co-Pay)</th>
                        <th className="p-3 text-right">Emergency / Quick Override Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {paginatedPatients.length > 0 ? (
                        paginatedPatients.map((patient, i) => {
                          const flatIndex = (lobbyPage - 1) * itemsPerPage + i;
                          // Simulate arbitrary wait time based on actual patient index to trigger Warn flashing
                          const simMinutes = (flatIndex * 8) + 3;
                          const isSlaBreached = simMinutes > 20 && patientFilter === "Waiting";
                          
                          // Check if patient has copay unpaid
                          const unpaidCopay = patient.billingLedger.find(b => b.status === "Unpaid");

                          return (
                            <tr 
                              key={patient.id} 
                              className={`transition ${
                                isSlaBreached 
                                  ? "bg-amber-50/40 hover:bg-amber-50 border-l-4 border-l-amber-500 animate-pulse" 
                                  : "hover:bg-neutral-50"
                              }`}
                            >
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-[#0f1e46]">{patient.name}</span>
                                  <span className="text-[10px] text-neutral-400 font-mono">ID: {patient.id} • {patient.age}y/o ({patient.gender})</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-neutral-700 bg-neutral-100 font-mono px-2 py-0.5 rounded text-[10px] uppercase">
                                  🏥 {patient.clinic}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[10px]">
                                {patientFilter === "Discharged" ? (
                                  <span className="text-emerald-600 font-bold">Discharged</span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-bold ${isSlaBreached ? "text-amber-600" : "text-neutral-500"}`}>
                                      {simMinutes} mins
                                    </span>
                                    {isSlaBreached && (
                                      <span className="text-[8px] bg-amber-100 border border-amber-300 text-amber-800 px-1 rounded uppercase font-black" title="SLA Breach warning! Alert doctor.">
                                        DELAY
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                {unpaidCopay ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-rose-500 font-black bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                      Pending Co-Pay: ${unpaidCopay.amount}
                                    </span>
                                    <button
                                      onClick={() => handleOneClickCoPay(patient, unpaidCopay)}
                                      className="text-[9px] font-black uppercase text-indigo-700 hover:underline bg-indigo-50 px-2 py-1 rounded border border-indigo-100 cursor-pointer"
                                    >
                                      1-Click Settle
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                    ✓ Settled / Cleared
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {patientFilter === "Waiting" && patient.triageVitals?.urgency !== "STAT_EMERGENCY" ? (
                                  <button
                                    onClick={() => handleEmergencyQueueOverride(patient)}
                                    className="px-2.5 py-1 text-[9px] font-black text-rose-600 border border-rose-200 hover:bg-rose-50 rounded uppercase transition-all duration-100 cursor-pointer"
                                    title="Eye chemical splash or acute trauma. Bump to top of Orbit Queue"
                                  >
                                    💥 STAT OVERRIDE
                                  </button>
                                ) : patient.triageVitals?.urgency === "STAT_EMERGENCY" ? (
                                  <span className="text-[9px] font-mono bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded uppercase animate-ping">
                                    EMERGENCY OVERRIDE BOUNDS
                                  </span>
                                ) : (
                                  <span className="text-neutral-300">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-neutral-400 italic">
                            {language === "ar" ? "لا يوجد سجل موازٍ لبحث الفلترة الحالي." : "No patients matching the active workspace filters."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Performance Scaled Pagination Bar Footer (NFR-1.2 compliant) */}
                <div className="bg-neutral-50 px-5 py-3 border-t border-[#EAE6DF] flex items-center justify-between font-mono text-[10px] text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[#0f1e46]">
                      {language === "ar" ? "الفهرسة الفعالة:" : "Composite Indexing:"}
                    </span>
                    <span className="bg-[#EEEDE8] px-2 py-0.5 rounded text-neutral-600">
                      O(1) B-Tree Map Loaded
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span>
                      {language === "ar" ? `الصفحة ${lobbyPage} من ${Math.ceil(filteredPatients.length / itemsPerPage)}` : `Page ${lobbyPage} of ${Math.ceil(filteredPatients.length / itemsPerPage)}`}
                      <span className="text-neutral-400 mx-1.5">•</span>
                      {language === "ar" ? `إجمالي السجلات: ${filteredPatients.length.toLocaleString()}` : `Total matching: ${filteredPatients.length.toLocaleString()}`}
                    </span>

                    <div className="flex items-center gap-1.5 font-sans font-bold">
                      <button
                        type="button"
                        disabled={lobbyPage === 1}
                        onClick={() => setLobbyPage(p => Math.max(1, p - 1))}
                        className={`px-3 py-1 border border-[#EAE6DF] rounded-md text-xs transition active:scale-95 ${
                          lobbyPage === 1
                            ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                            : "bg-white hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                        }`}
                      >
                        {language === "ar" ? "السابق ←" : "← Prev"}
                      </button>

                      <button
                        type="button"
                        disabled={lobbyPage >= Math.ceil(filteredPatients.length / itemsPerPage)}
                        onClick={() => setLobbyPage(p => Math.min(Math.ceil(filteredPatients.length / itemsPerPage), p + 1))}
                        className={`px-3 py-1 border border-[#EAE6DF] rounded-md text-xs transition active:scale-95 ${
                          lobbyPage >= Math.ceil(filteredPatients.length / itemsPerPage)
                            ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                            : "bg-white hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                        }`}
                      >
                        {language === "ar" ? "التالي →" : "Next →"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPOINTMENTS SCHEDULER & DOCTOR AVAILABILITY */}
          {activeTab === "scheduler" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-in fade-in duration-200">
              
              {/* Form to book client reservations */}
              <div className="bg-white border border-[#EAE6DF] h-fit p-5 rounded-2xl shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-2 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                    Book Scheduled Consultation
                  </span>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs font-medium">
                  {/* Demographics inputs */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Patient Legal Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg"
                      placeholder="e.g. Yasmin Al-Saud"
                      value={appointmentPatientName}
                      onChange={e => setAppointmentPatientName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase">DOB</label>
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs"
                        value={appointmentPatientDob}
                        onChange={e => setAppointmentPatientDob(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 border border-indigo-100 bg-indigo-50/20 rounded-lg"
                        value={appointmentDate}
                        onChange={e => setAppointmentDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Doctor selectors list matching roster */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Select Target Physician (Roster Lock)</label>
                    <select
                      required
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="">-- Choose doctor --</option>
                      {employees.map(emp => (
                        <option 
                          key={emp.id} 
                          value={emp.id}
                        >
                          Dr. {emp.firstName} {emp.lastName} ({emp.jobTitle.split("-")[1] || emp.jobTitle}) - {emp.employmentStatus}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-neutral-400 block mt-1 leading-relaxed">
                      * Security verification: Booking blocks automatically if selected doctor has an expired board license or is marked ON_LEAVE.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">Timeslot</label>
                    <select
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:15">10:15 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:30">02:30 PM</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase rounded-lg text-xs tracking-wider transition-all"
                  >
                    Verify Doctor & Dispatch
                  </button>
                </form>
              </div>

              {/* Center Schedule Calendar list */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Bookings block */}
                <div className="bg-white border border-[#EAE6DF] rounded-2xl shadow-xs p-5">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100 mb-4">
                    <span className="text-xs font-black text-[#0f1e46] uppercase font-sans">
                      Active Booking Schedules Ledger
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-50 rounded px-2 text-indigo-600">
                      Day Matrix: 2026-06-11
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {appointmentsList.map((apt, i) => (
                      <div key={i} className="p-3 bg-neutral-100/60 border border-neutral-150 rounded-xl flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                            {apt.time}
                          </div>
                          <div>
                            <span className="font-extrabold text-neutral-800 block">{apt.patientName}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">DOB: {apt.dob} • Checked-in via Lobby</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-neutral-700 block text-[10px]">{apt.doctorName}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">Assigned Practitioner</span>
                          </div>
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold px-2 py-0.5 rounded">
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Surgery Block calendar block */}
                <div className="bg-white border border-[#EAE6DF] rounded-2xl shadow-xs p-5">
                  <div className="pb-2 border-b border-neutral-100 mb-3 text-left">
                    <span className="text-xs font-black text-rose-500 uppercase flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Surgery Block Booking (Operating Theater Blockouts)
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Ensures 3-hour surgery block windows for pre-operative, Main OR, and clinical recovery.
                    </p>
                  </div>

                  <form onSubmit={handleBlockSurgeryTheater} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">OR Theater Wing</label>
                      <select
                        value={surgeryBlockClinic}
                        onChange={e => setSurgeryBlockClinic(e.target.value as ClinicType)}
                        className="w-full p-1.5 border rounded"
                      >
                        <option value="General Ophthalmology">Operating Suite A (Phaco Special)</option>
                        <option value="Retina">Operating Suite B (Vitreo-Retinal)</option>
                        <option value="Orbit">Specialized Orbit Trauma Wing</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Surgical Block Start Time</label>
                      <input
                        type="time"
                        className="w-full p-1.5 border rounded"
                        value={surgeryBlockTime}
                        onChange={e => setSurgeryBlockTime(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Pre-Op Diagnostics & Surgical Notes</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Cataract Phacoemulsification Block - Dr. Sterling Attending"
                        className="w-full p-1.5 border rounded"
                        value={surgeryBlockNotes}
                        onChange={e => setSurgeryBlockNotes(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold uppercase transition"
                      >
                        Lock 3-Hour OR Slot Reservation
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: FRONT DESK POS & SHIFT RECONCILIATION */}
          {activeTab === "pos" && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              
              {/* POS Controls Splitter */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Drawer Shift Opening/Closing Panel */}
                <div className="bg-white border border-[#EAE6DF] h-fit p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="border-b border-neutral-100 pb-2 mb-2">
                    <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                      Shift Drawer & Cash Register Session
                    </span>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 bg-neutral-100 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase">
                        <span>Active Terminal State</span>
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${isShiftActive ? "bg-emerald-50 text-emerald-600" : "bg-neutral-200 text-neutral-500"}`}>
                          {isShiftActive ? "OPENED ACTIVE" : "CLOSED SHIFT"}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral-800">
                        <span>Opening Float Amt (USD)</span>
                        <span>${openingFloat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral-800">
                        <span>Card Payments Collected</span>
                        <span>${receiptLog.reduce((s,i) => s + (i.method === "Credit Card Sweep" ? i.amount : 0), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral-800">
                        <span>Physical Cash Collected</span>
                        <span>${receiptLog.reduce((s,i) => s + (i.method === "Cash Drop" ? i.amount : 0), 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {isShiftActive ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 font-bold block uppercase">Physical Banknotes Counted (Variance check)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-1.5 border border-indigo-150 rounded bg-indigo-50/10 focus:outline-none"
                            value={closingCashInput}
                            onChange={e => setClosingCashInput(Number(e.target.value))}
                          />
                        </div>

                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10.5px] leading-relaxed text-indigo-700">
                          <p className="font-bold">Z-Report Shift Estimates:</p>
                          <p>Expected Cash: ${openingFloat + receiptLog.reduce((s,r)=>s+(r.method==="Cash Drop"?r.amount:0), 0)}</p>
                          <div className="flex justify-between mt-1">
                            <span>Computed Variance:</span>
                            <span className={`font-mono font-black ${shiftReconciliationData.variance !== 0 ? "text-amber-600 animate-pulse" : "text-emerald-600"}`}>
                              ${shiftReconciliationData.variance.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleCloseShiftPOS}
                          className="w-full py-2 bg-indigo-600 hover:bg-neutral-800 text-white font-extrabold uppercase rounded-lg text-xs"
                        >
                          Generate Z-Report & Sync Ledger
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 rounded-xl text-center space-y-1.5 border">
                          <span className="text-[10px] text-neutral-400 block font-bold uppercase">SHIFT COMPLETED - Z-REPORT POSTED</span>
                          <p className="text-xs text-neutral-600 italic">Financial aggregates locked and dispatched directly to Accounting General Ledger.</p>
                          <button
                            onClick={() => {
                              setIsShiftActive(true);
                              setReceiptLog([]);
                              triggerLocalToast("Opened fresh cashier terminal shift session!", "info");
                            }}
                            className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-bold uppercase rounded"
                          >
                            Open Fresh Drawer Shift
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Direct outstanding copay collection */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Ledger quick copay desk */}
                  <div className="bg-white border border-[#EAE6DF] rounded-2xl shadow-xs p-5">
                    <div className="pb-2 border-b border-neutral-100 mb-4 flex justify-between items-center">
                      <span className="text-xs font-black text-[#0f1e46] uppercase font-sans">
                        Patient Consultation Copays (Cashier Desk)
                      </span>
                      <span className="text-[9px] bg-indigo-50 font-mono text-indigo-600 px-2 rounded font-bold uppercase">
                        Instant GL Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Select Checked-In Patient</label>
                        <select
                          value={selectedPayingPatientId}
                          onChange={e => setSelectedPayingPatientId(e.target.value)}
                          className="w-full p-1.5 border rounded bg-white text-xs"
                        >
                          <option value="">-- Choose patient --</option>
                          {patients.slice(0, 50).map(p => {
                            const unPaid = p.billingLedger.filter(item => item.status === "Unpaid");
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.id}) - {unPaid.length} unpaid items
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#F59E0B] uppercase">Instant Copay Settlement Price ($)</label>
                        <input
                          type="number"
                          className="w-full p-1.5 border rounded bg-neutral-50 text-[#F59E0B] font-bold"
                          value={selectedPayingPatientObj ? totalOutstandingCopay : coPayCustomAmount}
                          onChange={e => setCoPayCustomAmount(Number(e.target.value))}
                          disabled={!!selectedPayingPatientObj}
                        />
                      </div>
                    </div>

                    {selectedPayingPatientObj ? (
                      <div className="bg-neutral-50/50 p-4 border rounded-xl space-y-3 text-xs mb-4">
                        <div className="flex justify-between items-center text-xs font-bold border-b pb-1.5">
                          <span>Outstanding Invoice Ledger ({unpaidItemsList.length} items)</span>
                          <span className="text-neutral-500">{selectedPayingPatientObj.name}</span>
                        </div>
                        {unpaidItemsList.length > 0 ? (
                          <div className="space-y-2">
                            {unpaidItemsList.map(item => (
                              <div key={item.id} className="flex justify-between items-center">
                                <div>
                                  <span className="font-semibold block">{item.serviceName}</span>
                                  <span className="text-[10px] text-neutral-400 font-mono">Category: {item.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold">${item.amount}</span>
                                  <button
                                    onClick={() => handleOneClickCoPay(selectedPayingPatientObj, item)}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-neutral-800 text-white rounded font-mono text-[9px] font-bold uppercase transition"
                                  >
                                    Swipe & Pay
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-neutral-400 italic">No unpaid items found on this patient ledger card.</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed rounded-xl text-center text-neutral-400 text-xs italic mb-4">
                        Please select a target checked-in patient above to load their outstanding copay bill sheets...
                      </div>
                    )}
                  </div>

                  {/* Surgery Deposit Vault */}
                  <div className="bg-white border border-[#EAE6DF] rounded-2xl shadow-xs p-5">
                    <div className="pb-2 border-b border-neutral-100 mb-3 text-left">
                      <span className="text-xs font-black text-indigo-600 uppercase flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> Surgery Deposit Vault (Unearned Procedure Escrow)
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Accept pre-op deposits for surgeries (like Cataract/Trauma). Automatically registers escrow down-payment and updates general Ledger narrative.
                      </p>
                    </div>

                    <form onSubmit={handleCollectSurgeryDeposit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Select Surgery Patient</label>
                        <select
                          required
                          value={depositPatientId}
                          onChange={e => setDepositPatientId(e.target.value)}
                          className="w-full p-1.5 border rounded bg-white text-xs"
                        >
                          <option value="">-- Choose patient --</option>
                          {patients.slice(0, 50).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Deposit Down-Payment Amt ($)</label>
                        <input
                          required
                          type="number"
                          className="w-full p-1.5 border rounded font-mono"
                          value={depositAmount}
                          onChange={e => setDepositAmount(Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Deposit Narrative Code</label>
                        <input
                          required
                          type="text"
                          className="w-full p-1.5 border rounded"
                          value={depositNotes}
                          onChange={e => setDepositNotes(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 hover:bg-neutral-800 text-white rounded text-[10px] font-bold uppercase"
                        >
                          Collect Deposit & Escrow Ledger Post
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Receipt feed list */}
                  <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block mb-3">🧾 Today's POS Cash Drawer Receipt Logs</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {receiptLog.map((rec, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-neutral-50 rounded border border-neutral-100">
                          <div>
                            <span className="font-extrabold text-neutral-800">{rec.patientName}</span>
                            <span className="text-[9px] text-neutral-400 block">{rec.serviceName} | {rec.timestamp}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-indigo-600 block">${rec.amount}</span>
                            <span className="text-[8px] bg-indigo-50 border border-indigo-150 rounded px-1 text-indigo-500 block uppercase font-black mt-0.5">{rec.method}</span>
                          </div>
                        </div>
                      ))}
                      {receiptLog.length === 0 && (
                        <p className="text-center text-neutral-400 text-xs italic py-2">No transactions swiped on this shift.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: SMART IDENTIFICATION & INSURANCE CLEARING */}
          {activeTab === "eligibility" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left animate-in fade-in duration-200">
              
              {/* Identity Scanner Hardware simulated box */}
              <div className="bg-white border border-[#EAE6DF] p-6 rounded-2xl shadow-xs space-y-5">
                <div className="border-b pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#0f1e46] uppercase font-sans block">
                      Emirates ID & Smart Card Swiper
                    </span>
                    <p className="text-[10px] text-neutral-400">Direct passport/Emirates ID scanner simulation port.</p>
                  </div>
                  <QrCode className="w-6 h-6 text-indigo-500" />
                </div>

                <div className="p-12 bg-neutral-50 rounded-2xl border border-dashed border-indigo-100 flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSwipingId ? "bg-indigo-50 text-indigo-500 animate-spin" : "bg-indigo-50 text-[#2BBFFF]"}`}>
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0f1e46] text-xs block">Hardware Synced Reader Active</span>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-xs mx-auto">Insert UAE National ID / Passport into peripheral device and click below.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSwipeNationalIdSim}
                    disabled={isSwipingId}
                    className="px-4 py-2 bg-[#0F1E46] text-white hover:bg-neutral-800 text-[10px] font-black uppercase rounded shadow transition"
                  >
                    {isSwipingId ? "SWIPING CARD..." : "SIMULATE DIRECT SMART CARD SWIPE"}
                  </button>
                </div>

                {scannedIdData && (
                  <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-3 text-xs animate-in zoom-in-95 duration-150">
                    <span className="text-[9px] font-mono text-indigo-600 block font-bold uppercase tracking-wider">DECRYPTED PASSPORT/EMIRATES ID SCHEMAS:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Name: <strong className="text-neutral-850 font-bold block">{scannedIdData.fullName}</strong></div>
                      <div>National ID: <strong className="font-mono block">{scannedIdData.nationalId}</strong></div>
                      <div>DOB: <strong className="block">{scannedIdData.dob}</strong></div>
                      <div>Gender: <strong className="block">{scannedIdData.gender}</strong></div>
                      <div>Contact: <strong className="block">{scannedIdData.contact}</strong></div>
                      <div>Card Expiry: <strong className="text-neutral-400 block">{scannedIdData.expiryDate}</strong></div>
                    </div>

                    <button
                      onClick={handleCreatePatientFromScan}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase rounded text-[10px]"
                    >
                      Instant Admit into Clinical Database
                    </button>
                  </div>
                )}
              </div>

              {/* Real-Time Insurance Clearing Claim Box */}
              <div className="bg-white border border-[#EAE6DF] p-6 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b pb-2 mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-[#0f1e46] uppercase font-sans block">
                        Real-Time Insurance Eligibility Engine
                      </span>
                      <p className="text-[10px] text-neutral-400">Pings regional medical insurance gateway for authorized copay levels.</p>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                  </div>

                  <div className="space-y-4 font-sans text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 font-bold block uppercase">Select Patient lookup</label>
                      <select
                        value={eligibilityPatientId}
                        onChange={e => setEligibilityPatientId(e.target.value)}
                        className="w-full p-1.5 border rounded bg-white text-xs"
                      >
                        <option value="">-- Choose patient --</option>
                        {patients.slice(0, 50).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 font-bold block uppercase">Policy Card Identifier</label>
                        <input
                          type="text"
                          className="w-full p-1.5 border rounded"
                          value={policyNum}
                          onChange={e => setPolicyNum(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 font-bold block uppercase">Network Tier Gateway</label>
                        <select
                          value={selectedProviderId}
                          onChange={e => setSelectedProviderId(e.target.value)}
                          className="w-full p-1.5 border rounded bg-white"
                        >
                          {INSURANCE_PROVIDERS.map(ins => (
                            <option key={ins.id} value={ins.id}>{ins.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleQueryClearinghouse}
                      disabled={isClearingInsurance}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase rounded-lg text-xs"
                    >
                      {isClearingInsurance ? "PINGING CLEARINGHOUSE HUB..." : "SUBMIT INSURANCE ELIGIBILITY DRILLDOWN"}
                    </button>
                  </div>
                </div>

                {insuranceResult && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl mt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-emerald-200/50 pb-1.5 mb-1 text-emerald-800 font-bold">
                      <span className="flex items-center gap-1">✓ ELIGIBILITY CLEARANCE GRANTED</span>
                      <span className="font-mono font-bold text-[10px] bg-white border border-emerald-200 text-emerald-700 rounded px-1.5 uppercase">VERIFIED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-700 text-[11px]">
                      <div>Patient Name: <strong className="font-bold">{insuranceResult.patientName}</strong></div>
                      <div>Network Plan: <strong className="font-bold">{insuranceResult.tier}</strong></div>
                      <div>Approved Co-Pay %: <strong className="text-emerald-700 font-black">{insuranceResult.copayPercentage}%</strong></div>
                      <div>Authorized Escrow direct: <strong className="text-emerald-700 font-bold">YES Direct-Billing</strong></div>
                      <div className="col-span-2 mt-1 py-1 border-t text-[10px] text-neutral-400">
                        * Consultation fees re-balanced down to ${insuranceResult.copayPercentage}% out-of-pocket rate on direct active files.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ADD PATIENT MODAL DIALOG */}
        {isAddPatientOpen && (
          <div className="fixed inset-0 z-50 bg-[#0F1E46]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              id="add-patient-modal-card"
              className="bg-[#FBFBF9] border border-[#EAE6DF] rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-[#EAE6DF] pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="font-sans font-black text-sm uppercase tracking-wider text-[#0F172A]">
                    {language === "ar" ? "تسجيل مريض جديد" : "Register New Patient"}
                  </h3>
                </div>
                <button
                  id="close-add-patient-modal-btn"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition text-neutral-400 hover:text-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNewPatientSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#0F172A] uppercase">
                    {language === "ar" ? "الاسم الكامل للمريض" : "Patient Full Name"}
                  </label>
                  <input
                    id="new-patient-name-input"
                    required
                    type="text"
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    placeholder={language === "ar" ? "مثال: مروان بن علي الكناني" : "e.g. John Doe"}
                    className="w-full px-3 py-2 border border-[#EAE6DF] rounded-xl text-neutral-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#0F172A] uppercase">
                      {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                    </label>
                    <input
                      id="new-patient-dob-input"
                      required
                      type="date"
                      value={newPatientDob}
                      onChange={e => setNewPatientDob(e.target.value)}
                      className="w-full px-3 py-2 border border-[#EAE6DF] rounded-xl text-neutral-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#0F172A] uppercase">
                      {language === "ar" ? "الجنس" : "Gender"}
                    </label>
                    <select
                      id="new-patient-gender-select"
                      value={newPatientGender}
                      onChange={e => setNewPatientGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#EAE6DF] rounded-xl text-neutral-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="Male">{language === "ar" ? "ذكر" : "Male"}</option>
                      <option value="Female">{language === "ar" ? "أنثى" : "Female"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#0F172A] uppercase">
                    {language === "ar" ? "العيادة التخصصية الموجه إليها" : "Assigned Specialty Clinic"}
                  </label>
                  <select
                    id="new-patient-clinic-select"
                    value={newPatientClinic}
                    onChange={e => setNewPatientClinic(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#EAE6DF] rounded-xl text-neutral-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="General Ophthalmology">General Ophthalmology</option>
                    <option value="Retina">Retina Clinic (Vitrectomy/Laser)</option>
                    <option value="Glaucoma">Glaucoma (Trabeculectomy/IOP)</option>
                    <option value="Orbit">Orbit (Plastic & Trauma Services)</option>
                    <option value="Pediatrics Ophthalmology">Pediatrics Ophthalmology</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#0F172A] uppercase">
                    {language === "ar" ? "رسم الدفع المشترك المجهّز" : "Standard Co-Pay Deposit ($)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-400 font-mono text-xs">$</span>
                    <input
                      id="new-patient-copay-input"
                      type="number"
                      value={newPatientCoPay}
                      onChange={e => setNewPatientCoPay(Number(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-[#EAE6DF] rounded-xl text-neutral-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="bg-[#EEEDE8] text-[10px] text-neutral-500 p-3 rounded-xl leading-relaxed space-y-1">
                  <span className="font-bold text-[#0F172A] block uppercase">ℹ️ Front Desk Compliance Note</span>
                  <p>
                    {language === "ar" 
                      ? "تسجيل المريض سيقوم آلياً بتأسيس ملف طبي بالرقم المُولّد، وإدراج البند المالي بقيمة الدفع المشترك تحت موازنات الإيراد." 
                      : "Submission will automatically record clinical registers, issue compliance telemetry codes, and post unearned revenue balances to double-entry financial boards."}
                  </p>
                </div>

                <div className="pt-2 flex gap-3 text-xs uppercase font-extrabold">
                  <button
                    id="cancel-patient-mod-btn"
                    type="button"
                    onClick={() => setIsAddPatientOpen(false)}
                    className="w-1/2 py-2.5 border border-[#EAE6DF] hover:bg-neutral-100 text-neutral-600 rounded-xl transition"
                  >
                    {language === "ar" ? "إلغاء الأمر" : "Cancel"}
                  </button>
                  <button
                    id="submit-patient-mod-btn"
                    type="submit"
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow active:scale-[0.98]"
                  >
                    {language === "ar" ? "حفظ وإدراج الملف" : "Submit & Admit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );
}
