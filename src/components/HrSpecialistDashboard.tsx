/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  DollarSign,
  Briefcase,
  X,
  Lock,
  Trash2,
  FileText,
  BadgeAlert,
  Coins,
  Printer,
  TrendingUp,
  CreditCard,
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  Building,
  Award,
  Search,
  ChevronDown,
  Inbox,
  MessageSquare
} from "lucide-react";
import { ClinicalRole, Employee } from "../types";
import { TransactionJournal } from "../mockErpData";

interface HrSpecialistDashboardProps {
  language: "en" | "ar";
  activeRole: ClinicalRole;
  setActiveRole: (role: ClinicalRole) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onSalaryDisbursed: (loggedTransaction: TransactionJournal) => void;
  onClose: () => void;
  unreadMessagesCount?: number;
}

// Mock initial Recruitment ATS candidates
interface Applicant {
  id: string;
  fullName: string;
  specialty: string;
  department: string;
  status: "Reviewing" | "Interviewing" | "Offer Extended" | "Accepted";
  score: number;
  nationalId: string;
  contact: string;
  salaryExpectation: number;
}

// Mock initial Biometric swipes logs
interface BiometricLog {
  id: string;
  employeeName: string;
  biometricId: string;
  timestamp: string;
  actionType: "CLOCK_IN" | "CLOCK_OUT";
  location: string;
}

export default function HrSpecialistDashboard({
  language,
  activeRole,
  setActiveRole,
  employees,
  setEmployees,
  onSalaryDisbursed,
  onClose,
  unreadMessagesCount = 0
}: HrSpecialistDashboardProps) {
  const isHrAuthorized = activeRole === "hr_manager" || activeRole === "accountant";

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"vitals" | "personnel" | "roster" | "payroll" | "recruitment">("vitals");
  
  // High-level filtering state
  const [deptFilter, setDeptFilter] = useState<"All" | "Medical" | "Nursing" | "Admin">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "ACTIVE" | "ON_LEAVE">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated background checklist
  const [leaveRequests, setLeaveRequests] = useState([
    {
      requestId: "LRQ-1044",
      employeeId: "EMP-001",
      employeeName: "Dr. Alexander Sterling",
      leaveType: "CME_CONFERENCE",
      startDate: "2026-07-01",
      endDate: "2026-07-14",
      status: "PENDING_APPROVAL",
      coverageNotes: "Dr. Harrison has agreed to cover Retina on-call shifts."
    },
    {
      requestId: "LRQ-1045",
      employeeId: "EMP-002",
      employeeName: "Nurse Beatrice Kemp",
      leaveType: "ANNUAL_VACATION",
      startDate: "2026-08-10",
      endDate: "2026-08-22",
      status: "PENDING_APPROVAL",
      coverageNotes: "Nursing pool will cover rotating triage schedules."
    }
  ]);

  const [onboardingBottlenecks, setOnboardingBottlenecks] = useState([
    { id: "BOT-551", name: "Dr. Raymond Smith", type: "Ophthalmology Fellow", step: "DEA/LOH licensure check pending", speedUpClaimed: false },
    { id: "BOT-552", name: "Technician Jane Doe", type: "Optical Lab Specialist", step: "Biometric Fingerprint Enrollment", speedUpClaimed: false }
  ]);

  const [timesheetIssues, setTimesheetIssues] = useState([
    { id: "TS-881", employeeId: "EMP-001", name: "Dr. Alexander Sterling", issue: "Missed exit badge out (2026-06-09)", date: "2026-06-09", resolved: false }
  ]);

  // Applicants for ATS module
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: "APP-901",
      fullName: "Dr. Sarah Jenkins",
      specialty: "Attending Retina Consultant",
      department: "RETINA_CLINIC",
      status: "Interviewing",
      score: 4.8,
      nationalId: "991-884-212",
      contact: "+966-50-667-8899",
      salaryExpectation: 14000
    },
    {
      id: "APP-902",
      fullName: "Nurse Amina Al-Harbi",
      specialty: "Ophthalmic Triage Practitioner",
      department: "TRIAGE",
      status: "Offer Extended",
      score: 4.9,
      nationalId: "983-221-550",
      contact: "+966-54-331-5077",
      salaryExpectation: 5200
    }
  ]);

  // Biometric log tracker
  const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>([
    { id: "LOG-01", employeeName: "Dr. Alexander Sterling", biometricId: "BIO-901", timestamp: "08:14:02", actionType: "CLOCK_IN", location: "Main Gate A" },
    { id: "LOG-02", employeeName: "Nurse Beatrice Kemp", biometricId: "BIO-402", timestamp: "08:31:10", actionType: "CLOCK_IN", location: "Triage North Gate" },
    { id: "LOG-03", employeeName: "Vance Pendleton", biometricId: "BIO-703", timestamp: "08:45:55", actionType: "CLOCK_IN", location: "Hospital Main Entrance" }
  ]);

  // Shift manager assignment matrix
  const [shiftRoster, setShiftRoster] = useState<Record<string, Record<string, string>>>({
    "Retina Room": { Monday: "Dr. Alexander Sterling (Attending)", Tuesday: "Dr. Alexander Sterling (Attending)", Wednesday: "Dr. Al-Mutawa (Resident)", Thursday: "Dr. Alexander Sterling (Attending)", Friday: "Dr. Harrison (On-Call)" },
    "Glaucoma Room": { Monday: "Dr. Vance Pendleton", Tuesday: "Dr. Benson", Wednesday: "Dr. Vance Pendleton", Thursday: "Clinical Standby", Friday: "Dr. Benson" },
    "Main Triage": { Monday: "Nurse Beatrice Kemp", Tuesday: "Nurse Beatrice Kemp", Wednesday: "Nurse Lea", Thursday: "Nurse Beatrice Kemp", Friday: "Nurse Beatrice Kemp" }
  });

  // Assign shift state
  const [selectedShiftDoctor, setSelectedShiftDoctor] = useState("");
  const [selectedShiftRoom, setSelectedShiftRoom] = useState("Retina Room");
  const [selectedShiftDay, setSelectedShiftDay] = useState("Monday");

  // Selection states for Credential Editing & Peer Feedbacks
  const [selectedPrivilegeEmpId, setSelectedPrivilegeEmpId] = useState<string>("EMP-001");
  const [selectedReviewEmpId, setSelectedReviewEmpId] = useState<string>("EMP-001");

  // Payroll / Payslips States
  const [payslip, setPayslip] = useState<any | null>(null);

  // Expirations Alert triggers logged
  const [dispatchedNotices, setDispatchedNotices] = useState<string[]>([]);

  // Add Employee Form (Personnel Module)
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [jobTitle, setJobTitle] = useState("DOCTOR - Ophthalmology Consultant");
  const [baseSalary, setBaseSalary] = useState("9500");
  const [commission, setCommission] = useState("5");
  const [addDept, setAddDept] = useState("RETINA_CLINIC");
  const [addLicense, setAddLicense] = useState("MED-");

  // Filter Employees dynamically
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Text Search
      const text = `${emp.firstName} ${emp.lastName} ${emp.id} ${emp.jobTitle}`.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());

      // 2. Class Filter (Medical/Nursing/Admin)
      let matchesDept = true;
      if (deptFilter !== "All") {
        const title = emp.jobTitle.toLowerCase();
        if (deptFilter === "Medical") {
          matchesDept = title.includes("doctor") || title.includes("physician") || title.includes("surgeon");
        } else if (deptFilter === "Nursing") {
          matchesDept = title.includes("nurse") || title.includes("triage");
        } else if (deptFilter === "Admin") {
          matchesDept = title.includes("cashier") || title.includes("rec") || title.includes("account") || title.includes("manager") || title.includes("optic");
        }
      }

      // 3. Status filter
      let matchesStatus = true;
      if (statusFilter !== "All") {
        matchesStatus = emp.employmentStatus === statusFilter;
      }

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, deptFilter, statusFilter]);

  // Calculations for Vital KPIs
  const totalPayrollCost = useMemo(() => {
    return employees.reduce((sum, emp) => sum + emp.baseSalary + (emp.accruedCommissionSecured || 0), 0);
  }, [employees]);

  const activeHeadcount = useMemo(() => {
    return employees.filter(e => e.employmentStatus === "ACTIVE").length;
  }, [employees]);

  const onLeaveHeadcount = useMemo(() => {
    return employees.filter(e => e.employmentStatus === "ON_LEAVE").length;
  }, [employees]);

  const totalOvertimeCost = useMemo(() => {
    // Overtime pay rate is $55/hr
    const totalHours = employees.reduce((sum, emp) => sum + (emp.overtimeHours || 0), 0);
    return totalHours * 55;
  }, [employees]);

  // Expiry risk list
  const expiringCredentialsCount = useMemo(() => {
    return employees.filter((emp) => {
      if (!emp.licenseExpiryDate) return false;
      const expDate = new Date(emp.licenseExpiryDate);
      const diffTime = expDate.getTime() - new Date("2026-06-10").getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 60;
    }).length;
  }, [employees]);

  // Add a simulation of continuous biometric checkins
  const triggerBiometricSwipe = (empId: string, type: "CLOCK_IN" | "CLOCK_OUT") => {
    const targetEmp = employees.find(e => e.id === empId);
    if (!targetEmp) return;
    
    const newLog: BiometricLog = {
      id: `LOG-${Math.floor(10 + Math.random() * 90)}`,
      employeeName: `${targetEmp.firstName} ${targetEmp.lastName}`,
      biometricId: targetEmp.biometricId || "BIO-UNK",
      timestamp: new Date().toTimeString().split(" ")[0],
      actionType: type,
      location: type === "CLOCK_IN" ? "Clinics Entrance North" : "Service Gate West"
    };

    setBiometricLogs(prev => [newLog, ...prev]);

    // Update worker overtime hours or check-in state
    if (type === "CLOCK_IN") {
      alert(`${targetEmp.firstName} swiped IN. Log synced with dynamic hospital timesheets.`);
    } else {
      // Swipe out adds an automated overtime hour for hospital OR hours audit
      setEmployees(prev => prev.map(e => {
        if (e.id === empId) {
          const currentOvertime = e.overtimeHours || 0;
          return { ...e, overtimeHours: currentOvertime + 2 };
        }
        return e;
      }));
      alert(`${targetEmp.firstName} swiped OUT. Added 2 hours surgical shift overtime to compensations.`);
    }
  };

  // Onboard Applicant to staff
  const onboardApplicant = (candidate: Applicant) => {
    const newEmp: Employee = {
      id: `EMP-00${employees.length + 1}`,
      firstName: candidate.fullName.split(" ")[0] || "Staff",
      lastName: candidate.fullName.split(" ").slice(1).join(" ") || "Member",
      nationalId: candidate.nationalId,
      contactNumber: candidate.contact,
      jobTitle: candidate.specialty,
      baseSalary: candidate.salaryExpectation,
      commissionPercentage: 3.5,
      employmentStatus: "ACTIVE",
      hiredDate: new Date().toISOString().split("T")[0],
      accruedCommissionSecured: 0,
      department: candidate.department,
      roleType: candidate.department.includes("RETINA") ? "ATTENDING" : "TECH",
      medicalLicenseNumber: "MED-" + Math.floor(10000 + Math.random() * 90000) + "-UAE",
      licenseExpiryDate: "2027-04-15",
      boardCertifications: ["Saudi Board Certified"],
      clinicalPrivileges: ["VISUAL_ACUITY_TESTING", "GLAUCOMA_DIAGNOSIS"],
      malpracticeInsuranceExpiry: "2027-04-15",
      overtimeHours: 0,
      biometricId: "BIO-" + Math.floor(100 + Math.random() * 900),
      assignedRoom: "Standard Examination Stall 3"
    };

    setEmployees(prev => [...prev, newEmp]);
    // Remove or change applicant state
    setApplicants(prev => prev.filter(app => app.id !== candidate.id));
    alert(`Success! [${candidate.fullName}] is now on-boarded and registered on Al Jawarih Clinical Roster.`);
  };

  // Recruit form submission
  const handleRegRecruit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !nationalId) {
      alert("Missing mandatory onboarding fields.");
      return;
    }

    const regEmp: Employee = {
      id: `EMP-0${employees.length + 1}`,
      firstName,
      lastName,
      nationalId,
      contactNumber: contactNumber || "+966-50-323-9911",
      jobTitle: jobTitle,
      baseSalary: Number(baseSalary) || 5000,
      commissionPercentage: Number(commission) || 1,
      employmentStatus: "ACTIVE",
      hiredDate: new Date().toISOString().split("T")[0],
      accruedCommissionSecured: 0,
      department: addDept,
      roleType: "ATTENDING",
      medicalLicenseNumber: addLicense || "MED-88000-UAE",
      licenseExpiryDate: "2027-06-30",
      boardCertifications: ["Saudi Commission for Health Specialties (SCFHS)"],
      clinicalPrivileges: ["OPHTHALMIC_DIAGNOSTICS"],
      malpracticeInsuranceExpiry: "2027-06-30",
      overtimeHours: 0,
      biometricId: "BIO-" + Math.floor(300 + Math.random() * 600)
    };

    setEmployees(prev => [...prev, regEmp]);
    setShowAddModal(false);
    // clear form
    setFirstName("");
    setLastName("");
    setNationalId("");
    setContactNumber("");
    setJobTitle("DOCTOR - Ophthalmology Consultant");
    setBaseSalary("9500");
    setCommission("5");
    setAddDept("RETINA_CLINIC");
    setAddLicense("MED-");
    alert("Onboarded and synced successfully!");
  };

  // Process and disburse payroll
  const handleProcessDisbursal = (emp: Employee) => {
    const ovAmount = (emp.overtimeHours || 0) * 55;
    const grossSalary = emp.baseSalary + (emp.accruedCommissionSecured || 0) + ovAmount;
    const insuranceDeduction = 320;
    const taxWithheld = 140;
    const netPayout = grossSalary - insuranceDeduction - taxWithheld;

    const transactionId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const journalEntry: TransactionJournal = {
      id: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      narrative: `Monthly core clinic payroll verified and cleared for ${emp.firstName} ${emp.lastName} (EId: ${emp.id})`,
      category: "Payroll" as any,
      debit: grossSalary, // Debit salary expense
      credit: netPayout, // Credit cash disbursed
      wallet: "Standard Chartered Bank",
      verifiedBy: "Ebenezer CFO (hr_manager)"
    };

    onSalaryDisbursed(journalEntry);

    // Populate detailed printable voucher
    setPayslip({
      voucherId: transactionId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeTitle: emp.jobTitle,
      employeeId: emp.id,
      date: new Date().toLocaleDateString(),
      base: emp.baseSalary,
      commissions: emp.accruedCommissionSecured || 0,
      overtime: ovAmount,
      overtimeHours: emp.overtimeHours || 0,
      deductions: insuranceDeduction + taxWithheld,
      net: netPayout
    });

    // Reset Employee accrued stats
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, accruedCommissionSecured: 0, overtimeHours: 0 } : e));
  };


  // If not authorized - render lock wall with switcher option
  if (!isHrAuthorized) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F1E46]/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#FBFBF9] dark:bg-[#121520] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-6 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-500/10">
            <Lock className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-[#0F1E46] dark:text-white text-lg uppercase tracking-wide">
              {language === "ar" ? "وصول معزول - كادر الموارد البشرية" : "SECURITY ACCESS ISOLATED"}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
              Strict personnel clinical certification records and legal payroll vaults require elevated **HR_MANAGER** administrative credentials in accordance with Saudi MOH and health authority directives.
            </p>
          </div>

          <div className="bg-[#EEEDE8] dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 font-bold block">
              YOUR SYSTEM ACCESS STATE: <strong className="text-neutral-700 dark:text-neutral-200 capitalize">{activeRole}</strong>
            </span>
            <button
              onClick={() => setActiveRole("hr_manager")}
              className="mt-1 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black uppercase rounded-lg shadow-md transition-all active:scale-[0.98] duration-100"
            >
              🔐 Activate HR_MANAGER clearance
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white font-semibold transition"
          >
            Dismiss & Cancel View
          </button>
        </div>
      </div>
    );
  }

  // Active physician selected under Privileges
  const currentPrivilegeEmp = employees.find(e => e.id === selectedPrivilegeEmpId) || employees[0];
  // Active reviewed employee
  const currentReviewEmp = employees.find(e => e.id === selectedReviewEmpId) || employees[0];

  return (
    <div className="fixed inset-0 bg-[#FBFBF9] dark:bg-[#0B0E14] z-50 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
        
        {/* Title Bar */}
        <div className="bg-[#0f1e46] text-white px-6 py-4 flex items-center justify-between border-b border-[#2BBFFF]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F46E5]/20 text-[#2BBFFF] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#2BBFFF]" />
            </div>
            <div>
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                {language === "ar" ? "الموارد البشرية" : "Human Resources"}
                <span className="text-[9px] bg-[#4F46E5]/40 text-[#2BBFFF] border border-[#2BBFFF]/30 px-1.5 py-0.5 rounded uppercase font-mono font-bold animate-pulse">
                  SYSTEM CORE
                </span>
              </h2>
              <p className="text-[10px] font-mono text-neutral-300">
                Medical compliance logs synchronized with standard accounting ledger & biometric door locks.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {/* Clinical Messages Icon Button with unread messages count */}
            <button
              type="button"
              onClick={() => {
                const event = new CustomEvent("open-clinical-messages");
                window.dispatchEvent(event);
              }}
              className="relative p-2 rounded-lg text-neutral-300 hover:text-white dark:hover:text-[#2BBFFF] hover:bg-white/10 shrink-0 transition flex items-center justify-center cursor-pointer"
              title={language === "ar" ? "الشبكة الفورية للرسائل السريرية" : "Active Encounters Messenger Context"}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg border border-neutral-900 animate-pulse animate-duration-1000">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {activeRole === "hr_manager" ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase rounded-lg font-mono">
                  Locked
                </span>
                <button
                  onClick={() => {
                    if (setActiveRole) {
                      setActiveRole("doctor");
                    }
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-tight rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition text-neutral-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Context Filters & Navigation Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#121520] border-b border-[#EAE6DF] dark:border-neutral-800 px-6 py-3 flex flex-wrap gap-4 items-center justify-between">
          
          {/* Main SubTabs switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab("vitals")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "vitals"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              📊 {language === "ar" ? "نظرة عامة" : "Vitals Dashboard"}
            </button>
            <button
              onClick={() => setActiveTab("personnel")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "personnel"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              👥 {language === "ar" ? "الملفات الطبية" : "Credentials Directory"}
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "roster"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              📅 {language === "ar" ? "جدول الشفتات" : "Shift Roster"}
            </button>
            <button
              onClick={() => setActiveTab("payroll")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "payroll"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              💰 {language === "ar" ? "محرك الرواتب" : "Payroll Engine"}
            </button>
            <button
              onClick={() => setActiveTab("recruitment")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "recruitment"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              💼 {language === "ar" ? "التوظيف والتقييم" : "ATS & Review Matrix"}
            </button>
          </div>

          {/* Context switchers and search inputs */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder={language === "ar" ? "ابحث هنا..." : "Search corporate staff..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Department Dropdown switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-mono">Dept:</span>
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value as any)}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-1.5 rounded-lg text-xs font-bold outline-none"
              >
                <option value="All">All Staff</option>
                <option value="Medical">Medical Staff Only</option>
                <option value="Nursing">Nursing Squad</option>
                <option value="Admin">Administration</option>
              </select>
            </div>

            {/* Status Switcher Toggle */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded ${statusFilter === "All" ? "bg-[#4F46E5] text-white" : "text-neutral-400"}`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded ${statusFilter === "ACTIVE" ? "bg-emerald-600 text-white" : "text-neutral-400"}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("ON_LEAVE")}
                className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded ${statusFilter === "ON_LEAVE" ? "bg-amber-500 text-white" : "text-neutral-400"}`}
              >
                On-Leave
              </button>
            </div>

          </div>

        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* TAB 1: VITALS DASHBOARD */}
          {activeTab === "vitals" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Vital Signs (KPI Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* HEADCOUNT CARD */}
                <div className="bg-[#FFFFFF] dark:bg-[#121520] p-5 rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">⚡ WORKFORCE ROSTER FILL RATE</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#0F172A] dark:text-white">{( (activeHeadcount / employees.length) * 100 ).toFixed(0)}%</span>
                      <span className="text-xs text-neutral-400">({activeHeadcount} / {employees.length} Active Officers)</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(activeHeadcount/employees.length)*100}%` }}></div>
                    </div>
                    <span className="text-[9px] text-neutral-400 block mt-1">Current medical clinical pipeline coverage: secure.</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 h-fit">
                    <Users className="w-7 h-7" />
                  </div>
                </div>

                {/* CREDENTIALS EXPIRED COUNTER */}
                <div className="bg-[#FFFFFF] dark:bg-[#121520] p-5 rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block font-sans">⚠️ Clinical Credential Expiry Alerts</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${expiringCredentialsCount > 0 ? "text-amber-500 animate-pulse" : "text-neutral-700 dark:text-neutral-300"}`}>
                        {expiringCredentialsCount} Active Risks
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">
                      {expiringCredentialsCount > 0 
                        ? "Ophthalmic license renewals required within 60 days on priority ledger rules." 
                        : "All surgical certificates checked, validated and logged up to date."}
                    </p>
                    <button
                      onClick={() => {
                        const targets = employees.filter(e => e.licenseExpiryDate && (new Date(e.licenseExpiryDate).getTime() - new Date("2026-06-10").getTime() < (60 * 24 * 60 * 60 * 1000)));
                        targets.forEach(e => {
                          if (!dispatchedNotices.includes(e.id)) {
                            setDispatchedNotices(prev => [...prev, e.id]);
                          }
                        });
                        alert(`Alert warning dispatches issued directly via simulated SMS and SMTP mailer to: ${targets.map(e=> `${e.firstName} (${e.id})`).join(", ")}`);
                      }}
                      className="mt-2 text-[10px] font-bold text-[#4F46E5] dark:text-[#2BBFFF] hover:underline flex items-center gap-1 text-left"
                    >
                      <Bell className="w-3 h-3" /> Auto-broadcast expirations warnings
                    </button>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/10 p-4 rounded-2xl text-amber-500 h-fit">
                    <BadgeAlert className="w-7 h-7" />
                  </div>
                </div>

                {/* OVERTIME BURN RATE */}
                <div className="bg-[#FFFFFF] dark:bg-[#121520] p-5 rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">📉 MONTHLY OVERTIME BURN RATE</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-600 dark:text-[#2BBFFF]">${totalOvertimeCost.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400">({employees.reduce((s, e)=>s+(e.overtimeHours||0), 0)} Extra Hours)</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(100, (totalOvertimeCost / 5000) * 100)}%` }}></div>
                    </div>
                    <span className="text-[9px] text-neutral-400 block mt-1">Hospital limit budget: $5,000 | Normal overtime.</span>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-2xl text-indigo-600 dark:text-[#2BBFFF] h-fit">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                </div>

              </div>

              {/* The HR Action Queue (Inbox) */}
              <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-105 dark:border-neutral-800">
                  <h3 className="font-sans font-extrabold text-xs text-neutral-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-neutral-400" /> Urgent HR Action Inbox Matrix & Compliance Alerts
                  </h3>
                  <span className="text-[9px] font-mono bg-indigo-50 dark:bg-neutral-900 border border-indigo-200/40 text-[#4F46E5] dark:text-[#2BBFFF] px-2 py-0.5 rounded font-black uppercase">
                    Continuous Audit Online
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Leave Approvals Queue */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-[#0F172A] dark:text-white uppercase font-sans">✈️ Vacation & Leave Requests</span>
                      <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {leaveRequests.filter(l=>l.status === "PENDING_APPROVAL").length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {leaveRequests.map((req, i) => (
                        <div key={i} className="p-3 bg-neutral-50 dark:bg-[#1A1E2E] border border-neutral-150 dark:border-neutral-800 rounded-2xl relative text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-extrabold text-neutral-800 dark:text-white">{req.employeeName}</span>
                              <span className="text-[10px] text-neutral-400 block">{req.leaveType} | {req.startDate} to {req.endDate}</span>
                            </div>
                            <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase ${
                              req.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 italic mt-2">"{req.coverageNotes}"</p>
                          {req.status === "PENDING_APPROVAL" && (
                            <div className="flex gap-2 mt-3 pt-2 border-t border-dashed border-neutral-200/50">
                              <button
                                onClick={() => {
                                  // Set leave request status
                                  setLeaveRequests(prev => prev.map(l => l.requestId === req.requestId ? { ...l, status: "APPROVED" } : l));
                                  // Update employee status in database
                                  setEmployees(prev => prev.map(e => e.id === req.employeeId ? { ...e, employmentStatus: "ON_LEAVE" } : e));
                                  alert(`Leave approved! Employee status modified to ON_LEAVE. Clinic on-call matrix blocked from appointments.`);
                                }}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setLeaveRequests(prev => prev.map(l => l.requestId === req.requestId ? { ...l, status: "REJECTED" } : l));
                                  alert("Leave request rejected to secure surgical coverage quotas.");
                                }}
                                className="py-1 px-2.5 bg-neutral-200 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 font-bold text-[9px] uppercase rounded hover:bg-neutral-300"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Onboarding Bottlenecks column */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-[#0F172A] dark:text-white uppercase font-sans block">🏁 New Employee Onboarding Vault</span>
                    <div className="space-y-3">
                      {onboardingBottlenecks.map((bot, i) => (
                        <div key={i} className="p-3 bg-neutral-50 dark:bg-[#1A1E2E] border border-neutral-150 dark:border-neutral-800 rounded-2xl text-left">
                          <span className="text-xs font-extrabold text-neutral-800 dark:text-white block">{bot.name}</span>
                          <span className="text-[10px] text-blue-500 block">{bot.type}</span>
                          <span className="text-[10px] text-neutral-400 block mt-1">Pending: {bot.step}</span>
                          <div className="mt-3 flex justify-end">
                            {bot.speedUpClaimed ? (
                              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 uppercase">
                                <Check className="w-3.5 h-3.5" /> High priority bypass active
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setOnboardingBottlenecks(prev => prev.map(b => b.id === bot.id ? { ...b, speedUpClaimed: true } : b));
                                  alert(`Triggered credentials expediting. Notified board committee to bypass background clearance queue.`);
                                }}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[9px] font-black uppercase rounded"
                              >
                                FAST-TRACK CLAIM
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timesheet Adjustments Column */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-[#0F172A] dark:text-white uppercase font-sans block">⏰ Biometric Timesheet Issues</span>
                    <div className="space-y-3">
                      {timesheetIssues.map((ts, i) => (
                        <div key={i} className="p-3 bg-neutral-50 dark:bg-[#1A1E2E] border border-neutral-150 dark:border-neutral-800 rounded-2xl text-left">
                          <div className="flex justify-between">
                            <span className="text-xs font-extrabold text-neutral-850 dark:text-white block">{ts.name}</span>
                            <span className="text-[9px] font-mono text-red-500 lowercase bg-red-50 dark:bg-red-950/20 px-1 rounded">unresolved</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 block mt-1">{ts.issue}</span>
                          <div className="mt-4 flex gap-2">
                            {ts.resolved ? (
                              <span className="text-[10px] text-emerald-500 font-mono font-black uppercase block">Resolved Successfully</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setTimesheetIssues(prev => prev.map(t=>t.id === ts.id ? { ...t, resolved: true }: t));
                                  // Log default 8.5 hr active shifts
                                  setEmployees(prev => prev.map(e => e.id === ts.employeeId ? { ...e, overtimeHours: (e.overtimeHours || 0) + 1.5 } : e));
                                  alert("Timesheet corrected. Defaulted session logged, 1.5 overtime units successfully registered.");
                                }}
                                className="w-full py-1 bg-[#4F46E5] text-white text-[9px] font-black uppercase rounded hover:bg-[#4338CA]"
                              >
                                Auto-repair timesheet with 8 Hr Normal
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS DIRECTORY (POLICIES / DETAILS) */}
          {activeTab === "personnel" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-sans">
                  📋 Al Jawarih Clinical Employees Registry & Credential Ledger
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-[#0F1E46] text-white hover:bg-neutral-800 text-xs font-black uppercase rounded-lg flex items-center gap-1.5 shadow-md active:scale-[0.98] duration-100"
                >
                  <UserPlus className="w-4 h-4" /> Recruits Entry File
                </button>
              </div>

              {/* Main Directory Splitter */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Employees Spreadsheet */}
                <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#121520] rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 overflow-hidden shadow-sm">
                  <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-850 p-4 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase font-black tracking-widest">Active Personnel List ({filteredEmployees.length} profiles)</span>
                    <span className="text-[10px] font-mono text-neutral-400">Continuous double-entry lookup index</span>
                  </div>
                  <table className="w-full text-left border-collapse select-text">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950/40 border-b border-[#EAE6DF] dark:border-neutral-850 text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
                        <th className="p-3">Employee</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">License Info / Code</th>
                        <th className="p-3 text-right">Expiration</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE6DF]/30 dark:divide-neutral-800 text-xs text-neutral-800 dark:text-neutral-200">
                      {filteredEmployees.map((emp) => {
                        const alertRemaining = emp.licenseExpiryDate 
                          ? Math.ceil((new Date(emp.licenseExpiryDate).getTime() - new Date("2026-06-10").getTime()) / (1000*60*60*24))
                          : 999;
                        return (
                          <tr 
                            key={emp.id} 
                            onClick={() => {
                              setSelectedPrivilegeEmpId(emp.id);
                              setSelectedReviewEmpId(emp.id);
                            }}
                            className={`hover:bg-[#FDFDFB] dark:hover:bg-neutral-800/20 cursor-pointer transition ${
                              selectedPrivilegeEmpId === emp.id ? "bg-[#EEEDE8]/40 dark:bg-neutral-800/40" : ""
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-neutral-850 dark:text-white">{emp.firstName} {emp.lastName}</span>
                                <span className="text-[9px] font-mono text-neutral-400">ID: {emp.id} • {emp.contactNumber}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-[10px] text-[#4F46E5] dark:text-[#2BBFFF] uppercase">
                              {emp.department || "ADMINISTRATION"}
                            </td>
                            <td className="p-3 font-mono text-[10px]">
                              {emp.medicalLicenseNumber || "N/A - Non Clinical"}
                            </td>
                            <td className="p-3 text-right">
                              {emp.licenseExpiryDate ? (
                                <div className="flex flex-col items-end">
                                  <span className={`font-mono text-[10px] font-bold ${alertRemaining <= 60 ? "text-amber-500 animate-pulse" : "text-neutral-500 dark:text-neutral-400"}`}>
                                    {emp.licenseExpiryDate}
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-mono">({alertRemaining} days left)</span>
                                </div>
                              ) : (
                                <span className="text-neutral-300 font-mono">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 text-[8px] font-mono font-extrabold rounded uppercase ${
                                emp.employmentStatus === "ACTIVE" 
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}>
                                {emp.employmentStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-xs text-neutral-400 italic">
                            No employees match your active filter matrix.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Right clinical privileging panel */}
                <div className="space-y-6">
                  
                  {/* Digital file card details */}
                  <div className="bg-[#FFFFFF] dark:bg-[#121520] rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 p-5 shadow-sm text-left space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#EAE6DF]/70 dark:border-neutral-800">
                      <Award className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-black text-[#0F172A] dark:text-white uppercase font-sans">
                        Clinical Privileging Console
                      </span>
                    </div>

                    {currentPrivilegeEmp ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#0f1e46] dark:text-[#2BBFFF]">{currentPrivilegeEmp.firstName} {currentPrivilegeEmp.lastName}</h4>
                          <p className="text-[10px] font-mono text-neutral-400 block uppercase">{currentPrivilegeEmp.jobTitle}</p>
                        </div>

                        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl border border-[#EAE6DF]/60 dark:border-neutral-800 space-y-2">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">BOARD RECOGNITIONS</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(currentPrivilegeEmp.boardCertifications || ["General Practice Medical License"]).map((cert, j) => (
                              <span key={j} className="bg-slate-100 dark:bg-[#202538] text-neutral-700 dark:text-neutral-300 text-[9px] p-1.5 rounded-lg border border-slate-200/50 font-semibold">
                                ✙ {cert}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Active privs checklist */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">ACTIVELY GRANTED OPER OR CLINIC PRIVILEGES</span>
                          
                          <div className="space-y-1.5 max-h-[160px] overflow-auto">
                            {["MACULAR_SURGERY", "LASER_PHOTOCOAGULATION", "INTRAVITREAL_INJECTIONS", "VISUAL_ACUITY_TESTING", "INTRAOCULAR_PRESSURE_TONOMETRY", "OPHTHALMIC_DRUG_DISCHARGE", "PHARMACOVIGILANCE", "BILLING_POST"].map((priv) => {
                              const isGranted = (currentPrivilegeEmp.clinicalPrivileges || []).includes(priv);
                              return (
                                <label key={priv} className="flex items-center gap-2 p-2 bg-neutral-100/50 dark:bg-[#1A1F30]/40 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[9.5px] cursor-pointer transition select-none">
                                  <input
                                    type="checkbox"
                                    checked={isGranted}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setEmployees(prev => prev.map(emp => {
                                        if (emp.id === currentPrivilegeEmp.id) {
                                          const currentPrivs = emp.clinicalPrivileges || [];
                                          const nextPrivs = checked 
                                            ? [...currentPrivs, priv] 
                                            : currentPrivs.filter(p => p !== priv);
                                          return { ...emp, clinicalPrivileges: nextPrivs };
                                        }
                                        return emp;
                                      }));
                                    }}
                                    className="accent-indigo-600 rounded"
                                  />
                                  <span className="font-mono text-neutral-700 dark:text-neutral-300 uppercase tracking-tight">{priv.replace("_", " ")}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Malpractice */}
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-2xl flex items-start gap-2 text-[10px] leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <strong>Malpractice Indemnity Insurance:</strong> Verified verified valid until <strong>{currentPrivilegeEmp.malpracticeInsuranceExpiry || "2026-12-31"}</strong>. Legal clinical liability protection active.
                          </div>
                        </div>

                      </div>
                    ) : (
                      <p className="text-neutral-400 italic text-xs">Select any clinician from the table directory to audit credential files.</p>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: SHIFT ROSTER & BIOMETRIC GATE */}
          {activeTab === "roster" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Scheduling Board */}
                <div className="lg:col-span-2 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <h3 className="text-xs font-extrabold text-neutral-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" /> Weekly Clinical Room & Attending Physician Schedules
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">Duty assignment rotation slates</span>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-4 rounded-2xl text-left grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">Assign Clinician</label>
                      <select
                        value={selectedShiftDoctor}
                        onChange={e => setSelectedShiftDoctor(e.target.value)}
                        className="w-full bg-[#FFFFFF] dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-lg text-xs"
                      >
                        <option value="">-- Choose clinician --</option>
                        {employees.map(e => (
                          <option key={e.id} value={`${e.firstName} ${e.lastName}`}>
                            {e.firstName} {e.lastName} ({e.jobTitle.split("-")[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">Physical Workstation / Room</label>
                      <select
                        value={selectedShiftRoom}
                        onChange={e => setSelectedShiftRoom(e.target.value)}
                        className="w-full bg-[#FFFFFF] dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-lg text-xs"
                      >
                        <option value="Retina Room">Macular Retina Room 1</option>
                        <option value="Glaucoma Room">Glaucoma Diagnostics Room</option>
                        <option value="Main Triage">Triage Station Intake</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">Duty Day</label>
                      <select
                        value={selectedShiftDay}
                        onChange={e => setSelectedShiftDay(e.target.value)}
                        className="w-full bg-[#FFFFFF] dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-lg text-xs"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        if (!selectedShiftDoctor) {
                          alert("Specify active clinician first.");
                          return;
                        }
                        setShiftRoster(prev => ({
                          ...prev,
                          [selectedShiftRoom]: {
                            ...(prev[selectedShiftRoom] || {}),
                            [selectedShiftDay]: selectedShiftDoctor
                          }
                        }));
                        alert(`Successfully scheduled ${selectedShiftDoctor} to ${selectedShiftRoom} for ${selectedShiftDay}.`);
                        setSelectedShiftDoctor("");
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-lg shadow"
                    >
                      Commit Duty Assign
                    </button>
                  </div>

                  {/* Visual Shift Grid */}
                  <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-widest text-center">
                        <th className="p-2 border-r border-neutral-200/50 dark:border-neutral-800">Station / Day</th>
                        <th className="p-2 border-r border-[#EAE6DF] dark:border-neutral-800">Monday</th>
                        <th className="p-2 border-r border-[#EAE6DF] dark:border-neutral-800">Tuesday</th>
                        <th className="p-2 border-r border-[#EAE6DF] dark:border-neutral-800">Wednesday</th>
                        <th className="p-2 border-r border-[#EAE6DF] dark:border-neutral-800">Thursday</th>
                        <th className="p-2">Friday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150 dark:divide-neutral-800">
                      {Object.keys(shiftRoster).map((room) => (
                        <tr key={room} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 text-center font-sans">
                          <td className="p-3 font-semibold text-[#0F172A] dark:text-teal-400 bg-neutral-50 dark:bg-neutral-950/20 text-left text-xs border-r border-neutral-200 dark:border-neutral-800 leading-tight">
                            🏢 {room}
                          </td>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                            const doc = shiftRoster[room]?.[day] || "Unassigned - Empty Slots";
                            const isClaimed = !doc.includes("Standby") && !doc.includes("Unassigned") && !doc.includes("Empty");
                            return (
                              <td key={day} className={`p-2 text-[10.5px] border-r border-[#EAE6DF]/60 dark:border-neutral-800/60 leading-snug font-medium ${
                                isClaimed ? "text-indigo-600 dark:text-neutral-200 bg-white dark:bg-[#161D32]/30" : "text-neutral-300 italic bg-neutral-50/20"
                              }`}>
                                {doc}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 24/7 On-Call Matrix */}
                  <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-4 text-left">
                    <span className="text-[10px] font-mono font-bold text-indigo-500 block uppercase tracking-wider mb-2">🚨 Rotating 24/7 Ophthalmic Trauma & General Emergency On-Call Duty Rota</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                      <div className="p-2 bg-white/50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-mono">PRIMARY SURGICAL RESPONDER:</span>
                          <strong>Dr. Alexander Sterling</strong>
                        </div>
                        <span className="text-[8px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">ACTIVE ON-CALL</span>
                      </div>
                      <div className="p-2 bg-white/50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-mono">SUPPORT ADVANCED TRIAGE NURSE:</span>
                          <strong>Nurse Beatrice Kemp</strong>
                        </div>
                        <span className="text-[8px] bg-[#4F46E5]/20 text-[#2BBFFF] px-1.5 py-0.5 rounded font-mono font-bold uppercase">REGISTERED BACKUP</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Live Biometric badge scanner logs */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-5 shadow-sm text-left space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-extrabold text-neutral-850 dark:text-white uppercase tracking-wider block font-sans">
                      📟 Biometric门 Badge Scanner Loop
                    </span>
                    <span className="text-[8px] font-mono bg-pink-100 text-pink-700 px-1.5 rounded uppercase font-bold animate-pulse">Live link</span>
                  </div>

                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Swipe badge hook registers real-time physical attendance at hospital entrances, calculating automatic overtime on double-entry cycles.
                  </p>

                  {/* Simulator buttons */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-800 space-y-2">
                    <span className="text-[9px] font-mono text-neutral-400 font-bold block uppercase">🚀 BADGE SWIPE LOG SIMULATOR</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => triggerBiometricSwipe("EMP-001", "CLOCK_IN")}
                        className="px-2 py-1.5 bg-[#4F46E5] text-white font-mono text-[9px] rounded uppercase font-black"
                      >
                        Dr. Sterling SWIPE IN
                      </button>
                      <button
                        onClick={() => triggerBiometricSwipe("EMP-001", "CLOCK_OUT")}
                        className="px-2 py-1.5 bg-[#4F46E5]/20 text-[#4F46E5] border border-[#4F46E5]/40 font-mono text-[9px] rounded uppercase font-black hover:bg-[#4F46E5] hover:text-white"
                      >
                        Dr. Sterling SWIPE OUT
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => triggerBiometricSwipe("EMP-002", "CLOCK_IN")}
                        className="px-2 py-1.5 bg-teal-600 text-white font-mono text-[9px] rounded uppercase font-black"
                      >
                        Nurse Kemp SWIPE IN
                      </button>
                      <button
                        onClick={() => triggerBiometricSwipe("EMP-002", "CLOCK_OUT")}
                        className="px-2 py-1.5 bg-teal-600/20 text-teal-600 border border-teal-600/40 font-mono text-[9px] rounded uppercase font-black hover:bg-teal-600 hover:text-white"
                      >
                        Nurse Kemp SWIPE OUT
                      </button>
                    </div>
                  </div>

                  {/* Swipes Table */}
                  <div className="max-h-[170px] overflow-auto border border-neutral-100 dark:border-neutral-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {biometricLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-neutral-50/55 dark:hover:bg-neutral-800/10">
                            <td className="p-2 font-black text-[#0f1e46] dark:text-[#2BBFFF]">{log.timestamp}</td>
                            <td className="p-2 font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                              {log.employeeName}
                            </td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                log.actionType === "CLOCK_IN" 
                                  ? "bg-emerald-500/10 text-emerald-600" 
                                  : "bg-orange-500/10 text-orange-600"
                              }`}>
                                {log.actionType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: PAYROLL ENGINE COMPENSATIONS & DIRECT LABS */}
          {activeTab === "payroll" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF] dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-sans">
                  💰 Consolidated Staff Compensation, Secured Commissions & Payroll Engine
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Total Month Pool: ${totalPayrollCost.toLocaleString()}</span>
              </div>

              {/* Main detailed worksheet */}
              <div className="bg-[#FFFFFF] dark:bg-[#121520] rounded-3xl border border-[#EAE6DF] dark:border-neutral-800 overflow-hidden shadow-sm">
                <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900 border-b border-[#EAE6DF] dark:border-neutral-850 p-4 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-black tracking-widest">
                    Salary Compensation Ledger Sheet
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400">Calculated on Standard base contract wages + biometric overtime + consult accruals</span>
                </div>

                <table className="w-full text-left border-collapse select-text">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/40 border-b border-[#EAE6DF] dark:border-neutral-850 text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-3">Employee ID</th>
                      <th className="p-3">Personnel Name</th>
                      <th className="p-3 text-right">Base Wage Contract</th>
                      <th className="p-3 text-right">Accrued Sec. Commission</th>
                      <th className="p-3 text-right">Biometric Overtime Pay</th>
                      <th className="p-3 text-right">Insurance Deduct</th>
                      <th className="p-3 text-right">Tax Withheld</th>
                      <th className="p-3 text-right">NET ESTIMATE</th>
                      <th className="p-3 text-center">Verify & Disburse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE6DF]/30 dark:divide-neutral-800 text-xs text-neutral-800 dark:text-neutral-200">
                    {filteredEmployees.map((emp) => {
                      const ovAmount = (emp.overtimeHours || 0) * 55;
                      const grossSalary = emp.baseSalary + (emp.accruedCommissionSecured || 0) + ovAmount;
                      const deductCombined = 320 + 140; // Simulated constant health + tax deductions
                      const netCalculation = grossSalary - deductCombined;

                      return (
                        <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                          <td className="p-3 font-mono font-bold text-neutral-400">{emp.id}</td>
                          <td className="p-3 font-extrabold text-[#0f1e46] dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-neutral-700 dark:text-neutral-300">
                            ${emp.baseSalary.toLocaleString()}/mo
                          </td>
                          <td className="p-3 text-right font-mono text-[#4F46E5] dark:text-[#2BBFFF] font-extrabold">
                            +${(emp.accruedCommissionSecured || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-teal-600 font-bold">
                            +${ovAmount.toLocaleString()} <span className="text-[9px] text-neutral-400 font-normal">({emp.overtimeHours || 0}hr)</span>
                          </td>
                          <td className="p-3 text-right font-mono text-rose-500">
                            -$320.00
                          </td>
                          <td className="p-3 text-right font-mono text-rose-500">
                            -$140.00
                          </td>
                          <td className="p-3 text-right font-mono font-black text-[#0f1e46] dark:text-[#2BBFFF]">
                            ${netCalculation.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleProcessDisbursal(emp)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase rounded-lg active:scale-95 transition"
                            >
                              💵 Disburse & Voucher
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Informational Guidelines footer */}
              <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl p-4 flex gap-4 items-center text-left">
                <CreditCard className="w-8 h-8 text-[#4F46E5] shrink-0" />
                <p className="text-[10.5px] text-neutral-500 leading-relaxed">
                  <strong>Corporate Salary disbursement process:</strong> Double-entry bookkeeping maps directly as a validated ledger voucher. Standard Bank clearing locks timesheets once disbursals are executed, clearing accrued specialist variables for safe compliance.
                </p>
              </div>

            </div>
          )}

          {/* TAB 5: RECRUITMENT ATS & PEER PERFORMANCE RATINGS */}
          {activeTab === "recruitment" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Applicant Tracking System (ATS) */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-black text-neutral-850 dark:text-white uppercase tracking-wider block font-sans">
                      🎯 Ophthalmic HR Applicant Pipeline (ATS Tracker)
                    </span>
                    <span className="text-[10px] text-neutral-400">2 active clinical resumes in audit</span>
                  </div>

                  <p className="text-[10.5px] text-neutral-400">
                    Ophthalmic technician and specialized clinician applicant funnel. Convert applicants directly to registered active staff files instantly with preset credentials.
                  </p>

                  <div className="space-y-3">
                    {applicants.map((candidate) => (
                      <div key={candidate.id} className="p-4 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-150 dark:border-neutral-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white">{candidate.fullName}</h4>
                            <span className="px-1.5 py-0.5 text-[8px] bg-indigo-50/80 text-[#4F46E5] border border-indigo-200/40 font-bold uppercase rounded font-mono">
                              ⭐ {candidate.score} / 5.0 Rating
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-600 dark:text-teal-400 block font-mono uppercase font-bold">{candidate.specialty}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">ID: {candidate.nationalId} • Expected Salary: ${candidate.salaryExpectation.toLocaleString()}/mo</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onboardApplicant(candidate)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg active:scale-95 transition"
                          >
                            ✅ Approve & Hire Staff
                          </button>
                          <button
                            onClick={() => {
                              setApplicants(prev => prev.filter(app => app.id !== candidate.id));
                              alert("Candidate file archived. Notification issued.");
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg border border-[#EAE6DF] dark:border-neutral-800"
                            title="Reject candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {applicants.length === 0 && (
                      <p className="text-center text-neutral-400 text-xs italic py-4">ATS pipeline currently cleared.</p>
                    )}
                  </div>
                </div>

                {/* Annual Review Matrix & Performance Peer */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-5 shadow-sm text-left space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-black text-neutral-850 dark:text-white uppercase tracking-wider block font-sans">
                      ⭐ Hospital Staff Annual Review & Star Diagnostics Matrix
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">Annual rating reviews index</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">Choose Officer for Review Evaluation</label>
                      <select
                        value={selectedReviewEmpId}
                        onChange={e => setSelectedReviewEmpId(e.target.value)}
                        className="w-full bg-[#FFFFFF] dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-lg text-xs"
                      >
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.firstName} {e.lastName} ({e.jobTitle.split("-")[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentReviewEmp && (
                      <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900 border border-[#EAE6DF]/60 dark:border-neutral-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-black text-[#0F172A] dark:text-white uppercase font-sans">
                              {currentReviewEmp.firstName} {currentReviewEmp.lastName}
                            </h4>
                            <span className="text-[10px] font-mono text-neutral-400">Position Profile: {currentReviewEmp.jobTitle}</span>
                          </div>
                          
                          {/* Star ratings */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => {
                                  setEmployees(prev => prev.map(e => e.id === currentReviewEmp.id ? { ...e, performanceScore: star } : e));
                                  alert(`Score updated to ${star}/5 stars!`);
                                }}
                                className={`text-base font-black transition ${
                                  star <= (currentReviewEmp.performanceScore || 4) ? "text-yellow-400" : "text-neutral-300"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Peer Comments box */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">PEER COMMENTS & REVIEWS</label>
                          <textarea
                            className="w-full p-2.5 bg-white dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                            rows={3}
                            value={currentReviewEmp.peerFeedback || ""}
                            placeholder="Enter review metrics here..."
                            onChange={(e) => {
                              const notes = e.target.value;
                              setEmployees(prev => prev.map(emp => emp.id === currentReviewEmp.id ? { ...emp, peerFeedback: notes } : emp));
                            }}
                          />
                        </div>

                        <span className="text-[9px] text-neutral-400 block uppercase font-mono tracking-tight">Verified by Chief Medical Officer Hamad</span>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* RECRUIT PERSONNEL DIALOG OVERLAY (MODAL) */}
        {showAddModal && (
          <div className="fixed inset-0 z-[60] bg-[#0F1E46]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleRegRecruit} className="bg-white dark:bg-[#121520] w-full max-w-md rounded-3xl shadow-2xl border border-neutral-150 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-120">
              <div className="bg-[#0f1e46] text-white px-6 py-4 flex items-center justify-between border-b border-[#2BBFFF]/20">
                <span className="font-bold text-sm tracking-wide flex items-center gap-1.5 uppercase font-sans">
                  <UserPlus className="w-5 h-5 text-[#2BBFFF]" /> New Employee Onboarding Registration
                </span>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Last Name</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">National Identification (SSN/ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. 984-211-505"
                    className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono focus:outline-[#2BBFFF]"
                    value={nationalId}
                    onChange={e => setNationalId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Contact Number / Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +966-55-1122"
                    className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold focus:outline-[#2BBFFF]"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Hospital Department</label>
                    <select
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold focus:outline-none"
                      value={addDept}
                      onChange={e => setAddDept(e.target.value)}
                    >
                      <option value="RETINA_CLINIC">RETINA_CLINIC</option>
                      <option value="GLAUCOMA_CLINIC">GLAUCOMA_CLINIC</option>
                      <option value="ORBIT_CLINIC">ORBIT_CLINIC</option>
                      <option value="TRIAGE">TRIAGE_HALL</option>
                      <option value="PHARMACY">PHARMACY_WAREHOUSE</option>
                      <option value="ADMINISTRATION">ADMIN_OFFICE</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Profession Style</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Dubai/KSA Health Authority License Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MED-88492-UAE"
                    className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono focus:outline-[#2BBFFF]"
                    value={addLicense}
                    onChange={e => setAddLicense(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Base Contract Wage ($)</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono focus:outline-none"
                      value={baseSalary}
                      onChange={e => setBaseSalary(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">Accruals (%)</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-neutral-50 dark:bg-[#1A1F30] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono focus:outline-none"
                      value={commission}
                      onChange={e => setCommission(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#EEEDE8]/50 dark:bg-neutral-900 px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 font-bold text-xs rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0F1E46] text-white font-bold text-xs rounded-xl transition hover:bg-[#1A2D6E]">
                  Complete Officer Onboarding
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PAYSLIP PRINT VOUCHER MODAL */}
        {payslip && (
          <div className="fixed inset-0 z-[60] bg-[#0F1E46]/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#12141F] text-white border border-[#2BBFFF]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl relative font-mono text-left space-y-4 animate-in zoom-in-95">
              <div className="text-center border-b border-dashed border-white/20 pb-4">
                <h4 className="font-sans font-black text-xs text-[#2BBFFF] tracking-widest uppercase mb-1">
                  ✙ AL JAWARIH OPHTHALMIC ERP ✙
                </h4>
                <p className="text-[9px] text-neutral-400 uppercase font-mono font-black">Clinical Payroll Disbursement Slip</p>
              </div>

              <div className="text-[10.5px] space-y-1.5 border-b border-dashed border-white/15 pb-4 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">VOUCHER TOKEN:</span>
                  <span className="text-yellow-400 font-bold">{payslip.voucherId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">DISBURSE TYPE:</span>
                  <span className="text-cyan-400 font-bold">CASHIER LEDGER VERIFIED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">DISBURSED DATE:</span>
                  <span>{payslip.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">BENEFICIARY:</span>
                  <span className="text-white font-black">{payslip.employeeName} ({payslip.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">DUTY PRACTICE:</span>
                  <span className="text-teal-400 font-bold">{payslip.employeeTitle}</span>
                </div>
              </div>

              <div className="text-[10.5px] space-y-2 border-b border-dashed border-white/15 pb-4">
                <div className="flex justify-between">
                  <span>BASE CONTRACT REMITTANCE:</span>
                  <span>${payslip.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>SECURED PROCEDURE REVENUE VARIABLES:</span>
                  <span>+${payslip.commissions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-400">
                  <span>BIOMETRIC OVERTIME COMPENSATIONS ({payslip.overtimeHours} Hrs):</span>
                  <span>+${payslip.overtime.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>MOH HEALTH & TAX DEDUCTIONS combined:</span>
                  <span>-${payslip.deductions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-xs text-yellow-400 border-t border-dashed border-white/20 pt-3 select-all">
                  <span>NET CLEARED DISBURSEMENT:</span>
                  <span>${payslip.net.toFixed(2)}</span>
                </div>
              </div>

              <p className="bg-black/30 p-2.5 rounded text-[9.5px] leading-relaxed text-neutral-400">
                <strong>Secured Audit Track:</strong> Unified double-entry transaction voucher successfully compiled. Financial ledger debited corporate employee salary cost-center standard chart of accounts securely.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-[#2BBFFF] hover:bg-[#57dfff] text-[#0F1E46] text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Print Check voucher
                </button>
                <button
                  onClick={() => setPayslip(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs"
                >
                  Dismiss Slates
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
