/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  UserCheck,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Save,
  Search,
  Droplet,
  Scissors
} from "lucide-react";
import { Patient, PatientStatus, ClinicType } from "../types";

interface OphthalmicNurseWorkstationProps {
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  language: "en" | "ar";
  onSelectPatient: (id: string) => void;
  selectedPatientId: string;
}

const vocab = {
  en: {
    title: "Ophthalmic Nurse Workstation App",
    subtitle: "Central clinical triage workspace for visual prep, machine autorefractometry, pupil dilation timers, and surgical safety checks.",
    vitalsTile: "Active Triage Queue",
    dilationTile: "Active Dilation Timers",
    preOpTile: "Pre-Op Surgical Cleared",
    tabActiveQueue: "Patient Active Queue",
    tabTriageVitals: "Objective Ophthalmic Triage",
    tabDilationTracker: "Dilation Drop Timers",
    tabPreOpChecklist: "Pre-Op Prep Ward",
    filterAll: "All Clients",
    filterWaiting: "Waiting Triage",
    filterDilation: "Dilating State",
    filterReady: "Ready for Specialist",
    patientName: "Patient Name",
    clinicRoom: "Assigned Wing",
    statusBadge: "Encounter Stage",
    urgencyText: "Urgency",
    actions: "Actions",
    noPatients: "No clinical patient entries found inside selected filter.",
    bpTitle: "Systemic Vitals",
    ophthalmicTitle: "Autorefractometer & NCT Tonometry Pressures",
    sugarLabel: "Blood Glucose Concentration (mmol/L)",
    sugarPlaceholder: "e.g. 5.8",
    sugarFasting: "Fasting Mode",
    sugarRandom: "Random Reading",
    rightEye: "Right Eye (OD)",
    leftEye: "Left Eye (OS)",
    rightEyeIop: "OD NCT Air-Puff IOP (mmHg)",
    leftEyeIop: "OS NCT Air-Puff IOP (mmHg)",
    refractionRight: "OD Autorefraction Estimate",
    refractionLeft: "OS Autorefraction Estimate",
    saveVitalsBtn: "Verify & Lock Vitals Dossier",
    vitalsSuccess: "Systemic vitals and preliminary machine refraction logged to EMR successfully.",
    dilationTitle: "Dilation Timer Hub",
    instillDrops: "Instill Dilating drop & Trigger 20m Clock",
    remaining: "remaining",
    dilationComplete: "Full Dilation Reached (OD/OS Ready)",
    preOpSurgicalMark: "Pre-Operative Eye Markation & Prep",
    verifyEye: "Mark Scheduled Surgical eye",
    bothEyes: "Bilateral (OU)",
    preOpDrops: "Administer Local Anesthetic (Proparacaine Loading Dose)",
    preOpDropsDone: "Anesthetic drops administered",
    clearForOr: "Certify Surgical Clearance to Operating Theater",
    clearedText: "CLEARED FOR SURGERY",
    criticalAlertGlucose: "Warning: Patient Blood Glucose is critically elevated ({val} mmol/L). High systemic sugar increases infection risks and delays elective lens surgeries.",
    normalSugarText: "Glucose level verified as clinical safe limit.",
    searchLabel: "Quick Triage Filter",
    searchPlaceholder: "Search patient by name or ID...",
    triageCompletedMsg: "Completed screening - Patient state promoted to 'Triaged'"
  },
  ar: {
    title: "محطة ممرض العيون التخصصية",
    subtitle: "مركز فحص الطوارئ المسبق للعيون، قياسات النظر التلقائية، مؤقتات قطرات توسيع حدقة العين، والتحقق الجراحي.",
    vitalsTile: "قائمة فحص الممرض",
    dilationTile: "مؤقتات التوسيع النشطة",
    preOpTile: "جاهز للتداخل الجراحي",
    tabActiveQueue: "طابور المرضى المعلقين",
    tabTriageVitals: "التشخيص الأولي المسبق",
    tabDilationTracker: "مؤقتات التوسيع النشط",
    tabPreOpChecklist: "جناح التحضير للعمليات",
    filterAll: "كافة المسجلين اليوم",
    filterWaiting: "بانتظار الفحص الأولي",
    filterDilation: "في مرحلة التوسيع",
    filterReady: "جاهز لدخول الطبيب ورؤيته",
    patientName: "اسم المريض",
    clinicRoom: "العيادة المحول إليها",
    statusBadge: "المرحلة الحالية",
    urgencyText: "درجة الخطورة والاستعجال",
    actions: "الإجراءات",
    noPatients: "لا يوجد مرضى مطابقين للتصنيف المحدد حالياً.",
    bpTitle: "العلامات الحيوية النظامية",
    ophthalmicTitle: "تقرير جهاز قياس النظر المحوسب وضغط العين",
    sugarLabel: "تركيز السكر في الدم (mmol/L)",
    sugarPlaceholder: "مثال: 5.8",
    sugarFasting: "صائم",
    sugarRandom: "عشوائي",
    rightEye: "العين اليمنى (OD)",
    leftEye: "العين اليسرى (OS)",
    rightEyeIop: "ضغط العين اليمنى بالنفث الهوائي (mmHg)",
    leftEyeIop: "ضغط العين اليسرى بالنفث الهوائي (mmHg)",
    refractionRight: "تحديد المقاسات العين اليمنى",
    refractionLeft: "تحديد المقاسات العين اليسرى",
    saveVitalsBtn: "توثيق وتأمين فحص العلامات",
    vitalsSuccess: "تم تسجيل وتوثيق العلامات الحيوية ونفث ضغط العين بالملف الإلكتروني بنجاح.",
    dilationTitle: "مؤقت قطرات التوسيع المجهرية",
    instillDrops: "تقطير قطرة التوسيع وبدء العد التنازلي",
    remaining: "متبقي",
    dilationComplete: "توسيع كامل لحدقة العين (جاهز للفحص)",
    preOpSurgicalMark: "تحضير وسلامة الجراحة العينية",
    verifyEye: "تحديد العين الجراحية المقررة بالعملية الحالي",
    bothEyes: "بالمثلث الثنائي (OU)",
    preOpDrops: "إعطاء مخدر موضعي تحضيري (جرعة استرخاء بروباراكائين)",
    preOpDropsDone: "تم تقطير المخدر الموضعي",
    clearForOr: "اعتماد وسلامة الحالة لنقلها لغرفة العمليات",
    clearedText: "حالة معتمدة ومجهزة للجراحة فوراً",
    criticalAlertGlucose: "تحذير سريري: نسبة السكر بالدم مرتفعة ({val} mmol/L). ارتفاع السكر يعيق شفاء القرنية ويؤجل عمليات Lens.",
    normalSugarText: "نسبة السكر ممتازة وفي النطاق الجراحي الآمن.",
    searchLabel: "تصفية سريعة للطابور",
    searchPlaceholder: "ابحث عن المريض بالاسم أو الهوية...",
    triageCompletedMsg: "اكتمل الفحص المسبق - تم ترقية الحالة إلى 'جاهز للمقابلة الطبية'"
  }
};

interface DilationTimerState {
  patientId: string;
  secondsRemaining: number;
  eye: "RIGHT" | "LEFT" | "BILATERAL";
  active: boolean;
}

export default function OphthalmicNurseWorkstation({
  patients,
  onUpdatePatient,
  language,
  onSelectPatient,
  selectedPatientId
}: OphthalmicNurseWorkstationProps) {
  const isAr = language === "ar";
  const t = vocab[isAr ? "ar" : "en"];

  const [activeTab, setActiveTab] = useState<"queue" | "triage" | "dilation" | "preop" | "riverpod">("queue");
  const [filterMode, setFilterMode] = useState<"all" | "waiting" | "dilation" | "ready">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Input states for current selected patient triage form
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [heartRate, setHeartRate] = useState("74");
  const [temp, setTemp] = useState("36.7");
  const [weight, setWeight] = useState("70");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [isFasting, setIsFasting] = useState(true);

  // Ophthalmic Machine inputs
  const [arRight, setArRight] = useState("-2.00 SPH / -0.50 CYL x 90 AXIS");
  const [arLeft, setArLeft] = useState("-1.75 SPH");
  const [nctRight, setNctRight] = useState("15.5");
  const [nctLeft, setNctLeft] = useState("16.0");

  const [alertText, setAlertText] = useState<{ text: string; type: "success" | "warning" } | null>(null);

  // Map of active client count-down timers
  const [timers, setTimers] = useState<Record<string, DilationTimerState>>({});

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Sync state whenever selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      setSystolic(selectedPatient.triageVitals?.systolic?.toString() || "120");
      setDiastolic(selectedPatient.triageVitals?.diastolic?.toString() || "80");
      setHeartRate(selectedPatient.triageVitals?.heartRate?.toString() || "74");
      setTemp(selectedPatient.triageVitals?.temperatureCelcius?.toString() || "36.7");
      setWeight(selectedPatient.triageVitals?.weightKg?.toString() || "70");
      setBloodGlucose(selectedPatient.triageVitals?.bloodGlucoseMmol?.toString() || "");
      setIsFasting(selectedPatient.triageVitals?.isGlucoseFasting ?? true);

      setArRight(selectedPatient.triageVitals?.autorefractionEstimateRight || "-2.00 SPH / -0.50 CYL x 90 AXIS");
      setArLeft(selectedPatient.triageVitals?.autorefractionEstimateLeft || "-1.75 SPH");
      setNctRight(selectedPatient.triageVitals?.nctIopRightMmHg?.toString() || "15.5");
      setNctLeft(selectedPatient.triageVitals?.nctIopLeftMmHg?.toString() || "16.0");
    }
  }, [selectedPatientId, selectedPatient]);

  // Handle countdown interval logic for dilation timers
  useEffect(() => {
    const handleInterval = setInterval(() => {
      setTimers(prev => {
        const copy = { ...prev };
        let altered = false;
        Object.keys(copy).forEach(pId => {
          const tState = copy[pId];
          if (tState.active && tState.secondsRemaining > 0) {
            copy[pId] = {
              ...tState,
              secondsRemaining: tState.secondsRemaining - 1
            };
            altered = true;

            // Optional: periodically write progress or update state back to parent
            if (copy[pId].secondsRemaining === 0) {
              // At 0 finish, automatically update patient status to Ready and set flag
              const currentP = patients.find(p => p.id === pId);
              if (currentP) {
                onUpdatePatient({
                  ...currentP,
                  status: "Triaged",
                  triageVitals: {
                    ...currentP.triageVitals!,
                    vitalsVerified: true,
                    dilationTimerActive: false,
                    dilationSecondsRemaining: 0,
                    dilationCompleted: true
                  }
                });
              }
            }
          }
        });
        return altered ? copy : prev;
      });
    }, 1000);

    return () => clearInterval(handleInterval);
  }, [timers, patients, onUpdatePatient]);

  // Derived tallies for vitals, timers, pre-op
  const triageQueueCount = useMemo(() => {
    return patients.filter(p => p.status === "Registered" || !p.triageVitals?.vitalsVerified).length;
  }, [patients]);

  const activeDilationCount = useMemo(() => {
    return (Object.values(timers) as DilationTimerState[]).filter(t => t.active && t.secondsRemaining > 0).length;
  }, [timers]);

  const surgicalPreppedCount = useMemo(() => {
    return patients.filter(p => p.triageVitals?.surgicalEyeMarked && p.triageVitals?.preOpDropsGiven).length;
  }, [patients]);

  // Filtered patients for search + status filter
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (filterMode === "waiting") {
        return !p.triageVitals?.vitalsVerified || p.status === "Registered";
      }
      if (filterMode === "dilation") {
        const timerActive = timers[p.id]?.active && timers[p.id]?.secondsRemaining > 0;
        return p.triageVitals?.dilationTimerActive || timerActive;
      }
      if (filterMode === "ready") {
        return p.triageVitals?.vitalsVerified && p.status !== "Registered";
      }
      return true;
    });
  }, [patients, filterMode, searchQuery, timers]);

  // Form submit callback
  const handleVitalsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const parsedGlucose = parseFloat(bloodGlucose);
    const updatedPatient: Patient = {
      ...selectedPatient,
      status: "Triaged", // Shifting patient stage
      triageVitals: {
        systolic: parseInt(systolic) || 120,
        diastolic: parseInt(diastolic) || 80,
        heartRate: parseInt(heartRate) || 74,
        temperatureCelcius: parseFloat(temp) || 36.6,
        weightKg: parseFloat(weight) || 70,
        urgency: selectedPatient.triageVitals?.urgency || "Normal",
        vitalsVerified: true,
        bloodGlucoseMmol: isNaN(parsedGlucose) ? undefined : parsedGlucose,
        isGlucoseFasting: isFasting,
        autorefractionEstimateRight: arRight,
        autorefractionEstimateLeft: arLeft,
        nctIopRightMmHg: parseFloat(nctRight) || undefined,
        nctIopLeftMmHg: parseFloat(nctLeft) || undefined
      }
    };

    onUpdatePatient(updatedPatient);

    // If blood sugar is elevated (>10 mmol), trigger warning toast
    if (parsedGlucose > 10.0) {
      setAlertText({
        text: t.criticalAlertGlucose.replace("{val}", parsedGlucose.toString()),
        type: "warning"
      });
    } else {
      setAlertText({
        text: t.vitalsSuccess,
        type: "success"
      });
    }

    setTimeout(() => setAlertText(null), 5000);
  };

  // Trigger dilation dropdown timer click
  const triggerDilationTimer = (patientId: string, eye: "RIGHT" | "LEFT" | "BILATERAL") => {
    // We instantiate a countdown of 20 seconds (rather than 20 minutes) for realistic, direct and instantaneous verification or let them use simulated fast time.
    setTimers(prev => ({
      ...prev,
      [patientId]: {
        patientId,
        secondsRemaining: 20, // 20 seconds mock countdown for high speed testability
        eye,
        active: true
      }
    }));

    const targetP = patients.find(p => p.id === patientId);
    if (targetP) {
      onUpdatePatient({
        ...targetP,
        triageVitals: {
          ...(targetP.triageVitals || {
            systolic: 120, diastolic: 80, heartRate: 74, temperatureCelcius: 36.6, weightKg: 70, urgency: "Normal", vitalsVerified: false
          }),
          dilationTimerActive: true,
          dilationSecondsRemaining: 20,
          dilationEye: eye === "RIGHT" ? "RIGHT" : eye === "LEFT" ? "LEFT" : "BILATERAL",
          dilationCheckedAt: new Date().toLocaleTimeString()
        }
      });
    }

    setAlertText({
      text: isAr ? "تم إشعال مؤقت قطرة توسيع البؤبؤ السريع بنجاح" : "Instilled dilation drop. Triggered 20s fast-tester countdown cycle.",
      type: "success"
    });
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleSurgicalEyeMark = (patientId: string, eye: "OD" | "OS" | "OU") => {
    const targetP = patients.find(p => p.id === patientId);
    if (!targetP) return;

    onUpdatePatient({
      ...targetP,
      triageVitals: {
        ...(targetP.triageVitals || {
          systolic: 120, diastolic: 80, heartRate: 74, temperatureCelcius: 36.6, weightKg: 70, urgency: "Normal", vitalsVerified: false
        }),
        surgicalEyeMarked: eye
      }
    });

    setAlertText({
      text: isAr ? `تم تحديد العين المقررة للجراحة: ${eye}` : `Marked surgical eye check: ${eye}`,
      type: "success"
    });
    setTimeout(() => setAlertText(null), 3000);
  };

  const handleTogglePrepDrops = (patientId: string) => {
    const targetP = patients.find(p => p.id === patientId);
    if (!targetP) return;

    const currentVal = targetP.triageVitals?.preOpDropsGiven ?? false;

    onUpdatePatient({
      ...targetP,
      triageVitals: {
        ...(targetP.triageVitals || {
          systolic: 120, diastolic: 80, heartRate: 74, temperatureCelcius: 36.6, weightKg: 70, urgency: "Normal", vitalsVerified: false
        }),
        preOpDropsGiven: !currentVal
      }
    });
  };

  const certifySurgicalClearance = (patientId: string) => {
    const targetP = patients.find(p => p.id === patientId);
    if (!targetP) return;

    // Shift patient to completed/prepped clinical state
    onUpdatePatient({
      ...targetP,
      status: "LabsPending", // Stage gate
      clinicalLogs: [
        ...(targetP.clinicalLogs || []),
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          actorRole: "Ophthalmic Nurse",
          action: "SURGICAL_PREP_CLEARANCE",
          notes: `Cleared under direct clinical audit checkmark. Checked Eye: ${targetP.triageVitals?.surgicalEyeMarked || "OU"}. Anesthetic drop done.`
        }
      ]
    });

    setAlertText({
      text: isAr ? "تم اعتماد التحضير الطبي ونقل المريض فوراً لغرفة العمليات الجراحية" : "Patient dossier certified and cleared. Escorting to operating theater room.",
      type: "success"
    });
    setTimeout(() => setAlertText(null), 4500);
  };

  return (
    <div 
      id="ophthalmic-nurse-workstation-main-div"
      dir={isAr ? "rtl" : "ltr"}
      className="bg-[#FBFBF9] border border-[#EAE6DF] rounded-3xl p-5 md:p-8 shadow-sm flex flex-col space-y-6 transition duration-200 text-slate-800"
    >
      {/* Alert Banner */}
      {alertText && (
        <div 
          className={`px-4 py-3.5 rounded-2xl border text-xs font-bold font-sans flex items-center gap-3 animate-fade-in ${
            alertText.type === "warning" 
              ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30" 
              : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30"
          }`}
        >
          {alertText.type === "warning" ? <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />}
          <span>{alertText.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EAE6DF] pb-5 gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Droplet className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h1 className="font-sans font-black text-sm uppercase tracking-wider text-[#0F172A]">
              {t.title}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#EAE6DF]/30 px-3 py-1 rounded-xl text-[10px] font-mono font-black text-neutral-500 self-end md:self-auto border border-[#EAE6DF]">
          <span>WARD SHIFT STATUS: OPTIC_NURSE_ACTIVE</span>
        </div>
      </div>

      {/* KPI Tiles representing nurse queue metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE6DF] p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
              {t.vitalsTile}
            </span>
            <span className="text-2xl font-black font-mono text-[#0F172A] block">
              {triageQueueCount} <span className="text-xs font-sans text-neutral-400 font-normal">Patients</span>
            </span>
          </div>
          <div className="bg-indigo-50 h-11 w-11 rounded-xl flex items-center justify-center text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EAE6DF] p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
              {t.dilationTile}
            </span>
            <span className="text-2xl font-black font-mono text-[#0F172A] block">
              {activeDilationCount} <span className="text-xs font-sans text-neutral-400 font-normal font-mono">Running</span>
            </span>
          </div>
          <div className="bg-amber-50 h-11 w-11 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
        </div>

        <div className="bg-white border border-[#EAE6DF] p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
              {t.preOpTile}
            </span>
            <span className="text-2xl font-black font-mono text-emerald-600 block">
              {surgicalPreppedCount} <span className="text-xs font-sans text-neutral-400 font-normal">Prepped</span>
            </span>
          </div>
          <div className="bg-emerald-50 h-11 w-11 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE6DF] pb-3 text-xs uppercase font-extrabold text-left">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeTab === "queue" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-[#EAE6DF] text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.tabActiveQueue}</span>
        </button>

        <button
          onClick={() => setActiveTab("triage")}
          className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeTab === "triage" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-[#EAE6DF] text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.tabTriageVitals}</span>
        </button>

        <button
          onClick={() => setActiveTab("dilation")}
          className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeTab === "dilation" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-[#EAE6DF] text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.tabDilationTracker}</span>
        </button>

        <button
          onClick={() => setActiveTab("preop")}
          className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeTab === "preop" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-[#EAE6DF] text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>{t.tabPreOpChecklist}</span>
        </button>

        <button
          onClick={() => setActiveTab("riverpod")}
          className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeTab === "riverpod" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-[#EAE6DF] text-[#4F46E5] hover:bg-neutral-50"
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{isAr ? "هندسة ريفربود " : "Riverpod Architecture"}</span>
        </button>
      </div>

      {/* Core Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Side: Selected Queue List (4 columns) */}
        <div className="lg:col-span-4 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">
              {t.searchLabel}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE6DF] rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Filters Toggles */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2 py-1 text-[9.5px] font-bold uppercase rounded-lg border ${
                filterMode === "all" ? "bg-[#EEEDE8] border-neutral-300 text-slate-800" : "bg-white border-neutral-200 text-neutral-400"
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterMode("waiting")}
              className={`px-2 py-1 text-[9.5px] font-bold uppercase rounded-lg border ${
                filterMode === "waiting" ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-neutral-200 text-neutral-400"
              }`}
            >
              {t.filterWaiting}
            </button>
            <button
              onClick={() => setFilterMode("dilation")}
              className={`px-2 py-1 text-[9.5px] font-bold uppercase rounded-lg border ${
                filterMode === "dilation" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-neutral-200 text-neutral-400"
              }`}
            >
              {t.filterDilation}
            </button>
            <button
              onClick={() => setFilterMode("ready")}
              className={`px-2 py-1 text-[9.5px] font-bold uppercase rounded-lg border ${
                filterMode === "ready" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-neutral-200 text-neutral-400"
              }`}
            >
              {t.filterReady}
            </button>
          </div>

          {/* Patient Cards List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => {
                const isSelected = p.id === selectedPatientId;
                const dilationActive = timers[p.id]?.active && timers[p.id]?.secondsRemaining > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className={`p-3 rounded-2xl border cursor-pointer text-xs relative overflow-hidden transition ${
                      isSelected 
                        ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/10" 
                        : "bg-white border-[#EAE6DF] hover:bg-[#FBFBF9]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-neutral-800 font-sans leading-tight block">{p.name}</h4>
                        <span className="text-[9.5px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5 block">{p.id} • {p.gender} • {p.age} Yrs</span>
                      </div>
                      <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                        p.triageVitals?.urgency === "STAT_EMERGENCY" ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-[#EEEDE8] text-neutral-500"
                      }`}>
                        {p.triageVitals?.urgency || "Normal"}
                      </span>
                    </div>

                    <div className="border-t border-neutral-100 mt-2 pt-2 flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
                      <span>Wing: <strong className="text-slate-700">{p.clinic}</strong></span>
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold ${
                        p.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    {dilationActive && (
                      <div className="mt-1.5 bg-indigo-50 border border-indigo-100 rounded-lg p-1 px-2 flex items-center justify-between text-[9px] text-indigo-700 animate-pulse font-mono">
                        <span className="flex items-center gap-1"><Droplet className="w-2.5 h-2.5 animate-bounce" /> DILATING</span>
                        <span>{timers[p.id].secondsRemaining}s</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-neutral-400 italic text-xs bg-white border border-dashed border-[#EAE6DF] rounded-2xl">
                {t.noPatients}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tab panel details (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE6DF] rounded-3xl p-5 md:p-6 text-left">
          {selectedPatient ? (
            <div className="space-y-6">
              
              {/* Header Context Patient banner */}
              <div className="bg-[#FBFBF9] border border-[#EAE6DF] p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] bg-neutral-200 font-mono font-bold px-1.5 py-0.5 rounded text-neutral-600 uppercase">
                    ACTIVE FILES: {selectedPatient.id}
                  </span>
                  <h3 className="font-sans font-black text-sm text-[#0F172A] uppercase">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold">
                    DOB: {selectedPatient.dob} ({selectedPatient.age} Yrs) • Gender: {selectedPatient.gender}
                  </p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-black text-neutral-400 uppercase block">TARGET SPECIALTY</span>
                  <span className="text-xs font-black font-mono text-indigo-600 uppercase block">{selectedPatient.clinic} Room</span>
                </div>
              </div>

              {/* TAB 1: Patient ACTIVE QUEUE VIEW */}
              {activeTab === "queue" && (
                <div className="space-y-5">
                  <div className="border-b pb-3 border-neutral-100">
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block">
                      Core Encounter Roadmap
                    </span>
                    <p className="text-xs text-neutral-400 mt-1">
                      View previous triage inputs and shift-logged activities from EMR records.
                    </p>
                  </div>

                  {/* Vitals Summary Card */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-neutral-50 border border-[#EAE6DF] rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block">BP Score</span>
                      <span className="text-sm font-black font-mono">
                        {selectedPatient.triageVitals?.systolic || "—"}/{selectedPatient.triageVitals?.diastolic || "—"}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 border border-[#EAE6DF] rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block">Pulse (bpm)</span>
                      <span className="text-sm font-black font-mono">
                        {selectedPatient.triageVitals?.heartRate || "—"}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 border border-[#EAE6DF] rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block">Temperature </span>
                      <span className="text-sm font-black font-mono">
                        {selectedPatient.triageVitals?.temperatureCelcius ? `${selectedPatient.triageVitals.temperatureCelcius}°C` : "—"}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 border border-[#EAE6DF] rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block">Blood Sugar</span>
                      <span className="text-sm font-black font-mono text-indigo-600">
                        {selectedPatient.triageVitals?.bloodGlucoseMmol ? `${selectedPatient.triageVitals.bloodGlucoseMmol} mmol` : "Not Took"}
                      </span>
                    </div>
                  </div>

                  {/* Activity dossier checklist */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">
                      Historic Chronological EMR Logs
                    </span>
                    <div className="divide-y divide-neutral-100 font-sans text-xs">
                      {selectedPatient.clinicalLogs?.map((log, index) => (
                        <div key={index} className="py-2.5 flex justify-between items-start gap-4">
                          <div>
                            <span className="font-extrabold text-[#0F172A]">{log.action}</span>
                            <p className="text-neutral-500 text-[11px] leading-relaxed mt-0.5">{log.notes}</p>
                          </div>
                          <span className="font-mono text-[9px] text-[#8F8A7D] shrink-0 font-bold bg-[#EEEDE8] px-1.5 py-0.5 rounded-sm">
                            {log.timestamp} • {log.actorRole}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECIALIZED TRIAGE VITALS WORKSPACE */}
              {activeTab === "triage" && (
                <form onSubmit={handleVitalsSave} className="space-y-6">
                  
                  {/* Systemic BP block */}
                  <div className="space-y-3">
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block border-b pb-2">
                      {t.bpTitle}
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">BP: Systolic (mmHg)</label>
                        <input
                          required
                          type="number"
                          value={systolic}
                          onChange={e => setSystolic(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">BP: Diastolic (mmHg)</label>
                        <input
                          required
                          type="number"
                          value={diastolic}
                          onChange={e => setDiastolic(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Heart Rate (bpm)</label>
                        <input
                          required
                          type="number"
                          value={heartRate}
                          onChange={e => setHeartRate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Body Temp (°C)</label>
                        <input
                          required
                          type="number"
                          step={0.1}
                          value={temp}
                          onChange={e => setTemp(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Weight (kg)</label>
                        <input
                          required
                          type="number"
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diabetics and Blood glucose module */}
                  <div className="space-y-3 bg-amber-50/20 border border-amber-200/50 p-4.5 rounded-2xl">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                      糖🩸 Clinical Diabetic Retinopathy Assessment Guard
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-neutral-600 block">{t.sugarLabel}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder={t.sugarPlaceholder}
                          value={bloodGlucose}
                          onChange={e => setBloodGlucose(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#EAE6DF] rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Glucose Collection protocol</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsFasting(true)}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border uppercase transition ${
                              isFasting ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-neutral-200 text-neutral-400"
                            }`}
                          >
                            {t.sugarFasting}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFasting(false)}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border uppercase transition ${
                              !isFasting ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-neutral-200 text-neutral-400"
                            }`}
                          >
                            {t.sugarRandom}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {bloodGlucose && (
                      <p className={`text-[10px] font-black leading-normal ${parseFloat(bloodGlucose) > 10 ? "text-rose-600" : "text-[#8F8A7D]"}`}>
                        {parseFloat(bloodGlucose) > 10 
                          ? `⚠️ Critical warning limit exceeded! High serum sugar can degrade healing efficacy in cataract lens replacements.` 
                          : t.normalSugarText
                        }
                      </p>
                    )}
                  </div>

                  {/* Machine Autorefractometry inputs */}
                  <div className="space-y-4">
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block border-b pb-2">
                      {t.ophthalmicTitle}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Right Eye */}
                      <div className="border border-neutral-100 p-3.5 rounded-2xl bg-white space-y-3">
                        <span className="text-xs font-extrabold text-[#0a0f1d] uppercase block">{t.rightEye}</span>
                        
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[9.5px] font-bold text-neutral-400 uppercase block">{t.refractionRight}</label>
                            <input
                              type="text"
                              value={arRight}
                              onChange={e => setArRight(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-lg text-[11px] font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[9.5px] font-bold text-neutral-400 uppercase block">{t.rightEyeIop}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={nctRight}
                              onChange={e => setNctRight(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-lg text-[11px] font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Left Eye */}
                      <div className="border border-neutral-100 p-3.5 rounded-2xl bg-white space-y-3">
                        <span className="text-xs font-extrabold text-[#0a0f1d] uppercase block">{t.leftEye}</span>
                        
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[9.5px] font-bold text-neutral-400 uppercase block">{t.refractionLeft}</label>
                            <input
                              type="text"
                              value={arLeft}
                              onChange={e => setArLeft(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-lg text-[11px] font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[9.5px] font-bold text-neutral-400 uppercase block">{t.leftEyeIop}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={nctLeft}
                              onChange={e => setNctLeft(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#FBFBF9] border border-[#EAE6DF] rounded-lg text-[11px] font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission and promote */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>{t.saveVitalsBtn}</span>
                  </button>
                </form>
              )}

              {/* TAB 3: DILATION DROP TIMER CONTROL */}
              {activeTab === "dilation" && (
                <div className="space-y-6">
                  <div>
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block border-b pb-2">
                      {t.dilationTitle}
                    </span>
                    <p className="text-xs text-neutral-400 mt-1">
                      Retina diagnostics and cataract surgery requires pupils to expand fully using Tropicamide dilation drop agents. Track remaining countdown status live.
                    </p>
                  </div>

                  {/* Active Timer Card or instillation selector */}
                  {timers[selectedPatient.id]?.active && timers[selectedPatient.id].secondsRemaining > 0 ? (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 text-center space-y-4">
                      <div className="text-[10px] text-indigo-700 bg-indigo-100 uppercase tracking-widest font-mono font-black py-0.5 px-3 rounded-lg inline-block animate-pulse">
                        ⌛ tropicamide 1% dilation active
                      </div>

                      <div className="space-y-1">
                        <span className="text-4xl font-extrabold font-mono text-indigo-900 block">
                          00:{timers[selectedPatient.id].secondsRemaining.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs text-indigo-600 block">
                          {t.remaining} ({timers[selectedPatient.id].eye} eye)
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Triage remains in countdown lock. Once dilation hits zero, clinicians will be authorized to access retina photographic modules.
                      </p>

                      <button
                        onClick={() => {
                          setTimers(prev => ({
                            ...prev,
                            [selectedPatient.id]: {
                              ...prev[selectedPatient.id],
                              secondsRemaining: 0
                            }
                          }));
                          
                          onUpdatePatient({
                            ...selectedPatient,
                            triageVitals: {
                              ...selectedPatient.triageVitals!,
                              dilationSecondsRemaining: 0,
                              dilationCompleted: true,
                              dilationTimerActive: false
                            }
                          });
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider block mx-auto cursor-pointer"
                      >
                        ⚡ Simulate Instantly Finish
                      </button>
                    </div>
                  ) : selectedPatient.triageVitals?.dilationCompleted ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                      <div className="w-10 h-10 bg-emerald-100/60 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-200">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block">
                        {t.dilationComplete}
                      </span>
                      <p className="text-xs text-neutral-500 font-medium">
                        Patient pupillary dilation successfully cataloged and verified! Shifting next specialty stage checks.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FBFBF9] border border-dashed border-[#EAE6DF] rounded-3xl p-8 text-center space-y-4">
                      <Droplet className="w-8 h-8 text-neutral-400 mx-auto" strokeWidth={1.5} />
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-[#0F172A] uppercase block">No Active Drops Instilled</span>
                        <span className="text-[11px] text-neutral-400 block">Choose target eye to instillropicamide drops</span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                        <button
                          onClick={() => triggerDilationTimer(selectedPatient.id, "RIGHT")}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase rounded-xl transition cursor-pointer"
                        >
                          Instill OD (Right Eye)
                        </button>
                        <button
                          onClick={() => triggerDilationTimer(selectedPatient.id, "LEFT")}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase rounded-xl transition cursor-pointer"
                        >
                          Instill OS (Left Eye)
                        </button>
                        <button
                          onClick={() => triggerDilationTimer(selectedPatient.id, "BILATERAL")}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase rounded-xl shadow-md transition cursor-pointer"
                        >
                          Instill OU (Bilateral Both)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRE-OP SURGICAL CHECKLIST */}
              {activeTab === "preop" && (
                <div className="space-y-6">
                  <div>
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block border-b pb-2">
                      {t.preOpSurgicalMark}
                    </span>
                    <p className="text-xs text-neutral-400 mt-1">
                      Confirm surgical side markings and pre-operative drip protocol to avoid wrong-site clinical operations.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Mark selector */}
                    <div className="p-4 bg-neutral-50 border border-[#EAE6DF] rounded-2xl text-left space-y-3">
                      <label className="text-[10.5px] font-bold text-neutral-600 block">1. {t.verifyEye}</label>
                      
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSurgicalEyeMark(selectedPatient.id, "OD")}
                          className={`flex-1 py-3 border rounded-xl font-extrabold uppercase tracking-wide transition ${
                            selectedPatient.triageVitals?.surgicalEyeMarked === "OD"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          Right Eye (OD)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSurgicalEyeMark(selectedPatient.id, "OS")}
                          className={`flex-1 py-3 border rounded-xl font-extrabold uppercase tracking-wide transition ${
                            selectedPatient.triageVitals?.surgicalEyeMarked === "OS"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          Left Eye (OS)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSurgicalEyeMark(selectedPatient.id, "OU")}
                          className={`flex-1 py-3 border rounded-xl font-extrabold uppercase tracking-wide transition ${
                            selectedPatient.triageVitals?.surgicalEyeMarked === "OU"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                          }`}
                        >
                          OU ({t.bothEyes})
                        </button>
                      </div>
                    </div>

                    {/* Local loading drops checklist */}
                    <div className="p-4 bg-neutral-50 border border-[#EAE6DF] rounded-2xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5 text-left pr-2">
                        <strong className="text-[#0F172A] font-extrabold block">{t.preOpDrops}</strong>
                        <span className="text-neutral-400 block text-[11px] leading-snug">Confirm loading doses of proparacaine local anesthetic drops.</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleTogglePrepDrops(selectedPatient.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase transition ${
                          selectedPatient.triageVitals?.preOpDropsGiven 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                            : "bg-white border-neutral-300 text-neutral-500"
                        }`}
                      >
                        {selectedPatient.triageVitals?.preOpDropsGiven ? t.preOpDropsDone : "Mark Administered"}
                      </button>
                    </div>

                    {/* OR Gate validation */}
                    <div className="pt-4 border-t border-neutral-100 text-left space-y-3.5">
                      <span className="text-[10px] font-black uppercase text-[#8F8A7D]">2. Surgical Safety Clearance Gate</span>

                      {selectedPatient.triageVitals?.surgicalEyeMarked && selectedPatient.triageVitals?.preOpDropsGiven ? (
                        <div className="p-4.5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4">
                          <div className="flex gap-2.5 items-center text-emerald-800 text-xs font-bold leading-normal">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>All mandatory safety validation targets satisfied! Patient marked: <strong>{selectedPatient.triageVitals.surgicalEyeMarked}</strong> and proparacaine anesthetic drops logged.</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => certifySurgicalClearance(selectedPatient.id)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 animate-spin text-white" style={{ animationDuration: "5s" }} />
                            <span>{t.clearForOr}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-4.5 bg-amber-50 border border-amber-200 rounded-3xl flex gap-2.5 items-center text-amber-800 text-xs font-bold leading-relaxed">
                          <Info className="w-5 h-5 text-[#FF841A] shrink-0" />
                          <span>Ensure both **Surgical Eye Markation** and **Anesthetic drops** are logged before surgical door release clearance credentials trigger.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: RIVERPOD MOBILE PERSISTENCE SIMULATION & CODE SHOWCASE */}
              {activeTab === "riverpod" && (
                <div className="space-y-6">
                  <div>
                    <span className="font-sans font-black text-xs uppercase text-[#0F172A] block border-b pb-2">
                      {isAr ? "هندسة ريفربود للقطرات العينية المتزامنة" : "Riverpod Cross-Platform Mydriasis Engine"}
                    </span>
                    <p className="text-xs text-neutral-400 mt-1">
                      Our unified mobile nurse application runs on Flutter, using Riverpod state controllers paired with system clock intervals to ensure dilation timers never halt or drop state when tablets sleep or switch processes.
                    </p>
                  </div>

                  {/* Interactive Mobile Simulator & Background Suspend Tester */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Left Column (Mobile Simulator) */}
                    <div className="md:col-span-5 bg-[#121520] border border-neutral-800 text-neutral-100 rounded-3xl p-4.5 font-sans relative overflow-hidden shadow-lg aspect-[9/16] max-w-[280px] mx-auto flex flex-col justify-between min-h-[460px]">
                      {/* Speaker grill and bezel details */}
                      <div className="w-full flex justify-center pb-2">
                        <div className="w-20 h-4 bg-black rounded-b-xl flex items-center justify-center gap-1">
                          <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                          <div className="w-8 h-1 bg-neutral-800 rounded-full"></div>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                            FR
                          </div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-black tracking-wide leading-tight">AL JAWARIH MOBILE</h4>
                            <span className="text-[8px] text-neutral-400 font-mono">Riverpod v2.4 Active</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[8px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>ONLINE</span>
                        </div>
                      </div>

                      {/* Simulator Stage Screen */}
                      <div className="flex-1 py-3.5 space-y-3.5 overflow-y-auto">
                        <div className="space-y-1 text-left">
                          <span className="text-[8.5px] font-bold text-neutral-400 block uppercase tracking-wider">
                            Device Sleep Gating Demonstration
                          </span>
                          <p className="text-[9.5px] text-neutral-300 leading-normal">
                            Standard timers stop when screen is locked. Riverpod references hardware timestamps directly, remaining fully accurate when resumed!
                          </p>
                        </div>

                        {/* Interactive Widget representing our Riverpod ConsumerWidget */}
                        <div className="bg-[#1B1E2E] border border-neutral-800 rounded-2xl p-3 space-y-2.5 text-left text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase font-mono">ConsumerWidget State</span>
                            <span className="px-1 py-0.2 bg-indigo-900/55 border border-indigo-800 text-indigo-300 rounded text-[7.5px] font-mono">
                              20 Min Clinical Standard
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="font-extrabold text-[11px] text-white">{selectedPatient.name}</h5>
                            <span className="text-[8px] font-mono text-neutral-400 block uppercase font-black">ID: {selectedPatient.id} • {selectedPatient.clinic}</span>
                          </div>

                          {/* Dilation state UI */}
                          {timers[selectedPatient.id]?.active && timers[selectedPatient.id].secondsRemaining > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-neutral-400 uppercase font-mono block">Dilation Progress</span>
                                  <span className="text-lg font-black font-mono text-indigo-400">
                                    00:{timers[selectedPatient.id].secondsRemaining.toString().padStart(2, "0")}
                                  </span>
                                </div>
                                <span className="text-[8px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900 animate-pulse">
                                  RUNNING (TROPICAMIDE)
                                </span>
                              </div>
                              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full transition-all duration-1000" 
                                  style={{ width: `${(timers[selectedPatient.id].secondsRemaining / 20) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : selectedPatient.triageVitals?.dilationCompleted ? (
                            <div className="space-y-1 bg-emerald-950/25 border border-emerald-950/30 p-2 rounded-xl text-center">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-sans">Pupils expanded</span>
                              <span className="text-[8px] text-neutral-400 block font-mono">READY FOR FUNDUS EXAM</span>
                            </div>
                          ) : (
                            <div className="space-y-2 bg-neutral-900/40 p-2.5 rounded-xl border border-dashed border-neutral-800 text-center">
                              <Droplet className="w-3.5 h-3.5 text-indigo-400 mx-auto animate-bounce" />
                              <span className="text-[8.5px] text-neutral-400 font-bold block">No active drop on device</span>
                              <button
                                type="button"
                                onClick={() => triggerDilationTimer(selectedPatient.id, "BILATERAL")}
                                className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[8.5px] font-bold uppercase transition active:scale-95 cursor-pointer font-sans"
                              >
                                Trigger Instill Drops
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Interactive Sleep Test Controls */}
                        <div className="bg-[#10121C] border border-neutral-800/60 p-2.5 rounded-xl space-y-2">
                          <span className="text-[8px] font-bold text-amber-500/90 uppercase tracking-widest block text-left font-sans">
                            💤 App Hibernation Sandbox Test
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                // Simulate App pause (suspend timer interval manually)
                                const currentTimer = timers[selectedPatient.id];
                                if (currentTimer && currentTimer.active) {
                                  setTimers(prev => ({
                                    ...prev,
                                    [selectedPatient.id]: {
                                      ...currentTimer,
                                      active: false // Freeze the javascript interval state
                                    }
                                  }));
                                  setAlertText({
                                    text: "Simulating Mobile Device sleep! App suspended, JS timer frozen.",
                                    type: "warning"
                                  });
                                } else {
                                  setAlertText({
                                    text: "Please trigger the dilation timer first to run sleep demonstration.",
                                    type: "warning"
                                  });
                                }
                              }}
                              className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[7.5px] font-sans font-bold uppercase active:scale-95"
                            >
                              LOCK DEVICE
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // Simulate App resumption (recalculates remaining using hardware timestamps)
                                const currentTimer = timers[selectedPatient.id];
                                if (currentTimer) {
                                  // Resume and deduct mock elapsed time (e.g. simulate that 5 seconds passed in lock state)
                                  const elapsedSeconds = 5;
                                  const nextRemaining = Math.max(0, currentTimer.secondsRemaining - elapsedSeconds);
                                  
                                  setTimers(prev => ({
                                    ...prev,
                                    [selectedPatient.id]: {
                                      ...currentTimer,
                                      secondsRemaining: nextRemaining,
                                      active: true
                                    }
                                  }));

                                  if (nextRemaining === 0) {
                                    onUpdatePatient({
                                      ...selectedPatient,
                                      status: "Triaged",
                                      triageVitals: {
                                        ...selectedPatient.triageVitals!,
                                        vitalsVerified: true,
                                        dilationTimerActive: false,
                                        dilationSecondsRemaining: 0,
                                        dilationCompleted: true
                                      }
                                    });
                                  }

                                  setAlertText({
                                    text: `Resumed Device! Riverpod computed exact completion relative to hardware time. Deducted mock elapsed 5 seconds of sleep.`,
                                    type: "success"
                                  });
                                  setTimeout(() => setAlertText(null), 4000);
                                }
                              }}
                              className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[7.5px] font-sans font-bold uppercase active:scale-95"
                            >
                              RESUME & SYNC
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Home Button Bar indicator */}
                      <div className="pt-2 border-t border-neutral-800/40 flex justify-center">
                        <div className="w-16 h-1.5 bg-neutral-700 rounded-full"></div>
                      </div>
                    </div>

                    {/* Right Column (Code Viewer) */}
                    <div className="md:col-span-7 flex flex-col space-y-3.5 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase block">Core Riverpod System file</span>
                          <span className="text-xs font-semibold text-slate-700">flutter_mydriasis_notifier.dart</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const codeStr = `import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SelectedEye { right, left, bilateral }

class MydriasisSessionState {
  final String patientId;
  final String patientName;
  final SelectedEye targetEye;
  final DateTime instillTime;
  final int totalDurationMinutes;
  final bool isCompleted;
  final bool isPaused;

  const MydriasisSessionState({
    required this.patientId,
    required this.patientName,
    required this.targetEye,
    required this.instillTime,
    this.totalDurationMinutes = 20,
    this.isCompleted = false,
    this.isPaused = false,
  });

  int get secondsRemaining {
    if (isCompleted) return 0;
    final targetTime = instillTime.add(Duration(minutes: totalDurationMinutes));
    final difference = targetTime.difference(DateTime.now()).inSeconds;
    return difference > 0 ? difference : 0;
  }
}`;
                            navigator.clipboard.writeText(codeStr);
                            setAlertText({
                              text: "Successfully copied state notifier Dart code template!",
                              type: "success"
                            });
                            setTimeout(() => setAlertText(null), 3000);
                          }}
                          className="px-2.5 py-1 text-[9.5px] font-bold uppercase font-sans text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition active:scale-95 cursor-pointer"
                        >
                          Copy Code
                        </button>
                      </div>

                      <div className="bg-[#0B0E14] border border-neutral-800 rounded-2xl p-4 overflow-x-auto max-h-[380px] font-mono text-[9.5px] text-slate-300 leading-normal select-all">
                        <span className="text-slate-500 block pb-1">// flutter_mydriasis_notifier.dart - StateNotifier implementation</span>
                        <span className="text-amber-500 font-bold block">import</span> <span className="text-emerald-400">'dart:async'</span>;
                        <span className="text-amber-500 font-bold block">import</span> <span className="text-emerald-400">'dart:convert'</span>;
                        <span className="text-amber-500 font-bold block">import</span> <span className="text-emerald-400">'package:flutter_riverpod/flutter_riverpod.dart'</span>;
                        <br/>
                        <span className="text-sky-400 font-bold">class</span> <span className="text-yellow-300 font-bold">MydriasisSessionState</span> &#123;
                        <span className="block pl-4"><span className="text-sky-400">final</span> String patientId;</span>
                        <span className="block pl-4"><span className="text-sky-400">final</span> String patientName;</span>
                        <span className="block pl-4"><span className="text-sky-400">final</span> SelectedEye targetEye;</span>
                        <span className="block pl-4"><span className="text-sky-400">final</span> DateTime instillTime;</span>
                        <span className="block pl-4"><span className="text-sky-400">final</span> int totalDurationMinutes;</span>
                        <br/>
                        <span className="block pl-4 text-emerald-500">// Robust system-clock comparison protects timers from sleep suspension</span>
                        <span className="block pl-4"><span className="text-sky-400">int</span> get secondsRemaining &#123;</span>
                        <span className="block pl-8">final targetTime = instillTime.add(Duration(minutes: totalDurationMinutes));</span>
                        <span className="block pl-8">final difference = targetTime.difference(DateTime.now()).inSeconds;</span>
                        <span className="block pl-8">return difference &gt; 0 ? difference : 0;</span>
                        <span className="block pl-4">&#125;</span>
                        &#125;
                        <br/>
                        <span className="text-sky-400 font-bold">class</span> <span className="text-yellow-300 font-bold">MydriasisTimerNotifier</span> <span className="text-sky-400">extends</span> StateNotifier&lt;Map&lt;String, MydriasisSessionState&gt;&gt; &#123;
                        <span className="block pl-4 text-neutral-500">// logical polling ticks safely save and notify widgets</span>
                        <span className="block pl-4">... instillDilationDrops(&#123;required String patientId, SelectedEye eye&#125;) ...</span>
                        &#125;
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-neutral-400 italic text-xs">
              Ensure you have patient profiles registered inside Al Jawarih system.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
