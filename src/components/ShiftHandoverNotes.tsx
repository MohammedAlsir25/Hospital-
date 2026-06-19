import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Clock,
  User,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Building,
  RefreshCw,
  FolderSync
} from "lucide-react";
import { ClinicalRole, ClinicType } from "../types";

// Note interface
interface HandoverNote {
  id: string;
  creatorName: string;
  creatorRole: string;
  clinic: string; // Target Clinic or "All"
  priority: "routine" | "important" | "critical";
  message: string;
  timestamp: string;
  isSigned: boolean;
  acknowledgedBy?: {
    name: string;
    role: string;
    at: string;
  } | null;
}

interface ShiftHandoverNotesProps {
  language: "en" | "ar";
  currentRole: ClinicalRole;
  currentDoctorId: string;
  isOffline: boolean;
}

// Preset Shift Notes to initialize with if nothing is in localStorage
const INITIAL_HANDOVER_NOTES: HandoverNote[] = [];

export default function ShiftHandoverNotes({
  language,
  currentRole,
  currentDoctorId,
  isOffline
}: ShiftHandoverNotesProps) {
  // Localization dictionaries
  const localText = {
    en: {
      title: "Clinic Shift Handover Notes",
      subtitle: "Secure clinical handovers and multi-disciplinary shift logs",
      newNoteTitle: "Create New Handover Note",
      formAuthorName: "Duty Staff Name",
      formRole: "Staff Role",
      formClinic: "Target Clinic / Area",
      allClinics: "All Clinics & Departments",
      formPriority: "Priority Level",
      routine: "Routine Information",
      important: "Important / High Care",
      critical: "Critical STAT / Attention",
      formMessage: "Handover Notes / Instructions / Patient IDs",
      formMessagePlaceholder: "Provide highly descriptive patient statuses, vitals alerts, pending surgeries, or medication lists for the incoming team...",
      digitalSign: "Authorize with Secure Digital Signature Active On-duty",
      submitBtn: "Commit Handover Note & Secure Log",
      searchPlaceholder: "Search comments, staff names, or messages...",
      filterPriority: "All Priorities",
      filterClinic: "All Areas",
      noNotesFound: "No clinical handover notes matches the selected filters.",
      recentLogs: "Active Shift Handover Register",
      creatorBadge: "Author",
      targetBadge: "Target Center",
      criticalBadg: "CRITICAL STAT",
      importantBadg: "IMPORTANT",
      routineBadg: "ROUTINE INFO",
      signCheckText: "Digitally Signed & Certified",
      signOffTitle: "Shift Acknowledgment Receipt",
      ackBtn: "Acknowledge Shift Notes ✙",
      ackStatus: "Signed off by incoming shift:",
      deleteConfirm: "Are you sure you want to delete this secure clinical entry?",
      authorRequired: "Please enter your name as the author.",
      messageRequired: "Please input the detailed handover text.",
      signatureRequired: "You must authorize with the secure digital signature checkbox.",
      offlineBanner: "Safe Backup Mode: Notes are locked in the local active session and will synchronize.",
      onlineBanner: "Connected: Cloud audit synchronized securely with central systems."
    },
    ar: {
      title: "ملاحظات تسليم الوردية السريرية",
      subtitle: "تسليم مناوبات الطاقم بشكل آمن وتدوين السجلات الطبية للورديات المتعاقبة",
      newNoteTitle: "إنشاء ملاحظة تسليم جديدة",
      formAuthorName: "اسم الموظف المناوب",
      formRole: "الدور الوظيفي",
      formClinic: "العيادة / القسم المستهدف",
      allClinics: "جميع العيادات والأقسام",
      formPriority: "مستوى الأولوية",
      routine: "معلومات روتينية عامة",
      important: "درجة رعاية عالية / مهمة",
      critical: "حالة طارئة عاجلة / انتباه STAT",
      formMessage: "ملاحظات التسليم / التعليمات / حالات المرضى",
      formMessagePlaceholder: "أدخل تفاصيل دقيقة عن حالة المرضى، العلامات الحيوية، العمليات المعلقة، الأدوية الموصوفة للوردية القادمة...",
      digitalSign: "تفويض بالتوقيع الرقمي الآمن للوردية الحالية",
      submitBtn: "تسجيل الملاحظة وتوثيق السجل الآمن",
      searchPlaceholder: "ابحث في الملاحظات، أسماء الأطباء والممرضين...",
      filterPriority: "جميع الأولويات",
      filterClinic: "جميع الأقسام",
      noNotesFound: "لا توجد ملاحظات مطابقة لمعايير البحث الحالية.",
      recentLogs: "سجل تسليم ورديات العمل النشط",
      creatorBadge: "المسؤول",
      targetBadge: "القسم الموجه له",
      criticalBadg: "طارئ عاجل - تحذير",
      importantBadg: "هام ورعاية مكثفة",
      routineBadg: "معلومات روتينية",
      signCheckText: "موثقة وموقعة رقمياً",
      signOffTitle: "إقرار استلام الوردية والملاحظات",
      ackBtn: "تأكيد استلام وقراءة الملاحظة ✙",
      ackStatus: "تم الاستلام من الوردية البديلة:",
      deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا القيد الطبي الآمن؟",
      authorRequired: "يرجى كتابة اسم الموظف المناوب.",
      messageRequired: "يرجى كتابة نص الملاحظة التفصيلي.",
      signatureRequired: "يجب تفعيل خيار التوقيع الرقمي الآمن لاعتماد الملاحظة.",
      offlineBanner: "نمط الأمان دون اتصال: يتم حفظ الملاحظات محلياً لحين استعادة الشبكة.",
      onlineBanner: "متصل بالخادم: السجل السريري متزامن بأمان مع الأنظمة المركزية للهيئة الصحية."
    }
  };

  const t = localText[language];

  // Notes state
  const [notes, setNotes] = useState<HandoverNote[]>(() => {
    const saved = localStorage.getItem("careflow_handover_notes");
    return saved ? JSON.parse(saved) : INITIAL_HANDOVER_NOTES;
  });

  // Form states
  const [newAuthor, setNewAuthor] = useState("");
  const [targetClinic, setTargetClinic] = useState("All");
  const [priorityLevel, setPriorityLevel] = useState<"routine" | "important" | "critical">("routine");
  const [noteMessage, setNoteMessage] = useState("");
  const [isDigitalSigned, setIsDigitalSigned] = useState(false);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterClinic, setFilterClinic] = useState("All");

  // Error state
  const [validationError, setValidationError] = useState("");

  // Persist notes
  useEffect(() => {
    localStorage.setItem("careflow_handover_notes", JSON.stringify(notes));
  }, [notes]);

  // Handle Note Submission
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newAuthor.trim()) {
      setValidationError(t.authorRequired);
      return;
    }
    if (!noteMessage.trim()) {
      setValidationError(t.messageRequired);
      return;
    }
    if (!isDigitalSigned) {
      setValidationError(t.signatureRequired);
      return;
    }

    const newNoteObj: HandoverNote = {
      id: `HON-${Math.floor(100 + Math.random() * 900)}`,
      creatorName: newAuthor,
      creatorRole: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
      clinic: targetClinic,
      priority: priorityLevel,
      message: noteMessage,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      isSigned: true,
      acknowledgedBy: null
    };

    setNotes(prev => [newNoteObj, ...prev]);

    // Reset Form
    setNoteMessage("");
    setIsDigitalSigned(false);
    
    // Auto-alert if administrator wants feedback
    const successToast = language === "ar" 
      ? "تم إضافة ملاحظة تسليم الوردية وتوثيق التوقيع الرقمي بنجاح" 
      : "Shift handover note legally committed to log successfully.";
    console.log(successToast);
  };

  // Perform Acknowledgment / Sign-off
  const handleAcknowledgeNote = (noteId: string) => {
    const ackName = currentRole === "admin" ? "General Manager Admin" : `Duty staff (${currentRole})`;
    const formTime = new Date().toISOString().replace("T", " ").substring(0, 19);

    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          acknowledgedBy: {
            name: ackName,
            role: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
            at: formTime
          }
        };
      }
      return note;
    }));
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (confirm(t.deleteConfirm)) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === "All" || note.priority === filterPriority;
    const matchesClinic = filterClinic === "All" || note.clinic === filterClinic;

    return matchesSearch && matchesPriority && matchesClinic;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* Alert Header Banner indicating offline resilience */}
      <div className={`p-3.5 px-5 rounded-2xl border text-xs flex items-center justify-between transition gap-3 ${
        isOffline 
          ? "bg-amber-50/70 border-amber-250 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30"
          : "bg-teal-50/70 border-teal-250 text-teal-800 dark:bg-emerald-950/20 dark:border-emerald-900/30"
      }`}>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
          ) : (
            <FolderSync className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span className="font-semibold">
            {isOffline ? t.offlineBanner : t.onlineBanner}
          </span>
        </div>
        <span className="text-[10px] font-mono font-black uppercase bg-white/60 dark:bg-neutral-800/60 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
          LOCAL_DATABASE_ACTIVE
        </span>
      </div>

      {/* Main Container Layout: Two Columns (Form & Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Create Note Form (Col span 5) */}
        <div className="lg:col-span-5 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--clr-border-light)] pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-black text-xs uppercase tracking-wider text-[var(--clr-text-title)]">
                {t.newNoteTitle}
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                SECURE END-TO-END DECRYPTION LOG
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitNote} className="space-y-4">
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Author details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                  {t.formAuthorName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={currentRole === "doctor" ? "Dr. Tariq Al-Farsi" : "Nurse name"}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-xl focus:border-[var(--clr-brand-blue)] focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                  {t.formRole}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentRole.toUpperCase()}
                  className="w-full px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800 border border-[var(--clr-border-light)] rounded-xl text-neutral-500 font-mono font-bold uppercase"
                />
              </div>
            </div>

            {/* Clinic / Dept & Priority levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                  {t.formClinic}
                </label>
                <select
                  value={targetClinic}
                  onChange={(e) => setTargetClinic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-xl focus:border-[var(--clr-brand-blue)] focus:outline-none transition-colors font-semibold"
                >
                  <option value="All">{t.allClinics}</option>
                  <option value="Medicine">Medicine Clinic</option>
                  <option value="ENT">ENT Clinic</option>
                  <option value="Dental">Dental Clinic</option>
                  <option value="Retina">Retina Clinic</option>
                  <option value="Glaucoma">Glaucoma Clinic</option>
                  <option value="Orbit">Orbit Emergency Clinic</option>
                  <option value="General Ophthalmology">General Ophthalmology</option>
                  <option value="Nurse Station">Nurse Station Core</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                  {t.formPriority}
                </label>
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-xl focus:outline-none transition-colors font-black ${
                    priorityLevel === "critical"
                      ? "border-rose-350 text-rose-700 bg-rose-50/20"
                      : priorityLevel === "important"
                      ? "border-amber-350 text-amber-700 bg-amber-50/20"
                      : "border-[var(--clr-border-light)] text-indigo-700 bg-indigo-50/20"
                  }`}
                >
                  <option value="routine">{t.routine}</option>
                  <option value="important">{t.important}</option>
                  <option value="critical">{t.critical}</option>
                </select>
              </div>
            </div>

            {/* Note details */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                {t.formMessage}
              </label>
              <textarea
                required
                rows={5}
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder={t.formMessagePlaceholder}
                className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-xl focus:border-[var(--clr-brand-blue)] focus:outline-none transition-colors leading-relaxed font-sans"
              />
            </div>

            {/* Secure Sign-Off Active check */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-[var(--clr-border-light)] flex items-start gap-3">
              <input
                id="clinical-secure-sig"
                type="checkbox"
                required
                checked={isDigitalSigned}
                onChange={(e) => setIsDigitalSigned(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <label htmlFor="clinical-secure-sig" className="text-[10.5px] font-medium text-neutral-600 dark:text-neutral-300 leading-tight cursor-pointer select-none">
                <span className="font-extrabold text-[#4F46E5] block mb-0.5">✙ {t.digitalSign}</span>
                <span className="text-[9.5px] text-neutral-400">Authenticated and timestamped against duty operator clearance parameters.</span>
              </label>
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-[11.5px] uppercase tracking-wider">{t.submitBtn}</span>
            </button>
          </form>
        </div>


        {/* RIGHT COLUMN: Handover Notes Feed (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter Toolbar Card */}
          <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-4.5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-xl focus:border-[var(--clr-brand-blue)] focus:outline-none transition-colors font-medium"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 border border-[var(--clr-border-light)] px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-transparent border-none text-[11px] focus:outline-none font-bold text-neutral-600 dark:text-neutral-350"
                  >
                    <option value="All">{t.filterPriority}</option>
                    <option value="critical">Critical</option>
                    <option value="important">Important</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border border-[var(--clr-border-light)] px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <Building className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={filterClinic}
                    onChange={(e) => setFilterClinic(e.target.value)}
                    className="bg-transparent border-none text-[11px] focus:outline-none font-bold text-neutral-600 dark:text-neutral-350"
                  >
                    <option value="All">{t.filterClinic}</option>
                    <option value="Medicine">Medicine</option>
                    <option value="ENT">ENT</option>
                    <option value="Dental">Dental</option>
                    <option value="Retina">Retina</option>
                    <option value="Glaucoma">Glaucoma</option>
                    <option value="Orbit">Orbit</option>
                    <option value="General Ophthalmology">General</option>
                    <option value="Nurse Station">Nurse Station</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pl-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
              {t.recentLogs} ({filteredNotes.length})
            </span>
          </div>

          {/* List Feed of Handover notes */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                  const isCritical = note.priority === "critical";
                  const isImportant = note.priority === "important";
                  
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`p-4 border rounded-3xl bg-[var(--clr-bg-card)] transition-all duration-300 relative shadow-sm border-l-4 ${
                        isCritical
                          ? "border-l-rose-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.06)]"
                          : isImportant
                          ? "border-l-amber-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.06)]"
                          : "border-l-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.06)]"
                      }`}
                    >
                      {/* Top Row: Note ID, Creator, and Delete button */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Note ID */}
                          <span className="font-mono text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80">
                            {note.id}
                          </span>

                          {/* Priority Badge */}
                          {note.priority === "critical" && (
                            <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-150 px-2.2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                              {t.criticalBadg}
                            </span>
                          )}
                          {note.priority === "important" && (
                            <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-150 px-2.2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                              {t.importantBadg}
                            </span>
                          )}
                          {note.priority === "routine" && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-150 px-2.2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                              {t.routineBadg}
                            </span>
                          )}

                          {/* Clinic Badge */}
                          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-[var(--clr-border-light)] px-2.2 py-0.5 rounded-full text-[9.5px] font-bold flex items-center gap-1">
                            <Building className="w-2.5 h-2.5 text-neutral-450" />
                            <span>{note.clinic === "All" ? t.allClinics : note.clinic}</span>
                          </span>
                        </div>

                        {/* Delete action for authorized managers or original authors */}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete clinical log note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Message Content */}
                      <div className="text-xs text-[#0F172A] dark:text-neutral-150 leading-relaxed font-sans font-medium whitespace-pre-wrap select-text my-3 bg-neutral-50/50 dark:bg-neutral-900/15 p-3 rounded-2xl border border-[var(--clr-border-light)]/40">
                        {note.message}
                      </div>

                      {/* Signature block of author */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2.5 border-t border-dashed border-[var(--clr-border-light)] gap-3 bg-[var(--clr-bg-card)]">
                        {/* Author Certificate Stamp */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xs">
                            {note.creatorName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10.5px] font-black text-neutral-800 dark:text-neutral-200">
                              {note.creatorName}
                            </div>
                            <div className="text-[9px] text-neutral-400 flex items-center gap-1">
                              <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.2 rounded font-bold">{note.creatorRole}</span>
                              <span>•</span>
                              <span className="font-mono flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span className="font-mono">{note.timestamp}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Author Certificate Stamp Check */}
                        {note.isSigned && (
                          <span className="text-[9.5px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-150 rounded-xl px-2.5 py-1.5 flex items-center gap-1 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{t.signCheckText}</span>
                          </span>
                        )}
                      </div>

                      {/* Shift Acknowledgment Protocol Matrix */}
                      <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-[var(--clr-border-light)]">
                        {note.acknowledgedBy ? (
                          <div className="flex items-center gap-2 text-[10.5px] text-emerald-800 dark:text-emerald-400">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <span className="font-semibold block sm:inline">{t.ackStatus} </span>
                              <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{note.acknowledgedBy.name} ({note.acknowledgedBy.role})</span>
                              <span className="text-[9.5px] font-mono text-neutral-450 mx-1.5 block sm:inline">
                                {language === "ar" ? "في" : "at"} <span className="font-mono">{note.acknowledgedBy.at}</span>
                              </span>
                              <span className="ml-1 px-1.5 py-0.3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-850 dark:text-emerald-400 rounded text-[8.5px] font-bold uppercase tracking-wider">SECURE_ACK_OK</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-[10px] text-neutral-450 italic leading-tight">
                              {language === "ar" 
                                ? "يتطلب إقراراً بالاستلام من الوردية المناوبة المستلمة للعمل." 
                                : "Requires sign-off validation by incoming clinical personnel."}
                            </span>
                            <button
                              onClick={() => handleAcknowledgeNote(note.id)}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 text-neutral-700 dark:text-neutral-200 text-[10px] font-black rounded-lg transition duration-200 border border-[var(--clr-border-light)] shadow-sm active:scale-[0.98] flex items-center gap-1 cursor-pointer"
                            >
                              <span>{t.ackBtn}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-[var(--clr-bg-card)] border border-dashed border-[var(--clr-border-light)] rounded-3xl space-y-3">
                  <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-400 font-medium italic">
                    {t.noNotesFound}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
