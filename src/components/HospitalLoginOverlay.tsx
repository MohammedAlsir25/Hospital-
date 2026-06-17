/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  Stethoscope,
  Activity,
  UserCheck,
  Building,
  Coins,
  Globe,
  Settings,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { ClinicalRole } from "../types";

interface HospitalLoginOverlayProps {
  onLogin: (role: ClinicalRole, displayName: string, profilePic: string, signature: string, empId?: string) => void;
  language: "en" | "ar";
  theme: "light" | "dark";
}

interface ClinicalAccount {
  role: ClinicalRole;
  empId: string;
  name: string;
  title: string;
  avatarUrl: string; // empty string represent "no pic uploaded" to test task 3's fallback icon/initials
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
}

export default function HospitalLoginOverlay({
  onLogin,
  language,
  theme
}: HospitalLoginOverlayProps) {
  const isAr = language === "ar";
  const [selectedAccount, setSelectedAccount] = useState<ClinicalAccount | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [useFallbackAvatar, setUseFallbackAvatar] = useState(true); // Default true for Task 3 to showcase initials/vectors!
  const [activeTabGroup, setActiveTabGroup] = useState<"clinics" | "operations">("clinics");

  // Specialty clinics accounts (All 8 Clinics)
  const CLINIC_DOCTOR_ACCOUNTS: ClinicalAccount[] = [
    {
      role: "doctor",
      empId: "EMP-019",
      name: "Dr. Tariq Al-Farsi",
      title: "Medicine Specialty",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      borderColor: "border-emerald-150 dark:border-emerald-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-007",
      name: "Dr. Sophia Ross",
      title: "ENT Specialist",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop",
      icon: Stethoscope,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      borderColor: "border-blue-150 dark:border-blue-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-009",
      name: "Dr. Khalid Al-Zahrani",
      title: "Senior Dentist & Oral Surgeon",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      borderColor: "border-amber-150 dark:border-amber-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-001",
      name: "Dr. Alexander Sterling",
      title: "Chief Retina Surgeon",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop",
      icon: Stethoscope,
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
      borderColor: "border-teal-150 dark:border-teal-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-011",
      name: "Dr. Ryan Vance",
      title: "Glaucoma Specialist",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
      borderColor: "border-pink-150 dark:border-pink-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-013",
      name: "Dr. Liam O'Connor",
      title: "Orbit Specialist",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
      borderColor: "border-orange-150 dark:border-orange-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-015",
      name: "Dr. Chloe Bennet",
      title: "Pediatric Ophthalmologist",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      borderColor: "border-rose-150 dark:border-rose-900/60"
    },
    {
      role: "doctor",
      empId: "EMP-017",
      name: "Dr. Omar Farooq",
      title: "Ophthalmology Generalist",
      avatarUrl: "",
      icon: Stethoscope,
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
      borderColor: "border-cyan-150 dark:border-cyan-900/60"
    }
  ];

  // Operational and Support accounts
  const OPERATIONAL_ACCOUNTS: ClinicalAccount[] = [
    {
      role: "admin",
      empId: "EMP-000",
      name: "Chief IT Admin",
      title: "System Admin",
      avatarUrl: "",
      icon: Shield,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
      borderColor: "border-indigo-150 dark:border-indigo-900/60"
    },
    {
      role: "nurse",
      empId: "EMP-003",
      name: "Sister Beatrice",
      title: "Ophthalmic Nurse",
      avatarUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=256&auto=format&fit=crop",
      icon: Activity,
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
      borderColor: "border-teal-150 dark:border-teal-900/60"
    },
    {
      role: "receptionist",
      empId: "EMP-005",
      name: "Mildred Sterling",
      title: "Front Desk & Kiosk",
      avatarUrl: "",
      icon: UserCheck,
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
      borderColor: "border-pink-150 dark:border-pink-900/60"
    },
    {
      role: "pharmacist",
      empId: "EMP-008",
      name: "Chief Pharmacist",
      title: "Pharmacy Dispenser",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop",
      icon: Building,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-900/60"
    },
    {
      role: "accountant",
      empId: "EMP-012",
      name: "Albert Vance",
      title: "Finance Accountant",
      avatarUrl: "",
      icon: Coins,
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
      borderColor: "border-cyan-150 dark:border-cyan-900/60"
    },
    {
      role: "hr_manager",
      empId: "EMP-015_HR",
      name: "Director Hamad",
      title: "HR & Roster Director",
      avatarUrl: "",
      icon: Settings,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
      borderColor: "border-purple-150 dark:border-purple-900/60"
    }
  ];

  const handleSelectAccount = (acc: ClinicalAccount) => {
    setSelectedAccount(acc);
    setPin("");
    setErrorMsg("");
  };

  const handleNumericInput = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setErrorMsg("");
    }
  };

  const handleDeletePin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmitPin = () => {
    if (!selectedAccount) return;
    if (pin !== "1234") {
      setErrorMsg(isAr ? "رمز المرور خاطئ! يرجى إدخال 1234 للمحاكاة" : "Incorrect PIN! Enter passcode '1234' for sandbox access.");
      setPin("");
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg("");

    // Setup visual picture (apply custom SVG initials or default vector for task 3 if empty)
    let finalProfilePic = selectedAccount.avatarUrl;
    if (useFallbackAvatar || !finalProfilePic) {
      // Create a premium Initials SVG block using DiceBear or inline vector representation
      finalProfilePic = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedAccount.name)}&backgroundColor=4f46e5,0d9488,b91c1c,f59e0b&radius=30`;
    }

    setTimeout(() => {
      onLogin(selectedAccount.role, selectedAccount.name, finalProfilePic, selectedAccount.title);
      setIsAuthenticating(false);
    }, 1200); // Luxury biometric simulated verification delay
  };

  // ⌨️ Physical keyboard and laptop numpad keydown event listener
  useEffect(() => {
    if (!selectedAccount || isAuthenticating) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow physical number keys (0-9)
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        const num = parseInt(e.key, 10);
        if (pin.length < 4) {
          setPin(prev => prev + num);
          setErrorMsg("");
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (pin.length === 4) {
          handleSubmitPin();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAccount, pin, isAuthenticating, handleSubmitPin]);

  // Helper to extract initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBFBF9] dark:bg-[#0B0E14] flex items-center justify-center overflow-y-auto p-4 select-none">
      
      {/* Absolute decorative ambient glow (Option 2 Redefined: Golden hour & warm clinical tones) */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-amber-500/10 dark:bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]"
      >
        {/* Left Hand: Hospital Branding and Quick Accounts Deck */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EAE6DF] dark:border-neutral-800 bg-[#FBFBF9]/30 text-left">
          <div className="space-y-4">
            {/* Clinical Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-extrabold shadow-md relative shrink-0">
                <span className="w-1.5 h-4 bg-white rounded-full absolute rotate-90"></span>
                <span className="w-1.5 h-4 bg-white rounded-full absolute"></span>
              </div>
              <div>
                <h1 className="font-sans font-extrabold tracking-tight text-[13px] text-neutral-800 dark:text-neutral-100 uppercase leading-tight">
                  {isAr ? "مستشفى الجوارح التخصصي للعيون" : "AL JAWARIH EYE HOSPITAL"}
                </h1>
                <span className="text-[9px] font-mono text-[#F59E0B] dark:text-[#2BBFFF] uppercase tracking-wider block font-black">
                  {isAr ? "بوابة الأمان والربط الموحد للوردية" : "Clinical Workstation Authentication Gateway"}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-1">
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-neutral-200">
                {isAr ? "اختر الحساب وبوابة العيادة للولوج" : "Select Workstation Profile & Role"}
              </h2>
              <p className="text-[11px] text-[#8F8A7D] dark:text-neutral-450 leading-relaxed max-w-md">
                {isAr
                  ? "أنظمة الولوج الموثوقة لمستشفى الجوارح. سيتم إرسالك وتثبيتك تلقائياً في واجهتك المخصصة ومنع تخطي الصلاحيات."
                  : "All accounts are role-locked to preserve strict administrative and financial boundaries. Logging in will route you strictly to your designated clinic terminal."}
              </p>
            </div>

            {/* Elegant Tab Switcher */}
            <div className="flex border-b border-[#EAE6DF] dark:border-neutral-800 gap-4 mt-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveTabGroup("clinics")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                  activeTabGroup === "clinics"
                    ? "text-[#4F46E5] dark:text-indigo-400 font-extrabold"
                    : "text-[#8F8A7D] hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                {isAr ? "العيادات التخصصية (٨)" : "Specialty Clinics (8)"}
                {activeTabGroup === "clinics" && (
                  <motion.div layoutId="loginActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5] dark:bg-indigo-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTabGroup("operations")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                  activeTabGroup === "operations"
                    ? "text-[#4F46E5] dark:text-indigo-400 font-extrabold"
                    : "text-[#8F8A7D] hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                {isAr ? "الإدارة والتشغيل والمالية" : "Operations & Admin"}
                {activeTabGroup === "operations" && (
                  <motion.div layoutId="loginActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5] dark:bg-indigo-400" />
                )}
              </button>
            </div>

            {/* Micro Account Grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {(activeTabGroup === "clinics" ? CLINIC_DOCTOR_ACCOUNTS : OPERATIONAL_ACCOUNTS).map(acc => {
                const isSel = selectedAccount?.empId === acc.empId;
                const matchesPic = acc.avatarUrl && !useFallbackAvatar;

                return (
                  <button
                    key={acc.empId}
                    onClick={() => handleSelectAccount(acc)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                      isSel
                        ? "bg-white dark:bg-[#181C28] border-[#4F46E5] dark:border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.08)] scale-[1.01]"
                        : "bg-white dark:bg-neutral-900/40 border-[#EAE6DF] dark:border-neutral-800 hover:border-[#4F46E5]/30 hover:shadow-md"
                    }`}
                  >
                    {/* Task 3 Icon/Avatar Fallback visual check block */}
                    <div className="relative shrink-0">
                      {matchesPic ? (
                        <img
                          src={acc.avatarUrl}
                          alt={acc.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                      ) : (
                        // Fallback vector icon showing profile initials with vibrant corporate clinical gradients (Task 3 compliant)
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs shadow-inner uppercase tracking-wider relative ${acc.color} border`}>
                          <span>{getInitials(acc.name)}</span>
                          <span className="absolute bottom-[-2px] right-[-2px] rounded-full p-0.5 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800">
                            <acc.icon className="w-2 h-2" />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[11px] font-black text-slate-800 dark:text-neutral-200 truncate">
                        {acc.name}
                      </h3>
                      <p className="text-[9.5px] text-neutral-450 truncate uppercase font-bold tracking-wider">
                        {isAr ? acc.title : acc.title}
                      </p>
                    </div>

                    {isSel && (
                      <span className="w-1.5 h-1.5 bg-[#4F46E5] dark:bg-indigo-400 rounded-full absolute top-2 right-2 animate-ping"></span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Task 3 UI controller toggle */}
            <div className="flex items-center gap-2 pt-2 text-[#8F8A7D] dark:text-neutral-400 select-none">
              <input 
                type="checkbox" 
                id="use_fallback_avatar_checkbox"
                checked={useFallbackAvatar}
                onChange={(e) => setUseFallbackAvatar(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#4F46E5] rounded cursor-pointer"
              />
              <label htmlFor="use_fallback_avatar_checkbox" className="text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer select-none">
                {isAr ? "إظهار رمز الهوية الافتراضي كبديل للصورة (الخيار 3)" : "Force Vector Initial Fallback Icon (Task 3)"}
              </label>
            </div>
          </div>

          <div className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 pt-6 mt-4 border-t border-dashed border-[#EAE6DF] dark:border-neutral-850">
            {isAr
              ? "نظام الموثوقية الطبية والمالية الموحدة لمجموعة مستشفيات الجوارح التخصصية."
              : "Enterprise security architecture built on HIPAA, GDPR and Dubai Healthcare Authority compliance rules."}
          </div>
        </div>

        {/* Right Hand: Passcode Authentication Pad */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#151926]/40 relative">
          
          <AnimatePresence mode="wait">
            {!selectedAccount ? (
              <motion.div
                key="no-acc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-neutral-800/40 border-2 border-dashed border-neutral-300 dark:border-neutral-750 flex items-center justify-center text-slate-400">
                  <Fingerprint className="w-8 h-8 animate-pulse text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#0F172A] dark:text-neutral-200">
                    {isAr ? "في انتظار اختيار الحساب" : "Awaiting Account Selection"}
                  </h3>
                  <p className="text-[10px] text-neutral-400 max-w-[200px] leading-relaxed mx-auto">
                    {isAr ? "انقر على أحد الكوادر الطبية على اليسار للفتح" : "Please tap any clinical specialist on the left panel to verify your identity."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pad-active"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between space-y-5"
              >
                <div className="text-center space-y-3">
                  {/* Selected Avatar / Falling Back Icon preview */}
                  <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-neutral-100 dark:border-neutral-850 relative bg-[#FBFBF9]">
                    {selectedAccount.avatarUrl && !useFallbackAvatar ? (
                      <img
                        src={selectedAccount.avatarUrl}
                        alt="Selected User"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback vector icon
                      <div className={`w-full h-full flex items-center justify-center font-mono font-bold text-sm ${selectedAccount.color}`}>
                        {getInitials(selectedAccount.name)}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 p-0.5 bg-emerald-550 rounded-full w-2.5 h-2.5 shadow border border-white"></span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-800 dark:text-neutral-150">
                      {selectedAccount.name}
                    </h3>
                    <p className="text-[9px] text-[#4F46E5] dark:text-indigo-400 font-mono font-black uppercase tracking-wider">
                      {isAr ? "بوابة الأمان قيد التأهيل" : `${selectedAccount.role.toUpperCase()} COMPLIANCE SECURED`}
                    </p>
                  </div>
                </div>

                {/* PIN dots display */}
                <div className="space-y-2">
                  <div className="flex justify-center items-center gap-3.5 bg-neutral-50 dark:bg-[#0E1019] border border-[#EAE6DF] dark:border-neutral-800 py-3 rounded-2xl max-w-sm mx-auto relative overflow-hidden">
                    {[0, 1, 2, 3].map(idx => (
                      <span
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                          pin.length > idx
                            ? "bg-[#4F46E5] border-[#4F46E5] dark:bg-indigo-400 dark:border-indigo-400 scale-110"
                            : "bg-neutral-200/50 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700"
                        }`}
                      ></span>
                    ))}
                    
                    {/* Toggle Pin visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 transition"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showPin && pin.length > 0 && (
                    <div className="text-center text-[10px] font-mono tracking-widest text-[#F59E0B] font-bold">
                      {pin}
                    </div>
                  )}

                  {errorMsg && (
                    <p className="text-[10px] font-bold text-rose-500 text-center animate-bounce flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>

                {/* Numeric keypad (Option 2 Redefined styling) */}
                <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumericInput(num)}
                      className="h-10 w-16 bg-[#FBFBF9]/80 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-850 hover:border-[#4F46E5] rounded-xl text-xs font-bold text-slate-800 dark:text-neutral-250 cursor-pointer hover:bg-[#4F46E5]/10 active:scale-95 transition flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleDeletePin}
                    className="h-10 w-16 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl text-[10px] text-neutral-450 font-bold active:scale-95 transition flex items-center justify-center"
                  >
                    {isAr ? "مسح" : "Del"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNumericInput(0)}
                    className="h-10 w-16 bg-[#FBFBF9]/80 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-850 hover:border-[#4F46E5] rounded-xl text-xs font-bold text-slate-800 dark:text-neutral-250 cursor-pointer hover:bg-[#4F46E5]/10 active:scale-95 transition flex items-center justify-center animate-in"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitPin}
                    disabled={isAuthenticating || pin.length < 4}
                    className={`h-10 w-16 text-[10px] font-extrabold uppercase rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center ${
                      pin.length === 4
                        ? "bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-md"
                        : "bg-neutral-100 text-neutral-450 dark:bg-neutral-800/50 cursor-not-allowed"
                    }`}
                  >
                    {isAuthenticating ? (
                      <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      isAr ? "دخول" : "Verify"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[9.5px] font-mono text-[#8F8A7D]">
                    {isAr ? "ملاحظة: أدخل رمز المحاكاة 1234" : "Demo PIN code is: "}
                    <strong className="text-[#4F46E5] font-black underline">1234</strong>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

    </div>
  );
}
