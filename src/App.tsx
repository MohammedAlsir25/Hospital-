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
  Tablet,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  CheckSquare,
  Award,
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
  CircleDot,
  Server,
  Lock,
  Wifi,
  WifiOff,
  RefreshCw,
  History,
  ClipboardList,
  Bell,
  Volume2,
  VolumeX,
  Beaker,
  Palette,
  MessageSquare,
  Megaphone,
  Settings
} from "lucide-react";

import { Patient, ClinicalRole, ClinicType, AppNotification } from "./types";
import { INITIAL_PATIENTS, CLINIC_INFO_MAP } from "./data";
import { TRANSLATIONS } from "./translations";
import { useClinicalPriority } from "./hooks/useClinicalPriority";
import { APP_ICONS_REGISTRY } from "./components/AppBrandIcons";

// EMR Core Sub components
import KioskReception from "./components/KioskReception";
import SpecialtyClinics from "./components/SpecialtyClinics";
import AncillaryDepartments from "./components/AncillaryDepartments";
import RbacScreen from "./components/RbacScreen";
import HardwareFallbacks from "./components/HardwareFallbacks";
import AiAssistant from "./components/AiAssistant";
import ScenarioCoach from "./components/ScenarioCoach";
import OphthalmicNurseWorkstation from "./components/OphthalmicNurseWorkstation";
import OptometryWorkstation from "./components/OptometryWorkstation";
import ItInfrastructureDashboard from "./components/ItInfrastructureDashboard";
import NotificationStack from "./components/NotificationStack";
import ShiftHandoverNotes from "./components/ShiftHandoverNotes";
import SettingsScreen from "./components/SettingsScreen";
import AdminControlTower from "./components/AdminControlTower";
import SmokeTestSimulator from "./components/SmokeTestSimulator";

// ERP Full Screen Apps
import HospitalLoginOverlay from "./components/HospitalLoginOverlay";
import ErpSpreadsheetApp from "./components/ErpSpreadsheetApp";
import TabletApkDownload from "./components/TabletApkDownload";
import ProjectLaunchTodoDashboard from "./components/ProjectLaunchTodoDashboard";
import PatientPdfReportModal from "./components/PatientPdfReportModal";
import HospitalMessagingMesh from "./components/HospitalMessagingMesh";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface AnimatedKpiCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function AnimatedKpiCounter({ value, suffix = "", duration = 1.0 }: AnimatedKpiCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const range = endValue - startValue;

    if (range === 0) {
      setDisplayValue(endValue);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Premium cubic ease-out formula resembling native client transitions
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + easeProgress * range);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

export const DOCTORS_LIST = [
  { selectValue: "doctor_sterling", empId: "EMP-001", name: "Dr. Alexander Sterling", clinic: "Retina" as ClinicType, title: "Chief Retina Surgeon" },
  { selectValue: "doctor_ross", empId: "EMP-007", name: "Dr. Sophia Ross", clinic: "ENT" as ClinicType, title: "ENT Specialist" },
  { selectValue: "doctor_zahrani", empId: "EMP-009", name: "Dr. Khalid Al-Zahrani", clinic: "Dental" as ClinicType, title: "Senior Dentist" },
  { selectValue: "doctor_vance", empId: "EMP-011", name: "Dr. Ryan Vance", clinic: "Glaucoma" as ClinicType, title: "Glaucoma Surgeon" },
  { selectValue: "doctor_oconnor", empId: "EMP-013", name: "Dr. Liam O'Connor", clinic: "Orbit" as ClinicType, title: "Orbit Specialty Consultant" },
  { selectValue: "doctor_bennet", empId: "EMP-015", name: "Dr. Chloe Bennet", clinic: "Pediatrics Ophthalmology" as ClinicType, title: "Pediatric Ophthalmologist" },
  { selectValue: "doctor_farooq", empId: "EMP-017", name: "Dr. Omar Farooq", clinic: "General Ophthalmology" as ClinicType, title: "Ophthalmology Generalist" },
  { selectValue: "doctor_farsi", empId: "EMP-019", name: "Dr. Tariq Al-Farsi", clinic: "Medicine" as ClinicType, title: "Medicine Consultant" }
];

// Dynamic trend helper utilities for Bento Grid's sparklines
const getRegisteredTrends = (currentVal: number) => [
  { hour: "08:00", value: Math.max(0, Math.round(currentVal * 0.70)) },
  { hour: "10:00", value: Math.max(0, Math.round(currentVal * 0.78)) },
  { hour: "12:00", value: Math.max(0, Math.round(currentVal * 0.85)) },
  { hour: "14:00", value: Math.max(0, Math.round(currentVal * 0.93)) },
  { hour: "16:00", value: currentVal },
];

const getTraumaTrends = (currentVal: number) => [
  { hour: "08:00", value: Math.max(0, currentVal - 2) },
  { hour: "10:00", value: Math.max(0, currentVal + 1) },
  { hour: "12:00", value: Math.max(0, currentVal - 1) },
  { hour: "14:00", value: Math.max(0, currentVal + 2) },
  { hour: "16:00", value: currentVal },
];

const getDischargeTrends = (currentVal: number) => [
  { hour: "08:00", value: Math.max(0, Math.round(currentVal * 1.3)) },
  { hour: "10:00", value: Math.max(0, Math.round(currentVal * 0.8)) },
  { hour: "12:00", value: Math.max(0, Math.round(currentVal * 1.1)) },
  { hour: "14:00", value: Math.max(0, Math.round(currentVal * 0.7)) },
  { hour: "16:00", value: currentVal },
];

const getOccupancyTrends = (currentVal: number) => [
  { hour: "08:00", value: 74 },
  { hour: "10:00", value: 81 },
  { hour: "12:00", value: 85 },
  { hour: "14:00", value: 82 },
  { hour: "16:00", value: currentVal },
];

/**
 * Synthesizes high-fidelity hospital chime and lab result alerts natively
 * utilizing HTML5 Web Audio API to bypass external asset load boundaries.
 */
export const playNotificationSound = (type: "lab" | "referral" | "alert" | "system") => {
  try {
    const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioCtxClass) return;
    const audioCtx = new AudioCtxClass();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    if (type === "lab") {
      // Gentle, high-fidelity double digital ping (G5 -> C6)
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(783.99, now); // G5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, now + 0.10); // C6
      gain2.gain.setValueAtTime(0.08, now + 0.10);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.10);
      osc2.stop(now + 0.45);
    } else if (type === "referral") {
      // Classical triple warm hospital door sound (A4 -> E5 -> A5)
      const now = audioCtx.currentTime;
      const freqs = [440.00, 659.25, 880.00];
      
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = "triangle";
        osc.frequency.value = freq;
        
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        
        gain.gain.setValueAtTime(0.06, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } else {
      // Warm system warning note
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (error) {
    console.warn("Web Audio API blocked or not supported yet:", error);
  }
};

interface OfflineSyncTask {
  type: "create" | "update";
  patientId: string;
  patientName: string;
  data: Patient;
  timestamp: string;
  retryCount: number;
}

export default function App() {
  // Global Workspace Environments with automatic offline local storage backups
  const [patients, setPatients] = useState<Patient[]>(() => {
    const cleared = localStorage.getItem("careflow_data_cleared");
    if (cleared === "true") {
      return [];
    }
    const local = localStorage.getItem("careflow_patients");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Failed to parse localized patients stream", e);
      }
    }
    return INITIAL_PATIENTS;
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>("PAT-007");
  const [fencedNurseView, setFencedNurseView] = useState<"triage" | "optometry">("optometry");

  // Secure Login state and local caches (Task 1 & Task 2) - Defaults to false to always show login on mount/refresh
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<ClinicalRole>(() => {
    return (localStorage.getItem("careflow_active_role") as ClinicalRole) || "doctor";
  });
  const [activeDoctorId, setActiveDoctorId] = useState<string>(() => {
    return localStorage.getItem("careflow_active_doctor_id") || "EMP-001";
  });

  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // User details & global settings states
  const [userProfilePic, setUserProfilePic] = useState<string>(() => {
    return localStorage.getItem("careflow_user_profile_pic") || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop";
  });
  const [userDisplayName, setUserDisplayName] = useState<string>(() => {
    return localStorage.getItem("careflow_user_display_name") || "Dr. Alexander Sterling";
  });
  const [doctorSignature, setDoctorSignature] = useState<string>(() => {
    return localStorage.getItem("careflow_doctor_signature") || "Chief Retina Surgeon";
  });

  const handleLogin = (role: ClinicalRole, displayName: string, profilePic: string, signature: string, empId?: string) => {
    setActiveRole(role);
    setUserDisplayName(displayName);
    setUserProfilePic(profilePic);
    setDoctorSignature(signature);
    
    localStorage.setItem("careflow_logged_in", "true");
    localStorage.setItem("careflow_active_role", role);
    localStorage.setItem("careflow_user_display_name", displayName);
    localStorage.setItem("careflow_user_profile_pic", profilePic);
    localStorage.setItem("careflow_doctor_signature", signature);

    const activeId = empId || (
      role === "admin" ? "EMP-000" :
      role === "doctor" ? "EMP-001" :
      role === "nurse" ? "EMP-003" :
      role === "receptionist" ? "EMP-005" :
      role === "pharmacist" ? "EMP-008" :
      role === "accountant" ? "EMP-012" :
      "EMP-015"
    );
    setActiveDoctorId(activeId);
    localStorage.setItem("careflow_active_doctor_id", activeId);

    if (role === "admin") {
      setActiveViewInner("admin_control_tower");
    } else if (role === "doctor") {
      setActiveViewInner("clinical_consult");
    } else if (role === "nurse") {
      setActiveViewInner("nurse_workstation");
    } else if (role === "receptionist") {
      setActiveViewInner("kiosk_enrollment");
    } else if (role === "pharmacist") {
      setActiveViewInner("diagnostics_labs");
    } else if (role === "accountant") {
      setActiveViewInner("diagnostics_labs");
    } else if (role === "hr_manager") {
      setActiveViewInner("security_rbac");
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("careflow_logged_in");
    localStorage.removeItem("careflow_active_role");
    localStorage.removeItem("careflow_user_display_name");
    localStorage.removeItem("careflow_user_profile_pic");
    localStorage.removeItem("careflow_doctor_signature");
    localStorage.removeItem("careflow_active_doctor_id");
    setActiveRole("admin"); // Reset back to a clean initial state
    setIsLoggedIn(false);
  };
  const [systemVolume, setSystemVolume] = useState<number>(() => {
    const val = localStorage.getItem("careflow_system_volume");
    return val !== null ? Number(val) : 80;
  });
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("careflow_sound_alerts_enabled") !== "false";
  });
  const [billingCurrency, setBillingCurrency] = useState<"USD" | "SAR" | "AED" | "EUR">(() => {
    return (localStorage.getItem("careflow_billing_currency") as any) || "AED";
  });
  const [customGreetingBanner, setCustomGreetingBanner] = useState<string>(() => {
    return localStorage.getItem("careflow_custom_greeting_banner") || "Welcome to Al Jawarih Eye Hospital";
  });
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(() => {
    const val = localStorage.getItem("careflow_autosave_interval");
    return val !== null ? Number(val) : 30;
  });

  // State to track the latest global alert/announcement broadcast across all hospital terminals
  const [latestGlobalNotice, setLatestGlobalNotice] = useState<any>(null);

  useEffect(() => {
    const handleGlobalNotice = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLatestGlobalNotice(customEvent.detail);
      }
    };
    window.addEventListener("global-announcement-received", handleGlobalNotice);

    // Initial load fallback to avoid empty state flash
    fetch("/api/messages")
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const globalOnly = data.filter((m: any) => m.channelType === "PUBLIC_GLOBAL_ANNOUNCEMENT" || m.targetDepartment === "All Departments");
          if (globalOnly.length > 0) {
            setLatestGlobalNotice(globalOnly[globalOnly.length - 1]);
          }
        }
      })
      .catch(err => console.error("Error loading chat backlog for global notice ticker:", err));

    return () => {
      window.removeEventListener("global-announcement-received", handleGlobalNotice);
    };
  }, []);
  const [clinicalTheme, setClinicalTheme] = useState<"premium_imperial" | "warm_milk" | "ocean_mint" | "royal_lavender" | "slate_minimal">(() => {
    const stored = localStorage.getItem("careflow_clinical_theme_v2");
    if (!stored) {
      localStorage.setItem("careflow_clinical_theme_v2", "warm_milk");
      return "warm_milk";
    }
    return (stored as any) || "warm_milk";
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Palettes corresponding to beautiful health clinical premium designs
  const THEME_PALETTES: Record<string, Record<"light" | "dark", Record<string, string>>> = {
    premium_imperial: {
      light: {
        "--clr-brand-blue": "#1A445E",
        "--clr-bg-main": "#F4F3ED",
        "--clr-bg-card": "#FFFFFF",
        "--clr-sidebar-bg": "#FFFFFF",
        "--clr-border-light": "#CBD5E1",
        "--clr-brand-orange": "#9A6624",
        "--clr-text-title": "#071522",
        "--clr-text-body": "#0C1D2D"
      },
      dark: {
        "--clr-brand-blue": "#4EA4CC",
        "--clr-bg-main": "#071017",
        "--clr-bg-card": "#0E1720",
        "--clr-sidebar-bg": "#0A121A",
        "--clr-border-light": "#1E2E3C",
        "--clr-brand-orange": "#EAA84E",
        "--clr-text-title": "#FFFFFF",
        "--clr-text-body": "#E2E8F0"
      }
    },
    warm_milk: {
      light: {
        "--clr-brand-blue": "#4F46E5",
        "--clr-bg-main": "#FBFBF9",
        "--clr-bg-card": "#FFFFFF",
        "--clr-sidebar-bg": "#FAF9F5",
        "--clr-border-light": "#EAE6DF",
        "--clr-brand-orange": "#F59E0B",
        "--clr-text-title": "#0F172A",
        "--clr-text-body": "#374151"
      },
      dark: {
        "--clr-brand-blue": "#2BBFFF",
        "--clr-bg-main": "#0B0E14",
        "--clr-bg-card": "#121520",
        "--clr-sidebar-bg": "#0E1019",
        "--clr-border-light": "#1E2335",
        "--clr-brand-orange": "#FF841A",
        "--clr-text-title": "#F8FAFC",
        "--clr-text-body": "#94A3B8"
      }
    },
    ocean_mint: {
      light: {
        "--clr-brand-blue": "#0D9488",
        "--clr-bg-main": "#F2FAF9",
        "--clr-bg-card": "#FFFFFF",
        "--clr-sidebar-bg": "#E6F4F1",
        "--clr-border-light": "#CDEDE6",
        "--clr-brand-orange": "#EA580C",
        "--clr-text-title": "#115E59",
        "--clr-text-body": "#1E293B"
      },
      dark: {
        "--clr-brand-blue": "#20F7D1",
        "--clr-bg-main": "#061311",
        "--clr-bg-card": "#0D1F1C",
        "--clr-sidebar-bg": "#081715",
        "--clr-border-light": "#18322D",
        "--clr-brand-orange": "#FF9F43",
        "--clr-text-title": "#E6FFFA",
        "--clr-text-body": "#A7F3D0"
      }
    },
    royal_lavender: {
      light: {
        "--clr-brand-blue": "#7C3AED",
        "--clr-bg-main": "#FAF9FC",
        "--clr-bg-card": "#FFFFFF",
        "--clr-sidebar-bg": "#F3EFF7",
        "--clr-border-light": "#E5DDEF",
        "--clr-brand-orange": "#D97706",
        "--clr-text-title": "#5B21B6",
        "--clr-text-body": "#1E293B"
      },
      dark: {
        "--clr-brand-blue": "#D8B4FE",
        "--clr-bg-main": "#0F0B18",
        "--clr-bg-card": "#1A132C",
        "--clr-sidebar-bg": "#120D1F",
        "--clr-border-light": "#2A1F45",
        "--clr-brand-orange": "#FBBF24",
        "--clr-text-title": "#FAF5FF",
        "--clr-text-body": "#D8B4FE"
      }
    },
    slate_minimal: {
      light: {
        "--clr-brand-blue": "#1D4ED8",
        "--clr-bg-main": "#F8FAFC",
        "--clr-bg-card": "#FFFFFF",
        "--clr-sidebar-bg": "#ECEFF1",
        "--clr-border-light": "#E2E8F0",
        "--clr-brand-orange": "#F59E0B",
        "--clr-text-title": "#0F172A",
        "--clr-text-body": "#334155"
      },
      dark: {
        "--clr-brand-blue": "#3B82F6",
        "--clr-bg-main": "#0F172A",
        "--clr-bg-card": "#1E293B",
        "--clr-sidebar-bg": "#0D1321",
        "--clr-border-light": "#2D3748",
        "--clr-brand-orange": "#F59E0B",
        "--clr-text-title": "#F1F5F9",
        "--clr-text-body": "#94A3B8"
      }
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<"telemetry" | "rbac" | "clinics" | "priority-rules">("telemetry");

  // Priority Hook for Admin control
  const { rules: priorityRules, addRule, deleteRule, toggleRuleActive, updateRule } = useClinicalPriority();

  // --- Stackable Dynamic Multi-Notification State ---
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [muteNotifications, setMuteNotifications] = useState<boolean>(false);

  // Setup Event Listener for Real-time Stackable Alerts
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        const { type, titleEn, titleAr, messageEn, messageAr, patientName, patientId } = customEvent.detail;
        
        const newNotif: AppNotification = {
          id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: type || "system",
          titleEn: titleEn || "Direct Diagnostic Update",
          titleAr: titleAr || "تحديث طبي مباشر",
          messageEn: messageEn || "",
          messageAr: messageAr || "",
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          patientName,
          patientId
        };
        
        setNotifications(prev => [newNotif, ...prev]);
        
        if (!muteNotifications) {
          playNotificationSound(newNotif.type);
        }
        
        // Auto-remove notification from stack after 8 seconds to allow viewing & stacking
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 8000);
      }
    };

    window.addEventListener("clinical-notification" as any, handleNotification);
    
    // Polyfill or hook direct window helpers
    (window as any).addAppNotification = (detail: any) => {
      window.dispatchEvent(new CustomEvent("clinical-notification", { detail }));
    };

    return () => {
      window.removeEventListener("clinical-notification" as any, handleNotification);
      delete (window as any).addAppNotification;
    };
  }, [muteNotifications]);

  // --- Resilient Offline-First Synchronization State Matrix ---
  const [serverSimulatedOffline, setServerSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem("careflow_server_offline") === "true";
  });
  const [realOnline, setRealOnline] = useState<boolean>(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncTask[]>(() => {
    const q = localStorage.getItem("careflow_sync_queue");
    return q ? JSON.parse(q) : [];
  });
  const [syncLogs, setSyncLogs] = useState<string[]>(() => {
    const logs = localStorage.getItem("careflow_sync_logs");
    return logs ? JSON.parse(logs) : [`[${new Date().toLocaleTimeString()}] Offline-First Engine initialized.`];
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showSmokeTestModal, setShowSmokeTestModal] = useState<boolean>(false);

  const isOnline = realOnline && !serverSimulatedOffline;

  // Track dynamic changes to LocalStorage for full persistence
  useEffect(() => {
    localStorage.setItem("careflow_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("careflow_sync_queue", JSON.stringify(syncQueue));
  }, [syncQueue]);

  useEffect(() => {
    localStorage.setItem("careflow_server_offline", String(serverSimulatedOffline));
  }, [serverSimulatedOffline]);

  // Real browser internet connectivity listener
  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      addSyncLog("Browser detected hardware network connection RESTORED.");
    };
    const handleOffline = () => {
      setRealOnline(false);
      addSyncLog("Browser detected hardware network connection LOST.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addSyncLog = (msg: string) => {
    const logItem = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setSyncLogs(prev => {
      const next = [logItem, ...prev].slice(0, 30);
      localStorage.setItem("careflow_sync_logs", JSON.stringify(next));
      return next;
    });
  };

  const queueSyncTask = (type: "create" | "update", item: Patient) => {
    const existingIndex = syncQueue.findIndex(q => q.patientId === item.id);
    const newTask: OfflineSyncTask = {
      type,
      patientId: item.id,
      patientName: item.name,
      data: item,
      timestamp: new Date().toLocaleTimeString(),
      retryCount: 0
    };

    setSyncQueue(prev => {
      let next;
      if (existingIndex > -1) {
        next = prev.map((q, i) => i === existingIndex ? newTask : q);
        addSyncLog(`Merged pending ${type} for ${item.name} (${item.id}) due to offline state.`);
      } else {
        next = [...prev, newTask];
        addSyncLog(`Queued offline ${type} for ${item.name} (${item.id}).`);
      }
      return next;
    });
  };

  const pushSingleTaskToServer = async (type: "create" | "update", item: Patient) => {
    try {
      const response = await fetch("/api/sync-patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: [{
            type,
            patientId: item.id,
            patientName: item.name,
            data: item,
            timestamp: new Date().toLocaleTimeString(),
            retryCount: 0
          }]
        })
      });
      if (response.ok) {
        addSyncLog(`Online sync succeeded: Directly pushed ${type} for ${item.name}.`);
      } else {
        throw new Error(`Server responded with check status ${response.status}`);
      }
    } catch (e: any) {
      addSyncLog(`Direct sync failure for ${item.name} (${e.message || e}). Failing back to Offline Sandbox Queue.`);
      queueSyncTask(type, item);
    }
  };

  const triggerFullSync = async () => {
    if (syncQueue.length === 0) {
      addSyncLog("Handshake bypass: All local data queues synchronized.");
      return;
    }
    if (!isOnline) {
      addSyncLog("Sync aborted: Channel is simulated/hardware offline.");
      return;
    }

    setIsSyncing(true);
    addSyncLog(`Initializing bulk synchronization stream for ${syncQueue.length} records...`);
    try {
      const response = await fetch("/api/sync-patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: syncQueue })
      });

      if (response.ok) {
        addSyncLog(`Sync stream successfully completed. ${syncQueue.length} items verified with cloud.`);
        // Elegant non-blocking toast
        const successMessage = language === "ar"
          ? `تم مزامنة جميع السجلات المعلقة (${syncQueue.length}) بنجاح مع الخادم المركزي!`
          : `Hospital Synced! Handshake successfully completed for ${syncQueue.length} queued records.`;
        window.alert(successMessage);
        setSyncQueue([]);
      } else {
        throw new Error(`Sync core returned status code ${response.status}`);
      }
    } catch (err: any) {
      addSyncLog(`Sync handshake failed: ${err.message || err}. Will retry on next heartbeat.`);
      setSyncQueue(prev => prev.map(q => ({ ...q, retryCount: q.retryCount + 1 })));
    } finally {
      setIsSyncing(false);
    }
  };

  // Automatically trigger sync when transitioning online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      triggerFullSync();
    }
  }, [isOnline]);

  // Tablet and screen width auto-collapsing for Surface, Android, and general tablet environments
  useEffect(() => {
    const handleLayoutResize = () => {
      // If width is under 1024px, start with collapsed sidebar to maximize data workspace
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleLayoutResize();
    window.addEventListener("resize", handleLayoutResize);
    return () => window.removeEventListener("resize", handleLayoutResize);
  }, []);

  const roleMatchedView = (role: ClinicalRole): string => {
    if (role === "admin") return "admin_control_tower";
    if (role === "doctor") return "clinical_consult";
    if (role === "nurse") return "nurse_workstation";
    if (role === "receptionist") return "kiosk_enrollment";
    if (role === "hr_manager") return "security_rbac";
    if (role === "pharmacist" || role === "accountant") return "diagnostics_labs";
    return "diagnostics_labs"; // Default for other staff
  };

  // Nav views & App launchers (Task 1 & Task 2)
  const [activeView, setActiveViewInner] = useState<string>(() => {
    const savedRole = (localStorage.getItem("careflow_active_role") as ClinicalRole) || "doctor";
    return roleMatchedView(savedRole);
  });

  const setActiveView = (viewName: string) => {
    if (activeRole !== "admin") {
      const matchedView = roleMatchedView(activeRole);
      if (viewName === matchedView || viewName === "settings") {
        setActiveViewInner(viewName);
      } else {
        console.warn(`Secured Sandbox: Specialty role "${activeRole}" is locked to workstation "${matchedView}".`);
      }
    } else {
      setActiveViewInner(viewName);
    }
  };
  const [launchedApp, setLaunchedApp] = useState<"pharmacy" | "warehouse" | "optics" | "accounting" | "hr" | "reception" | null>(null);
  const [fencingEnabled, setFencingEnabled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Coordinating activeRole updates, full identity profiles (names, titles, avatars) and direct activeView workspace routing.
  const handleSelectRoleAndRedirect = (role: ClinicalRole) => {
    setActiveRole(role);
    // 1. Swap Identity portrait structures cleanly
    if (role === "receptionist") {
      setUserDisplayName("Mildred Sterling");
      setDoctorSignature("Receptionist");
      setUserProfilePic("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop");
    } else if (role === "nurse") {
      setUserDisplayName("Sister Beatrice");
      setDoctorSignature("Nurse");
      setUserProfilePic("https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=256&auto=format&fit=crop");
    } else if (role === "doctor") {
      setUserDisplayName("Dr. Alexander Sterling");
      setDoctorSignature("Chief Retina Surgeon");
      setUserProfilePic("https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop");
      setActiveDoctorId("EMP-001");
    } else if (role === "pharmacist") {
      setUserDisplayName("Dr. Al-Zahrani");
      setDoctorSignature("Pharmacist");
      setUserProfilePic("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop");
    } else if (role === "accountant") {
      setUserDisplayName("Albert Vance");
      setDoctorSignature("Accountant");
      setUserProfilePic("https://images.unsplash.com/photo-1622253692010-333f2da6031f?q=80&w=256&auto=format&fit=crop");
    } else if (role === "hr_manager") {
      setUserDisplayName("Director Hamad");
      setDoctorSignature("HR");
      setUserProfilePic(`https://api.dicebear.com/7.x/initials/svg?seed=Director%20Hamad`);
    } else if (role === "admin") {
      setUserDisplayName("Chief IT Admin");
      setDoctorSignature("System Admin");
      setUserProfilePic(`https://api.dicebear.com/7.x/initials/svg?seed=Chief%20IT%20Admin`);
    }

    // 2. Route the dashboard views cleanly to his corresponding page
    if (role === "receptionist") {
      setActiveViewInner("kiosk_enrollment");
    } else if (role === "nurse") {
      setActiveViewInner("nurse_workstation");
    } else if (role === "doctor") {
      setActiveViewInner("clinical_consult");
    } else if (role === "pharmacist" || role === "accountant") {
      setActiveViewInner("diagnostics_labs");
    } else if (role === "hr_manager") {
      setActiveViewInner("security_rbac");
    } else if (role === "admin") {
      setActiveViewInner("admin_control_tower");
    }
  };

  // Auto-launch designated ERP app on role sign-in
  useEffect(() => {
    if (activeRole === "accountant") {
      setLaunchedApp("accounting");
    } else if (activeRole === "pharmacist") {
      setLaunchedApp("pharmacy");
    } else if (activeRole === "receptionist") {
      setLaunchedApp("reception");
    } else if (activeRole === "hr_manager") {
      setLaunchedApp("hr");
    } else {
      if (launchedApp && ["accounting", "pharmacy", "reception", "hr"].includes(launchedApp)) {
        setLaunchedApp(null);
      }
    }
  }, [activeRole]);

  // Auto-launch designated clinic on doctor sign-in & isolate patient queues
  useEffect(() => {
    if (activeRole === "doctor" && activeDoctorId) {
      const doc = DOCTORS_LIST.find(d => d.empId === activeDoctorId);
      if (doc) {
        // Immediately open clinical consultation
        if (activeView !== "clinical_consult") {
          setActiveView("clinical_consult");
        }

        // Align selected patient to the doctor's assigned clinic
        const curPat = patients.find(p => p.id === selectedPatientId);
        if (!curPat || curPat.clinic !== doc.clinic) {
          const matched = patients.find(p => p.clinic === doc.clinic);
          if (matched) {
            setSelectedPatientId(matched.id);
          }
        }
      }
    }
  }, [activeRole, activeDoctorId, selectedPatientId, activeView, patients]);

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
    shift_handover: false,
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
    localStorage.setItem("careflow_clinical_theme_v2", clinicalTheme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply clinical custom variables dynamically to doc root
    const palette = THEME_PALETTES[clinicalTheme]?.[theme] || THEME_PALETTES.warm_milk[theme];
    if (palette) {
      Object.entries(palette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value as string);
      });
    }
  }, [theme, clinicalTheme]);

  // Global currency formatting utility
  useEffect(() => {
    (window as any).careflow_billing_currency = billingCurrency;
    (window as any).formatClinicalMoney = (amount: number) => {
      const symbols: Record<string, string> = {
        USD: "$",
        SAR: "ر.س ",
        AED: "AED ",
        EUR: "€"
      };
      
      const rates: Record<string, number> = {
        USD: 1,
        SAR: 3.75,
        AED: 3.67,
        EUR: 0.92
      };
      
      const activeSymbol = symbols[billingCurrency] || "AED ";
      const rate = rates[billingCurrency] || 3.67;
      
      // Convert AED base amount (unpaid default values) into selected base currency representation:
      const convertedVal = (amount / 3.67) * rate;
      return `${activeSymbol}${convertedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    // Notify child modules to trigger re-renders
    window.dispatchEvent(new CustomEvent("clinical-currency-changed", { detail: billingCurrency }));
  }, [billingCurrency]);

  const toggleZone = (zone: string) => {
    setCollapsedZones(prev => ({ ...prev, [zone]: !prev[zone] }));
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (!isOnline) {
      queueSyncTask("update", updated);
    } else {
      pushSingleTaskToServer("update", updated);
    }

    // Dispatch a cross-module custom event to notify external/decoupled departments (Pharmacy, Accounting)
    if (updated.status === "Dispensing" || updated.status === "BillingPending") {
      const event = new CustomEvent("clinical-patient-status-updated", {
        detail: {
          patient: updated,
          status: updated.status,
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleAddPatient = (created: Patient) => {
    localStorage.removeItem("careflow_data_cleared");
    setPatients(prev => {
      const exists = prev.some(p => p.id === created.id);
      if (exists) {
        return prev.map(p => (p.id === created.id ? created : p));
      }
      return [...prev, created];
    });
    setSelectedPatientId(created.id);
    if (!isOnline) {
      queueSyncTask("create", created);
    } else {
      pushSingleTaskToServer("create", created);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (selectedPatientId === patientId) {
      setSelectedPatientId("");
    }
  };

  const handleClearSimulatedPatients = () => {
    setPatients(prev => prev.filter(p => !p.id.startsWith("PAT-SIM-")));
    setSelectedPatientId("");
  };

  const handleClearAllData = () => {
    localStorage.setItem("careflow_data_cleared", "true");
    localStorage.setItem("careflow_patients", JSON.stringify([]));
    setPatients([]);
    setSelectedPatientId("");
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  // Real-world Emergency STAT Overrides Integration
  const sortedPatients = [...patients].sort((a, b) => {
    const aIsEmergency = a.triageVitals?.urgency === "STAT_EMERGENCY";
    const bIsEmergency = b.triageVitals?.urgency === "STAT_EMERGENCY";

    if (aIsEmergency && !bIsEmergency) return -1;
    if (!aIsEmergency && bIsEmergency) return 1;
    return 0; // retain registry chronology
  }).filter(p => {
    if (activeRole === "doctor" && activeDoctorId) {
      const doc = DOCTORS_LIST.find(d => d.empId === activeDoctorId);
      return doc ? p.clinic === doc.clinic : true;
    }
    return true;
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
    
    // Sandbox search to logged-in doctor's clinic if applicable
    let pool = patients;
    if (activeRole === "doctor" && activeDoctorId) {
      const doc = DOCTORS_LIST.find(d => d.empId === activeDoctorId);
      if (doc) {
        pool = patients.filter(p => p.clinic === doc.clinic);
      }
    }

    // Use fast native retrieval on larger dataset
    const filtered = pool.filter(
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

  if (!isLoggedIn) {
    return (
      <HospitalLoginOverlay
        onLogin={handleLogin}
        language={language}
        theme={theme}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--clr-bg-main)] text-[var(--clr-text-body)] flex font-sans select-none overflow-hidden transition-colors duration-200"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      
      {/* 1. Left Collapsible Core Sidebar */}
      {activeRole === "admin" && !fencingEnabled && (
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
            <span className="text-[9px] font-mono text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] uppercase tracking-wider block font-black mt-0.5">
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
                  {language === "ar" ? "الموارد البشرية" : "HR"}
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
                  {language === "ar" ? "الاستقبال والمالية" : "Reception"}
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
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-[#555] dark:text-neutral-450 transition-all"
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
                  <button
                    onClick={() => setActiveView("optometry_workstation")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "optometry_workstation"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Glasses className={`w-3.5 h-3.5 ${activeView === "optometry_workstation" ? "text-amber-500" : "text-neutral-400"}`} />
                    <span className="font-extrabold text-[#4F46E5] dark:text-indigo-400">{language === "ar" ? "بوابة قياس البصر ✙" : "Optometry Clinic ✙"}</span>
                  </button>

                  <button
                    onClick={() => setActiveView("nurse_workstation")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "nurse_workstation"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 ${activeView === "nurse_workstation" ? "text-[var(--clr-brand-blue)]" : "text-neutral-450"}`} />
                    <span className="font-extrabold text-neutral-600 dark:text-neutral-300">{language === "ar" ? "محطة ممرض العيون ✙" : "Nurse Workstation ✙"}</span>
                  </button>

                  <div className="h-px bg-neutral-200/60 dark:bg-neutral-800 my-1" />

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
                    const isDoctor = activeRole === "doctor";
                    const activeDocObj = DOCTORS_LIST.find(d => d.empId === activeDoctorId);
                    const isLockedByDoc = isDoctor && activeDocObj && activeDocObj.clinic !== cl.clinicId;
                    const isActive = activeView === "clinical_consult" && selectedPatient?.clinic === cl.clinicId;
                    return (
                      <button
                        key={cl.clinicId}
                        disabled={isLockedByDoc}
                        onClick={() => loadSpecialtyClinic(cl.clinicId as ClinicType)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all relative ${
                          isActive
                            ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm"
                            : isLockedByDoc
                            ? "text-neutral-400 dark:text-neutral-600 opacity-60 cursor-not-allowed"
                            : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <cl.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--clr-brand-blue)]" : isLockedByDoc ? "text-neutral-400 shrink-0" : cl.iconColor}`} />
                          <span className="truncate">{cl.label}</span>
                        </div>
                        {isLockedByDoc && (
                          <Lock className="w-3 h-3 text-neutral-400 dark:text-neutral-600 shrink-0" />
                        )}
                        {!isLockedByDoc && isDoctor && activeDocObj?.clinic === cl.clinicId && (
                          <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 scale-90 shrink-0 font-bold uppercase tracking-wider">
                            ON DUTY
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category: Shift Handover & Logs */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleZone("shift_handover")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-neutral-400 transition-all font-sans"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span>{language === "ar" ? "تسليم الوردية السريرية" : "SHIFT HANDOVER"}</span>
                </div>
                {collapsedZones.shift_handover ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60 text-indigo-500" />}
              </button>

              {!collapsedZones.shift_handover && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[var(--clr-border-light)]/90 space-y-1 py-1">
                  <button
                    type="button"
                    onClick={() => setActiveView("shift_handover")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "shift_handover"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <ClipboardList className={`w-3.5 h-3.5 ${activeView === "shift_handover" ? "text-[var(--clr-brand-blue)]" : "text-neutral-450"}`} />
                    <span>{language === "ar" ? "ملاحظات تسليم الوردية ✙" : "Shift Handover Notes ✙"}</span>
                    <span className="absolute right-2 top-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  </button>
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
                    onClick={() => setActiveView("admin_control_tower")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "admin_control_tower"
                        ? "bg-white text-indigo-600 border-l-4 border-indigo-600 shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Shield className={`w-3.5 h-3.5 ${activeView === "admin_control_tower" ? "text-indigo-600" : "text-neutral-400"}`} />
                    <span>{language === "ar" ? "برج التحكم الإداري التنفيذي" : "Executive Admin Control Tower"}</span>
                  </button>

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
                    onClick={() => setActiveView("tablet_apk_download")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "tablet_apk_download"
                        ? "bg-[var(--clr-bg-card)] text-[var(--clr-brand-blue)] border-l-4 border-[var(--clr-brand-blue)] shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Tablet className={`w-3.5 h-3.5 ${activeView === "tablet_apk_download" ? "text-indigo-600" : "text-indigo-550"}`} />
                    <span className="font-extrabold text-indigo-600">
                      {language === "ar" ? "★ تنزيل حزمة الأجهزة اللوحية (APK)" : "★ Tablet APK Download"}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveView("project_launch_todo")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "project_launch_todo"
                        ? "bg-white text-indigo-600 border-l-4 border-indigo-600 shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Award className={`w-3.5 h-3.5 ${activeView === "project_launch_todo" ? "text-amber-500 animate-bounce" : "text-amber-500"}`} />
                    <span className="font-extrabold text-amber-600">{language === "ar" ? "فحص الجاهزية ومهام الإطلاق 100%" : "Launch Control & TODOs (100%)"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category 6: IT Infrastructure & Services */}
            <div className="space-y-1">
              <button
                onClick={() => toggleZone("it_services")}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900/60 text-[10px] font-black uppercase tracking-widest text-[#4F46E5] dark:text-neutral-450 transition-all font-sans"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                  <span>{language === "ar" ? "بوابة تقنية المعلومات" : "IT SERVICES"}</span>
                </div>
                {collapsedZones.it_services ? <ChevronRight className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60 text-indigo-500" />}
              </button>

              {!collapsedZones.it_services && (
                <div className="ml-3 pl-3.5 border-l border-dashed border-[#EAE6DF] space-y-1 py-1">
                  <button
                    onClick={() => setActiveView("it_infrastructure")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "it_infrastructure"
                        ? "bg-white text-indigo-600 border-l-4 border-indigo-600 shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Server className={`w-3.5 h-3.5 ${activeView === "it_infrastructure" ? "text-indigo-600" : "text-neutral-400"}`} />
                    <span>{language === "ar" ? "لوحة البنية والشبكات" : "Infrastructure Telemetry"}</span>
                  </button>

                  <button
                    onClick={() => setActiveView("settings")}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative ${
                      activeView === "settings"
                        ? "bg-white text-indigo-600 border-l-4 border-indigo-600 shadow-sm font-black"
                        : "text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <Settings className={`w-3.5 h-3.5 ${activeView === "settings" ? "text-indigo-600 animate-spin" : "text-neutral-400"}`} />
                    <span>{language === "ar" ? "إعدادات النظام والواجهة" : "HIS Workspace Settings"}</span>
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
            {sortedPatients.length === 0 ? (
              <div className="p-3 py-5 border border-dashed border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-center bg-neutral-50/50 dark:bg-neutral-900/15">
                <span className="text-base block">📭</span>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block font-mono mt-1">
                  Queue Vacant
                </span>
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[140px] mx-auto leading-normal">
                  {language === "ar"
                    ? "لا يوجد مرضى في الانتظار حالياً."
                    : "No patients registered. Intake some via frontdesk enrollment."}
                </p>
              </div>
            ) : (
              <>
                {sortedPatients.length > 50 && (
                  <div className="p-2 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl mb-2 text-[10px] text-indigo-700 dark:text-indigo-300 leading-normal font-sans font-medium">
                    {language === "ar" ? (
                      <span>
                        ⚠️ عرض أول 50 مريضاً من أصل <strong>{sortedPatients.length.toLocaleString()}</strong>. استخدم شريط البحث العام للبحث الذكي الفوري عن أي مريض.
                      </span>
                    ) : (
                      <span>
                        ⚠️ Showing top 50 of <strong>{sortedPatients.length.toLocaleString()}</strong> patients. Use the Global Search above to lookup any patient record instantly.
                      </span>
                    )}
                  </div>
                )}
                {sortedPatients.slice(0, 50).map(patient => {
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
              </>
            )}
          </div>
        </div>

        {/* 1.1 Left Sidebar Footer: Session Controls & Secure Logout (Task 1) */}
        <div className="p-3 bg-[var(--clr-bg-card)] border-t border-[var(--clr-border-light)]/85 flex flex-col gap-2 shrink-0 select-none animate-fadeIn">
          {activeRole !== "admin" && (
            <div className="flex items-center gap-1.5 justify-center py-1.5 px-2 bg-amber-50/70 dark:bg-amber-950/20 text-[#D97706] text-[9px] font-mono font-black uppercase rounded-lg border border-amber-250 dark:border-amber-900/40">
              <Lock className="w-3 h-3 shrink-0" />
              <span>Session Role-Locked</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/45 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{language === "ar" ? "تسجيل الخروج الأمن" : "Secure Log Out"}</span>
          </button>
        </div>

      </aside>
      )}

      {/* 2. Right Side Core Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Navigation Control bar */}
        <header className="h-[70px] bg-[var(--clr-bg-card)] border-b border-[var(--clr-border-light)] flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          
          {/* 1. Left Zone: System Context */}
          <div className="flex items-center gap-3 shrink-0">
            {(fencingEnabled || activeRole !== "admin") ? (
              <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/45 p-1.5 rounded-xl text-[#4F46E5] dark:text-indigo-400 font-sans font-extrabold flex items-center justify-center gap-1.5 shadow-xs">
                <FolderLock className="w-4 h-4 animate-pulse text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline-block">
                  {language === "ar" ? "محطة عمل مؤمنة" : "Session Locked"}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-[var(--clr-brand-blue)] dark:text-neutral-100 transition cursor-pointer"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-extrabold text-[var(--clr-text-title)] dark:text-[#2BBFFF] text-xs uppercase font-mono tracking-widest leading-none">
                {(fencingEnabled || activeRole !== "admin") ? (
                  <>
                    {activeRole === "doctor" && (language === "ar" ? "سجل الطبيب الاستشاري التخصصي ✙" : "CLINICAL SPECIALTY DESK ✙")}
                    {activeRole === "nurse" && (language === "ar" ? "محطة ممرض العيون التخصصية ✙" : "OPHTHALMIC NURSE WORKSTATION ✙")}
                    {activeRole === "receptionist" && (language === "ar" ? "تسجيل المرضى الذاتي والكيوسك ✙" : "ENROLLMENT KIOSK ENTRY ✙")}
                    {activeRole === "pharmacist" && (language === "ar" ? "أقسام صرف الأدوية والدم ✙" : "PRESCRIPTION LEDGERS & LABS ✙")}
                    {activeRole === "accountant" && (language === "ar" ? "الحسابات المالية والخزينة السريرية ✙" : "ERP FINANCE & ACCOUNTING ✙")}
                    {activeRole === "hr_manager" && (language === "ar" ? "صلاحيات الموظفين الشاملة ✙" : "SECURITY CLEARANCE & STAT ROLES ✙")}
                  </>
                ) : (
                  <>
                    {activeView === "dashboard" && (language === "ar" ? "لوحة القيادة الإدارية البانورامية" : "METRIC BENTO QUADRANTS")}
                    {activeView === "kiosk_enrollment" && (language === "ar" ? "تسجيل المرضى الذاتي" : "ENROLLMENT KIOSK ENTRY")}
                    {activeView === "queue_hall_sim" && (language === "ar" ? "شاشة صالة طابور الانتظار" : "INTEGRATED WAITING SCREEN")}
                    {activeView === "clinical_consult" && (language === "ar" ? "سجل الطبيب الاستشاري" : "CLINICAL SPECIALTY DESK")}
                    {activeView === "nurse_workstation" && (language === "ar" ? "محطة ممرض العيون التخصصية" : "OPHTHALMIC NURSE WORKSTATION")}
                    {activeView === "it_infrastructure" && (language === "ar" ? "لوحة فحص الخوادم والشبكات" : "IT INFRASTRUCTURE & TELEMETRY")}
                    {activeView === "diagnostics_labs" && (language === "ar" ? "أقسام صرف الأدوية والدم" : "PRESCRIPTION LEDGERS & LABS")}
                    {activeView === "security_rbac" && (language === "ar" ? "صلاحيات الموظفين الشاملة" : "SECURITY CLEARANCE & STAT ROLES")}
                    {activeView === "command_terminals" && (language === "ar" ? "محطات الإنترنت المتصلة" : "ACTIVE HARDWARE CLIENTS")}
                    {activeView === "architect_ai" && (language === "ar" ? "الذكاء الاصطناعي التشخيصي" : "DEVELOPER OUTCOME BOT")}
                    {activeView === "shift_handover" && (language === "ar" ? "تسليم الوردية السريرية" : "SHIFT HANDOVER CONTROLS")}
                    {activeView === "settings" && (language === "ar" ? "إعدادات الهوية والخيارات الفنية" : "WORKSPACE AESTHETICS & SETTINGS")}
                  </>
                )}
              </h2>
            </div>
          </div>

          {/* 2. Center Zone: Global Action */}
          <div className="flex-1 max-w-[325px] mx-auto px-2 relative hidden md:block z-40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === "ar" ? "بحث عن مريض..." : "Search patients... ⌘K"}
                className="w-full bg-neutral-100 dark:bg-neutral-800/80 border-0 rounded-xl pl-9 pr-12 py-1.5 text-xs text-[var(--clr-text-body)] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition duration-200"
                value={searchQuery}
                onChange={e => handleGlobalSearch(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] font-mono font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded px-1.5 py-0.5">
                ⌘K
              </div>
            </div>

            {searchQuery.trim() && (
              <div className="absolute top-[110%] left-0 right-0 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl shadow-2xl p-2 z-50 text-xs text-[var(--clr-text-body)]">
                <span className="font-bold text-[9px] font-mono text-neutral-405 block tracking-wider uppercase mb-1.5 pl-2">
                  {language === "ar" ? "تطابق السجلات السريرية" : "Patient Matches"} ({searchedPatients.length})
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
                            <span className="text-[9px] text-teal-705 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded font-bold font-mono">
                              {p.status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center italic text-neutral-400">
                    {language === "ar" ? "لا توجد نتائج مطابقة" : "No matching patients found."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Right Zone: Identity & Tools */}
          <div className="flex items-center gap-3 shrink-0 relative">
            
            {/* System Status: Discreet text-and-dot indicator */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1.5 transition rounded-lg bg-neutral-100 hover:bg-neutral-150 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-300 border-0 cursor-pointer"
              title={language === "ar" ? "حالة ربط خادم السحابة السريرية" : "Clinical Cloud Node Telemetry Status"}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
              <span className="hidden sm:inline">
                {isOnline 
                  ? (syncQueue.length > 0 ? `Sync (${syncQueue.length})` : "Edge Sync Active")
                  : "Offline"
                }
              </span>
            </button>

            {/* 🔬 Interactive E2E Smoke Test Controller */}
            <button
              id="header_quick_smoke_test_btn"
              onClick={() => {
                setShowSmokeTestModal(true);
                playNotificationSound("system");
              }}
              className="px-2.5 py-1 text-[10px] font-extrabold uppercase font-mono tracking-wider flex items-center gap-1.5 transition rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-[#2BBFFF] border border-indigo-200/40 dark:border-indigo-500/10 cursor-pointer shadow-xs active:scale-95"
              title={language === "ar" ? "بدء الفحص البرمجي واختبار السيناريوهات" : "Trigger Interactive E2E Smoke Tester"}
            >
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>
                {language === "ar" ? "الفحص المحاكي" : "🔬 Smoke Test"}
              </span>
            </button>

            {/* Clinical Messages Icon Button with unread messages count */}
            <button
              onClick={() => {
                const event = new CustomEvent("open-clinical-messages");
                window.dispatchEvent(event);
              }}
              className="p-2 text-neutral-500 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition rounded-lg relative cursor-pointer"
              title={language === "ar" ? "الشبكة الفورية للرسائل السريرية" : "Active Encounters Messenger Context"}
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg border border-white dark:border-neutral-900 animate-pulse animate-duration-1000">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Settings Gear icon button */}
            {activeRole === "admin" && (
              <button
                type="button"
                onClick={() => setActiveView("settings")}
                className={`p-2 text-neutral-500 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition rounded-lg cursor-pointer ${
                  activeView === "settings" ? "text-indigo-600 dark:text-indigo-400" : ""
                }`}
                title={language === "ar" ? "خيارات المنصة" : "System Platform Settings"}
              >
                <Settings className={`w-4 h-4 ${activeView === "settings" ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            )}

            {/* The Unified Identity Switcher Popover / Dropdown [ Avatar ▼ ] */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1 p-0.5 pr-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition cursor-pointer border border-[#EAE6DF] dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xs"
                title={language === "ar" ? "قائمة الطبيب النشط والمهام" : "Active Clinical Portrait & Session Controls"}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-900">
                  <img
                    src={userProfilePic}
                    alt={userDisplayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userDisplayName)}`;
                    }}
                  />
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* High-End Identity Dropdown Popover */}
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn ${language === "ar" ? "left-0 right-auto" : ""}`}>
                    
                    {/* Header: User presentation */}
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-neutral-105 dark:border-neutral-800">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-900">
                        <img
                          src={userProfilePic}
                          alt={userDisplayName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-black text-neutral-800 dark:text-neutral-100 truncate">
                          {userDisplayName}
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-bold truncate mt-0.5 select-none leading-none">
                          {doctorSignature || "MD"}
                        </span>
                      </div>
                    </div>

                    {/* Selector Area: Swap clinical role / clinic department */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9.5px] font-black font-mono text-neutral-405 dark:text-neutral-550 uppercase tracking-widest block font-sans">
                          {language === "ar" ? "تغيير القسم / العيادة" : "Switch Specialty Clinic"}
                        </label>
                        {fencingEnabled && (
                          <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-500 px-1.5 py-0.5 rounded font-black uppercase font-mono animate-pulse">
                            Fenced 🔐
                          </span>
                        )}
                      </div>
                      {(() => {
                        const isRoleLocked = activeRole !== "admin";
                        const activeDoctorObj = DOCTORS_LIST.find(d => d.empId === activeDoctorId);
                        const dropdownValue = activeRole === "doctor"
                          ? (activeDoctorObj?.selectValue || "doctor_sterling")
                          : activeRole;

                        const handleRoleOrDoctorChange = (val: string) => {
                          if (val.startsWith("doctor_")) {
                            const doc = DOCTORS_LIST.find(d => d.selectValue === val);
                            if (doc) {
                              setActiveRole("doctor");
                              setActiveDoctorId(doc.empId);
                              setUserDisplayName(doc.name);
                              setDoctorSignature(doc.title);
                              if (val === "doctor_sterling") {
                                setUserProfilePic("https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop");
                              } else if (val === "doctor_ross") {
                                setUserProfilePic("https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=256&auto=format&fit=crop");
                              }
                              localStorage.setItem("careflow_user_display_name", doc.name);
                              localStorage.setItem("careflow_doctor_signature", doc.title);
                            }
                          } else {
                            setActiveRole(val as ClinicalRole);
                            if (val === "receptionist") {
                              setUserDisplayName("Mildred Sterling");
                              setDoctorSignature("Receptionist");
                              setUserProfilePic("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop");
                            } else if (val === "nurse") {
                              setUserDisplayName("Sister Beatrice");
                              setDoctorSignature("Nurse");
                              setUserProfilePic("https://images.unsplash.com/photo-1579684389782-64d84b5e9053:q=80&w=256&auto=format&fit=crop");
                            } else if (val === "pharmacist") {
                              setUserDisplayName("Dr. Al-Zahrani");
                              setDoctorSignature("Pharmacist");
                              setUserProfilePic("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop");
                            } else if (val === "accountant") {
                              setUserDisplayName("Albert Vance");
                              setDoctorSignature("Accountant");
                              setUserProfilePic("https://images.unsplash.com/photo-1622253692010-333f2da6031f?q=80&w=256&auto=format&fit=crop");
                            } else {
                              setUserDisplayName(val.toUpperCase() + " OFFICER");
                              setDoctorSignature("System Security Clearance");
                            }
                          }
                          setProfileMenuOpen(false); // Close dropdown on pick
                        };

                        return (
                          <select
                            className={`w-full bg-neutral-50 dark:bg-neutral-800 border ${
                              isRoleLocked 
                                ? "border-amber-400 dark:border-amber-500/50 opacity-80 cursor-not-allowed text-neutral-450" 
                                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                            } px-3 py-2 text-xs font-semibold text-[var(--clr-text-body)] rounded-xl focus:outline-none transition cursor-pointer`}
                            value={dropdownValue}
                            onChange={e => handleRoleOrDoctorChange(e.target.value)}
                            disabled={isRoleLocked}
                          >
                            <option value="receptionist">Reception (Mildred)</option>
                            <option value="nurse">Triage BP (Sister Beatrice)</option>
                            
                            <optgroup label="Clinical Physicians (Clinic Locked)">
                              <option value="doctor_sterling">Dr. Alexander Sterling (Retina Clinic)</option>
                              <option value="doctor_ross">Dr. Sophia Ross (ENT Clinic)</option>
                              <option value="doctor_zahrani">Dr. Khalid Al-Zahrani (Dental Clinic)</option>
                              <option value="doctor_vance">Dr. Ryan Vance (Glaucoma Clinic)</option>
                              <option value="doctor_oconnor">Dr. Liam O'Connor (Orbit Clinic)</option>
                              <option value="doctor_bennet">Dr. Chloe Bennet (Pediatrics Clinic)</option>
                              <option value="doctor_farooq">Dr. Omar Farooq (General Ophthalmology Clinic)</option>
                              <option value="doctor_farsi">Dr. Tariq Al-Farsi (Medicine Clinic)</option>
                            </optgroup>

                            <optgroup label="Ancillary & Back Office">
                              <option value="pharmacist">Active Dispatch (Pharmacist Al-Zahrani)</option>
                              <option value="accountant">Ledger Cashier (Accountant Albert Vance)</option>
                              <option value="hr_manager">HR Specialist (Director Hamad)</option>
                              <option value="admin">System Administrator (Chief IT Admin)</option>
                            </optgroup>
                          </select>
                        );
                      })()}
                    </div>

                    {/* Extra Settings option within the menu: Fencing Toggle */}
                    <div className="mt-4 pt-3 border-t border-neutral-105 dark:border-neutral-800 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-500">{language === "ar" ? "حماية النطاق (Fencing)" : "Station Fencing"}</span>
                        <button
                          onClick={() => {
                            setFencingEnabled(!fencingEnabled);
                            setProfileMenuOpen(false);
                          }}
                          className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono tracking-wider transition ${
                            fencingEnabled
                              ? "bg-rose-50 border border-rose-300 text-rose-750 dark:bg-rose-950/25 dark:border-rose-900/35"
                              : "bg-[#4F46E5]/10 border border-[#4F46E5]/30 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400"
                          }`}
                        >
                          {fencingEnabled ? (language === "ar" ? "قفل نشط" : "ENABLED LOCK") : (language === "ar" ? "وصول كامل" : "FULLY OPEN")}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                        <span>NODE ID: HL7_NODE_06</span>
                        <span className="text-emerald-600 font-bold">SECURE ACCREDITED</span>
                      </div>

                      {/* Unified Secure Logout Button in Dropdown */}
                      <div className="pt-2 border-t border-dashed border-neutral-150 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/40 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition duration-200 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{language === "ar" ? "تسجيل الخروج الأمن" : "Secure Log Out"}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>

          </div>

          {/* Legacy Dropdown removed - role switcher embedded in avatar popover */}
          <div className="hidden">
          </div>

        </header>

        {/* Horizontal Public Global Announcements Ticker Triage Bar */}
        <AnimatePresence>
          {latestGlobalNotice && (
            <motion.div
              id="global-public-notices-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={() => {
                const event = new CustomEvent("open-clinical-messages", { detail: { paradigm: "PUBLIC" } });
                window.dispatchEvent(event);
              }}
              className={`w-full overflow-hidden transition-all duration-300 font-sans cursor-pointer group select-none border-b ${
                latestGlobalNotice.isUrgentAlert
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-400 font-bold"
                  : "bg-indigo-500/5 border-indigo-500/10 text-[#0F2942] dark:bg-[#121520] dark:border-neutral-800 dark:text-indigo-300"
              }`}
            >
              <div className="max-w-[1600px] mx-auto px-6 py-2.5 flex items-center justify-between text-xs font-sans tracking-tight">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {latestGlobalNotice.isUrgentAlert ? (
                    <span className="flex h-2.5 w-2.5 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                    </span>
                  ) : (
                    <Megaphone className="w-4 h-4 text-indigo-500 shrink-0" />
                  )}
                  
                  <div className="truncate flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#4F46E5] dark:text-[#2BBFFF] bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-[#EAE6DF] dark:border-neutral-800 shrink-0">
                      {latestGlobalNotice.isUrgentAlert ? "STAT WARNING" : (language === "ar" ? "بث عام" : "BROADCAST")}
                    </span>
                    <span className="font-medium text-neutral-500 dark:text-neutral-400 font-mono text-[10.5px] shrink-0">
                      {latestGlobalNotice.senderName} ({latestGlobalNotice.senderDepartment}):
                    </span>
                    <span className="truncate text-neutral-800 dark:text-neutral-200">
                      {latestGlobalNotice.messageBody}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10.5px] font-mono text-neutral-400 font-medium pl-4">
                  <span>
                    {new Date(latestGlobalNotice.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs transition-transform group-hover:translate-x-1 duration-250">
                    {language === "ar" ? "عرض التفاصيل ➔" : "View Mesh Details ➔"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Core View Port Frame */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--clr-bg-main)]/35 dark:bg-transparent">
          
          <AnimatePresence mode="wait">
            {(fencingEnabled || activeRole !== "admin") ? (
              // APP FENCING MODE: Force boot directly into their designated workspace layout with zero other routes exposed!
              <motion.div
                key={`fenced_${activeRole}`}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-6"
              >
                {activeRole === "nurse" && (
                  <div className="space-y-4">
                    {/* Premium Segmented Switch aligned with AGENTS.md eye-safe clinic styling principles */}
                    <div className="flex items-center justify-between bg-white dark:bg-[#121520] p-3 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400">
                          <Glasses className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--clr-text-title)]">{language === "ar" ? "المسار الإكلينيكي الموحد للتوجيه" : "Unified Clinical Routing Pathway"}</h4>
                          <p className="text-[10px] text-neutral-400">{language === "ar" ? "بوابة عبور المرضى الإجبارية" : "Mandatory Patient Gateway"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 bg-neutral-100 dark:bg-[#0E1019] p-1 rounded-xl">
                        <button
                          onClick={() => setFencedNurseView("optometry")}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                            fencedNurseView === "optometry"
                              ? "bg-white dark:bg-[#121520] text-[#4F46E5] dark:text-indigo-400 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          {language === "ar" ? "بوابة قياس البصر 👁️" : "Optometry Gateway 👁️"}
                        </button>
                        <button
                          onClick={() => setFencedNurseView("triage")}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                            fencedNurseView === "triage"
                              ? "bg-white dark:bg-[#121520] text-[#4F46E5] dark:text-indigo-400 shadow-sm"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          {language === "ar" ? "العلامات الحيوية والترياج" : "Vitals Triage"}
                        </button>
                      </div>
                    </div>

                    {fencedNurseView === "optometry" ? (
                      <OptometryWorkstation
                        patients={patients}
                        onUpdatePatient={handleUpdatePatient}
                        language={language}
                        selectedPatientId={selectedPatientId}
                        onSelectPatient={setSelectedPatientId}
                      />
                    ) : (
                      <OphthalmicNurseWorkstation
                        patients={patients}
                        onUpdatePatient={handleUpdatePatient}
                        language={language}
                        selectedPatientId={selectedPatientId}
                        onSelectPatient={setSelectedPatientId}
                      />
                    )}
                  </div>
                )}

                {activeRole === "receptionist" && (
                  <KioskReception
                    patients={patients}
                    onAddPatient={handleAddPatient}
                    onSelectPatient={(p) => setSelectedPatientId(p.id)}
                    language={language}
                  />
                )}

                {activeRole === "doctor" && (
                  <SpecialtyClinics
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onUpdatePatient={handleUpdatePatient}
                    activeRole={activeRole}
                    onShowReport={(id) => setPdfReportPatientId(id)}
                    language={language}
                  />
                )}

                {(activeRole === "pharmacist" || activeRole === "accountant") && (
                  <AncillaryDepartments
                    patients={patients}
                    onUpdatePatient={handleUpdatePatient}
                    activeRole={activeRole}
                  />
                )}

                {activeRole === "hr_manager" && (
                  <RbacScreen
                    activeRole={activeRole}
                    onSelectRole={handleSelectRoleAndRedirect}
                    language={language}
                  />
                )}

                {activeRole === "admin" && (
                  <AdminControlTower
                    language={language}
                    patients={patients}
                    onUpdatePatient={handleUpdatePatient}
                    activeRole={activeRole}
                    onSelectRole={handleSelectRoleAndRedirect}
                    onAddPatient={handleAddPatient}
                    onDeletePatient={handleDeletePatient}
                    onClearSimulatedPatients={handleClearSimulatedPatients}
                    onClearAllData={handleClearAllData}
                  />
                )}
              </motion.div>
            ) : (
              // STANDALONE / GLOBAL ACCESS MODE (Original viewport routing logic)
              <>
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

              {/* Bento Grid KPI Cards with Integrated Recharts Sparklines */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Registered */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex flex-col justify-between h-36">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#2BBFFF] shrink-0 animate-in fade-in zoom-in duration-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">
                        {language === "ar" ? "إجمالي المسجلين" : "Total Registered"}
                      </span>
                      <span className="text-lg font-black font-mono text-[var(--clr-text-title)]">
                        <AnimatedKpiCounter value={patients.length} suffix={language === "ar" ? " مريض" : " patients"} />
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-full mt-2" id="kpi_registered_sparkline">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={getRegisteredTrends(patients.length)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRegistered)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. STAT Trauma Alerts */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex flex-col justify-between h-36">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/30 rounded-xl flex items-center justify-center text-rose-600 shrink-0 animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">
                        {language === "ar" ? "تنبيهات الطوارئ العاجلة" : "STAT Trauma Alerts"}
                      </span>
                      <span className="text-lg font-black font-mono text-rose-600 animate-pulse">
                        <AnimatedKpiCounter value={patients.filter(p => p.triageVitals?.urgency === "STAT_EMERGENCY").length} suffix={language === "ar" ? " طارئة" : " urgent"} />
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-full mt-2" id="kpi_trauma_sparkline">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={getTraumaTrends(patients.filter(p => p.triageVitals?.urgency === "STAT_EMERGENCY").length)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="colorTrauma" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTrauma)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Discharge Pending */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex flex-col justify-between h-36">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 animate-in fade-in zoom-in duration-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">
                        {language === "ar" ? "مطالبات الخروج المعلقة" : "Discharge Pending"}
                      </span>
                      <span className="text-lg font-black font-mono text-emerald-600">
                        <AnimatedKpiCounter value={patients.filter(p => p.status === "LabsPending" || p.status === "Dispensing").length} suffix={language === "ar" ? " مطالبات" : " claims"} />
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-full mt-2" id="kpi_discharge_sparkline">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={getDischargeTrends(patients.filter(p => p.status === "LabsPending" || p.status === "Dispensing").length)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="colorDischarge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDischarge)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Hospital Bed Occupancy */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 transition-all duration-300 flex flex-col justify-between h-36">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0 animate-in fade-in zoom-in duration-300">
                      <TrendingUp className="w-5 h-5 text-[#FF841A]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wider">
                        {language === "ar" ? "نسبة إشغال الأسرة" : "Hospital Bed Occupancy"}
                      </span>
                      <span className="text-lg font-black font-mono text-[var(--clr-text-title)]">
                        <AnimatedKpiCounter value={84} suffix={language === "ar" ? "٪ مأهولة" : "% occupied"} />
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-full mt-2" id="kpi_occupancy_sparkline">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={getOccupancyTrends(84)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOccupancy)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Organized Unified App launchpad Deck */}
              <div className="bg-[var(--clr-bg-card)] p-6 rounded-3xl border border-[var(--clr-border-light)] shadow-xs space-y-4" id="centralized_erp_app_directory">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--clr-border-light)] pb-4 gap-3">
                  <div>
                    <h3 className="font-extrabold text-[var(--clr-text-title)] text-xs sm:text-xs tracking-wider uppercase font-mono flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--clr-brand-blue)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--clr-brand-blue)]"></span>
                      </span>
                      {language === "ar" ? "✙ دليل تطبيقات نظام الجوارح إي أر بي المركزي الموحد" : "✙ AL JAWARIH CENTRAL ERP APPLICATION DIRECTORY"}
                    </h3>
                    <p className="text-[10px] text-neutral-450 mt-1">
                      {language === "ar" 
                        ? "منصة تحكم موحدة آمنة لإطلاق البرامج الفرعية، ومراقبة المخازن، والوقوف على فواتير المبيعات وحالة الخدمة."
                        : "Unified high-fidelity control deck to launch clinical sub-modules, inspect supply chains, and execute cashier ledgers."}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono bg-[var(--clr-brand-blue)]/10 dark:bg-slate-800 text-[var(--clr-brand-blue)] dark:text-slate-200 border border-[var(--clr-brand-blue)]/20 px-3 py-1 rounded-full font-extrabold uppercase shrink-0">
                    6 {language === "ar" ? "تطبيقات نشطة" : "ACTIVE CHANNELS"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* APP 1: Reception POS Front Desk */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-[var(--clr-brand-blue)]/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] flex items-center justify-center font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "بوابة الاستقبال والطابور الذكي" : "1. Reception & Waiting Queue"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "إدخال المرضى، وصرف أرقام الطابور، ومطالبات POS الفورية." : "Patient enrollment self-tablet syncs, and walksite queue registers."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">8 Walk-ins Today</span>
                      <button 
                        onClick={() => setLaunchedApp("reception")}
                        className="p-1 px-3 bg-[var(--clr-brand-blue)] hover:bg-[var(--clr-brand-blue)]/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* APP 2: Pharmacy Prescription Portal */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-100/10 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                          <Beaker className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "بوابة صرف صيدلية العيون" : "2. Pharmacy Dispensation"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "صرف الأدوية للمرضى، وتحديث الرفوف، وتتبع تواريخ انتهاء الصلاحية." : "Prescription verification, live stock checking, and dosage clearance."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">14 RX Queued</span>
                      <button 
                        onClick={() => setLaunchedApp("pharmacy")}
                        className="p-1 px-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* APP 3: Surgical central Warehouse */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100/10 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 flex items-center justify-center font-bold">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "مستودع المستلزمات الطبية المركزي" : "3. Logistics & Warehouse"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "المخزون المركزي، وتتبع الموردين، وإدارة عهد غرف العمليات والعدسات." : "Central logistics master tracking, surgical transfers, and stocktakes."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">12 stock alerts</span>
                      <button 
                        onClick={() => setLaunchedApp("warehouse")}
                        className="p-1 px-3 bg-[#D97706] hover:bg-[#D97706]/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* APP 4: Optical Fitting Showroom */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100/10 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Glasses className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "معرض البصريات وفني تركيب العدسات" : "4. Optical Showroom & Fitting"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "طلب النظارات الطبية، ماركات العدسات والكبس، وفواتير المبيعات." : "Interactive fitting, designer frame orders, lens cuts and checkout."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">9 Prescription ready</span>
                      <button 
                        onClick={() => setLaunchedApp("optics")}
                        className="p-1 px-3 bg-purple-600 hover:bg-purple-600/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* APP 5: Finance & General ledger cashier */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                          <Coins className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "الحسابات العامة والمركز المالي" : "5. Core General Ledger"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "شؤون الفواتير، الإيرادات المباشرة، مطالبات تأمين صحي، الأرباح والخسائر." : "Daily bookkeeping, receivables ledger, insurance and P&L charts."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">$128,450.00 Live P&L</span>
                      <button 
                        onClick={() => setLaunchedApp("accounting")}
                        className="p-1 px-3 bg-emerald-600 hover:bg-emerald-600/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* APP 6: human resources manager */}
                  <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] hover:border-[var(--clr-brand-blue)]/50 bg-[var(--clr-bg-main)]/30 hover:bg-[var(--clr-bg-card)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-slate-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100/10 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          <span>●</span> {language === "ar" ? "جاهز" : "READY"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[var(--clr-text-title)] uppercase tracking-wider">
                        {language === "ar" ? "إدارة شؤون الموظفين والمناوبات" : "6. Human Resources & Roster"}
                      </h4>
                      <p className="text-[10px] text-neutral-450 mt-1 mb-3">
                        {language === "ar" ? "الرواتب والدوام، تصفية صلاحيات الأمان والتحقق من مناوبة الأطباء." : "Manage rosters, credential profiles and security clearances."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-[var(--clr-border-light)] mt-2">
                      <span className="font-mono text-[9px] text-[var(--clr-brand-orange)] dark:text-[var(--clr-brand-blue)] font-bold">48 Staff Rostered</span>
                      <button 
                        onClick={() => setLaunchedApp("hr")}
                        className="p-1 px-3 bg-slate-600 hover:bg-slate-600/90 text-white font-extrabold text-[10px] rounded-lg transition duration-200 uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{language === "ar" ? "تشغيل" : "Launch"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
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
                language={language}
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
                language={language}
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
                onSelectRole={handleSelectRoleAndRedirect}
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

          {activeView === "tablet_apk_download" && (
            <motion.div
              key="tablet_apk_download"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <TabletApkDownload onBackToDashboard={() => setActiveView("dashboard")} language={language} />
            </motion.div>
          )}

          {activeView === "project_launch_todo" && (
            <motion.div
              key="project_launch_todo"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ProjectLaunchTodoDashboard
                language={language}
                onNotifySystem={(detail) => window.dispatchEvent(new CustomEvent("clinical-notification", { detail }))}
              />
            </motion.div>
          )}

          {activeView === "nurse_workstation" && (
            <motion.div
              key="nurse_workstation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <OphthalmicNurseWorkstation
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                language={language}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
              />
            </motion.div>
          )}

          {activeView === "optometry_workstation" && (
            <motion.div
              key="optometry_workstation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <OptometryWorkstation
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                language={language}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
              />
            </motion.div>
          )}

          {activeView === "it_infrastructure" && (
            <motion.div
              key="it_infrastructure"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ItInfrastructureDashboard language={language} />
            </motion.div>
          )}

          {activeView === "admin_control_tower" && (
            <motion.div
              key="admin_control_tower"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-6"
            >
              <AdminControlTower
                language={language}
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                activeRole={activeRole}
                onSelectRole={handleSelectRoleAndRedirect}
                onShowReport={(patientId) => setPdfReportPatientId(patientId)}
                onAddPatient={handleAddPatient}
                onDeletePatient={handleDeletePatient}
                onClearSimulatedPatients={handleClearSimulatedPatients}
                onClearAllData={handleClearAllData}
              />
            </motion.div>
          )}

          {activeView === "shift_handover" && (
            <motion.div
              key="shift_handover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ShiftHandoverNotes
                language={language}
                currentRole={activeRole}
                currentDoctorId={activeDoctorId}
                isOffline={!isOnline}
              />
            </motion.div>
          )}

          {activeView === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <SettingsScreen
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                clinicalTheme={clinicalTheme}
                setClinicalTheme={setClinicalTheme}
                activeRole={activeRole}
                setActiveRole={handleSelectRoleAndRedirect}
                activeDoctorId={activeDoctorId}
                setActiveDoctorId={setActiveDoctorId}
                doctorsList={DOCTORS_LIST}
                playNotificationSound={playNotificationSound}
                userProfilePic={userProfilePic}
                setUserProfilePic={setUserProfilePic}
                userDisplayName={userDisplayName}
                setUserDisplayName={setUserDisplayName}
                doctorSignature={doctorSignature}
                setDoctorSignature={setDoctorSignature}
                systemVolume={systemVolume}
                setSystemVolume={setSystemVolume}
                soundAlertsEnabled={soundAlertsEnabled}
                setSoundAlertsEnabled={setSoundAlertsEnabled}
                billingCurrency={billingCurrency}
                setBillingCurrency={setBillingCurrency}
                customGreetingBanner={customGreetingBanner}
                setCustomGreetingBanner={setCustomGreetingBanner}
                autoSaveInterval={autoSaveInterval}
                setAutoSaveInterval={setAutoSaveInterval}
              />
            </motion.div>
          )}

              </>
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
          setActiveRole={handleSelectRoleAndRedirect}
          patients={patients}
          onAddPatient={handleAddPatient}
          onUpdatePatient={handleUpdatePatient}
          unreadMessagesCount={unreadMessagesCount}
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

      {/* Global Interactive Real-Time Cross-Clinic Messaging Stream */}
      <HospitalMessagingMesh
        language={language}
        patients={patients}
        activeRole={activeRole}
        activeDoctorId={activeDoctorId}
        activeView={activeView}
        onUnreadCountChange={setUnreadMessagesCount}
        onSelectPatient={(pId) => {
          setSelectedPatientId(pId);
          // Auto route view to relevant workspace on context click
          const pt = patients.find(p => p.id === pId);
          if (pt) {
            if (pt.status === "Dispensing") {
              setActiveView("diagnostics_labs");
            } else if (activeRole === "nurse") {
              setActiveView("nurse_workstation");
            } else if (activeRole === "doctor") {
              setActiveView("clinical_consult");
            }
          }
        }}
      />

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

      {/* Resilient Patient Database Synchronizer Hub Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-[var(--clr-text-body)]"
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-[var(--clr-border-light)] pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? "bg-emerald-100 text-emerald-850 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-rose-100 text-rose-850 dark:bg-rose-950/20 dark:text-rose-400"}`}>
                    {isOnline ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-[var(--clr-text-title)]">
                      {language === "ar" ? "بوابة الأمان والمزامنة للمستشفى" : "CareFlow Resilient Sync Center"}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {language === "ar" ? "محرك المزامنة المتطور للملفات الطبية" : "Offline-First Hybrid LocalStorage Sync Protocol"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="p-1 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>

              {/* Server State Control Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Simulated Server Down Action Panel */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-neutral-50 dark:bg-neutral-900/30 relative flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-widest block mb-1">
                      {language === "ar" ? "محاكاة خادم السحابة السريرية" : "Clinical Cloud Simulation"}
                    </span>
                    <h4 className="font-extrabold text-[var(--clr-text-title)] text-xs mb-2">
                      {language === "ar" ? "اختبار انقطاع الاتصال الافتراضي" : "Test Network Resiliency"}
                    </h4>
                    <p className="text-[11px] text-neutral-450 leading-relaxed">
                      {language === "ar" 
                        ? "قطع الاتصال لتجريب تسجيل المرضى وتحديث الفحوصات الطبية كاملاً بوضعية الأوفلاين." 
                        : "Sever connections to test registration, dental odontograms, and lab orders operating with zero network latency."}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-[var(--clr-border-light)]">
                    <span className={`text-[10.5px] font-bold ${isOnline ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                      {isOnline 
                        ? (language === "ar" ? "الخادم: متصل" : "Status: CONNECTED") 
                        : (language === "ar" ? "الخادم: خامل" : "Status: DISCONNECTED")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setServerSimulatedOffline(!serverSimulatedOffline);
                        addSyncLog(!serverSimulatedOffline ? "Administrator simulated critical cloud outage." : "Administrator restored cloud uplink simulation.");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase cursor-pointer transition ${
                        serverSimulatedOffline
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      }`}
                    >
                      {serverSimulatedOffline 
                        ? (language === "ar" ? "تشغيل 🌐" : "GO ONLINE 🌐") 
                        : (language === "ar" ? "تعطيل ⚠️" : "BREAK PORT ⚠️")}
                    </button>
                  </div>
                </div>

                {/* Queue Summary Panel */}
                <div className="p-4 rounded-2xl border border-[var(--clr-border-light)] bg-neutral-50 dark:bg-neutral-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-widest block mb-1">
                      {language === "ar" ? "قائمة الانتظار المحلية" : "Device Sandbox Queue"}
                    </span>
                    <h4 className="font-extrabold text-[var(--clr-text-title)] text-xs mb-2 flex items-center gap-1.5">
                      {language === "ar" ? "السجلات غير المتزامنة" : "Pending Offline Mutations"}
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-600 font-bold">
                        {syncQueue.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-455 leading-relaxed">
                      {language === "ar"
                        ? "سلسلة التعديلات والملفات التي أُنشئت على هذا الجهاز وتنتظر تأكيد المزامنة مع خوادم المستشفى المركزية."
                        : "Stored records safely encrypted in the local secure cache, prepared for cloud merging."}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={!isOnline || syncQueue.length === 0 || isSyncing}
                      onClick={triggerFullSync}
                      className="flex-1 py-1.5 bg-[var(--clr-brand-blue)] hover:bg-[var(--clr-brand-blue)]/90 disabled:opacity-45 disabled:cursor-not-allowed text-white font-extrabold text-[9px] uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      {language === "ar" ? "مزامنة الآن" : "Sync Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Local Offline Queue Table */}
              <div className="mb-4">
                <span className="text-[9.5px] font-mono font-bold uppercase text-neutral-400 tracking-widest block mb-2">
                  {language === "ar" ? "تفاصيل الدفعة المتراكمة" : "Queued Mutation Transactions"}
                </span>
                {syncQueue.length > 0 ? (
                  <div className="border border-[var(--clr-border-light)] rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-405 uppercase font-mono text-[9px] border-b border-[var(--clr-border-light)]">
                        <tr>
                          <th className="p-2 py-1.5 pl-3">{language === "ar" ? "رقم المريض" : "Patient ID"}</th>
                          <th className="p-2 py-1.5">{language === "ar" ? "الاسم" : "Name"}</th>
                          <th className="p-2 py-1.5">{language === "ar" ? "نوع العملية" : "Operation"}</th>
                          <th className="p-2 py-1.5 text-right pr-3">{language === "ar" ? "الوقت" : "Cached At"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--clr-border-light)] bg-[var(--clr-bg-card)]">
                        {syncQueue.map((task) => (
                          <tr key={task.patientId} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="p-2 pl-3 font-mono font-semibold text-neutral-800 dark:text-neutral-100">{task.patientId}</td>
                            <td className="p-2 font-medium">{task.patientName}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${task.type === "create" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"}`}>
                                {task.type === "create" ? (language === "ar" ? "إنشاء جديد" : "REGISTER") : (language === "ar" ? "تعديل سريري" : "UPDATE")}
                              </span>
                            </td>
                            <td className="p-2 text-right pr-3 font-mono text-[9px] text-neutral-400">{task.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 py-8 border border-dashed border-[var(--clr-border-light)] rounded-xl text-center text-xs italic text-neutral-400 bg-neutral-50/30 dark:bg-neutral-900/10">
                    {language === "ar" ? "جميع السجلات المحلية متطابقة ومؤمنة في السحابية." : "No records pending. Everything is synchronized with CareFlow."}
                  </div>
                )}
              </div>

              {/* Real-time Gateway Logs Console */}
              <div>
                <span className="text-[9.5px] font-mono font-bold uppercase text-neutral-400 tracking-widest block mb-1.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  {language === "ar" ? "لوحة تدقيق العمليات المباشرة" : "Live Synchronization Audit Trail Logs"}
                </span>
                <div className="bg-[#0B0E14] text-[#a5b4fc] p-3 rounded-2xl h-32 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-neutral-800">
                  {syncLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-emerald-500 shrink-0">❖</span>
                      <span className={log.includes("failed") || log.includes("Outage") || log.includes("LOST") ? "text-rose-455 italic" : log.includes("succeeded") || log.includes("completed") || log.includes("RESTORED") ? "text-emerald-400 font-bold" : "text-neutral-350"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive E2E Medical System Smoke Test & Simulation Center */}
      <AnimatePresence>
        {showSmokeTestModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[var(--clr-text-body)] scrollbar-thin scrollbar-thumb-neutral-800"
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-[var(--clr-border-light)] pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-[#2BBFFF]">
                    <Sparkles className="w-5 h-5 animate-pulse text-indigo-600 dark:text-[#2BBFFF]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-[var(--clr-text-title)]">
                      {language === "ar" ? "لوحة التحكم واختبار الفحص الشامل" : "Interactive E2E System General Smoke Tester"}
                    </h3>
                    <p className="text-[10px] text-neutral-450 font-mono mt-0.5">
                      {language === "ar" ? "تشكيل فوري ومطابقة للفحوصات والقيود المحاسبية" : "Multi-Clinic Patient Journey, Pharmacy Registry & GAAP Balance Sheet Simulation"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSmokeTestModal(false)}
                  className="p-1.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/85 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>

              {/* Mounted Active Test Suite */}
              <SmokeTestSimulator
                language={language}
                patients={patients}
                onUpdatePatient={handleUpdatePatient}
                onAddPatient={handleAddPatient}
                onDeletePatient={handleDeletePatient}
                onClearSimulatedPatients={handleClearSimulatedPatients}
                onClearAllData={handleClearAllData}
              />

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stackable Dynamic Multi-Notification Overlays */}
      <NotificationStack 
        notifications={notifications}
        onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        language={language}
        mute={muteNotifications}
        onToggleMute={() => setMuteNotifications(!muteNotifications)}
      />

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
    <div className="bg-white text-neutral-800 dark:bg-[#070a13] dark:text-white p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-6 select-text max-w-4xl mx-auto transition-colors duration-200">
      <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="font-black text-base text-[var(--clr-brand-blue)] dark:text-[#2BBFFF] uppercase tracking-widest font-mono">
            ✙ {language === "ar" ? "شاشة صالة طابور الانتظار الطبية" : "AL JAWARIH LIVE ENCOUNTER DIRECTORY"}
          </h3>
          <span className="text-[10px] text-neutral-450 dark:text-neutral-400 block font-mono mt-1">
            CareFlow Waiting Queue Smart TV Simulator | Reconciled: HL7_VAL
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-[#FF841A]">BP Checked: {triageCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active consult list */}
        <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-4">
          <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 block tracking-wider uppercase">
            👉 {language === "ar" ? "غرفة تشخيص الطبيب الاستشاري" : "Encounter Treatment Rooms"}
          </span>
          <div className="space-y-2.5">
            {patients.slice(0, 3).map(p => (
              <div key={p.id} className="p-3 bg-white dark:bg-[#0F1E46] border border-neutral-200 dark:border-[#2BBFFF]/30 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-[var(--clr-brand-blue)] dark:text-[#2BBFFF] block">{p.name}</span>
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-300 font-mono italic">Clinic: {p.clinic}</span>
                </div>
                <span className="text-[10px] bg-indigo-50/50 dark:bg-[#2BBFFF]/20 text-[var(--clr-brand-blue)] dark:text-white font-mono font-black px-2 py-0.5 rounded border border-neutral-200 dark:border-[#2BBFFF]/25">
                  ROOM 412
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Triage waiting registry */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl border border-neutral-200 dark:border-[#CBD5E1]/40 space-y-4">
          <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 block tracking-wider uppercase">
            ⌛ {language === "ar" ? "قائمة انتظار الاستقبال" : "Awaiting Pre-Triage Vitals Check"}
          </span>
          <div className="space-y-2">
            {patients.slice(3, 18).map(p => (
              <div key={p.id} className="p-2.5 bg-white dark:bg-neutral-900 border border-neutral-205 dark:border-neutral-800 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-black text-neutral-800 dark:text-neutral-200 block">{p.name}</span>
                  <span className="text-[9.5px] text-neutral-500 font-mono">Registry: {p.id}</span>
                </div>
                <span className="text-[9px] font-mono text-[#FF841A] font-bold uppercase animate-pulse">
                  Unverified Vitals
                </span>
              </div>
            ))}
            {patients.length > 18 && (
              <div className="p-2 bg-neutral-100/50 dark:bg-neutral-800/30 text-[10px] text-neutral-500 text-center font-mono rounded-lg">
                {language === "ar" ? `... و ${ (patients.length - 18).toLocaleString() } ملف مريض آخر في قائمة الانتظار` : `... and ${ (patients.length - 18).toLocaleString() } more profiles in active queue`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
