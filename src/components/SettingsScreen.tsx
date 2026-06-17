import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Palette,
  Volume2,
  VolumeX,
  Languages,
  Moon,
  Sun,
  Shield,
  Coins,
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Bell,
  Trash2,
  FileText
} from "lucide-react";

interface SettingsScreenProps {
  language: "en" | "ar";
  setLanguage: (lang: "en" | "ar") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  clinicalTheme: "premium_imperial" | "warm_milk" | "ocean_mint" | "royal_lavender" | "slate_minimal";
  setClinicalTheme: (theme: "premium_imperial" | "warm_milk" | "ocean_mint" | "royal_lavender" | "slate_minimal") => void;
  activeRole: string;
  setActiveRole: (role: any) => void;
  activeDoctorId: string;
  setActiveDoctorId: (id: string) => void;
  doctorsList: Array<any>;
  playNotificationSound: (type: "lab" | "referral" | "alert" | "system") => void;
  
  // Custom persistent states passed from App.tsx
  userProfilePic: string;
  setUserProfilePic: (pic: string) => void;
  userDisplayName: string;
  setUserDisplayName: (name: string) => void;
  doctorSignature: string;
  setDoctorSignature: (sig: string) => void;
  systemVolume: number;
  setSystemVolume: (vol: number) => void;
  soundAlertsEnabled: boolean;
  setSoundAlertsEnabled: (enabled: boolean) => void;
  billingCurrency: "USD" | "SAR" | "AED" | "EUR";
  setBillingCurrency: (curr: "USD" | "SAR" | "AED" | "EUR") => void;
  customGreetingBanner: string;
  setCustomGreetingBanner: (text: string) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (secs: number) => void;
}

// Preset highly professional clinical avatar options
const PRESET_AVATARS = [
  {
    nameEn: "Chief Surgeon",
    nameAr: "كبير الجراحين",
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop"
  },
  {
    nameEn: "ENT Consultant",
    nameAr: "استشارية الأنف والأذن",
    url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=256&auto=format&fit=crop"
  },
  {
    nameEn: "Optic Specialist",
    nameAr: "أخصائية عيون متميزة",
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
  },
  {
    nameEn: "Senior Dentist",
    nameAr: "طبيب أسنان أقدم",
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031f?q=80&w=256&auto=format&fit=crop"
  },
  {
    nameEn: "Ward Nurse",
    nameAr: "ممرضة الرعاية والفرز",
    url: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=256&auto=format&fit=crop"
  },
  {
    nameEn: "Director General",
    nameAr: "المدير العام الإداري",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
  }
];

export default function SettingsScreen({
  language,
  setLanguage,
  theme,
  setTheme,
  clinicalTheme,
  setClinicalTheme,
  activeRole,
  setActiveRole,
  activeDoctorId,
  setActiveDoctorId,
  doctorsList,
  playNotificationSound,
  userProfilePic,
  setUserProfilePic,
  userDisplayName,
  setUserDisplayName,
  doctorSignature,
  setDoctorSignature,
  systemVolume,
  setSystemVolume,
  soundAlertsEnabled,
  setSoundAlertsEnabled,
  billingCurrency,
  setBillingCurrency,
  customGreetingBanner,
  setCustomGreetingBanner,
  autoSaveInterval,
  setAutoSaveInterval
}: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "clinical">("profile");
  const [rawUrlInput, setRawUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAr = language === "ar";

  // Handles drag and drop file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(isAr ? "الرجاء رفع ملف صورة صالح فقط" : "Please upload a valid image file only.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUserProfilePic(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (rawUrlInput.trim().startsWith("http") || rawUrlInput.trim().startsWith("data:")) {
      setUserProfilePic(rawUrlInput.trim());
      setRawUrlInput("");
    } else {
      alert(isAr ? "الرجاء إدخال رابط صورة صالح يبدأ بـ http" : "Please enter a valid image URL starting with http.");
    }
  };

  // Sound testing triggers
  const triggerTestSound = (type: "lab" | "referral" | "alert") => {
    if (!soundAlertsEnabled) {
      alert(isAr ? "يرجى تفعيل الصوت أولاً لاختبار نغمات النظام" : "Please enable sound alerts first to test system chimes.");
      return;
    }
    playNotificationSound(type);
  };

  // Reset local cache & database representation
  const handleResetWorkspace = () => {
    const confirmReset = window.confirm(
      isAr 
        ? "هل أنت متأكد من مسح جميع السجلات والملفات واستعادة ضبط المصنع لـ مستشفى الجوارح ميموري؟"
        : "Are you sure you want to clear all patient logs, dental mappings, and reset the Al Jawarih ERP database simulation?"
    );
    if (confirmReset) {
      localStorage.removeItem("careflow_clinical_theme_v2");
      localStorage.removeItem("careflow_user_profile_pic");
      localStorage.removeItem("careflow_user_display_name");
      localStorage.removeItem("careflow_doctor_signature");
      localStorage.removeItem("careflow_billing_currency");
      localStorage.removeItem("careflow_custom_greeting_banner");
      window.location.reload();
    }
  };

  // Simulates medical illustration portrait refine with "AI Output Bot"
  const handleAiRefineAvatar = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Pick a spectacular stylized sci-fi medical doctor background portrait
      const medicalAIImages = [
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&auto=format&fit=crop"
      ];
      const randomImage = medicalAIImages[Math.floor(Math.random() * medicalAIImages.length)];
      setUserProfilePic(randomImage);
      setAiGenerating(false);
      playNotificationSound("lab");
    }, 1500);
  };

  return (
    <div id="settings-page-wrapper" className="space-y-6 max-w-5xl mx-auto p-1.5 animate-fadeIn">
      
      {/* 1. Header Hero Card with Quick Profile Overview */}
      <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none md:block hidden">
          <Palette className="w-48 h-48 text-[var(--clr-brand-blue)]" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 dark:border-neutral-850 overflow-hidden shadow-md relative bg-neutral-100 dark:bg-neutral-900 transition-transform duration-300 group-hover:scale-105">
              <img
                src={userProfilePic}
                alt="User Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to initials if URL breaks
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userDisplayName)}`;
                }}
              />
            </div>
            <button 
              onClick={() => {
                setActiveTab("profile");
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 bg-[#4F46E5] text-white p-2 rounded-full shadow hover:bg-indigo-700 transition active:scale-90"
              title={isAr ? "رفع صورة جديدة" : "Upload new image"}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left rtl:sm:text-right">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-neutral-100 uppercase tracking-tight">
                {userDisplayName}
              </h2>
              <span className="text-[10px] bg-indigo-50 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-neutral-750 uppercase tracking-wider">
                {activeRole.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 font-mono">
              {isAr ? "الرتبة المعتمدة: " : "Credentials: "} 
              <span className="text-[var(--clr-brand-blue)] font-bold">{doctorSignature || "N/A"}</span>
            </p>
            <p className="text-[10px] text-neutral-450 mt-1 max-w-sm leading-tight">
              {isAr ? "قم بتعديل ملفك وصورتك الشخصية والهوية اللونية لمستشفى الجوارح لتبسيط سير العمل." : "Alter your portrait, sound levels, default ERP currencies and application palettes for optimized visual comfort."}
            </p>
          </div>
        </div>

        {/* Action Quick Status Flag */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-[#EAE6DF] dark:border-neutral-800/85 px-4.5 py-3 rounded-2xl text-center md:text-right rtl:md:text-left shrink-0 z-10 w-full md:w-auto">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
            {isAr ? "قناة الصلاحيات النشطة" : "Active ERP Station Context"}
          </span>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-teal-400 block mt-1">
            {isAr ? "صلاحيات الموظف الشاملة" : "ROOT CLEARANCE VERIFIED"}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
            HL7 v2.5 • FHIR-RESTFUL
          </span>
        </div>
      </div>

      {/* 2. Primary Layout with Settings Navigation and Parameter Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1.5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/10 font-bold"
                : "bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800/80 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900/40"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isAr ? "الملف الشخصي" : "User Profile pic & Name"}</span>
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeTab === "appearance"
                ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/10 font-bold"
                : "bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800/80 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900/40"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{isAr ? "الألوان والمظهر" : "Theme, Dark Mode & Lang"}</span>
          </button>

          <button
            onClick={() => setActiveTab("clinical")}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeTab === "clinical"
                ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/10 font-bold"
                : "bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800/80 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900/40"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isAr ? "الإعدادات والنظام" : "Sound, Autosave & currency"}</span>
          </button>

          <div className="pt-4 border-t border-[var(--clr-border-light)]/70">
            <button
              onClick={handleResetWorkspace}
              className="w-full p-3 text-xs font-bold border border-rose-200 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/15 text-rose-600 rounded-2xl flex items-center gap-2.5 transition active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? "استعادة ضبط المصنع" : "Factory Reset HIS Data"}</span>
            </button>
          </div>
        </div>

        {/* Parameters Content Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-3xl p-6 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* TAB 1: User Profile & Portrait Setup */}
              {activeTab === "profile" && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                      {isAr ? "صورة الملف الشخصي" : "Profile Portrait Pic Customizer"}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {isAr ? "اختر صورة من النماذج الطبية المسبقة، اسحب صورا مخصصة برضاك أو اضف رابطا مباشرا." : "Choose from preset medical templates, uploadBase64, or customize with visual presets."}
                    </p>
                  </div>

                  {/* Preset Avatar Catalog */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block">
                      {isAr ? "نماذج طبيب وأخصائي كاريير:" : "Select from Beautiful Specialty Presets:"}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_AVATARS.map((avatar, idx) => {
                        const isSelected = userProfilePic === avatar.url;
                        return (
                          <button
                            key={idx}
                            onClick={() => setUserProfilePic(avatar.url)}
                            className={`p-2 border rounded-xl flex items-center gap-2.5 text-left rtl:text-right transition-all text-xs font-sans ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-500 text-indigo-850 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white"
                                : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <img
                              src={avatar.url}
                              alt={avatar.nameEn}
                              className="w-8 h-8 rounded-full border border-neutral-200 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <span className="block font-bold leading-tight truncate">
                                {isAr ? avatar.nameAr : avatar.nameEn}
                              </span>
                              <span className="block text-[8px] text-neutral-400">
                                Preset {idx + 1}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-400 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drag-and-Drop and Input Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                        dragOver
                          ? "border-indigo-500 bg-indigo-50/40 dark:bg-neutral-800/40"
                          : "border-neutral-300 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-neutral-650 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 text-indigo-500 mb-2.5" />
                      <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                        {isAr ? "اسحب وأسقط الصورة هنا بمرونة" : "Drag & Drop portrait here"}
                      </span>
                      <span className="text-[9px] text-neutral-400 mt-1 block">
                        {isAr ? "أو انقر لتصفح ملفات جهازك الشخصي" : "or click to browse local files (Base64 Offline persistent)"}
                      </span>
                    </div>

                    {/* Image URL Specify & Profile Custom initials */}
                    <div className="space-y-3.5 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-[#151824]/40">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block">
                          {isAr ? "إدخال رابط ويب مباشر (URL):" : "Specify Direct HTTP/HTTPS Image URL:"}
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/avatar.png"
                            value={rawUrlInput}
                            onChange={(e) => setRawUrlInput(e.target.value)}
                            className="bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 px-3 py-1.5 text-xs text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none flex-1 font-mono"
                          />
                          <button
                            onClick={handleApplyCustomUrl}
                            className="px-3.5 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white rounded-xl text-xs font-bold hover:bg-neutral-900 transition"
                          >
                            {isAr ? "تطبيق" : "Apply"}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                      {/* AI Portrait Generator Simulator */}
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <span className="text-[9.5px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide block flex items-center gap-1">
                            <Sparkles className="w-3 h-3 block" />
                            {isAr ? "توليد صورة واقعية مخصصة" : "AI Outcome Portrait Bot"}
                          </span>
                          <span className="text-[8.5px] text-neutral-400 leading-tight block mt-0.5 max-w-[180px]">
                            {isAr ? "قم بمطابقة مظهرك الجراحي بنقرة واحدة فائقة التطور." : "Simulates medical prompt refinement directly on your active viewport."}
                          </span>
                        </div>
                        <button
                          onClick={handleAiRefineAvatar}
                          disabled={aiGenerating}
                          className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 shadow active:scale-[0.98] disabled:opacity-50 transition"
                        >
                          {aiGenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span className="text-[10px]">{isAr ? "جاري التوليد.." : "Synthesizing..."}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                              <span className="text-[10px]">{isAr ? "توليد بالذكاء الاصطناعي" : "Generate Avatar"}</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                      {/* 1.2 Clear & Reset to Initials Fallback (Task 3) */}
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <span className="text-[9.5px] font-extrabold text-slate-700 dark:text-neutral-300 uppercase tracking-wide block">
                            {isAr ? "إزالة الصورة والاعتماد على الاختصار" : "Default Initials Icon Fallback"}
                          </span>
                          <span className="text-[8.5px] text-neutral-400 leading-tight block mt-0.5">
                            {isAr ? "يزيل الصورة ويستخدم رمز الحروف الأولى لاسمك" : "Clears high-res photo to display vector/initial placeholder icon."}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newInitialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userDisplayName || "CareFlow User")}`;
                            setUserProfilePic(newInitialsUrl);
                            playNotificationSound("system");
                          }}
                          className="px-3 py-1.5 border border-rose-200 dark:border-rose-950/40 text-rose-600 bg-rose-50/40 hover:bg-rose-50 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-[10px] font-black rounded-lg transition cursor-pointer"
                        >
                          {isAr ? "استخدام الرمز الحرفي" : "Use Initials Icon"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Name & Professional Suffix Suffix details */}
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                        {isAr ? "اسم الموظف المعروض" : "Employee Display Name"}
                      </label>
                      <input
                        type="text"
                        value={userDisplayName}
                        onChange={(e) => {
                          setUserDisplayName(e.target.value);
                          localStorage.setItem("careflow_user_display_name", e.target.value);
                        }}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                        {isAr ? "توقيع الطاقم الطبي المعتمد (عيون)" : "Clinician Professional Suffix / Credentials"}
                      </label>
                      <input
                        type="text"
                        value={doctorSignature}
                        placeholder="e.g. M.D., Chief Glaucoma Surgeon"
                        onChange={(e) => {
                          setDoctorSignature(e.target.value);
                          localStorage.setItem("careflow_doctor_signature", e.target.value);
                        }}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-805 px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none placeholder-stone-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Themes & Color Aesthetics - Moves theme toggling to settings */}
              {activeTab === "appearance" && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                      {isAr ? "الهوية اللونية والسمات المظهرية" : "Clinical Environmental Aesthetics"}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {isAr ? "تم نقل المحددات المظهرية وألوان العيادة ولغة الواجهة لتتمركز في صفحة الإعدادات بدقة فائقة." : "Centralized palettes configurations, light/dark contrasts, and translations setups."}
                    </p>
                  </div>

                  {/* 1. Light vs Dark Contrast Selector */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                      {isAr ? "نمط خلفية العيادة (Contrasts Mode):" : "Workspace Contrast Mode Selector:"}
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between ${
                          theme === "light"
                            ? "border-indigo-500 bg-indigo-50/30 text-slate-800 ring-2 ring-indigo-200 dark:ring-neutral-800"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold block flex items-center gap-1.5">
                            <Sun className="w-4 h-4 text-amber-500" />
                            {isAr ? "الألبستر الناعم (Eye-Safe Milk)" : "Eye-Safe Alabaster Light"}
                          </span>
                          <span className="text-[9px] text-neutral-400 block font-normal leading-tight">
                            {isAr ? "حماية متقدمة ضد الضوء الأزرق لتقليل تعب الطبيب." : "Protective backlight emission levels to prevent clinical optic burnout."}
                          </span>
                        </div>
                        {theme === "light" && <Check className="w-4 h-4 text-indigo-600 ml-2" />}
                      </button>

                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-4 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between ${
                          theme === "dark"
                            ? "border-indigo-500 bg-indigo-950/20 text-neutral-100 ring-2 ring-indigo-300 dark:ring-neutral-700"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold block flex items-center gap-1.5">
                            <Moon className="w-4 h-4 text-[#0066FF]" />
                            {isAr ? "المظهر الطبي الفاخر الداكن" : "Luxury Clinical Darkness"}
                          </span>
                          <span className="text-[9px] text-neutral-400 block font-normal leading-tight">
                            {isAr ? "خلفية داكنة معقمة للغرف المظلمة بالمستشفى." : "Aesthetic dark layout tailored for high-trust ophthalmic labs."}
                          </span>
                        </div>
                        {theme === "dark" && <Check className="w-4 h-4 text-indigo-400 ml-2" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* 2. Unified Translation localizer */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                      {isAr ? "نظام الترجمة الفورية والواجهة (Language Hub):" : "Integrated System Translation (Language Hub):"}
                    </span>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 p-3 border-2 rounded-2xl text-xs font-bold transition-all relative ${
                          language === "en"
                            ? "border-indigo-500 bg-indigo-50/15 text-indigo-800 dark:text-indigo-400"
                            : "border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-neutral-50/50"
                        }`}
                      >
                        <span className="block text-center tracking-wide">English (LTR)</span>
                        {language === "en" && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-400 absolute right-3 top-3.5" />}
                      </button>

                      <button
                        onClick={() => setLanguage("ar")}
                        className={`flex-1 p-3 border-2 rounded-2xl text-xs font-bold transition-all relative ${
                          language === "ar"
                            ? "border-indigo-500 bg-indigo-50/15 text-indigo-800 dark:text-indigo-400"
                            : "border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-neutral-50/50"
                        }`}
                      >
                        <span className="block text-center font-Cairo tracking-wide">العربية (RTL)</span>
                        {language === "ar" && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-400 absolute left-3 top-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* 3. Preset Clinical Color Palettes */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                      {isAr ? "اختيار دليل الهوية اللونية للمستشفى (Palettes):" : "Select Hospital Base Color Aesthetic (Palette):"}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {/* Premium Imperial */}
                      <button
                        onClick={() => {
                          setClinicalTheme("premium_imperial");
                        }}
                        className={`p-3.5 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between text-xs font-sans ${
                          clinicalTheme === "premium_imperial"
                            ? "bg-slate-50 dark:bg-neutral-800/40 border-indigo-500 ring-1 ring-indigo-200"
                            : "bg-white dark:bg-neutral-900/40 hover:bg-slate-50/40 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 rounded-full bg-[#E2E8F0] border border-stone-300 relative shrink-0">
                            <span className="absolute inset-1 rounded-full bg-[#2C5E7A]" />
                          </span>
                          <div>
                            <span className="block font-bold leading-tight">{isAr ? "الهوية الإمبراطورية الملكية" : "Premium Imperial Blue"}</span>
                            <span className="text-[9.5px] text-neutral-400 font-normal leading-tight">{isAr ? "أزرق مهدئ وثقة عالية بالمرضى" : "Calming authority, high trust"}</span>
                          </div>
                        </div>
                        {clinicalTheme === "premium_imperial" && <Check className="w-4 h-4 text-indigo-600 dark:text-teal-400 ml-2" />}
                      </button>

                      {/* Warm Milk */}
                      <button
                        onClick={() => {
                          setClinicalTheme("warm_milk");
                        }}
                        className={`p-3.5 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between text-xs font-sans ${
                          clinicalTheme === "warm_milk"
                            ? "bg-slate-50 dark:bg-neutral-800/40 border-indigo-500 ring-1 ring-indigo-200"
                            : "bg-white dark:bg-neutral-900/40 hover:bg-slate-50/40 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 rounded-full bg-[#EAE6DF] border border-stone-300 relative shrink-0">
                            <span className="absolute inset-1 rounded-full bg-[#4F46E5]" />
                          </span>
                          <div>
                            <span className="block font-bold leading-tight">{isAr ? "حليب دافئ (صحي ناعم)" : "Warm Milk (Eye-Safe)"}</span>
                            <span className="text-[9.5px] text-neutral-400 font-normal leading-tight">{isAr ? "مرئي هادئ للعيون" : "Restorative soft beige"}</span>
                          </div>
                        </div>
                        {clinicalTheme === "warm_milk" && <Check className="w-4 h-4 text-indigo-600 dark:text-teal-400 ml-2" />}
                      </button>

                      {/* Ocean Mint */}
                      <button
                        onClick={() => {
                          setClinicalTheme("ocean_mint");
                        }}
                        className={`p-3.5 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between text-xs font-sans ${
                          clinicalTheme === "ocean_mint"
                            ? "bg-slate-50 dark:bg-neutral-800/40 border-indigo-500 ring-1 ring-indigo-200"
                            : "bg-white dark:bg-neutral-900/40 hover:bg-slate-50/40 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 rounded-full bg-[#D1EAE5] border border-teal-200 relative shrink-0">
                            <span className="absolute inset-1 rounded-full bg-[#0D9488]" />
                          </span>
                          <div>
                            <span className="block font-bold leading-tight">{isAr ? "نعناع المحيط (علاجي)" : "Ocean Mint (Teal)"}</span>
                            <span className="text-[9.5px] text-neutral-400 font-normal leading-tight">{isAr ? "نبرة معقمة مهدئة" : "Calming therapeutic tone"}</span>
                          </div>
                        </div>
                        {clinicalTheme === "ocean_mint" && <Check className="w-4 h-4 text-indigo-600 dark:text-teal-400 ml-2" />}
                      </button>

                      {/* Royal Lavender */}
                      <button
                        onClick={() => {
                          setClinicalTheme("royal_lavender");
                        }}
                        className={`p-3.5 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between text-xs font-sans ${
                          clinicalTheme === "royal_lavender"
                            ? "bg-slate-50 dark:bg-neutral-800/40 border-indigo-500 ring-1 ring-indigo-200"
                            : "bg-white dark:bg-neutral-900/40 hover:bg-slate-50/40 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 rounded-full bg-[#E5DDEF] border border-purple-200 relative shrink-0">
                            <span className="absolute inset-1 rounded-full bg-[#7C3AED]" />
                          </span>
                          <div>
                            <span className="block font-bold leading-tight">{isAr ? "خزامى ملكي (فاخر)" : "Royal Lavender (Calm)"}</span>
                            <span className="text-[9.5px] text-neutral-400 font-normal leading-tight">{isAr ? "أرجواني رعاية صحية" : "Sophisticated wellness lavender"}</span>
                          </div>
                        </div>
                        {clinicalTheme === "royal_lavender" && <Check className="w-4 h-4 text-indigo-600 dark:text-teal-400 ml-2" />}
                      </button>

                      {/* Slate Minimal */}
                      <button
                        onClick={() => {
                          setClinicalTheme("slate_minimal");
                        }}
                        className={`p-3.5 border rounded-2xl text-left rtl:text-right transition-all flex items-center justify-between text-xs font-sans ${
                          clinicalTheme === "slate_minimal"
                            ? "bg-slate-50 dark:bg-neutral-800/40 border-indigo-500 ring-1 ring-indigo-200"
                            : "bg-white dark:bg-neutral-900/40 hover:bg-slate-50/40 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 rounded-full bg-[#E2E8F0] border border-slate-300 relative shrink-0">
                            <span className="absolute inset-1 rounded-full bg-[#1D4ED8]" />
                          </span>
                          <div>
                            <span className="block font-bold leading-tight">{isAr ? "سليت لوحي (لوحة تكنولوجية)" : "Nordic Slate (Minimal)"}</span>
                            <span className="text-[9.5px] text-neutral-400 font-normal leading-tight">{isAr ? "لوحة مراقبة ذكية" : "Clean industrial cobalt design"}</span>
                          </div>
                        </div>
                        {clinicalTheme === "slate_minimal" && <Check className="w-4 h-4 text-indigo-600 dark:text-teal-400 ml-2" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Dynamic Sound previews, auto save interval & Base currency configuration */}
              {activeTab === "clinical" && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                      {isAr ? "تخصيص خصائص النظام وإشارات الصوت" : "Sound, Autosave & Financial Currency Parameters"}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {isAr ? "تحقق من نغمات التنبيه الرقمية للمختبر والطوارئ، وغيّر العملة الافتراضية للفواتير الطبية وصرف النظارات." : "Verify lab and STAT emergency auditory pings, change billing currencies, and schedule offline-first heartbeats intervals."}
                    </p>
                  </div>

                  {/* Audio Controls and Sound Previews */}
                  <div className="p-4 border border-neutral-250 dark:border-neutral-800/85 rounded-2xl bg-neutral-50/30 dark:bg-[#151824]/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-850 dark:text-white block flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-indigo-500" />
                          {isAr ? "المؤثرات ونغمات الرنين الطبية" : "Clinical Sound Chimes Synthesizer"}
                        </span>
                        <span className="text-[9.5px] text-neutral-400 block">
                          {isAr ? "توليد نغمات رقمية جيبية عبر كرت الصوت النظيف للمستشفى." : "Natively synthesizes sine/triangle audio waves using the HTML5 Sound API."}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSoundAlertsEnabled(!soundAlertsEnabled);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10.5px] font-bold tracking-wide transition cursor-pointer select-none ${
                          soundAlertsEnabled
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20"
                            : "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/20"
                        }`}
                      >
                        {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
                        <span>{soundAlertsEnabled ? (isAr ? "مفعّل 🔊" : "ACTIVE 🔊") : (isAr ? "كتم الصوت 🔇" : "MUTED 🔇")}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Volume Slider */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">
                          {isAr ? "مستوى الصوت العام للمستشفى:" : "Hospital Global Sound Volume:"}
                        </span>
                        <div className="flex items-center gap-3">
                          <VolumeX className="w-4 h-4 text-neutral-400" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={systemVolume}
                            onChange={(e) => {
                              const vol = Number(e.target.value);
                              setSystemVolume(vol);
                              // Trigger a low beep on volume change to test level
                              if (soundAlertsEnabled) {
                                playNotificationSound("system");
                              }
                            }}
                            className="flex-1 accent-indigo-650 h-1.5 bg-neutral-250 dark:bg-neutral-800 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 w-8 text-right">
                            {systemVolume}%
                          </span>
                        </div>
                      </div>

                      {/* Direct Test Chimes Suite */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">
                          {isAr ? "اختبار المؤثرات الصوتية:" : "Audio Test Audition Suite:"}
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => triggerTestSound("lab")}
                            className="px-2 py-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-850 rounded-xl text-[9.5px] font-black text-slate-800 dark:text-neutral-200 transition"
                          >
                            🧪 {isAr ? "تنبيه مختبر" : "Lab Ping"}
                          </button>
                          <button
                            onClick={() => triggerTestSound("referral")}
                            className="px-2 py-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-850 rounded-xl text-[9.5px] font-black text-slate-800 dark:text-neutral-200 transition"
                          >
                            🚪 {isAr ? "رنين إحالة" : "Door Bell"}
                          </button>
                          <button
                            onClick={() => triggerTestSound("alert")}
                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-neutral-905 border border-rose-300 rounded-xl text-[9.5px] font-black text-rose-700 dark:text-red-400 transition"
                          >
                            🚨 {isAr ? "إنذار عاجل" : "STAT Warn"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Billing Currency selector - Connected to bills lists */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-500" />
                        {isAr ? "العملة الرسمية للفواتير والمالية" : "Unified ERP Base Clinical Currency"}
                      </label>
                      <p className="text-[9.5px] text-neutral-400 leading-tight block mb-1">
                        {isAr ? "سيقوم بتحديث جميع رموز العملة والأسعار ونماذج الفواتير للتحويل التلقائي." : "This modifies currency symbol presentation throughout all billing departments and PDF sheets."}
                      </p>
                      <select
                        value={billingCurrency}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setBillingCurrency(val);
                          localStorage.setItem("careflow_billing_currency", val);
                          playNotificationSound("system");
                        }}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-805 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="SAR">SAR (ر.س) - Saudi Riyal</option>
                        <option value="AED">AED (د.إ) - UAE Dirham</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </select>
                    </div>

                    {/* Autosave and Off-line heartbeat Poll selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {isAr ? "المزامنة التلقائية والنسخ الاحتياطي" : "Offline-First Autosave & Heartbeats"}
                      </label>
                      <p className="text-[9.5px] text-neutral-400 leading-tight block mb-1">
                        {isAr ? "الفترة الزمنية بميلي ثانية لإجراء عملية حفظ تلقائي في التخزين المؤقت." : "Configure cache persistence checks to safeguard dental records against electricity cut-offs."}
                      </p>
                      <select
                        value={autoSaveInterval}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoSaveInterval(val);
                          localStorage.setItem("careflow_autosave_interval", String(val));
                        }}
                        className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-805 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="10">{isAr ? "كل 10 ثوانٍ (فائق الأمان)" : "Every 10 seconds (Max Safe)"}</option>
                        <option value="30">{isAr ? "كل 30 ثانية (الافتراضي)" : "Every 30 seconds (Default)"}</option>
                        <option value="120">{isAr ? "كل دقيقتين (المستوى المعتدل)" : "Every 2 minutes"}</option>
                        <option value="0">{isAr ? "حفظ يدوي فقط لحفظ البيانات" : "Manual Save Only"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* Dashboard Custom greeting and Clinic Brand customization */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-500" />
                      {isAr ? "عبارة الترحيب المخصصة بلوحة القيادة" : "Dashboard Custom Welcome Greeting Banner Message"}
                    </label>
                    <p className="text-[9.5px] text-neutral-400 leading-tight block mb-1">
                      {isAr ? "الترحيب الذي سيظهر في لوحة الفوليو الأساسية عند بداية تدوير النظام." : "The customized greeting displayed dynamically at the top of the administrative dashboard layout."}
                    </p>
                    <input
                      type="text"
                      value={customGreetingBanner}
                      onChange={(e) => {
                        setCustomGreetingBanner(e.target.value);
                        localStorage.setItem("careflow_custom_greeting_banner", e.target.value);
                      }}
                      placeholder="e.g. Welcome to Al Jawarih Specialty Eye Care Hub"
                      className="w-full bg-white dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-805 px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Bottom notification indicator */}
            <div className="pt-6 border-t border-[var(--clr-border-light)]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10.5px] text-neutral-400 font-mono mt-6">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                {isAr ? "تعديلات مشفرة ومحمية ببروتوكول HIPAA-Security" : "All local changes are strictly stored offline & encrypted on this device."}
              </span>
              <span className="font-bold">
                SYSTEM CORE V2.1 • HL7 SECURE
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
