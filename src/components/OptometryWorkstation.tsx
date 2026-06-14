/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Users,
  Glasses,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Search,
  Eye,
  Settings,
  Lock,
  Sparkles,
  RefreshCw,
  FolderLock,
  ChevronRight,
  FileText,
  BadgeAlert
} from "lucide-react";
import { Patient, OptometryEncounterDossier, ClinicType } from "../types";

interface OptometryWorkstationProps {
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  language: "en" | "ar";
  onSelectPatient: (id: string) => void;
  selectedPatientId: string;
}

const vocab = {
  en: {
    title: "Optometry Gateway Workstation",
    subtitle: "Absolute mandatory baseline clinical intake, lensometry, visual acuity matrix, and automated down-stream routing.",
    kpiAwaiting: "Awaiting Refraction",
    kpiRouted: "Routed to Specialists",
    kpiHighIop: "High IOP Alerts (>21)",
    tabPending: "Pending Queue",
    tabCompleted: "Completed Today",
    searchPlaceholder: "Search patient by name or ID...",
    noPatients: "No patients found matching the criteria.",
    patientDetailHeader: "Comprehensive Optometry Dossier",
    noPatientSelected: "Please select a patient from the queue to edit their dossier.",
    
    // Lensometry Ledger
    lensometryTitle: "1. Lensometry Ledger (Current Spectacle)",
    hasSpectacles: "Patient wears glasses/lenses currently",
    sph: "Sphere (SPH)",
    cyl: "Cylinder (CYL)",
    axis: "Axis",
    add: "Addition (ADD)",
    lensType: "Lens Profile",
    singleVision: "Single Vision",
    bifocal: "Bifocal",
    progressive: "Progressive",
    prismToggle: "Prism Correction Included",

    // Visual Acuity
    vaTitle: "2. Visual Acuity (VA) Grid Matrix",
    ucva: "Unaided Vision (UCVA)",
    bcva: "Best-Aided Vision (BCVA)",
    pinhole: "Pinhole Acuity",
    pinholeHelp: "Critical Diagnostic: If pinhole improves vision, pathology is refractive (needs glasses). If not, suspect structural disease (Cataract, Macular path).",
    refractiveFlag: "Baseline locked. Refractive only.",
    pathologyFlag: "Pathology Alert! Non-Refractive vision drop.",

    // Manifest Refraction
    refractionTitle: "3. Subjective Manifest Refraction",
    vertexCalc: "Vertex Distance Auto-Calculator (Contact Lenses)",
    vertexLabel: "Surgical Vertex (mm)",
    contactLensPower: "Adjusted Contact Lens power: ",

    // Tonometry
    tonometryTitle: "4. Non-Contact Tonometry (Air-Puff IOP)",
    diabeticFlag: "Patient is Diabetic (Requires Urgent Dilation)",
    diabeticPrompt: "Schedule Dilating Drops Immediately (Retina Prep)",
    iopDanger: "IntraOcular Pressure registers Glaucoma risk (IOP > 21)",

    // Routing
    routingHeader: "5. Gateway Patient Routing Console",
    destinationLabel: "Target Specialist Destination Clinic",
    pinLabel: "Optometrist Secure Signatory PIN",
    pinPlaceholder: "Enter 4-digit PIN",
    routeBtn: "Complete & Route Dossier",
    mandatoryTitle: "MANDATORY CLINICAL FENCING ACTIVE",
    mandatoryDesc: "Optometry results MUST be recorded and finalized before the clinical consultation can be opened by specialty physicians.",
    rightEye: "Right Eye",
    leftEye: "Left Eye",
    signSuccess: "Dossier signed and successfully transmitted to downstream queue"
  },
  ar: {
    title: "بوابة فحص قياس النظر الرئيسية",
    subtitle: "الولوج السريري الإلزامي لقياس حدة البصر، فحص العدسات الحالية، وتوجيه الحالات التلقائي للعيادات التخصصية.",
    kpiAwaiting: "بانتظار الفحص",
    kpiRouted: "تمت إحالتهم لليوم",
    kpiHighIop: "تحذيرات ضغط العين (>21)",
    tabPending: "طابور الانتظار",
    tabCompleted: "المكتملون اليوم",
    searchPlaceholder: "ابحث بالاسم أو رقم الملف...",
    noPatients: "لا يوجد مرضى مطابقين للبحث.",
    patientDetailHeader: "الملف العيني الشامل للمريض",
    noPatientSelected: "الرجاء اختيار مريض من القائمة للبدء بالفحص.",

    // Lensometry Ledger
    lensometryTitle: "١. فحص النظارات الحالية للمريض (Lensometry)",
    hasSpectacles: "المريض يرتدي نظارة حالياً",
    sph: "الكرة (SPH)",
    cyl: "الأسطوانة (CYL)",
    axis: "المحور (Axis)",
    add: "الإضافة القريبة (ADD)",
    lensType: "نوع العدسات",
    singleVision: "رؤية فردية",
    bifocal: "ثنائية البؤرة",
    progressive: "متدرجة (Progressive)",
    prismToggle: "يحتوي على تصحيح منشور (Prism)",

    // Visual Acuity
    vaTitle: "٢. مصفوفة قياس حدة البصر والتحقق (Visual Acuity)",
    ucva: "النظر غير المصحح (UCVA)",
    bcva: "أفضل نظر مصحح (BCVA)",
    pinhole: "حدة النظر عبر الثقب الصغير (Pinhole)",
    pinholeHelp: "مؤشر سريري خطير: إذا تحسن النظر عبر الثقب فهو خلل انكساري (نظارة)، وإلا فيشتبه ب pathology هيكلية (الماء الأبيض أو اعتلال البقعة).",
    refractiveFlag: "تم القفل. المشكلة انكسارية بحتة.",
    pathologyFlag: "تنبيه! انخفاض النظر غير انكساري (اشتباه علة بصرية).",

    // Manifest Refraction
    refractionTitle: "٣. الفحص الانكساري الذاتي النهائي",
    vertexCalc: "حساب مسافة القمة التلقائي (العدسات اللاصقة)",
    vertexLabel: "مسافة القمة بالمليمتر (Vertex)",
    contactLensPower: "مقدار القوة المعدلة للعدسات اللاصقة: ",

    // Tonometry
    tonometryTitle: "٤. فحص ضغط العين بأجهزة النفث الهوائي (IOP)",
    diabeticFlag: "المريض يعاني من داء السكري (يتطلب توسيع العين فوراً)",
    diabeticPrompt: "يرجى تقطير قطرة التوسيع فوراً (لصالح شبكية العين)",
    iopDanger: "ضغط العين مرتفع ومؤشر لخطورة الجلوكوما (IOP > 21)",

    // Routing
    routingHeader: "٥. لوحة التوجيه السريري المباشر",
    destinationLabel: "العيادة العينية التخصصية المستهدفة",
    pinLabel: "رمز التوقيع الإلكتروني لمسؤول الفحص",
    pinPlaceholder: "أدخل الرمز المكون من 4 أرقام",
    routeBtn: "اعتماد البيانات وتحويل المريض",
    mandatoryTitle: "نظام حماية الفحص الإلزامي نشط",
    mandatoryDesc: "يجب تعبئة واعتماد ملف قياس النظر أولاً قبل أن يتمكن الأطباء من بدء الكشف السريري في العيادات التخصصية.",
    rightEye: "العين اليمنى",
    leftEye: "العين اليسرى",
    signSuccess: "تم توقيع الملف ونقله بنجاح لعيادة الاختصاص"
  }
};

export default function OptometryWorkstation({
  patients,
  onUpdatePatient,
  language,
  onSelectPatient,
  selectedPatientId
}: OptometryWorkstationProps) {
  const t = vocab[language];

  // Inbound queue filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"pending" | "completed">("pending");
  const [securityPin, setSecurityPin] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Retina");

  // Local drafted state for current visual testing (resets on patient switch or loads if existing)
  const [lensometry, setLensometry] = useState({
    hasCurrentSpectacles: false,
    rightEyeOd: { sphere: "-2.50", cylinder: "-0.75", axis: 90, addition: "0.00" },
    leftEyeOs: { sphere: "-2.25", cylinder: "-1.00", axis: 80, addition: "0.00" },
    lensType: "Single Vision" as "Single Vision" | "Bifocal" | "Progressive" | "Prism" | "None"
  });

  const [visualAcuity, setVisualAcuity] = useState({
    distanceUnaided: { od: "20/60", os: "20/80" },
    distanceAided: { od: "20/20", os: "20/25" },
    pinholeAcuity: { od: "20/20", os: "20/20" }
  });

  const [subjectiveRefraction, setSubjectiveRefraction] = useState({
    finalPrescriptionOd: { sphere: "-2.75", cylinder: "-0.50", axis: 90 },
    finalPrescriptionOs: { sphere: "-2.50", cylinder: "-0.75", axis: 85 },
    vertexDistanceMm: 12
  });

  const [tonometry, setTonometry] = useState({
    rightEyeOd: 16.5,
    leftEyeOs: 15.8,
    measurementMethod: "NON_CONTACT_TONOMETRY" as "NON_CONTACT_TONOMETRY" | "GOLDMANN_APP_TONOMETRY"
  });

  const [patientIsDiabetic, setPatientIsDiabetic] = useState(false);
  const [useContactLensCalc, setUseContactLensCalc] = useState(false);
  const [messageAlert, setMessageAlert] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sync state on patient switch
  const activePatient = useMemo(() => {
    const found = patients.find(p => p.id === selectedPatientId);
    if (found) {
      // Pre-populate if patient already has optometry ledger, or initialize defaults
      if (found.optometryDossier) {
        setLensometry(found.optometryDossier.lensometryData);
        setVisualAcuity(found.optometryDossier.visualAcuity);
        setSubjectiveRefraction(found.optometryDossier.subjectiveRefraction);
        setTonometry(found.optometryDossier.tonometryIopMmHg);
        setSecurityPin("");
        setSelectedSpecialty(found.optometryDossier.targetSpecialtyDestination || "Retina");
        setPatientIsDiabetic(found.clinicalTriageFlags?.hasDiabetes || false);
      } else {
        // Safe resets
        setLensometry({
          hasCurrentSpectacles: false,
          rightEyeOd: { sphere: "0.00", cylinder: "0.00", axis: 90, addition: "0.00" },
          leftEyeOs: { sphere: "0.00", cylinder: "0.00", axis: 80, addition: "0.00" },
          lensType: "None"
        });
        setVisualAcuity({
          distanceUnaided: { od: "20/40", os: "20/40" },
          distanceAided: { od: "20/20", os: "20/20" },
          pinholeAcuity: { od: "20/20", os: "20/20" }
        });
        setSubjectiveRefraction({
          finalPrescriptionOd: { sphere: "0.00", cylinder: "0.00", axis: 90 },
          finalPrescriptionOs: { sphere: "0.00", cylinder: "0.00", axis: 95 },
          vertexDistanceMm: 12
        });
        setTonometry({
          rightEyeOd: 15.0,
          leftEyeOs: 14.8,
          measurementMethod: "NON_CONTACT_TONOMETRY"
        });
        setSecurityPin("");
        setPatientIsDiabetic(found.clinicalTriageFlags?.hasDiabetes || false);
        // Map target specialty from current room assignment if available
        if (found.clinic === "Glaucoma" || found.clinic === "Retina" || found.clinic === "Pediatrics Ophthalmology" || found.clinic === "General Ophthalmology") {
          setSelectedSpecialty(found.clinic);
        } else {
          setSelectedSpecialty("General Ophthalmology");
        }
      }
    }
    return found;
  }, [selectedPatientId, patients]);

  // Compute stats metrics
  const stats = useMemo(() => {
    // Awaiting Refraction: Patients registered/triaged but has no completed optometry state
    const awaiting = patients.filter(p => !p.optometryDossier).length;
    const completed = patients.filter(p => !!p.optometryDossier).length;
    // High IOP alert count (any completed or triage recording with IOP > 21)
    const highIopCount = patients.filter(p => {
      const isHighDossier = p.optometryDossier && (p.optometryDossier.tonometryIopMmHg.rightEyeOd > 21 || p.optometryDossier.tonometryIopMmHg.leftEyeOs > 21);
      const isHighTriage = p.triageVitals && ((p.triageVitals.nctIopRightMmHg || 0) > 21 || (p.triageVitals.nctIopLeftMmHg || 0) > 21);
      return isHighDossier || isHighTriage;
    }).length;

    return { awaiting, completed, highIopCount };
  }, [patients]);

  // Filtered queue patients list
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Text match
      const textMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!textMatch) return false;

      // Status tab match
      const hasDossier = !!p.optometryDossier;
      if (filterTab === "pending") {
        return !hasDossier;
      } else {
        return hasDossier;
      }
    });
  }, [patients, searchTerm, filterTab]);

  // Vertex correction calculations for contacts vs glasses
  // Formula: Fc = F / (1 - (d * F)) where d is vertex distance in meters
  const calculateVertexPower = (sphStr: string, distanceMm: number) => {
    const f = parseFloat(sphStr);
    if (!f || isNaN(f)) return "0.00";
    const d = distanceMm / 1000;
    const fc = f / (1 - (d * f));
    return fc > 0 ? `+${fc.toFixed(2)}` : fc.toFixed(2);
  };

  // Automated flags and alerts processor based on optometry inputs
  const evaluationFlags = useMemo(() => {
    const flags: string[] = [];
    
    // IOP Trigger
    if (tonometry.rightEyeOd > 21 || tonometry.leftEyeOs > 21) {
      flags.push("RISK_GLAUCOMA_ELEVATED_IOP");
    }
    // High Astigmatism check
    if (Math.abs(parseFloat(subjectiveRefraction.finalPrescriptionOd.cylinder)) >= 3.0 || Math.abs(parseFloat(subjectiveRefraction.finalPrescriptionOs.cylinder)) >= 3.0) {
      flags.push("KERATOCONUS_SUSPECT");
    }
    // Diabetic Alert
    if (patientIsDiabetic) {
      flags.push("FUNDUS_DILATE_REQUIRED");
    }
    // Pinhole test assessment
    // Check if BCVA is bad (not 20/20) and Pinhole did not correct it to 20/20
    const bcvaRightBad = visualAcuity.distanceAided.od !== "20/20";
    const bcvaLeftBad = visualAcuity.distanceAided.os !== "20/20";
    const pinholeRightUnfavorable = visualAcuity.pinholeAcuity.od !== "20/20";
    const pinholeLeftUnfavorable = visualAcuity.pinholeAcuity.os !== "20/20";
    if ((bcvaRightBad && pinholeRightUnfavorable) || (bcvaLeftBad && pinholeLeftUnfavorable)) {
      flags.push("REFRACTIVE_LIMIT_LOCKED");
    }

    return flags;
  }, [tonometry, subjectiveRefraction, patientIsDiabetic, visualAcuity]);

  // Handle routing commit & electronic locking
  const handleCompleteAndRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!securityPin || securityPin.length < 4) {
      setMessageAlert({ text: "Error: 4-digit Optometrist Security PIN is required to sign the clinic dossier.", type: "error" });
      return;
    }

    // Assemble dossier
    const dossier: OptometryEncounterDossier = {
      encounterId: `ENC-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId: activePatient.id,
      optometristStaffId: "STAFF-OPT-704",
      lensometryData: { ...lensometry },
      visualAcuity: { ...visualAcuity },
      subjectiveRefraction: { ...subjectiveRefraction },
      tonometryIopMmHg: { ...tonometry },
      targetSpecialtyDestination: selectedSpecialty,
      completedAt: new Date().toLocaleTimeString(),
      optometristPinSigned: true,
      clinicalFlags: evaluationFlags
    };

    // Construct upgraded patient file
    const updatedPatient: Patient = {
      ...activePatient,
      status: "InConsult", // Promote immediately to Active Consultation
      clinic: selectedSpecialty as ClinicType, // Route to the specialized clinical desk
      optometryDossier: dossier,
      clinicalLogs: [
        ...(activePatient.clinicalLogs || []),
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actorRole: "Optometrist",
          action: "Gateway Refraction Complete",
          notes: `Baseline optometry signed under Pin #***. Diagnostic warnings attached: [${evaluationFlags.join(", ")}]. routed to ${selectedSpecialty}.`
        }
      ],
      // Add a potential IOP premium measurement item if appropriate
      billingLedger: [
        ...(activePatient.billingLedger || []),
        {
          id: `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
          serviceName: "Comprehensive Refraction & Prism Manifestation",
          category: "MedicalConsult" as any, // fallback or Consultation
          amount: 110,
          status: "InsurancePending"
        }
      ]
    };

    // Propagate up to main controller
    onUpdatePatient(updatedPatient);
    setMessageAlert({ text: t.signSuccess, type: "success" });
    setSecurityPin("");
    
    // Auto timeout alert message
    setTimeout(() => {
      setMessageAlert(null);
    }, 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6" id="optometry_clinical_gateway">
      
      {/* 🔮 Gateway Clinical KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="optometry_kpi_indicators">
        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] transition-all">
          <div>
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block font-sans">
              {t.kpiAwaiting}
            </span>
            <span className="text-3xl font-black font-sans text-[#4F46E5] dark:text-[#2BBFFF] tracking-tight block mt-1">
              {stats.awaiting} {language === "ar" ? "حالة" : "patients"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-[#2BBFFF]/20 flex items-center justify-center text-[#4F46E5] dark:text-[#2BBFFF]">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] transition-all">
          <div>
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block font-sans">
              {t.kpiRouted}
            </span>
            <span className="text-3xl font-black font-sans text-emerald-600 dark:text-emerald-400 tracking-tight block mt-1">
              {stats.completed} {language === "ar" ? "مكتمل" : "completed"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] transition-all">
          <div>
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block font-sans">
              {t.kpiHighIop}
            </span>
            <span className={`text-3xl font-black font-sans tracking-tight block mt-1 ${stats.highIopCount > 0 ? "text-amber-500 dark:text-amber-400" : "text-neutral-400"}`}>
              {stats.highIopCount} {language === "ar" ? "تنبيهات" : "flags"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Glasses className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="optometry_grid">
        
        {/* 📋 LEFT: Clinical Queue */}
        <div className="lg:col-span-4 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[850px]" id="optometry_queue_column">
          <div className="p-4 border-b border-[#EAE6DF] dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#0E1019]/50">
            <h3 className="font-sans font-black text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              {language === "ar" ? "طابور المقابلات والبصريات" : "Ecare Optometry Worklist"}
            </h3>
            
            {/* SEARCH */}
            <div className="relative mt-3">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-[#0B0E14] border border-[#EAE6DF] dark:border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] dark:focus:border-[#2BBFFF]"
              />
            </div>

            {/* TAB SELECTORS */}
            <div className="flex gap-2 mt-4 border-b border-[#EAE6DF] dark:border-neutral-800 pb-1">
              <button
                onClick={() => setFilterTab("pending")}
                className={`text-xs font-bold font-sans pb-2 px-1 transition-all relative ${
                  filterTab === "pending"
                    ? "text-[#4F46E5] dark:text-[#2BBFFF] border-b-2 border-[#4F46E5] dark:border-[#2BBFFF]"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {t.tabPending}
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-50 dark:bg-[#2BBFFF]/20 text-[10px] rounded-full">
                  {patients.filter(p => !p.optometryDossier).length}
                </span>
              </button>
              <button
                onClick={() => setFilterTab("completed")}
                className={`text-xs font-bold font-sans pb-2 px-1 transition-all relative ${
                  filterTab === "completed"
                    ? "text-[#4F46E5] dark:text-[#2BBFFF] border-b-2 border-[#4F46E5] dark:border-[#2BBFFF]"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {t.tabCompleted}
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-full">
                  {patients.filter(p => !!p.optometryDossier).length}
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE6DF] dark:divide-neutral-800/60 font-sans">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500 font-sans">
                {t.noPatients}
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;
                const isHighIop = patient.triageVitals && ((patient.triageVitals.nctIopRightMmHg || 0) > 21 || (patient.triageVitals.nctIopLeftMmHg || 0) > 21);
                const hasDiabetes = patient.clinicalTriageFlags?.hasDiabetes;

                return (
                  <button
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className={`w-full p-4 text-left flex flex-col gap-2 transition-all hover:bg-neutral-50/70 dark:hover:bg-[#0E1019]/40 ${
                      isSelected ? "bg-indigo-50/50 dark:bg-[#4F46E5]/10 border-l-4 border-[#4F46E5] dark:border-[#2BBFFF]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                        {patient.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {patient.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>{patient.age} {language === "ar" ? "سنة" : "years"}</span>
                      <span>•</span>
                      <span className="bg-neutral-100 dark:bg-[#0B0E14] text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded font-mono text-[9px]">
                        {patient.clinic}
                      </span>
                    </div>

                    {/* FLAGS & BADGES */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {isHighIop && (
                        <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-950/50 flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5" /> High IOP
                        </span>
                      )}
                      {hasDiabetes && (
                        <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-950/50">
                          DIABETIC
                        </span>
                      )}
                      {patient.optometryDossier && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-950/50 flex items-center gap-0.5 ml-auto">
                          ✓ REGISTERED
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 🩺 RIGHT: In-depth Clinical Dossier Form */}
        <div className="lg:col-span-8 bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-xl shadow-sm p-6 flex flex-col min-h-[500px]" id="optometry_workstation_main_details">
          <AnimatePresence mode="wait">
            {!activePatient ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <Glasses className="w-16 h-16 text-neutral-300 dark:text-neutral-700 animate-bounce mb-4" />
                <h4 className="font-sans font-extrabold text-neutral-800 dark:text-neutral-100 text-lg mb-1">
                  {t.title}
                </h4>
                <p className="font-sans text-xs text-neutral-400 dark:text-neutral-500 max-w-md">
                  {t.noPatientSelected}
                </p>
                <div className="mt-6 border border-dashed border-[#EAE6DF] dark:border-neutral-850 p-4 rounded-xl bg-[#FBFBF9] dark:bg-[#0B0E14] text-left max-w-sm">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block mb-1">
                    ⚠️ CLINICAL SECURITY POLICY
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {t.mandatoryDesc}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activePatient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#EAE6DF] dark:border-neutral-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-black text-neutral-800 dark:text-neutral-100 text-lg tracking-tight">
                        {t.patientDetailHeader}
                      </h4>
                      <span className="text-xs bg-indigo-50 dark:bg-[#2BBFFF]/20 text-[#4F46E5] dark:text-[#2BBFFF] border border-indigo-200 dark:border-[#2BBFFF]/40 px-2 py-0.5 rounded font-mono uppercase font-black tracking-wide">
                        {activePatient.id}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {activePatient.name} (DOB: {activePatient.dob}, Age: {activePatient.age}, Gender: {activePatient.gender})
                    </p>
                  </div>

                  <div className="bg-[#FBFBF9] dark:bg-[#0C0F17] border border-[#EAE6DF] dark:border-neutral-800 p-2 rounded-lg flex items-center gap-3 mt-3 md:mt-0">
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-mono">
                        Active Triage Origin
                      </span>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                        {activePatient.clinic} Clinic
                      </span>
                    </div>
                  </div>
                </div>

                {messageAlert && (
                  <div className={`p-4 rounded-lg text-xs font-semibold font-sans flex items-center gap-2 ${
                    messageAlert.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {messageAlert.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{messageAlert.text}</span>
                  </div>
                )}

                {/* MODULE 1: Lensometry Ledger */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-lg p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                    <h5 className="text-xs uppercase font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-2 font-sans tracking-wider">
                      <Glasses className="w-4 h-4 text-[#4F46E5]" />
                      {t.lensometryTitle}
                    </h5>
                    
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lensometry.hasCurrentSpectacles}
                        onChange={(e) => setLensometry({ ...lensometry, hasCurrentSpectacles: e.target.checked })}
                        className="rounded border-neutral-300 text-[#4F46E5] focus:outline-none"
                      />
                      <span>{t.hasSpectacles}</span>
                    </label>
                  </div>

                  {lensometry.hasCurrentSpectacles && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      {/* OD RIGHT */}
                      <div className="space-y-2 border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg bg-[#FBFBF9] dark:bg-[#0B0E14]/40">
                        <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-[#0C0F17] px-2 py-0.5 rounded font-black text-[#4F46E5] dark:text-[#2BBFFF] tracking-wider block w-fit mb-2">
                          {t.rightEye} (OD)
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">SPH</label>
                            <input
                              type="text"
                              value={lensometry.rightEyeOd.sphere}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                rightEyeOd: { ...lensometry.rightEyeOd, sphere: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">CYL</label>
                            <input
                              type="text"
                              value={lensometry.rightEyeOd.cylinder}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                rightEyeOd: { ...lensometry.rightEyeOd, cylinder: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">AXIS</label>
                            <input
                              type="number"
                              value={lensometry.rightEyeOd.axis}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                rightEyeOd: { ...lensometry.rightEyeOd, axis: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">ADD</label>
                            <input
                              type="text"
                              value={lensometry.rightEyeOd.addition}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                rightEyeOd: { ...lensometry.rightEyeOd, addition: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* OS LEFT */}
                      <div className="space-y-2 border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg bg-[#FBFBF9] dark:bg-[#0B0E14]/40">
                        <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-[#0C0F17] px-2 py-0.5 rounded font-black text-[#4F46E5] dark:text-[#2BBFFF] tracking-wider block w-fit mb-2">
                          {t.leftEye} (OS)
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">SPH</label>
                            <input
                              type="text"
                              value={lensometry.leftEyeOs.sphere}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                leftEyeOs: { ...lensometry.leftEyeOs, sphere: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">CYL</label>
                            <input
                              type="text"
                              value={lensometry.leftEyeOs.cylinder}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                leftEyeOs: { ...lensometry.leftEyeOs, cylinder: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">AXIS</label>
                            <input
                              type="number"
                              value={lensometry.leftEyeOs.axis}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                leftEyeOs: { ...lensometry.leftEyeOs, axis: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-400 block mb-1">ADD</label>
                            <input
                              type="text"
                              value={lensometry.leftEyeOs.addition}
                              onChange={(e) => setLensometry({
                                ...lensometry,
                                leftEyeOs: { ...lensometry.leftEyeOs, addition: e.target.value }
                              })}
                              className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs px-2 py-1 text-center font-mono rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lens profile details */}
                      <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-black text-neutral-600 dark:text-neutral-400">{t.lensType}:</label>
                          <div className="flex gap-1.5">
                            {["Single Vision", "Bifocal", "Progressive", "Prism"].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setLensometry({ ...lensometry, lensType: type as any })}
                                className={`text-[10px] font-mono leading-none tracking-tight font-bold rounded px-2.5 py-1.5 transition-all ${
                                  lensometry.lensType === type
                                    ? "bg-[#4F46E5] text-white"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                }`}
                              >
                                {type === "Single Vision" ? t.singleVision : type === "Bifocal" ? t.bifocal : type === "Progressive" ? t.progressive : t.prismToggle}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* MODULE 2: Visual Acuity Grid Matrix */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-lg p-4 space-y-4 shadow-sm">
                  <h5 className="text-xs uppercase font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-2 tracking-wider font-sans">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    {t.vaTitle}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Unaided VA */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-[#0C0F17] px-2 py-0.5 rounded font-bold text-neutral-500 tracking-wider block w-fit">
                        {t.ucva}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OD</label>
                          <select
                            value={visualAcuity.distanceUnaided.od}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              distanceUnaided: { ...visualAcuity.distanceUnaided, od: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OS</label>
                          <select
                            value={visualAcuity.distanceUnaided.os}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              distanceUnaided: { ...visualAcuity.distanceUnaided, os: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Aided Vision BCVA */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-[#0C0F17] px-2 py-0.5 rounded font-bold text-[#4F46E5] dark:text-[#2BBFFF] tracking-wider block w-fit">
                        {t.bcva}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OD</label>
                          <select
                            value={visualAcuity.distanceAided.od}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              distanceAided: { ...visualAcuity.distanceAided, od: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OS</label>
                          <select
                            value={visualAcuity.distanceAided.os}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              distanceAided: { ...visualAcuity.distanceAided, os: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pinhole Acuity */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-[#0C0F17] px-2 py-0.5 rounded font-bold text-amber-500 tracking-wider block w-fit">
                        {t.pinhole}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OD</label>
                          <select
                            value={visualAcuity.pinholeAcuity.od}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              pinholeAcuity: { ...visualAcuity.pinholeAcuity, od: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400", "N/A"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-neutral-400 block mb-1">OS</label>
                          <select
                            value={visualAcuity.pinholeAcuity.os}
                            onChange={(e) => setVisualAcuity({
                              ...visualAcuity,
                              pinholeAcuity: { ...visualAcuity.pinholeAcuity, os: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1 font-mono rounded"
                          >
                            {["20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/80", "20/100", "20/200", "20/400", "N/A"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Pathfinder Banner */}
                  <div className="bg-[#FBFBF9] dark:bg-[#0B0E14] border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg text-[11px] font-sans text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                        Pathfinder Diagnostic Assessment
                      </span>
                      <p className="leading-relaxed">{t.pinholeHelp}</p>
                      
                      {/* Clinical evaluation message based on actual user input */}
                      <div className="mt-2 flex items-center gap-1.5 font-bold">
                        {evaluationFlags.includes("REFRACTIVE_LIMIT_LOCKED") ? (
                          <span className="text-amber-500 uppercase flex items-center gap-1">
                            ⚠️ {t.pathologyFlag}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                            ✓ {t.refractiveFlag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODULE 3: Subjective Manifest Refraction Engine */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-lg p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                    <h5 className="text-xs uppercase font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-2 font-sans tracking-wider">
                      <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
                      {t.refractionTitle}
                    </h5>

                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useContactLensCalc}
                        onChange={(e) => setUseContactLensCalc(e.target.checked)}
                        className="rounded border-neutral-300 text-[#4F46E5] focus:outline-none"
                      />
                      <span>{t.vertexCalc}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Final prescription Right */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg space-y-3 bg-[#FBFBF9] dark:bg-[#0B0E14]/40">
                      <span className="text-[11px] font-black text-[#4F46E5] dark:text-[#2BBFFF] tracking-wide block uppercase font-mono bg-indigo-50 dark:bg-[#2BBFFF]/10 px-2 py-0.5 rounded w-fit">
                        {t.rightEye} Prescription (OD)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">SPH (D)</label>
                          <input
                            type="text"
                            value={subjectiveRefraction.finalPrescriptionOd.sphere}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOd: { ...subjectiveRefraction.finalPrescriptionOd, sphere: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">CYL (D)</label>
                          <input
                            type="text"
                            value={subjectiveRefraction.finalPrescriptionOd.cylinder}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOd: { ...subjectiveRefraction.finalPrescriptionOd, cylinder: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">AXIS</label>
                          <input
                            type="number"
                            value={subjectiveRefraction.finalPrescriptionOd.axis}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOd: { ...subjectiveRefraction.finalPrescriptionOd, axis: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                      </div>

                      {useContactLensCalc && (
                        <div className="bg-indigo-50/50 dark:bg-[#2BBFFF]/5 p-2 rounded text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                          {t.contactLensPower} <strong className="text-[#4F46E5] dark:text-[#2BBFFF]">{calculateVertexPower(subjectiveRefraction.finalPrescriptionOd.sphere, subjectiveRefraction.vertexDistanceMm)} D</strong>
                        </div>
                      )}
                    </div>

                    {/* Final prescription Left */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-3 rounded-lg space-y-3 bg-[#FBFBF9] dark:bg-[#0B0E14]/40">
                      <span className="text-[11px] font-black text-[#4F46E5] dark:text-[#2BBFFF] tracking-wide block uppercase font-mono bg-indigo-50 dark:bg-[#2BBFFF]/10 px-2 py-0.5 rounded w-fit">
                        {t.leftEye} Prescription (OS)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">SPH (D)</label>
                          <input
                            type="text"
                            value={subjectiveRefraction.finalPrescriptionOs.sphere}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOs: { ...subjectiveRefraction.finalPrescriptionOs, sphere: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">CYL (D)</label>
                          <input
                            type="text"
                            value={subjectiveRefraction.finalPrescriptionOs.cylinder}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOs: { ...subjectiveRefraction.finalPrescriptionOs, cylinder: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-400 block mb-1">AXIS</label>
                          <input
                            type="number"
                            value={subjectiveRefraction.finalPrescriptionOs.axis}
                            onChange={(e) => setSubjectiveRefraction({
                              ...subjectiveRefraction,
                              finalPrescriptionOs: { ...subjectiveRefraction.finalPrescriptionOs, axis: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full bg-white dark:bg-[#121520] border border-neutral-300 dark:border-neutral-800 text-xs p-1.5 text-center font-mono rounded font-bold"
                          />
                        </div>
                      </div>

                      {useContactLensCalc && (
                        <div className="bg-indigo-50/50 dark:bg-[#2BBFFF]/5 p-2 rounded text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                          {t.contactLensPower} <strong className="text-[#4F46E5] dark:text-[#2BBFFF]">{calculateVertexPower(subjectiveRefraction.finalPrescriptionOs.sphere, subjectiveRefraction.vertexDistanceMm)} D</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {useContactLensCalc && (
                    <div className="flex items-center gap-4 border-t border-neutral-100 dark:border-neutral-850 pt-3">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        {t.vertexLabel}
                      </span>
                      <input
                        type="range"
                        min="8"
                        max="18"
                        value={subjectiveRefraction.vertexDistanceMm}
                        onChange={(e) => setSubjectiveRefraction({ ...subjectiveRefraction, vertexDistanceMm: parseInt(e.target.value) })}
                        className="w-48 accent-[#4F46E5]"
                      />
                      <span className="font-mono text-xs font-black text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 rounded">
                        {subjectiveRefraction.vertexDistanceMm} mm
                      </span>
                    </div>
                  )}
                </div>

                {/* MODULE 4: Tonometry & IOP Matrix */}
                <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 rounded-lg p-4 space-y-4 shadow-sm" id="tonometry_section">
                  <h5 className="text-xs uppercase font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-2 tracking-wider font-sans">
                    <Activity className="w-4 h-4 text-[#F59E0B]" />
                    {t.tonometryTitle}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Air puff readings scale */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">
                            OD Pressure (mmHg)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={tonometry.rightEyeOd}
                              onChange={(e) => setTonometry({ ...tonometry, rightEyeOd: parseFloat(e.target.value) || 0 })}
                              className={`w-full bg-white dark:bg-[#0B0E14] border text-sm px-3 py-1.5 font-mono font-bold rounded focus:outline-none focus:border-indigo-500 ${
                                tonometry.rightEyeOd > 21
                                  ? "border-rose-400 text-rose-600 bg-rose-50/20"
                                  : "border-[#EAE6DF] dark:border-neutral-800 text-neutral-850 dark:text-neutral-100"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">
                            OS Pressure (mmHg)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={tonometry.leftEyeOs}
                              onChange={(e) => setTonometry({ ...tonometry, leftEyeOs: parseFloat(e.target.value) || 0 })}
                              className={`w-full bg-white dark:bg-[#0B0E14] border text-sm px-3 py-1.5 font-mono font-bold rounded focus:outline-none focus:border-indigo-500 ${
                                tonometry.leftEyeOs > 21
                                  ? "border-rose-400 text-rose-600 bg-rose-50/20"
                                  : "border-[#EAE6DF] dark:border-neutral-800 text-neutral-850 dark:text-neutral-100"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warnings based on high pressure */}
                      {(tonometry.rightEyeOd > 21 || tonometry.leftEyeOs > 21) && (
                        <div className="p-3 bg-red-55 border border-rose-300 dark:border-rose-955 rounded-lg text-rose-700 dark:text-rose-400 text-[11px] font-bold font-sans flex items-center gap-2 animate-pulse">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{t.iopDanger}</span>
                        </div>
                      )}
                    </div>

                    {/* Integrated Diabetic Urgent Action Switch */}
                    <div className="border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-lg bg-[#FBFBF9] dark:bg-[#0E1019] flex flex-col justify-center gap-2">
                      <label className="flex items-center gap-3 text-xs font-black text-neutral-800 dark:text-neutral-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patientIsDiabetic}
                          onChange={(e) => setPatientIsDiabetic(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-neutral-300 text-red-500 focus:outline-none"
                        />
                        <span className="uppercase tracking-wider">{t.diabeticFlag}</span>
                      </label>
                      
                      {patientIsDiabetic && (
                        <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{t.diabeticPrompt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODULE 5: Direct Referral Specialty Routing panel */}
                <form onSubmit={handleCompleteAndRoute} className="bg-white dark:bg-[#121520] border-2 border-indigo-100 dark:border-[#4F46E5]/20 p-5 rounded-lg space-y-4" id="routing_console">
                  <h5 className="text-xs uppercase font-black text-[#4F46E5] dark:text-[#2BBFFF] flex items-center gap-2 border-b border-indigo-100 dark:border-neutral-800/60 pb-2 tracking-wider font-sans">
                    <Lock className="w-4 h-4" />
                    {t.routingHeader}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Target dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">
                        {t.destinationLabel}
                      </label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full bg-white dark:bg-[#0B0E14] border border-[#EAE6DF] dark:border-neutral-800 text-xs px-3 py-2 rounded font-sans font-bold text-neutral-800 dark:text-neutral-105"
                      >
                        <option value="Retina">Retina Specialty Clinic</option>
                        <option value="Glaucoma">Glaucoma Diagnostic Clinic</option>
                        <option value="Pediatrics Ophthalmology">Pediatric & Strabismus Clinic</option>
                        <option value="General Ophthalmology">General Ophthalmology Desk</option>
                        <option value="Orbit">Ophthalmic Plastic & Orbit Clinic</option>
                      </select>
                    </div>

                    {/* PIN validation */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">
                        {t.pinLabel}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder={t.pinPlaceholder}
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        className="w-full bg-white dark:bg-[#0B0E14] border border-[#EAE6DF] dark:border-neutral-800 text-xs px-3 py-2 rounded font-mono font-bold text-neutral-800 dark:text-neutral-105"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] text-white font-sans font-black text-xs uppercase tracking-widest py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t.routeBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
