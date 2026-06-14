import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Bell, 
  User, 
  Users, 
  X, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Check, 
  Clock, 
  Layers, 
  Activity, 
  Compass, 
  Eye, 
  Glasses, 
  Sparkles,
  ShieldAlert,
  Megaphone,
  Filter,
  Palette,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Patient, ClinicalRole } from "../types";

export interface HospitalMessage {
  id: string;
  senderStaffId: string;
  senderRole: string;
  senderName: string;
  senderDepartment: string;
  targetDepartment: string;
  recipientStaffId?: string;
  associatedPatientId?: string;
  associatedPatientName?: string;
  messageBody: string;
  isUrgentAlert: boolean;
  createdAt: string;
}

interface HospitalMessagingMeshProps {
  language: "en" | "ar";
  patients: Patient[];
  activeRole: ClinicalRole;
  activeDoctorId: string;
  activeView: string;
  onSelectPatient?: (patientId: string) => void;
}

// Translations Dictionary
const tMesh = {
  en: {
    title: "Clinical Message Mesh",
    subtitle: "Real-time cross-departmental telemetry & communication channel",
    recentComm: "Inter-Departmental Ledger",
    sendTitle: "Dispatch Transmission Scan",
    allDepts: "All Departments (Broadcast)",
    selectTarget: "Target Department",
    selectPatient: "Attach Patient Reference (Optional)",
    placeholder: "Type clinical instructions or telemetry warning...",
    urgentLabel: "STAT Emergency Priority Request",
    sendBtn: "Broadcast Frame",
    quickPrefabs: "Clinical Preset Macros",
    all: "All",
    urgentFilter: "STAT Only",
    broadcastFilter: "Broadcasts",
    noMessages: "No logged communications in live stream buffer.",
    senderDept: "Sender Identity",
    incomingAlert: "Incoming Urgent Alert!",
    optometry: "Optometry Clinic",
    nurse: "Nurse Workstation",
    doctors: "Attending Consultant Desk",
    pharmacy: "Pharmacy Operations",
    billing: "Finance & Accounting",
    itAdmin: "IT Administration Portal",
    reception: "Front Desk Registration",
    labs: "Diagnostics & Labs",
    surgical: "Surgical Theater Room"
  },
  ar: {
    title: "شبكة الاتصالات السريرية الموحدة",
    subtitle: "قناة بث وتبادل البيانات والاتصال السريري الفوري بين الأقسام",
    recentComm: "سجل المراسلات المتبادلة بين الأقسام",
    sendTitle: "إرسال برقية سريرية فورية",
    allDepts: "جميع الأقسام (بث عام للجميع)",
    selectTarget: "القسم المستهدف للتوجيه",
    selectPatient: "ربط ملف مريض نشط (اختياري)",
    placeholder: "اكتب التوجيهات الطبية أو تحذير النظام هنا...",
    urgentLabel: "حالة طارئة عاجلة جداً (STAT Emergency)",
    sendBtn: "بث البرقية الآن",
    quickPrefabs: "توجيهات نموذجية جاهزة للسرعة",
    all: "الكل",
    urgentFilter: "الحالات العاجلة فقط",
    broadcastFilter: "البث العام",
    noMessages: "لا توجد مراسلات مسجلة في ذاكرة البث المباشر حالياً.",
    senderDept: "هوية المرسل النشطة",
    incomingAlert: "تنبيه طبي عاجل وارد!",
    optometry: "عيادة قياس البصر",
    nurse: "محطة التمريض والفرز",
    doctors: "مكتب الطبيب الاستشاري",
    pharmacy: "عمليات الصرف الدوائي",
    billing: "شعبة الحسابات والمالية",
    itAdmin: "بوابة إدارة تكنولوجيا المعلومات",
    reception: "مكتب الاستقبال والتسجيل",
    labs: "المختبرات والتحاليل الطبية",
    surgical: "غرفة العمليات الجراحية"
  }
};

const DEPARTMENT_OPTIONS = [
  "All Departments",
  "Front Desk Reception",
  "Nurse Workstation",
  "Optometry Clinic",
  "Attending Consultant Desk",
  "Pharmacy Operations",
  "Diagnostics & Labs",
  "Finance & Accounting",
  "Surgical Theater Room",
  "IT Administration"
];

// Clinical Message Templates for fast dispatch
const QUICK_TEMPLATES = [
  { en: "Triage vitals logged. Patient is ready for evaluation.", ar: "تم تسجيل الإشارات الحيوية المبدئية. المريض جاهز للتقييم الفوري." },
  { en: "Dilation complete. Pupils fully dilated & ready for slit-lamp exam.", ar: "اكتمل توسيع حدقة العين. المريض جاهز لفحص المصباح الشقي." },
  { en: "Prescription compiled & transferred to ledger. Please dispense.", ar: "تم تجميع الوصفة الطبية وتحويلها للفاتورة. يرجى البدء بالصرف." },
  { en: "EMERGENCY STAT - Critical intraocular pressure detected, specialist needed!", ar: "حالة طارئة عاجلة - تم رصد ضغط عين مرتفع للغاية، مطلوب اختصاصي فوراً!" },
  { en: "Odontogram updated. Service ledger entries logged for dental restoration.", ar: "تم تحديث الرسم السني وتدوين تكاليف التعويض في الفاتورة الحالية." },
  { en: "Payment approved with financial clearance. Discharging patient.", ar: "تم استلام الدفعة اللامركزية وتأكيد المخالصة المالية. جاري تخريج المريض." }
];

export default function HospitalMessagingMesh({
  language,
  patients = [],
  activeRole,
  activeDoctorId,
  activeView,
  onSelectPatient
}: HospitalMessagingMeshProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HospitalMessage[]>([]);
  const [filterType, setFilterType] = useState<"all" | "urgent" | "my_dept">("all");
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Custom design style presets for the Messenger App itself
  const [messengerStyle, setMessengerStyle] = useState<"modern" | "bubbles" | "compact" | "glass">(() => {
    return (localStorage.getItem("careflow_messenger_style") as any) || "modern";
  });

  // Split-Routing Messaging Paradigms
  const [activeParadigm, setActiveParadigm] = useState<"SPECIFIC" | "PUBLIC">("SPECIFIC");
  const [recipientStaffId, setRecipientStaffId] = useState("");

  // Roster of active peer terminals for Specific Peer-to-Peer messaging
  const STAFF_PEERS = [
    { id: "EMP-012", name: "Sister Amina (Nurse Workstation)", nameAr: "الممرضة أمينة (محطة التمريض)" },
    { id: "EMP-045", name: "Dr. Tariq Al-Haddad (Orbit Clinic)", nameAr: "د. طارق الحداد (عيادة تجميل العين)" },
    { id: "EMP-022", name: "Dr. Jamil (Lead Pharmacist)", nameAr: "د. جميل (رئيس الصيدلية)" },
    { id: "EMP-001", name: "Mona Salem (Front Desk Reception)", nameAr: "منى سالم (مكتب الاستقبال)" },
    { id: "EMP-067", name: "Sara Al-Mansoori (CFO Accounting)", nameAr: "سارة المنصوري (شعبة الحسابات)" },
    { id: "EMP-088", name: "Dr. Khalid (Dental Specialist)", nameAr: "د. خالد (طبيب الأسنان وتجميل الفك)" }
  ];

  // New message form states
  const [senderName, setSenderName] = useState("");
  const [senderDept, setSenderDept] = useState("IT Administration");
  const [targetDept, setTargetDept] = useState("All Departments");
  const [associatedPatientId, setAssociatedPatientId] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Audio synthesizer via Web Audio API (No files needed, pure system buzz)
  const triggerSystemBeep = (freq = 880, duration = 0.15) => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not allowed or supported by environment context.");
    }
  };

  // Determine current sender department based on view / role
  useEffect(() => {
    // Autoselect default sender department based on active UI role
    let deptName = "IT Administration";
    let defaultUser = "System Terminal";

    if (activeRole === "nurse" || activeView === "nurse_workstation") {
      deptName = "Nurse Workstation";
      defaultUser = "Sister Amina (Roster 1)";
    } else if (activeView === "optometry_workstation") {
      deptName = "Optometry Clinic";
      defaultUser = "Optometrist George";
    } else if (activeRole === "pharmacist" || activeView === "diagnostics_labs") {
      deptName = "Pharmacy Operations";
      defaultUser = "Pharmacist Jamil";
    } else if (activeRole === "accountant") {
      deptName = "Finance & Accounting";
      defaultUser = "Lead Accountant Sara";
    } else if (activeRole === "receptionist" || activeView === "kiosk_enrollment") {
      deptName = "Front Desk Reception";
      defaultUser = "Reception Assistant Mona";
    } else if (activeRole === "doctor" || activeView === "clinical_consult") {
      deptName = "Attending Consultant Desk";
      defaultUser = `Dr. Tariq MD (${activeDoctorId || "Attending"})`;
    }

    setSenderDept(deptName);
    setSenderName(defaultUser);
  }, [activeRole, activeView, activeDoctorId]);

  // Listen for external open triggers (e.g. from the top bar button)
  useEffect(() => {
    const handleOpenTrigger = (e?: any) => {
      setIsOpen(true);
      setUnreadCount(0);
      if (e && e.detail && e.detail.paradigm) {
        setActiveParadigm(e.detail.paradigm);
      }
    };
    window.addEventListener("open-clinical-messages", handleOpenTrigger);
    return () => {
      window.removeEventListener("open-clinical-messages", handleOpenTrigger);
    };
  }, []);

  // Fetch initial ledger history
  useEffect(() => {
    fetch("/api/messages")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort messages with latest at the bottom
          const sorted = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setMessages(sorted);
        }
      })
      .catch(err => console.error("Error loading chat backlog ledger:", err));
  }, []);

  // Monitor and dispatch the latest global announcement to external listeners (e.g., App.tsx banner)
  useEffect(() => {
    if (messages.length > 0) {
      const globalAnnouncements = messages.filter(m => m.channelType === "PUBLIC_GLOBAL_ANNOUNCEMENT");
      if (globalAnnouncements.length > 0) {
        const latest = globalAnnouncements[globalAnnouncements.length - 1];
        const event = new CustomEvent("global-announcement-received", { detail: latest });
        window.dispatchEvent(event);
      }
    }
  }, [messages]);

  // Listen for real-time Server-Sent Events updates
  useEffect(() => {
    const eventSource = new EventSource("/api/messages/stream");

    eventSource.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data) as HospitalMessage;
        
        // Guard idempotency check: prevent duplicate messages from re-rendering
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          const updated = [...prev, newMessage];
          
          // Trigger alert signal
          if (newMessage.isUrgentAlert) {
            triggerSystemBeep(1100, 0.4); // Intense alert tone
          } else {
            triggerSystemBeep(650, 0.1); // Soft click sound
          }

          // Unread feedback indicator
          if (!isOpen) {
            setUnreadCount(c => c + 1);
          }

          return updated;
        });
      } catch (err) {
        console.error("Failed to parse incoming real-time message stream data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("EventSource disconnected or met cross-origin timeout. Autocorrect reconnects active...", err);
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, audioEnabled]);

  // Handle message sending
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageBody.trim() || isSending) return;

    setIsSending(true);
    const linkedPatient = patients.find(p => p.id === associatedPatientId);

    // Dynamic Context Routing Resolution matching Flyway migration paradigm
    let channelType: 'SPECIFIC_PATIENT_CASE' | 'SPECIFIC_PEER_TO_PEER' | 'PUBLIC_DEPARTMENTAL_BROADCAST' | 'PUBLIC_GLOBAL_ANNOUNCEMENT';
    
    if (activeParadigm === "SPECIFIC") {
      if (associatedPatientId) {
        channelType = "SPECIFIC_PATIENT_CASE";
      } else {
        channelType = "SPECIFIC_PEER_TO_PEER";
      }
    } else {
      if (targetDept === "All Departments") {
        channelType = "PUBLIC_GLOBAL_ANNOUNCEMENT";
      } else {
        channelType = "PUBLIC_DEPARTMENTAL_BROADCAST";
      }
    }

    const payload = {
      channelType,
      senderStaffId: activeDoctorId || "EMP-GEN",
      senderRole: activeRole,
      senderName: senderName || "Hospital Practitioner",
      senderDepartment: senderDept,
      targetDepartment: activeParadigm === "PUBLIC" ? targetDept : "Fenced Specific Terminal",
      recipientStaffId: (activeParadigm === "SPECIFIC" && channelType === "SPECIFIC_PEER_TO_PEER") ? recipientStaffId : undefined,
      associatedPatientId: (activeParadigm === "SPECIFIC" && channelType === "SPECIFIC_PATIENT_CASE") ? associatedPatientId : undefined,
      associatedPatientName: (activeParadigm === "SPECIFIC" && channelType === "SPECIFIC_PATIENT_CASE" && linkedPatient) ? linkedPatient.name : undefined,
      messageBody: messageBody.trim(),
      isUrgentAlert: isUrgent
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessageBody("");
        setIsUrgent(false);
        setAssociatedPatientId("");
        setRecipientStaffId("");
      } else {
        console.error("Failed to post message state to server.");
      }
    } catch (err) {
      console.error("Network communication failure posting message state:", err);
    } finally {
      setIsSending(false);
    }
  };

  const selectPrefabTemplate = (text: string) => {
    setMessageBody(text);
  };

  const dict = tMesh[language];
  const isRtl = language === "ar";

  // Filter logic divided into Specific vs Public clinical communication routing
  const paradigmMessages = messages.filter(msg => {
    // Standard backward compatibility fallback
    const cType = msg.channelType || (msg.associatedPatientId ? "SPECIFIC_PATIENT_CASE" : "PUBLIC_GLOBAL_ANNOUNCEMENT");
    
    if (activeParadigm === "SPECIFIC") {
      return cType === "SPECIFIC_PATIENT_CASE" || cType === "SPECIFIC_PEER_TO_PEER";
    } else {
      return cType === "PUBLIC_DEPARTMENTAL_BROADCAST" || cType === "PUBLIC_GLOBAL_ANNOUNCEMENT";
    }
  });

  const filteredMessages = paradigmMessages.filter(msg => {
    if (filterType === "all") return true;
    if (filterType === "urgent") return msg.isUrgentAlert;
    if (filterType === "my_dept") {
      return (
        msg.targetDepartment === "All Departments" ||
        msg.targetDepartment.toLowerCase() === senderDept.toLowerCase() ||
        msg.senderDepartment.toLowerCase() === senderDept.toLowerCase() ||
        (msg.recipientStaffId && msg.recipientStaffId === activeDoctorId)
      );
    }
    return true;
  });

  return (
    <>
      {/* Real-time Floating Circle Messenger Indicator at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white font-sans text-xs font-black shadow-[0_4px_15px_rgba(224,36,36,0.3)] flex items-center gap-1.5 border border-white"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-200"></span>
            </span>
            {unreadCount} {language === "ar" ? "جديد" : "NEW"}
          </motion.div>
        )}

        <motion.button
          id="clinical-messaging-mesh-launcher-btn"
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-[var(--clr-brand-blue)] hover:brightness-110 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.45)] cursor-pointer relative border border-white/20 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
        </motion.button>
      </div>

      {/* Main Drawer Shell */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop lock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/60 z-[110]"
              onClick={() => setIsOpen(false)}
            />

            {/* Side sheet drawer */}
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className={`fixed top-0 bottom-0 ${
                isRtl ? "left-0" : "right-0"
              } w-full md:w-[850px] lg:w-[1100px] xl:w-[1280px] max-w-full bg-[#FBFBF9] border-l border-r border-[#CBD5E1] shadow-[0_0_60px_rgba(0,0,0,0.18)] z-[120] flex flex-col font-sans overflow-hidden dark:bg-[#071017] dark:border-neutral-800`}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#CBD5E1] flex items-center justify-between bg-white dark:bg-[#0E1720] dark:border-neutral-850">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[var(--clr-brand-blue)] flex items-center justify-center">
                    <Layers className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-sans font-extrabold text-sm tracking-tight text-[#071522] dark:text-neutral-100 flex items-center gap-1.5">
                      {dict.title}
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                    </h2>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 tracking-wide font-medium leading-none mt-0.5">
                      {dict.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound controller */}
                  <button 
                    onClick={() => {
                      setAudioEnabled(!audioEnabled);
                      triggerSystemBeep(800, 0.1);
                    }}
                    className={`p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-400 transition-all ${
                      audioEnabled ? "text-[var(--clr-brand-blue)] bg-indigo-50/50 dark:bg-indigo-950/40" : "opacity-45"
                    }`}
                    title={audioEnabled ? "Disable Warning Beeps" : "Enable Audio Telemetry"}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Close button */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Dual Column Layout - Left Column Wrapper */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Left Pane (Chats Stream) */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F4F3ED] dark:bg-[#071017]">
                  {/* Patient Core View Port Dynamic Linked Ribbon */}
              <div className="mx-4 my-2 px-3 py-1.5 bg-white dark:bg-[#0E1720]/80 rounded-xl border border-[#CBD5E1] dark:border-neutral-850 flex items-center justify-between text-left shadow-xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-555/10 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="min-w-0 text-[10.5px]">
                    <span className="font-mono text-[7px] font-black uppercase text-[var(--clr-brand-blue)] dark:text-sky-400 tracking-wider block leading-none">{senderDept}</span>
                    <span className="font-bold text-[#071522] dark:text-neutral-250 truncate block mt-0.5">{senderName}</span>
                  </div>
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {language === "ar" ? "متصل" : "ACTIVE"}
                </div>
              </div>

              {/* Dual Specific vs Public Paradigm Segmented Switch */}
              <div className="px-4 pb-2 bg-transparent flex shrink-0">
                <div className="w-full bg-[#EBF0F3] dark:bg-[#071017] p-0.5 rounded-full flex gap-1 relative border border-[#CBD5E1] dark:border-neutral-850">
                  <button
                    id="comms-paradigm-specific-tab"
                    onClick={() => {
                      setActiveParadigm("SPECIFIC");
                      setFilterType("all");
                      triggerSystemBeep(750, 0.08);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full text-[10.5px] font-black transition-all duration-200 uppercase tracking-wide cursor-pointer ${
                      activeParadigm === "SPECIFIC"
                        ? "bg-[var(--clr-brand-blue)] text-white shadow-xs"
                        : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{language === "ar" ? "قناة خاصة" : "Specific Comms"}</span>
                  </button>
                  <button
                    id="comms-paradigm-public-tab"
                    onClick={() => {
                      setActiveParadigm("PUBLIC");
                      setFilterType("all");
                      triggerSystemBeep(850, 0.08);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full text-[10.5px] font-black transition-all duration-200 uppercase tracking-wide cursor-pointer ${
                      activeParadigm === "PUBLIC"
                        ? "bg-[var(--clr-brand-blue)] text-white shadow-xs"
                        : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>{language === "ar" ? "بث عام" : "Public Comms"}</span>
                  </button>
                </div>
              </div>

              {/* Feed Filters */}
              <div className="px-4 py-1.5 bg-white dark:bg-[#0E1720] border-t border-[#CBD5E1] dark:border-neutral-850 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg transition-all border ${
                    filterType === "all"
                      ? "bg-[var(--clr-brand-blue)] text-white border-[var(--clr-brand-blue)] shadow-sm"
                      : "bg-neutral-50 text-neutral-600 border-[#CBD5E1] hover:bg-neutral-100 dark:bg-neutral-850 dark:text-neutral-355 dark:border-neutral-800"
                  }`}
                >
                  {dict.all} ({messages.length})
                </button>
                <button
                  onClick={() => setFilterType("urgent")}
                  className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg transition-all border flex items-center gap-1 ${
                    filterType === "urgent"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-neutral-50 text-neutral-600 border-[#CBD5E1] hover:bg-neutral-100 dark:bg-neutral-850 dark:text-neutral-355 dark:border-neutral-800 hover:text-rose-600"
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  {dict.urgentFilter} ({messages.filter(m => m.isUrgentAlert).length})
                </button>
                <button
                  onClick={() => setFilterType("my_dept")}
                  className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg transition-all border ${
                    filterType === "my_dept"
                      ? "bg-[var(--clr-brand-blue)] text-white border-[var(--clr-brand-blue)] shadow-sm"
                      : "bg-neutral-50 text-neutral-600 border-[#CBD5E1] hover:bg-neutral-100 dark:bg-neutral-850 dark:text-neutral-355 dark:border-neutral-800"
                  }`}
                >
                  {language === "ar" ? "صندوقي الخاص" : "My Desk Threads"}
                </button>
              </div>

              {/* Messenger Style Picker Row */}
              <div className="px-4 py-1 bg-neutral-50 dark:bg-[#0c0f17] border-b border-t border-[#CBD5E1] dark:border-neutral-850/80 flex items-center justify-between text-xs shrink-0">
                <span className="font-mono text-[9px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[var(--clr-brand-blue)]" />
                  {language === "ar" ? "مظهر التطبيق:" : "CHAT PRESET:"}
                </span>
                <div className="flex items-center gap-1">
                  {(["bubbles", "modern", "compact", "glass"] as const).map((styleName) => (
                    <button
                      key={styleName}
                      onClick={() => {
                        setMessengerStyle(styleName);
                        localStorage.setItem("careflow_messenger_style", styleName);
                        triggerSystemBeep(850, 0.05);
                      }}
                      className={`px-1.5 py-0.5 text-[8.5px] font-black uppercase rounded-md border transition-all ${
                        messengerStyle === styleName
                          ? "bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] border-[var(--clr-brand-blue)]/30 dark:bg-[var(--clr-brand-blue)]/20 dark:text-sky-400"
                          : "bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-850 dark:hover:text-neutral-200"
                      }`}
                    >
                      {styleName === "bubbles" ? (language === "ar" ? "فقاعات" : "Bubbles 💬") :
                       styleName === "modern" ? (language === "ar" ? "حديث" : "Modern ✨") :
                       styleName === "compact" ? (language === "ar" ? "لوحة" : "Console 🖥️") :
                       (language === "ar" ? "زجاجي" : "Glass ❄️")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Ledger stream display */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F4F3ED] dark:bg-[#071017] min-h-[180px]">
                {filteredMessages.length === 0 ? (
                  <div className="h-44 flex flex-col justify-center items-center text-center text-neutral-400 dark:text-neutral-500 space-y-3">
                    <MessageSquare className="w-10 h-10 opacity-35 text-[var(--clr-brand-blue)]" />
                    <p className="text-xs font-semibold font-sans tracking-wide">
                      {dict.noMessages}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isUrgentMsg = msg.isUrgentAlert;
                    const isMyOwn = msg.senderDepartment.toLowerCase() === senderDept.toLowerCase();

                    // Generate beautiful avatar colors & initials matching roles
                    const roleInitials = msg.senderName 
                      ? msg.senderName.replace(/Dr\./g, "").trim().split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() 
                      : "MD";

                    const roleColors: Record<string, string> = {
                      nurse: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/30",
                      doctor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-[#0E1720] dark:text-[#4EA4CC] dark:border-[#1E2E3C]",
                      pharmacist: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30",
                      accountant: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30",
                      admin: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/30",
                      receptionist: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/30"
                    };

                    const avatarClass = roleColors[msg.senderRole] || "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800";

                    // Style 1: BUBBLES
                    if (messengerStyle === "bubbles") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`w-full flex items-end gap-2.5 ${isMyOwn ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Circular Staff Avatar next to message bubble */}
                          <div
                            className={`w-8.5 h-8.5 rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-black ${avatarClass} shrink-0 shadow-xs relative group/avatar cursor-help transition-all duration-300 hover:scale-105`}
                            title={`${msg.senderName} (${msg.senderDepartment})`}
                          >
                            <span>{roleInitials}</span>
                            {/* Clinical role status indicator */}
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-neutral-900" />
                          </div>

                          <div className={`max-w-[78%] rounded-2xl p-3.5 border text-left shadow-xs relative overflow-hidden transition-all duration-300 ${
                            isMyOwn
                              ? isUrgentMsg
                                ? "bg-rose-500/10 border-rose-400 text-rose-950 dark:text-rose-100 rounded-tr-none"
                                : "bg-[var(--clr-brand-blue)]/10 border-[var(--clr-brand-blue)]/20 dark:bg-[var(--clr-brand-blue)]/20 text-neutral-900 dark:text-neutral-100 rounded-tr-none"
                              : isUrgentMsg
                                ? "bg-rose-500/5 border-rose-300 text-rose-950 dark:text-rose-200 rounded-tl-none"
                                : "bg-white border-[#EAE6DF] text-neutral-900 dark:bg-[#121520] dark:border-neutral-800 dark:text-neutral-100 rounded-tl-none"
                          }`}>
                            {/* Urgent glowing indicator */}
                            {isUrgentMsg && (
                              <div className="absolute top-0 right-0 left-0 h-[3px] bg-rose-500 animate-pulse" />
                            )}
                            
                            {/* Header metadata inside bubble */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-black text-[var(--clr-brand-blue)] dark:text-sky-400 tracking-tight">
                                {isMyOwn ? (language === "ar" ? "أنا" : "Me") : msg.senderName}
                              </span>
                              <span className="font-mono text-[7.5px] text-neutral-400 dark:text-neutral-500 ml-auto shrink-0">
                                {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Department Info */}
                            <p className="font-mono text-[7.5px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 leading-none pl-0.5">
                              {msg.senderDepartment}
                            </p>

                            {/* Message Body */}
                            <div className="text-xs font-semibold leading-relaxed font-sans mt-1 text-neutral-800 dark:text-neutral-150 pl-0.5 whitespace-pre-wrap select-text">
                              {msg.messageBody}
                            </div>

                            {/* Channels & Actions */}
                            <div className="mt-2.5 pt-1.5 border-t border-dashed border-neutral-200 dark:border-neutral-800/80 flex flex-wrap items-center gap-1.5">
                              {msg.channelType === "SPECIFIC_PEER_TO_PEER" ? (
                                <span className="font-mono text-[7px] bg-pink-50 border border-pink-200 text-pink-700 dark:bg-pink-950/20 dark:border-pink-900/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-95 origin-left">
                                  ✉ P2P Direct
                                </span>
                              ) : msg.channelType === "SPECIFIC_PATIENT_CASE" ? (
                                <span className="font-mono text-[7px] bg-indigo-50 border border-indigo-200 text-[var(--clr-brand-blue)] dark:bg-indigo-950/15 dark:border-indigo-900/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-95 origin-left">
                                  🩺 Case Dossier
                                </span>
                              ) : (
                                <span className="font-mono text-[7px] bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-95 origin-left animate-pulse">
                                  📢 Global Notice
                                </span>
                              )}

                              {msg.associatedPatientId && (
                                <button
                                  onClick={() => {
                                    onSelectPatient?.(msg.associatedPatientId!);
                                    triggerSystemBeep(700, 0.08);
                                  }}
                                  className="text-[7.5px] font-black font-mono text-[var(--clr-brand-blue)] dark:text-sky-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-[var(--clr-brand-blue)] hover:text-white px-1.5 py-0.5 rounded transition duration-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-0.5"
                                >
                                  <Activity className="w-2.5 h-2.5 text-[var(--clr-brand-blue)] dark:text-sky-450 animate-pulse" />
                                  ID: {msg.associatedPatientId}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Style 2: COMPACT CONSOLE (Monospace Flat Technical Style)
                    if (messengerStyle === "compact") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.99 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2.5 w-full"
                        >
                          {/* Small circular monospace avatar next to console container */}
                          <div
                            className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center font-mono text-[8px] font-black ${avatarClass} shrink-0 shadow-xs border-neutral-700/60`}
                            title={`${msg.senderName} (${msg.senderDepartment})`}
                          >
                            {roleInitials}
                          </div>

                          <div className={`flex-1 p-2.5 rounded-lg border font-mono text-[10px] text-left relative overflow-hidden transition-all duration-150 ${
                            isUrgentMsg
                              ? "bg-rose-950/40 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.15)] animate-pulse"
                              : "bg-neutral-900 border-neutral-800 text-slate-300 dark:bg-[#070a10] dark:border-neutral-900 hover:border-sky-500/30"
                          }`}>
                            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1 mb-1.5 text-neutral-400">
                              <div className="flex items-center gap-1.5">
                                <span className="text-indigo-400 font-extrabold uppercase">
                                  [{msg.senderDepartment.substring(0, 10)}]
                                </span>
                                <span className="text-zinc-200 font-bold">{msg.senderName}</span>
                                {isMyOwn && <span className="text-emerald-500 text-[8px]">[ME]</span>}
                              </div>
                              <span className="text-neutral-500 text-[9px]">
                                {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>

                            <div className="text-sky-300 dark:text-sky-400 font-semibold leading-relaxed break-all select-text whitespace-pre-wrap">
                              &gt; {msg.messageBody}
                            </div>

                            {/* Related metadata row */}
                            <div className="mt-2 pt-1 border-t border-neutral-800/65 flex items-center justify-between text-[8px] text-zinc-500">
                              <span>
                                ROUTE_TYPE: {msg.channelType}
                              </span>
                              {msg.associatedPatientId && (
                                <button
                                  onClick={() => onSelectPatient?.(msg.associatedPatientId!)}
                                  className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  [ATTACHED_CASE: {msg.associatedPatientId}]
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Style 3: FROSTED GLASSMORPHISM
                    if (messengerStyle === "glass") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden backdrop-blur-md ${
                            isUrgentMsg
                              ? "bg-rose-500/10 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.12)] dark:bg-rose-950/20"
                              : "bg-white/45 border-white/60 dark:bg-[#121520]/45 dark:border-white/10 hover:shadow-[0_8px_32px_rgba(79,70,229,0.06)] shadow-[0_4px_16px_rgba(31,38,135,0.02)]"
                          }`}
                        >
                          <div className="absolute right-0 top-0 -mt-2 -mr-2 w-16 h-16 bg-[var(--clr-brand-blue)]/5 rounded-full blur-xl pointer-events-none" />
                          <div className="flex gap-3 relative z-10">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-[10px] font-black ${avatarClass} shrink-0 shadow-inner`}>
                              {roleInitials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <div>
                                  <span className="font-mono text-[7.5px] font-black uppercase text-[var(--clr-brand-blue)] tracking-widest block">
                                    {msg.senderDepartment}
                                  </span>
                                  <span className="text-xs font-black text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                                    {msg.senderName}
                                    {isMyOwn && (
                                      <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] dark:bg-neutral-800 dark:text-sky-400 font-extrabold uppercase shrink-0 border border-[var(--clr-brand-blue)]/10">
                                        ME
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span className="font-mono text-[8px] text-neutral-400 dark:text-neutral-500 flex items-center gap-0.5 font-semibold shrink-0 font-sans">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <p className="text-xs font-medium leading-relaxed font-sans text-neutral-800 dark:text-neutral-250 mt-2 whitespace-pre-wrap select-text">
                                {msg.messageBody}
                              </p>

                              <div className="mt-3 flex items-center justify-between text-[8.5px]">
                                <span className="text-neutral-400 font-mono tracking-wide">
                                  ⚡ SYSTEM_LINKED
                                </span>
                                {msg.associatedPatientId && (
                                  <button
                                    onClick={() => onSelectPatient?.(msg.associatedPatientId!)}
                                    className="px-2 py-0.5 rounded bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] hover:bg-[var(--clr-brand-blue)] hover:text-white border border-[var(--clr-brand-blue)]/10 transition"
                                  >
                                    Case: {msg.associatedPatientId}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Style 4: MODERN CARDS (Default)
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${
                          isUrgentMsg
                            ? "bg-rose-500/5 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.06)] dark:bg-rose-950/10"
                            : "bg-white border-[#CBD5E1] hover:shadow-[0_4px_22px_rgba(79,70,229,0.04)] hover:border-[var(--clr-brand-blue)]/30 dark:bg-[#0E1720] dark:border-neutral-850"
                        }`}
                      >
                        {/* High fidelity left accent line */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          isUrgentMsg ? "bg-rose-600 animate-pulse" : "bg-[var(--clr-brand-blue)]"
                        }`} />

                        {/* Top Metadata Header with unified grid */}
                        <div className="flex gap-3 pl-1">
                          {/* Circle Avatar badge */}
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-[11px] font-black ${avatarClass} shrink-0 shadow-sm relative`}>
                            {roleInitials}
                            {/* Clinical role active blinker dot */}
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-neutral-900" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2.5">
                              <div>
                                <span className="font-mono text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest leading-none">
                                  {msg.senderDepartment}
                                </span>
                                <span className="text-xs font-extrabold text-[#071522] dark:text-neutral-100 mt-1 flex items-center gap-1.5">
                                  {msg.senderName}
                                  {isMyOwn && (
                                    <span className="text-[7.5px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-[var(--clr-brand-blue)] dark:bg-neutral-900 dark:text-sky-450 uppercase font-bold shrink-0 border border-neutral-200 dark:border-neutral-850">
                                      {language === "ar" ? "أنا" : "Me"}
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex flex-col items-end shrink-0">
                                <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Routing paradigm pills context */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {msg.channelType === "SPECIFIC_PEER_TO_PEER" ? (
                                <span className="font-mono text-[8px] bg-pink-50 border border-pink-200 text-pink-700 dark:bg-pink-950/20 dark:border-pink-900/30 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                  ✉ P2P: {msg.recipientStaffId === activeDoctorId ? (language === "ar" ? "خاص بي" : "DIRECT TO ME 🔒") : (msg.recipientStaffId || "STAFF CASE")}
                                </span>
                              ) : msg.channelType === "SPECIFIC_PATIENT_CASE" ? (
                                <span className="font-mono text-[8px] bg-indigo-50 border border-indigo-200 text-[var(--clr-brand-blue)] dark:bg-indigo-950/25 dark:border-indigo-900/30 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                  🩺 {language === "ar" ? "ملف المريض" : "Case Dossier"}
                                </span>
                              ) : msg.channelType === "PUBLIC_GLOBAL_ANNOUNCEMENT" ? (
                                <span className="font-mono text-[8px] bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 px-2 py-0.5 rounded-md font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                  📢 {language === "ar" ? "إعلان عام" : "Global Notice"}
                                </span>
                              ) : (
                                <span className="font-mono text-[8px] text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                  ➔ {msg.targetDepartment === "All Departments" ? (language === "ar" ? "الكل" : "ALL") : msg.targetDepartment}
                                </span>
                              )}

                              {isUrgentMsg && (
                                <span className="bg-rose-600 text-white font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 tracking-wider shadow-sm animate-pulse">
                                  <Bell className="w-2.5 h-2.5 animate-bounce" />
                                  STAT
                                </span>
                              )}
                            </div>

                            {/* Message body */}
                            <div className="py-2.5 text-sm text-neutral-800 dark:text-neutral-300 font-sans break-words whitespace-pre-wrap leading-relaxed">
                              {msg.messageBody}
                            </div>

                            {/* Action Link Cases (Patient Link Block) */}
                            {msg.associatedPatientId && (
                              <div className="pt-2 border-t border-dashed border-[#CBD5E1] dark:border-neutral-850 flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    onSelectPatient?.(msg.associatedPatientId!);
                                    triggerSystemBeep(700, 0.08);
                                  }}
                                  className="text-[9px] font-extrabold font-mono text-[var(--clr-brand-blue)] hover:text-white hover:bg-[var(--clr-brand-blue)] dark:text-sky-400 dark:hover:bg-sky-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg transition duration-200 border border-indigo-100 dark:border-indigo-950/80 flex items-center gap-1 z-10 cursor-pointer"
                                >
                                  <Activity className="w-3.5 h-3.5 text-[var(--clr-brand-blue)] dark:text-sky-400 animate-pulse" />
                                  {language === "ar" ? "الملف النشط" : "RECORD"}: {msg.associatedPatientId} ({msg.associatedPatientName || "Local Dossier"})
                                </button>
                                <span className="font-mono text-[8px] uppercase font-black tracking-widest text-neutral-400 dark:text-neutral-500">
                                  Direct Access Link
                                </span>
                              </div>
                            )}

                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

                </div> {/* Close Left Pane */}

                {/* Right Column Panel: Active Clinical Dispatch Terminal */}
                <form 
                  onSubmit={handleSendMessage}
                  className="w-full md:w-[350px] lg:w-[420px] shrink-0 bg-white dark:bg-[#0E1720] border-t md:border-t-0 md:border-l border-[#CBD5E1] dark:border-neutral-850 flex flex-col p-4 space-y-4 text-left overflow-y-auto"
                >
                  {/* Preset Fast Instructions (Quick templates) */}
                  <div className="pb-3 border-b border-dashed border-[#CBD5E1] dark:border-[#CBD5E1]/40 shrink-0">
                <span className="block text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest mb-1 text-left">
                  ⚡ {dict.quickPrefabs}
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {QUICK_TEMPLATES.map((tmpl, idx) => {
                    const text = language === "ar" ? tmpl.ar : tmpl.en;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPrefabTemplate(text)}
                        className="text-left px-2.5 py-2 bg-[#FBFBF9] hover:bg-indigo-50/40 dark:bg-neutral-850 dark:hover:bg-indigo-950/20 border border-[#CBD5E1] dark:border-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-350 rounded-lg whitespace-normal break-words transition duration-150 hover:text-[var(--clr-brand-blue)] shrink-0 cursor-pointer shadow-3xs"
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Entry Area */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {/* Form Controls Row - Dynamic based on activeParadigm */}
                {activeParadigm === "SPECIFIC" ? (
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="block text-[8px] font-black uppercase text-[var(--clr-brand-blue)] tracking-widest mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-[var(--clr-brand-blue)]" />
                        {language === "ar" ? "ملف المريض المرتبط" : "Related Case"}
                      </label>
                      <select
                        value={associatedPatientId}
                        onChange={(e) => {
                          setAssociatedPatientId(e.target.value);
                          if (e.target.value) setRecipientStaffId(""); // Clean up conflicting peer links
                        }}
                        className="w-full p-1.5 bg-[#FBFBF9] dark:bg-[#071017] border border-[#CBD5E1] dark:border-neutral-800 focus:ring-1 focus:ring-[var(--clr-brand-blue)]/40 focus:border-[var(--clr-brand-blue)] rounded-lg text-[11px] font-bold text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
                      >
                        <option value="">-- {language === "ar" ? "لا يوجد مريض" : "No Case Attached"} --</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black uppercase text-[var(--clr-brand-blue)] tracking-widest mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-[var(--clr-brand-blue)]" />
                        {language === "ar" ? "الموظف المستهدف (P2P)" : "Practitioner (P2P)"}
                      </label>
                      <select
                        value={recipientStaffId}
                        onChange={(e) => {
                          setRecipientStaffId(e.target.value);
                          if (e.target.value) setAssociatedPatientId(""); // Clean up patient reference
                        }}
                        className="w-full p-1.5 bg-[#FBFBF9] dark:bg-[#071017] border border-[#CBD5E1] dark:border-neutral-800 focus:ring-1 focus:ring-[var(--clr-brand-blue)]/40 focus:border-[var(--clr-brand-blue)] rounded-lg text-[11px] font-bold text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
                      >
                        <option value="">-- {language === "ar" ? "خاص مباشر" : "P2P Staff Direct"} --</option>
                        {STAFF_PEERS.map((peer) => (
                          <option key={peer.id} value={peer.id}>
                            {peer.id} - {language === "ar" ? peer.nameAr : peer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-left">
                    <div>
                      <label className="block text-[8px] font-black uppercase text-amber-750 dark:text-amber-400 tracking-widest mb-1 flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-amber-600" />
                        {language === "ar" ? "قطاع البث المستهدف" : "Target Sector Broadcast"}
                      </label>
                      <select
                        value={targetDept}
                        onChange={(e) => setTargetDept(e.target.value)}
                        className="w-full p-1.5 bg-[#FBFBF9] dark:bg-[#071017] border border-[#CBD5E1] dark:border-neutral-800 focus:ring-1 focus:ring-[var(--clr-brand-blue)]/40 focus:border-[var(--clr-brand-blue)] rounded-lg text-[11px] font-bold text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
                      >
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === "All Departments" ? dict.allDepts : opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Input box */}
                <div className="relative">
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder={dict.placeholder}
                    maxLength={505}
                    rows={2}
                    className="w-full p-2.5 bg-[#FBFBF9] dark:bg-[#071017] border border-[#CBD5E1] dark:border-neutral-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--clr-brand-blue)]/20 focus:border-[var(--clr-brand-blue)] text-neutral-800 dark:text-neutral-200 transition-all resize-none font-sans"
                    dir="auto"
                  />
                  <div className="absolute bottom-2 right-2.5 text-[8.5px] font-mono text-neutral-400">
                    {messageBody.length}/500
                  </div>
                </div>

                {/* Controls & Urgent Indicator */}
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded border-[#CBD5E1] text-rose-600 focus:ring-0 accent-rose-600 cursor-pointer"
                    />
                    <span className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                      <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />
                      {dict.urgentLabel}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!messageBody.trim() || isSending}
                    className="px-4 py-2 bg-[var(--clr-brand-blue)] hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition duration-200 shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSending ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        {dict.sendBtn}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
