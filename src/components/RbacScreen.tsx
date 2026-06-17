/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  FileJson,
  BadgeAlert,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
  Power,
  Terminal,
  Check,
  X,
  Fingerprint,
  MapPin,
  RefreshCw,
  Sliders,
  Play,
  Settings,
  Bell,
  CircleSlash,
  ChevronRight,
  Database
} from "lucide-react";
import { ClinicalRole } from "../types";

interface RbacScreenProps {
  activeRole: ClinicalRole;
  onSelectRole: (role: ClinicalRole) => void;
  language?: "en" | "ar";
}

// Structuring translation vocabulary for dual RTL/LTR adaptivity
const vocab = {
  en: {
    title: "IT Security & Clearance Admin Center",
    subtitle: "Real-time threat monitoring, shift-bound role architecture, client IP whitelisting, and supervisor PIN bypass overrides.",
    activeSessions: "Active Verified Sessions",
    pendingOverrides: "Pending Overrides",
    failedAlerts: "Failed Access Alerts",
    tabMonitor: "Live Threat monitor",
    tabRbac: "RBAC Privilege Matrix",
    tabPins: "PIN Elevation Console",
    tabRoster: "Roster Time Guards",
    tabAudit: "Permanent Audit Trail",
    auditFeedTitle: "Tamper-Proof Audit & Active Terminal Feed",
    allEvents: "All Events",
    failuresOnly: "Failures & Overrides Only",
    filterTitle: "Operational Scope Filter",
    roleSelector: "Active User Core Selector:",
    claimDecrypted: "Active JWT Claims & Token Payload Mapping",
    permissionsTitle: "Granular Logical Privileges List",
    revokeBtn: "Revoke JWT Token",
    revokeSuccess: "Session access token permanently revoked by IT.",
    pinTitle: "Real-Time PIN Clearance Playground",
    pinSubtitle: "Conduct a secure double-entry supervisor clearance or biometric bypass test on high-critical operations.",
    chooseAction: "Choose high-stakes target transaction:",
    enterPin: "Enter 6-Digit Secure Supervisor PIN Code:",
    verifyBtn: "Verify & Approve Gate Bypass",
    authorizedStaff: "Registered Security Guardians (Quick PINs for testing):",
    rosterTitle: "Roster-Locked Access Gates",
    rosterSubtitle: "Bridge the gap between active HR shift schedules and workstation portals.",
    enforceTime: "Enforce Roster-Locked Sessions",
    enforceTimeSub: "Users can only authenticate during their scheduled clinical hours.",
    clinicIsolate: "Isolate Attending Specialty clinic",
    clinicIsolateSub: "Forces doctors or staff to remain within designated queue rooms.",
    ipWhitelistTitle: "Hospital Station IP Whitelist Whitelist Rules",
    addIpBtn: "Add Rule",
    recentFails: "Recent Terminal Failure logs",
    simTitle: "Simulate Hospital Workstation Incidents",
    simSub: "Instantly route realistic transactions to watch security modules process and intercept.",
    alertSettle: "Cleared Security Bypass",
    alertSettleAr: "تم تسوية والتحقق من تخطي الأمان بنجاح!",
    alertFailure: "Security Warning: Invalid Authentication PIN supplied!",
    alertFailureAr: "تحذير أمني: رمز مرور التحقق الإلكتروني غير صحيح!"
  },
  ar: {
    title: "مركز إدارة الأمن وتصاريح تكنولوجيا المعلومات",
    subtitle: "مراقبة الأمن والتهديدات الحية، إدارة مصفوفة الصلاحيات، قيود ورديات الموظفين، والتحقق البشري عبر رموز المرور.",
    activeSessions: "الجلسات النشطة الموثقة",
    pendingOverrides: "تذاكر بانتظار الموافقة",
    failedAlerts: "تنبيهات الفشل والخطأ",
    tabMonitor: "شاشة المراقبة الأمنية",
    tabRbac: "مصفوفة صلاحيات (RBAC)",
    tabPins: "بوابة تصاريح PIN",
    tabRoster: "قيود أوقات الوردية",
    tabAudit: "الأرشيف الأمني المشفر",
    auditFeedTitle: "سجل الأنشطة المؤمّن وتدفقات أجهزة الطوارئ",
    allEvents: "جميع الأحداث والعمليات",
    failuresOnly: "التجاوزات والأخطاء فقط",
    filterTitle: "تصنيف نطاق العمليات",
    roleSelector: "مفتاح تبديل صلاحيات دور المستخدم الأساسي:",
    claimDecrypted: "فهرسة حزم الرمز الأمني المشفر ومطالبات JWT",
    permissionsTitle: "تعديل حزم الامتيازات والصلاحيات الحيوية",
    revokeBtn: "إلغاء وفصل رمز JWT",
    revokeSuccess: "تم إلغاء صلاحية الوصول وفصل الجلسة من قبل مسؤول النظام.",
    pinTitle: "بيئة محاكاة رموز التحقق الأمني الفوري (PIN)",
    pinSubtitle: "اختبر آلية الرقابة الثنائية والموافقات السريعة على العمليات المالية والطبية الحساسة.",
    chooseAction: "اختر عملية حيوية بالغة الأهمية لتجاوز القفل:",
    enterPin: "أدخل رمز تحقق المشرف السري (PIN):",
    verifyBtn: "التحقق وترخيص مرور العملية",
    authorizedStaff: "المشرفون والأطباء المرخصون (رموز مرور جاهزة للاختبار):",
    rosterTitle: "قيود الأمن المرتبطة بالورديات الإدارية",
    rosterSubtitle: "الربط التلقائي والذكي بين الحضور والانصراف بقاعدة الموظفين وقدرتهم على الولوج للتطبيقات.",
    enforceTime: "تفعيل أقفال أوقات الدوام الرسمي",
    enforceTimeSub: "منع الموظفين من الولوج للبيانات الحساسة كلياً خارج ساعات العمل الخاصة بهم.",
    clinicIsolate: "عزل وتخصيص غرف العيادات",
    clinicIsolateSub: "حظر الإداريين والأطباء من الاطلاع على عيادات أخرى غير المسجلين عليها باليوم الحالي.",
    ipWhitelistTitle: "عناوين الأجهزة المقبولة بالفحوصات (IP Whitelist)",
    addIpBtn: "إضافة عنوان",
    recentFails: "أحدث محاولات الدخول الخاطئة بنظام المستشفى",
    simTitle: "أدوات محاكاة الحوادث والعمليات الطبية",
    simSub: "افتعال عمليات فورية داخل الأقسام الأخرى لملاحظة تفاعلات السيرفر والإنذارات.",
    alertSettle: "تم تسوية والتحقق من تخطي الأمان بنجاح!",
    alertSettleAr: "تم تسوية والتحقق من تخطي الأمان بنجاح!",
    alertFailure: "تحذير أمني: رمز مرور التحقق الإلكتروني غير صحيح!",
    alertFailureAr: "تحذير أمني: رمز مرور التحقق الإلكتروني غير صحيح!"
  }
};

interface AuditLog {
  id: string;
  timestamp: string;
  terminalId: string;
  user: string;
  role: string;
  action: string;
  status: "SUCCESS" | "BLOCKED" | "BYPASSED";
  details: string;
  severity: "low" | "medium" | "high";
}

interface PinRequest {
  id: string;
  requestingUserId: string;
  requestingTerminalId: string;
  targetModule: string;
  actionCode: string;
  actionContextDescription: string;
  requiredPin: string;
  supervisorName: string;
}

export default function RbacScreen({ activeRole, onSelectRole, language = "en" }: RbacScreenProps) {
  const isAr = language === "ar";
  const t = vocab[isAr ? "ar" : "en"];

  const [activeTab, setActiveTab] = useState<"monitor" | "rbac" | "pins" | "roster" | "audit">("monitor");
  const [showJsonClaims, setShowJsonClaims] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Active terminal sessions that IT can manage
  const [activeSessions, setActiveSessions] = useState([
    { id: "SESS-892", name: "Mildred Vance", role: "receptionist", ip: "10.22.4.91", terminal: "TERM-LOBBY-01", status: "Active" },
    { id: "SESS-104", name: "Dr. Alexander Sterling", role: "doctor", ip: "10.22.8.120", terminal: "TERM-CONSULT-04", status: "Active" },
    { id: "SESS-443", name: "Sister Beatrice", role: "nurse", ip: "10.22.4.15", terminal: "TERM-TRIAGE-02", status: "Active" },
    { id: "SESS-211", name: "Ebenezer Ledger", role: "accountant", ip: "10.22.14.88", terminal: "TERM-FINANCE-01", status: "Active" },
    { id: "SESS-555", name: "Pharmacist Vance Jr.", role: "pharmacist", ip: "10.22.12.7", terminal: "TERM-VAULT-01", status: "Active" }
  ]);

  // Initial audit log items
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "AUD-9912",
      timestamp: "20:25:01",
      terminalId: "TERM-FINANCE-01",
      user: "Ebenezer Ledger",
      role: "accountant",
      action: "AUDIT_LEDGER_EDIT",
      status: "SUCCESS",
      details: "Modified invoice ledger row #BIL-304 under strict supervisor audit authorization.",
      severity: "medium"
    },
    {
      id: "AUD-8839",
      timestamp: "20:29:43",
      terminalId: "TERM-LOBBY-02",
      user: "Mildred Vance",
      role: "receptionist",
      action: "OVERRIDE_INSURANCE_REJECTION",
      status: "BLOCKED",
      details: "Attempted manual override for patient policy rejection without supervisor validation.",
      severity: "high"
    },
    {
      id: "AUD-1204",
      timestamp: "20:34:12",
      terminalId: "TERM-VAULT-01",
      user: "Pharmacist Vance Jr.",
      role: "pharmacist",
      action: "DISPENSE_CONTROLLED_DRUG",
      status: "BYPASSED",
      details: "Restricted opioid chemical unlock verified successfully via Dr. Sterling biometric PIN bypass.",
      severity: "high"
    },
    {
      id: "AUD-1102",
      timestamp: "20:39:55",
      terminalId: "TERM-TRIAGE-02",
      user: "Sister Beatrice",
      role: "nurse",
      action: "VERIFY_VITALS",
      status: "SUCCESS",
      details: "Captured triage parameters for incoming emergency ocular chemical flash.",
      severity: "low"
    }
  ]);

  // Active Pending Override notifications waitlist
  const [pendingOverrides, setPendingOverrides] = useState<PinRequest[]>([
    {
      id: "OVR-654",
      requestingUserId: "EMP-RECP90",
      requestingTerminalId: "TERM-LOBBY-04",
      targetModule: "RECEPTION_POS",
      actionCode: "OVERRIDE_INSURANCE_REJECTION",
      actionContextDescription: "Policy rejects the consultation claim: forces co-pay bypass of $50.",
      requiredPin: "3312", // Accountant PIN
      supervisorName: "Ebenezer Ledger"
    },
    {
      id: "OVR-882",
      requestingUserId: "EMP-PHAR08",
      requestingTerminalId: "TERM-VAULT-02",
      targetModule: "PHARMACY_DISPENSARY",
      actionCode: "DISPENSE_CONTROLLED_DRUG",
      actionContextDescription: "Prescription contains restricted diagnostic atropine dilation compound doses.",
      requiredPin: "4412", // Doctor PIN
      supervisorName: "Dr. Alexander Sterling"
    }
  ]);

  // Live configurable permissions matrix
  const [rolesPermissions, setRolesPermissions] = useState<Record<string, string[]>>({
    receptionist: ["Access Check-in Kiosks", "Register Patient Profiles", "View Live Kiosk Waitlist Matrix", "Exceed Cash Float Cap"],
    nurse: ["Record & Verify Triage Vitals", "Initiate 20-Min Pupil Dilation Timers", "Flag Ophthalmic Trauma Priority Slots"],
    doctor: ["Diagnose & Close Consultations", "Edit Clinical Records", "Override Drug Alerts", "Log Visual Acuity Spectacle refractions", "Bypass Restricted drug locks"],
    pharmacist: ["View Prescriptions Dispatch Queues", "Deduct Active Chemical Drug Stocks", "Analyze RxNorm Warning Modules"],
    accountant: ["Apply Cashier Payments", "View Itemized Ledger Bills", "Approve Final Hospital Discharges", "Edit Closed ledger tables"],
    hr_manager: ["View employee rosters", "Modify schedules", "Deauthorize terminal sessions"]
  });

  // Guard parameters
  const [isRosterLockEnforced, setIsRosterLockEnforced] = useState(true);
  const [isClinicIsolationEnforced, setIsClinicIsolationEnforced] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(["10.22.4.*", "10.22.8.*", "10.22.14.88", "192.168.12.15"]);
  const [newIpInput, setNewIpInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(1);

  // Selector for the Interactive PIN simulator
  const [selectedAction, setSelectedAction] = useState<string>("OVERRIDE_INSURANCE_REJECTION");
  const [enteredPin, setEnteredPin] = useState("");

  const supervisorCodes = [
    { name: "Dr. Alexander Sterling (Clinical Supervisor)", pin: "4412", authority: "Clinical Module Access & Opioids Vault Approval" },
    { name: "Ebenezer Ledger (Accounts Supervisor)", pin: "3312", authority: "POS Balance Overrides & Audited Ledger Edits" }
  ];

  // Current active working properties of the logged employee
  const employeesMap = {
    receptionist: { id: "EMP-RECP90", name: "Mildred Vance", dept: "Front Operations" },
    nurse: { id: "EMP-NURS41", name: "Sister Beatrice", dept: "Clinical Triage Care" },
    doctor: { id: "EMP-DOCT12", name: "Dr. Alexander Sterling", dept: "Ophthalmology Specialty Services" },
    pharmacist: { id: "EMP-PHAR08", name: "Pharmacist Vance Jr.", dept: "Chemical Inventory Pharmacy" },
    accountant: { id: "EMP-ACCT33", name: "Ebenezer Ledger", dept: "Accounts & Financials Checkout" },
    hr_manager: { id: "EMP-HR99", name: "Director Huda Al Marri", dept: "Administrative Headquarters" }
  };

  const activeEmployee = employeesMap[activeRole] || employeesMap.doctor;

  // Audit Logs filtered based on selection (e.g. Failure and overrides)
  const [filterType, setFilterType] = useState<"all" | "high">("all");
  const filteredLogs = useMemo(() => {
    if (filterType === "high") {
      return auditLogs.filter(log => log.status === "BLOCKED" || log.status === "BYPASSED" || log.severity === "high");
    }
    return auditLogs;
  }, [auditLogs, filterType]);

  const triggerToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Action: Deauthorize dynamic session
  const handleRevokeSession = (sessId: string, name: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessId));
    
    // Add to audit trail
    const newAudit: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000).toString()}`,
      timestamp: new Date().toTimeString().split(" ")[0],
      terminalId: "TERM-SEC-CONF",
      user: "IT Administrator",
      role: "it_admin",
      action: "SESS_REVOCATION",
      status: "SUCCESS",
      details: `Revoked live credentials of employee ${name}, token blacklisted immediately.`,
      severity: "medium"
    };
    setAuditLogs(prev => [newAudit, ...prev]);
    triggerToast(t.revokeSuccess, "success");
  };

  // 2. Action: Verify PIN code for supervisor override console
  const handlePinVerificationSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const matchedSup = supervisorCodes.find(s => s.pin === enteredPin);

    const timestamp = new Date().toTimeString().split(" ")[0];
    const auditId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;

    if (matchedSup) {
      // Create new audit log with status BYPASSED
      const newAudit: AuditLog = {
        id: auditId,
        timestamp,
        terminalId: "TERM-PLAYGROUND",
        user: matchedSup.name.split(" (")[0],
        role: enteredPin === "4412" ? "doctor" : "accountant",
        action: selectedAction,
        status: "BYPASSED",
        details: `Supervisor bypass authenticated with credential key #${enteredPin}. Transaction verified.`,
        severity: "high"
      };

      setAuditLogs(prev => [newAudit, ...prev]);
      setEnteredPin("");
      
      // Clear corresponding pending override if matched
      setPendingOverrides(prev => prev.filter(req => req.actionCode !== selectedAction));
      triggerToast(isAr ? t.alertSettleAr : t.alertSettle, "success");
    } else {
      // Log blocked event
      const newAudit: AuditLog = {
        id: auditId,
        timestamp,
        terminalId: "TERM-PLAYGROUND",
        user: "UNAUTHORIZED_HOST",
        role: "unknown",
        action: selectedAction,
        status: "BLOCKED",
        details: `Bypass requested with invalid code "${enteredPin}". Threat matrix logged fingerprint.`,
        severity: "high"
      };

      setAuditLogs(prev => [newAudit, ...prev]);
      setFailedAttempts(prev => prev + 1);
      triggerToast(isAr ? t.alertFailureAr : t.alertFailure, "error");
    }
  };

  // 3. Action: Add IP blacklist/whitelist rule
  const handleAddIpAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    setIpWhitelist(prev => [...prev, newIpInput.trim()]);
    setNewIpInput("");
    triggerToast("IP Whitelist rules updated.", "success");
  };

  // 4. Action: Toggle custom privilege checkbox inside matrix
  const handleTogglePermission = (roleKey: string, perm: string) => {
    setRolesPermissions(prev => {
      const current = prev[roleKey] || [];
      const updated = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm];
      return { ...prev, [roleKey]: updated };
    });
  };

  // 5. Action: Simulate active front desk or pharmacy lock bypass request
  const simulateLockIncident = (action: string, desc: string, pin: string, sup: string) => {
    const overrideId = `OVR-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: PinRequest = {
      id: overrideId,
      requestingUserId: "EMP-LITE",
      requestingTerminalId: "TERM-TRIAGE-09",
      targetModule: "CLINICAL_COPAY",
      actionCode: action,
      actionContextDescription: desc,
      requiredPin: pin,
      supervisorName: sup
    };

    setPendingOverrides(prev => [...prev, newReq]);

    // Log the initiation
    const timestamp = new Date().toTimeString().split(" ")[0];
    const newAudit: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp,
      terminalId: "TERM-TRIAGE-09",
      user: "System Event Dispatcher",
      role: "it_sim",
      action,
      status: "BLOCKED",
      details: `Terminal prompted screen-lock. Waiting supervisor PIN authorization for: ${desc}`,
      severity: "medium"
    };

    setAuditLogs(prev => [newAudit, ...prev]);
    triggerToast(`Simulation triggered! Terminal is locked. Approve bypass on PIN Tab list.`, "success");
  };

  return (
    <div 
      id="it-security-access-system-viewport"
      dir={isAr ? "rtl" : "ltr"}
      className="bg-[#FBFBF9] border border-[#EAE6DF] rounded-3xl p-5 md:p-8 shadow-md flex flex-col space-y-6 transition duration-300 min-h-screen text-slate-800 font-sans"
    >
      {/* Dynamic Toast Portal */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-black animate-bounce duration-100 bg-white" style={{borderColor: toastMessage.type === "success" ? "#10B981" : "#EF4444"}}>
          <Fingerprint className={`w-4 h-4 shrink-0 ${toastMessage.type === "success" ? "text-emerald-500 animate-pulse" : "text-rose-500 animate-shake"}`} />
          <span className={toastMessage.type === "success" ? "text-emerald-700" : "text-rose-700"}>
            {toastMessage.text}
          </span>
        </div>
      )}

      {/* Modern Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EAE6DF] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-sans font-black text-sm uppercase tracking-wider text-[#0F172A]">
              {t.title}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Global Connection Quality Frame */}
        <div className="flex items-center gap-2 bg-[#EAE6DF]/30 px-3.5 py-1.5 rounded-xl border border-[#EAE6DF] text-[10px] font-mono text-neutral-500 font-bold self-end md:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>PORT: 3000 SECURE TUNNEL ONLINE</span>
        </div>
      </div>

      {/* Access Dashboard Vital Signs Cards (KPI Quadrants) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE6DF] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              {t.activeSessions}
            </span>
            <span className="text-2xl font-black font-mono text-[#0F172A] block">
              {activeSessions.length} <span className="text-xs font-sans text-neutral-400 font-normal">Active Clients</span>
            </span>
          </div>
          <div className="bg-[#EEEDE8] h-11 w-11 rounded-xl flex items-center justify-center text-indigo-600">
            <UserCheck className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className={`border p-4 rounded-2xl shadow-xs flex items-center justify-between transition ${
          pendingOverrides.length > 0 ? "bg-amber-50/50 border-amber-300 animate-pulse" : "bg-white border-[#EAE6DF]"
        }`}>
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              {t.pendingOverrides}
            </span>
            <span className="text-2xl font-black font-mono text-[#0F172A] block">
              {pendingOverrides.length} <span className="text-xs font-sans text-neutral-400 font-normal">Locked Terminals</span>
            </span>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
            pendingOverrides.length > 0 ? "bg-amber-100 text-amber-700 font-black animate-bounce" : "bg-[#EEEDE8] text-neutral-500"
          }`}>
            <BadgeAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EAE6DF] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              {t.failedAlerts}
            </span>
            <span className="text-2xl font-black font-mono text-rose-600 block">
              {failedAttempts} <span className="text-xs font-sans text-neutral-400 font-normal">Security Incidents</span>
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-100 h-11 w-11 rounded-xl flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dynamic Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE6DF] pb-3 text-xs uppercase font-extrabold text-left">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition ${
            activeTab === "monitor"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white border-[#EAE6DF] hover:bg-neutral-100 text-neutral-600"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{t.tabMonitor}</span>
        </button>

        <button
          onClick={() => setActiveTab("rbac")}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition ${
            activeTab === "rbac"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white border-[#EAE6DF] hover:bg-neutral-100 text-neutral-600"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.tabRbac}</span>
        </button>

        <button
          onClick={() => setActiveTab("pins")}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition ${
            activeTab === "pins"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white border-[#EAE6DF] hover:bg-neutral-100 text-neutral-600"
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>{t.tabPins} {pendingOverrides.length > 0 && <span className="bg-rose-500 h-2 w-2 rounded-full animate-ping" />}</span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition ${
            activeTab === "roster"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white border-[#EAE6DF] hover:bg-neutral-100 text-neutral-600"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.tabRoster}</span>
        </button>
      </div>

      {/* Local Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Side (Tab Content Workspace: 8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1: LIVE MONITOR */}
          {activeTab === "monitor" && (
            <div className="space-y-6 text-left">
              
              {/* Active Verified Sessions (Revocation engine) */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" /> Active Authenticated JWT Sessions
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    Live Session Revocation Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeSessions.map(sess => (
                    <div 
                      key={sess.id}
                      className="bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl p-3.5 flex flex-col justify-between hover:border-rose-400 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-[#EAE6DF] text-neutral-600 px-1.5 py-0.5 rounded">
                            {sess.id}
                          </span>
                          <h4 className="font-sans font-bold text-xs text-neutral-800 mt-1">{sess.name}</h4>
                          <span className="text-[10px] font-semibold text-indigo-600 uppercase block font-mono">
                            Role Claim: {sess.role}
                          </span>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" title="Token Alive" />
                      </div>

                      <div className="border-t border-[#EAE6DF]/60 mt-3 pt-2.5 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <div>
                          <div>IP: {sess.ip}</div>
                          <div>Host: {sess.terminal}</div>
                        </div>
                        <div className="flex gap-1.5 matches-buttons font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectRole(sess.role as ClinicalRole);
                              triggerToast(isAr ? `جاري تسجيل الدخول كـ ${sess.name}...` : `Logging in as ${sess.name}...`, "success");
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase rounded-lg transition active:scale-95"
                          >
                            {isAr ? "دخول" : "Login"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id, sess.name)}
                            className="px-2.5 py-1 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-600 font-bold uppercase rounded-lg transition active:scale-95"
                          >
                            {isAr ? "إلغاء لـ" : "Revoke"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Live Action Trigger */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
                <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] block">
                  {t.simTitle}
                </span>
                <p className="text-xs text-neutral-400 -mt-2">
                  {t.simSub}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs uppercase font-extrabold pt-1">
                  <button
                    onClick={() => simulateLockIncident(
                      "OVERRIDE_INSURANCE_REJECTION", 
                      "Attempting manually to force co-payment waiver of $50 on insurance claim POL-9011.", 
                      "3312", 
                      "Ebenezer Ledger (Accounts)"
                    )}
                    className="p-3 bg-neutral-50 hover:bg-[#EEEDE8] text-slate-800 border border-[#EAE6DF] rounded-xl text-left flex flex-col justify-between hover:scale-[1.01] transition relative overflow-hidden group"
                  >
                    <span className="text-[#0F172A] font-bold block">1. Reception Block</span>
                    <span className="text-[10px] font-mono text-neutral-400 font-medium block mt-1 normal-case leading-relaxed">
                      Waiver of $50 consultation fees on clinical registry.
                    </span>
                    <Play className="w-3.5 h-3.5 text-neutral-400 absolute right-3 bottom-3 group-hover:text-indigo-600" />
                  </button>

                  <button
                    onClick={() => simulateLockIncident(
                      "DISPENSE_CONTROLLED_DRUG", 
                      "Requesting chemical lock drawer unlock to dispense restricted diagnostic Atropine compound doses.", 
                      "4412", 
                      "Dr. Alexander Sterling"
                    )}
                    className="p-3 bg-neutral-50 hover:bg-[#EEEDE8] text-slate-800 border border-[#EAE6DF] rounded-xl text-left flex flex-col justify-between hover:scale-[1.01] transition relative overflow-hidden group"
                  >
                    <span className="text-[#0F172A] font-bold block">2. Restricted Pharmacy Vault</span>
                    <span className="text-[10px] font-mono text-neutral-400 font-medium block mt-1 normal-case leading-relaxed">
                      Atropine compounds or surgical chemical box bypass.
                    </span>
                    <Play className="w-3.5 h-3.5 text-neutral-400 absolute right-3 bottom-3 group-hover:text-indigo-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC MATRIX */}
          {activeTab === "rbac" && (
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-6 text-left">
              <div>
                <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] block">
                  {t.tabRbac}
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure granular capability registers mapping roles directly. Toggle access boundaries and see JWT token payloads adapt dynamically.
                </p>
              </div>

              {/* Grid of configurable permissions per roles */}
              <div className="space-y-4">
                <div className="flex border-b border-neutral-100 pb-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase w-32 shrink-0">Hospital Role</span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase flex-1">Capability Matrix Flags</span>
                </div>

                {Object.keys(rolesPermissions).map((roleKey) => {
                  const rolePerms = rolesPermissions[roleKey];
                  const allPossiblePerms = [
                    "Access Check-in Kiosks", "Register Patient Profiles", "View Live Kiosk Waitlist Matrix",
                    "Record & Verify Triage Vitals", "Initiate 20-Min Pupil Dilation Timers", "Flag Ophthalmic Trauma Priority Slots",
                    "Diagnose & Close Consultations", "Edit Clinical Records", "Override Drug Alerts",
                    "View Prescriptions Dispatch Queues", "Deduct Active Chemical Drug Stocks",
                    "Apply Cashier Payments", "View Itemized Ledger Bills", "Approve Final Hospital Discharges", "Exceed Cash Float Cap", "Edit Closed ledger tables"
                  ];

                  // Only show 5 relevant selections per role to keep layout tight & elegant
                  const filteredSelection = allPossiblePerms.filter(p => {
                    if (roleKey === "receptionist") return ["Access Check-in Kiosks", "Register Patient Profiles", "View Live Kiosk Waitlist Matrix", "Exceed Cash Float Cap"].includes(p);
                    if (roleKey === "nurse") return ["Record & Verify Triage Vitals", "Initiate 20-Min Pupil Dilation Timers", "Flag Ophthalmic Trauma Priority Slots"].includes(p);
                    if (roleKey === "doctor") return ["Diagnose & Close Consultations", "Edit Clinical Records", "Override Drug Alerts", "Exceed Cash Float Cap", "Edit Closed ledger tables"].includes(p);
                    if (roleKey === "pharmacist") return ["View Prescriptions Dispatch Queues", "Deduct Active Chemical Drug Stocks", "Override Drug Alerts"].includes(p);
                    if (roleKey === "accountant") return ["Apply Cashier Payments", "View Itemized Ledger Bills", "Approve Final Hospital Discharges", "Edit Closed ledger tables"].includes(p);
                    return ["Register Patient Profiles", "Approve Final Hospital Discharges"].includes(p);
                  });

                  return (
                    <div key={roleKey} className="flex flex-col sm:flex-row border-b border-neutral-50 pb-3 gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-800 uppercase w-32 shrink-0">
                        🔑 {roleKey}
                      </span>
                      <div className="flex flex-wrap gap-2 flex-1">
                        {filteredSelection.map(p => {
                          const hasPerm = rolePerms.includes(p);
                          return (
                            <button
                              key={p}
                              onClick={() => handleTogglePermission(roleKey, p)}
                              className={`px-2.5 py-1 text-[10px] rounded-lg border flex items-center gap-1.5 transition ${
                                hasPerm
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold"
                                  : "bg-white border-[#EAE6DF] text-neutral-400 hover:bg-neutral-50"
                              }`}
                            >
                              <Check className={`w-3 h-3 ${hasPerm ? "opacity-100" : "opacity-0"}`} />
                              <span>{p}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Decrypted Payload block updated dynamically */}
              <div className="bg-neutral-900 border border-neutral-800 text-amber-400 rounded-2xl p-4 font-mono text-[10px] space-y-3">
                <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-[9px] uppercase font-bold flex items-center gap-1">
                    <FileJson className="w-3.5 h-3.5 text-indigo-400" /> Active Secure Decrypted Token (Real-Time JWT Payload)
                  </span>
                  <span className="text-[9px] bg-indigo-950 font-sans border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded font-black uppercase">
                    HMAC-SHA256 SIGNED
                  </span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400 overflow-x-auto">
{`{
  "iss": "Al-Jawarih Security Core",
  "sub": "${activeEmployee.id}",
  "aud": "Hospital Internal Terminals API",
  "clientRole": "${activeRole}",
  "permissionsList": [
    ${(rolesPermissions[activeRole] || []).map(p => `"${p}"`).join(",\n    ")}
  ],
  "rosterTimeLock": ${isRosterLockEnforced},
  "ipRestrictions": ["10.22.*"],
  "cryptographicHash": "a1b2c3d4e5f6g7h8i9j0"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PIN ELEVATION SANDBOX */}
          {activeTab === "pins" && (
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-6 text-left">
              <div>
                <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] block">
                  {t.pinTitle}
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  {t.pinSubtitle}
                </p>
              </div>

              {/* Pending bypass request banner queue */}
              {pendingOverrides.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block animate-pulse">
                    ⚠️ Locked Terminal Prompts Waiting Core Approval
                  </span>
                  
                  {pendingOverrides.map(req => (
                    <div 
                      key={req.id}
                      className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 border border-amber-200 text-amber-800 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {req.id}
                          </span>
                          <span className="font-sans font-black text-neutral-800 uppercase tracking-wide">
                            {req.actionCode}
                          </span>
                        </div>
                        <p className="text-neutral-500 text-[11px] leading-relaxed max-w-md">
                          {req.actionContextDescription}
                        </p>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          Request Host: {req.requestingTerminalId} • Required Supervisor: <strong className="text-indigo-600">{req.supervisorName}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedAction(req.actionCode);
                          setEnteredPin(req.requiredPin);
                          triggerToast(`Prefilled supervisor code for the simulation ${req.actionCode}.`, "success");
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider block self-end sm:self-auto cursor-pointer"
                      >
                        Mount Code PIN
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Active inputs parameters */}
              <form onSubmit={handlePinVerificationSubmit} className="bg-[#EEEDE8]/50 border border-[#EAE6DF] p-5 rounded-2xl space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                    {t.chooseAction}
                  </label>
                  <select
                    value={selectedAction}
                    onChange={e => setSelectedAction(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE6DF] rounded-xl text-xs font-mono font-black"
                  >
                    <option value="OVERRIDE_INSURANCE_REJECTION">OVERRIDE_INSURANCE_REJECTION (POS Copay Wave)</option>
                    <option value="DISPENSE_CONTROLLED_DRUG">DISPENSE_CONTROLLED_DRUG (Rx Opioids Lock)</option>
                    <option value="AUDIT_LEDGER_EDIT">AUDIT_LEDGER_EDIT (Double-Entry Ledger Modification)</option>
                    <option value="EXCEED_CASH_FLOAT">EXCEED_CASH_FLOAT (Execute Manual Register Close Refund)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                    {t.enterPin}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      maxLength={6}
                      value={enteredPin}
                      onChange={e => setEnteredPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 4412"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE6DF] rounded-xl text-center text-xs font-mono tracking-[0.5em] font-black focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <Key className="w-4 h-4 text-[#8F8A7D] absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-amber-300 animate-pulse animate-spin" style={{ animationDuration: "4s" }} />
                  <span>{t.verifyBtn}</span>
                </button>
              </form>

              {/* Guardian quick lookup mapping */}
              <div className="p-4 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl space-y-2.5">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  {t.authorizedStaff}
                </span>
                
                <div className="divide-y divide-neutral-100 text-[11px] leading-relaxed">
                  {supervisorCodes.map(sup => (
                    <div key={sup.pin} className="py-2.5 flex justify-between items-center">
                      <div>
                        <strong className="text-neutral-800 font-bold block">{sup.name}</strong>
                        <span className="text-neutral-400 block">{sup.authority}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold bg-[#EEEDE8] px-2 py-0.5 rounded font-mono text-neutral-600">
                          Security PIN: {sup.pin}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEnteredPin(sup.pin)}
                          className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded font-bold uppercase text-[9px] cursor-pointer"
                        >
                          Use PIN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROSTER TIME GUARDS */}
          {activeTab === "roster" && (
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-6 text-left">
              <div>
                <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] block">
                  {t.rosterTitle}
                </span>
                <p className="text-xs text-neutral-400 mt-1">
                  {t.rosterSubtitle}
                </p>
              </div>

              {/* Lock Configuration selectors */}
              <div className="space-y-3">
                <div className="p-4 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <strong className="text-xs font-bold text-[#0F172A] block">{t.enforceTime}</strong>
                    <span className="text-[11px] text-neutral-400 block">{t.enforceTimeSub}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRosterLockEnforced(!isRosterLockEnforced);
                      triggerToast("Roster-Locked active configuration altered.", "success");
                    }}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all outline-none border focus:outline-none flex items-center ${
                      isRosterLockEnforced ? "bg-indigo-600 border-indigo-600 justify-end" : "bg-neutral-200 border-neutral-300 justify-start"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                <div className="p-4 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <strong className="text-xs font-bold text-[#0F172A] block">{t.clinicIsolate}</strong>
                    <span className="text-[11px] text-neutral-400 block">{t.clinicIsolateSub}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClinicIsolationEnforced(!isClinicIsolationEnforced);
                      triggerToast("Clinic Isolation mapping updated.", "success");
                    }}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all outline-none border focus:outline-none flex items-center ${
                      isClinicIsolationEnforced ? "bg-indigo-600 border-indigo-600 justify-end" : "bg-neutral-200 border-neutral-300 justify-start"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>

              {/* Station Whitelisting Module */}
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] block">
                  {t.ipWhitelistTitle}
                </span>

                <form onSubmit={handleAddIpAddress} className="flex gap-2.5">
                  <input
                    required
                    type="text"
                    value={newIpInput}
                    onChange={e => setNewIpInput(e.target.value)}
                    placeholder="e.g. 10.22.14.99"
                    className="flex-1 px-3 py-2 bg-white border border-[#EAE6DF] rounded-xl text-xs font-mono text-neutral-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase shrink-0 transition"
                  >
                    {t.addIpBtn}
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 text-xs">
                  {ipWhitelist.map((ip, idx) => (
                    <div key={ip} className="bg-[#EEEDE8] text-neutral-700 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{ip}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIpWhitelist(prev => prev.filter((_, i) => i !== idx));
                          triggerToast("IP restriction rule abolished.", "success");
                        }}
                        className="hover:text-rose-500 font-bold ml-1 text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side (Central Audits & Action Feed: 4 Columns) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Active Employee Role switch panel */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-3.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              {t.roleSelector}
            </span>

            <div className="space-y-1.5 text-xs">
              {Object.keys(employeesMap).map((roleKey) => {
                const isSelected = activeRole === roleKey;
                const emp = employeesMap[roleKey];
                return (
                  <button
                    key={roleKey}
                    onClick={() => onSelectRole(roleKey as any)}
                    className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-extrabold shadow-xs"
                        : "bg-white border-[#EAE6DF] text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <span className="block font-sans font-bold">{emp.name}</span>
                      <span className="block text-[8px] font-mono uppercase text-indigo-600 font-black">
                        {roleKey} • {emp.dept}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">{emp.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Centralized Audit Logs and Actions feed flow */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
              <span className="font-sans font-black text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                {t.recentFails}
              </span>

              {/* Feed filter selectors */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition shrink-0 ${
                    filterType === "all" ? "bg-indigo-600 text-white" : "bg-[#EEEDE8] text-neutral-450 hover:bg-neutral-200"
                  }`}
                >
                  {t.allEvents}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("high")}
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition shrink-0 ${
                    filterType === "high" ? "bg-rose-600 text-white animate-pulse" : "bg-[#EEEDE8] text-neutral-450 hover:bg-neutral-200"
                  }`}
                >
                  BLOCKS
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  let badgeColor = "bg-neutral-100 text-neutral-700";
                  if (log.status === "SUCCESS") badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-100 border";
                  if (log.status === "BYPASSED") badgeColor = "bg-indigo-50 text-indigo-800 border border-indigo-200";
                  if (log.status === "BLOCKED") badgeColor = "bg-rose-50 text-rose-800 border border-rose-200 animate-pulse";

                  return (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-xl border border-dashed transition flex flex-col space-y-1.5 relative ${
                        log.status === "BLOCKED" ? "bg-rose-50/20 border-rose-200" : "bg-[#FBFBF9] border-[#EAE6DF]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono text-neutral-400 font-bold block">{log.timestamp} • {log.id}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${badgeColor}`}>
                          {log.status}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-sans font-bold text-xs text-neutral-800">
                          {log.action}
                        </h4>
                        <span className="text-[10px] text-indigo-700 font-semibold block uppercase">
                          👤 {log.user} ({log.role})
                        </span>
                        <p className="text-[10px] text-neutral-500 leading-relaxed font-mono">
                          {log.details}
                        </p>
                      </div>

                      <div className="flex justify-between text-[9px] text-neutral-450 font-mono border-t border-[#EAE6DF]/60 pt-1">
                        <span>Host: {log.terminalId}</span>
                        <span className={`font-black uppercase uppercase-xs ${log.severity === "high" ? "text-rose-500 animate-pulse" : "text-neutral-400"}`}>
                          Lv.{log.severity}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-neutral-400 italic">
                  No alerts listed in target telemetry queue index.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance statement footnote */}
      <div className="p-4 bg-teal-50/50 border border-teal-200/50 rounded-xl text-[11px] text-teal-800 flex items-start gap-2.5 text-left leading-relaxed">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 animate-bounce" />
        <div>
          <strong>HIPAA Secure Medical Core Compliant Audit Vault</strong>
          <p className="text-neutral-500 mt-0.5">
            This workspace dynamically records encryption status and bypass tokens. Any manual override on patient insurance status, restricted drug prescriptions, or double-entry accountancy ledger edits instantly requires dual-verification inputs. Changing the Active Role above simulates credentials across hospital tabs.
          </p>
        </div>
      </div>
    </div>
  );
}
