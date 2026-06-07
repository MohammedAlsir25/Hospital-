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

export default function App() {
  // Global Workspace Environments
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PAT-001");
  const [activeRole, setActiveRole] = useState<ClinicalRole>("doctor");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Nav views & App launchers
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [launchedApp, setLaunchedApp] = useState<"pharmacy" | "warehouse" | "optics" | "accounting" | null>(null);

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

  const handleGlobalSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchedPatients([]);
      return;
    }
    const query = val.toLowerCase();
    const filtered = patients.filter(
      p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
    );
    setSearchedPatients(filtered);
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
        className="bg-[var(--clr-sidebar-bg)] dark:bg-[#12141F] border-r dark:border-l border-neutral-300 dark:border-neutral-800 transition-all duration-300 flex flex-col z-40 shrink-0 select-none"
        style={{ width: sidebarCollapsed ? 0 : 285, overflow: sidebarCollapsed ? "hidden" : "visible" }}
      >
        {/* Hospital Branding Header */}
        <div className="p-4 border-b border-neutral-350 dark:border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F1E46] dark:bg-[#2BBFFF] flex items-center justify-center text-white dark:text-[#0F1E46] font-black shadow-md shrink-0">
            ✙
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold tracking-tight text-sm text-[#0F1E46] dark:text-neutral-100 truncate uppercase">
              {t.hospitalName}
            </h1>
            <span className="text-[10px] font-mono text-[#FF841A] uppercase tracking-wider block font-bold mt-0.5">
              ERP + EMR System
            </span>
          </div>
        </div>

        {/* Sidebar Nav Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* A. Dynamic Big Launcher Grid (Phase 43) */}
          <div className="bg-[#E5DFCE]/40 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-[#D5CBB9] dark:border-neutral-800/80 space-y-2">
            <span className="text-[9px] font-mono font-black text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block pl-1">
              {language === "ar" ? "تطبيقات ERP الموحدة" : "AL JAWARIH ERP LAUNCHERS"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLaunchedApp("pharmacy")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-[var(--clr-bg-card)] dark:bg-[#151824] hover:border-[#2BBFFF] dark:hover:border-[#2BBFFF] hover:shadow-lg transition group cursor-pointer"
              >
                <div className="w-9 h-9 bg-emerald-50 dark:bg-[#2BBFFF]/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-[#2BBFFF] group-hover:scale-110 transition">
                  <Activity className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[#0F1E46] dark:text-neutral-200 mt-2 text-center">
                  {t.pharmacyLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("warehouse")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-[var(--clr-bg-card)] dark:bg-[#151824] hover:border-[#2BBFFF] dark:hover:border-[#2BBFFF] hover:shadow-lg transition group cursor-pointer"
              >
                <div className="w-9 h-9 bg-sky-50 dark:bg-[#2BBFFF]/10 rounded-full flex items-center justify-center text-sky-600 dark:text-[#2BBFFF] group-hover:scale-110 transition">
                  <Building className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[#0F1E46] dark:text-neutral-200 mt-2 text-center">
                  {t.warehouseLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("optics")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-[var(--clr-bg-card)] dark:bg-[#151824] hover:border-[#2BBFFF] dark:hover:border-[#2BBFFF] hover:shadow-lg transition group group cursor-pointer"
              >
                <div className="w-9 h-9 bg-purple-50 dark:bg-[#2BBFFF]/10 rounded-full flex items-center justify-center text-purple-600 dark:text-[#2BBFFF] group-hover:scale-110 transition">
                  <Glasses className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[#0F1E46] dark:text-neutral-200 mt-2 text-center">
                  {t.opticsLauncher}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLaunchedApp("accounting")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-[var(--clr-bg-card)] dark:bg-[#151824] hover:border-[#2BBFFF] dark:hover:border-[#2BBFFF] hover:shadow-lg transition group cursor-pointer"
              >
                <div className="w-9 h-9 bg-amber-50 dark:bg-[#2BBFFF]/10 rounded-full flex items-center justify-center text-amber-600 dark:text-[#2BBFFF] group-hover:scale-110 transition">
                  <Coins className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-[#0F1E46] dark:text-neutral-200 mt-2 text-center">
                  {t.accountingLauncher}
                </span>
              </button>
            </div>
          </div>

          {/* B. Six Left Side Sidebar Group Zones */}
          <div className="space-y-2">
            
            {/* Zone 1: Front Desk */}
            <div>
              <button
                onClick={() => toggleZone("front")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>{t.zoneFrontDesk}</span>
                </div>
                {collapsedZones.front ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {!collapsedZones.front && (
                <div className="mt-1 pl-3 pr-3 space-y-1 border-l dark:border-neutral-800 ml-1.5 mr-1.5">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "dashboard" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <FolderLock className="w-3.5 h-3.5" />
                    <span>{t.dashboard}</span>
                  </button>
                  <button
                    onClick={() => setActiveView("kiosk_enrollment")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "kiosk_enrollment" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t.inquiryReg}</span>
                  </button>
                  <button
                    onClick={() => setActiveView("queue_hall_sim")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "queue_hall_sim" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t.queueBoard}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Zone 2: Clinical Care */}
            <div>
              <button
                onClick={() => toggleZone("clinical")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>{t.zoneClinicalCare}</span>
                </div>
                {collapsedZones.clinical ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {!collapsedZones.clinical && (
                <div className="mt-1 pl-3 pr-3 space-y-1 border-l dark:border-neutral-800 ml-1.5 mr-1.5">
                  <button
                    onClick={() => loadSpecialtyClinic("Medicine")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.medicineClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("ENT")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.entClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("Dental")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.dentalClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("Retina")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{t.retinaClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("Glaucoma")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <CircleDot className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t.glaucomaClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("Orbit")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <BadgeAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.orbitClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("Pediatrics Ophthalmology")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>{t.pediatricsClinic}</span>
                  </button>
                  <button
                    onClick={() => loadSpecialtyClinic("General Ophthalmology")}
                    className="w-full text-left p-1.5 rounded text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 flex items-center gap-2"
                  >
                    <Glasses className="w-3.5 h-3.5 text-teal-500" />
                    <span>{t.generalOphth}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Zone 3: Diagnostics & Surgery */}
            <div>
              <button
                onClick={() => toggleZone("diagnostics")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>{t.zoneDiagnosticsSurgery}</span>
                </div>
                {collapsedZones.diagnostics ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {!collapsedZones.diagnostics && (
                <div className="mt-1 pl-3 pr-3 space-y-1 border-l dark:border-neutral-800 ml-1.5 mr-1.5">
                  <button
                    onClick={() => setActiveView("diagnostics_labs")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "diagnostics_labs" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Building className="w-3.5 h-3.5 text-[#2BBFFF]" />
                    <span>{t.laboratory} / {t.pharmacyDept}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Zone 5: Finance & Operations */}
            <div>
              <button
                onClick={() => toggleZone("finance")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{t.zoneFinanceInventory}</span>
                </div>
                {collapsedZones.finance ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {!collapsedZones.finance && (
                <div className="mt-1 pl-3 pr-3 space-y-1 border-l dark:border-neutral-800 ml-1.5 mr-1.5">
                  <button
                    onClick={() => setActiveView("security_rbac")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "security_rbac" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.hrOffice} &amp; Role-based Security</span>
                  </button>
                </div>
              )}
            </div>

            {/* Zone 6: Governance & Admin */}
            <div>
              <button
                onClick={() => toggleZone("governance")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span>{t.zoneGovernanceAdmin}</span>
                </div>
                {collapsedZones.governance ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {!collapsedZones.governance && (
                <div className="mt-1 pl-3 pr-3 space-y-1 border-l dark:border-neutral-800 ml-1.5 mr-1.5">
                  <button
                    onClick={() => setActiveView("command_terminals")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "command_terminals" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t.commandCenter}</span>
                  </button>
                  <button
                    onClick={() => setActiveView("architect_ai")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "architect_ai" ? "bg-[#0F1E46] text-[#2BBFFF]" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF841A]" />
                    <span>{t.outcomeTracker} AI</span>
                  </button>
                  <button
                    onClick={() => setActiveView("premium_bento")}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-semibold flex items-center gap-2 ${activeView === "premium_bento" ? "bg-[#0066FF] text-white" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span className="text-[#0066FF] dark:text-[#0ea5e9] font-black">★ Apple Bento SPEC</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sidebar Patient Index Queue Matrix */}
        <div className="p-3 border-t border-[#D5CBB9] dark:border-neutral-800/80 bg-[#E5DFCE]/30 dark:bg-neutral-900/40 max-h-56 overflow-y-auto">
          <span className="text-[9px] font-mono font-black text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-2">
            📊 {t.patientIndex}
          </span>
          <div className="space-y-1.5">
            {sortedPatients.map(patient => {
              const matches = patient.id === selectedPatientId;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-2 rounded-xl border cursor-pointer transition text-left text-[11px] relative overflow-hidden ${
                    matches
                      ? "bg-[var(--clr-bg-card)] dark:bg-neutral-900 border-[#2BBFFF] text-[#0F1E46] dark:text-[#2BBFFF] font-bold shadow-xs"
                      : "border-neutral-300/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-[var(--clr-bg-card)]/80 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{patient.name}</span>
                    <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase">
                      {patient.id}
                    </span>
                  </div>
                  <div className="text-[9px] opacity-75 mt-0.5 font-semibold text-neutral-500">
                    {patient.clinic} • {patient.status}
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
        <header className="h-[70px] bg-[#F5F1EA] dark:bg-[#151824] border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-neutral-250 dark:hover:bg-neutral-800 rounded-lg text-[#0F1E46] dark:text-neutral-100 transition cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[#0F1E46] dark:text-[#2BBFFF] text-xs uppercase font-mono tracking-widest">
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
                  className="w-56 bg-white/60 dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-neutral-800 dark:text-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2BBFFF]/45 transition duration-200"
                  value={searchQuery}
                  onChange={e => handleGlobalSearch(e.target.value)}
                />
              </div>

              {searchQuery.trim() && (
                <div className="absolute top-[110%] right-0 w-80 bg-white dark:bg-[#151824] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-2.5 z-50 text-xs text-[#0F172A] dark:text-neutral-200">
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
              className="px-3.5 py-1.5 bg-white/70 hover:bg-[#FAF9F6] dark:bg-[#1A1E2E] dark:hover:bg-[#23293F] border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === "en" ? "العربية" : "English"}
            </button>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2.5 bg-white/40 hover:bg-white/70 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-200 transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-[#0F1E46]" /> : <Sun className="w-4 h-4 text-[#FF841A]" />}
            </button>

            {/* Staff Role quick override */}
            <div className="flex items-center gap-1.5 border-l dark:border-neutral-800/80 pl-3">
              <span className="text-[#0F1E46] dark:text-teal-300 font-extrabold text-xs uppercase hidden lg:inline">
                {activeRole.toUpperCase()}
              </span>
              <select
                className="bg-white/70 dark:bg-[#1A1E2E] border border-neutral-300 dark:border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-250 rounded-xl focus:outline-none transition cursor-pointer"
                value={activeRole}
                onChange={e => setActiveRole(e.target.value as ClinicalRole)}
              >
                <option value="receptionist">Reception (Mildred)</option>
                <option value="nurse">Triage BP (Sister Beatrice)</option>
                <option value="doctor">Consultation Chief (Dr. Sterling)</option>
                <option value="pharmacist">Active Dispatch (Pharmacist Vance)</option>
                <option value="accountant">Ledger Cashier (CFO Ebenezer)</option>
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
                <div className="bg-[#0f1e46] text-[#2bbfff] p-4 rounded-2xl flex items-center justify-between border border-[#2bbfff]/10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#2bbfff]/5 rounded-full blur-2xl animate-pulse" />
                  <div className="flex items-center gap-2.5 z-10">
                    <Clock className="w-5 h-5 text-[#2BBFFF]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D8D5C8]">Al Jawarih Real-Time UTC Monitor</span>
                  </div>
                  <div className="text-lg font-black font-mono tracking-widest z-10">
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
                
                <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-850 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-100 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#2BBFFF] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Total Registered</span>
                    <span className="text-xl font-black font-mono text-neutral-850 dark:text-white">
                      {patients.length} patients
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-850 shadow-xs flex items-center gap-4">
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

                <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-850 shadow-xs flex items-center gap-4">
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

                <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-850 shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#FF841A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Hospital Bed Occupancy</span>
                    <span className="text-xl font-black font-mono text-neutral-850 dark:text-white">
                      84% occupied
                    </span>
                  </div>
                </div>

              </div>

              {/* Home Dashboard Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Shift Roster mini lists */}
                <div className="lg:col-span-8 bg-[var(--clr-bg-card)] dark:bg-[#121520] p-5 rounded-3xl border border-neutral-200 dark:border-neutral-850 shadow-xs">
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
                        <span className="font-extrabold text-[#0F1E46] dark:text-white">Dr. Alexander Sterling, MD</span>
                        <span className="block text-[10px] text-neutral-400">Chief of Ophthalmology Specialty Care</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold font-mono text-[10px] rounded border border-emerald-100 uppercase">
                        Working (Encounter Room 412)
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-[#0F1E46] dark:text-white">Sister Beatrice, RN</span>
                        <span className="block text-[10px] text-neutral-400">Clinical Triage & Vitals Coordinator</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold font-mono text-[10px] rounded border border-emerald-100 uppercase">
                        Active (Encounter Pre-Triage)
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-[#0F1E46] dark:text-white">Pharmacist Vance Vance, RPh</span>
                        <span className="block text-[10px] text-neutral-400">Main Pharmacy Stocks Dispatcher</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-750 font-bold font-mono text-[10px] rounded border border-blue-105 uppercase">
                        Active Dispatch (Main drug safe)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Active Patient queue inspect */}
                <div className="lg:col-span-4 bg-[var(--clr-bg-card)] dark:bg-[#121520] p-5 rounded-3xl border border-neutral-250 dark:border-neutral-850 shadow-xs flex flex-col justify-between transition-all duration-300">
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-[10px] font-mono tracking-widest text-[#FF841A] uppercase">
                      Patient Selection Context
                    </h3>
                    <div className="border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 bg-[var(--clr-bg-main)]/40 dark:bg-neutral-900/60 shadow-xs">
                      {selectedPatient ? (
                        <div className="space-y-2">
                          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-400 px-1.5 py-0.5 rounded font-bold uppercase inline-block">
                            ID: {selectedPatient.id}
                          </span>
                          <h4 className="font-black text-sm text-[#0F1E46] dark:text-white">
                            {selectedPatient.name}
                          </h4>
                          <p className="text-[10.5px] leading-relaxed text-neutral-500 font-medium">
                            DOB: <strong className="text-neutral-700 dark:text-neutral-300">{selectedPatient.dob}</strong> ({selectedPatient.age} Yr) • {selectedPatient.gender}
                          </p>
                          <div className="pt-2 border-t font-mono text-[10px] text-neutral-400 flex items-center justify-between">
                            <span>Status: <strong className="text-[#FF841A]">{selectedPatient.status}</strong></span>
                            <span>Clinic Room: <strong className="text-neutral-700 dark:text-neutral-300">{selectedPatient.clinic}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">No patient selected from registry index.</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView("clinical_consult")}
                    className="w-full mt-4 py-2.5 bg-[#0F1E46] hover:bg-[#1A2B5E] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition"
                  >
                    <span>Launch clinical records consult</span>
                    <ArrowRight className="w-4 h-4 text-[#2BBFFF]" />
                  </button>
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
        />
      )}

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
