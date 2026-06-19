import React, { useState, useMemo } from "react";
import {
  Shield,
  Users,
  Lock,
  UserX,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Trash2,
  Settings,
  Layers,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Database,
  Power,
  Terminal,
  Search,
  Sliders,
  HelpCircle,
  Sparkles,
  Check,
  Flame,
  PlusCircle,
  ShieldCheck,
  Network
} from "lucide-react";
import { ClinicalRole, Patient, Employee } from "../types";
import { useClinicalPriority } from "../hooks/useClinicalPriority";
import SpecialtyClinics from "./SpecialtyClinics";

interface AdminControlTowerProps {
  language: "en" | "ar";
  onClose?: () => void;
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  activeRole: ClinicalRole;
  onSelectRole: (role: ClinicalRole) => void;
  onShowReport?: (patientId: string) => void;
  onAddPatient?: (patient: Patient) => void;
  onDeletePatient?: (id: string) => void;
  onClearAllData?: () => void;
}

// Interfaces for our stateful dashboard variables
interface StaffAccount {
  id: string;
  fullName: string;
  role: ClinicalRole;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  lastLogin: string;
}

interface ActiveSession {
  id: string;
  user: string;
  role: ClinicalRole;
  workstation: string;
  ipAddress: string;
  issuedAt: string;
  expiresIn: string;
}

interface SecurityBreach {
  id: string;
  timestamp: string;
  user: string;
  sourceTerminal: string;
  attemptedResource: string;
  actionTaken: "BLOCKED" | "FLAGGED";
  details: string;
}

interface EdgeNode {
  id: string;
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE_EDGE" | "SYNCING";
  localUnsyncedCount: number;
  lastHeartbeat: string;
}

interface ConflictItem {
  id: string;
  patientId: string;
  patientName: string;
  field: string;
  nodeAValue: string;
  nodeBValue: string;
  nodeAName: string;
  nodeBName: string;
  timestamp: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  details: string;
}

interface SystemException {
  id: string;
  timestamp: string;
  service: string;
  exceptionClass: string;
  message: string;
  stackTrace: string;
}

interface InsuranceProvider {
  id: string;
  name: string;
  discountPercentage: number;
  claimEndpoint: string;
  isActive: boolean;
}

interface InfrastructureAsset {
  id: string;
  type: "BED" | "OR" | "CLINIC";
  name: string;
  status: "ACTIVE" | "MAINTENANCE" | "CLOSED";
}

export default function AdminControlTower({
  language,
  onClose,
  patients,
  onUpdatePatient,
  activeRole,
  onSelectRole,
  onShowReport,
  onAddPatient,
  onDeletePatient,
  onClearAllData
}: AdminControlTowerProps) {
  const isAr = language === "ar";

  // --- LOCAL STATES FOR CONTROLS ---
  const [activeTab, setActiveTab] = useState<"rbac" | "telemetry" | "compliance" | "mdm" | "clinics" | "triage_rules">("rbac");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security Directory Lookup States
  const [securityLookupTerm, setSecurityLookupTerm] = useState("");
  const [selectedLookupId, setSelectedLookupId] = useState("STF-201");

  // Priority Rules setup
  const { rules: priorityRules, addRule, deleteRule, toggleRuleActive } = useClinicalPriority();
  const [newRuleNameEn, setNewRuleNameEn] = useState("");
  const [newRuleNameAr, setNewRuleNameAr] = useState("");
  const [newRuleDescEn, setNewRuleDescEn] = useState("");
  const [newRuleDescAr, setNewRuleDescAr] = useState("");
  const [newRuleTriggersStat, setNewRuleTriggersStat] = useState(true);
  const [newRuleClass, setNewRuleClass] = useState("from-amber-500/10 to-amber-600/5 border-amber-250");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Identity & RBAC States
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);

  const [newStaff, setNewStaff] = useState({ fullName: "", role: "doctor" as ClinicalRole, email: "" });

  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  const [securityBreaches, setSecurityBreaches] = useState<SecurityBreach[]>([]);

  // 2. Edge Nodes & Sync States
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([]);

  const [conflictQueue, setConflictQueue] = useState<ConflictItem[]>([]);

  // 3. Compliance & Audit States
  const [searchTerm, setSearchTerm] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [systemExceptions, setSystemExceptions] = useState<SystemException[]>([]);

  // 4. MDM Global variables
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);

  const [infrastructureAssets, setInfrastructureAssets] = useState<InfrastructureAsset[]>([]);

  const [globalThresholds, setGlobalThresholds] = useState({
    pupilDilationTimerMin: 20,
    jwtTokenExpirationHrs: 8,
    edgeSyncIntervalSec: 15
  });

  const [newInsurance, setNewInsurance] = useState({ name: "", discountPercentage: 80, claimEndpoint: "https://" });
  const [newAsset, setNewAsset] = useState({ name: "", type: "BED" as "BED" | "OR" | "CLINIC" });

  // --- ACTIONS ---

  // RBAC Actions
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.fullName || !newStaff.email) {
      triggerToast(isAr ? "الرجاء تعبئة جميع خانات الموظف" : "Please fill out all staff fields");
      return;
    }
    const id = `STF-${Math.floor(207 + Math.random() * 50)}`;
    const freshStaff: StaffAccount = {
      id,
      fullName: newStaff.fullName,
      role: newStaff.role,
      email: newStaff.email,
      status: "ACTIVE",
      lastLogin: "Never"
    };
    setStaffAccounts([...staffAccounts, freshStaff]);
    // Log audit
    const freshAudit: AuditLog = {
      id: `AUD-${Math.floor(4000 + Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: "System Exec Admin",
      role: "admin",
      action: "PROVISION_STAFF",
      module: "Security & RBAC",
      details: `Created new credentials and assigned role: ${newStaff.role} for user: ${newStaff.fullName}`
    };
    setAuditLogs([freshAudit, ...auditLogs]);
    setNewStaff({ fullName: "", role: "doctor", email: "" });
    triggerToast(isAr ? "تم إنشاء حساب وتعيين الصلاحيات بنجاح!" : "Staff account provisioned and fence rights locked successfully!");
  };

  const toggleStaffStatus = (id: string, current: string) => {
    const nextStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setStaffAccounts(staffAccounts.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    
    // Log audit
    const freshAudit: AuditLog = {
      id: `AUD-${Math.floor(4000 + Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: "System Exec Admin",
      role: "admin",
      action: "REVOKE_STAFF_PRIVILEGES",
      module: "Security & RBAC",
      details: `Changed account state to ${nextStatus} for Staff account target (${id})`
    };
    setAuditLogs([freshAudit, ...auditLogs]);
    triggerToast(isAr ? `تغيير حالة حساب الموظف بنجاح لكود ${id}!` : `Successfully modified staff ID ${id} account state to ${nextStatus}!`);
  };

  const killSession = (sessionId: string, userName: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    // Add breach log or high severity notification
    const freshBreach: SecurityBreach = {
      id: `BRCH-${Math.floor(993 + Math.random() * 100)}`,
      timestamp: new Date().toLocaleTimeString(),
      user: userName + " [KILLED]",
      sourceTerminal: "Central Command Admin Bypass",
      attemptedResource: "TERMINATE_JWT_TOKEN",
      actionTaken: "BLOCKED",
      details: `Admin forcefully revoked session token (${sessionId}) of user. Terminal has been immediately fenced out.`
    };
    setSecurityBreaches([freshBreach, ...securityBreaches]);
    triggerToast(isAr ? `تم قطع اتصال الجلسة النشطة ${sessionId} فوراً!` : `KILLED live JWT Token ${sessionId}! Target device successfully formatted off.`);
  };

  const togglePermission = (role: string, permission: string) => {
    const current = rolePermissions[role] || [];
    const updated = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    
    setRolePermissions({
      ...rolePermissions,
      [role]: updated
    });
    triggerToast(isAr ? "تم تعديل مصفوفة الصلاحيات فورياً للمؤسسة!" : `Fencing matrix compiled! Updated system capability: ${permission}`);
  };

  const dismissBreachFlag = (id: string) => {
    setSecurityBreaches(securityBreaches.filter(b => b.id !== id));
    triggerToast(isAr ? "تم أرشفة الإشعار الأمني والتحقق منه" : "Security breach alert successfully archived and marked checked.");
  };

  // Sync Telemetry actions
  const triggerSyncNode = (nodeId: string, nodeName: string) => {
    setEdgeNodes(edgeNodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, status: "SYNCING" };
      }
      return node;
    }));

    setTimeout(() => {
      setEdgeNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          return { ...node, status: "ONLINE", localUnsyncedCount: 0, lastHeartbeat: "Just now" };
        }
        return node;
      }));
      triggerToast(isAr ? `اكتملت المزامنة للجهاز ${nodeName}` : `Edge SQLite container ${nodeName} fully synced back with master server!`);
    }, 2500);

    triggerToast(isAr ? "جاري تشغيل المزامنة اليدوية وإثبات المطابقة..." : "Initiating manual edge node synchronization batch sync...");
  };

  const resolveConflict = (conflictId: string, chosenNode: "A" | "B", detailsVal: string) => {
    setConflictQueue(conflictQueue.filter(c => c.id !== conflictId));
    
    // Log to immutable Audit
    const freshAudit: AuditLog = {
      id: `AUD-${Math.floor(4000 + Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: "System Exec Admin",
      role: "admin",
      action: "MERGE_CONFLICT_RESOLVED",
      module: "Edge Sync Pipeline",
      details: `Resolved synchronization discrepancy ID: ${conflictId}. Chosen master value: "${detailsVal}" from Node ${chosenNode}.`
    };
    setAuditLogs([freshAudit, ...auditLogs]);
    triggerToast(isAr ? "تم معالجة تعارض البيانات وتثبيت النتيجة في الخادم الموحد" : `Conflict resolved! Registered value: "${detailsVal}" throughout all networked terminals.`);
  };

  // MDM Global Rules Actions
  const handleSaveThresholds = () => {
    triggerToast(isAr ? "تم تحديث الثوابت والمهلات العالمية للمستشفى!" : "Global clinical rules registry updated! Timing and authorization margins synced.");
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsurance.name) return;
    const provider: InsuranceProvider = {
      id: `INS-${insuranceProviders.length + 1}`,
      name: newInsurance.name,
      discountPercentage: newInsurance.discountPercentage,
      claimEndpoint: newInsurance.claimEndpoint || "https://claims.hospital.ae/api",
      isActive: true
    };
    setInsuranceProviders([...insuranceProviders, provider]);
    setNewInsurance({ name: "", discountPercentage: 80, claimEndpoint: "https://" });
    triggerToast(isAr ? "تم تسجيل شركة تأمين جديدة والاتصال بالخادم" : "Successfully integrated new healthcare insurance provider endpoints.");
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) return;
    const asset: InfrastructureAsset = {
      id: `AST-${Math.floor(100 + Math.random() * 900)}`,
      type: newAsset.type,
      name: newAsset.name,
      status: "ACTIVE"
    };
    setInfrastructureAssets([...infrastructureAssets, asset]);
    setNewAsset({ name: "", type: "BED" });
    triggerToast(isAr ? "تم تهيئة الأصل الإنشائي وتخصيصه بالعيادة" : "Physical asset registered to live clinical layout mapping.");
  };

  const toggleAssetStatus = (id: string, current: string) => {
    const next: "ACTIVE" | "MAINTENANCE" | "CLOSED" = 
      current === "ACTIVE" ? "MAINTENANCE" : current === "MAINTENANCE" ? "CLOSED" : "ACTIVE";
    setInfrastructureAssets(infrastructureAssets.map(a => a.id === id ? { ...a, status: next } : a));
    triggerToast(isAr ? `تعديل حالة السرير/الغرفة ${id} إلى ${next}` : `Infrastructure unit ${id} changed to operational state: ${next}`);
  };

  // Searched audit filter
  const filteredAudits = useMemo(() => {
    return auditLogs.filter(log => {
      const criteria = (log.actor + log.action + log.details + log.module).toLowerCase();
      return criteria.includes(searchTerm.toLowerCase());
    });
  }, [auditLogs, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn" id="admin_control_tower_command">
      {/* Toast indicator */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#4F46E5] dark:bg-[#0066FF] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 border border-indigo-400 dark:border-[#2BBFFF]/40 animate-bounce">
          <Activity className="w-4 h-4 text-white dark:text-[#2BBFFF] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Glassmorphic Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 rounded-2xl border border-indigo-900 shadow-lg relative overflow-hidden" id="admin_welcome_card">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-8 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/25 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-mono">
                {isAr ? "مركز قيادة المشرف التقني الشامل" : "OFFLINE EDGE & ARCHITECTURAL COGNIZANT SYSTEM COMMAND"}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">
              {isAr ? "منصة نظام مدير البرمجيات التنفيذي" : "Executive System Administrator Portal"}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              {isAr 
                ? "مراقبة سلامة الحوسبة المحلية، مصفوفة تأمين الهوية وسياج التطبيق، وتدفق المزامنة التلقائية والتحقق من التغييرات."
                : "Active technical control tower overseeing granular role boundaries, real-time edge synchronization health, immutable legal audit ledgers, and global hospital variables."}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-indigo-550/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-bold">
              {isAr ? "النظام نشط وآمن" : "SYSTEM GATE ONLINE"}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-6 border-t border-slate-800/85 pt-4 overflow-x-auto scrollbar-none" id="admin_control_tabs">
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "rbac"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? "الصلاحيات وسياج الوصول" : "Identity & Application Fencing"}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "telemetry"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? "حالة الأجهزة والمزامنة" : "Edge Nodes & Telemetry"}</span>
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "compliance"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? "سجل التدقيق والاستثناءات" : "Compliance Audit Trail"}</span>
          </button>

          <button
            onClick={() => setActiveTab("mdm")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "mdm"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isAr ? "البيانات والقيم الحاكمة" : "Master Data & Global Rules"}</span>
          </button>

          <button
            onClick={() => setActiveTab("clinics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "clinics"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? "محطات فحص العيادات التخصصية" : "Specialty Workstations"}</span>
          </button>

          <button
            onClick={() => setActiveTab("triage_rules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === "triage_rules"
                ? "bg-indigo-600 text-white border border-indigo-500 shadow-md"
                : "bg-slate-900/60 text-neutral-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "قواعد الفرز والأولويات الطبية" : "Clinical Triage Rules"}</span>
          </button>

        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: IDENTITY & RBAC APPLICATION FENCING */}
        {activeTab === "rbac" && (
          <div className="space-y-6">
            
            {/* Grid of Security Breaches and Identity Matrices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Security Breach Warnings column - Left */}
              <div className="lg:col-span-4 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-rose-200/50 dark:border-rose-950/40 shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950/20 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping inline-block" />
                    <h3 className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest font-mono">
                      {isAr ? "إنذارات تخطي جدار الحماية للعيادات" : "Fencing Breach Alerts"}
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded uppercase">
                    {securityBreaches.length} {isAr ? "خطر نشط" : "Flags"}
                  </span>
                </div>

                {securityBreaches.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
                    <p className="text-[11px] font-bold text-neutral-500 uppercase">{isAr ? "كل الحدود مؤمنة بالكامل" : "Fencing Integrity Intact"}</p>
                    <p className="text-[10px] text-neutral-400">{isAr ? "لم يتم الإبلاغ عن تجاوزات للنواحي المخولة" : "Zero unauthorized database attempts detected."}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {securityBreaches.map(b => (
                      <div key={b.id} className="p-3.5 bg-rose-50/70 dark:bg-rose-950/10 border border-rose-200/30 dark:border-rose-950/35 rounded-xl space-y-2">
                        <div className="flex items-center justify-between font-mono text-[9px] font-bold">
                          <span className="bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-350 px-1.5 py-0.5 rounded">
                            {b.actionTaken}
                          </span>
                          <span className="text-neutral-400">{b.timestamp}</span>
                        </div>
                        <div className="text-[11px]">
                          <span className="block font-bold text-neutral-800 dark:text-neutral-200">{b.user}</span>
                          <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">{b.sourceTerminal}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900/60 p-2 rounded border border-rose-200/20 text-[10px] font-mono text-rose-850 dark:text-rose-400 break-all leading-normal">
                          {b.attemptedResource}
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-snug">
                          {b.details}
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => dismissBreachFlag(b.id)}
                            className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            {isAr ? "تجاوز وأرشفة" : "Archived Checked ✓"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Secure App Fencing Permissions Matrix - Right */}
              <div className="lg:col-span-8 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm flex flex-col space-y-4">
                <div>
                  <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? "مصفوفة تأمين الصلاحيات (Granular Role Matrix)" : "Role-Based Application Fence Map"}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isAr 
                      ? "إلغاء أو منح صلاحيات الأقسام التنفيذية لكل رول طبي أو محاسبي أو استقبال في عيادة الجوارح."
                      : "Dynamically enforce compile-time security walls. Restrict clinical specialties or ledgers from compromised boundaries."}
                  </p>
                </div>

                <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-xl bg-neutral-50/50 dark:bg-slate-950/30">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-neutral-900 font-bold border-b border-[var(--clr-border-light)] text-[9px] uppercase tracking-wider text-neutral-400">
                        <th className="p-3">{isAr ? "المستوى الوظيفي" : "System Access Role"}</th>
                        <th className="p-3 text-center">{isAr ? "رؤية الفواتير" : "View Invoice"}</th>
                        <th className="p-3 text-center">{isAr ? "تعديل الفاتورة" : "Edit Closed Invoice"}</th>
                        <th className="p-3 text-center">{isAr ? "سجل السريرية" : "Edit Surg Ledger"}</th>
                        <th className="p-3 text-center">{isAr ? "تعديل القياسات" : "Write Clinical Rec"}</th>
                        <th className="p-3 text-center">{isAr ? "إدارة الصيدلية" : "Control Pharmacist Ops"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--clr-border-light)]">
                      {Object.keys(rolePermissions).length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-neutral-400 italic text-xs">No role permissions configured. Backend integration pending.</td></tr>
                      ) : Object.keys(rolePermissions).map((role) => (
                        <tr key={role} className="hover:bg-white dark:hover:bg-slate-900/40">
                          <td className="p-3 font-bold capitalize text-[var(--clr-text-title)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{role}</span>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions[role].includes("view_invoices")}
                              onChange={() => togglePermission(role, "view_invoices")}
                              className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions[role].includes("edit_invoices")}
                              onChange={() => togglePermission(role, "edit_invoices")}
                              className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions[role].includes("edit_surgical_ledger")}
                              onChange={() => togglePermission(role, "edit_surgical_ledger")}
                              className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-400 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions[role].includes("edit_patient_records")}
                              onChange={() => togglePermission(role, "edit_patient_records")}
                              className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions[role].includes("control_inventory")}
                              onChange={() => togglePermission(role, "control_inventory")}
                              className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-550 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50/70 dark:bg-amber-950/10 border border-amber-200/45 p-3 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-400 leading-normal">
                  <span className="text-sm">⚠️</span>
                  <p>
                    {isAr
                      ? "ضوابط مصفوفة الأدوار والمسؤوليات (RBAC) تم تكويدها لتفصل محاسب الإيرادات عن تحرير السجل الجراحي المغلق لمنع التلاعب وتكثيف الخصوصية والرقابة الذاتية."
                      : "Strict financial compliance matrix: Revoking 'Edit Closed Invoice' enforces automated GAAP verification. Non-clinical accounts will fail to POST/PATCH consult dossiers directly."}
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Provisioning Table and Live Session Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Staff Provisioning Console */}
              <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? "تهيئة الموظفين وصلاحيات الوصول" : "Active Staff & Provisioning Matrix"}</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isAr ? "إضافة وصرف، أو تعليق أذونات حسابات الطاقم الطبي والإداري بالعيادات." : "Instantly provision clinical endpoints or revoke active terminal login states."}
                    </p>
                  </div>
                </div>

                {/* Create Staff Account Inline Form */}
                <form onSubmit={handleCreateStaff} className="p-3.5 bg-neutral-50 dark:bg-slate-900/60 border border-[var(--clr-border-light)] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "الاسم الرباعي" : "Full Name"}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950"
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "البريد الإلكتروني المعتمد" : "Hospital Email"}</label>
                    <input
                      required
                      type="email"
                      className="w-full px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950"
                      placeholder="credentials@aljawarih.org"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1 flex flex-col justify-between">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "الرتبة والوظيفة" : "Primary Role"}</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as ClinicalRole })}
                      >
                        <option value="doctor">{isAr ? "طبيب Attending" : "Doctor"}</option>
                        <option value="nurse">{isAr ? "ممرض فرز" : "Nurse"}</option>
                        <option value="pharmacist">{isAr ? "صيدلي" : "Pharmacist"}</option>
                        <option value="accountant">{isAr ? "محاسب مالي" : "Accountant"}</option>
                        <option value="receptionist">{isAr ? "موظف استقبال" : "Receptionist"}</option>
                        <option value="hr_manager">{isAr ? "مدير موارد" : "HR Specialist"}</option>
                        <option value="warehouse">{isAr ? "مدير مستودع" : "Warehouse Manager"}</option>
                      </select>
                      
                      <button
                        type="submit"
                        className="px-3 bg-[#4F46E5] hover:bg-opacity-90 text-white rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                        title={isAr ? "إضافة فورية" : "Add Instantly"}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-xl max-h-[350px] overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--clr-border-light)] text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        <th className="p-3">{isAr ? "المستلم" : "Staff User"}</th>
                        <th className="p-3">{isAr ? "الرول والنص المستهدف" : "Fencing Role"}</th>
                        <th className="p-3 text-center">{isAr ? "آخر وصول" : "Last Live"}</th>
                        <th className="p-3 text-center">{isAr ? "الحالة" : "Fencing Status"}</th>
                        <th className="p-3 text-right">{isAr ? "التحكم المباشر" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--clr-border-light)] font-mono text-[11px]">
                      {staffAccounts.length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-neutral-400 italic text-xs">No staff accounts loaded. Backend integration pending.</td></tr>
                      ) : staffAccounts.map(s => (
                        <tr key={s.id} className="hover:bg-neutral-55/35">
                          <td className="p-3 font-sans">
                            <span className="block font-bold text-[var(--clr-text-title)]">{s.fullName}</span>
                            <span className="block text-[10px] text-neutral-400">{s.email}</span>
                          </td>
                          <td className="p-3 capitalize text-[var(--clr-text-title)]">
                            <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-slate-900 border border-[var(--clr-border-light)] rounded text-[9.5px]">
                              {s.role}
                            </span>
                          </td>
                          <td className="p-3 text-center text-neutral-550">{s.lastLogin}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-sans font-bold text-[9px] ${
                              s.status === "ACTIVE" 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100" 
                                : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                           <td className="p-3 text-right flex items-center justify-end gap-1.5">
                            {s.status === "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectRole(s.role as ClinicalRole);
                                  triggerToast(isAr ? `جاري تسجيل الدخول وحل المشاكل كـ ${s.fullName}...` : `Logging in as ${s.fullName}...`);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold font-sans bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg active:scale-95 transition-all"
                              >
                                {isAr ? "دخول دوت كوم" : "Login"}
                              </button>
                            )}
                            <button
                              onClick={() => toggleStaffStatus(s.id, s.status)}
                              className={`px-2.5 py-1 text-[9px] font-bold font-sans rounded-lg active:scale-95 transition ${
                                s.status === "ACTIVE" 
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-200" 
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                              }`}
                            >
                              {s.status === "ACTIVE" ? (isAr ? "🔓 تعليق اللحام" : "Sus-out") : (isAr ? "🔓 تفعيل" : "Authorize")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active JWT Session Tokens Manager */}
              <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                    <Power className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? "مراقب الجلسات المفتوحة والرموز النشطة" : "Active JWT Token Session Manager"}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isAr ? "متابعة الاتصالات الحية بالأجهزة الطرفية. يوفر زر KILL لقطع الجلسة فوراً في حال فقدان الجهاز" : "Audit real-time cryptographic tokens. Click KILL SESSION to block terminal access instantly."}
                  </p>
                </div>

                <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--clr-border-light)] text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        <th className="p-3">{isAr ? "المستخدم والمنصة" : "User & Terminal"}</th>
                        <th className="p-3">{isAr ? "المعرف الرقمي للمحطة" : "IP / Station IP"}</th>
                        <th className="p-3 text-center">{isAr ? "المهلة" : "Expires In"}</th>
                        <th className="p-3 text-right">{isAr ? "حظر فوري للرمز" : "Kill Access"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--clr-border-light)] font-mono text-[11px]">
                      {activeSessions.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-neutral-400 italic text-xs">No active sessions. All mock data cleared.</td></tr>
                      ) : activeSessions.map(sec => (
                        <tr key={sec.id} className="hover:bg-neutral-55/35">
                          <td className="p-3 font-sans">
                            <span className="block font-bold text-[var(--clr-text-title)]">{sec.user}</span>
                            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="px-1 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded text-[9px]">{sec.role}</span>
                              {sec.workstation}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
                            <span className="block font-bold">{sec.ipAddress}</span>
                            <span className="block text-[9px] text-neutral-420">Token: {sec.id}</span>
                          </td>
                          <td className="p-3 text-center font-bold text-indigo-650 dark:text-[#2BBFFF]">{sec.expiresIn}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => killSession(sec.id, sec.user)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-sans text-[10px] font-black rounded-lg transition shrink-0 cursor-pointer"
                            >
                              🚫 Kill Token
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-slate-900/40 rounded-xl text-[10.5px] leading-relaxed text-neutral-500">
                  <span className="font-bold text-amber-600 dark:text-amber-400">⚡ Decoupled Auth Security Notice: </span>
                  {isAr 
                    ? "عند النقر فوق Kill Token، يتم إعلام الجهاز الطرفي فورًا وفسخ جلسة SQLite المحلية في الويب وتطبيق الهاتف لردع أي تجميع محلي غير مصرح به."
                    : "revoking live tokens executes a remote purge broadcast. The edge database is immediately locked until fresh multi-factor cryptographic handshake is completed."}
                </div>
              </div>
            </div>

            {/* Row 3: Security Clearance Scanner & Credentials Lookup */}
            <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4" id="security_clearance_lookup_panel">
              <div className="border-b border-[var(--clr-border-light)] pb-3">
                <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{isAr ? "نظام استعلام والتحقق من التراخيص الأمنية" : "Security Clearance & Credentials Registry Lookup"}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isAr 
                    ? "نموذج استعلام إلكتروني فوري للتحقق من مستوى صلاحيات الموظف وبصمة العين الرقمية التابعة."
                    : "Live cryptographic directory: Audit employee biometric credentials, clearances, and tokenized system scopes."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Search & Select Panel - Left */}
                <div className="md:col-span-4 space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-55 dark:bg-neutral-900 border border-[var(--clr-border-light)] focus:outline-none"
                      placeholder={isAr ? "بحث بالاسم أو الكود..." : "Search name or ID..."}
                      value={securityLookupTerm}
                      onChange={(e) => setSecurityLookupTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {staffAccounts
                      .filter(s => s.fullName.toLowerCase().includes(securityLookupTerm.toLowerCase()) || s.id.toLowerCase().includes(securityLookupTerm.toLowerCase()))
                      .map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedLookupId(s.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                            selectedLookupId === s.id
                              ? "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-[#4F46E5] dark:text-indigo-400"
                              : "bg-transparent border-transparent hover:bg-neutral-55"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block font-black truncate">{s.fullName}</span>
                            <span className="block text-[9.5px] text-neutral-400 font-mono mt-0.5">{s.id}</span>
                          </div>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            s.role === "admin" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-neutral-100 dark:bg-neutral-850"
                          }`}>
                            {s.role}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Clearance Details Viewer Card - Right */}
                <div className="md:col-span-8">
                  {(() => {
                    const subject = staffAccounts.find(s => s.id === selectedLookupId) || staffAccounts[0];
                    if (!subject) return null;

                    // Compute clearance rating and scopes:
                    let clearanceLevel = "LEVEL 1";
                    let credentialsTitleEn = "Basic Reception Lookup";
                    let credentialsTitleAr = "صلاحية الاستقبال والبحث البسيط";
                    let scopes: string[] = [];

                    switch (subject.role) {
                      case "admin":
                        clearanceLevel = "LEVEL 5 (Supreme Cryptographic Admin)";
                        credentialsTitleEn = "Cryptographic Master Authority";
                        credentialsTitleAr = "السلطة الإشرافية والتشفيرية العليا المعفاة";
                        scopes = ["read_all", "write_all", "override_fencing", "control_gateways", "audit_tamper"];
                        break;
                      case "doctor":
                        clearanceLevel = "LEVEL 4 (Attending Consultant Physician)";
                        credentialsTitleEn = "Consultation & Specialty Procedure Access";
                        credentialsTitleAr = "صلاحيات الاستشارة والفحص الإكلينيكي التخصصي";
                        scopes = ["read_patient", "write_consultation", "request_labs", "order_pharmacy"];
                        break;
                      case "pharmacist":
                        clearanceLevel = "LEVEL 3 (Advanced Dispatch Authority)";
                        credentialsTitleEn = "Pharma Stock Ledger & Narcotics Control";
                        credentialsTitleAr = "إدارة عهد ومخزون الصيدلية وصرف المواد المخدرة";
                        scopes = ["read_prescriptions", "dispense_narcotics", "control_inventory_stock"];
                        break;
                      case "accountant":
                        clearanceLevel = "LEVEL 3 (Advanced Financial Authority)";
                        credentialsTitleEn = "Financial Ledger Sheets & Tax Claim Bypass";
                        credentialsTitleAr = "مراجعة القيود المحاسبية وتسوية المطالبات التأمينية";
                        scopes = ["read_billing", "execute_refunds", "publish_daily_balances", "reconcile_insurance"];
                        break;
                      case "nurse":
                        clearanceLevel = "LEVEL 2 (Triage Recording Authority)";
                        credentialsTitleEn = "Ophthalmic Nurse Triage & Ward Bed Entry";
                        credentialsTitleAr = "تسجيل القياسات الأساسية وفرز عيادة العيون التخصصية";
                        scopes = ["read_patient_basic", "write_bp_triage", "record_icu_beds"];
                        break;
                      case "receptionist":
                        clearanceLevel = "LEVEL 1 (Basic Operational Security)";
                        credentialsTitleEn = "Patient Registration & Kiosk Self-Enrollment";
                        credentialsTitleAr = "تحقيق هوية المريض وإدخال عاد لبيانات التواصل";
                        scopes = ["register_patient", "schedule_appointment", "print_invoice_basic"];
                        break;
                      case "hr_manager":
                        clearanceLevel = "LEVEL 1 (HR Support Personnel)";
                        credentialsTitleEn = "Staff Scheduling & Commissions Audit";
                        credentialsTitleAr = "جدولة ورديات الدوام ومراجعة مصفوفة عمولات الطاقم";
                        scopes = ["view_rosters", "issue_vouchers", "manage_commissions"];
                        break;
                      case "warehouse":
                        clearanceLevel = "LEVEL 2 (Logistics Authority)";
                        credentialsTitleEn = "Warehouse Inventory & Supply Chain";
                        credentialsTitleAr = "إدارة المخزون والمستودع وسلسلة التوريد";
                        scopes = ["view_inventory", "reorder_stock", "receive_shipments", "transfer_products"];
                        break;
                    }

                    return (
                      <div className="bg-neutral-50 dark:bg-slate-950/20 rounded-2xl p-5 border border-dashed border-[var(--clr-border-light)] grid grid-cols-1 sm:grid-cols-2 gap-4 relative overflow-hidden">
                        {/* Glow ornament */}
                        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

                        {/* Certificate Left Info */}
                        <div className="space-y-3.5">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-605 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                              🔒 SECURITY STATUS: {subject.status}
                            </span>
                            <h4 className="text-[13px] font-black text-[var(--clr-text-title)] mt-2">
                              {subject.fullName}
                            </h4>
                            <p className="text-[11px] text-neutral-400 font-medium font-mono lowercase">{subject.email}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">{isAr ? "درجة ترخيص الأمان" : "Security Clearance Level"}</span>
                            <span className="block text-xs font-mono font-black text-[#4F46E5] dark:text-[#2BBFFF] tracking-tight">
                              {clearanceLevel}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">{isAr ? "الصلاحية السريرية" : "Clinical Scope Description"}</span>
                            <span className="block text-[11px] font-bold leading-normal text-neutral-700 dark:text-neutral-300">
                              {language === "ar" ? credentialsTitleAr : credentialsTitleEn}
                            </span>
                          </div>
                        </div>

                        {/* Certificate Right Scopes */}
                        <div className="flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase">{isAr ? "حزم مصفوفة الأمان المشفرة" : "Cryptographic System Scopes"}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {scopes.map(sc => (
                                <span key={sc} className="px-2 py-0.5 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 text-[10px] font-mono font-bold text-[#4F46E5] dark:text-indigo-400 rounded-lg">
                                  {sc}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/40">
                            <div className="flex items-center gap-1.5 text-[10.5px]">
                              <span className="text-emerald-500">✓</span>
                              <span className="font-bold text-neutral-600 dark:text-neutral-300">{isAr ? "معايرة بصمة العين الرقمية" : "Biometric Iris Scan Compliant"}</span>
                            </div>
                            <div className="text-[8.5px] font-mono text-neutral-400 break-all leading-normal bg-white dark:bg-neutral-950 p-1.5 rounded-lg border border-[var(--clr-border-light)]">
                              HASH: SHA256:{subject.id}-{subject.role}-7f995
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => triggerToast(isAr ? `تحدي أمان OTP تم إرساله بنجاح لـ ${subject.fullName}` : `Sent Multi-Factor auth challenge to ${subject.fullName}'s verified duty terminal!`)}
                              className="flex-1 py-1 px-2.5 bg-indigo-600 hover:bg-opacity-90 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer"
                            >
                              {isAr ? "تحدي الهوية OTP" : "Trigger MFA Duty Challenge"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectRole(subject.role as ClinicalRole);
                                triggerToast(isAr ? `جاري الارتباط وتسجيل الدخول كـ ${subject.fullName}` : `Logging in as ${subject.fullName}...`);
                              }}
                              className="flex-1 py-1 px-2.5 bg-[#10B981] hover:bg-opacity-90 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer font-sans"
                            >
                              {isAr ? "دخول فوري ✓" : "Direct Log-in ✓"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SPECIALTY CLINICS BYPASS */}
        {activeTab === "clinics" && (
          <div className="bg-[var(--clr-bg-card)] p-6 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
            <div className="border-b border-[var(--clr-border-light)] pb-4">
              <h3 className="text-sm font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? "بوابة تجاوز ومتابعة الأطقم الطبية (Supervisory Clinical Console)" : "Supervisory Workstation Bypass Portal"}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isAr 
                  ? "تحكم كامل وتفتيش مباشر لجميع العيادات التخصصية الثمانية دون حظر الحماية لحسابات الأطباء."
                  : "Elevated administrative rights: Switch and audit live consult data across any of the 8 specialty clinical consoles."}
              </p>
            </div>
            
            <SpecialtyClinics
              patients={patients}
              selectedPatient={null}
              onUpdatePatient={onUpdatePatient}
              activeRole="doctor" 
              onShowReport={onShowReport}
              language={language}
            />
          </div>
        )}

        {/* TAB 6: CLINICAL TRIAGE & PRIORITY RULES */}
        {activeTab === "triage_rules" && (
          <div className="space-y-6">
            <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
              <div className="border-b border-[var(--clr-border-light)] pb-4">
                <h3 className="text-sm font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span>{isAr ? "إدارة قواعد الفرز الطبي وتجاوز الأولوية (Priority Rule Constructor)" : "Clinical Triage & Priority Rules Compiler"}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isAr
                    ? "إضافة قواعد ومطابقات مخصصة تعمل فورا لترقية المرضعات ومستوى الخطر إلى قسم الحالات الطارئة STAT."
                    : "Configure logic boundaries. Rules marked as Emergency STAT will automatically upgrade patient urgencies during front desk triage check-in."}
                </p>
              </div>

              {/* Add Priority Rule Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newRuleNameEn || !newRuleNameAr) {
                    triggerToast(isAr ? "الرجاء كود واسم القاعدة بالضميمتين" : "Please enter both English & Arabic rule names");
                    return;
                  }
                  addRule({
                    nameEn: newRuleNameEn,
                    nameAr: newRuleNameAr,
                    descriptionEn: newRuleDescEn || "Custom priority rule",
                    descriptionAr: newRuleDescAr || "قاعدة أولوية مخصصة",
                    className: newRuleClass,
                    triggersStat: newRuleTriggersStat,
                    isActive: true
                  });
                  setNewRuleNameEn("");
                  setNewRuleNameAr("");
                  setNewRuleDescEn("");
                  setNewRuleDescAr("");
                  triggerToast(isAr ? "تم إدراج وترجمة قاعدة الفرز الطبي فوريا!" : "New Clinical Triage Priority Rule compiled into live gate matrices!");
                }}
                className="p-4 bg-neutral-50 dark:bg-slate-900/60 border border-[var(--clr-border-light)] rounded-xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "اسم القاعدة بالتجربة (En)" : "Rule Name (English)"}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Diabetics Retinal Macular Edema"
                      value={newRuleNameEn}
                      onChange={(e) => setNewRuleNameEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "اسم القاعدة بالتجربة (Ar)" : "Rule Name (Arabic)"}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 focus:ring-1 focus:ring-indigo-500 text-right font-arabic"
                      placeholder="مثال: ذمة ماكيولا السريرية لمرضى السكري"
                      value={newRuleNameAr}
                      onChange={(e) => setNewRuleNameAr(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "وصف القاعدة مجهريا (En)" : "Description (English)"}</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Criteria details..."
                      value={newRuleDescEn}
                      onChange={(e) => setNewRuleDescEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase">{isAr ? "وصف القاعدة مجهريا (Ar)" : "Description (Arabic)"}</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 text-xs text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 focus:ring-1 focus:ring-indigo-500 text-right font-arabic"
                      placeholder="تفاصيل شروط الفرز..."
                      value={newRuleDescAr}
                      onChange={(e) => setNewRuleDescAr(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRuleClass("from-amber-500/10 to-amber-600/5 border-amber-200")}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${
                        newRuleClass.includes("amber") ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-white border-neutral-250 text-neutral-600"
                      }`}
                    >
                      {isAr ? "ذهبي" : "Amber (System)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRuleClass("from-indigo-500/10 to-indigo-600/5 border-indigo-200")}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${
                        newRuleClass.includes("indigo") ? "bg-indigo-55 border-indigo-400 text-[#4F46E5]" : "bg-white border-neutral-250 text-neutral-600"
                      }`}
                    >
                      {isAr ? "أزرق نيلي" : "Indigo (Consult)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRuleClass("from-purple-500/10 to-purple-600/5 border-purple-200")}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${
                        newRuleClass.includes("purple") ? "bg-purple-100 border-purple-400 text-purple-700 font-black" : "bg-white border-neutral-250 text-neutral-600"
                      }`}
                    >
                      {isAr ? "بنفسجي" : "Purple (Urgent)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRuleClass("from-rose-500/10 to-rose-600/5 border-rose-200")}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${
                        newRuleClass.includes("rose") ? "bg-rose-100 border-rose-400 text-rose-700 font-black" : "bg-white border-neutral-250 text-neutral-600"
                      }`}
                    >
                      {isAr ? "شديد الخطورة" : "Scarlet (Severe)"}
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-350 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRuleTriggersStat}
                        onChange={(e) => setNewRuleTriggersStat(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-indigo-600"
                      />
                      <span>{isAr ? "يرقي الحالة لطوارئ STAT" : "Triggers High-Risk STAT Override"}</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#4F46E5] hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider font-sans transition active:scale-95 cursor-pointer"
                    >
                      {isAr ? "جمع وتعشيق القاعدة ✓" : "Compile Triage Rule ✓"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Current Active Rules Grid */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{isAr ? "قواعد الفرز الحالية المحملة بالخادم" : "Loaded Gatekeeper Triage Rules"}</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {priorityRules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-2xl border bg-gradient-to-br ${rule.className} relative transition duration-300 ${
                        rule.isActive ? "opacity-100 shadow-sm" : "opacity-60 dark:opacity-40"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-black text-[var(--clr-text-title)]">
                            {language === "ar" ? rule.nameAr : rule.nameEn}
                          </h4>
                          <span className="inline-block text-[8px] font-mono font-bold bg-white/60 dark:bg-black/40 px-1 py-0.2 rounded uppercase mt-1">
                            ID: {rule.id}
                          </span>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                          rule.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-neutral-200 text-neutral-600"
                        }`}>
                          {rule.isActive ? (isAr ? "نشط" : "ACTIVE") : (isAr ? "معطل" : "DISABLED")}
                        </span>
                      </div>

                      <p className="text-[10.5px] leading-relaxed text-neutral-500 mt-2.5 min-h-[50px]">
                        {language === "ar" ? rule.descriptionAr : rule.descriptionEn}
                      </p>

                      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            toggleRuleActive(rule.id);
                            triggerToast(isAr ? `تعديل حالة القاعدة ${rule.id}` : `Toggled priority filter for rule ${rule.nameEn}`);
                          }}
                          className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition ${
                            rule.isActive ? "bg-rose-50 hover:bg-rose-100 text-rose-650" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {rule.isActive ? (isAr ? "تعطيل" : "Disable Rule") : (isAr ? "تفعيل" : "Enable Rule")}
                        </button>

                        {!rule.isSystem && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteRule(rule.id);
                              triggerToast(isAr ? "تم إقصاء القاعدة مصفوفيا" : `Removed custom rule ${rule.id}`);
                            }}
                            className="p-1 px-2 text-[9px] font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                          >
                            {isAr ? "حذف" : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDGE NODES & SYNC TELEMETRY */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            
            {/* Health node board */}
            <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--clr-border-light)]">
                <div>
                  <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    <span>{isAr ? "شبكة أجهزة الطرفيات وهارت بيت المزامنة" : "Clinical Edge Nodes & Synchronization Telemetry"}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isAr 
                      ? "بث حي لأداء قواعد البيانات المحلية في عيادات الجوارح وتعداد القياسات المعلقة بانتظار الخادم الأساسي."
                      : "Shows real-time state of Flutter mobile POS & desktop SQLite edge clients configured to survive internet outages."}
                  </p>
                </div>
                
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl font-bold font-mono uppercase tracking-widest border border-indigo-100">
                  Total Pending Logs: {edgeNodes.reduce((acc, current) => acc + current.localUnsyncedCount, 0)} Items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {edgeNodes.length === 0 ? (
                  <div className="col-span-full p-6 text-center text-neutral-400 italic text-xs">No edge nodes registered. Backend integration pending.</div>
                ) : edgeNodes.map(node => (
                  <div key={node.id} className="p-4 bg-neutral-50/50 dark:bg-slate-900/30 rounded-2xl border border-[var(--clr-border-light)] flex flex-col space-y-3 relative overflow-hidden group hover:border-indigo-400 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="p-1.5 bg-white dark:bg-slate-950 border border-[var(--clr-border-light)] rounded-xl">
                        <Terminal className="w-4 h-4 text-indigo-500" />
                      </div>

                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase flex items-center gap-1 ${
                        node.status === "ONLINE"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-450 border border-emerald-200"
                          : node.status === "SYNCING"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/25 dark:text-blue-450 border border-blue-200"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-1000/20 dark:text-amber-450 border border-amber-200 animate-pulse"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          node.status === "ONLINE" ? "bg-emerald-500 animate-pulse" : node.status === "SYNCING" ? "bg-blue-500 animate-spin" : "bg-amber-500 animate-ping"
                        }`} />
                        <span>{node.status === "ONLINE" ? "Online" : node.status === "SYNCING" ? "Syncing..." : "Edge Mode"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs font-black text-[var(--clr-text-title)]">{node.name}</span>
                      <span className="block text-[10px] text-neutral-400">{node.location}</span>
                    </div>

                    <div className="pt-2 border-t border-[var(--clr-border-light)] grid grid-cols-2 gap-2 text-[10.5px]">
                      <div>
                        <span className="block text-neutral-400">{isAr ? "معلقة بالمحزن" : "Pending Batch"}</span>
                        <span className={`block font-mono font-black text-xs ${node.localUnsyncedCount > 0 ? "text-rose-550" : "text-neutral-500"}`}>
                          {node.localUnsyncedCount} {isAr ? "سجلات" : "Logs"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-neutral-400">{isAr ? "الاستجابة" : "Heartbeat"}</span>
                        <span className="block font-mono text-[10px] text-neutral-500 truncate">{node.lastHeartbeat}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => triggerSyncNode(node.id, node.name)}
                        disabled={node.status === "SYNCING"}
                        className="w-full py-1.5 bg-white dark:bg-slate-950 hover:bg-neutral-50 border border-[var(--clr-border-light)] hover:border-indigo-400 rounded-xl text-[10px] font-bold font-sans tracking-wide transition flex items-center justify-center gap-1 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${node.status === "SYNCING" ? "animate-spin" : ""}`} />
                        <span>{isAr ? "مزامنة مطابقة فورية" : "Synchronize Node"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Collision and Concurrency Conflict Queue */}
            <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-amber-200/50 dark:border-amber-950/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-950/20 pb-3">
                <div className="flex items-center gap-1.5 col-span">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <h3 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest font-mono">
                    {isAr ? "طابور حل تعارض تضارب البيانات في الحقل" : "Edge Client Data Concurrency Conflicts"}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-0.5 rounded border border-amber-200/30">
                  {conflictQueue.length} {isAr ? "تعارض بانتظار الحكم الموحد" : "Collisions Pending RESOLV"}
                </span>
              </div>

              {conflictQueue.length === 0 ? (
                <div className="p-6 text-center text-neutral-400 flex flex-col items-center justify-center space-y-1">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                  <p className="text-[11px] font-bold text-neutral-500 uppercase">{isAr ? "لا يوجد تعارضات للبيانات نشطة" : "Zero Database Collisions"}</p>
                  <p className="text-[10px] text-neutral-410">{isAr ? "كل العمليات اللامركزية تم مطابقتها وتمريرها بنجاح." : "Multi-node transactions synchronized with perfect sequence index serialization."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflictQueue.map(c => (
                    <div key={c.id} className="p-4 bg-amber-50/40 dark:bg-amber-1000/10 border border-amber-200/25 dark:border-amber-1000/40 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      <div className="lg:col-span-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 font-mono text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold uppercase">{c.id}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{c.timestamp}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-black text-neutral-800 dark:text-neutral-100">{c.patientName}</span>
                          <span className="block text-[10px] text-neutral-500">Field Segment: <strong className="font-mono text-indigo-650 dark:text-[#2BBFFF]">{c.field}</strong></span>
                        </div>
                      </div>

                      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option A */}
                        <div className="p-3 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between space-y-2">
                          <div>
                            <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-tight">{c.nodeAName}</span>
                            <span className="block text-sm font-mono font-extrabold text-indigo-600 dark:text-[#2BBFFF] pt-1">{c.nodeAValue}</span>
                          </div>
                          <button
                            onClick={() => resolveConflict(c.id, "A", c.nodeAValue)}
                            className="py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-950 dark:text-[#2BBFFF] text-[10px] font-black uppercase rounded-lg border border-indigo-200 dark:border-[#2BBFFF]/20 transition active:scale-95 cursor-pointer"
                          >
                            Keep Node A Value
                          </button>
                        </div>

                        {/* Option B */}
                        <div className="p-3 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between space-y-2">
                          <div>
                            <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-tight">{c.nodeBName}</span>
                            <span className="block text-sm font-mono font-extrabold text-amber-600 dark:text-amber-450 pt-1">{c.nodeBValue}</span>
                          </div>
                          <button
                            onClick={() => resolveConflict(c.id, "B", c.nodeBValue)}
                            className="py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-slate-950 dark:text-amber-450 text-[10px] font-black uppercase rounded-lg border border-amber-200/50 dark:border-amber-900/20 transition active:scale-95 cursor-pointer"
                          >
                            Keep Node B Value
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: IMMUTABLE AUDIT LEDGER & SYSTEM EXCEPTIONS */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Immutable Legal Audit Ledger - Left */}
              <div className="lg:col-span-7 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? "سجل التعديلات والتدقيق القانوني الموحد" : "The Immutable Audit Ledger"}</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isAr ? "سجل شامل غير قابل للحذف لكل العمليات التي يقوم بها الأطباء والمحاسبون والممرضون." : "Searchable database trace. Strictly read-only compliant ledger indexing operational milestones."}
                    </p>
                  </div>
                </div>

                {/* Search box for Audit log */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    className="w-full px-8 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-[var(--clr-border-light)] rounded-xl"
                    placeholder="Search ledger by Actor, Action details or system Module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2 text-[10px] text-neutral-400 hover:text-neutral-600 font-bold"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                <div className="border border-[var(--clr-border-light)] rounded-xl max-h-[450px] overflow-y-auto">
                  {filteredAudits.length === 0 ? (
                    <p className="p-6 text-center font-mono text-[11px] text-neutral-400 italic">No search results match current keywords.</p>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--clr-border-light)] text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                          <th className="p-3">{isAr ? "مجرى التعديل" : "Actor / Role"}</th>
                          <th className="p-3">{isAr ? "الحدث الطبي" : "Operational Action"}</th>
                          <th className="p-3">{isAr ? "تفاصيل الحركة" : "Ledger Details"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--clr-border-light)] font-mono text-[11px]">
                        {filteredAudits.map(log => (
                          <tr key={log.id} className="hover:bg-neutral-50/40">
                            <td className="p-3">
                              <span className="block font-sans font-black text-neutral-800 dark:text-neutral-200 text-xs">{log.actor}</span>
                              <span className="text-[10px] text-neutral-400">{log.role} • {log.timestamp}</span>
                            </td>
                            <td className="p-3 text-indigo-650 dark:text-[#2BBFFF] font-bold">
                              <span className="block">{log.action}</span>
                              <span className="text-[9px] text-neutral-400 font-sans px-1 py-0.2 bg-neutral-100 dark:bg-slate-900 rounded font-bold uppercase">{log.module}</span>
                            </td>
                            <td className="p-3 text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed text-[11px]">
                              {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Real-time System Exceptions & Stack Traces - Right */}
              <div className="lg:col-span-5 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--clr-border-light)] pb-3">
                  <div>
                    <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isAr ? "سجل استثناءات وأخطاء الخادم الفنية" : "Live Backend Exceptions & Stack Traces"}</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isAr ? "تفاصيل تضارب العمليات والـ API الموجهة للخوادم لتسهيل استشارات الصيانة." : "Exposes database Spring Boot stack traces before doctors face hiccups."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSystemExceptions([]);
                      triggerToast("Archived and cleared live exception buffer logs.");
                    }}
                    className="p-1 px-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-rose-500 transition active:scale-90 text-[10px] font-black uppercase border border-rose-250/20 shrink-0 cursor-pointer"
                  >
                    {isAr ? "تصفير" : "Clear Traces"}
                  </button>
                </div>

                {systemExceptions.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400 flex flex-col items-center justify-center space-y-1">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                    <p className="text-[11px] font-bold text-neutral-500 uppercase">{isAr ? "الخوادم تعمل بكفاءة ١٠٠٪" : "All Services Healthy"}</p>
                    <p className="text-[10px] text-neutral-410">{isAr ? "قنوات الربط والـ Microservices تعمل بدون أي تجميد." : "SpringBoot API Gateway reports zero uncaught exceptions in pool."}</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto">
                    {systemExceptions.map(exc => (
                      <div key={exc.id} className="p-3 bg-slate-900 text-slate-100 rounded-2xl border border-rose-950/40 space-y-2 relative">
                        <div className="flex items-center justify-between font-mono text-[9px] text-rose-400">
                          <span className="font-bold">{exc.service}</span>
                          <span>{exc.timestamp}</span>
                        </div>
                        
                        <div>
                          <span className="block font-mono text-[11px] font-extrabold text-rose-450 truncate">{exc.exceptionClass}</span>
                          <p className="text-[10.5px] font-mono text-neutral-350">{exc.message}</p>
                        </div>

                        {/* Stack trace expander lookalike */}
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-neutral-800 text-[9px] font-mono text-neutral-500 overflow-x-auto whitespace-pre leading-relaxed scrollbar-none">
                          {exc.stackTrace}
                        </div>

                        <div className="flex justify-end gap-2 pt-1 font-sans text-[9px]">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(exc.stackTrace);
                              triggerToast("Stack trace copied to clipboard!");
                            }}
                            className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded hover:text-white"
                          >
                            Copy Stack
                          </button>
                          
                          <button
                            onClick={() => {
                              triggerToast("Payload report compiled and routed to engineering Jira! Ticket Ref: JAW-" + exc.id);
                            }}
                            className="px-2 py-0.5 bg-rose-900 text-rose-100 rounded hover:bg-rose-800 font-bold"
                          >
                            Submit to Dev
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: MASTER DATA MANAGEMENT (GLOBAL VARIABLES) */}
        {activeTab === "mdm" && (
          <div className="space-y-6">
            
            {/* Variable Slider controls cards */}
            <div className="bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isAr ? "تحرير معايير وهوامش المستشفى الموحدة" : "Unified Hospital Rule Configuration & Thresholds"}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isAr 
                    ? "تعديل هوامش الخروج التلقائي والمؤقتات المعتمدة لقطرات توسيع حدقة العين بالفرز."
                    : "Adjust system-wide clinical constants here. Changes reflect immediately across all diagnostic stations."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-neutral-50/50 dark:bg-slate-900/40 rounded-2xl border border-[var(--clr-border-light)]">
                {/* Dilation slide */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--clr-text-title)]">
                    <span>{isAr ? "مؤقت قطرة توسيع الحدقة المعتمد" : "Pre-Op Dilation Buffer"}</span>
                    <span className="font-mono text-indigo-600 dark:text-[#2BBFFF] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10.5px]">
                      {globalThresholds.pupilDilationTimerMin} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                    value={globalThresholds.pupilDilationTimerMin}
                    onChange={(e) => setGlobalThresholds({ ...globalThresholds, pupilDilationTimerMin: Number(e.target.value) })}
                  />
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    {isAr ? "الوقت الإلزامي لانتظار كمال اتساع العين قبل المتابعة بغرفة الطبيب." : "Mandatory dilation wait timer triggered during nursing pre-op checkbox check."}
                  </p>
                </div>

                {/* Token expiration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--clr-text-title)]">
                    <span>{isAr ? "مهلة انتهاء صلاحية الرمز التلقائية" : "Auto-Logout Shift Expiracy"}</span>
                    <span className="font-mono text-indigo-600 dark:text-[#2BBFFF] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10.5px]">
                      {globalThresholds.jwtTokenExpirationHrs} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                    value={globalThresholds.jwtTokenExpirationHrs}
                    onChange={(e) => setGlobalThresholds({ ...globalThresholds, jwtTokenExpirationHrs: Number(e.target.value) })}
                  />
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    {isAr ? "المهلة المحددة لحكم الرمز قبل إخراجه من الجلسة وإعادة الفرز." : "Enforced token session age. Restricts overnight static terminal exposure."}
                  </p>
                </div>

                {/* Database ping frequency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--clr-text-title)]">
                    <span>{isAr ? "تردد نبضات الشبكة بالمقرات" : "Edge Heartbeat Frequency"}</span>
                    <span className="font-mono text-indigo-600 dark:text-[#2BBFFF] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10.5px]">
                      {globalThresholds.edgeSyncIntervalSec} secs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                    value={globalThresholds.edgeSyncIntervalSec}
                    onChange={(e) => setGlobalThresholds({ ...globalThresholds, edgeSyncIntervalSec: Number(e.target.value) })}
                  />
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    {isAr ? "فواصل التحقق التلقائي لسلامة الاتصال وإرسال السجلات المخزنة بالشبكة الفرعية." : "SQLite conflict checking intervals. Shorter periods consume bandwidth but limit collisions."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveThresholds}
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Save Active Constant Registry
                </button>
              </div>
            </div>

            {/* Insurance and Asset mappings column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Insurance Providers - Left */}
              <div className="lg:col-span-6 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? "سجل شركات التأمين ومصفوفة الخصم المقررة" : "Insurance Provider Registry & API Endpoints"}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isAr ? "إضافة وتعديل روابط المطالبات ونسبة التحمل للمريض للتأمين الحكومي والخاص" : "Coordinate claim remittance links and base coverage metrics."}
                  </p>
                </div>

                {/* Add Company Inline */}
                <form onSubmit={handleAddInsurance} className="p-3 bg-neutral-50 dark:bg-slate-900/60 border border-[var(--clr-border-light)] rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="block font-bold text-neutral-500 uppercase">{isAr ? "اسم شركة التأمين" : "Corporate Payer Name"}</span>
                      <input
                        required
                        type="text"
                        className="w-full px-2.5 py-1.5 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Medgulf UAE"
                        value={newInsurance.name}
                        onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-bold text-neutral-500 uppercase">{isAr ? "نسبة التحمل المقررة" : "Provider Co-Pay Cover Limit"}</span>
                      <select
                        className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg"
                        value={newInsurance.discountPercentage}
                        onChange={(e) => setNewInsurance({ ...newInsurance, discountPercentage: Number(e.target.value) })}
                      >
                        <option value="100">100% {isAr ? "تغطية كاملة" : "Full Cover"}</option>
                        <option value="95">95% Cover</option>
                        <option value="90">90% Cover</option>
                        <option value="85">85% Cover</option>
                        <option value="80">80% Cover</option>
                        <option value="70">70% Cover</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-[11px]">
                    <span className="block font-bold text-neutral-500 uppercase">{isAr ? "رابط الـ API للمطالبة" : "Direct API Claims Target URL"}</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-2.5 py-1 text-xs border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 font-mono"
                        placeholder="https://provider.ae/claims/api/v1"
                        value={newInsurance.claimEndpoint}
                        onChange={(e) => setNewInsurance({ ...newInsurance, claimEndpoint: e.target.value })}
                      />
                      <button
                        type="submit"
                        className="px-3 bg-indigo-600 hover:bg-opacity-95 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        {isAr ? "ربط" : "Register"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--clr-border-light)] text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        <th className="p-3">{isAr ? "الشركة" : "Health Payer"}</th>
                        <th className="p-3 text-center">{isAr ? "المطابقة" : "Cover Share"}</th>
                        <th className="p-3">{isAr ? "مسار الاتصال" : "Clearinghouse endpoint"}</th>
                        <th className="p-3 text-right">{isAr ? "الحالة" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--clr-border-light)] font-mono text-[11px]">
                      {insuranceProviders.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-neutral-400 italic text-xs">No insurance providers configured. Backend integration pending.</td></tr>
                      ) : insuranceProviders.map(p => (
                        <tr key={p.id} className="hover:bg-neutral-55/35">
                          <td className="p-3 font-sans font-bold text-[var(--clr-text-title)]">{p.name}</td>
                          <td className="p-3 text-center font-bold text-indigo-600 dark:text-[#2BBFFF]">{p.discountPercentage}%</td>
                          <td className="p-3 text-neutral-400 truncate max-w-[150px]" title={p.claimEndpoint}>{p.claimEndpoint}</td>
                          <td className="p-3 text-right font-sans">
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-[#2BBFFF] rounded text-[9px] border border-emerald-100/30">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Infrastructure & Bed Mapping - Right */}
              <div className="lg:col-span-6 bg-[var(--clr-bg-card)] p-5 rounded-2xl border border-[var(--clr-border-light)] shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-[var(--clr-text-title)] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? "تخطيط الغرف والأسرة وأصول العيادات" : "Operating Room & Infrastructure Ward Mapping"}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isAr ? "إدارة غرف العمليات والأسرة الشاغرة؛ تحويل الغرف للصيانة لتعليق إدراج المرضى بها." : "Create patient beds, toggle operating rooms online, or flag maintainance blocks."}
                  </p>
                </div>

                {/* Add Asset Inline */}
                <form onSubmit={handleAddAsset} className="p-3 bg-neutral-50 dark:bg-slate-900/60 border border-[var(--clr-border-light)] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 text-[11px]">
                    <span className="block font-bold text-neutral-500 uppercase">{isAr ? "مسمى المرفق" : "Facility Tag"}</span>
                    <input
                      required
                      type="text"
                      className="w-full px-2.5 py-1.5 border border-[var(--clr-border-light)] rounded-lg bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100"
                      placeholder="OR Room 3, Bed 108"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <span className="block font-bold text-neutral-500 uppercase">{isAr ? "تصنيف الأصل" : "Asset Type"}</span>
                    <select
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 border border-[var(--clr-border-light)] rounded-lg"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                    >
                      <option value="BED">{isAr ? "سرير إقامة" : "Patient Ward Bed"}</option>
                      <option value="OR">{isAr ? "غرفة عمليات" : "Operating Room"}</option>
                      <option value="CLINIC">{isAr ? "مكتب عيادة تخصصية" : "Specialty Station"}</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-opacity-95 text-white font-extrabold text-xs rounded-lg transition shadow-sm cursor-pointer"
                    >
                      {isAr ? "إضافة أصل" : "Map Asset"}
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-xl max-h-[220px] overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--clr-border-light)] text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        <th className="p-3">{isAr ? "الأصل والوسم" : "Asset Code"}</th>
                        <th className="p-3">{isAr ? "النوع" : "Category"}</th>
                        <th className="p-3 text-center">{isAr ? "الجاهزية" : "Operational Status"}</th>
                        <th className="p-3 text-right">{isAr ? "التحكم" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--clr-border-light)] font-mono text-[11px]">
                      {infrastructureAssets.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-neutral-400 italic text-xs">No infrastructure assets registered. Backend integration pending.</td></tr>
                      ) : infrastructureAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-neutral-55/35">
                          <td className="p-3 font-sans font-bold text-[var(--clr-text-title)]">{asset.name}</td>
                          <td className="p-3 text-neutral-400 font-bold">{asset.type}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-sans font-black text-[9px] ${
                              asset.status === "ACTIVE" 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100/30" 
                                : asset.status === "MAINTENANCE" 
                                ? "bg-amber-50 dark:bg-amber-950/25 text-amber-700 dark:text-amber-450 border border-amber-200/30"
                                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border border-neutral-200"
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-sans">
                            <button
                              onClick={() => toggleAssetStatus(asset.id, asset.status)}
                              className="px-2 py-1 text-[9.5px] font-extrabold border border-neutral-250/20 hover:bg-neutral-50 dark:hover:bg-slate-900 rounded-lg active:scale-95 transition text-indigo-600 dark:text-[#2BBFFF] cursor-pointer"
                            >
                              Toggle Status
                            </button>
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

      </div>
    </div>
  );
}
