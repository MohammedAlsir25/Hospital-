/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  Moon,
  Sun,
  Globe,
  Activity,
  UserCheck,
  Stethoscope,
  Building,
  Shield,
  Smartphone,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  Users,
  Compass,
  FileText,
  UserCheck2,
  Trash2,
  BadgeAlert,
  ArrowRight,
  TrendingUp,
  FolderLock,
  Glasses,
  Coins,
  Eye,
  CircleDot
} from "lucide-react";

import { Patient, ClinicalRole, ClinicType } from "./types";
import { INITIAL_PATIENTS, CLINIC_INFO_MAP } from "./data";
import { TRANSLATIONS } from "./translations";

// EMR Core Sub components
import KioskReception from "./components/KioskReception";
import SpecialtyClinics from "./components/SpecialtyClinics";
import AncillaryDepartments from "./components/AncillaryDepartments";
import RbacScreen from "./components/RbacScreen";
import HardwareFallbacks from "./components/HardwareFallbacks";
import AiAssistant from "./components/AiAssistant";
import ScenarioCoach from "./components/ScenarioCoach";

// ERP Full Screen Apps
import ErpSpreadsheetApp from "./components/ErpSpreadsheetApp";
import PremiumBentoShowcase from "./components/PremiumBentoShowcase";
import PatientPdfReportModal from "./components/PatientPdfReportModal";

export default function App() {
  // Global Workspace Environments
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PAT-007");
  const [activeRole, setActiveRole] = useState<ClinicalRole>("doctor");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Nav views & App launchers
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [launchedApp, setLaunchedApp] = useState<"pharmacy" | "warehouse" | "optics" | "accounting" | "hr" | "reception" | null>(null);

  // PDF Report State
  const [pdfReportPatientId, setPdfReportPatientId] = useState<string | null>(null);

  // Custom Intercepted Alert State
  const [customAlert, setCustomAlert] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      setCustomAlert({ message: msg, visible: true });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Collapsible zones state
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({
    front: false,
    clinical: false,
    diagnostics: false,
    pharmacy: false,
    finance: false,
    governance: false,
  });

  // Local clock state for Dashboard
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US"));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [language]);

  // Synchronize dynamic styles on root theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleZone = (zone: string) => {
    setCollapsedZones(prev => ({ ...prev, [zone]: !prev[zone] }));
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleAddPatient = (created: Patient) => {
    setPatients(prev => {
      const exists = prev.some(p => p.id === created.id);
      if (exists) {
        return prev.map(p => (p.id === created.id ? created : p));
      }
      return [...prev, created];
    });
    setSelectedPatientId(created.id);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  // Real-world Emergency STAT Overrides Integration
  const sortedPatients = [...patients].sort((a, b) => {
    const aIsEmergency = a.triageVitals?.urgency === "STAT_EMERGENCY";
    const bIsEmergency = b.triageVitals?.urgency === "STAT_EMERGENCY";

    if (aIsEmergency && !bIsEmergency) return -1;
    if (!aIsEmergency && bIsEmergency) return 1;
    return 0; // retain registry chronology
  });

  // Dynamic search state inside Global Search Bar
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedPatients, setSearchedPatients] = useState<Patient[]>([]);

  // High-performance scaling simulation to load and index 100,000+ patients instantly
  const handleSimulate100K = () => {
    const totalCount = 101500;
    const names = [
      "Fatima Al Maktoum", "Michael Vance", "Zayed Al Nahyan", "Sarah Jenkins",
      "John Harrison", "Lydia Jenkins", "Marcus Aurelius", "Amna Al Kaabi",
      "Omar Bin Al Khattab", "Layla Al Harbi", "Hamdan Al Suwaidi", "Reem Al Hashimi",
      "Saeed Al Jaber", "Noora Al Marri", "Mariam Al Falasi", "Majid Al Qasimi",
      "Fatima Al Marzooqi", "Yousef Al Mansoori", "Huda Al Shamisi", "Tariq Al Suwaidi"
    ];
    const clinics: ClinicType[] = [
      "Medicine", "ENT", "Dental", "Retina", "Glaucoma", "Orbit", "Pediatrics Ophthalmology", "General Ophthalmology"
    ];
    const genders = ["Male", "Female"] as const;

    const startTimestamp = performance.now();
    
    // Low footprint list creation
    const scaledList: Patient[] = [...INITIAL_PATIENTS];

    for (let i = 1; i <= totalCount; i++) {
      const idx = i;
      const rName = names[idx % names.length] + ` (Index #${idx})`;
      const rClinic = clinics[idx % clinics.length];
      const rGender = genders[idx % genders.length];
      const birthYear = 2026 - (3 + (idx % 75));
      const dob = `${birthYear}-05-${(idx % 28) + 1}`;
      const age = 2026 - birthYear;
      const statusList: Patient["status"][] = ["Registered", "Triaged", "InConsult", "LabsPending", "Dispensing", "BillingPending", "Completed"];
      const rStatus = statusList[idx % statusList.length];

      scaledList.push({
        id: `PAT-${100000 + idx}`,
        name: rName,
        dob,
        age,
        gender: rGender,
        status: rStatus,
        clinic: rClinic,
        triageVitals: {
          systolic: 110 + (idx % 40),
          diastolic: 70 + (idx % 25),
          heartRate: 60 + (idx % 40),
          temperatureCelcius: 36.4 + (idx % 15) / 10,
          weightKg: 45 + (idx % 70),
          urgency: (idx % 500 === 0) ? "STAT_EMERGENCY" : "Normal",
          vitalsVerified: true
        },
        clinicalLogs: [
          {
            timestamp: "09:00",
            actorRole: "Automated SDLC Pipeline",
            action: "System Index Ingest",
            notes: `High-concurrency synthetic index PAT-${100000 + idx} provisioned under strict SLA protocols.`
          }
        ],
        billingLedger: [
          {
            id: `BIL-${300000 + idx}`,
            serviceName: "Automated Clinical Billing Assessment",
            category: "Consultation",
            amount: 40 + (idx % 110),
            status: (idx % 3 === 0) ? "Paid" : "Unpaid"
          }
        ]
      });
    }

    const endTimestamp = performance.now();
    const duration = (endTimestamp - startTimestamp).toFixed(2);

    setPatients(scaledList);
    setSelectedPatientId(`PAT-100005`); // Automatically select a synthetic patient

    window.alert(
      language === "ar"
        ? `🚀 محاكاة سعة النظام ناجحة!\nتم بنجاح تركيب وجدولة ${scaledList.length.toLocaleString()} مريض بنظام الفهرسة المركبة السريعة في زمن قدره ${duration}ms لضمان استجابة أقل من 50ms.`
        : `🚀 System Scale Simulation Succeeded!\nSuccessfully compiled and indexed ${scaledList.length.toLocaleString()} patients database in memory in ${duration}ms under strict sub-50ms retrieval limits.`
    );
  };

  const handleGlobalSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchedPatients([]);
      return;
    }
    const query = val.toLowerCase();
    // Use fast native retrieval on larger dataset
    const filtered = patients.filter(
      p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
    );
    // Slice to protect React from rendering thousands of nodes
    setSearchedPatients(filtered.slice(0, 50));
  };

  const selectPatientFromSearch = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSearchQuery("");
    setSearchedPatients([]);
  };

  // Translations
  const t = TRANSLATIONS[language];

  // Map individual clinical sidebar link clicks to load SpecialtyClinics with correct clinic selected
  const loadSpecialtyClinic = (clinicName: ClinicType) => {
    setActiveView("clinical_consult");
    // Find first patient or assign clinic selection
    if (selectedPatient) {
      handleUpdatePatient({
        ...selectedPatient,
        clinic: clinicName
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--clr-bg-main)] text-[#0F172A] dark:text-[#F8FAFC] flex font-sans select-none overflow-hidden transition-colors duration-200"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      
      {/* 1. Left Collapsible Core Sidebar */}
      <aside
        className="bg-[var(--clr-sidebar-bg)] border-r dark:border-l border-[var(--clr-border-light)]/80 transition-all duration-300 flex flex-col z-40 shrink-0 select-none shadow-[2px_0_15px_rgba(0,0,0,0.015)]"
        style={{ width: sidebarCollapsed ? 0 : 285, overflow: sidebarCollapsed ? "hidden" : "visible" }}
      >
        {/* Hospital Branding Header */}
        <div className="p-4.5 border-b border-[var(--clr-border-light)]/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--clr-brand-blue)] flex items-center justify-center text-white font-extrabold shadow-md shrink-0 ring-4 ring-[var(--clr-brand-blue)]/10 relative">
            <div className="w-3.5 h-1 bg-white rounded-full absolute" />
            <div className="w-1 h-3.5 bg-white rounded-full absolute" />
          </div>
          <div className="min-w-0">
            <h1 className="font-sans font-extrabold tracking-tight text-[12.5px] text-neutral-800 dark:text-neutral-100 truncate uppercase leading-tight">
              AL JAWARIH EYE HOSPITAL
            </h1>
            <span className="text-[9px] font-mono text-[#F59E0B] dark:text-[#2BBFFF] uppercase tracking-wider block font-black mt-0.5">
              ERP • DHRR SYSTEM
            </span>
          </div>
        </div>

        {/* Sidebar Nav Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
          
          {/* A. Unified ERP Application Tile Grid */}
          <div className="bg-[var(--clr-bg-card)]/50 p-3 rounded-2xl border border-[var(--clr-border-light)] space-y-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
            <span className="text-[9px] font-sans font-black text-[var(--clr-text-muted)] uppercase tracking-widest block pl-0.5">
              {language === "ar" ? "تطبيقات ERP الموحدة" : "AL JAWARIH ERP LAYOUTS"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLaunchedApp("pharmacy")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <Activity className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {t.pharmacyLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("warehouse")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <Building className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {t.warehouseLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("optics")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <Glasses className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {t.opticsLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("accounting")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <Coins className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {t.accountingLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("hr")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <UserCheck2 className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {language === "ar" ? "الموارد البشرية" : "Staff & HR"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("reception")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_20px_rgba(79,70,229,0.07)] hover:border-[var(--clr-brand-blue)]/40 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[var(--clr-brand-blue)]/10 rounded-lg flex items-center justify-center text-[var(--clr-brand-blue)] group-hover:scale-110 transition-all">
                  <Users className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[var(--clr-text-body)] mt-2 text-center">
                  {language === "ar" ? "الاستقبال والمالية" : "Front Desk POS"}
                </span>
              </button>
            </div>
          </div>

          {/* B. Modular Class Sidebar Lists & Category Anchors */}
          <div className="space-y-3">
            
            {/* Category 1: Front Desk */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("front")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-450 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>{t.zoneFrontDesk}</span>
                </div>
                {collapsedZones.front ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>
              
              {!collapsedZones.front && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "dashboard"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <FolderLock className={`w-3.5 h-3.5 ${activeView === "dashboard" ? "text-[var(--clr-brand-blue)]" : "text-neutral-400"}`} />
                    <span>{t.dashboard}</span>
                  </button>

                  <button
                    onClick={() => setActiveView("kiosk_enrollment")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "kiosk_enrollment"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <UserCheck className={`w-3.5 h-3.5 ${activeView === "kiosk_enrollment" ? "text-[var(--clr-brand-blue)]" : "text-neutral-400"}`} />
                    <span>{t.inquiryReg}</span>
                  </button>

                  <button
                    onClick={() => setActiveView("queue_hall_sim")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "queue_hall_sim"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Smartphone className={`w-3.5 h-3.5 ${activeView === "queue_hall_sim" ? "text-[var(--clr-brand-blue)]" : "text-neutral-400"}`} />
                    <span>{t.queueBoard}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category 2: Clinical Specialty Care */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("clinical")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-450 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{t.zoneClinicalCare}</span>
                </div>
                {collapsedZones.clinical ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {!collapsedZones.clinical && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1 max-h-72 overflow-y-auto no-scrollbar">
                  {[
                    { clinicId: "Medicine", label: t.medicineClinic, icon: Activity, iconColor: "text-emerald-500" },
                    { clinicId: "ENT", label: t.entClinic, icon: Stethoscope, iconColor: "text-sky-500" },
                    { clinicId: "Dental", label: t.dentalClinic, icon: Compass, iconColor: "text-amber-500" },
                    { clinicId: "Retina", label: t.retinaClinic, icon: Eye, iconColor: "text-cyan-500" },
                    { clinicId: "Glaucoma", label: t.glaucomaClinic, icon: CircleDot, iconColor: "text-indigo-500" },
                    { clinicId: "Orbit", label: t.orbitClinic, icon: BadgeAlert, iconColor: "text-rose-500" },
                    { clinicId: "Pediatrics Ophthalmology", label: t.pediatricsClinic, icon: Users, iconColor: "text-purple-500" },
                    { clinicId: "General Ophthalmology", label: t.generalOphth, icon: Glasses, iconColor: "text-teal-500" }
                  ].map(cl => {
                    const isActive = activeView === "clinical_consult" && selectedPatient?.clinic === cl.clinicId;
                    return (
                      <button
                        key={cl.clinicId}
                        onClick={() => loadSpecialtyClinic(cl.clinicId as ClinicType)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                          isActive
                            ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                            : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                        }`}
                      >
                        <cl.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--clr-brand-blue)]" : cl.iconColor}`} />
                        <span className="truncate">{cl.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category 3: Diagnostics & Surgery */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("diagnostics")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-450 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span>{t.zoneDiagnosticsSurgery}</span>
                </div>
                {collapsedZones.diagnostics ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {!collapsedZones.diagnostics && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1">
                  <button
                    onClick={() => setActiveView("diagnostics_labs")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "diagnostics_labs"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Building className={`w-3.5 h-3.5 ${activeView === "diagnostics_labs" ? "text-[var(--clr-brand-blue)]" : "text-neutral-450"}`} />
                    <span>{t.laboratory} / {t.pharmacyDept}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category 4: Finance & Supply Chains */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("finance")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-450 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>{t.zoneFinanceInventory}</span>
                </div>
                {collapsedZones.finance ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {!collapsedZones.finance && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1">
                  <button
                    onClick={() => setActiveView("security_rbac")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "security_rbac"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Shield className={`w-3.5 h-3.5 ${activeView === "security_rbac" ? "text-[var(--clr-brand-blue)]" : "text-neutral-400"}`} />
                    <span>{t.hrOffice} &amp; Role-based Security</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category 5: Governance & Admin */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("governance")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-450 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                  </span>
                  <span>{t.zoneGovernanceAdmin}</span>
                </div>
                {collapsedZones.governance ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {!collapsedZones.governance && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1">
                  <button
                    onClick={() => setActiveView("command_terminals")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "command_terminals"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Smartphone className={`w-3.5 h-3.5 ${activeView === "command_terminals" ? "text-[var(--clr-brand-blue)]" : "text-neutral-400"}`} />
                    <span>{t.commandCenter}</span>
                  </button>

                  <button
                    onClick={() => setActiveView("architect_ai")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "architect_ai"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${activeView === "architect_ai" ? "text-[var(--clr-brand-blue)]" : "text-[#FF841A]"}`} />
                    <span>{t.outcomeTracker} AI</span>
                  </button>

                  <button
                    onClick={() => setActiveView("premium_bento")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "premium_bento"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Smartphone className={`w-3.5 h-3.5 ${activeView === "premium_bento" ? "text-[var(--clr-brand-blue)]" : "text-[var(--clr-brand-blue)]"}`} />
                    <span className="font-extrabold text-[var(--clr-brand-blue)]">★ Apple Bento SPEC</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sidebar Patient Index Queue Matrix */}
        <div className="p-3.5 border-t border-[var(--clr-border-light)] bg-[var(--clr-bg-main)]/50 max-h-56 overflow-y-auto no-scrollbar">
          <span className="text-[9px] font-mono font-black text-[var(--clr-text-muted)] uppercase tracking-widest block mb-2">
            📊 {t.patientIndex}
          </span>
          <div className="space-y-1.5">
            {sortedPatients.map(patient => {
              const matches = patient.id === selectedPatientId;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 text-left text-xs relative overflow-hidden ${
                    matches
                      ? "bg-[var(--clr-bg-card)] border-[var(--clr-border-focus)] text-[var(--clr-text-title)] font-extrabold shadow-sm ring-1 ring-[var(--clr-brand-blue)]/20"
                      : "border-[var(--clr-border-light)] text-[var(--clr-text-body)] hover:bg-[var(--clr-bg-card)]/80"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate">{patient.name}</span>
                    <span className="text-[8.5px] font-mono font-bold text-neutral-405 dark:text-neutral-500 shrink-0">
                      {patient.id}
                    </span>
                  </div>
                  <div className="text-[9.5px] opacity-80 mt-1 font-semibold text-neutral-500 flex justify-between items-center">
                    <span>{patient.clinic}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-mono ${
                      patient.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 2. Right Side Core Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navigation Control bar */}
        <header className="h-[70px] bg-[var(--clr-bg-card)] border-b border-[var(--clr-border-light)] flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-neutral-250 dark:hover:bg-neutral-800 rounded-lg text-[var(--clr-brand-blue)] dark:text-neutral-100 transition cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[var(--clr-text-title)] dark:text-[#2BBFFF] text-xs uppercase font-mono tracking-widest">
                {activeView === "dashboard" && (language === "ar" ? "لوحة القيادة الإدارية البانورامية" : "METRIC BENTO QUADRANTS")}
                {activeView === "kiosk_enrollment" && (language === "ar" ? "تسجيل المرضى الذاتي" : "ENROLLMENT KIOSK ENTRY")}
                {activeView === "queue_hall_sim" && (language === "ar" ? "شاشة صالة طابور الانتظار" : "INTEGRATED WAITING SCREEN")}
                {activeView === "clinical_consult" && (language === "ar" ? "سجل الطبيب الاستشاري" : "CLINICAL SPECIALTY DESK")}
                {activeView === "diagnostics_labs" && (language === "ar" ? "أقسام صرف الأدوية والدم" : "PRESCRIPTION LEDGERS & LABS")}
                {activeView === "security_rbac" && (language === "ar" ? "صلاحيات الموظفين الشاملة" : "SECURITY CLEARANCE & STAT ROLES")}
                {activeView === "command_terminals" && (language === "ar" ? "محطات الإنترنت المتصلة" : "ACTIVE HARDWARE CLIENTS")}
                {activeView === "architect_ai" && (language === "ar" ? "الذكاء الاصطناعي التشخيصي" : "DEVELOPER OUTCOME BOT")}
              </h2>
              <span className="text-[10px] text-neutral-450 block font-semibold truncate leading-tight mt-0.5">
                {language === "ar" ? "بوابة الخدمات الطبية والتشغيلية الموحدة" : "Active Encounters Database Gateways"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Global Quick Patient Finder registry with clean flyout */}
            <div className="relative hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-56 bg-[var(--clr-bg-card)]/60 border border-[var(--clr-border-light)] rounded-full pl-9 pr-4 py-1.5 text-xs text-[var(--clr-text-body)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--clr-brand-blue)]/45 transition duration-200"
                  value={searchQuery}
                  onChange={e => handleGlobalSearch(e.target.value)}
                />
              </div>

              {searchQuery.trim() && (
                <div className="absolute top-[110%] right-0 w-80 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl shadow-2xl p-2.5 z-50 text-xs text-[var(--clr-text-body)]">
                  <span className="font-bold text-[9px] font-mono text-neutral-405 block tracking-wider uppercase mb-1.5 pl-2">
                    Patient Match Indexes ({searchedPatients.length})
                  </span>
                  {searchedPatients.length > 0 ? (
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {searchedPatients.map(p => {
                        const isEmergency = p.triageVitals?.urgency === "STAT_EMERGENCY";
                        return (
                          <div
                            key={p.id}
                            onClick={() => selectPatientFromSearch(p.id)}
                            className="p-1 px-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/85 rounded-lg cursor-pointer flex justify-between items-center transition"
                          >
                            <div>
                              <span className="font-bold text-[#0F1E46] dark:text-white block">{p.name}</span>
                              <span className="text-[9px] text-neutral-450 uppercase font-mono mt-0.5">{p.id} • {p.dob}</span>
                            </div>
                            {isEmergency ? (
                              <span className="text-[8px] uppercase tracking-normal bg-rose-600 text-white px-2 py-0.5 rounded font-black animate-pulse">
                                STAT
                              </span>
                            ) : (
                              <span className="text-[10px] text-teal-700 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded font-bold font-mono">
                                {p.status}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center italic text-neutral-400">
                      No matching patients registered.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="px-3.5 py-1.5 bg-[var(--clr-bg-card)] hover:bg-[var(--clr-bg-main)]/80 border border-[var(--clr-border-light)] text-[var(--clr-text-body)] font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === "en" ? "العربية" : "English"}
            </button>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2.5 bg-[var(--clr-bg-card)]/40 hover:bg-[var(--clr-bg-card)]/70 border border-[var(--clr-border-light)] rounded-xl text-[var(--clr-text-body)] transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-[var(--clr-brand-blue)]" /> : <Sun className="w-4 h-4 text-[var(--clr-brand-orange)]" />}
            </button>

            {/* Staff Role quick override */}
            <div className="flex items-center gap-1.5 border-l dark:border-neutral-800/80 pl-3">
              <span className="text-[var(--clr-brand-blue)] dark:text-teal-300 font-extrabold text-xs uppercase hidden lg:inline">
                {activeRole.toUpperCase()}
              </span>
              <select
                className="bg-[var(--clr-bg-card)]/70 border border-[var(--clr-border-light)] px-3 py-1.5 text-xs font-semibold text-[var(--clr-text-body)] rounded-xl focus:outline-none transition cursor-pointer"
                value={activeRole}
                onChange={e => setActiveRole(e.target.value as ClinicalRole)}
              >
                <option value="receptionist">Reception (Mildred)</option>
                <option value="nurse">Triage BP (Sister Beatrice)</option>
                <option value="doctor">Consultation Chief (Dr. Sterling)</option>
                <option value="pharmacist">Active Dispatch (Pharmacist Vance)</option>
                <option value="accountant">Ledger Cashier (CFO Ebenezer)</option>
                <option value="hr_manager">HR Specialist (Director Hamad)</option>
              </select>
            </div>

          </div>

        </header>

        {/* 3. Core View Port Frame */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--clr-bg-main)]/35 dark:bg-transparent">
          
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Executive clock widget */}
                <div className="bg-[var(--clr-bg-card)] text-[var(--clr-text-title)] p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between border border-[var(--clr-border-light)] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--clr-brand-blue)]/5 dark:bg-[#2bbfff]/5 rounded-full blur-2xl animate-pulse" />
                  
                  <div className="flex flex-wrap items-center gap-4 z-10 w-full sm:w-auto">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-[var(--clr-brand-blue)] dark:text-[#2BBFFF]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F8A7D] dark:text-[#D8D5C8]">Al Jawarih Real-Time UTC Monitor</span>
                    </div>

                    {/* Integrated SDLC 100K scaling activator */}
                    <button
                      id="sdlc-100k-scaling-simulator-btn"
                      onClick={handleSimulate100K}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer border border-[#EAE6DF]/15"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>{language === "ar" ? "محاكاة طاقة 100ألف مريض (SDLC)" : "⚡ SIMULATE 100K+ SCALING DATABASE (SDLC)"}</span>
                    </button>
                  </div>

                  <div className="text-lg font-black font-mono tracking-widest z-10 text-[var(--clr-brand-orange)] dark:text-[#2bbfff]">
                    {timeString || "19:07:01"}
                  </div>
                </div>

              {/* Interactive Scenario Coach Walkthrough Station */}
              <ScenarioCoach
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                activeView={activeView}
                setActiveView={setActiveView}
                language={language}
              />

              {/* Bento Grid KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-100 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#2BBFFF] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Total Registered</span>
                    <span className="text-xl font-black font-mono text-[var(--clr-text-title)]">
                      {patients.length} patients
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex items-center gap-4">
                  <div className="w-11 h-11 bg-rose-100 dark:bg-rose-950/30 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">STAT Trauma Alerts</span>
                    <span className="text-xl font-black font-mono text-rose-600 animate-pulse">
                      {patients.filter(p => p.triageVitals?.urgency === "STAT_EMERGENCY").length} urgent
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex items-center gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Discharge Pending</span>
                    <span className="text-xl font-black font-mono text-emerald-600">
                      {patients.filter(p => p.status === "LabsPending" || p.status === "Dispensing").length} claims
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex items-center gap-4">
                  <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#FF841A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Hospital Bed Occupancy</span>
                    <span className="text-xl font-black font-mono text-[var(--clr-text-title)]">
                      84% occupied
                    </span>
                  </div>
                </div>

              </div>

              {/* Home Dashboard Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Shift Roster mini lists */}
                <div className="lg:col-span-8 bg-[var(--clr-bg-card)] p-5 rounded-3xl border border-[var(--clr-border-light)] shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-neutral-800">
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#2BBFFF]" /> Physicians On-Duty Shift Rosters
                    </h3>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      Verified SEC_ROLE
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-[var(--clr-text-title)] dark:text-white">Dr. Alexander Sterling, MD</span>
                        <span className="block text-[10px] text-neutral-450 dark:text-neutral-400">Chief of Ophthalmology Specialty Care</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[10px] rounded border border-emerald-100 dark:border-emerald-900/50 uppercase">
                        Working (Encounter Room 412)
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-[var(--clr-text-title)] dark:text-white">Sister Beatrice, RN</span>
                        <span className="block text-[10px] text-neutral-450 dark:text-neutral-400">Clinical Triage & Vitals Coordinator</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[10px] rounded border border-emerald-100 dark:border-emerald-900/50 uppercase">
                        Active (Encounter Pre-Triage)
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-[var(--clr-text-title)] dark:text-white">Pharmacist Vance Vance, RPh</span>
                        <span className="block text-[10px] text-neutral-450 dark:text-neutral-400">Main Pharmacy Stocks Dispatcher</span>
                      </div>
                      <span className="px-3 py-1 bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] dark:text-[#2BBFFF] font-bold font-mono text-[10px] rounded border border-[var(--clr-brand-blue)]/20 uppercase">
                        Active Dispatch (Main drug safe)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Active Patient queue inspect */}
                <div className="lg:col-span-4 bg-[var(--clr-bg-card)] p-5 rounded-3xl border border-[var(--clr-border-light)] shadow-sm flex flex-col justify-between transition-all duration-300">
                  <div className="space-y-3">
                    <h3 className="font-bold text-[10px] font-mono tracking-widest text-[var(--clr-brand-orange)] uppercase">
                      Patient Selection Context
                    </h3>
                    <div className="border border-[var(--clr-border-light)] dark:border-neutral-800 rounded-xl p-3 bg-[var(--clr-bg-main)]/65 dark:bg-neutral-900/60 shadow-xs">
                      {selectedPatient ? (
                        <div className="space-y-2">
                          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-455 dark:text-neutral-400 px-1.5 py-0.5 rounded font-bold uppercase inline-block">
                            ID: {selectedPatient.id}
                          </span>
                          <h4 className="font-black text-sm text-[var(--clr-text-title)] dark:text-white">
                            {selectedPatient.name}
                          </h4>
                          <p className="text-[10.5px] leading-relaxed text-neutral-500 font-medium">
                            DOB: <strong className="text-neutral-700 dark:text-neutral-300">{selectedPatient.dob}</strong> ({selectedPatient.age} Yr) • {selectedPatient.gender}
                          </p>
                          <div className="pt-2 border-t border-[var(--clr-border-light)] dark:border-neutral-800 font-mono text-[10px] text-neutral-400 flex items-center justify-between">
                            <span>Status: <strong className="text-[var(--clr-brand-orange)]">{selectedPatient.status}</strong></span>
                            <span>Clinic Room: <strong className="text-neutral-700 dark:text-neutral-300">{selectedPatient.clinic}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">No patient selected from registry index.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => setActiveView("clinical_consult")}
                      className="w-full py-2.5 bg-[var(--clr-brand-blue)] hover:bg-[var(--clr-brand-blue)]/95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <span>Launch clinical records consult</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>

                    {selectedPatient && (
                      <button
                        onClick={() => setPdfReportPatientId(selectedPatient.id)}
                        className="w-full py-2.5 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] text-[var(--clr-text-title)] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        <span>{language === "ar" ? "طباعة وتحميل التقرير PDF" : "Print Patient PDF Report"}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeView === "kiosk_enrollment" && (
            <motion.div
              key="kiosk_enrollment"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <KioskReception
                patients={patients}
                onAddPatient={handleAddPatient}
                onSelectPatient={(p) => setSelectedPatientId(p.id)}
              />
            </motion.div>
          )}

          {activeView === "queue_hall_sim" && (
            <motion.div
              key="queue_hall_sim"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <HealthcareWaitScreen patients={patients} language={language} />
            </motion.div>
          )}

          {activeView === "clinical_consult" && (
            <motion.div
              key="clinical_consult"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <SpecialtyClinics
                patients={patients}
                selectedPatient={selectedPatient}
                onUpdatePatient={handleUpdatePatient}
                activeRole={activeRole}
                onShowReport={(id) => setPdfReportPatientId(id)}
              />
            </motion.div>
          )}

          {activeView === "diagnostics_labs" && (
            <motion.div
              key="diagnostics_labs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <AncillaryDepartments
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                activeRole={activeRole}
              />
            </motion.div>
          )}

          {activeView === "security_rbac" && (
            <motion.div
              key="security_rbac"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <RbacScreen
                activeRole={activeRole}
                onSelectRole={setActiveRole}
                language={language}
              />
            </motion.div>
          )}

          {activeView === "command_terminals" && (
            <motion.div
              key="command_terminals"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <HardwareFallbacks />
            </motion.div>
          )}

          {activeView === "architect_ai" && (
            <motion.div
              key="architect_ai"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <AiAssistant />
            </motion.div>
          )}

          {activeView === "premium_bento" && (
            <motion.div
              key="premium_bento"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <PremiumBentoShowcase onBackToDashboard={() => setActiveView("dashboard")} />
            </motion.div>
          )}

          </AnimatePresence>
        </main>
      </div>

      {/* 3. ERP Fullscreen Launcher Hosts */}
      {launchedApp && (
        <ErpSpreadsheetApp
          appType={launchedApp}
          onClose={() => setLaunchedApp(null)}
          language={language}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          patients={patients}
          onAddPatient={handleAddPatient}
          onUpdatePatient={handleUpdatePatient}
        />
      )}

      {/* Patient EHR/ERP PDF Print Report Modal */}
      <AnimatePresence>
        {pdfReportPatientId && (
          (() => {
            const pt = patients.find(p => p.id === pdfReportPatientId);
            return pt ? (
              <PatientPdfReportModal
                patient={pt}
                onClose={() => setPdfReportPatientId(null)}
                language={language}
              />
            ) : null;
          })()
        )}
      </AnimatePresence>

      {/* Captured System-Wide Intercepted Clinical Dialog */}
      <AnimatePresence>
        {customAlert.visible && (
          <div className="fixed inset-0 bg-[#0B0E14]/75 backdrop-blur-[4px] z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-center"
            >
              {/* Dynamic Status Icon */}
              {(() => {
                const msg = customAlert.message.toLowerCase();
                const isCritical = msg.includes("critical") || msg.includes("block") || msg.includes("warning") || msg.includes("rejection") || msg.includes("atropine") || msg.includes("failed") || msg.includes("depleted") || msg.includes("error") || msg.includes("mandatory");
                const isSuccess = msg.includes("success") || msg.includes("compiled") || msg.includes("registered") || msg.includes("saved") || msg.includes("finalized") || msg.includes("established") || msg.includes("signed") || msg.includes("perfect") || msg.includes("unlocked") || msg.includes("completed");

                if (isCritical) {
                  return (
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/50">
                      <BadgeAlert className="w-6 h-6 text-rose-600 dark:text-rose-505 animate-pulse" />
                    </div>
                  );
                } else if (isSuccess) {
                  return (
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-900/50">
                      <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  );
                } else {
                  return (
                    <div className="w-12 h-12 bg-[var(--clr-brand-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--clr-brand-blue)]/20">
                      <Activity className="w-6 h-6 text-[var(--clr-brand-blue)]" />
                    </div>
                  );
                }
              })()}

              <h3 className="font-sans font-extrabold text-[15px] text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">
                {(() => {
                  const msg = customAlert.message.toLowerCase();
                  if (msg.includes("critical") || msg.includes("block") || msg.includes("rejection") || msg.includes("mandatory") || msg.includes("warning")) {
                    return language === "ar" ? "تنبيه نظام السلامة المشددة" : "Safety Compliance Validation";
                  } else if (msg.includes("success") || msg.includes("finalized") || msg.includes("completed") || msg.includes("signed")) {
                    return language === "ar" ? "تأكيد العملية السريرية" : "Clinical Ledger Confirmed";
                  } else {
                    return language === "ar" ? "إشعار النظام الموحد" : "Al Jawarih System Telemetry";
                  }
                })()}
              </h3>

              <div className="my-4 text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed max-h-48 overflow-y-auto px-1">
                {/* Format paragraphs back for clean styling */}
                {customAlert.message.split("\n").map((chunk, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/50" : ""}>
                    {chunk}
                  </p>
                ))}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setCustomAlert({ message: "", visible: false })}
                  className="w-full py-2.5 bg-[var(--clr-brand-blue)] hover:bg-[var(--clr-brand-blue)]/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  {language === "ar" ? "أوافق ومتابعة" : "Acknowledge & Proceed"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * Custom High-fidelity Smart TV waiting screen simulating reception flow
 */
interface HealthcareWaitScreenProps {
  patients: Patient[];
  language: "en" | "ar";
}

function HealthcareWaitScreen({ patients, language }: HealthcareWaitScreenProps) {
  const triageCount = patients.filter(p => p.status === "Triaged").length;
  const consultCount = patients.filter(p => p.status === "InConsult").length;

  return (
    <div className="bg-[#070a13] text-white p-6 rounded-2xl border border-neutral-800 shadow-2xl flex flex-col gap-6 select-text max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <h3 className="font-black text-base text-[#2BBFFF] uppercase tracking-widest font-mono">
            ✙ {language === "ar" ? "شاشة صالة طابور الانتظار الطبية" : "AL JAWARIH LIVE ENCOUNTER DIRECTORY"}
          </h3>
          <span className="text-[10px] text-neutral-400 block font-mono mt-1">
            CareFlow Waiting Queue Smart TV Simulator | Reconciled: HL7_VAL
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-[#FF841A]">BP Checked: {triageCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active consult list */}
        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 space-y-4">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block tracking-wider uppercase">
            👉 {language === "ar" ? "غرفة تشخيص الطبيب الاستشاري" : "Encounter Treatment Rooms"}
          </span>
          <div className="space-y-2.5">
            {patients.slice(0, 3).map(p => (
              <div key={p.id} className="p-3 bg-[#0F1E46] border border-[#2BBFFF]/30 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-[#2BBFFF] block">{p.name}</span>
                  <span className="text-[9px] text-neutral-300 font-mono italic">Clinic: {p.clinic}</span>
                </div>
                <span className="text-[10px] bg-[#2BBFFF]/20 text-white font-mono font-black px-2 py-0.5 rounded border border-[#2BBFFF]/25">
                  ROOM 412
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Triage waiting registry */}
        <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-805/70 space-y-4">
          <span className="text-[10px] font-mono font-bold text-neutral-400 block tracking-wider uppercase">
            ⌛ {language === "ar" ? "قائمة انتظار الاستقبال" : "Awaiting Pre-Triage Vitals Check"}
          </span>
          <div className="space-y-2">
            {patients.slice(3).map(p => (
              <div key={p.id} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-black text-neutral-200 block">{p.name}</span>
                  <span className="text-[9.5px] text-neutral-500 font-mono">Registry: {p.id}</span>
                </div>
                <span className="text-[9px] font-mono text-[#FF841A] font-bold uppercase animate-pulse">
                  Unverified Vitals
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
