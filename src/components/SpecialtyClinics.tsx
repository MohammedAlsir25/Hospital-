/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  FolderOpen,
  Eye,
  Activity,
  UserCheck,
  RotateCcw,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { Patient, ClinicType, ClinicState, BillingItem, ClinicalRole } from "../types";
import { CLINIC_INFO_MAP } from "../data";
import PediatricStrabismusWorkstation from "./PediatricStrabismusWorkstation";
import ComprehensiveEyeWorkstation from "./ComprehensiveEyeWorkstation";

interface SpecialtyClinicsProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onUpdatePatient: (updated: Patient) => void;
  activeRole: ClinicalRole;
  onShowReport?: (patientId: string) => void;
  language?: "en" | "ar";
}

export default function SpecialtyClinics({
  patients,
  selectedPatient,
  onUpdatePatient,
  activeRole,
  onShowReport,
  language = "en"
}: SpecialtyClinicsProps) {
  // Local state for the selected patient's active clinical entries
  const [clinicState, setClinicState] = useState<ClinicState>({
    warningsCleared: false,
    hearingLossDiagnosed: false,
    audiometryFileAttached: false,
    audiometryFileName: "",
    odontogram: Array.from({ length: 32 }, (_, i) => i + 1).reduce(
      (acc, id) => ({ ...acc, [id]: "Healthy" }),
      {}
    ),
    dilationTimerActive: false,
    dilationSecondsRemaining: 20, // sped up for simulation, or full countdown
    dilationCompleted: false,
    iopLeftEye: 15,
    iopRightEye: 16,
    glaucomaErrorMsg: "",
    movementScore: 3,
    visualChartType: "LEA Symbols",
    isPatchingAdvised: false,
    refractionSphere: -2.25,
    refractionCylinder: -0.75,
    refractionAxis: 90
  });

  const [prescriptionInput, setPrescriptionInput] = useState("");
  const [labOrderInput, setLabOrderInput] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [showDoseWarning, setShowDoseWarning] = useState(false);
  const [consultationClosed, setConsultationClosed] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // General Medicine Workstation States
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<any[]>([
    { code: "E11.9", term: "Type 2 Diabetes Mellitus", type: "PRIMARY", status: "CONFIRMED", chronicity: "CHRONIC", progression: "Active" }
  ]);
  const [diagnosisType, setDiagnosisType] = useState("PRIMARY");
  const [clinicalStatus, setClinicalStatus] = useState("CONFIRMED");
  const [chronicityStatus, setChronicityStatus] = useState("CHRONIC");
  const [progressionStatus, setProgressionStatus] = useState("Active");

  const [referralClinic, setReferralClinic] = useState("Retina");
  const [referralUrgency, setReferralUrgency] = useState("URGENT");
  const [referralReason, setReferralReason] = useState("");

  const [rxSelectedDrugId, setRxSelectedDrugId] = useState("dr-1");
  const [rxDose, setRxDose] = useState("500");
  const [rxUnit, setRxUnit] = useState("mg");
  const [rxFreq, setRxFreq] = useState("BID");
  const [rxDuration, setRxDuration] = useState("30");
  const [rxRoute, setRxRoute] = useState("ORAL");
  const [rxInstructions, setRxInstructions] = useState("Take with meals.");
  const [localPrescriptions, setLocalPrescriptions] = useState<any[]>([]);

  // ==========================================
  // DENTAL CLINIC ADVANCED WORKSTATION STATES
  // ==========================================
  const [selectedTooth, setSelectedTooth] = useState<number | null>(14);
  const [activeDentalBrushMode, setActiveDentalBrushMode] = useState<"PATHOLOGY" | "RESTORATION" | "PROPOSAL">("PATHOLOGY");
  const [activeDiagnosisBrush, setActiveDiagnosisBrush] = useState<string>("CARIES");
  const [activeRestorationBrush, setActiveRestorationBrush] = useState<string>("COMPOSITE");
  
  const [dentalToothRecords, setDentalToothRecords] = useState<Record<number, {
    toothNumber: number;
    surfaces: string[];
    condition: string;
    existingRestoration: string;
    proposedTreatmentCode: string;
    status: string;
  }>>(() => {
    const init: Record<number, any> = {};
    for (let i = 1; i <= 32; i++) {
      init[i] = {
        toothNumber: i,
        surfaces: [],
        condition: "HEALTHY",
        existingRestoration: "NONE",
        proposedTreatmentCode: "",
        status: "PLANNED"
      };
    }
    // Seed high-fidelity mock cases Matching Specification
    init[14] = {
      toothNumber: 14,
      surfaces: ["OCCLUSAL", "DISTAL"],
      condition: "CARIES",
      existingRestoration: "NONE",
      proposedTreatmentCode: "D2392",
      status: "PLANNED"
    };
    init[19] = {
      toothNumber: 19,
      surfaces: [],
      condition: "HEALTHY",
      existingRestoration: "ROOT_CANAL",
      proposedTreatmentCode: "D2750",
      status: "COMPLETED"
    };
    return init;
  });

  const [perioExam, setPerioExam] = useState({
    gingivitis: true,
    periodontitis: false,
    pocketDepthMaxMm: 5,
    bleedingOnProbing: true,
    mobilityGrade: "CLASS_I",
    oralLesions: "No abnormal mucosal or soft tissue lesions noted.",
    mucosalExam: "Normal color and hydration.",
    tongueExam: "Healthy, normal papillae layout.",
    salivaryGlands: "Patent ducts with normal clear flow."
  });

  const [dentalPrescriptions, setDentalPrescriptions] = useState<any[]>([
    {
      drugFormularyId: "6aab78f2-89b1-419b-bc3b-73a70baaa901",
      drugName: "Amoxicillin + Clavulanic Acid (Augmentin)",
      dosage: "500/125mg",
      frequency: "TID",
      durationDays: 7,
      administrationRoute: "ORAL",
      specialInstructions: "Finish full course of antibiotics."
    },
    {
      drugFormularyId: "6aab78f2-89b1-419b-bc3b-73a70baaa902",
      drugName: "Chlorhexidine Gluconate 0.12% Therapeutic Wash",
      dosage: "15ml",
      frequency: "BID",
      durationDays: 10,
      administrationRoute: "ORAL_RINSE",
      specialInstructions: "Rinse for 30 seconds after brushing, then spit out. Do not swallow."
    }
  ]);

  const [dentalReferralTarget, setDentalReferralTarget] = useState("ENT");
  const [dentalReferralUrgency, setDentalReferralUrgency] = useState("ROUTINE");
  const [dentalReferralReason, setDentalReferralReason] = useState("Evaluate right maxillary sinus proximity to infected tooth #14 roots.");

  const [activeXrayTab, setActiveXrayTab] = useState<"PERIAPICAL" | "BITEWING" | "OPG" | "CBCT">("PERIAPICAL");
  const [xrayBrightness, setXrayBrightness] = useState<number>(100);
  const [xrayContrast, setXrayContrast] = useState<number>(100);
  const [xrayInvert, setXrayInvert] = useState<boolean>(false);
  const [xrayZoom, setXrayZoom] = useState<number>(1);
  const [xrayFindings, setXrayFindings] = useState<string>("Infrabony pocket and bone loss noted around Tooth #14 roots projecting into the lower antrum floor.");

  const [dentalConsoleLogs, setDentalConsoleLogs] = useState<string[]>([
    "System Initialized: Dental multi-surface odontogram mapping module loaded."
  ]);

  // Systemic Sidebars
  const [allergies, setAllergies] = useState<string[]>(["Penicillin (Anaphylaxis)", "Sulfa Drugs (Rashes)"]);
  const [newAllergy, setNewAllergy] = useState("");
  const [chronicIssues, setChronicIssues] = useState<string[]>(["Hypertension", "Type 2 Diabetes Mellitus", "Hyperlipidemia"]);
  const [newChronicIssue, setNewChronicIssue] = useState("");

  const [generalMedicineRos, setGeneralMedicineRos] = useState({
    rosConstitutional: false,
    rosCardiovascular: true,
    rosRespiratory: false,
    rosGastrointestinal: false,
    rosNeurological: false,
    rosEnt: false,
    rosMusculoskeletal: false,
  });

  const [physicalExamDetails, setPhysicalExamDetails] = useState({
    peGeneral: "Patient is awake, alert, and oriented x3. Appears in no acute distress.",
    peCardiovascular: "Regular rate and rhythm. Normal S1/S2 heard. No murmurs, rubs, or gallops.",
    peRespiratory: "Lungs are clear to auscultation bilaterally. Normal respiratory effort. No wheezing.",
    peAbdominal: "Soft, non-distended, non-tender to light/deep palpation. Normal bowel sounds."
  });

  const [pharmacyOrdersCommitted, setPharmacyOrdersCommitted] = useState<any[]>([]);
  const [referralCommitted, setReferralCommitted] = useState<any>(null);

  // Next-Gen Interactive Diagnostic States
  const [retinaLesions, setRetinaLesions] = useState<{ x: number; y: number; type: string }[]>([]);
  const [selectedLesionType, setSelectedLesionType] = useState<string>("Hemorrhage");
  const [visualFieldMap, setVisualFieldMap] = useState<Record<string, "Normal" | "Scotoma">>({});
  const [lensFitted, setLensFitted] = useState<boolean>(false);

  // Advanced Retina & Macula Workstation States
  const [dilationAgent, setDilationAgent] = useState("Tropicamide 1% + Phenylephrine 2.5%");
  const [viewQuality, setViewQuality] = useState("EXCELLENT");
  const [mydriasisInstantTime, setMydriasisInstantTime] = useState("");
  
  // OCT Central Subfield Thickness (CST) state (Microns)
  const [cstOD, setCstOD] = useState(270);
  const [cstOS, setCstOS] = useState(520);
  const [octPerformed, setOctPerformed] = useState(true);
  
  // Historical CST Data for Arthur or General Retina Patients
  const [cstHistory, setCstHistory] = useState([
    { date: "2 mo ago", od: 275, os: 585, treatment: "Intravitreal Eylea (OS)" },
    { date: "1 mo ago", od: 268, os: 540, treatment: "Intravitreal Eylea (OS)" },
    { date: "Today", od: 270, os: 520, treatment: "Planned Eylea (OS)" }
  ]);

  // Bilateral Segment Exam Grid
  const [vitreousExamOD, setVitreousExamOD] = useState("Clear, no cellular flare, no PVD.");
  const [vitreousExamOS, setVitreousExamOS] = useState("1+ cells, trace flare, no active vitreous hemorrhage.");
  const [opticDiscOD, setOpticDiscOD] = useState("0.3 C/D ratio, sharp margins, normal color.");
  const [opticDiscOS, setOpticDiscOS] = useState("0.3 C/D ratio, sharp margins, trace nasal blurring.");
  const [maculaOD, setMaculaOD] = useState("Normal foveal reflex, dry macular structure.");
  const [maculaOS, setMaculaOS] = useState("Blunted reflex, intraretinal cysts, subretinal fluid pockets.");
  const [vesselsOD, setVesselsOD] = useState("Normal calibre, no neovascular complexes.");
  const [vesselsOS, setVesselsOS] = useState("Scatter microaneurysms, IRMA noted temporally.");
  const [peripheryOD, setPeripheryOD] = useState("Periphery flat, no tears or thinning.");
  const [peripheryOS, setPeripheryOS] = useState("Flat periphery, laser scars temporal/superior.");

  // Disease Staging Parameters
  const [drStaging, setDrStaging] = useState("MODERATE_NPDR");
  const [hasDme, setHasDme] = useState("YES_ACTIVE");
  const [amdStaging, setAmdStaging] = useState("NONE");
  const [vascularOcclusion, setVascularOcclusion] = useState("NONE");

  // In-Office Procedure Logs
  const [injectionPerformed, setInjectionPerformed] = useState(true);
  const [injTargetEye, setInjTargetEye] = useState("LEFT_EYE");
  const [injAgentCode, setInjAgentCode] = useState("Aflibercept (Eylea 2mg/0.05mL)");
  const [injLotNum, setInjLotNum] = useState("EYL-2026-X8712");
  const [injSterileSteps, setInjSterileSteps] = useState({
    povidoneIodine5: true,
    lidSpeculumPlaced: true,
    topicalProparacaine: true,
    postOpPressureCheck: true,
  });

  const [laserPerformed, setLaserPerformed] = useState(false);
  const [laserType, setLaserType] = useState("FOCAL_MACULAR");
  const [laserWavelength, setLaserWavelength] = useState("532nm Green");
  const [laserPowerMw, setLaserPowerMw] = useState(150);
  const [laserDurationMs, setLaserDurationMs] = useState(100);
  const [laserSpotsCoated, setLaserSpotsCoated] = useState(45);

  const [referralTarget, setReferralTarget] = useState("MEDICINE");
  const [referralUrgencyValue, setReferralUrgencyValue] = useState("URGENT");
  const [referralDetails, setReferralDetails] = useState("Endocrinology review requested for systemic BP & glycemic optimization. Current HbA1c is 8.4%.");

  const [retinaRxs, setRetinaRxs] = useState([
    { drugName: "Moxifloxacin 0.5% Ophthalmic Drops", dose: "1 drop", freq: "QID", days: 5, route: "OPHTHALMIC_EYE_DROPS", instructions: "Instill into LEFT eye post-injection." },
    { drugName: "Preservision AREDS 2 formula", dose: "1 Softgel", freq: "BID", days: 30, route: "ORAL", instructions: "Nutraceutical protection for bilateral age-related macular pathways." }
  ]);

  const [newRxName, setNewRxName] = useState("");
  const [newRxDose, setNewRxDose] = useState("1 drop");
  const [newRxFreq, setNewRxFreq] = useState("QID");
  const [newRxDays, setNewRxDays] = useState(5);

  // ==========================================
  // Glaucoma & Tonometry Workstation States
  // ==========================================
  const [glaucomaActiveTab, setGlaucomaActiveTab] = useState<"exam" | "staging" | "trends">("exam");
  const [glaucomaEyeFilter, setGlaucomaEyeFilter] = useState<"BOTH" | "OD" | "OS">("BOTH");
  const [orbitActiveTab, setOrbitActiveTab] = useState<"vitals" | "exam" | "ct">("vitals");
  const [gatOD, setGatOD] = useState<number>(24.5);
  const [gatOS, setGatOS] = useState<number>(19.0);
  const [cctOD, setCctOD] = useState<number>(510);
  const [cctOS, setCctOS] = useState<number>(515);

  const [diurnalReadings, setDiurnalReadings] = useState([
    { time: "08:00", od: 21.0, os: 17.5 },
    { time: "11:00", od: 24.5, os: 19.0 },
    { time: "14:00", od: 28.2, os: 20.8 },
    { time: "17:00", od: 23.0, os: 18.5 },
    { time: "20:00", od: 20.2, os: 16.1 }
  ]);
  const [newDiurnalTime, setNewDiurnalTime] = useState("12:00");
  const [newDiurnalOD, setNewDiurnalOD] = useState(25);
  const [newDiurnalOS, setNewDiurnalOS] = useState(20);

  // Optic Nerve & Angle Evaluations
  const [cdRatioOD, setCdRatioOD] = useState<number>(0.7);
  const [cdRatioOS, setCdRatioOS] = useState<number>(0.4);

  const [gonioOD, setGonioOD] = useState({
    superior: "OPEN_GRADE_4",
    inferior: "OPEN_GRADE_4",
    nasal: "OPEN_GRADE_3",
    temporal: "OPEN_GRADE_4"
  });
  const [gonioOS, setGonioOS] = useState({
    superior: "OPEN_GRADE_3",
    inferior: "OPEN_GRADE_4",
    nasal: "NARROW_GRADE_2",
    temporal: "OPEN_GRADE_4"
  });

  const [mdOD, setMdOD] = useState<number>(-6.42);
  const [mdOS, setMdOS] = useState<number>(-1.82);
  const [rnflOD, setRnflOD] = useState<string>("THIN_SUPERIOR");
  const [rnflOS, setRnflOS] = useState<string>("NORMAL");

  // Medication Washout & Compliance
  const [activeDrops, setActiveDrops] = useState({
    prostaglandin: true,
    betaBlocker: false,
    cai: true,
    alphaAgonist: false
  });
  const [complianceStatus, setComplianceStatus] = useState<"ADHERENT" | "NON_ADHERENT">("ADHERENT");
  const [complianceNotes, setComplianceNotes] = useState<string>("Complains of transient ocular stinging in left eye with Dorzolamide, but compliant with bedtime Latanoprost.");

  // Staging
  const [glaucomaType, setGlaucomaType] = useState<"POAG" | "NTG" | "PACG" | "SECONDARY">("POAG");

  // Referrals
  const [glaucomaReferralTarget, setGlaucomaReferralTarget] = useState<"RETINA" | "SURGICAL_OR" | "GENERAL_MEDICINE">("RETINA");
  const [glaucomaReferralReason, setGlaucomaReferralReason] = useState<string>("Evaluate for potential central/branch retinal vein occlusion contributing to secondary high IOP.");
  const [glaucomaReferralsHistory, setGlaucomaReferralsHistory] = useState<any[]>([]);

  // Pharmacy Prescriptions
  const [glaucomaPrescriptions, setGlaucomaPrescriptions] = useState([
    { drugName: "Latanoprost 0.005% Ophthalmic Drops", dose: "1 drop", freq: "ONCE NIGHTLY", eye: "RIGHT_EYE" },
    { drugName: "Dorzolamide 2.0% Ophthalmic Drops", dose: "1 drop", freq: "TID", eye: "LEFT_EYE" }
  ]);
  const [newGlaRxName, setNewGlaRxName] = useState("Latanoprost 0.005%");
  const [newGlaRxDose, setNewGlaRxDose] = useState("1 drop");
  const [newGlaRxFreq, setNewGlaRxFreq] = useState("ONCE NIGHTLY");
  const [newGlaRxEye, setNewGlaRxEye] = useState("RIGHT_EYE");

  const [pharmSyncId, setPharmSyncId] = useState<string>("");
  const [accInvoiceId, setAccInvoiceId] = useState<string>("");

  // Glaucoma Dynamic Staging and Corrected IOP Calculations
  const correctedIopOD = Number((gatOD + (545 - cctOD) * 0.07).toFixed(1));
  const correctedIopOS = Number((gatOS + (545 - cctOS) * 0.07).toFixed(1));

  const getStage = (cd: number, md: number) => {
    if (cd >= 0.8 || md <= -12) {
      return {
        name: "SEVERE",
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
         desc: "Advanced optic disc cupping with severe visual field constriction. Requires urgent intraocular pressure reduction (target < 12 mmHg) and surgical consideration."
      };
    } else if (cd >= 0.65 || md <= -6) {
      return {
        name: "MODERATE",
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
        desc: "Moderate mechanical damage with clinical scotomas. Initiate dual therapy drops, monitor with quarterly OCT/Humphrey Visual Fields."
      };
    } else if (cd >= 0.3 || md <= -2) {
      return {
        name: "MILD",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
        desc: "Early localized optic nerve thinning, suspicious cup-to-disc asymmetry. Recommend single-agent drops, monitor compliant habits."
      };
    } else {
      return {
        name: "SUSPECT",
        color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        desc: "Normal range disc cupping and stable parameters. Retest annually for structural or visual changes."
      };
    }
  };

  const odStage = getStage(cdRatioOD, mdOD);
  const osStage = getStage(cdRatioOS, mdOS);

  // ==========================================
  // Orbit Trauma Workstation Interactive States
  // ==========================================
  const [orbitRapdOD, setOrbitRapdOD] = useState<"Positive" | "Negative">("Negative");
  const [orbitRapdOS, setOrbitRapdOS] = useState<"Positive" | "Negative">("Positive");
  const [orbitIopOD, setOrbitIopOD] = useState<number>(16);
  const [orbitIopOS, setOrbitIopOS] = useState<number>(38); // default to immediate hazard!
  const [orbitOcsSuspected, setOrbitOcsSuspected] = useState<boolean>(true);
  const [orbitV2Numbness, setOrbitV2Numbness] = useState<boolean>(true);
  const [orbitCrepitus, setOrbitCrepitus] = useState<boolean>(true);

  // EOM 9-point directional mapping diagram (restriction level: 0 = normal, -1 to -4 = severe limitation)
  const [orbitEomGrid, setOrbitEomGrid] = useState<Record<string, number>>({
    SR_OD: 0, UP_OD: 0, IO_OD: 0,
    LR_OD: 0, CTR_OD: 0, MR_OD: 0,
    SO_OD: 0, DN_OD: 0, IR_OD: 0,
    SR_OS: 0, UP_OS: -3, IO_OS: 0, // OS upward elevator limitation (inferior rectus entrapment)
    LR_OS: 0, CTR_OS: 0, MR_OS: 0,
    SO_OS: 0, DN_OS: 0, IR_OS: 0
  });

  // Mechanical Oculoplastics Matrix
  const [orbitHertelBase, setOrbitHertelBase] = useState<number>(105.0);
  const [orbitProptosisOD, setOrbitProptosisOD] = useState<number>(16.0);
  const [orbitProptosisOS, setOrbitProptosisOS] = useState<number>(23.5); // 7.5mm asymmetry indicator
  const [orbitEnophthalmosOD, setOrbitEnophthalmosOD] = useState<number>(0.0);
  const [orbitEnophthalmosOS, setOrbitEnophthalmosOS] = useState<number>(0.0);

  const [orbitMrd1OD, setOrbitMrd1OD] = useState<number>(4.0);
  const [orbitMrd1OS, setOrbitMrd1OS] = useState<number>(1.5); // Severe mechanical traumatic ptosis
  const [orbitMrd2OD, setOrbitMrd2OD] = useState<number>(5.0);
  const [orbitMrd2OS, setOrbitMrd2OS] = useState<number>(4.5);

  const [orbitPfWidthOD, setOrbitPfWidthOD] = useState<number>(9.0);
  const [orbitPfWidthOS, setOrbitPfWidthOS] = useState<number>(6.0);
  const [orbitLevatorOD, setOrbitLevatorOD] = useState<string>("15mm - Normal");
  const [orbitLevatorOS, setOrbitLevatorOS] = useState<string>("6mm - Poor");
  const [orbitBellsPhenomenon, setOrbitBellsPhenomenon] = useState<string>("PRESERVED");

  // CT Orbit Core Findings & Imaging Vault
  const [orbitCtScanFindings, setOrbitCtScanFindings] = useState<string>(
    "Large trapdoor-type fracture of the left orbital floor with entrapment of the inferior rectus muscle and associated retrobulbar hematoma."
  );
  const [orbitActiveCtSlice, setOrbitActiveCtSlice] = useState<"CORONAL" | "AXIAL">("CORONAL");

  // Referrals
  const [orbitReferralTarget, setOrbitReferralTarget] = useState<"OMFS_PLASTICS" | "NEUROSURGERY" | "MAIN_OR_QUEUE">("MAIN_OR_QUEUE");
  const [orbitReferralUrgency, setOrbitReferralUrgency] = useState<"STAT" | "EMERGENCY" | "URGENT">("STAT");
  const [orbitReferralReason, setOrbitReferralReason] = useState<string>(
    "Emergency lateral canthotomy performed at bedside; row queued for formal surgical floor blowout repair and hematoma evacuation."
  );

  // Pharmacy Prescriptions State for Orbit Trauma Clinic
  const [orbitLocalPrescriptions, setOrbitLocalPrescriptions] = useState<any[]>([
    {
      drugName: "Amoxicillin-Clavulanate 875mg",
      dosage: "1 tablet",
      frequency: "BID",
      durationDays: 7,
      route: "ORAL",
      instructions: "Prophylaxis for sinus-involving fracture walls. Strict nose-blowing precautions."
    },
    {
      drugName: "Ondansetron 4mg ODT",
      dosage: "1 tablet",
      frequency: "PRN_VOMITING",
      durationDays: 5,
      route: "ORAL_DISINTEGRATING",
      instructions: "Take immediately if nausea develops to prevent sudden spikes in orbital pressure."
    }
  ]);
  const [newOrbitRxName, setNewOrbitRxName] = useState("Methylprednisolone 4mg (Medrol Dosepak)");
  const [newOrbitRxDose, setNewOrbitRxDose] = useState("24mg initially");
  const [newOrbitRxFreq, setNewOrbitRxFreq] = useState("DAILY TAPER");
  const [newOrbitRxDuration, setNewOrbitRxDuration] = useState(6);
  const [newOrbitRxRoute, setNewOrbitRxRoute] = useState("ORAL");
  const [newOrbitRxInstructions, setNewOrbitRxInstructions] = useState("Decompress acute soft tissue edema & protect optic nerve visual pathways.");

  // ==========================================
  // ENT Workstation Interactive States
  // ==========================================
  const [entEarNormalRight, setEntEarNormalRight] = useState(true);
  const [entEarFindingsRight, setEntEarFindingsRight] = useState("Clear external canal, intact pearly tympanic membrane.");
  const [entEarNormalLeft, setEntEarNormalLeft] = useState(false);
  const [entEarFindingsLeft, setEntEarFindingsLeft] = useState("Hyperemic tympanic membrane with serous fluid level behind it.");
  const [entTympanicMembrane, setEntTympanicMembrane] = useState("Left bulging, Right normal landmarks present.");
  const [entHearingTestType, setEntHearingTestType] = useState("PURE_TONE_AUDIOMETRY");
  
  // Asymmetric Audiometry and Tympanometry state parameters per ear
  const [entAcRight, setEntAcRight] = useState("15");
  const [entAcLeft, setEntAcLeft] = useState("35");
  const [entBcRight, setEntBcRight] = useState("15");
  const [entBcLeft, setEntBcLeft] = useState("15");
  const [entTympanometryRight, setEntTympanometryRight] = useState("Type A");
  const [entTympanometryLeft, setEntTympanometryLeft] = useState("Type B");
  const [entRinneRight, setEntRinneRight] = useState("Positive (AC > BC)");
  const [entRinneLeft, setEntRinneLeft] = useState("Negative (BC > AC)");
  const [entWeberTest, setEntWeberTest] = useState("Lateralizes to the left ear");
  const [entHearingImpairment, setEntHearingImpairment] = useState("LEFT_CONDUCTIVE");

  // Rhinology (Nose) Exam State
  const [entNasalSeptum, setEntNasalSeptum] = useState("Deviated to the right side");
  const [entTurbinates, setEntTurbinates] = useState("Bilateral inferior turbinate hypertrophy Grade 2");
  const [entNasalMucosa, setEntNasalMucosa] = useState("Erythematous and engorged");
  const [entFrontalTenderness, setEntFrontalTenderness] = useState(true);
  const [entMaxillaryTenderness, setEntMaxillaryTenderness] = useState(true);

  // Laryngology (Throat & Neck) Exam State
  const [entOropharynxExam, setEntOropharynxExam] = useState("Tonsils Grade 2+ symmetry, no exudates.");
  const [entLarynxExam, setEntLarynxExam] = useState("Vocal cords show normal bilateral abduction and adduction without lesions.");
  const [entVoiceAssessment, setEntVoiceAssessment] = useState("Normal quality, no hoarseness or breathiness");
  const [entFistulaTest, setEntFistulaTest] = useState("Negative bilaterally");
  const [entNeckNodes, setEntNeckNodes] = useState<Record<string, boolean>>({
    "Level I": true,
    "Level II": true,
    "Level III": false,
    "Level IV": false,
    "Level V": false,
    "Level VI": false,
    "Level VII": false
  });

  // Advanced Digital Coding (ICD-10 Finder)
  const [entIcdQuery, setEntIcdQuery] = useState("");
  const [entAnatomicalTag, setEntAnatomicalTag] = useState("Unilateral Left");
  const [entSelectedDiagnoses, setEntSelectedDiagnoses] = useState<any[]>([
    { code: "H66.002", term: "Acute suppurative otitis media, left ear", type: "PRIMARY", status: "CONFIRMED", chronicity: "ACUTE" }
  ]);

  // Inter-Clinic referrals routing list
  const [entReferralTarget, setEntReferralTarget] = useState("DENTAL");
  const [entReferralUrgency, setEntReferralUrgency] = useState("ROUTINE");
  const [entReferralReason, setEntReferralReason] = useState("Evaluate for odontogenic origin of maxillary sinusitis.");
  
  // ENT Prescriptions State
  const [entSelectedFormulation, setEntSelectedFormulation] = useState("Ciprofloxacin + Dexamethasone Otic Suspension");
  const [entDoseValue, setEntDoseValue] = useState("4 drops");
  const [entFreqValue, setEntFreqValue] = useState("TID");
  const [entDurationDays, setEntDurationDays] = useState(7);
  const [entAdminRoute, setEntAdminRoute] = useState("OTIC_DROPS");
  const [entSpecialInstructions, setEntSpecialInstructions] = useState("Instill into the left ear canal.");
  const [entLocalPrescriptions, setEntLocalPrescriptions] = useState<any[]>([
    {
      drugName: "Ciprofloxacin 0.3% + Dexamethasone 0.1% Otic Suspension",
      dosage: "4 drops",
      frequency: "TID",
      durationDays: 7,
      route: "OTIC_DROPS",
      instructions: "Instill into the left ear canal."
    }
  ]);

  // Real-time SQL Traced Console Output
  const [entConsoleLogs, setEntConsoleLogs] = useState<string[]>([
    "SYSTEM: Bootstrapping Otorhinolaryngology Diagnostic Workstation CLI...",
    "JVM: Successfully allocated JPA Context for [ClinicEnt] transaction pool",
    "DB: Connection validated for PostgreSQL cluster at port 5432 (ssl=require)",
    "API: Mapped REST Controller endpoint `/api/clinics/ent/consultations`",
    "SAFETY: Mandatory clinical audiometry checker initialized. Safety status = ARMED"
  ]);

  // Sync state when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setConsultationClosed(selectedPatient.status === "Completed");
      setConsultationNotes("");
      setPrescriptionInput("");
      setLabOrderInput("");
      setShowDoseWarning(false);
      setRetinaLesions([]);
      setVisualFieldMap({});
      setLensFitted(false);

      // Restore specific patient odontogram if saved, or default
      const savedOdontogram = selectedPatient.clinicalLogs.find((l) =>
        l.notes.includes("Odontogram State Updated")
      );
      if (savedOdontogram) {
        try {
          const parsed = JSON.parse(savedOdontogram.notes.split("State Updated: ")[1]);
          setClinicState((prev) => ({ ...prev, odontogram: parsed }));
        } catch (e) {
          // ignore
        }
      } else {
        setClinicState((prev) => ({
          ...prev,
          odontogram: Array.from({ length: 32 }, (_, i) => i + 1).reduce(
            (acc, id) => ({ ...acc, [id]: "Healthy" }),
            {}
          )
        }));
      }

      // Check Pediatrics Demographic block
      if (selectedPatient.clinic === "Pediatrics Ophthalmology" && selectedPatient.age > 14) {
        // Automatically alert or handle
      }
    }
  }, [selectedPatient]);

  // Handle pupil dilation countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clinicState.dilationTimerActive && clinicState.dilationSecondsRemaining > 0) {
      interval = setInterval(() => {
        setClinicState((prev) => {
          if (prev.dilationSecondsRemaining <= 1) {
            clearInterval(interval);
            return {
              ...prev,
              dilationTimerActive: false,
              dilationSecondsRemaining: 0,
              dilationCompleted: true
            };
          }
          return {
            ...prev,
            dilationSecondsRemaining: prev.dilationSecondsRemaining - 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clinicState.dilationTimerActive, clinicState.dilationSecondsRemaining]);

  if (!selectedPatient) {
    return (
      <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px] transition duration-300">
        <div className="bg-neutral-100/60 dark:bg-neutral-900 p-4 rounded-full mb-3 text-neutral-400">
          <FolderOpen className="w-10 h-10" />
        </div>
        <h3 className="font-sans font-semibold text-neutral-750 dark:text-neutral-250">No Patient Selected for Clinical Review</h3>
        <p className="text-sm text-neutral-400 dark:text-neutral-400 max-w-sm mt-1">
          Select an active patient from the live queue index or register a new one to unlock diagnostic panels.
        </p>
      </div>
    );
  }

  // Doctor check
  const isDoctor = activeRole === "doctor";

  // CLINIC 1: Medicine Gate checking
  const handleMedicineCloseConsultation = () => {
    // Triage vitals check
    if (!selectedPatient.triageVitals?.vitalsVerified) {
      alert("CRITICAL CLINICAL BLOCK: Today's triage vitals are unverified. Complete vitals check first.");
      return;
    }

    if (!clinicState.warningsCleared && selectedPatient.triageVitals.systolic > 130) {
      setShowDoseWarning(true);
      return;
    }

    finalizeConsultation("Medicine consultation finalized. Follow-up reviews for Type 2 Diabetes ordered.");
  };

  // CLINIC 2: ENT Gate checking
  const handleEntReferralUnlock = () => {
    if (clinicState.hearingLossDiagnosed && !clinicState.audiometryFileAttached) {
      alert("MANDATORY CLINICAL SAFETY GATE: Hearing Loss diagnosed. You must attach Audiometry/Tympanometry laboratory files to unlock referrals.");
      return;
    }
    // Success referral
    alert("External ENT specialist referral unlocked and dispatched successfully!");
    addClinicalLog("External Referral", "ENT Specialist Referral approved on attached Audiometry context.");
  };

  // CLINIC 3: Dental Interactive Odontogram Integration
  const handleSurfaceClick = (toothNum: number, surface: string) => {
    setDentalToothRecords(prev => {
      const tooth = { ...prev[toothNum] };
      const existed = tooth.surfaces.includes(surface);
      let nextSurfaces = existed 
        ? tooth.surfaces.filter(s => s !== surface)
        : [...tooth.surfaces, surface];

      let nextCondition = tooth.condition;
      let nextRestoration = tooth.existingRestoration;
      let nextCode = tooth.proposedTreatmentCode;
      let nextStatus = tooth.status;

      if (activeDentalBrushMode === "PATHOLOGY") {
        nextCondition = activeDiagnosisBrush;
        if (nextSurfaces.length === 0) {
          nextCondition = "HEALTHY";
        }
      } else if (activeDentalBrushMode === "RESTORATION") {
        nextRestoration = activeRestorationBrush;
        if (nextSurfaces.length === 0) {
          nextRestoration = "NONE";
        }
      }

      // Automatically determine CDT billing code and retail fee mapping
      let fee = 0;
      let chargeName = "";
      if (nextCondition === "CARIES") {
        if (nextSurfaces.length === 1) {
          nextCode = "D2391";
          chargeName = `Tooth #${toothNum} Resin composite - 1 surface, posterior (D2391)`;
          fee = 120;
        } else if (nextSurfaces.length >= 2) {
          nextCode = "D2392";
          chargeName = `Tooth #${toothNum} Resin composite - 2 surfaces, posterior (D2392)`;
          fee = 175;
        }
      } else if (nextRestoration === "ROOT_CANAL") {
        nextCode = "D3330";
        chargeName = `Tooth #${toothNum} Endodontic therapy - molar, root canal (D3330)`;
        fee = 450;
      } else if (nextRestoration === "CROWN") {
        nextCode = "D2750";
        chargeName = `Tooth #${toothNum} Crown - porcelain fused to high noble metal (D2750)`;
        fee = 850;
      } else if (nextRestoration === "IMPLANT") {
        nextCode = "D6010";
        chargeName = `Tooth #${toothNum} Surgical placement of implant body (D6010)`;
        fee = 1500;
      } else if (nextCondition === "MISSING") {
        nextSurfaces = [];
        nextCode = "D7140";
        chargeName = `Tooth #${toothNum} Surgical extraction of erupted tooth (D7140)`;
        fee = 190;
      } else if (nextCondition === "HEALTHY" && nextRestoration === "NONE") {
        nextCode = "";
      }

      const updatedTooth = {
        ...tooth,
        surfaces: nextSurfaces,
        condition: nextCondition,
        existingRestoration: nextRestoration,
        proposedTreatmentCode: nextCode,
        status: nextStatus
      };

      // Direct CRM billing auto-injector
      let nextLedger = [...selectedPatient.billingLedger];
      nextLedger = nextLedger.filter((item) => !item.serviceName.includes(`Tooth #${toothNum} `));

      if (fee > 0) {
        const billingItem: BillingItem = {
          id: `BIL-DENT-${toothNum}-${Date.now()}`,
          serviceName: chargeName,
          category: "DentalSurgical",
          amount: fee,
          status: "Unpaid"
        };
        nextLedger.push(billingItem);
      }

      const updatedPatient: Patient = {
        ...selectedPatient,
        billingLedger: nextLedger,
        clinicalLogs: [
          ...selectedPatient.clinicalLogs,
          {
            timestamp: new Date().toLocaleTimeString().slice(0, 5),
            actorRole: "Dental Surgeon",
            action: `Tooth #${toothNum} Surface Update`,
            notes: `Tooth #${toothNum} Surface ${surface} updated to Condition: ${nextCondition}, Restoration: ${nextRestoration}. Direct Ledger sync: $${fee}`
          }
        ]
      };

      onUpdatePatient(updatedPatient);

      setDentalConsoleLogs(p => [
        ...p,
        `[ODONTOGRAM STAGE] Tooth #${toothNum} Surface: ${surface} updated (${nextCondition} / ${nextRestoration}). Synchronized billing ledger item with amount: $${fee}.00`
      ]);

      return {
        ...prev,
        [toothNum]: updatedTooth
      };
    });
  };

  const applyToothStatusDirect = (toothNum: number, condition: string, restoration: string, status: string, code: string, fee: number) => {
    setDentalToothRecords(prev => {
      const tooth = { ...prev[toothNum] };
      const updatedTooth = {
        ...tooth,
        condition,
        existingRestoration: restoration,
        status,
        proposedTreatmentCode: code
      };

      let nextLedger = [...selectedPatient.billingLedger];
      nextLedger = nextLedger.filter((item) => !item.serviceName.includes(`Tooth #${toothNum} `));

      if (fee > 0) {
        const billingItem: BillingItem = {
          id: `BIL-DENT-${toothNum}-${Date.now()}`,
          serviceName: `Tooth #${toothNum} Specialty Service (${code})`,
          category: "DentalSurgical",
          amount: fee,
          status: "Unpaid"
        };
        nextLedger.push(billingItem);
      }

      const updatedPatient: Patient = {
        ...selectedPatient,
        billingLedger: nextLedger,
        clinicalLogs: [
          ...selectedPatient.clinicalLogs,
          {
            timestamp: new Date().toLocaleTimeString().slice(0, 5),
            actorRole: "Dental Surgeon",
            action: `Tooth #${toothNum} Structural Mode Swapped`,
            notes: `Direct manual edit applied to tooth #${toothNum}. Condition: ${condition}, Restoration: ${restoration}. Code: ${code}.`
          }
        ]
      };

      onUpdatePatient(updatedPatient);

      setDentalConsoleLogs(p => [
        ...p,
        `[MANUAL OVERRIDE] Tooth #${toothNum} parameter override committed. Swapped structural indicators to: ${condition} - ${restoration}. Code: ${code}. Fee: $${fee}.00`
      ]);

      return {
        ...prev,
        [toothNum]: updatedTooth
      };
    });
  };

  // CLINIC 5: Glaucoma IOP Numeric gate
  const handleIopChange = (eye: "left" | "right", value: string) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;

    if (parsed > 80 || parsed < 0) {
      setClinicState((prev) => ({
        ...prev,
        glaucomaErrorMsg: "⚠️ CRITICAL REJECTION: Impossible IOP pressure value detected! Triggering Goldmann Tonometry numeric boundary gate protection (0-80 mmHg permissible range)."
      }));
      return;
    }

    setClinicState((prev) => ({
      ...prev,
      glaucomaErrorMsg: "",
      iopLeftEye: eye === "left" ? parsed : prev.iopLeftEye,
      iopRightEye: eye === "right" ? parsed : prev.iopRightEye
    }));
  };

  // Helper routine to wrap logs
  const addClinicalLog = (actionName: string, notes: string) => {
    const updated: Patient = {
      ...selectedPatient,
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Consultant (" + selectedPatient.clinic + ")",
          action: actionName,
          notes: notes
        }
      ]
    };
    onUpdatePatient(updated);
  };

  const finalizeConsultation = (notesPayload: string) => {
    // If pharmacy order was placed
    const nextLedger = [...selectedPatient.billingLedger];
    if (prescriptionInput) {
      nextLedger.push({
        id: `BIL-RX-${Date.now()}`,
        serviceName: `Prescription: ${prescriptionInput}`,
        category: "PharmacyDispense",
        amount: 35,
        status: "Unpaid"
      });
    }
    if (labOrderInput) {
      nextLedger.push({
        id: `BIL-LAB-${Date.now()}`,
        serviceName: `Clinical Lab Test: ${labOrderInput}`,
        category: "ClinicalLab",
        amount: 80,
        status: "Unpaid"
      });
    }

    const updated: Patient = {
      ...selectedPatient,
      status: "BillingPending",
      billingLedger: nextLedger,
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Specialty doctor",
          action: "Consultation Complete",
          notes: `${notesPayload}. Prescribed: ${prescriptionInput || "None"}. Ordered: ${
            labOrderInput || "None"
          }. Clinical Notes: ${consultationNotes || "N/A"}`
        }
      ]
    };
    onUpdatePatient(updated);
    setConsultationClosed(true);
    setShowFinalizeModal(true);
  };

  return (
    <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl shadow-xs flex flex-col h-full relative transition duration-300">
      {/* Clinic lock notification when not acting as doctor */}
      {!isDoctor && (
        <div className="absolute inset-0 bg-neutral-900/45 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-6 text-center select-none rounded-3xl">
          <div className="bg-[var(--clr-bg-card)] dark:bg-[#1a1e2e] p-6 rounded-3xl shadow-xl max-w-sm border border-[var(--clr-border-light)]">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <h4 className="font-sans font-medium text-neutral-800 text-base">Authorized Clinician Verification Gate</h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Your active role is currently <span className="font-bold text-teal-600 capitalize">{activeRole}</span>. Specialist clinical operations are locked. Change your role to <span className="font-extrabold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">doctor</span> in the top-right console to access patient records.
            </p>
          </div>
        </div>
      )}

      {/* Specialty Dashboard Header */}
      <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
              {selectedPatient.clinic} Panel
            </span>
            {selectedPatient.pediatricRedirected && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono">
                Demographic Safety: Rerouted
              </span>
            )}
          </div>
          <h3 className="font-sans font-medium text-xl text-neutral-800 mt-1">
            Patient Consultation Suite
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Operating under {selectedPatient.name} • {selectedPatient.gender} • DOB {selectedPatient.dob} ({selectedPatient.age} y/o)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedPatient.triageVitals ? (
            <div className="flex gap-4 p-2 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
              <div>
                <span className="block text-neutral-400 font-mono text-tiny">VITALS BP</span>
                <span className="font-mono font-bold text-neutral-700">
                  {selectedPatient.triageVitals.systolic}/{selectedPatient.triageVitals.diastolic}
                </span>
              </div>
              <div>
                <span className="block text-neutral-400 font-mono text-tiny">TEMP</span>
                <span className="font-mono font-bold text-neutral-700">
                  {selectedPatient.triageVitals.temperatureCelcius}°C
                </span>
              </div>
              <div>
                <span className="block text-neutral-400 font-mono text-tiny">STATUS</span>
                <span className="font-mono font-bold text-emerald-600">VERIFIED</span>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>No Vitals Recorded - Patient needs triage!</span>
            </div>
          )}

          {onShowReport && (
            <button
              onClick={() => onShowReport(selectedPatient.id)}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition"
              title="Print clinical health dossier report"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Print Clinical Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Specialist Clinic Area */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* CLINICAL ALERT MONITOR WIDGET */}
        {(() => {
          const hasDiabetesAlert = selectedPatient.clinicalTriageFlags?.hasDiabetes || selectedPatient.clinicalLogs?.some(l => l.notes.toLowerCase().includes("diabetes") || l.notes.toLowerCase().includes("diabetic")) || false;
          const hasHypertensionAlert = selectedPatient.clinicalTriageFlags?.hasHypertension || (selectedPatient.triageVitals?.systolic ? selectedPatient.triageVitals.systolic > 135 : false);
          const hasCKDAlert = selectedPatient.clinicalTriageFlags?.hasCKD || false;
          const hasGlaucomaAlert = selectedPatient.clinicalTriageFlags?.hasGlaucomaHistory || selectedPatient.clinicalLogs?.some(l => l.notes.toLowerCase().includes("glaucoma")) || false;
          
          const hasAnyFlags = hasDiabetesAlert || hasHypertensionAlert || hasCKDAlert || hasGlaucomaAlert || 
            (selectedPatient.clinicalTriageFlags?.knownAllergies && selectedPatient.clinicalTriageFlags.knownAllergies.length > 0) ||
            (selectedPatient.clinicalTriageFlags?.ophthalmicDropAllergies && selectedPatient.clinicalTriageFlags.ophthalmicDropAllergies.length > 0) ||
            (selectedPatient.clinicalTriageFlags?.previousEyeSurgeries && selectedPatient.clinicalTriageFlags.previousEyeSurgeries.length > 0);

          if (!hasAnyFlags) return null;

          return (
            <div className="bg-rose-50/70 dark:bg-rose-950/10 border border-rose-250/25 dark:border-rose-900/30 p-4 rounded-2xl flex flex-col gap-3 animation-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                    <span>Clinical Critical Triage Alerts Monitor</span>
                  </span>
                </div>
                <span className="font-mono text-[9px] bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-450 px-2 py-0.5 rounded font-black uppercase">
                  Active Clinical Hazards
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {hasDiabetesAlert && (
                  <div className="p-2.5 bg-rose-100/30 dark:bg-rose-950/20 border border-rose-200/20 dark:border-rose-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-base">🩺</span>
                    <div>
                      <span className="block text-xs font-bold text-rose-950 dark:text-rose-400">Diabetes Mellitus</span>
                      <span className="block text-[10px] text-rose-800 dark:text-rose-455 leading-normal">Retinal fundus photography & diabetic screen scheduled.</span>
                    </div>
                  </div>
                )}

                {hasHypertensionAlert && (
                  <div className="p-2.5 bg-rose-100/30 dark:bg-rose-950/20 border border-rose-200/20 dark:border-rose-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-base">🩸</span>
                    <div>
                      <span className="block text-xs font-bold text-rose-950 dark:text-rose-400">Hypertension (High BP)</span>
                      <span className="block text-[10px] text-rose-800 dark:text-rose-455 leading-normal">Retinal stroke profile warned. Auto-triage configured.</span>
                    </div>
                  </div>
                )}

                {hasCKDAlert && (
                  <div className="p-2.5 bg-rose-100/30 dark:bg-rose-950/20 border border-rose-200/20 dark:border-rose-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-base">🧪</span>
                    <div>
                      <span className="block text-xs font-bold text-rose-950 dark:text-rose-400">CKD / Kidney Precaution</span>
                      <span className="block text-[10px] text-rose-800 dark:text-rose-455 leading-normal">Avoid Fluorescein imaging dye unless cleared by nephrology.</span>
                    </div>
                  </div>
                )}

                {hasGlaucomaAlert && (
                  <div className="p-2.5 bg-rose-100/30 dark:bg-rose-950/20 border border-rose-200/20 dark:border-rose-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-base">👁️</span>
                    <div>
                      <span className="block text-xs font-bold text-rose-950 dark:text-rose-400">Glaucoma History</span>
                      <span className="block text-[10px] text-rose-800 dark:text-rose-455 leading-normal">Goldmann Applanation IOP screen priority triggered.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Drug Allergies and surgical histories */}
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10.5px] items-center border-t border-rose-200/20">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-rose-900 dark:text-rose-300">🚨 Drug Allergies:</span>
                  {selectedPatient.clinicalTriageFlags?.knownAllergies && selectedPatient.clinicalTriageFlags.knownAllergies.length > 0 ? (
                    selectedPatient.clinicalTriageFlags.knownAllergies.map((all, idx) => (
                      <span key={idx} className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded font-mono font-bold text-[9px] border border-red-250/20">
                        {all}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-400 italic">None reported</span>
                  )}
                </div>

                {selectedPatient.clinicalTriageFlags?.ophthalmicDropAllergies && selectedPatient.clinicalTriageFlags.ophthalmicDropAllergies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-rose-350 dark:text-neutral-600">|</span>
                    <span className="font-bold text-rose-900 dark:text-rose-300">👁️ Drop Alerts:</span>
                    {selectedPatient.clinicalTriageFlags.ophthalmicDropAllergies.map((drop, idx) => (
                      <span key={idx} className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded font-mono font-bold text-[9px] border border-amber-250/20">
                        {drop}
                      </span>
                    ))}
                  </div>
                )}

                {selectedPatient.clinicalTriageFlags?.previousEyeSurgeries && selectedPatient.clinicalTriageFlags.previousEyeSurgeries.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-rose-350 dark:text-neutral-600">|</span>
                    <span className="font-bold text-neutral-600 dark:text-neutral-400">Surgical History:</span>
                    {selectedPatient.clinicalTriageFlags.previousEyeSurgeries.map((surg, idx) => (
                      <span key={idx} className="bg-blue-50 dark:bg-blue-950/20 text-neutral-600 dark:text-neutral-350 px-1.5 py-0.5 rounded text-[10px] border border-neutral-154 dark:border-neutral-850">
                        {surg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Scenario Guide banner */}
        <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl text-xs text-teal-800 leading-relaxed">
          <span className="font-bold underline uppercase">Scenario Trigger:</span> {CLINIC_INFO_MAP[selectedPatient.clinic]?.gatekeeperDesc}
        </div>

        {/* Dynamic Clinic-Specific Workspace */}
        {selectedPatient.clinic === "Medicine" && (
          <div className="space-y-6">
            {/* WORKSTATION CONTROLS HEADER */}
            <div className="bg-gradient-to-r from-teal-50 to-indigo-50/30 border border-teal-150 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-ping"></span>
                  General Medicine Physician Workstation
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Active Clinical Session Manager • Real-time terminologies and inventory routing active.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-white border border-neutral-200 shadow-tiny font-mono px-2.5 py-1 rounded text-neutral-600">
                  SESSION-ID: <strong className="font-bold">GS-9076</strong>
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono px-2.5 py-0.5 rounded flex items-center font-bold">
                  ● ERP CONNECTED
                </span>
              </div>
            </div>

            {/* TWO-COLUMN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT MAIN MODULES PANEL (8/12 Columns) */}
              <div className="col-span-1 lg:col-span-8 space-y-6">
                
                {/* 1. DYNAMIC VITALS BANNER */}
                <div className="bg-[var(--clr-bg-card)] border border-neutral-150 dark:border-neutral-800 p-4 rounded-2xl shadow-tiny">
                  <h5 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2.5 font-mono">
                    1. Objective Baseline Snapshot (Triage Vitals)
                  </h5>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* BP Metric */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      (selectedPatient.triageVitals?.systolic || 0) > 135  || (selectedPatient.triageVitals?.diastolic || 0) > 85
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700"
                    }`}>
                      <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">BP Pressure</span>
                      <span className="text-base font-bold font-mono">
                        {selectedPatient.triageVitals?.systolic || "120"}/{selectedPatient.triageVitals?.diastolic || "80"}
                      </span>
                      <span className="block text-[8px] font-mono opacity-80 mt-0.5">
                        {(selectedPatient.triageVitals?.systolic || 0) > 135 ? "⚠️ Borderline High" : "✓ Normal Range"}
                      </span>
                    </div>

                    {/* HR Metric */}
                    <div className="p-2 rounded-xl border bg-neutral-50 border-neutral-200 text-neutral-700">
                      <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">Heart Rate</span>
                      <span className="text-base font-bold font-mono">
                        {selectedPatient.triageVitals?.heartRate || "72"} <span className="text-xs">BPM</span>
                      </span>
                      <span className="block text-[8px] font-mono opacity-80 mt-0.5">✓ Normal Sinus RYTHM</span>
                    </div>

                    {/* Temp Metric */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      (selectedPatient.triageVitals?.temperatureCelcius || 0) > 37.5
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700"
                    }`}>
                      <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">Temperature</span>
                      <span className="text-base font-bold font-mono">
                        {selectedPatient.triageVitals?.temperatureCelcius || "36.8"}°C
                      </span>
                      <span className="block text-[8px] font-mono opacity-80 mt-0.5">
                        {(selectedPatient.triageVitals?.temperatureCelcius || 0) > 37.5 ? "🔴 Pyrexia Alerted" : "✓ Afebrile"}
                      </span>
                    </div>

                    {/* SpO2 simulated / Glucose */}
                    <div className="p-2 rounded-xl border bg-neutral-50 border-neutral-200 text-neutral-700">
                      <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">Oxygen Sat (SpO2)</span>
                      <span className="text-base font-bold font-mono">98% <span className="text-[10px] font-normal">Air</span></span>
                      <span className="block text-[8px] font-mono opacity-80 mt-0.5">✓ Stable Arterial Hb</span>
                    </div>
                  </div>

                  {/* Review of Systems Checklist */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1 block mb-2">
                      Review of Systems (ROS Checklist)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.keys(generalMedicineRos).map((key) => (
                        <label key={key} className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={(generalMedicineRos as any)[key]}
                            onChange={(e) =>
                              setGeneralMedicineRos((prev) => ({ ...prev, [key]: e.target.checked }))
                            }
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <span className="capitalize">{key.replace("ros", "")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. ADVANCED DIAGNOSTIC & CLINICAL CODING */}
                <div className="bg-[var(--clr-bg-card)] border border-neutral-150 dark:border-neutral-800 p-4 rounded-2xl shadow-tiny space-y-3">
                  <h5 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                    2. Advanced Diagnostics & Clinical Coding Engine
                  </h5>

                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-3">
                    <div className="relative">
                      <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">
                        INTELLIGENT FUZZY TERMINOLGIES SEARCH (ICD-10)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={icdSearchQuery}
                          onChange={(e) => setIcdSearchQuery(e.target.value)}
                          placeholder="Search diagnoses like 'Type 2 Diabetes', 'Hypertension', 'Bronchitis', 'Glaucoma'..."
                          className="w-full text-xs border border-neutral-250 rounded-lg p-2 pl-3 bg-white focus:outline-teal-600"
                        />
                      </div>

                      {/* Autocomplete Results list */}
                      {icdSearchQuery.trim().length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-250 shadow-md rounded-xl z-10 max-h-40 overflow-y-auto">
                          {[
                            { code: "E11.9", text: "Type 2 Diabetes Mellitus without complications" },
                            { code: "I10", text: "Essential (primary) Hypertension" },
                            { code: "J20.9", text: "Acute Bronchitis, unspecified" },
                            { code: "K21.9", text: "Gastro-esophageal reflux disease" },
                            { code: "M54.5", text: "Low Back Pain (lumbago)" },
                            { code: "H35.3", text: "Age-related Macular Degeneration" },
                            { code: "K05.2", text: "Acute Periodontitis" },
                            { code: "H35.03", text: "Diabetic Retinopathy" },
                            { code: "H40.9", text: "Glaucoma, unspecified" }
                          ]
                            .filter(
                              (item) =>
                                item.code.toLowerCase().includes(icdSearchQuery.toLowerCase()) ||
                                item.text.toLowerCase().includes(icdSearchQuery.toLowerCase())
                            )
                            .map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => {
                                  // Add coding logic
                                  const alreadyExists = selectedDiagnoses.some((d) => d.code === item.code);
                                  if (!alreadyExists) {
                                    setSelectedDiagnoses((prev) => [
                                      ...prev,
                                      {
                                        code: item.code,
                                        term: item.text,
                                        type: diagnosisType,
                                        status: clinicalStatus,
                                        chronicity: chronicityStatus,
                                        progression: progressionStatus
                                      }
                                    ]);
                                  }
                                  setIcdSearchQuery("");
                                }}
                                className="w-full text-left p-2.5 text-xs hover:bg-teal-50 border-b border-neutral-100 flex justify-between items-center"
                              >
                                <span>
                                  <strong className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-bold mr-1">{item.code}</strong>{" "}
                                  {item.text}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-bold font-mono">Select</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Coding Attribute Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase">Layering Type</label>
                        <select
                          value={diagnosisType}
                          onChange={(e) => setDiagnosisType(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="PRIMARY">PRIMARY (Core)</option>
                          <option value="SECONDARY">SECONDARY (Comorbid)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase">Diagnostic Status</label>
                        <select
                          value={clinicalStatus}
                          onChange={(e) => setClinicalStatus(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="CONFIRMED">CONFIRMED (Audit)</option>
                          <option value="WORKING">WORKING / PROVISIONAL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase">Chronicity Scale</label>
                        <select
                          value={chronicityStatus}
                          onChange={(e) => setChronicityStatus(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="CHRONIC">CHRONIC</option>
                          <option value="ACUTE">ACUTE</option>
                          <option value="SUBACUTE">SUBACUTE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase">Progression</label>
                        <select
                          value={progressionStatus}
                          onChange={(e) => setProgressionStatus(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Ruled Out">Ruled Out</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Active Diagnoses List */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-neutral-600">Active Consultation Coding Sheet:</span>
                    <div className="flex flex-wrap gap-1.5 h-16 overflow-y-auto content-start p-1.5 bg-neutral-50 rounded-xl border border-neutral-250">
                      {selectedDiagnoses.map((d) => (
                        <span
                          key={d.code}
                          className="inline-flex items-center gap-1 text-[10.5px] bg-white border border-neutral-200 rounded-lg px-2 py-0.5 shadow-tiny font-sans"
                        >
                          <span className="font-mono font-black text-rose-600 text-[10px] bg-rose-50 px-1 py-0.2 rounded">
                            {d.code}
                          </span>
                          <span className="text-neutral-700 truncate max-w-[150px]">{d.term}</span>
                          <span className="text-[8.5px] font-bold text-neutral-450 uppercase tracking-tighter">
                            ({d.type})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDiagnoses((prev) => prev.filter((item) => item.code !== d.code))}
                            className="text-neutral-450 hover:text-rose-500 ml-1 font-bold select-none cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {selectedDiagnoses.length === 0 && (
                        <span className="text-xs text-neutral-450 italic p-1">No clinical diagnoses encoded yet.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. INTER-CLINIC REFERRAL ROUTING ENGINE */}
                <div className="bg-[var(--clr-bg-card)] border border-neutral-154 dark:border-neutral-800 p-4 rounded-2xl shadow-tiny space-y-3">
                  <h5 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>3. Inter-Clinic Specialist Referral Routing</span>
                    {referralCommitted && (
                      <span className="text-[9.5px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 animate-pulse font-extrabold">
                        ✓ ROUTED TO {referralCommitted.target}
                      </span>
                    )}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Urgency and targets */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Target Specialist cost Center</label>
                        <select
                          value={referralClinic}
                          onChange={(e) => setReferralClinic(e.target.value)}
                          className="w-full text-xs border border-neutral-250 rounded-lg p-2 bg-white focus:outline-teal-500"
                        >
                          <option value="Retina">Retina & Laser Photocoagulation</option>
                          <option value="Glaucoma">Glaucoma Perimeter Center</option>
                          <option value="Orbit">Orbit / Oculoplastics Emergencies</option>
                          <option value="Pediatrics Ophthalmology">Pediatrics Ophthalmology (Age-Safe)</option>
                          <option value="Dental">Dentistry Oral Surgery & Restoration</option>
                          <option value="ENT">ENT Air Conduction Specialty</option>
                          <option value="General Ophthalmology">General Comprehensive Ophthalmology</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Triage Priority urgency Level</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["ROUTINE", "URGENT", "STAT"] as const).map((urg) => (
                            <button
                              key={urg}
                              type="button"
                              onClick={() => setReferralUrgency(urg)}
                              className={`py-1 rounded text-[10px] font-bold border ${
                                referralUrgency === urg
                                  ? urg === "STAT"
                                    ? "bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse"
                                    : "bg-teal-600 text-white border-teal-600 shadow-sm"
                                  : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              {urg === "STAT" ? "🚨 STAT / IMM." : urg}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Handover and commit */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Reason for Referral / Indications handover</label>
                        <textarea
                          value={referralReason}
                          onChange={(e) => setReferralReason(e.target.value)}
                          placeholder="Log key visual field, retinal anomalies, periodontal indices, etc. for downstream handover..."
                          className="w-full text-xs border border-neutral-250 rounded-lg p-2 h-16 bg-white focus:outline-teal-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!referralReason.trim()) {
                              alert("Safety validation block: Must supply 'Reason for Referral' before dispatching patient across specialty hubs.");
                              return;
                            }
                            
                            // Simulate routing task
                            const ldgId = "REF-LDG-" + Math.floor(Math.random() * 900000 + 100000);
                            setReferralCommitted({
                              id: ldgId,
                              target: referralClinic,
                              priority: referralUrgency,
                              timestamp: new Date().toLocaleTimeString().slice(0, 5)
                            });

                            // Add a clinical log entry
                            addClinicalLog(
                              `Inter-Clinic Referral (${referralUrgency})`,
                              `Referred to [${referralClinic}] cost center clinic. Reason: ${referralReason}. Stored ledger tracking ID: ${ldgId}. Workflow state: REFERRED_PENDING_TRIAGE.`
                            );

                            window.dispatchEvent(new CustomEvent("clinical-notification", {
                              detail: {
                                type: "referral",
                                patientId: selectedPatient?.id || "N/A",
                                patientName: selectedPatient?.name || "Patient",
                                titleEn: "Inter-Clinic Specialist Referral Sent",
                                titleAr: "تم إرسال إحالة سريرية للمتخصص",
                                messageEn: `Patient referred to [${referralClinic}] department under priority [${referralUrgency}]. Reason: ${referralReason}`,
                                messageAr: `تمت إحالة المريض إلى قسم [${referralClinic}] تحت أولوية [${referralUrgency}]. السبب: ${referralReason}`
                              }
                            }));
                            
                            alert(`SUCCESS: Inter-clinic referral routing established!\nPatient queue successfully queued into [${referralClinic}] department in state REFERRED.`);
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold shadow-tiny"
                        >
                          ⚡ Dispatch Real-Time Route
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. UNIFIED DIGITAL E-PRESCRIBING SYSTEM */}
                <div className="bg-[var(--clr-bg-card)] border border-neutral-154 dark:border-neutral-800 p-4 rounded-2xl shadow-tiny space-y-3">
                  <h5 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                    4. Unified Digital E-Prescribing System & Live Formulary
                  </h5>

                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-600 mb-1">
                          LIVE INVENTORY FORMULARY MEDICINES
                        </label>
                        <select
                          value={rxSelectedDrugId}
                          onChange={(e) => {
                            const drugId = e.target.value;
                            setRxSelectedDrugId(drugId);
                            // Set defaults based on selection
                            if (drugId === "dr-1") { setRxDose("500"); setRxUnit("mg"); setRxRoute("ORAL"); }
                            if (drugId === "dr-2") { setRxDose("2"); setRxUnit("drops"); setRxRoute("OPHTHALMIC"); }
                            if (drugId === "dr-3") { setRxDose("500"); setRxUnit("mg"); setRxRoute("ORAL"); }
                            if (drugId === "dr-4") { setRxDose("400"); setRxUnit("mg"); setRxRoute("ORAL"); }
                            if (drugId === "dr-5") { setRxDose("1"); setRxUnit("drops"); setRxRoute("OPHTHALMIC"); }
                            if (drugId === "dr-6") { setRxDose("10"); setRxUnit("mg"); setRxRoute("ORAL"); }
                            if (drugId === "dr-7") { setRxDose("20"); setRxUnit("mg"); setRxRoute("ORAL"); }
                          }}
                          className="w-full text-xs border border-neutral-250 rounded-lg p-1.5 bg-white font-medium"
                        >
                          <option value="dr-1">Metformin HCL (500mg tab) [Stock: 420]</option>
                          <option value="dr-2">Latanoprost (0.005% drops) [Stock: 12]</option>
                          <option value="dr-3">Amoxicillin (500mg formulation) [Stock: 180]</option>
                          <option value="dr-4">Ibuprofen (400mg tab) [Stock: 8 Low!]</option>
                          <option value="dr-5">Timolol Maleate (0.5% drops) [Stock: 15]</option>
                          <option value="dr-6">Lisinopril (10mg formulation) [Stock: 250]</option>
                          <option value="dr-7">Atorvastatin (20mg tab) [Stock: 110]</option>
                        </select>
                      </div>

                      {/* Stock availability status feedback */}
                      <div className="flex items-center">
                        {(() => {
                          const stockCount = rxSelectedDrugId === "dr-2" ? 12 : rxSelectedDrugId === "dr-4" ? 8 : rxSelectedDrugId === "dr-5" ? 15 : 180;
                          const factorVal = rxFreq === "BID" ? 2 : rxFreq === "PRN" ? 1 : 3;
                          const reqVal = parseInt(rxDuration || "30") * factorVal;
                          const exceedsStock = reqVal > stockCount;

                          if (exceedsStock) {
                            return (
                              <div className="p-2 border border-rose-300 bg-rose-50 text-rose-900 rounded-lg text-tiny flex gap-1.5 items-center leading-tight">
                                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                                <div>
                                  <span className="font-bold">⚠️ CRITICAL SHORTAGE SUMMARY:</span>
                                  <br />Requested Rx requires {reqVal} units, shelves only contain {stockCount} items!
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="p-2 border border-emerald-300 bg-emerald-50/50 text-emerald-900 rounded-lg text-tiny flex gap-1.5 items-center leading-tight">
                              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-bold">✓ INVENTORY CONFIRMED:</span>
                                <br />Estimated {reqVal} units. Dispatching is fully secured with available shelves stock.
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Structured Dosage Sig Builder */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1.5">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500">Dose & Unit</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={rxDose}
                            onChange={(e) => setRxDose(e.target.value)}
                            className="w-12 border border-neutral-200 text-tiny p-1 rounded-l bg-white"
                          />
                          <select
                            value={rxUnit}
                            onChange={(e) => setRxUnit(e.target.value)}
                            className="flex-1 border-y border-r border-neutral-200 text-tiny p-1 rounded-r bg-white"
                          >
                            <option value="mg">mg</option>
                            <option value="drops">drops</option>
                            <option value="caps">caps</option>
                            <option value="tablets">tabs</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500">Frequency</label>
                        <select
                          value={rxFreq}
                          onChange={(e) => setRxFreq(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="QD">QD (Once Daily)</option>
                          <option value="BID">BID (Twice Daily)</option>
                          <option value="TID">TID (Three Daily)</option>
                          <option value="PRN">PRN (As Needed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500">Duration (Days)</label>
                        <input
                          type="number"
                          value={rxDuration}
                          onChange={(e) => setRxDuration(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500">Admin Route</label>
                        <select
                          value={rxRoute}
                          onChange={(e) => setRxRoute(e.target.value)}
                          className="w-full border border-neutral-200 text-tiny p-1 rounded bg-white"
                        >
                          <option value="ORAL">ORAL (Mouth)</option>
                          <option value="SUBLINGUAL">SUBLINGUAL</option>
                          <option value="INTRAVENOUS">INTRAVENOUS</option>
                          <option value="TOPICAL">TOPICAL</option>
                          <option value="OPHTHALMIC">OPHTHALMIC</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const drugItem = ["Metformin HCL", "Latanoprost", "Amoxicillin", "Ibuprofen", "Timolol", "Lisinopril", "Atorvastatin"][
                              ["dr-1", "dr-2", "dr-3", "dr-4", "dr-5", "dr-6", "dr-7"].indexOf(rxSelectedDrugId)
                            ];
                            const termStr = `${drugItem} [${rxDose}${rxUnit}] Sig: ${rxFreq} Route ${rxRoute} x ${rxDuration} Days. (${rxInstructions})`;
                            const matchObject = {
                              id: rxSelectedDrugId,
                              name: termStr,
                              dose: rxDose,
                              unit: rxUnit,
                              freq: rxFreq,
                              dur: rxDuration
                            };
                            setLocalPrescriptions((prev) => [...prev, matchObject]);
                          }}
                          className="w-full py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded text-tiny cursor-pointer"
                        >
                          + Add e-Rx
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-medium text-neutral-600 mb-0.5">Special Instructions</label>
                      <input
                        type="text"
                        value={rxInstructions}
                        onChange={(e) => setRxInstructions(e.target.value)}
                        placeholder="e.g. Take with meals."
                        className="w-full text-xs border border-neutral-200 rounded-lg p-1 bg-white focus:outline-teal-500"
                      />
                    </div>
                  </div>

                  {/* Pending e-prescriptions rows */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-600">Pending Pharmacy Dispensary Basket:</span>
                    <div className="max-h-24 overflow-y-auto space-y-1.5 p-1 px-2 border border-neutral-200 bg-neutral-50 rounded-xl">
                      {localPrescriptions.map((p, idx) => (
                        <div key={idx} className="text-xs bg-white border border-neutral-200 p-2 rounded-lg flex items-center justify-between shadow-tiny">
                          <span className="font-mono text-neutral-700 leading-tight">✓ {p.name}</span>
                          <button
                            type="button"
                            onClick={() => setLocalPrescriptions((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-neutral-400 hover:text-rose-600 font-bold ml-1.5 focus:outline-none"
                          >
                            Purge
                          </button>
                        </div>
                      ))}
                      {localPrescriptions.length === 0 && (
                        <div className="text-xs text-neutral-400 italic text-center py-2">
                          Add generic or branded clinical medication selections above.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT STICKY COLLAPSIBLE PANEL (4/12 Columns) */}
              <div className="col-span-1 lg:col-span-4 space-y-6">

                {/* HISTORICAL PROBLEM LISTS & ALLERGIES (STICKY SIDEBAR) */}
                <div className="bg-white border border-neutral-154 p-4 rounded-2xl shadow-tiny space-y-4">
                  <div>
                    <h5 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest font-sans flex items-center gap-1">
                      🛡️ Clinical safety: Patient Baseline ADR & Chronic Problems
                    </h5>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Ensures dosage safety matrices against unmonitored failures.
                    </p>
                  </div>

                  {/* ACTIVE ALLERGIES */}
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-150 block w-max">
                      Allergies & High-Risk ADRs
                    </span>
                    <div className="space-y-1">
                      {allergies.map((alg) => (
                        <div key={alg} className="text-xs font-mono text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-150 flex justify-between items-center">
                          <span>⚠️ {alg}</span>
                          <button
                            type="button"
                            onClick={() => setAllergies((prev) => prev.filter((a) => a !== alg))}
                            className="text-neutral-300 hover:text-rose-500 font-sans"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Add Allergy tool inline */}
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="e.g. Sulfa (Anaphylaxis)"
                        className="flex-1 text-[11px] border border-neutral-200 rounded p-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAllergy.trim()) {
                            setAllergies((prev) => [...prev, newAllergy.trim()]);
                            setNewAllergy("");
                          }
                        }}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] px-2 rounded font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* CHRONIC PROBLEM LIST */}
                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-150 block w-max">
                      Chronic Problem Directory
                    </span>
                    <div className="space-y-1">
                      {chronicIssues.map((issue) => (
                        <div key={issue} className="text-xs font-mono text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-150 flex justify-between items-center">
                          <span>● {issue}</span>
                          <button
                            type="button"
                            onClick={() => setChronicIssues((prev) => prev.filter((c) => c !== issue))}
                            className="text-neutral-300 hover:text-rose-500 font-sans"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Add Chronic Issue inline */}
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newChronicIssue}
                        onChange={(e) => setNewChronicIssue(e.target.value)}
                        placeholder="e.g. Asthma, COPD"
                        className="flex-1 text-[11px] border border-neutral-200 rounded p-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newChronicIssue.trim()) {
                            setChronicIssues((prev) => [...prev, newChronicIssue.trim()]);
                            setNewChronicIssue("");
                          }
                        }}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] px-2 rounded font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. MULTI-MODULE EHR/ERP WORKFLOW STAGE TRACED CONSOLE */}
                <div className="bg-neutral-900 text-neutral-200 border-4 border-neutral-850 p-4 rounded-3xl space-y-2 text-[10.5px] font-mono leading-relaxed h-[360px] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-1 text-[10px] text-teal-400 font-bold uppercase tracking-widest pl-0.5 mb-2">
                    <span>⚡ EHR/ERP real-time Ledger Tracker</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  <p className="text-neutral-450 italic">
                    Establishing direct multi-module relational replication:
                  </p>
                  
                  {/* Ledger event sequences dynamic simulator display */}
                  <div className="space-y-1.5">
                    <p className="text-emerald-400">
                      [SQL CONNECTION] Successfully pooled relational PostgreSQL cluster.
                    </p>
                    <p className="text-cyan-400">
                      [GP DESKTOP INTERFACE] Loading clinician terminal indices... Ready.
                    </p>
                    <p className="text-yellow-400">
                      [AUDIT LOG] Captured Doctor Session: 2.16.840.1.
                    </p>
                    
                    {selectedDiagnoses.map((d, index) => (
                      <p key={index} className="text-[#9ea4cc]">
                        » Encoded icd10_codes: <strong className="text-rose-400">{d.code}</strong> ({d.term}) to active conditions list.
                      </p>
                    ))}

                    {referralCommitted && (
                      <p className="text-indigo-400">
                        » [INTER-CLINIC DISPATCHER] {referralCommitted.id} compiled: Routed {selectedPatient.name} to {referralCommitted.target} queue. State update: REFERRED.
                      </p>
                    )}

                    {localPrescriptions.map((prx, pIdx) => (
                      <p key={pIdx} className="text-emerald-300">
                        » [RETAIL PHARMACY SYNC ENGINE] Committed Doctor Order to Staging Queue. Stock holds verified. Sig calculations approved.
                      </p>
                    ))}

                    <p className="text-neutral-500">
                      -- End of Active Live Frame Queue --
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ERROR STAT OVERRIDES/WARN GATES SECTION */}
            {showDoseWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-2 shadow-xs transition duration-300">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600 animate-bounce" />
                  <span>Clinical Warn Gatekeeper: Adverse Systolic/Drug Contraindication Warning!</span>
                </div>
                <p className="leading-relaxed">
                  The computed vitals show an elevated Systolic value of **{selectedPatient.triageVitals?.systolic} mmHg**. Metformin combined with unmonitored cardiovascular anomalies requires manual doctor override confirmation.
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setClinicState((p) => ({ ...p, warningsCleared: true }))}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10.5px] transition shadow-xs"
                  >
                    I have checked drug-drug overrides (Approve)
                  </button>
                </div>
              </div>
            )}

            {/* FINALIZE CLOSE CONSULTATION BUTTONS */}
            <div className="pt-2 border-t border-neutral-100 flex justify-end gap-3.5">
              <button
                type="button"
                disabled={consultationClosed}
                onClick={() => {
                  // Perform GP clinical block checks
                  if (!selectedPatient.triageVitals?.vitalsVerified) {
                    alert("CRITICAL CLINICAL BLOCK: Today's triage vitals are unverified. Complete vitals check first.");
                    return;
                  }

                  if (!clinicState.warningsCleared && selectedPatient.triageVitals.systolic > 130) {
                    setShowDoseWarning(true);
                    return;
                  }

                  // Auto-routing if referral committed
                  let targetClinic = selectedPatient.clinic;
                  let targetStatus = selectedPatient.status;
                  let infoMsg = "Medicine consultation finalized.";

                  if (referralCommitted) {
                    targetClinic = referralCommitted.target;
                    targetStatus = "InConsult"; // Send to receiving specialty consultative state
                    infoMsg = `Diabetic systemic diagnostic checkup complete. Inter-clinic task dispatch routed patient directly to the [${referralCommitted.target}] Active Daily Queue list under prioritised tag [${referralUrgency}].`;
                  } else {
                    targetStatus = "BillingPending";
                  }

                  // Calculate and append prescription billing lines if added
                  let nextLedger = [...selectedPatient.billingLedger];
                  localPrescriptions.forEach((item, idx) => {
                    nextLedger.push({
                      id: `BIL-RX-MED-${idx}-${Date.now()}`,
                      serviceName: `Dispense: ${item.name}`,
                      category: "PharmacyDispense",
                      amount: 45,
                      status: "Unpaid"
                    });
                  });

                  const notesPayload = `GP consultation finalized. Vitals: Systolic PR: ${selectedPatient.triageVitals.systolic}. ROS Constitutional: ${generalMedicineRos.rosConstitutional}. Codified diagnoses: ${selectedDiagnoses.map((d) => d.code).join(", ")}. Referrals: ${referralCommitted ? referralCommitted.target : "None"}.`;

                  const updated: Patient = {
                    ...selectedPatient,
                    status: targetStatus,
                    clinic: targetClinic, // dynamically swaps clinic routing position when referred! Core workflow!
                    billingLedger: nextLedger,
                    clinicalLogs: [
                      ...selectedPatient.clinicalLogs,
                      {
                        timestamp: new Date().toLocaleTimeString().slice(0, 5),
                        actorRole: "Internal Medicine Dr.",
                        action: "GP Consultation Finalised",
                        notes: `${notesPayload} ${infoMsg}`
                      }
                    ]
                  };

                  onUpdatePatient(updated);
                  setConsultationClosed(true);
                  alert(`Consultation finalized!\n${infoMsg}`);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-[0.98]"
              >
                {consultationClosed ? "Consultation Finalized & Locked" : "Save & Finalize GP Operations"}
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "ENT" && (
          <div className="space-y-6">
            {/* WORKSTATION HEADING WITH BRAND COLORS */}
            <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-2xl shadow-tiny flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-ping"></span>
                  ENT Split-Workstation (Otorhinolaryngology Core)
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Physician Assessment Suite • Asymmetric Otology • Rhinology Spatial Palpation • Laryngeal Scope Tracker
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] font-mono px-3 py-1 rounded text-neutral-600 dark:text-neutral-400">
                  WORKSTATION-ID: <strong className="font-bold text-[#4F46E5]">ENT-901</strong>
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900 font-mono px-2.5 py-1 rounded flex items-center gap-1 font-bold">
                  ● PG-POOL UP
                </span>
              </div>
            </div>

            {/* SPLIT WORKSTATION: DUAL CORES */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT CORE: EAR, NOSE, THROAT PANS (8/12 CLS) */}
              <div className="xl:col-span-8 space-y-6">
                
                {/* 👂 THE OTOLOGY & AUDIOLOGY PANE (EARS) - SIDE-BY-SIDE PRESENTATION */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-2xl shadow-tiny">
                  <div className="flex items-center justify-between border-b border-[var(--clr-border-light)] pb-3 mb-4">
                    <h5 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1.5/2">
                      👂 Module A: Otology & Audiology Assessment (Asymmetric Mapping)
                    </h5>
                    <span className="text-tiny bg-[var(--clr-brand-blue)]/10 dark:bg-indigo-950/30 text-[var(--clr-brand-blue)] px-2 py-0.5 rounded font-medium">
                      Dual-Ear Matrix
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* RIGHT EAR CHANNEL */}
                    <div className="p-4 rounded-xl border border-[var(--clr-border-light)]/80 bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-dashed border-[var(--clr-border-light)] pb-2">
                        <span className="text-xs font-bold text-[var(--clr-brand-blue)] tracking-wide">RIGHT EAR (Aures Dextra - AD)</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-neutral-500 font-medium">Normal?</label>
                          <input
                            type="checkbox"
                            checked={entEarNormalRight}
                            onChange={(e) => {
                              setEntEarNormalRight(e.target.checked);
                              setEntConsoleLogs(p => [...p, `JPA: Updated Right Ear Normal status to ${e.target.checked}`]);
                            }}
                            className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                          />
                        </div>
                      </div>

                      {/* TM Status */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">TM Color</label>
                          <select
                            value={entEarFindingsRight.includes("Hyperemic") ? "Hyperemic" : entEarFindingsRight.includes("Injected") ? "Injected" : "Pearly gray"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEntEarFindingsRight(`TM appears ${v.toLowerCase()}. External auditory canal clean, landmarks present.`);
                              setEntConsoleLogs(p => [...p, `JPA: Right TM Color adjusted ➔ ${v}`]);
                            }}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1"
                          >
                            <option value="Pearly gray">Pearly Gray</option>
                            <option value="Hyperemic">Hyperemic / Injected</option>
                            <option value="Injected">Injected / Vascular</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Tympanometry</label>
                          <select
                            value={entTympanometryRight}
                            onChange={(e) => {
                              setEntTympanometryRight(e.target.value);
                              setEntConsoleLogs(p => [...p, `AUDIOMETRY: Right Tympanogram swapped ➔ ${e.target.value}`]);
                            }}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1"
                          >
                            <option value="Type A">Type A (Normal Compliance)</option>
                            <option value="Type B">Type B (Flat / Middle Ear Fluid)</option>
                            <option value="Type C">Type C (Negative Eustachian Pressure)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Otoscopy Findings</label>
                          <textarea
                            value={entEarFindingsRight}
                            onChange={(e) => setEntEarFindingsRight(e.target.value)}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 h-12 focus:outline-[#4F46E5]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                          <div>
                            <label className="block text-tiny font-mono uppercase text-neutral-400">Air Conduction (AC)</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={entAcRight}
                                onChange={(e) => {
                                  setEntAcRight(e.target.value);
                                  setEntConsoleLogs(p => [...p, `AUDIOMETRY: Right AC adjusted ➔ ${e.target.value} dB`]);
                                }}
                                className="w-16 text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-0.5 font-mono text-center"
                              />
                              <span className="text-[10px] font-mono">dB</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-tiny font-mono uppercase text-neutral-400">Bone Cond. (BC)</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={entBcRight}
                                onChange={(e) => {
                                  setEntBcRight(e.target.value);
                                  setEntConsoleLogs(p => [...p, `AUDIOMETRY: Right BC adjusted ➔ ${e.target.value} dB`]);
                                }}
                                className="w-16 text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-0.5 font-mono text-center"
                              />
                              <span className="text-[10px] font-mono">dB</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct conductance gap calculation model */}
                        <div className="pt-1 flex items-center justify-between text-tiny">
                          <span className="text-neutral-400 font-mono">Conductive Air-Bone Gap:</span>
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                            (parseInt(entAcRight) - parseInt(entBcRight)) >= 10
                              ? "bg-amber-50 dark:bg-amber-950/30 text-[#F59E0B]"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}>
                            {isNaN(parseInt(entAcRight) - parseInt(entBcRight)) ? 0 : (parseInt(entAcRight) - parseInt(entBcRight))} dB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LEFT EAR CHANNEL */}
                    <div className="p-4 rounded-xl border border-[var(--clr-border-light)]/80 bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-dashed border-[var(--clr-border-light)] pb-2">
                        <span className="text-xs font-bold text-[#F59E0B] dark:text-amber-400 tracking-wide">LEFT EAR (Aures Sinistra - AS)</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-neutral-500 font-medium">Normal?</label>
                          <input
                            type="checkbox"
                            checked={entEarNormalLeft}
                            onChange={(e) => {
                              setEntEarNormalLeft(e.target.checked);
                              setEntConsoleLogs(p => [...p, `JPA: Updated Left Ear Normal status to ${e.target.checked}`]);
                            }}
                            className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                          />
                        </div>
                      </div>

                      {/* TM Status */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">TM Color</label>
                          <select
                            value={entEarFindingsLeft.includes("Hyperemic") ? "Hyperemic" : entEarFindingsLeft.includes("Injected") ? "Injected" : "Hyperemic"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEntEarFindingsLeft(`TM appears ${v.toLowerCase()}. Marked retraction pockets with middle ear effusion.`);
                              setEntConsoleLogs(p => [...p, `JPA: Left TM Color adjusted ➔ ${v}`]);
                            }}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1"
                          >
                            <option value="Pearly gray">Pearly Gray</option>
                            <option value="Hyperemic">Hyperemic / Injected</option>
                            <option value="Injected">Injected / Vascular</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Tympanometry</label>
                          <select
                            value={entTympanometryLeft}
                            onChange={(e) => {
                              setEntTympanometryLeft(e.target.value);
                              setEntConsoleLogs(p => [...p, `AUDIOMETRY: Left Tympanogram swapped ➔ ${e.target.value}`]);
                            }}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1"
                          >
                            <option value="Type A">Type A (Normal Compliance)</option>
                            <option value="Type B">Type B (Flat / Middle Ear Fluid)</option>
                            <option value="Type C">Type C (Negative Eustachian Pressure)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Otoscopy Findings</label>
                          <textarea
                            value={entEarFindingsLeft}
                            onChange={(e) => setEntEarFindingsLeft(e.target.value)}
                            className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 h-12 focus:outline-[#4F46E5]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                          <div>
                            <label className="block text-tiny font-mono uppercase text-neutral-400">Air Conduction (AC)</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={entAcLeft}
                                onChange={(e) => {
                                  setEntAcLeft(e.target.value);
                                  setEntConsoleLogs(p => [...p, `AUDIOMETRY: Left AC adjusted ➔ ${e.target.value} dB`]);
                                }}
                                className="w-16 text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-0.5 font-mono text-center"
                              />
                              <span className="text-[10px] font-mono">dB</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-tiny font-mono uppercase text-neutral-400">Bone Cond. (BC)</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={entBcLeft}
                                onChange={(e) => {
                                  setEntBcLeft(e.target.value);
                                  setEntConsoleLogs(p => [...p, `AUDIOMETRY: Left BC adjusted ➔ ${e.target.value} dB`]);
                                }}
                                className="w-16 text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-0.5 font-mono text-center"
                              />
                              <span className="text-[10px] font-mono">dB</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct conductance gap calculation model */}
                        <div className="pt-1 flex items-center justify-between text-tiny">
                          <span className="text-neutral-400 font-mono">Conductive Air-Bone Gap:</span>
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                            (parseInt(entAcLeft) - parseInt(entBcLeft)) >= 15
                              ? "bg-amber-100 dark:bg-amber-950 text-[#F59E0B]"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}>
                            {isNaN(parseInt(entAcLeft) - parseInt(entBcLeft)) ? 0 : (parseInt(entAcLeft) - parseInt(entBcLeft))} dB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WEBER & RINNE BEDSIDE MATRIX CORES */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-dashed border-[var(--clr-border-light)] pt-4">
                    <div className="md:col-span-4">
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Weber Test Lateralization</label>
                      <select
                        value={entWeberTest}
                        onChange={(e) => {
                          setEntWeberTest(e.target.value);
                          setEntConsoleLogs(p => [...p, `JPA: Weber test lateralization state updated ➔ ${e.target.value}`]);
                        }}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                      >
                        <option value="Lateralizes to the left ear">Lateralizes to Left [Conductive/AS or Sensorineural/AD]</option>
                        <option value="Lateralizes to the right ear">Lateralizes to Right [Conductive/AD or Sensorineural/AS]</option>
                        <option value="No lateralization (Symmetrical)">Middle (Symmetrical Conductive)</option>
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Rinne Test Right AD</label>
                      <select
                        value={entRinneRight}
                        onChange={(e) => {
                          setEntRinneRight(e.target.value);
                          setEntConsoleLogs(p => [...p, `JPA: Rinne AD set to ${e.target.value}`]);
                        }}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                      >
                        <option value="Positive (AC > BC)">Positive (AC &gt; BC) - Normal / Sensorineural</option>
                        <option value="Negative (BC > AC)">Negative (BC &gt; AC) - Conductive Loss</option>
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 mb-1">Rinne Test Left AS</label>
                      <select
                        value={entRinneLeft}
                        onChange={(e) => {
                          setEntRinneLeft(e.target.value);
                          setEntConsoleLogs(p => [...p, `JPA: Rinne AS set to ${e.target.value}`]);
                        }}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                      >
                        <option value="Positive (AC > BC)">Positive (AC &gt; BC) - Normal / Sensorineural</option>
                        <option value="Negative (BC > AC)">Negative (BC &gt; AC) - Conductive Loss</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] p-3 rounded-xl text-xs text-neutral-600 dark:text-neutral-400">
                    <div>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Tympanic Membrane Integrity Indicator:</span>
                      <input
                        type="text"
                        value={entTympanicMembrane}
                        onChange={(e) => setEntTympanicMembrane(e.target.value)}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 text-neutral-800 dark:text-neutral-205"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Hearing Impairment Core Classification:</span>
                      <select
                        value={entHearingImpairment}
                        onChange={(e) => {
                          setEntHearingImpairment(e.target.value);
                          setEntConsoleLogs(p => [...p, `JPA: Swapped Impairment category ➔ ${e.target.value}`]);
                        }}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 text-neutral-800 dark:text-neutral-205"
                      >
                        <option value="LEFT_CONDUCTIVE">Left Conductive Hearing Impairment</option>
                        <option value="RIGHT_CONDUCTIVE">Right Conductive Hearing Impairment</option>
                        <option value="BILATERAL_CONDUCTIVE">Bilateral Conductive Hearing Impairment</option>
                        <option value="LEFT_SENSORINEURAL">Left Sensorineural Hearing Impairment</option>
                        <option value="RIGHT_SENSORINEURAL">Right Sensorineural Hearing Impairment</option>
                        <option value="BILATERAL_SENSORINEURAL">Bilateral Sensorineural Hearing Loss</option>
                        <option value="NONE">No Significant Symmetrical Deficit</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 👃 THE RHINOLOGY & SINUS PANE (NOSE) */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-2xl shadow-tiny">
                  <div className="border-b border-[var(--clr-border-light)] pb-3 mb-4 flex items-center justify-between">
                    <h5 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                      👃 Module B: Rhinology & Sinus Airway Patency Diagnostics
                    </h5>
                    <span className="text-tiny bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] px-2 py-0.5 rounded text-[var(--clr-brand-blue)] font-medium font-mono">
                      Obstruction Indicators
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Airway metrics */}
                    <div className="space-y-3 p-3.5 rounded-xl border border-[var(--clr-border-light)] dark:border-neutral-805 bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block border-b border-[var(--clr-border-light)] pb-1 font-sans">
                        Turbinates & Septum Patency Scales
                      </span>
                      
                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400">Nasal Septum Deviation</label>
                        <select
                          value={entNasalSeptum}
                          onChange={(e) => {
                            setEntNasalSeptum(e.target.value);
                            setEntConsoleLogs(p => [...p, `JPA: Nasal septum status changed ➔ ${e.target.value}`]);
                          }}
                          className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                        >
                          <option value="Deviated to the right side">Deviated to the Right Side (Partial block)</option>
                          <option value="Deviated to the left side">Deviated to the Left Side</option>
                          <option value="S-deviated septal cartilage">S-Shaped Complex Deviation</option>
                          <option value="Midline / Straight">Straight / Non-Deviated Midline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400">Turbinate Hypertrophy sizing</label>
                        <select
                          value={entTurbinates}
                          onChange={(e) => {
                            setEntTurbinates(e.target.value);
                            setEntConsoleLogs(p => [...p, `JPA: Turbinate hypertrophy state updated ➔ ${e.target.value}`]);
                          }}
                          className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                        >
                          <option value="Bilateral inferior turbinate hypertrophy Grade 2">Bilateral Inferior Turbinate Hypertrophy Grade 2</option>
                          <option value="Unilateral right hypertrophy Grade 3">Unilateral Right Hypertrophy Grade 3 (Severe)</option>
                          <option value="Unilateral left hypertrophy Grade 2">Unilateral Left Hypertrophy Grade 2</option>
                          <option value="Normal size Grade 1">Minimal Congestion Grade 1 (Mild)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-tiny uppercase font-mono text-neutral-400">Mucosal Rheum Toggles</label>
                          <select
                            value={entNasalMucosa}
                            onChange={(e) => setEntNasalMucosa(e.target.value)}
                            className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                          >
                            <option value="Erythematous and engorged">Erythematous & Engorged</option>
                            <option value="Pale and boggy">Pale and Boggy (Allergic)</option>
                            <option value="Hyperemic and bleeding">Hyperemic</option>
                            <option value="Normal pink-moist">Normal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-tiny uppercase font-mono text-neutral-400">Rhinorrhea Clarity</label>
                          <select
                            value={prescriptionInput.toLowerCase().includes("suspension") ? "purulent" : "serous"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEntConsoleLogs(p => [...p, `JPA: Rhinorrhea secretion changed ➔ ${v}`]);
                            }}
                            className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5"
                          >
                            <option value="serous">Serous (Watery/Clear)</option>
                            <option value="mucoid">Mucoid (Thick Whitish)</option>
                            <option value="purulent">Purulent (Bacterial Yellow/Pus)</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SINUS SPATIAL PALPATION MAPPING VIEW */}
                    <div className="border border-[var(--clr-border-light)] p-3.5 rounded-xl bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30 space-y-3">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block border-b border-[var(--clr-border-light)] pb-1 font-sans">
                        Sinus Palpation Sensitivity Map (Click to Toggle Tenderness)
                      </span>
                      
                      <div className="relative border border-[var(--clr-border-light)] rounded-xl bg-white dark:bg-[#0E1019] p-4 text-center">
                        <span className="text-[10px] font-mono text-neutral-400 block mb-2">ANATOMICAL CAVITY MAP</span>
                        
                        <div className="space-y-4 max-w-xs mx-auto">
                          {/* Frontal Cavities */}
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEntFrontalTenderness(!entFrontalTenderness);
                                setEntConsoleLogs(p => [...p, `SYSTEM: Frontal Sinus tenderness state altered.`]);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold border transition ${
                                entFrontalTenderness 
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-[#F59E0B] border-[#F59E0B]/50 animate-pulse shadow-xs" 
                                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-805 text-neutral-400"
                              }`}
                            >
                              Frontal Cavity Left: {entFrontalTenderness ? "⚠️ INFLAMED" : "Normal"}
                            </button>
                          </div>

                          {/* Nose bridge spacer */}
                          <div className="h-4 w-1 bg-neutral-200 dark:bg-neutral-800 mx-auto rounded-full"></div>

                          {/* Maxillary Cavities */}
                          <div className="flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEntMaxillaryTenderness(!entMaxillaryTenderness);
                                setEntConsoleLogs(p => [...p, `SYSTEM: Maxillary Left Sinus tenderness toggled.`]);
                              }}
                              className={`px-2 py-1.5 flex-1 rounded-lg font-mono text-[10px] uppercase font-bold border transition ${
                                entMaxillaryTenderness
                                  ? "bg-amber-50 dark:bg-amber-950/40 border-[#F59E0B]/50 text-[#F59E0B] shadow-xs"
                                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-805 text-neutral-400"
                              }`}
                            >
                              Maxillary Left: {entMaxillaryTenderness ? "⚠️ ENHANCED PAIN" : "Comfortable"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEntConsoleLogs(p => [...p, `SYSTEM: Maxillary Right Sinus tenderness toggled.`]);
                              }}
                              className={`px-2 py-1.5 flex-1 rounded-lg font-mono text-[10px] uppercase font-bold border bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-805 text-neutral-400`}
                            >
                              Maxillary Right: Normal
                            </button>
                          </div>
                        </div>

                        <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-3 leading-relaxed">
                          Amber glow indicates palpation-induced clinical tenderness over direct sinuses during examination cycles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 👅 THE LARYNGOSCOPY & PHARYNX PANE (THROAT & NECK) */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-2xl shadow-tiny">
                  <div className="border-b border-[var(--clr-border-light)] pb-3 mb-4 flex items-center justify-between">
                    <h5 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                      👅 Module C: Laryngoscopy, Oropharynx & Cervical Lymph Plotter
                    </h5>
                    <span className="text-tiny bg-[var(--clr-brand-blue)]/10 dark:bg-indigo-950/30 text-[var(--clr-brand-blue)] px-2.5 py-0.5 rounded font-medium">
                      Lower Airway
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Oropharynx details */}
                    <div className="space-y-3 p-3.5 border border-[var(--clr-border-light)] rounded-xl bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block border-b border-[var(--clr-border-light)] dark:border-neutral-805 pb-1 font-sans">
                        Oropharyngeal & Voice Assessment Markers
                      </span>

                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400">Oropharyngeal Assessment Notes</label>
                        <input
                          type="text"
                          value={entOropharynxExam}
                          onChange={(e) => setEntOropharynxExam(e.target.value)}
                          className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 focus:outline-[#4F46E5]"
                        />
                      </div>

                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400">Vocal Cord Mobility & Laryngeal findings</label>
                        <input
                          type="text"
                          value={entLarynxExam}
                          onChange={(e) => setEntLarynxExam(e.target.value)}
                          className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 focus:outline-[#4F46E5]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-neutral-700 dark:text-neutral-300">
                        <div>
                          <label className="block text-tiny uppercase font-mono text-neutral-400">Voice Assessment</label>
                          <input
                            type="text"
                            value={entVoiceAssessment}
                            onChange={(e) => setEntVoiceAssessment(e.target.value)}
                            className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 focus:outline-[#4F46E5]"
                          />
                        </div>
                        <div>
                          <label className="block text-tiny uppercase font-mono text-neutral-400">Fistula Test Result</label>
                          <input
                            type="text"
                            value={entFistulaTest}
                            onChange={(e) => setEntFistulaTest(e.target.value)}
                            className="w-full text-xs mt-1 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 focus:outline-[#4F46E5]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CERVICAL LYMPHADENOPATHY PLOTTER (LEVELS I - VII) */}
                    <div className="border border-[var(--clr-border-light)] p-3.5 bg-[#FBFBF9]/30 dark:bg-[#0B0E14]/30 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block border-b border-[var(--clr-border-light)] dark:border-neutral-850 pb-1 font-sans">
                        Cervical Lymph Node Level Plotting
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.keys(entNeckNodes).map((level) => {
                          const active = entNeckNodes[level];
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                const nextState = !active;
                                setEntNeckNodes(p => ({ ...p, [level]: nextState }));
                                setEntConsoleLogs(p => [...p, `JPA: Neck ${level} Node involvement set to ${nextState}`]);
                              }}
                              className={`px-1.5 py-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                                active
                                  ? "bg-rose-50 dark:bg-rose-950/40 border-[#4F46E5] dark:border-[#4F46E5]/40 text-[#4F46E5]"
                                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-805 text-neutral-400 dark:text-neutral-500"
                              }`}
                            >
                              <span className="text-[10px] font-bold block">{level}</span>
                              <span className="text-tiny font-sans mt-0.5 select-none text-[8.5px] uppercase">
                                {active ? "🚨 Firm Nodes" : "Clear"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      
                      <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 italic text-center">
                        Level I-VII represent classic neck levels. Marked levels denote palpable firm nodes indicative of localized pathology.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT CORE: CODES, ROUTING, PHARMACY, & CONSOLE (4/12 CLS) */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* 1. ADVANCED DIAGNOSTICS & IC10 FUZZY FINDER */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-3 shadow-tiny">
                  <div className="flex items-center gap-1.5 border-b border-[var(--clr-border-light)] pb-1.5">
                    <Activity className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-xs font-bold font-sans text-neutral-800 dark:text-neutral-100">1. Terminology Engine (Fuzzy ICD-10 Search)</span>
                  </div>

                  {/* Fuzzy trigger search container */}
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Type 'infection', 'ear fluid', 'sinusitis'..."
                      value={entIcdQuery}
                      onChange={(e) => {
                        setEntIcdQuery(e.target.value);
                        setEntConsoleLogs(p => [...p, `TERM_ENGINE: Fuzzy text parsing for: "${e.target.value}"`]);
                      }}
                      className="w-full text-xs font-sans bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-2 focus:outline-[#4F46E5]"
                    />

                    {/* Fuzzy database terms matching matches list */}
                    {entIcdQuery && (
                      <div className="border border-[var(--clr-border-light)] rounded-lg max-h-36 overflow-y-auto bg-[#FBFBF9] dark:bg-[#0E1019] text-tiny divide-y divide-[#EAE6DF] dark:divide-neutral-850">
                        {[
                          { code: "H66.002", term: "Acute suppurative otitis media, right ear" },
                          { code: "H66.001", term: "Acute suppurative otitis media, left ear" },
                          { code: "H65.2", term: "Chronic serous otitis media, bilateral fluid" },
                          { code: "J01.00", term: "Acute maxillary sinusitis, chronic origin" },
                          { code: "J34.2", term: "Deviated Nasal Septum airway compression" },
                          { code: "J35.0", term: "Chronic tonsillitis Brodsky hypertrophy" }
                        ]
                          .filter(item => 
                            item.term.toLowerCase().includes(entIcdQuery.toLowerCase()) || 
                            item.code.toLowerCase().includes(entIcdQuery.toLowerCase())
                          )
                          .map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                // Add code to active selections
                                if (!entSelectedDiagnoses.find(d => d.code === item.code)) {
                                  const termObj = {
                                    code: item.code,
                                    term: item.term,
                                    type: "PRIMARY",
                                    status: "CONFIRMED",
                                    chronicity: "ACUTE",
                                    anatomicalTag: entAnatomicalTag
                                  };
                                  setEntSelectedDiagnoses([...entSelectedDiagnoses, termObj]);
                                  setEntConsoleLogs(p => [...p, `JPA: Bound ICD-10 item [${item.code}] with anatomical tag [${entAnatomicalTag}]`]);
                                  
                                  // Auto-flag hearing loss if Otitis / Serous fluid loaded
                                  if (item.code.includes("H66") || item.code.includes("H65")) {
                                    setClinicState(p => ({ ...p, hearingLossDiagnosed: true }));
                                    setEntConsoleLogs(p => [...p, `SAFETY: Symmetrical loss rules loaded. Audiology blocking filter ARMED.`]);
                                  }
                                }
                                setEntIcdQuery("");
                              }}
                              className="w-full text-left p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex justify-between items-center text-neutral-700 dark:text-neutral-300 transition"
                            >
                              <span>{item.term}</span>
                              <strong className="font-mono text-[9px] bg-[var(--clr-brand-blue)]/10 dark:bg-indigo-950 font-bold px-1 py-0.5 rounded text-[#4F46E5]">{item.code}</strong>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Anatomical binding tags dropdown */}
                  <div className="flex gap-2 items-center text-tiny">
                    <span className="text-neutral-400 font-mono">Bind Anatomical Tag:</span>
                    <select
                      value={entAnatomicalTag}
                      onChange={(e) => setEntAnatomicalTag(e.target.value)}
                      className="text-[11px] bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] rounded px-1.5 py-0.5 text-neutral-700 dark:text-neutral-350"
                    >
                      <option value="Unilateral Left">Unilateral Left Ear</option>
                      <option value="Unilateral Right">Unilateral Right Ear</option>
                      <option value="Bilateral">Bilateral Sinus / Nose</option>
                    </select>
                  </div>

                  {/* Active selected Terminology Ledger */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {entSelectedDiagnoses.map((diag, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-2 rounded-lg text-tiny">
                        <div>
                          <div className="font-sans font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                            <span className="font-mono text-xs text-[#4F46E5]">{diag.code}</span>
                            <span className="text-[10px] px-1 bg-amber-50 rounded text-[#F59E0B] py-0.5 font-mono">{diag.anatomicalTag || "Left ear"}</span>
                          </div>
                          <span className="text-neutral-500 text-tiny block mt-0.5">{diag.term}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEntSelectedDiagnoses(entSelectedDiagnoses.filter((_, i) => i !== index));
                            setEntConsoleLogs(p => [...p, `JPA: Untracked and removed diagnostic ledger code: ${diag.code}`]);
                          }}
                          className="text-neutral-400 hover:text-neutral-600 px-1 font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. INTER-CLINIC REFERRAL ROUTING ENGINE */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-3 shadow-tiny">
                  <div className="flex items-center gap-1.5 border-b border-[var(--clr-border-light)] pb-1.5">
                    <ArrowUpRight className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-xs font-bold font-sans text-neutral-800 dark:text-neutral-100">2. Inter-Clinic Logistics Handover</span>
                  </div>

                  <div className="space-y-2 text-tiny text-neutral-500 dark:text-neutral-400">
                    <p className="leading-relaxed">
                      Dispatch priority clinical transfers directly to another specialized medical hub queue with transaction markers.
                    </p>

                    <div>
                      <label className="block text-tiny uppercase font-mono text-neutral-400 mb-1">Target Specialized Clinic</label>
                      <select
                        value={entReferralTarget}
                        onChange={(e) => {
                          setEntReferralTarget(e.target.value);
                          if (e.target.value === "DENTAL") {
                            setEntReferralReason("Evaluate for odontogenic origin of maxillary sinusitis (maxillary tooth molar root perforation).");
                          } else if (e.target.value === "AUDIOLOGY") {
                            setEntReferralReason("Inhouse audiometer custom vestibular and hearing-aid evaluation.");
                          } else {
                            setEntReferralReason("Acute neurological vertigo with peripheral cranial nerve pressure.");
                          }
                        }}
                        className="w-full text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded p-1.5"
                      >
                        <option value="AUDIOLOGY">Audiology Support Desk (Vestibular / Hearing Aid)</option>
                        <option value="DENTAL">Dental & Maxillofacial (Sinus Roots Fistula Check)</option>
                        <option value="NEUROLOGY-OPHTHALMOLOGY">Neurology / Ophthalmology (Acute Vestibular Vertigo)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400 mb-1">Urgency Index</label>
                        <select
                          value={entReferralUrgency}
                          onChange={(e) => setEntReferralUrgency(e.target.value)}
                          className="w-full text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded p-1.5"
                        >
                          <option value="ROUTINE">Routine Consult</option>
                          <option value="URGENT">Urgent STAT Callback</option>
                          <option value="STAT">STAT Emergency Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-tiny uppercase font-mono text-neutral-400 mb-1">Status Code</label>
                        <span className="block p-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-center rounded text-xs select-none">
                          TRANS_READY
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-tiny uppercase font-mono text-neutral-400 mb-1">Handover Instructions / Reason</label>
                      <textarea
                        value={entReferralReason}
                        onChange={(e) => setEntReferralReason(e.target.value)}
                        className="w-full text-xs font-sans bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1.5 h-12"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Check audiometry gate
                        if (clinicState.hearingLossDiagnosed && !clinicState.audiometryFileAttached) {
                          alert("MANDATORY CLINICAL SAFETY GATE: Symmetrical Conductive Hearing Loss flagged. You are strictly blocked from dishing referrals until you attach laboratory Audiometry/Tympanometry files.");
                          setEntConsoleLogs(p => [...p, "SAFETY GATE BLOCKED: Failed referral checkout. Missing mandatory audiology PDF context signature."]);
                          return;
                        }

                        // Mock dispatch action
                        const trackingId = "RF-" + Math.floor(Math.random() * 90000 + 10000);
                        setEntConsoleLogs(p => [
                          ...p,
                          `========================================`,
                          `🏥 REFERRAL DISPATCHED VIA POSTGRES:`,
                          `TRANSACTION LEDGER ID: ${trackingId}`,
                          `TARGET HUB: ${entReferralTarget}`,
                          `ROUTING LEVEL: ${entReferralUrgency}`,
                          `INTENT: ${entReferralReason}`,
                          `========================================`
                        ]);
                        alert(`Referral successfully committed!\nID: ${trackingId}\nTransferred into ${entReferralTarget} triage pipeline.`);
                      }}
                      className="w-full py-2 bg-[#4F46E5] hover:bg-neutral-900 dark:hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-tiny transition active:scale-[0.98]"
                    >
                      Dispatch Referral Route
                    </button>
                  </div>
                </div>

                {/* 3. UNIFIED E-PRESCRIBING FORMULARY & MATH ENGINE */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-3 shadow-tiny">
                  <div className="flex items-center gap-1.5 border-b border-[var(--clr-border-light)] pb-1.5">
                    <FileText className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-xs font-bold font-sans text-neutral-800 dark:text-neutral-100">3. Unified E-Prescribing & Compounding Calculator</span>
                  </div>

                  <p className="text-tiny text-neutral-500 leading-relaxed">
                    Select a core ENT specialized compounding formulation. The arithmetic engine calculates milliliters based on duration dosage constraints automatically.
                  </p>

                  {/* FORMULARY ACTION CARDS */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      { name: "Cipro+Dex Otic Ear Drops", dose: "4 drops", route: "OTIC_DROPS", drugId: "dr-otic-91" },
                      { name: "Fluticasone Nasal Spray", dose: "2 sprays", route: "NASAL_SPRAY", drugId: "dr-nose-22" },
                      { name: "Prednisone Cortico Taper", dose: "40 mg", route: "ORAL_TAPERS", drugId: "dr-steroid-8" },
                      { name: "Augmentin Chewable", dose: "500 mg", route: "ORAL", drugId: "dr-antibiotic-4" }
                    ].map(f => (
                      <button
                        key={f.drugId}
                        type="button"
                        onClick={() => {
                          setEntSelectedFormulation(f.name);
                          setEntDoseValue(f.dose);
                          setEntAdminRoute(f.route);
                          if (f.route === "OTIC_DROPS") {
                            setEntSpecialInstructions("Instill 4 drops into the left ear canal TID.");
                          } else if (f.route === "NASAL_SPRAY") {
                            setEntSpecialInstructions("Instill 2 sprays into each nostril BID.");
                          } else {
                            setEntSpecialInstructions("Take with meals as directed on taper schema.");
                          }
                        }}
                        className={`p-2 rounded-lg border text-left transition ${
                          entSelectedFormulation.includes(f.name.split(" ")[0])
                            ? "bg-[#FBFBF9] dark:bg-neutral-900 border-[#4F46E5]/50 text-[#4F46E5] font-bold"
                            : "bg-[#FFFFFF] dark:bg-neutral-950 border-[var(--clr-border-light)] dark:border-neutral-850 text-neutral-700"
                        }`}
                      >
                        <span className="text-xs block leading-tight">{f.name}</span>
                        <span className="text-[9px] text-neutral-400 font-mono font-medium mt-1 block">{f.route}</span>
                      </button>
                    ))}
                  </div>

                  {/* COMPULATOR INPUT CONTROLS */}
                  <div className="p-3 bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-850 rounded-xl space-y-2 text-tiny">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 block border-b border-[var(--clr-border-light)] pb-1 font-mono">Dosing Arithmetic Engine</span>

                    <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                      <div>
                        <label className="block text-[10px] uppercase font-mono">Dose Pattern</label>
                        <input
                          type="text"
                          value={entDoseValue}
                          onChange={(e) => setEntDoseValue(e.target.value)}
                          className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono">Frequency</label>
                        <select
                          value={entFreqValue}
                          onChange={(e) => setEntFreqValue(e.target.value)}
                          className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1 font-mono"
                        >
                          <option value="TID">TID (Three Daily)</option>
                          <option value="BID">BID (Two Daily)</option>
                          <option value="QID">QID (Four Daily)</option>
                          <option value="QD">QD (Once Daily)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                      <div>
                        <label className="block text-[10px] uppercase font-mono">Duration (Days)</label>
                        <input
                          type="number"
                          value={entDurationDays}
                          onChange={(e) => setEntDurationDays(parseInt(e.target.value) || 0)}
                          className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono">Calculated Bottling Size</label>
                        <div className="flex gap-1 items-center">
                          <span className="p-1 font-mono font-bold bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded text-center flex-1 text-xs">
                            {/* Calculation formula: (drops_per_dose * frequency_per_day * duration_days) / 20 drops per ml */}
                            {(() => {
                              const baseDose = parseInt(entDoseValue) || 4;
                              const factor = entFreqValue === "QID" ? 4 : entFreqValue === "TID" ? 3 : entFreqValue === "BID" ? 2 : 1;
                              const totalDrops = baseDose * factor * entDurationDays;
                              const calculatedMl = totalDrops / 20; // 20 drops per ml
                              const bottleSize = calculatedMl <= 5 ? 5 : calculatedMl <= 10 ? 10 : calculatedMl <= 15 ? 15 : 30;
                              return `${bottleSize} mL Bottle`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock indicator */}
                    <div className="pt-1.5 flex items-center justify-between text-tiny text-neutral-400 border-t border-dashed border-[var(--clr-border-light)]">
                      <span>Formula Compounding Fact:</span>
                      <span className="font-mono text-emerald-600 font-bold">● Form. In-Stock (Secure Allocation)</span>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-neutral-400">Instill Instructions</label>
                      <input
                        type="text"
                        value={entSpecialInstructions}
                        onChange={(e) => setEntSpecialInstructions(e.target.value)}
                        className="w-full text-xs bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded p-1"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const baseDose = parseInt(entDoseValue) || 4;
                        const factor = entFreqValue === "QID" ? 4 : entFreqValue === "TID" ? 3 : entFreqValue === "BID" ? 2 : 1;
                        const totalDrops = baseDose * factor * entDurationDays;
                        const calculatedMl = totalDrops / 20;
                        const bottleSize = calculatedMl <= 5 ? 5 : calculatedMl <= 10 ? 10 : calculatedMl <= 15 ? 15 : 30;

                        const prescriptionObj = {
                          drugName: `${entSelectedFormulation} ${bottleSize}mL Compounded Suspension`,
                          dosage: entDoseValue,
                          frequency: entFreqValue,
                          durationDays: entDurationDays,
                          route: entAdminRoute,
                          instructions: entSpecialInstructions
                        };
                        setEntLocalPrescriptions([...entLocalPrescriptions, prescriptionObj]);
                        setEntConsoleLogs(p => [...p, `PHARMACY: Calculated direct dosing prescription math ➔ ${totalDrops} drops units requested (Min size ${bottleSize} mL)`]);
                      }}
                      className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-850 text-white text-tiny font-bold rounded-lg transition"
                    >
                      Authorize & Join Rx List
                    </button>
                  </div>

                  {/* Joined Prescription List */}
                  <div className="space-y-1 bg-[#FBFBF9]/40 p-2 rounded border border-[var(--clr-border-light)] dark:border-neutral-850 max-h-24 overflow-y-auto">
                    {entLocalPrescriptions.length === 0 ? (
                      <span className="text-neutral-400 italic text-tiny block text-center">No prescriptions mapped.</span>
                    ) : (
                      entLocalPrescriptions.map((rx, idx) => (
                        <div key={idx} className="flex justify-between items-center text-tiny p-1.5 hover:bg-neutral-100 rounded">
                          <div>
                            <strong className="text-neutral-800 dark:text-neutral-200">{rx.drugName}</strong>
                            <span className="text-neutral-400 block mt-0.5">{rx.dosage} • {rx.frequency} • {rx.durationDays} days</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEntLocalPrescriptions(entLocalPrescriptions.filter((_, i) => i !== idx));
                              setEntConsoleLogs(p => [...p, `PHARMACY: Removed prescription item`]);
                            }}
                            className="text-neutral-400 hover:text-red-500 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. REAL-TIME SQL TRACED CONSOLE */}
                <div className="bg-[#0B0E14] text-emerald-400 border border-neutral-800 p-4 rounded-xl space-y-2 font-mono h-48 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1 text-[10px]">
                    <span className="text-neutral-400 font-bold">SQL TERMINAL SYSTEM LEDGER (REALTIME)</span>
                    <span className="text-emerald-500 animate-pulse text-tiny">● LIVE TRACING</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto text-[9px] space-y-1 select-none scrollbar-thin scrollbar-thumb-neutral-800">
                    {entConsoleLogs.map((logStr, i) => (
                      <span key={i} className="block leading-relaxed">
                        {logStr}
                      </span>
                    ))}
                  </div>

                  <div className="text-[8.5px] text-neutral-500 flex justify-between">
                    <span>DATABASE: rts_clinic_ent</span>
                    <span>POOL_SIZE: 15 / ACTIVE: 1</span>
                  </div>
                </div>

              </div>

            </div>

            {/* MANDATORY CLINICAL SAFETY GATE (AUDIOMETRY ATTACHING PANEL) */}
            <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left py-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-50 text-[#F59E0B] px-2 py-0.5 rounded font-mono font-bold">
                    MANDATORY SECURITY GATE: AUDIOLOGICAL INTEGRITY
                  </span>
                  <Activity className="w-4 h-4 text-[#F59E0B] shrink-0" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1.5 leading-relaxed max-w-2xl">
                  Under clinical safety code <strong className="font-bold">ENT-GATE-902</strong>: If Conductive Symmetrical Hearing Loss is flagged, clinician referral handovers are locked until tympanometry/audiogram diagnostics are attached.
                </p>
              </div>

              {/* Upload control */}
              <div className="p-3 bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl flex items-center gap-3">
                <div className="text-right">
                  <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-250 cursor-pointer justify-end">
                    <input
                      type="checkbox"
                      checked={clinicState.hearingLossDiagnosed}
                      onChange={(e) => {
                        setClinicState((p) => ({ ...p, hearingLossDiagnosed: e.target.checked }));
                        setEntConsoleLogs(p => [...p, `SAFETY: Flagged Hearing Loss diagnostics to ${e.target.checked}`]);
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Flag Active <strong>Hearing Loss</strong></span>
                  </label>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {clinicState.hearingLossDiagnosed ? "⚠️ Upload required to complete" : "Optional verification Mode"}
                  </span>
                </div>

                <div className="h-6 w-px bg-[#EAE6DF] dark:bg-neutral-800"></div>

                <div>
                  {clinicState.audiometryFileAttached ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="max-w-[120px] truncate">{clinicState.audiometryFileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setClinicState(p => ({ ...p, audiometryFileAttached: false, audiometryFileName: "" }));
                          setEntConsoleLogs(p => [...p, `SAFETY: Symmetrical audiology PDF context signature removed.`]);
                        }}
                        className="text-neutral-400 hover:text-neutral-600 px-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setClinicState(p => ({
                          ...p,
                          audiometryFileAttached: true,
                          audiometryFileName: "audiogram_AS_conductive_loss.pdf"
                        }));
                        setEntConsoleLogs(p => [...p, `SAFETY: Attached Audiometry File [audiogram_AS_conductive_loss.pdf]. Mandatory gate bypass verified.`]);
                      }}
                      className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-bold text-xs rounded-lg shadow-tiny"
                    >
                      Attach Audiogram PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-[var(--clr-border-light)] flex justify-between items-center gap-4 bg-white/50 dark:bg-neutral-900/10 p-4 rounded-xl">
              <span className="text-tiny text-neutral-400 italic">
                All ENT sessions are dynamically verified and automatically written to JPA repositories.
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Check if hearing loss diagnosed but files omitted
                    if (clinicState.hearingLossDiagnosed && !clinicState.audiometryFileAttached) {
                      alert("CRITICAL REJECTION: A permanent medical block is active! Hearing Loss has been diagnosed; you must attach Audiometry/Tympanometry files first to submit the consultation.");
                      setEntConsoleLogs(p => [...p, "SAFETY ERROR: Failed consultation finalize transaction. Mandatory tympanometry documents are unlinked."]);
                      return;
                    }

                    // Build post payload mock representation inside console logs
                    const submissionId = "ENT-" + Math.floor(Math.random() * 90000 + 10000);
                    setEntConsoleLogs(p => [
                      ...p,
                      `========================================`,
                      `📡 SUBMITTING PAYLOAD TO BACKEND CONTROLLER:`,
                      `POST /api/clinics/ent/consultations`,
                      `JSON Payload: {`,
                      `  "visitId": "${selectedPatient.id ? selectedPatient.id + '-visit' : 'UUID-907'}",`,
                      `  "patientId": "${selectedPatient.id}",`,
                      `  "consultationId": "${submissionId}",`,
                      `  "earExam": { "hearingImpairmentType": "${entHearingImpairment}", "tympanometryLeft": "${entTympanometryLeft}" },`,
                      `  "nasalExam": { "nasalSeptum": "${entNasalSeptum}", "turbinates": "${entTurbinates}" },`,
                      `  "diagnosesCount": ${entSelectedDiagnoses.length},`,
                      `  "prescriptionCount": ${entLocalPrescriptions.length}`,
                      `}`,
                      `JPA: Entity successfully persisted in PostgreSQL cluster (Status 201 Created)`,
                      `========================================`
                    ]);

                    // Trigger parent finalize logic
                    finalizeConsultation(`ENT split-workstation dossier completed. Mapped primary diagnostic terms: ${entSelectedDiagnoses.map(d=>d.code).join(", ")}. Otoscopy and audiometric data recorded.`);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-[0.98]"
                >
                  Save & Finalize ENT Workstation
                </button>
              </div>
            </div>
          </div>
        )}


        {selectedPatient.clinic === "Dental" && (
          <div className="space-y-6">
            {/* DENTAL HUB WARNING & DIRECTIVES CARD */}
            <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left w-full md:w-2/3">
                <span className="text-[10px] bg-[var(--clr-brand-blue)]/10 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Specialized Spatial Odontogram Console
                </span>
                <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1.5 leading-relaxed">
                  Click a tooth to focus and plot periodontal pocket logs. Paint clinical conditions directly onto Mesial, Distal, Occlusal, Buccal, or Lingual surfaces by selecting brushes below. Modified tooth configurations directly trigger Spring Boot JPA schema-driven transactions and append accounting ledger entries.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full md:w-1/3">
                <button
                  type="button"
                  onClick={() => {
                    // Quick seed normal mouth
                    const resetRecords: any = {};
                    for (let i = 1; i <= 32; i++) {
                      resetRecords[i] = {
                        toothNumber: i,
                        surfaces: [],
                        condition: "HEALTHY",
                        existingRestoration: "NONE",
                        proposedTreatmentCode: "",
                        status: "PLANNED"
                      };
                    }
                    setDentalToothRecords(resetRecords);
                    setDentalConsoleLogs(p => [...p, "Re-initialized complete Odontogram model to 32 HEALTHY adult teeth."]);
                  }}
                  className="px-3 py-1.5 bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 hover:bg-neutral-50 rounded-xl text-[11px] font-mono font-semibold text-neutral-600 transition"
                >
                  Clear All Marks
                </button>
              </div>
            </div>

            {/* TWO COLUMN SPATIAL WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: INTERACTIVE TOOTH MAPS (7/12) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* TOOTH PAINTER TOOLBAR */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Spatial Brush Matrix Selection
                    </span>
                    <div className="flex gap-1.5 bg-neutral-100 dark:bg-[#0E1019] p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-805">
                      <button
                        type="button"
                        onClick={() => setActiveDentalBrushMode("PATHOLOGY")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          activeDentalBrushMode === "PATHOLOGY"
                            ? "bg-white dark:bg-neutral-850 text-indigo-700 shadow-xs"
                            : "text-neutral-450 hover:text-neutral-700"
                        }`}
                      >
                        Pathology Paint (Red)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDentalBrushMode("RESTORATION")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          activeDentalBrushMode === "RESTORATION"
                            ? "bg-white dark:bg-neutral-850 text-sky-700 shadow-xs"
                            : "text-neutral-450 hover:text-neutral-700"
                        }`}
                      >
                        Restorations Paint (Blue)
                      </button>
                    </div>
                  </div>

                  {activeDentalBrushMode === "PATHOLOGY" ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveDiagnosisBrush("CARIES")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeDiagnosisBrush === "CARIES"
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                        Caries (Decay)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiagnosisBrush("FRACTURED")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeDiagnosisBrush === "FRACTURED"
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                        Fractured
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiagnosisBrush("ABSCESS")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeDiagnosisBrush === "ABSCESS"
                            ? "bg-red-50 dark:bg-red-950/40 border-red-400 text-red-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-700 block"></span>
                        Abscess
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiagnosisBrush("MISSING")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeDiagnosisBrush === "MISSING"
                            ? "bg-neutral-100 border-neutral-400 text-neutral-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 block"></span>
                        Missing Tooth [Arch Gap]
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDiagnosisBrush("HEALTHY")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeDiagnosisBrush === "HEALTHY"
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 text-teal-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 block"></span>
                        Healthy (Clear surfaces)
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveRestorationBrush("COMPOSITE")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeRestorationBrush === "COMPOSITE"
                            ? "bg-sky-50 dark:bg-sky-950/20 border-sky-400 text-sky-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-450 block"></span>
                        Composite (Tooth-color)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRestorationBrush("AMALGAM")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeRestorationBrush === "AMALGAM"
                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
                        Amalgam Filing (Metallic)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRestorationBrush("ROOT_CANAL")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeRestorationBrush === "ROOT_CANAL"
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span>
                        Root Canal (Endo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRestorationBrush("CROWN")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeRestorationBrush === "CROWN"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                        Prosthetic Crown
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRestorationBrush("IMPLANT")}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                          activeRestorationBrush === "IMPLANT"
                            ? "bg-[var(--clr-brand-blue)]/10 border-indigo-400 text-indigo-800 font-bold"
                            : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-neutral-550 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span>
                        Dental Implant Assembly
                      </button>
                    </div>
                  )}
                </div>

                {/* THE GRAPHICAL ODONTOGRAM (32 ADULT TEETH GRID) */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4 shadow-xs">
                  {/* UPPER MAXILLARY ARCH (Teeth 1 - 16) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                        Upper Maxillary Arch (Teeth 1 - 16)
                      </span>
                      <span className="text-[9px] font-sans text-neutral-400">Right to Left</span>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((idx) => {
                        const tooth = dentalToothRecords[idx] || {
                          toothNumber: idx,
                          surfaces: [],
                          condition: "HEALTHY",
                          existingRestoration: "NONE",
                          proposedTreatmentCode: ""
                        };
                        const isCaries = tooth.condition === "CARIES";
                        const isMissing = tooth.condition === "MISSING";
                        const isFractured = tooth.condition === "FRACTURED";
                        const isAbscess = tooth.condition === "ABSCESS";
                        const isRootCanal = tooth.existingRestoration === "ROOT_CANAL";
                        const isImplant = tooth.existingRestoration === "IMPLANT";
                        const isCrown = tooth.existingRestoration === "CROWN";
                        
                        const isSelected = selectedTooth === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedTooth(idx)}
                            className={`p-1 border rounded-xl flex flex-col items-center justify-between h-28 cursor-pointer select-none transition-all ${
                              isSelected
                                ? "bg-[var(--clr-brand-blue)]/10/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                                : "bg-[#FBFBF9]/30 dark:bg-[#0E1019]/40 border-[var(--clr-border-light)] dark:border-neutral-805 hover:bg-neutral-50/70"
                            }`}
                          >
                            <span className={`text-[11px] font-mono font-bold leading-none ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-450"}`}>
                              #{idx}
                            </span>

                            {/* Clickable Multi-Surface SVG Structure */}
                            {isMissing ? (
                              <div className="w-10 h-10 flex items-center justify-center">
                                <span className="text-neutral-350 dark:text-neutral-600 font-mono text-[9px] uppercase tracking-tighter line-through">
                                  Missing
                                </span>
                              </div>
                            ) : (
                              <svg className="w-10 h-10 select-none my-1" viewBox="0 0 24 24" fill="none">
                                {/* Buccal Surface (Top) */}
                                <path
                                  d="M0 0 L24 0 L17 7 L7 7 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("BUCCAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "BUCCAL"); }}
                                />
                                {/* Distal (Right) */}
                                <path
                                  d="M24 0 L17 7 L17 17 L24 24 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("DISTAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "DISTAL"); }}
                                />
                                {/* Lingual (Bottom) */}
                                <path
                                  d="M0 24 L24 24 L17 17 L7 17 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("LINGUAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "LINGUAL"); }}
                                />
                                {/* Mesial (Left) */}
                                <path
                                  d="M0 0 L7 7 L7 17 L0 24 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("MESIAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "MESIAL"); }}
                                />
                                {/* Occlusal (Center) */}
                                <path
                                  d="M7 7 L17 7 L17 17 L7 17 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("OCCLUSAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "OCCLUSAL"); }}
                                />

                                {/* Render explicit markers overlay */}
                                {isRootCanal && (
                                  <line x1="12" y1="3" x2="12" y2="21" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                                )}
                                {isImplant && (
                                  <path d="M12 4v16M9 8h6M10 12h4M11 16h2" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                                )}
                                {isCrown && (
                                  <rect x="5" y="5" width="14" height="14" rx="2" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
                                )}
                                {isAbscess && (
                                  <circle cx="12" cy="18" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" className="animate-ping" />
                                )}
                              </svg>
                            )}

                            <span className="text-[7.5px] font-mono tracking-tighter uppercase w-full truncate leading-none text-neutral-400 text-center">
                              {isMissing ? "MISSING" : tooth.condition !== "HEALTHY" ? tooth.condition : tooth.existingRestoration !== "NONE" ? tooth.existingRestoration : "HEALTHY"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LOWER MANDIBULAR ARCH (Teeth 17 - 32) */}
                  <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-805">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                        Lower Mandibular Arch (Teeth 17 - 32)
                      </span>
                      <span className="text-[9px] font-sans text-neutral-400">Left to Right</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
                      {Array.from({ length: 16 }, (_, i) => i + 17).map((idx) => {
                        const tooth = dentalToothRecords[idx] || {
                          toothNumber: idx,
                          surfaces: [],
                          condition: "HEALTHY",
                          existingRestoration: "NONE",
                          proposedTreatmentCode: ""
                        };
                        const isCaries = tooth.condition === "CARIES";
                        const isMissing = tooth.condition === "MISSING";
                        const isFractured = tooth.condition === "FRACTURED";
                        const isAbscess = tooth.condition === "ABSCESS";
                        const isRootCanal = tooth.existingRestoration === "ROOT_CANAL";
                        const isImplant = tooth.existingRestoration === "IMPLANT";
                        const isCrown = tooth.existingRestoration === "CROWN";
                        
                        const isSelected = selectedTooth === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedTooth(idx)}
                            className={`p-1 border rounded-xl flex flex-col items-center justify-between h-28 cursor-pointer select-none transition-all ${
                              isSelected
                                ? "bg-[var(--clr-brand-blue)]/10/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                                : "bg-[#FBFBF9]/30 dark:bg-[#0E1019]/40 border-[var(--clr-border-light)] dark:border-neutral-850 hover:bg-neutral-50/70"
                            }`}
                          >
                            <span className={`text-[11px] font-mono font-bold leading-none ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-450"}`}>
                              #{idx}
                            </span>

                            {/* Clickable Multi-Surface SVG Structure */}
                            {isMissing ? (
                              <div className="w-10 h-10 flex items-center justify-center">
                                <span className="text-neutral-350 dark:text-neutral-600 font-mono text-[9px] uppercase tracking-tighter line-through">
                                  Missing
                                </span>
                              </div>
                            ) : (
                              <svg className="w-10 h-10 select-none my-1" viewBox="0 0 24 24" fill="none">
                                {/* Buccal Surface (Top) */}
                                <path
                                  d="M0 0 L24 0 L17 7 L7 7 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("BUCCAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "BUCCAL"); }}
                                />
                                {/* Distal (Right) */}
                                <path
                                  d="M24 0 L17 7 L17 17 L24 24 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("DISTAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "DISTAL"); }}
                                />
                                {/* Lingual (Bottom) */}
                                <path
                                  d="M0 24 L24 24 L17 17 L7 17 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("LINGUAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "LINGUAL"); }}
                                />
                                {/* Mesial (Left) */}
                                <path
                                  d="M0 0 L7 7 L7 17 L0 24 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("MESIAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "MESIAL"); }}
                                />
                                {/* Occlusal (Center) */}
                                <path
                                  d="M7 7 L17 7 L17 17 L7 17 Z"
                                  className={`cursor-pointer stroke-neutral-250 dark:stroke-neutral-800 transition ${
                                    tooth.surfaces.includes("OCCLUSAL")
                                      ? tooth.condition === "CARIES"
                                        ? "fill-rose-500 hover:fill-rose-600"
                                        : tooth.condition === "FRACTURED"
                                          ? "fill-amber-500 hover:fill-amber-600"
                                          : tooth.condition === "ABSCESS"
                                            ? "fill-red-600 hover:fill-red-700"
                                            : tooth.existingRestoration === "AMALGAM"
                                              ? "fill-blue-500 hover:fill-blue-600"
                                              : "fill-sky-400 hover:fill-sky-500"
                                      : "fill-white dark:fill-neutral-900 hover:fill-neutral-100"
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); handleSurfaceClick(idx, "OCCLUSAL"); }}
                                />

                                {/* Render explicit markers overlay */}
                                {isRootCanal && (
                                  <line x1="12" y1="3" x2="12" y2="21" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                                )}
                                {isImplant && (
                                  <path d="M12 4v16M9 8h6M10 12h4M11 16h2" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                                )}
                                {isCrown && (
                                  <rect x="5" y="5" width="14" height="14" rx="2" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
                                )}
                                {isAbscess && (
                                  <circle cx="12" cy="18" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" className="animate-ping" />
                                )}
                              </svg>
                            )}

                            <span className="text-[7.5px] font-mono tracking-tighter uppercase w-full truncate leading-none text-neutral-400 text-center">
                              {isMissing ? "MISSING" : tooth.condition !== "HEALTHY" ? tooth.condition : tooth.existingRestoration !== "NONE" ? tooth.existingRestoration : "HEALTHY"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PERIODONTAL CHARTING & HEALTH INDEX MATRIX */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-805 pb-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      Periodontal Pathological Grid & Index
                    </span>
                    <span className="text-[10px] font-mono bg-neutral-100 dark:bg-[#0E1019] text-neutral-500 px-2.5 py-0.5 rounded-full">
                      Bone Socket Recession Tracker
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diagnostic General Toggles */}
                    <div className="space-y-3 p-3.5 bg-[#FBFBF9] dark:bg-[#0E1019]/60 border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-2xl">
                      <span className="text-[10px] font-bold text-neutral-405 uppercase block tracking-wider">Unified Periodontal Grading</span>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perioExam.gingivitis}
                            onChange={(e) => setPerioExam(p => ({ ...p, gingivitis: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold">Localized Marginal Gingivitis</span>
                            <span className="text-[10px] text-neutral-400 block">Erythema and edema without alveolar bone attachment loss.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={perioExam.periodontitis}
                            onChange={(e) => setPerioExam(p => ({ ...p, periodontitis: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold">Chronic Periodontitis</span>
                            <span className="text-[10px] text-neutral-400 block">Progressive attachment damage (pocket depths &ge; 4mm).</span>
                          </div>
                        </label>
                      </div>

                      <div className="pt-2 border-t border-neutral-154 dark:border-neutral-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-550">Max Pocket Depth Logged</span>
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{perioExam.pocketDepthMaxMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="9"
                          value={perioExam.pocketDepthMaxMm}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setPerioExam(p => ({ ...p, pocketDepthMaxMm: val, periodontitis: val >= 4 ? true : p.periodontitis }));
                            setDentalConsoleLogs(p => [...p, `[PERIO] Pocket depth ceiling updated to ${val}mm.`]);
                          }}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-neutral-450">
                          <span>1-3mm Normal</span>
                          <span>4mm Moderate</span>
                          <span>&ge; 7mm Critical</span>
                        </div>
                      </div>
                    </div>

                    {/* Pocket & Gingival Index parameters */}
                    <div className="space-y-3 p-3.5 bg-[#FBFBF9] dark:bg-[#0E1019]/60 border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-2xl">
                      <span className="text-[10px] font-bold text-neutral-405 uppercase block tracking-wider">Bleeding & Mobility Matrix</span>
                      <div className="space-y-3">
                        <div>
                          <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perioExam.bleedingOnProbing}
                              onChange={(e) => setPerioExam(p => ({ ...p, bleedingOnProbing: e.target.checked }))}
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <div>
                              <strong className="font-semibold">Bleeding on Probing (BOP)</strong>
                              <span className="text-[10px] text-neutral-450 block font-mono">Sulcular epithelium micro-ulceration indicator</span>
                            </div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-tiny uppercase font-mono text-neutral-400 mb-1">Tooth Mobility Index (Class III is Severe)</label>
                          <select
                            value={perioExam.mobilityGrade}
                            onChange={(e) => setPerioExam(p => ({ ...p, mobilityGrade: e.target.value }))}
                            className="w-full text-xs bg-white dark:bg-[#0B0E14] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-lg p-2 font-mono"
                          >
                            <option value="NONE">NONE (Physiologically anchored)</option>
                            <option value="CLASS_I">CLASS I (Horizontal mobility &le; 1mm)</option>
                            <option value="CLASS_II">CLASS II (Horizontal mobility &gt; 1mm)</option>
                            <option value="CLASS_III">CLASS III (Vertical and severe horizontal mobility)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soft Tissue & Mucosal Examination */}
                  <div className="p-3.5 bg-[#FBFBF9] dark:bg-[#0E1019]/60 border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Oral Mucosa & Tissue lesions</label>
                      <input
                        type="text"
                        value={perioExam.oralLesions}
                        onChange={(e) => setPerioExam(p => ({ ...p, oralLesions: e.target.value }))}
                        className="w-full text-xs bg-white dark:bg-[#0B0E14] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Tongue Exam Narratives</label>
                      <input
                        type="text"
                        value={perioExam.tongueExam}
                        onChange={(e) => setPerioExam(p => ({ ...p, tongueExam: e.target.value }))}
                        className="w-full text-xs bg-white dark:bg-[#0B0E14] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Palate & Mucosa Tones</label>
                      <input
                        type="text"
                        value={perioExam.mucosalExam}
                        onChange={(e) => setPerioExam(p => ({ ...p, mucosalExam: e.target.value }))}
                        className="w-full text-xs bg-white dark:bg-[#0B0E14] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Salivary Gland Drainage</label>
                      <input
                        type="text"
                        value={perioExam.salivaryGlands}
                        onChange={(e) => setPerioExam(p => ({ ...p, salivaryGlands: e.target.value }))}
                        className="w-full text-xs bg-white dark:bg-[#0B0E14] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: RADIOGRAPHY, TREATMENT PLANNING, REFERRALS, TERMINAL (5/12) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ADVANCED INTEGRATED X-RAY SCANNER WORKSTATION */}
                <div className="bg-[#121520] text-neutral-200 border border-neutral-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                    <span className="text-xs font-mono font-bold text-neutral-350 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      Diagnostic Radiography Console (Grayscale)
                    </span>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                      contrast_adjust
                    </span>
                  </div>

                  {/* Scanner Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-900 border border-neutral-805 rounded-xl">
                    {(["PERIAPICAL", "BITEWING", "OPG", "CBCT"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActiveXrayTab(tab);
                          if (tab === "PERIAPICAL") {
                            setXrayFindings("Tooth #14 root apices are close to right maxillary sinus floor with loss of lamina dura.");
                          } else if (tab === "BITEWING") {
                            setXrayFindings("Interproximal caries identified on distal surface of Tooth #14 penetrating enamel.");
                          } else if (tab === "OPG") {
                            setXrayFindings("OPG panoramic view suggests healthy mandibular angle with unerupted impacted Tooth #16.");
                          } else {
                            setXrayFindings("CBCT three-dimensional slices highlight localized osteolytic alveolar border changes.");
                          }
                        }}
                        className={`py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                          activeXrayTab === tab
                            ? "bg-cyan-950 text-cyan-450 border border-cyan-800"
                            : "text-neutral-500 hover:text-neutral-350"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Simulated Image Viewer Canvas (Controlled Filters) */}
                  <div className="relative border border-neutral-800 rounded-2xl bg-black h-48 overflow-hidden flex items-center justify-center">
                    {/* Crosshair cursor overlays */}
                    <div className="absolute inset-0 border border-dashed border-cyan-950/40 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px border-t border-neutral-800/50 pointer-events-none"></div>
                    <div className="absolute top-0 left-1/2 w-px h-full border-l border-neutral-800/50 pointer-events-none"></div>

                    {/* Grayscale Visualizer (Changes based on filters) */}
                    <div
                      style={{
                        filter: `brightness(${xrayBrightness}%) contrast(${xrayContrast}%) ${xrayInvert ? 'invert(1)' : 'invert(0)'}`,
                        transform: `scale(${xrayZoom})`
                      }}
                      className="transition-all duration-150 transform w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-neutral-950 to-neutral-900"
                    >
                      <svg className="w-24 h-24 text-neutral-600 dark:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-mono font-bold text-neutral-500 tracking-wider">
                        {activeXrayTab} IMAGE FRAME (100kV - 15mA - 0.2s)
                      </span>
                      <span className="text-[8px] font-mono text-neutral-650 block mt-1">
                        Filters: B:{xrayBrightness}% C:{xrayContrast}% I:{xrayInvert ? "Yes":"No"} Z:{xrayZoom}x
                      </span>
                    </div>

                    <span className="absolute bottom-2.5 left-2.5 text-[8px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900 leading-none">
                      LATERAL RIGHT
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 text-[8px] font-mono text-neutral-450 leading-none">
                      ISO-9001 PROOF
                    </span>
                  </div>

                  {/* Dynamic Hardware adjusters */}
                  <div className="grid grid-cols-2 gap-3.5 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>Brightness</span>
                        <span>{xrayBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={xrayBrightness}
                        onChange={(e) => setXrayBrightness(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>Contrast Mapping</span>
                        <span>{xrayContrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={xrayContrast}
                        onChange={(e) => setXrayContrast(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between col-span-2 pt-1 border-t border-neutral-850">
                      <button
                        type="button"
                        onClick={() => setXrayInvert(p => !p)}
                        className={`px-2.5 py-1 rounded-md border text-[9px] transition-all font-mono font-bold ${
                          xrayInvert
                            ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                            : "bg-neutral-900 border-neutral-805 text-neutral-400 hover:text-white"
                        }`}
                      >
                        Invert Grayscale LUT
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Zoom Focus:</span>
                        <select
                          value={xrayZoom}
                          onChange={(e) => setXrayZoom(parseFloat(e.target.value))}
                          className="bg-neutral-900 border border-neutral-805 rounded text-[10px] p-1 text-cyan-400 font-mono"
                        >
                          <option value="1">1.0x Normal</option>
                          <option value="1.5">1.5x Medium</option>
                          <option value="2">2.0x High Close</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Findings interpretation narrative */}
                  <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-2xl">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 block mb-1">AUTOMATED DETECT / SURGEON NOTES:</span>
                    <p className="text-[11px] text-neutral-400 font-mono leading-relaxed">
                      {xrayFindings}
                    </p>
                  </div>
                </div>

                {/* ACTIVE TOOTH MANIPULATOR PANEL */}
                {selectedTooth !== null && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                        Focus Matrix Parameters: Tooth #{selectedTooth}
                      </span>
                      <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono">
                        {dentalToothRecords[selectedTooth]?.condition || "HEALTHY"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Modify Condition</span>
                        <select
                          value={dentalToothRecords[selectedTooth]?.condition || "HEALTHY"}
                          onChange={(e) => {
                            const term = e.target.value;
                            const currentResto = dentalToothRecords[selectedTooth]?.existingRestoration || "NONE";
                            const surfaces = dentalToothRecords[selectedTooth]?.surfaces || [];
                            let fee = 0;
                            let code = "";
                            if (term === "CARIES") {
                              code = surfaces.length >= 2 ? "D2392" : "D2391";
                              fee = surfaces.length >= 2 ? 175 : 120;
                            } else if (term === "MISSING") {
                              code = "D7140";
                              fee = 190;
                            }
                            applyToothStatusDirect(selectedTooth, term, currentResto, "PLANNED", code, fee);
                          }}
                          className="w-full text-xs font-mono bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl p-2"
                        >
                          <option value="HEALTHY">HEALTHY</option>
                          <option value="CARIES">CARIES (Decay/Cavity)</option>
                          <option value="MISSING">MISSING (Extracted)</option>
                          <option value="FRACTURED">FRACTURED (Broken coronal aspect)</option>
                          <option value="ABSCESS">ABSCESS (Periapical Infection)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Modify Restoration</span>
                        <select
                          value={dentalToothRecords[selectedTooth]?.existingRestoration || "NONE"}
                          onChange={(e) => {
                            const term = e.target.value;
                            const currentCond = dentalToothRecords[selectedTooth]?.condition || "HEALTHY";
                            let fee = 0;
                            let code = "";
                            if (term === "ROOT_CANAL") {
                              code = "D3330";
                              fee = 450;
                            } else if (term === "CROWN") {
                              code = "D2750";
                              fee = 850;
                            } else if (term === "IMPLANT") {
                              code = "D6010";
                              fee = 1500;
                            }
                            applyToothStatusDirect(selectedTooth, currentCond, term, "COMPLETED", code, fee);
                          }}
                          className="w-full text-xs font-mono bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl p-2"
                        >
                          <option value="NONE">NONE</option>
                          <option value="COMPOSITE">COMPOSITE Restored</option>
                          <option value="AMALGAM">AMALGAM Restored</option>
                          <option value="ROOT_CANAL">ROOT CANAL (Endo Complete)</option>
                          <option value="CROWN">PROSTHETIC CROWN</option>
                          <option value="IMPLANT">EMBEDDED COBALT IMPLANT</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-2xl flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Linked Procedural Code:</span>
                      <span className="font-bold text-indigo-700 bg-[var(--clr-brand-blue)]/10 border border-indigo-200 px-2.5 py-0.5 rounded-lg text-xs leading-none dark:bg-indigo-950 dark:text-indigo-300">
                        {dentalToothRecords[selectedTooth]?.proposedTreatmentCode || "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {/* ADVANCED CDT PROCEDURE TREATMENT PLANNING */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide block pb-2 border-b border-neutral-100">
                    Phased Clinical Treatment Planner
                  </span>

                  <div className="space-y-3">
                    <div className="text-xs p-3.5 bg-neutral-50 rounded-2xl space-y-2">
                      <div className="flex md:items-center justify-between gap-1.5 flex-col md:flex-row">
                        <span className="font-bold text-neutral-700 font-sans">Sequence Phase 1: Urgent Therapy</span>
                        <span className="text-[10px] font-mono text-neutral-400">Acute Relief priority</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-normal font-serif">
                        Emergency pulpectomy and root canal on infected Tooth #14 roots to arrest localized maxillary sinus floor perforation. Follow-up porcelain fused crown.
                      </p>
                    </div>

                    <div className="text-xs p-3.5 bg-neutral-50 rounded-2xl space-y-2">
                      <div className="flex md:items-center justify-between gap-1.5 flex-col md:flex-row">
                        <span className="font-bold text-neutral-700 font-sans">Sequence Phase 2: Restorative Maintenance</span>
                        <span className="text-[10px] font-mono text-neutral-400">Functional Stability</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-normal font-serif">
                        Comprehensive quad debridement, scaling and deep root planing (D4341) to normalize average pocket depths.
                      </p>
                    </div>
                  </div>
                </div>

                {/* REFERRED INTER-CLINIC ROUTING STATION */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Inter-Clinic Handover Dispatcher
                    </span>
                    <span className="text-[10px] text-neutral-450 font-mono font-bold">
                      SINUS INTERFACE ACCORD
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs text-neutral-650">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Target Specialist cost center</label>
                      <select
                        value={dentalReferralTarget}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDentalReferralTarget(val);
                          if (val === "ENT") {
                            setDentalReferralReason("Evaluate right maxillary sinus proximity to infected tooth #14 roots. Suspected odontogenic sinusitis.");
                          } else if (val === "MEDICINE") {
                            setDentalReferralReason("Secure medical clearance prior to oral surgery. Patient has uncontrolled hypertension and active diabetes Mellitus.");
                          } else {
                            setDentalReferralReason("Evaluate orbital floor mechanical boundaries following localized maxillofacial traumatic impact.");
                          }
                        }}
                        className="w-full text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl p-2 font-mono"
                      >
                        <option value="ENT">ENT Clinic Cluster (Maxillary Antrum / Sinus check)</option>
                        <option value="MEDICINE">General Medicine Specialists (Surgery Clearance)</option>
                        <option value="ORBIT">Ophthalmic Specialist (Orbital Floor Blowout Evaluate)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Priority urgency</label>
                        <select
                          value={dentalReferralUrgency}
                          onChange={(e) => setDentalReferralUrgency(e.target.value)}
                          className="w-full text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl p-2 font-mono"
                        >
                          <option value="ROUTINE">ROUTINE (3-5 days)</option>
                          <option value="URGENT">URGENT (24 Hours)</option>
                          <option value="STAT">STAT / EMERGENCY (Immediate)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDentalConsoleLogs(p => [
                              ...p,
                              `[ROUTING ENGINE ACTIVATED] Dispatched handover referral to ${dentalReferralTarget} cost center. Handover tracking ledger ticket secured.`
                            ]);
                            alert(`Specialist referral to ${dentalReferralTarget} successfully queued.`);
                          }}
                          className="w-full py-2 border border-dashed border-indigo-400/80 hover:bg-[var(--clr-brand-blue)]/10/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-center font-bold text-[11px] h-9"
                        >
                          Send Referral Handover
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Clinic Handover notes</label>
                      <textarea
                        value={dentalReferralReason}
                        onChange={(e) => setDentalReferralReason(e.target.value)}
                        className="w-full text-xs bg-[#FBFBF9] dark:bg-[#0E1019] border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl p-2 h-16 font-serif select-none outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* TARGETED DENTAL rx E-PRESCRIBING FORMULARY */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                      E-Prescribing Formularies & Regimens
                    </span>
                    <span className="text-[10px] text-teal-600 font-mono font-bold">
                      INVENTORY SYNCED
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Presets and Prophylaxis buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const prophylaxisRx = {
                            drugFormularyId: "6aab78f2-89b1-419b-bc3b-73a70baaa903",
                            drugName: "Amoxicillin 500mg capsules (Pre-op Prophylaxis)",
                            dosage: "2000mg (4x 500mg)",
                            frequency: "Single Dose",
                            durationDays: 1,
                            administrationRoute: "ORAL",
                            specialInstructions: "Take 4 capsules orally exactly 1 hour prior to major root canal or surgical extraction (IE Prevention)."
                          };
                          setDentalPrescriptions(prev => {
                            // avoid double add
                            if (prev.some(r => r.drugFormularyId === prophylaxisRx.drugFormularyId)) return prev;
                            return [prophylaxisRx, ...prev];
                          });
                          setDentalConsoleLogs(p => [
                            ...p,
                            "[FORMULARY PRESCRIPTION] Added infective endocarditis prophylaxis single antibiotic dose script."
                          ]);
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-mono font-bold bg-amber-50 text-amber-800 hover:bg-amber-100/60 transition rounded-xl border border-amber-200"
                      >
                        ⚡ IE Pre-Op Prophylaxis Preset
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const painRx = {
                            drugFormularyId: "6aab78f2-89b1-419b-bc3b-73a70baaa904",
                            drugName: "Ibuprofen 600mg Therapeutic Tablet",
                            dosage: "600mg",
                            frequency: "TID",
                            durationDays: 5,
                            administrationRoute: "ORAL",
                            specialInstructions: "Take with meal for post-procedure surgical pain. Stop if gastrointestinal discomfort noted."
                          };
                          setDentalPrescriptions(prev => {
                            if (prev.some(r => r.drugFormularyId === painRx.drugFormularyId)) return prev;
                            return [...prev, painRx];
                          });
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-mono font-bold bg-[var(--clr-brand-blue)]/10 text-indigo-800 hover:bg-indigo-100/60 transition rounded-xl border border-indigo-200"
                      >
                        ＋ Post-Op Pain Relief Preset
                      </button>
                    </div>

                    {/* Active prescription list representation */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {dentalPrescriptions.map((rx, rxIdx) => (
                        <div key={rx.drugFormularyId || rxIdx} className="text-xs p-3 bg-[#FBFBF9] dark:bg-[#000000]/25 border border-[var(--clr-border-light)] dark:border-neutral-805 rounded-xl space-y-1 relative">
                          <button
                            type="button"
                            onClick={() => {
                              setDentalPrescriptions(prev => prev.filter((_, idx2) => idx2 !== rxIdx));
                              setDentalConsoleLogs(p => [...p, `[PRESCRIPTION REMOVED] Cleared active drug: ${rx.drugName}`]);
                            }}
                            className="absolute top-2.5 right-3 text-neutral-450 hover:text-red-650 font-bold"
                          >
                            ✕
                          </button>
                          <div className="font-bold text-neutral-700 font-mono pr-5">{rx.drugName}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Sig: {rx.dosage} • {rx.frequency} • {rx.administrationRoute} • Duration: {rx.durationDays} Days
                          </div>
                          <div className="text-[9.5px] italic text-[#F59E0B] font-serif leading-none">
                            * {rx.specialInstructions}
                          </div>
                        </div>
                      ))}
                      {dentalPrescriptions.length === 0 && (
                        <div className="text-xs font-mono py-6 text-center text-neutral-400 italic bg-neutral-50/50 border border-[var(--clr-border-light)] rounded-xl">
                          Dental pharmacologic stack empty. Toggle buttons above to populate prescriptions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* THE TRANSACTIONAL LEDGER & SPRING-BOOT CONTROLLER CONSOLE TERMINAL */}
                <div className="bg-[#0B0E14] text-neutral-300 border border-neutral-850 p-5 rounded-3xl space-y-3.5 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      Spring-Boot DB Transaction Logs
                    </span>
                    <span className="text-[9px] font-mono text-indigo-400">JPA Active</span>
                  </div>

                  <div className="bg-black/85 p-3 rounded-2xl border border-neutral-900 h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 leading-relaxed text-gray-300 select-all scrollbar-thin scrollbar-thumb-neutral-800">
                    {dentalConsoleLogs.map((logStr, i) => (
                      <div key={i} className="text-neutral-400">
                        <span className="text-indigo-400 mr-1.5">postgres@hosp-cluster:~$</span>
                        {logStr}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* REAL-TIME DENTAL LEDGER AUTO-FEE FEEDBACK PANEL */}
            <div className="bg-[#FBFBF9] dark:bg-[#0E1019]/60 p-4 rounded-3xl border border-[var(--clr-border-light)] dark:border-[var(--clr-border-light)]/15 space-y-2">
              <span className="font-bold text-xs block text-neutral-800 dark:text-neutral-350 font-sans uppercase tracking-wide">
                Direct Synchronized Dental Billing Ledger (Spring Auto-Injector)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {selectedPatient.billingLedger
                  .filter((item) => item.serviceName.includes("Tooth #") || item.category === "DentalSurgical")
                  .map((item) => (
                    <div key={item.id} className="text-[10.5px] font-mono flex justify-between items-center p-2.5 bg-white dark:bg-neutral-900 border border-[var(--clr-border-light)] dark:border-neutral-805 text-neutral-600 dark:text-neutral-300 rounded-xl leading-none">
                      <div className="truncate max-w-[85%]">
                        <span className="text-indigo-500 font-bold mr-1">✓</span>
                        {item.serviceName}
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-450 shrink-0 ml-1">${item.amount}</span>
                    </div>
                  ))}
                {selectedPatient.billingLedger.filter((item) => item.serviceName.includes("Tooth #") || item.category === "DentalSurgical").length === 0 && (
                  <div className="text-xs text-neutral-400 italic text-center py-2 col-span-4 h-8 flex items-center justify-center">
                    No active dental surgeries plotted. Click teeth boundaries to trigger Spring Boot direct billing injector.
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOR CONSULTATION SUBMISSION */}
            <div className="pt-3 border-t border-[var(--clr-border-light)] flex justify-between items-center gap-4 bg-white/50 dark:bg-neutral-900/15 p-4 rounded-3xl">
              <span className="text-tiny text-neutral-400 italic pr-3">
                Dental consult files automatically align inside clinic_dental tables under verified transactional locks.
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const submissionId = "DENT-" + Math.floor(Math.random() * 90000 + 10000);
                    
                    // Build odontogram record payload out of local dentalToothRecords state
                    const odontogramRecordsList = Object.values(dentalToothRecords).filter((t: any) => t.surfaces.length > 0 || t.condition !== "HEALTHY" || t.existingRestoration !== "NONE");

                    const diagnosesPayload = odontogramRecordsList.map((t: any) => ({
                      icd10Code: t.condition === "CARIES" ? "K02.62" : t.condition === "MISSING" ? "K08.409" : "K05.2",
                      diagnosisType: "PRIMARY",
                      clinicalStatus: "CONFIRMED"
                    }));

                    setDentalConsoleLogs(p => [
                      ...p,
                      `==================================================`,
                      `📡 SUBMITTING PAYLOAD TO BACKEND CONTROLLER:`,
                      `POST /api/clinics/dental/consultations`,
                      `JSON Payload: {`,
                      `  "visitId": "${selectedPatient.id ? selectedPatient.id + '-visit' : 'UUID-907'}",`,
                      `  "patientId": "${selectedPatient.id}",`,
                      `  "consultationId": "${submissionId}",`,
                      `  "odontogramRecords": ${JSON.stringify(odontogramRecordsList, null, 2)},`,
                      `  "periodontalExam": {`,
                      `    "gingivitis": ${perioExam.gingivitis},`,
                      `    "periodontitis": ${perioExam.periodontitis},`,
                      `    "pocketDepthMaxMm": ${perioExam.pocketDepthMaxMm},`,
                      `    "bleedingOnProbing": ${perioExam.bleedingOnProbing},`,
                      `    "mobilityGrade": "${perioExam.mobilityGrade}"`,
                      `  },`,
                      `  "diagnoses": ${JSON.stringify(diagnosesPayload)},`,
                      `  "referrals": [ { "targetClinicCode": "${dentalReferralTarget}", "urgency": "${dentalReferralUrgency}", "reasonForReferral": "${dentalReferralReason}" } ],`,
                      `  "prescriptionsCount": ${dentalPrescriptions.length},`,
                      `  "followUpIntervalDays": 180`,
                      `}`,
                      `JPA: Entity successfully persisted in PostgreSQL cluster (Status 201 Created)`,
                      `SYSTEM: Inter-clinic referral and medication packages dispatched successfully.`,
                      `==================================================`
                    ]);

                    finalizeConsultation(`Dental consult completed. Odontogram mapped. Maximum pocket depth: ${perioExam.pocketDepthMaxMm} mm. Referral to ${dentalReferralTarget} cost center filed.`);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-[0.98]"
                >
                  Save & Finalize Dental Consultation
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Retina" && (
          <div className="space-y-6" id="retina_workstation_wrapper">
            {/* SPECIALIST TITLE BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-150 dark:border-neutral-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse"></span>
                  Macula & Retina Pathology Workstation (Vitreoretinal Suite)
                </h4>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Tertiary multimodal imaging terminal. Custom anti-VEGF progress mapping & immediate downstream lasers.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-150 dark:border-cyan-900/50 font-mono px-2.5 py-1 rounded-lg">
                  PATIENT ID: <strong>{selectedPatient.id}</strong>
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/50 font-mono px-2.5 py-1 rounded-lg flex items-center font-bold">
                  ● FLUID-DIALYSIS LINKED
                </span>
              </div>
            </div>

            {/* DILATION STATUS GATE & TIMING TRACKER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="retina_stage1_grid">
              
              {/* Dilation & View Control Panel (Col span 4) */}
              <div className="md:col-span-4 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs hover:shadow-[0_0_20px_rgba(79,70,229,0.05)] transition duration-300" id="retina_dilation_card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono">
                    1. Mydriasis Lifecycle
                  </span>
                  {clinicState.dilationCompleted ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ READY FOR SCAN
                    </span>
                  ) : (
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 font-bold px-2 py-0.5 rounded-full border border-cyan-200 animate-pulse">
                      ⏳ TIMING GATED
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Instillation drops logging */}
                  <div className="bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Mydriatic Agent:</span>
                      <select
                        id="retina_mydriatic_agent"
                        value={dilationAgent}
                        onChange={(e) => setDilationAgent(e.target.value)}
                        className="text-[11px] font-medium border border-neutral-200 rounded p-1 bg-[var(--clr-bg-card)] text-neutral-700 dark:text-neutral-200 focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="Tropicamide 1% + Phenylephrine 2.5%">Tropicamide 1% + Phenylephrine 2.5%</option>
                        <option value="Cyclopentolate 1%">Cyclopentolate 1%</option>
                        <option value="Atropine 1% drops">Atropine 1% drops</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Qualitative View Rating:</span>
                      <select
                        id="retina_view_quality"
                        value={viewQuality}
                        onChange={(e) => setViewQuality(e.target.value)}
                        className="text-[11px] font-medium border border-neutral-200 rounded p-1 bg-[var(--clr-bg-card)] text-neutral-700 dark:text-neutral-200 focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="EXCELLENT">Excellent Clear Media</option>
                        <option value="HAZY">Hazy (Cataractous)</option>
                        <option value="POOR">Poor (Vitreous Opacity)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Drops Instilled At:</span>
                      <span className="font-mono bg-white dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-150 font-bold text-neutral-700 dark:text-neutral-300">
                        {mydriasisInstantTime || "18:22 (Logged on clinical intake)"}
                      </span>
                    </div>
                  </div>

                  {/* Countdown widget */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-2xl border border-[var(--clr-border-light)] text-xs">
                    {clinicState.dilationCompleted ? (
                      <div className="space-y-1.5">
                        <p className="text-[#0D9488] dark:text-[#2BBFFF] font-semibold flex items-center gap-1.5">
                          ✓ Optical pathways cleared.
                        </p>
                        <p className="text-[10px] text-neutral-500 leading-normal">
                          Maximal therapeutic pupillary dilation achieved. Structural photocoagulation & macula scanning are now fully hot-mapped.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">Mydriasis Countdown (20m):</span>
                          <span className="font-mono font-bold text-[13px] text-cyan-700 dark:text-cyan-400 bg-[var(--clr-bg-card)] border border-cyan-150 px-2 py-0.5 rounded shadow-tiny">
                            {Math.floor(clinicState.dilationSecondsRemaining / 60)}m{" "}
                            {clinicState.dilationSecondsRemaining % 60}s
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            id="retina_toggle_dilation_timer"
                            type="button"
                            onClick={() => {
                              setClinicState((p) => ({ ...p, dilationTimerActive: !p.dilationTimerActive }));
                              if (!mydriasisInstantTime) {
                                setMydriasisInstantTime(new Date().toLocaleTimeString().slice(0, 5));
                              }
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-tiny font-bold font-mono shadow-xs transition duration-200 active:scale-[0.98] ${
                              clinicState.dilationTimerActive 
                                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                                : "bg-cyan-600 hover:bg-cyan-700 text-white"
                            }`}
                          >
                            {clinicState.dilationTimerActive ? "Pause Timer" : "Start Dilation Timer"}
                          </button>
                          <button
                            id="retina_fast_track_dilation"
                            type="button"
                            onClick={() => {
                              setClinicState((p) => ({
                                ...p,
                                dilationSecondsRemaining: 0,
                                dilationCompleted: true
                              }));
                              if (!mydriasisInstantTime) {
                                setMydriasisInstantTime(new Date().toLocaleTimeString().slice(0, 5));
                              }
                            }}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400 rounded-lg text-tiny font-bold font-mono transition duration-200 active:scale-[0.98]"
                          >
                            ⚡ Skip Lock
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OCT CST trend visual charting over time (Col span 8) */}
              <div className="md:col-span-8 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs flex flex-col justify-between" id="retina_cst_trend_card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono block">
                      2. Central Subfield Thickness (CST) Chronological Tracker
                    </span>
                    <span className="text-[10px] text-neutral-400">Evaluating anatomical response to intravitreal loading protocols</span>
                  </div>
                  
                  {/* Real-time interactive dials */}
                  <div className="flex gap-2">
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-150 flex items-center gap-1">
                      <span className="text-[9px] font-bold font-mono text-cyan-600">OD (R):</span>
                      <input 
                        id="retina_cst_od_input"
                        type="number" 
                        value={cstOD} 
                        onChange={(e) => {
                          const val = Math.max(100, Math.min(1000, parseInt(e.target.value) || 200));
                          setCstOD(val);
                        }}
                        className="w-12 text-[11px] font-mono font-bold bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-0 text-center"
                      />
                      <span className="text-[9px] text-[#A3A3A3]">μm</span>
                    </div>

                    <div className="bg-fuchsia-100/30 dark:bg-fuchsia-950/10 p-1.5 rounded-xl border border-fuchsia-150 flex items-center gap-1">
                      <span className="text-[9px] font-bold font-mono text-fuchsia-600">OS (L):</span>
                      <input 
                        id="retina_cst_os_input"
                        type="number" 
                        value={cstOS} 
                        onChange={(e) => {
                          const val = Math.max(100, Math.min(1000, parseInt(e.target.value) || 200));
                          setCstOS(val);
                        }}
                        className="w-12 text-[11px] font-mono font-bold bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-0 text-center"
                      />
                      <span className="text-[9px] text-[#A3A3A3]">μm</span>
                    </div>
                  </div>
                </div>

                {/* SVG Trend Chart Engine */}
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-950/20 rounded-2xl border border-neutral-150 p-3 flex flex-col justify-between min-h-[140px] relative">
                  
                  {/* Microns axis guide lines */}
                  <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-t border-dashed border-neutral-300 text-[8px] font-mono pl-1 text-neutral-400">600 μm</div>
                    <div className="border-t border-dashed border-neutral-300 text-[8px] font-mono pl-1 text-neutral-400">400 μm</div>
                    <div className="border-t border-dashed border-neutral-300 text-[8px] font-mono pl-1 text-neutral-400">200 μm</div>
                  </div>

                  {/* High Fidelity SVG plotting */}
                  <div className="w-full h-[110px] z-10 relative">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Define Gradients */}
                      <defs>
                        <radialGradient id="odDotGlow">
                          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="osDotGlow">
                          <stop offset="0%" stopColor="#D946EF" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#D946EF" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Helper functions for Y mapping: (microns range from 200 to 600 map to Y 85 to 15) */}
                      {(() => {
                        const getScaleY = (m: number) => {
                          const capped = Math.max(200, Math.min(600, m));
                          return 85 - ((capped - 200) / 400) * 70;
                        };

                        const od_p1 = getScaleY(275);
                        const od_p2 = getScaleY(268);
                        const od_pToday = getScaleY(cstOD);

                        const os_p1 = getScaleY(585);
                        const os_p2 = getScaleY(540);
                        const os_pToday = getScaleY(cstOS);

                        return (
                          <g>
                            {/* Lines for OD (Right Eye) */}
                            <path 
                              d={`M 50 ${od_p1} L 150 ${od_p2} L 250 ${od_pToday}`} 
                              fill="none" 
                              stroke="#0D9488" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                            {/* Lines for OS (Left Eye with edema) */}
                            <path 
                              d={`M 50 ${os_p1} L 150 ${os_p2} L 250 ${os_pToday}`} 
                              fill="none" 
                              stroke="#D946EF" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />

                            {/* Circles and values for OD */}
                            <circle cx="50" cy={od_p1} r="4" fill="#0D9488" stroke="#fff" strokeWidth="1" />
                            <text x="50" y={od_p1 - 8} fill="#097D6C" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">275</text>

                            <circle cx="150" cy={od_p2} r="4" fill="#0D9488" stroke="#fff" strokeWidth="1" />
                            <text x="150" y={od_p2 - 8} fill="#097D6C" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">268</text>

                            <circle cx="250" cy={od_pToday} r="5.5" fill="#0D9488" stroke="#fff" strokeWidth="1.5" className="cursor-pointer" />
                            <text x="250" y={od_pToday - 8} fill="#097D6C" fontSize="7.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">{cstOD}</text>

                            {/* Circles and values for OS */}
                            <circle cx="50" cy={os_p1} r="4" fill="#D946EF" stroke="#fff" strokeWidth="1" />
                            <text x="50" y={os_p1 - 8} fill="#C026D3" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">585</text>

                            <circle cx="150" cy={os_p2} r="4" fill="#D946EF" stroke="#fff" strokeWidth="1" />
                            <text x="150" y={os_p2 - 8} fill="#C026D3" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">540</text>

                            <circle cx="250" cy={os_pToday} r="5.5" fill="#D946EF" stroke="#fff" strokeWidth="1.5" />
                            <text x="250" y={os_pToday - 8} fill="#C026D3" fontSize="7.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">{cstOS}</text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Horizontal timeline labels */}
                  <div className="flex justify-between px-10 text-[9px] font-semibold text-neutral-400 font-mono border-t border-neutral-100 pt-1">
                    <span className="flex flex-col items-center">
                      <span>2 MONTHS AGO</span>
                      <span className="text-[7.5px] font-normal opacity-85">Eylea 2.0mg OS</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span>1 MONTH AGO</span>
                      <span className="text-[7.5px] font-normal opacity-85">Eylea 2.0mg OS</span>
                    </span>
                    <span className="flex flex-col items-center text-teal-700 dark:text-teal-400 font-bold">
                      <span>TODAY (EVAL)</span>
                      <span className="text-[7.5px] font-semibold opacity-95">Anti-VEGF Pending</span>
                    </span>
                  </div>
                </div>

                {/* Calculated Response metric block */}
                <div className="mt-2.5 flex items-center justify-between text-tiny pt-2 border-t border-neutral-100 font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-400">Total OS Reduction:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      -{585 - cstOS} μm ({(((585 - cstOS) / 585) * 100).toFixed(1)}% Resolution)
                    </span>
                  </div>
                  <span className="text-neutral-400">Clinical Status: <strong className="font-extrabold text-[#D946EF] uppercase">Resolving CME</strong></span>
                </div>
              </div>
            </div>

            {/* SEGMENT EXAMS MATRIX & FUNDUS LESION PLOTTER (PUPIL GATED VIEW CONTAINER) */}
            <div className="relative group/lock" id="retina_gated_block">
              {/* If not dilated, overlay a premium warning barrier in clinical colors */}
              {!clinicState.dilationCompleted && (
                <div className="absolute inset-0 bg-neutral-900/85 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center p-6 text-center rounded-3xl" id="retina_pupil_barrier">
                  <div className="bg-[var(--clr-bg-card)] p-6 rounded-3xl shadow-2xl max-w-sm border border-cyan-200 dark:border-cyan-900 flex flex-col items-center">
                    <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-full flex items-center justify-center mb-3 text-cyan-600">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <h5 className="font-sans font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Mydriatic Lock In Place</h5>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 leading-relaxed">
                      To safeguard active macular structures from excessive scanning light and secure optical clearance, the clinical matrix remains gated until the 20-minute dilation timer has run down.
                    </p>
                    <button
                      id="retina_barrier_unlocked"
                      type="button"
                      onClick={() =>
                        setClinicState((p) => ({
                          ...p,
                          dilationSecondsRemaining: 0,
                          dilationCompleted: true
                        }))
                      }
                      className="mt-4 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
                    >
                      ⚡ Bypass and Map Retinal Segment
                    </button>
                  </div>
                </div>
              )}

              {/* TWO COLUMN ROW: ASYMMETRIC GRID & PLOTTER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Asymmetric Posterior Segment Examination (Col span 8) */}
                <div className="lg:col-span-8 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs" id="retina_segment_matrix_card">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono block mb-3">
                    3. Asymmetric Bilateral Posterior Segment Exam matrix
                  </span>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300 border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--clr-border-light)] text-[10px] font-bold text-neutral-400 dark:text-neutral-500 font-mono">
                          <th className="py-2.5 w-1/5">ANATOMICAL FIELD</th>
                          <th className="py-2.5 w-2/5">OD (RIGHT EYE) PARAMETERS</th>
                          <th className="py-2.5 w-2/5">OS (LEFT EYE) TARGETED PARAMETERS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850 font-sans">
                        {/* Vitreous */}
                        <tr>
                          <td className="py-2.5 font-bold text-xs pr-2">Vitreous Humour</td>
                          <td className="py-1.5 pr-2">
                            <input 
                              id="retina_vit_od"
                              type="text" 
                              value={vitreousExamOD} 
                              onChange={(e) => setVitreousExamOD(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1"
                            />
                          </td>
                          <td className="py-1.5">
                            <input 
                              id="retina_vit_os"
                              type="text" 
                              value={vitreousExamOS} 
                              onChange={(e) => setVitreousExamOS(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1 focus:ring-1 focus:ring-fuchsia-400"
                            />
                          </td>
                        </tr>

                        {/* Optic Disc */}
                        <tr>
                          <td className="py-2.5 font-bold text-xs pr-2">Optic Nerve Head</td>
                          <td className="py-1.5 pr-2">
                            <input 
                              id="retina_disc_od"
                              type="text" 
                              value={opticDiscOD} 
                              onChange={(e) => setOpticDiscOD(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1"
                            />
                          </td>
                          <td className="py-1.5">
                            <input 
                              id="retina_disc_os"
                              type="text" 
                              value={opticDiscOS} 
                              onChange={(e) => setOpticDiscOS(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1 focus:ring-1 focus:ring-fuchsia-400"
                            />
                          </td>
                        </tr>

                        {/* Macula */}
                        <tr>
                          <td className="py-2.5 font-bold text-xs pr-2 text-[#D946EF]">Macula Contour</td>
                          <td className="py-1.5 pr-2">
                            <input 
                              id="retina_macula_od"
                              type="text" 
                              value={maculaOD} 
                              onChange={(e) => setMaculaOD(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1"
                            />
                          </td>
                          <td className="py-1.5">
                            <input 
                              id="retina_macula_os"
                              type="text" 
                              value={maculaOS} 
                              onChange={(e) => setMaculaOS(e.target.value)}
                              className="w-full text-xs bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border border-fuchsia-200 rounded p-1 focus:ring-1 focus:ring-fuchsia-400"
                            />
                          </td>
                        </tr>

                        {/* Vessels */}
                        <tr>
                          <td className="py-2.5 font-bold text-xs pr-2">Retinal Vasculature</td>
                          <td className="py-1.5 pr-2">
                            <input 
                              id="retina_vess_od"
                              type="text" 
                              value={vesselsOD} 
                              onChange={(e) => setVesselsOD(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1"
                            />
                          </td>
                          <td className="py-1.5">
                            <input 
                              id="retina_vess_os"
                              type="text" 
                              value={vesselsOS} 
                              onChange={(e) => setVesselsOS(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1 focus:ring-1 focus:ring-fuchsia-400"
                            />
                          </td>
                        </tr>

                        {/* Periphery */}
                        <tr>
                          <td className="py-2.5 font-bold text-xs pr-2">Retinal Periphery</td>
                          <td className="py-1.5 pr-2">
                            <input 
                              id="retina_peri_od"
                              type="text" 
                              value={peripheryOD} 
                              onChange={(e) => setPeripheryOD(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1"
                            />
                          </td>
                          <td className="py-1.5">
                            <input 
                              id="retina_peri_os"
                              type="text" 
                              value={peripheryOS} 
                              onChange={(e) => setPeripheryOS(e.target.value)}
                              className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded p-1 focus:ring-1 focus:ring-fuchsia-400"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Multimodal Photo Attachments link lists */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-850 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-neutral-400">MULTIMODAL ATTACHED VAULT:</span>
                    <div className="flex gap-2">
                      <a href="#oct_raster" className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900 text-[10px] font-mono px-2 py-1 rounded" onClick={(e) => { e.preventDefault(); alert("Viewing Optical Coherence Tomography (OCT) High-Resolution Macula Raster scans: Left eye CST = 520 um. Thick dome-shaped active neurosensory fluid detachment."); }}>
                        🖻 RASTER_OS.PNG (512Kb)
                      </a>
                      <a href="#ffa" className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900 text-[10px] font-mono px-2 py-1 rounded" onClick={(e) => { e.preventDefault(); alert("Viewing Fundus Fluorescein Angiography (FFA) series: Late transit showing mild petaloid leakage corresponding to diabetic macular edema around foveal avascular zone (FAZ)."); }}>
                        🖻 FFA_TRANSIT_LATE.TIFF (1.2Mb)
                      </a>
                      <a href="#fundus_color" className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-[10px] font-mono px-2 py-1 rounded" onClick={(e) => { e.preventDefault(); alert("Color wide-field photograph of LEFT fundus showing scattered intraretinal dot-blot hemorrhages and temporal yellow waxy hard exudates."); }}>
                        🖻 LEFT_FUNDUS_COLOR.JPG (840Kb)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Digital Fundus Lesion Mapper (Col span 4) */}
                <div className="lg:col-span-4 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs flex flex-col items-center" id="retina_plotter_card">
                  <div className="w-full flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono uppercase tracking-wider">Fundus Lesion Mapper</span>
                    <button
                      id="retina_clear_lesions"
                      type="button" 
                      onClick={() => setRetinaLesions([])} 
                      className="text-[9px] text-[#A3A3A3] hover:text-rose-600 transition"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Selector brush types */}
                  <div className="flex flex-wrap gap-1 mb-2.5 w-full justify-start">
                    {(["Hemorrhage", "Cotton Wool", "Drusen", "Macular Hole"] as const).map((type) => (
                      <button
                        key={type}
                        id={`retina_lesion_brush_${type.replace(" ", "_").toLowerCase()}`}
                        type="button"
                        onClick={() => setSelectedLesionType(type)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          selectedLesionType === type
                            ? "bg-cyan-600 text-white border-cyan-600"
                            : "bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 border-neutral-200"
                        }`}
                      >
                        {type === "Hemorrhage" ? "🔴 " : type === "Cotton Wool" ? "☁️ " : type === "Drusen" ? "🟡 " : "⭕ "}
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Black sphere fundus drawing container */}
                  <div className="relative w-full aspect-square max-w-[190px] rounded-full border-4 border-neutral-800 bg-[#3F1B05] overflow-hidden flex items-center justify-center shadow-md">
                    <svg 
                      className="w-full h-full cursor-crosshair" 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                        setRetinaLesions((prev) => [...prev, { x, y, type: selectedLesionType }]);
                      }}
                      viewBox="0 0 100 100"
                    >
                      <radialGradient id="fundusGradV2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                        <stop offset="75%" stopColor="#991b1b" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#450a0a" stopOpacity="1" />
                      </radialGradient>
                      <circle cx="50%" cy="50%" r="48%" fill="url(#fundusGradV2)" />

                      {/* Optic Disc nasal shift for OS */}
                      <ellipse cx="78%" cy="50%" rx="5" ry="7.5" fill="#fef08a" opacity="0.8" />
                      
                      {/* Fovea / Macula OS layout (center left) */}
                      <circle cx="38%" cy="50%" r="4.5" fill="#580820" opacity="0.75" />
                      <circle cx="38%" cy="50%" r="1" fill="#1c0209" />

                      {/* Blood vessels */}
                      <path d="M 78 50 Q 60 40 40 38 Q 20 42 10 40" stroke="#7f1d1d" strokeWidth="0.9" fill="none" opacity="0.8" />
                      <path d="M 78 50 Q 65 60 48 64 Q 28 65 14 70" stroke="#7f1d1d" strokeWidth="0.9" fill="none" opacity="0.8" />
                      <path d="M 78 50 Q 82 28 88 18" stroke="#7f1d1d" strokeWidth="0.7" fill="none" opacity="0.75" />
                      <path d="M 78 50 Q 82 72 88 88" stroke="#7f1d1d" strokeWidth="0.7" fill="none" opacity="0.75" />

                      {/* Plotting points */}
                      {retinaLesions.map((lesion, idx) => {
                        let col = "#EF4444";
                        if (lesion.type === "Cotton Wool") col = "#FFFFFF";
                        if (lesion.type === "Drusen") col = "#FBBF24";
                        if (lesion.type === "Macular Hole") col = "#22D3EE";

                        return (
                          <g key={idx}>
                            <circle cx={`${lesion.x}%`} cy={`${lesion.y}%`} r="2.8" fill={col} stroke="#000" strokeWidth="0.5" className="animate-pulse" />
                            <text x={`${lesion.x + 3.5}%`} y={`${lesion.y + 1}%`} fill="#fff" fontSize="3" fontWeight="bold" className="font-mono bg-black">{lesion.type.slice(0, 4)}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Summary list */}
                  <div className="w-full mt-2.5">
                    <span className="text-[9.5px] text-neutral-400 font-mono uppercase block border-b border-neutral-100 pb-0.5">Plotted Coordinates ({retinaLesions.length})</span>
                    <div className="max-h-[50px] overflow-y-auto space-y-1 mt-1 text-[8.5px] font-mono text-neutral-500">
                      {retinaLesions.length === 0 ? (
                        <span>No fundus coordinates placed on current exam. Click canvas to plot.</span>
                      ) : (
                        retinaLesions.map((pt, i) => (
                          <div key={i} className="flex justify-between">
                            <span>● {pt.type}</span>
                            <span className="text-cyan-700">X:{pt.x}% Y:{pt.y}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DISEASE STAGING MATRIX COMPONENT */}
            <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs" id="retina_staging_card">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono block mb-3.5">
                4. Chronic Pathology Staging & Disease Staging Criteria
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Diabetic Retinopathy */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-850 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 font-mono uppercase">Diabetic Retinopathy (DR)</label>
                  <select 
                    id="retina_staging_dr"
                    value={drStaging} 
                    onChange={(e) => setDrStaging(e.target.value)}
                    className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 bg-[var(--clr-bg-card)] focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="NONE">No Diabetic Retinopathy</option>
                    <option value="MILD_NPDR">Mild Non-Proliferative (Mild NPDR)</option>
                    <option value="MODERATE_NPDR">Moderate Non-Proliferative (Mod NPDR)</option>
                    <option value="SEVERE_NPDR">Severe Non-Proliferative (Severe NPDR)</option>
                    <option value="PDR_ACTIVE">Proliferative DR - Active Neovascularization (PDR)</option>
                    <option value="PDR_QUIESCENT">Proliferative DR - Quiescent (Post-Laser PRP)</option>
                  </select>
                </div>

                {/* DME Status */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-850 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 font-mono uppercase">Diabetic Macular Edema (DME)</label>
                  <select 
                    id="retina_staging_dme"
                    value={hasDme} 
                    onChange={(e) => setHasDme(e.target.value)}
                    className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 bg-[var(--clr-bg-card)] focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="NONE">No macular thickening / DMA absent</option>
                    <option value="YES_ACTIVE">DME present (Active subretinal fluid)</option>
                    <option value="YES_RESOLVING">DME resolving (Post anti-VEGF injection)</option>
                  </select>
                </div>

                {/* AMD Staging */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-850 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 font-mono uppercase">Macular Degeneration (AMD)</label>
                  <select 
                    id="retina_staging_amd"
                    value={amdStaging} 
                    onChange={(e) => setAmdStaging(e.target.value)}
                    className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 bg-[var(--clr-bg-card)] focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="NONE">No AMD symptoms</option>
                    <option value="DRY_EARLY">Early Dry AMD (Few small drusen)</option>
                    <option value="DRY_GEOGRAPHIC">Advanced Dry AMD (Geographic Segment Atrophy)</option>
                    <option value="WET_ACTIVE">Wet AMD - Active choroidal neovascularization (CNV)</option>
                    <option value="WET_SCAR">Wet AMD - Quiescent / Disciform scar tissue</option>
                  </select>
                </div>

                {/* Vascular Occlusion */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-850 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 font-mono uppercase">Retinal Vascular Occlusions</label>
                  <select 
                    id="retina_staging_occl"
                    value={vascularOcclusion} 
                    onChange={(e) => setVascularOcclusion(e.target.value)}
                    className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 bg-[var(--clr-bg-card)] focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="NONE">No vascular occlusion</option>
                    <option value="CRVO_NON_ISCHEMIC">Central Retinal Vein Occlusion (CRVO non-ischemic)</option>
                    <option value="CRVO_ISCHEMIC">Central Retinal Vein Occlusion (CRVO ischemic, high glaucoma risk)</option>
                    <option value="BRVO">Branch Retinal Vein Occlusion (BRVO macular quadrant)</option>
                    <option value="CRAO">Central Retinal Artery Occlusion (CRAO STAT Emergency!)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* IN-OFFICE RETINAL IMMEDIATE PROCEDURES LOG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="retina_procedures_and_actions">
              
              {/* Intravitreal Injection Portal */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs" id="retina_inj_portal">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono uppercase tracking-wider">
                    💉 A. Intravitreal anti-VEGF Injection Portal
                  </span>
                  <input 
                    id="retina_inj_toggle"
                    type="checkbox" 
                    checked={injectionPerformed} 
                    onChange={(e) => setInjectionPerformed(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded cursor-pointer"
                  />
                </div>

                {injectionPerformed ? (
                  <div className="space-y-3.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Target Eye</label>
                        <select 
                          id="retina_inj_eye"
                          value={injTargetEye} 
                          onChange={(e) => setInjTargetEye(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        >
                          <option value="LEFT_EYE">OS (Left Eye) - Active DME</option>
                          <option value="RIGHT_EYE">OD (Right Eye)</option>
                          <option value="BILATERAL">Bilateral Intraocular injection</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Therapeutic Medication</label>
                        <select 
                          id="retina_inj_agent"
                          value={injAgentCode} 
                          onChange={(e) => setInjAgentCode(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        >
                          <option value="Aflibercept (Eylea 2mg/0.05mL)">Aflibercept (Eylea 2mg/0.05mL)</option>
                          <option value="Ranibizumab (Lucentis 0.5mg)">Ranibizumab (Lucentis 0.5mg)</option>
                          <option value="Faricimab (Vabysmo 6mg/0.05mL)">Faricimab (Vabysmo 6mg/0.05mL)</option>
                          <option value="Bevacizumab (Avastin 1.25mg / Off-label)">Bevacizumab (Avastin 1.25mg)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Vial lot / Batch Tracking number</label>
                        <input 
                          id="retina_inj_lot"
                          type="text" 
                          value={injLotNum} 
                          onChange={(e) => setInjLotNum(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        />
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-900 p-2 rounded-xl text-[9px] font-mono text-neutral-500 dark:text-neutral-400 mt-2 border border-neutral-100">
                        * Sterile single-use batch is automatically routed through hospital stock reconciliation upon consult checkout.
                      </div>
                    </div>

                    {/* Sterile sterilization checklist */}
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200/50 space-y-2">
                      <span className="text-[10px] font-bold text-neutral-500 font-mono uppercase block mb-1">Mandatory Pre-Op Patient Desensitization Checks</span>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            id="retina_sterile_step1"
                            type="checkbox" 
                            checked={injSterileSteps.povidoneIodine5} 
                            onChange={(e) => setInjSterileSteps(prev => ({ ...prev, povidoneIodine5: e.target.checked }))}
                            className="text-cyan-600 rounded border-neutral-300 cursor-pointer"
                          />
                          <span>Povidone Iodine 5% (Ocular)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            id="retina_sterile_step2"
                            type="checkbox" 
                            checked={injSterileSteps.lidSpeculumPlaced} 
                            onChange={(e) => setInjSterileSteps(prev => ({ ...prev, lidSpeculumPlaced: e.target.checked }))}
                            className="text-cyan-600 rounded border-neutral-300 cursor-pointer"
                          />
                          <span>Sterile eyelid speculum used</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            id="retina_sterile_step3"
                            type="checkbox" 
                            checked={injSterileSteps.topicalProparacaine} 
                            onChange={(e) => setInjSterileSteps(prev => ({ ...prev, topicalProparacaine: e.target.checked }))}
                            className="text-cyan-600 rounded border-neutral-300 cursor-pointer"
                          />
                          <span>Topical 0.5% Proparacaine Gtt</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            id="retina_sterile_step4"
                            type="checkbox" 
                            checked={injSterileSteps.postOpPressureCheck} 
                            onChange={(e) => setInjSterileSteps(prev => ({ ...prev, postOpPressureCheck: e.target.checked }))}
                            className="text-cyan-600 rounded border-neutral-300 cursor-pointer"
                          />
                          <span>Tactile IOP check post-injection</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200">
                    No intraocular anti-VEGF injection planned for today's encounter.
                  </div>
                )}
              </div>

              {/* Retinal Laser Tracker (Panretinal Photocoagulation / Focal) */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs" id="retina_laser_portal">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono uppercase tracking-wider">
                    ⚡ B. Retinal Laser Photocoagulation Tracker
                  </span>
                  <input 
                    id="retina_laser_toggle"
                    type="checkbox" 
                    checked={laserPerformed} 
                    onChange={(e) => setLaserPerformed(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded cursor-pointer"
                  />
                </div>

                {laserPerformed ? (
                  <div className="space-y-3.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Laser Treatment Modality</label>
                        <select 
                          id="retina_laser_type"
                          value={laserType} 
                          onChange={(e) => setLaserType(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        >
                          <option value="FOCAL_MACULAR">Focal Macular green laser (DME)</option>
                          <option value="PANRETINAL">Panretinal Photocoagulation (PRP for PDR)</option>
                          <option value="BARRIER_TEAR">Barrier laser demarcation for peripheral tear</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Wavelength emission</label>
                        <select 
                          id="retina_laser_wavelength"
                          value={laserWavelength} 
                          onChange={(e) => setLaserWavelength(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        >
                          <option value="532nm Green">532nm (Frequency Doubled Nd:YAG Green)</option>
                          <option value="577nm Yellow">577nm (Pure Yellow Subthreshold Laser)</option>
                          <option value="810nm Infrared">810nm (Diode Thermal Retinal Coagulator)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Laser Power (mW)</label>
                        <input 
                          id="retina_laser_power"
                          type="number" 
                          value={laserPowerMw} 
                          onChange={(e) => setLaserPowerMw(parseInt(e.target.value) || 120)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)] font-mono text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Exposure (ms)</label>
                        <select 
                          id="retina_laser_duration"
                          value={laserDurationMs} 
                          onChange={(e) => setLaserDurationMs(parseInt(e.target.value) || 100)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)] font-mono"
                        >
                          <option value={50}>50 ms</option>
                          <option value={100}>100 ms</option>
                          <option value={200}>200 ms</option>
                          <option value={500}>500 ms (Thermal)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Total Spots</label>
                        <input 
                          id="retina_laser_spots"
                          type="number" 
                          value={laserSpotsCoated} 
                          onChange={(e) => setLaserSpotsCoated(parseInt(e.target.value) || 10)}
                          className="w-full text-xs border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)] font-mono text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 text-[10.5px] space-y-1">
                      <p className="font-bold text-rose-800">⚠️ Thermal Retinal Photocoagulation Safety Limits:</p>
                      <p className="text-neutral-500 leading-normal">
                        Verify that total energy output corresponds strictly to retinal pigment density profile. Spot boundaries must clear the 500-micron foveolar foveal-avascular-zone boundary at all times.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200">
                    No active laser photocoagulation requested in today's therapeutic plan.
                  </div>
                )}
              </div>
            </div>

            {/* PHARMACY & REFERRALS LOGISTICS INTERACTION PANELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="retina_logistics_and_prescriptions">
              
              {/* E-PRESCRIBING FORM */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs" id="retina_prescription_block">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono uppercase tracking-wider block mb-3">
                  💊 5. E-Prescribing System (Send to On-Site Pharmacy)
                </span>

                <div className="space-y-3">
                  <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9.5px] font-bold text-neutral-500 uppercase">Interactive Formulary Option</label>
                        <select 
                          id="retina_rx_select_name"
                          value={newRxName} 
                          onChange={(e) => setNewRxName(e.target.value)}
                          className="w-full border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        >
                          <option value="">-- Choose custom ophthalmic drug --</option>
                          <option value="Moxifloxacin 0.5% Drops">Moxifloxacin 0.5% Drops (Post-op Prophylaxis)</option>
                          <option value="Nepafenac 0.3% Suspension">Nepafenac 0.3% Suspension (Topical NSAID)</option>
                          <option value="Prednisolone Acetate 1% Gtt">Prednisolone Acetate 1% Gtt (Steroid drops)</option>
                          <option value="Preservision AREDS 2 vitamins">Preservision AREDS 2 vitamins (Macula protection)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[9.5px] font-bold text-neutral-500 uppercase">Write Text directly</label>
                        <input 
                          id="retina_rx_custom_input"
                          type="text" 
                          placeholder="e.g. Ketorolac Gtt 0.5% QID" 
                          value={newRxName} 
                          onChange={(e) => setNewRxName(e.target.value)}
                          className="w-full border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[9.5px] font-bold text-neutral-500 uppercase">Dosage</label>
                        <input 
                          id="retina_rx_dose"
                          type="text" 
                          value={newRxDose} 
                          onChange={(e) => setNewRxDose(e.target.value)}
                          className="w-full border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-neutral-500 uppercase">Frequency</label>
                        <input 
                          id="retina_rx_freq"
                          type="text" 
                          value={newRxFreq} 
                          onChange={(e) => setNewRxFreq(e.target.value)}
                          className="w-full border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-neutral-500 uppercase">Duration Days</label>
                        <input 
                          id="retina_rx_days"
                          type="number" 
                          value={newRxDays} 
                          onChange={(e) => setNewRxDays(parseInt(e.target.value) || 5)}
                          className="w-full border border-neutral-300 rounded p-1 bg-[var(--clr-bg-card)]"
                        />
                      </div>
                    </div>

                    <button
                      id="retina_add_rx_btn"
                      type="button"
                      onClick={() => {
                        if (!newRxName) return;
                        setRetinaRxs(prev => [
                          ...prev,
                          {
                            drugName: newRxName,
                            dose: newRxDose,
                            freq: newRxFreq,
                            days: newRxDays,
                            route: "OPHTHALMIC_EYE_DROPS",
                            instructions: "Instill locally as logged."
                          }
                        ]);
                        setNewRxName("");
                        addClinicalLog("E-Prescribing Addition", `Added ${newRxName} to active prescription queue.`);
                      }}
                      className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition mt-2 active:scale-95"
                    >
                      ✓ Commit and Add to Rx Queue
                    </button>
                  </div>

                  {/* Prepopulated RX prescription inventory summary queue list */}
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                    {retinaRxs.map((rx, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 rounded-xl flex items-center justify-between text-xs transition hover:bg-neutral-100">
                        <div>
                          <p className="font-bold text-neutral-800 dark:text-neutral-200">{rx.drugName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{rx.dose} • {rx.freq} for {rx.days} days ({rx.route})</p>
                          {rx.instructions && <p className="text-[9.5px] font-bold text-cyan-600 font-mono">Sign: {rx.instructions}</p>}
                        </div>
                        <button
                          id={`retina_remove_rx_${idx}`}
                          type="button"
                          onClick={() => {
                            setRetinaRxs(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-neutral-400 hover:text-rose-600 font-bold px-2 py-1 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INTER-CLINIC REFERRAL ROUTING ENGINE (DISPATCH OVERRIDES) */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-3xl shadow-xs flex flex-col justify-between" id="retina_referral_block">
                <div>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono uppercase tracking-wider block mb-3">
                    🪃 6. Inter-Clinic Referral Routing Engine & Dispatches
                  </span>

                  <div className="space-y-3.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Clinic Target</label>
                        <select 
                          id="retina_referral_target"
                          value={referralTarget} 
                          onChange={(e) => setReferralTarget(e.target.value)}
                          className="w-full text-xs border border-neutral-300 rounded p-1.5 bg-[var(--clr-bg-card)]"
                        >
                          <option value="MEDICINE">General Medicine / Endocrinology (BP & HbA1c)</option>
                          <option value="GLAUCOMA">Glaucoma Clinic (NVG Neovascular Glaucoma alert)</option>
                          <option value="SURGERY_OR">Main Operating Theater (Vitrectomy / Tractional RD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-extrabold text-[#7F1D1D] font-mono uppercase mb-0.5">Dispatched Urgency Status</label>
                        <select 
                          id="retina_referral_urgency"
                          value={referralUrgencyValue} 
                          onChange={(e) => setReferralUrgencyValue(e.target.value)}
                          className="w-full text-xs border border-rose-300 bg-rose-50/20 text-[#be123c] rounded p-1.5 font-bold focus:ring-1 focus:ring-rose-500"
                        >
                          <option value="ROUTINE">Routine Consult</option>
                          <option value="URGENT">URGENT (24-48 Hours)</option>
                          <option value="STAT_ORWAY">STAT EMERGENCY (Main OR)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-extrabold text-neutral-500 font-mono uppercase mb-0.5">Clinical Authorization Reason & Narrative</label>
                      <textarea 
                        id="retina_referral_notes"
                        rows={2}
                        value={referralDetails} 
                        onChange={(e) => setReferralDetails(e.target.value)}
                        placeholder="Specify referral pathology and required actions..."
                        className="w-full text-xs border border-neutral-300 rounded p-2 focus:outline-teal-500 bg-[var(--clr-bg-card)]"
                      />
                    </div>

                    {/* Threat detection warning alert */}
                    {referralTarget === "GLAUCOMA" && drStaging === "PDR_ACTIVE" && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-900 dark:text-amber-400 rounded-xl text-[10px] leading-relaxed flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>
                          <strong>NEOVASCULAR GLAUCOMA WARNING:</strong> Patient has active PDR. Abnormal vessels might grow into the iris angle (NVI/NVE). Prompt gonioscopy recommended at Glaucoma review.
                        </span>
                      </div>
                    )}

                    {referralTarget === "SURGERY_OR" && (
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-900 dark:text-rose-400 rounded-xl text-[10px] leading-relaxed flex items-center gap-1.5 select-none">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>
                          <strong>SURGICAL VITRECTOMY ROUTING:</strong> Macular traction, non-clearing vitreous hemorrhaging, or grade IV macular hole indicates immediately setting up surgical booking queues.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="retina_dispatch_referral"
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("clinical-notification", {
                        detail: {
                          type: "referral",
                          patientId: selectedPatient?.id || "N/A",
                          patientName: selectedPatient?.name || "Patient",
                          titleEn: "Tertiary Referral Dispatched",
                          titleAr: "تم إرسال إحالة سريرية ثالثية",
                          messageEn: `Patient ${selectedPatient?.name || "Patient"} referred to [${referralTarget}] under priority [${referralUrgencyValue}]. Secure token is logged.`,
                          messageAr: `تمت إحالة المريض ${selectedPatient?.name || "Patient"} إلى قسم [${referralTarget}] تحت الأولوية [${referralUrgencyValue}]. وتم تسجيل رمز الأمان.`
                        }
                      }));

                      alert(`Tertiary Referral successfully dispatched to: [${referralTarget}] under Priority [${referralUrgencyValue}]. Secure token is logged.`);
                      addClinicalLog("Referral Dispatched", `Routed to ${referralTarget} (${referralUrgencyValue}) with statement: ${referralDetails}`);
                    }}
                    className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition active:scale-95"
                  >
                    🚀 Dispatch Secure Referral Integration
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-2 flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800" id="retina_encounter_action_dock">
              <span className="text-[10px] text-neutral-400 font-mono">
                COMPLETING ENCOUNTER ID: <strong className="font-bold">GS-RE-{selectedPatient.id}</strong>
              </span>

              <button
                id="retina_finalize_operations"
                type="button"
                disabled={!clinicState.dilationCompleted}
                onClick={() => {
                  let textOutput = `Bilateral Retina evaluation complete. OCT central subfield thickness: OD=${cstOD} um, OS=${cstOS} um. Dilation view quality: ${viewQuality}.`;
                  
                  if (drStaging !== "NONE") textOutput += ` Diabetic Retinopathy staged as: ${drStaging} with DME: ${hasDme}.`;
                  if (injectionPerformed) textOutput += ` Administered anti-VEGF Intravitreal Injection (${injAgentCode}) to ${injTargetEye}, Lot: ${injLotNum}.`;
                  if (laserPerformed) textOutput += ` Executed ${laserType} laser emission therapy spots count: ${laserSpotsCoated} spots.`;

                  // Auto generate pharmacy entries in patient billing ledger
                  let nextLedger = [...selectedPatient.billingLedger];
                  
                  // Inject injection charge if performed
                  if (injectionPerformed) {
                    nextLedger.push({
                      id: `BIL-RET-INJ-${Date.now()}`,
                      serviceName: `Intravitreal anti-VEGF pre-op sterilize & injection procedure (${injAgentCode})`,
                      category: "ClinicalLab",
                      amount: 380,
                      status: "Unpaid"
                    });
                  }

                  // Inject laser charge if performed
                  if (laserPerformed) {
                    nextLedger.push({
                      id: `BIL-RET-LAS-${Date.now()}`,
                      serviceName: `Laser photocoagulation retinal therapeutic session (${laserType})`,
                      category: "ClinicalLab",
                      amount: 450,
                      status: "Unpaid"
                    });
                  }

                  // Inject e-prescribed items charges dynamically
                  retinaRxs.forEach((rx, index) => {
                    nextLedger.push({
                      id: `BIL-RET-RX-${index}-${Date.now()}`,
                      serviceName: `Prescription Ophthalmic Formulary: ${rx.drugName} (Qty: 1)`,
                      category: "PharmacyDispense",
                      amount: 45,
                      status: "Unpaid"
                    });
                  });

                  const updatedPatient: Patient = {
                    ...selectedPatient,
                    status: "BillingPending",
                    billingLedger: nextLedger,
                    clinicalLogs: [
                      ...selectedPatient.clinicalLogs,
                      {
                        timestamp: new Date().toLocaleTimeString().slice(0, 5),
                        actorRole: "Retina Specialist",
                        action: "Consultation Complete",
                        notes: textOutput
                      }
                    ]
                  };

                  onUpdatePatient(updatedPatient);
                  setConsultationClosed(true);
                  alert(`Retina clinical encounter finalized. Procedures, prescription and tertiary referral dispatches have been successfully compiled in the central billing ledger & pharmacy queue!`);
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-[0_0_20px_rgba(13,148,136,0.2)] dark:hover:shadow-[0_0_20px_rgba(43,191,255,0.2)] transition active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                ✓ Finalize & Bill Retina Encounter
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Glaucoma" && (
          <div className="space-y-6 animate-fadeIn" id="glaucoma_workstation_wrapper">
            
            {/* === LEVEL 1, 2, 3 COHERENT NAV PARADIGM === */}
            <div className="bg-[#FFFFFF] dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-4 rounded-3xl space-y-4 shadow-sm" id="glaucoma_level_nav_wrapper">
              
              {/* LEVEL 1: Patient Profile Dropdown Context Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dashed border-[#EAE6DF] dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <select
                      id="glaucoma_patient_profile_dropdown"
                      value={selectedPatient.id}
                      disabled
                      className="appearance-none pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-900 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl text-xs font-black uppercase text-slate-800 dark:text-neutral-200 cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={selectedPatient.id}>🏥 Patient Profile: {selectedPatient.name} ({selectedPatient.id})</option>
                    </select>
                  </div>
                  <span className="text-xs font-serif italic text-neutral-400 dark:text-neutral-500">
                    ★ IOP TONOMETRY DIAGNOSTICS SUITE
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] bg-[var(--clr-brand-blue)]/10 text-indigo-800 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/50 font-mono px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    IOP CORE LIVE
                  </span>
                </div>
              </div>

              {/* LEVEL 2: Flat Horizontal Navigation Tab Bar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-[#EAE6DF] dark:border-neutral-800/60 pb-1" id="glaucoma_level_2_tabs">
                {[
                  { id: "exam", label: "Exam & Tonometry" },
                  { id: "staging", label: "Structural Staging" },
                  { id: "trends", label: "History Trends" },
                ].map(tab => {
                  const isActive = glaucomaActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`glaucoma_tab_${tab.id}`}
                      type="button"
                      onClick={() => setGlaucomaActiveTab(tab.id as any)}
                      className={`px-4 py-2 text-xs font-semibold relative transition-all duration-300 active:scale-[0.98] ${
                        isActive
                          ? "text-[#4F46E5] dark:text-indigo-400 font-bold"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#4F46E5] dark:bg-indigo-400 rounded-full animate-slideIn" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* LEVEL 3: View Toggles Segmented Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-2xl border border-[#EAE6DF] dark:border-neutral-800/55" id="glaucoma_level_3_filters">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 mr-2 uppercase">Eye Channel Filter:</span>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center border border-neutral-200 dark:border-neutral-850 shadow-inner">
                    {[
                      { id: "BOTH", label: "👁️ Both Eyes" },
                      { id: "OD", label: "OD (Right Eye)" },
                      { id: "OS", label: "OS (Left Eye)" }
                    ].map(seg => (
                      <button
                        key={seg.id}
                        id={`glaucoma_eye_filter_${seg.id}`}
                        type="button"
                        onClick={() => setGlaucomaEyeFilter(seg.id as any)}
                        className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-all duration-200 ${
                          glaucomaEyeFilter === seg.id
                            ? "bg-white dark:bg-neutral-900 text-indigo-700 dark:text-[#2BBFFF] shadow-md border border-neutral-200/50 dark:border-neutral-800"
                            : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 italic">
                  Filtering visual parameters in real-time
                </div>
              </div>

            </div>

            {/* ERROR BOUNDARY GATEWAY (STRICT IOP VERIFICATION) */}
            {(() => {
              const valErrorMsg = (gatOD > 80 || gatOS > 80) 
                ? "❌ IOP CRITICAL HIGH ERROR: Applanation readings > 80 mmHg exceed physical limits and represent active prism calibration artifacts or extreme acute pupillary block emergencies." 
                : (gatOD < 3 || gatOS < 3)
                ? "⚠️ HYPOTONY LIMIT WARNING: Intraocular Pressure readings < 3 mmHg represent extreme clinical Hypotony. Verify corneal applanation strip for excessive staining."
                : "";

              if (!valErrorMsg) return null;
              return (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs transition duration-300">
                  <span className="text-base">🚨</span>
                  <span>{valErrorMsg}</span>
                </div>
              );
            })()}

            {/* TWO COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="glaucoma_core_workspace">
              
              {/* === LEFT WORKSPACE COLUMN (7 SPANS): TONOMETRY & DIURNAL CHRONOLOGY === */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* A. IOP & Pachymetry Correction Matrix Card */}
                {glaucomaActiveTab === "exam" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="iop_correction_card">
                    <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-3 mb-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span>📉</span> GAT Applanation & Corneal Correction Matrix
                      </span>
                      <span className="text-[10px] text-indigo-600 bg-[var(--clr-brand-blue)]/10 dark:bg-indigo-950/30 px-2 py-0.5 rounded font-mono font-bold">
                        Formula: GAT + (545 - CCT) * 0.07
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Right Eye (OD) */}
                      {(glaucomaEyeFilter === "BOTH" || glaucomaEyeFilter === "OD") && (
                        <div className="bg-neutral-50/70 dark:bg-neutral-900/30 p-4 rounded-2xl border border-neutral-150/40 relative">
                          <span className="absolute top-2 right-2 text-[10px] font-bold font-mono text-emerald-600">OD - RIGHT</span>
                          <h5 className="text-[11px] font-bold text-slate-500 mb-3">OD APPLANATION INPUTS</h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Raw GAT Reading:</span>
                            <span className="font-mono font-bold text-emerald-700">{gatOD} mmHg</span>
                          </label>
                          <input 
                            id="glaucoma_gat_od_input"
                            type="range"
                            min="5"
                            max="60"
                            step="0.5"
                            value={gatOD}
                            onChange={(e) => setGatOD(parseFloat(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Corneal Thickness (CCT):</span>
                            <span className="font-mono font-bold text-slate-700">{cctOD} μm</span>
                          </label>
                          <input 
                            id="glaucoma_cct_od_input"
                            type="range"
                            min="400"
                            max="650"
                            step="5"
                            value={cctOD}
                            onChange={(e) => setCctOD(parseInt(e.target.value))}
                            className="w-full accent-slate-600 cursor-pointer"
                          />
                        </div>

                        <div className="pt-2.5 border-t border-neutral-200/50 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">Corrected IOP:</span>
                          <span className={`text-base font-mono font-extrabold ${gatOD + (545 - cctOD) * 0.07 > 21 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {Number(gatOD + (545 - cctOD) * 0.07).toFixed(1)} <span className="text-[10px] font-normal">mmHg</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Left Eye (OS) */}
                    {(glaucomaEyeFilter === "BOTH" || glaucomaEyeFilter === "OS") && (
                      <div className="bg-neutral-50/70 dark:bg-neutral-900/30 p-4 rounded-2xl border border-neutral-150/40 relative">
                        <span className="absolute top-2 right-2 text-[10px] font-bold font-mono text-fuchsia-600">OS - LEFT</span>
                        <h5 className="text-[11px] font-bold text-slate-500 mb-3">OS APPLANATION INPUTS</h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Raw GAT Reading:</span>
                            <span className="font-mono font-bold text-fuchsia-700">{gatOS} mmHg</span>
                          </label>
                          <input 
                            id="glaucoma_gat_os_input"
                            type="range"
                            min="5"
                            max="60"
                            step="0.5"
                            value={gatOS}
                            onChange={(e) => setGatOS(parseFloat(e.target.value))}
                            className="w-full accent-fuchsia-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Corneal Thickness (CCT):</span>
                            <span className="font-mono font-bold text-slate-700">{cctOS} μm</span>
                          </label>
                          <input 
                            id="glaucoma_cct_os_input"
                            type="range"
                            min="400"
                            max="650"
                            step="5"
                            value={cctOS}
                            onChange={(e) => setCctOS(parseInt(e.target.value))}
                            className="w-full accent-slate-600 cursor-pointer"
                          />
                        </div>

                        <div className="pt-2.5 border-t border-neutral-200/50 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">Corrected IOP:</span>
                          <span className={`text-base font-mono font-extrabold ${gatOS + (545 - cctOS) * 0.07 > 21 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {Number(gatOS + (545 - cctOS) * 0.07).toFixed(1)} <span className="text-[10px] font-normal">mmHg</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                )}

                {/* B. Diurnal IOP Tracking Chronology Plot */}
                {glaucomaActiveTab === "trends" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="diurnal_tracking_card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-850 pb-3 mb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block">
                        👁️ Diurnal Pressure Spikes & Multi-Visit Chronology
                      </span>
                      <span className="text-[10px] text-neutral-400">Verifying diurnal curve values to capture off-hour spikes</span>
                    </div>

                    {/* Interactive diurnal point adding form */}
                    <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-950/30 p-1.5 rounded-2xl border border-neutral-150">
                      <input 
                        id="diurnal_time_input"
                        type="text"
                        value={newDiurnalTime}
                        onChange={(e) => setNewDiurnalTime(e.target.value)}
                        className="w-10 text-[10px] font-bold text-center border-b border-neutral-300 bg-transparent text-slate-800"
                        placeholder="12:00"
                      />
                      <span className="text-[9px] text-[#A3A3A3]">OD:</span>
                      <input 
                        id="diurnal_od_input"
                        type="number"
                        value={newDiurnalOD}
                        onChange={(e) => setNewDiurnalOD(parseInt(e.target.value) || 15)}
                        className="w-7 text-[10px] font-mono text-center border-b border-neutral-300 bg-transparent text-slate-800"
                      />
                      <span className="text-[9px] text-[#A3A3A3]">OS:</span>
                      <input 
                        id="diurnal_os_input"
                        type="number"
                        value={newDiurnalOS}
                        onChange={(e) => setNewDiurnalOS(parseInt(e.target.value) || 15)}
                        className="w-7 text-[10px] font-mono text-center border-b border-neutral-300 bg-transparent text-slate-800"
                      />
                      <button 
                        id="add_diurnal_reading"
                        type="button"
                        onClick={() => {
                          setDiurnalReadings((p) => [...p, { time: newDiurnalTime, od: Number(newDiurnalOD), os: Number(newDiurnalOS) }]);
                        }}
                        className="bg-accent-indigo hover:bg-indigo-700 text-white font-bold text-[9px] font-mono px-2 py-1 rounded"
                      >
                        Add Point
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM DIURNAL TREND SVG GRAPH WRAPPER */}
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl">
                    <div className="relative w-full h-[140px]">
                      {/* Grid Lines */}
                      <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="border-t border-dashed border-white text-[8px] font-mono pl-1 text-white">35 mmHg</div>
                        <div className="border-t border-dashed border-white text-[8px] font-mono pl-1 text-white">25 mmHg</div>
                        <div className="border-t border-dashed border-white text-[8px] font-mono pl-1 text-white">15 mmHg</div>
                      </div>

                      {/* SVG Engine */}
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        {(() => {
                          const iopMin = 10;
                          const iopMax = 35;
                          const scaleY = (val: number) => {
                            const clamp = Math.max(iopMin, Math.min(iopMax, val));
                            return 100 - ((clamp - iopMin) / (iopMax - iopMin)) * 85;
                          };

                          const scaleX = (idx: number, total: number) => {
                            if (total <= 1) return 200;
                            return 40 + (idx / (total - 1)) * 320;
                          };

                          // Construct lines
                          let odPath = "";
                          let osPath = "";

                          diurnalReadings.forEach((pt, idx) => {
                            const x = scaleX(idx, diurnalReadings.length);
                            const yOD = scaleY(pt.od);
                            const yOS = scaleY(pt.os);

                            if (idx === 0) {
                              odPath = `M ${x} ${yOD}`;
                              osPath = `M ${x} ${yOS}`;
                            } else {
                              odPath += ` L ${x} ${yOD}`;
                              osPath += ` L ${x} ${yOS}`;
                            }
                          });

                          return (
                            <g>
                              {/* Slanted lines */}
                              {diurnalReadings.length > 1 && (
                                <>
                                  <path d={odPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                                  <path d={osPath} fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" />
                                </>
                              )}

                              {/* Nodes & values for points */}
                              {diurnalReadings.map((pt, idx) => {
                                const x = scaleX(idx, diurnalReadings.length);
                                const yOD = scaleY(pt.od);
                                const yOS = scaleY(pt.os);

                                return (
                                  <g key={idx}>
                                    <circle cx={x} cy={yOD} r="3.5" fill="#10b981" stroke="#000" strokeWidth="0.5" />
                                    <text x={x} y={yOD - 7} fill="#10b981" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{pt.od}</text>

                                    <circle cx={x} cy={yOS} r="3.5" fill="#d946ef" stroke="#000" strokeWidth="0.5" />
                                    <text x={x} y={yOS - 7} fill="#d946ef" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{pt.os}</text>
                                  </g>
                                );
                              })}
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Timeline text labels */}
                    <div className="flex justify-between px-6 text-[9.5px] font-bold text-slate-500 font-mono border-t border-slate-900 pt-2">
                      {diurnalReadings.map((pt, idx) => (
                        <span key={idx} className="text-center">
                          <span>{pt.time}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Diurnal highlights metadata */}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[10.5px] font-mono p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100">
                    <div className="flex gap-2 items-center justify-between">
                      <span className="text-slate-400">OD Max Peak Spike:</span>
                      <span className="text-emerald-700 font-extrabold">{Math.max(...diurnalReadings.map(d => d.od))} mmHg</span>
                    </div>
                    <div className="flex gap-2 items-center justify-between border-l border-neutral-200/50 pl-3">
                      <span className="text-slate-400">OS Max Peak Spike:</span>
                      <span className="text-fuchsia-700 font-extrabold">{Math.max(...diurnalReadings.map(d => d.os))} mmHg</span>
                    </div>
                  </div>
                </div>
                )}

                {/* C. Current Medication "Washout" & Compliance Tracking Card */}
                {glaucomaActiveTab === "exam" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="washout_compliance_card">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block mb-3 border-b border-neutral-100 pb-2">
                    💧 Active Regimen & Compliance Washout Engine
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Droplist checkboxes */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Drug Classes</h5>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-2 text-slate-700 font-medium">
                          <input 
                            id="glaucoma_regimen_prostaglandin"
                            type="checkbox" 
                            checked={activeDrops.prostaglandin} 
                            onChange={(e) => setActiveDrops(p => ({ ...p, prostaglandin: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-0" 
                          />
                          <span>Prostaglandins (bedtime drops, e.g. Latanoprost)</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-700 font-medium">
                          <input 
                            id="glaucoma_regimen_betablocker"
                            type="checkbox" 
                            checked={activeDrops.betaBlocker} 
                            onChange={(e) => setActiveDrops(p => ({ ...p, betaBlocker: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-0" 
                          />
                          <span>Beta-Blockers (morning TID, e.g. Timolol)</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-700 font-medium">
                          <input 
                            id="glaucoma_regimen_cai"
                            type="checkbox" 
                            checked={activeDrops.cai} 
                            onChange={(e) => setActiveDrops(p => ({ ...p, cai: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-0" 
                          />
                          <span>Carbonic Anhydrase Inhibitors (e.g. Dorzolamide)</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-700 font-medium">
                          <input 
                            id="glaucoma_regimen_alpha"
                            type="checkbox" 
                            checked={activeDrops.alphaAgonist} 
                            onChange={(e) => setActiveDrops(p => ({ ...p, alphaAgonist: e.target.checked }))}
                            className="rounded text-indigo-600 focus:ring-0" 
                          />
                          <span>Alpha-Agonists (BID/TID, e.g. Brimonidine)</span>
                        </label>
                      </div>
                    </div>

                    {/* Compliance selectors & notes */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Compliance Level</h5>
                        <div className="flex gap-2">
                          <button 
                            id="glaucoma_compliance_adherent"
                            type="button"
                            onClick={() => setComplianceStatus("ADHERENT")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition duration-200 border ${
                              complianceStatus === "ADHERENT"
                                ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                                : "bg-neutral-50 dark:bg-neutral-900 text-slate-500 border-neutral-200"
                            }`}
                          >
                            ✓ Adherent Compliance
                          </button>
                          <button 
                            id="glaucoma_compliance_non_adherent"
                            type="button"
                            onClick={() => setComplianceStatus("NON_ADHERENT")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition duration-200 border ${
                              complianceStatus === "NON_ADHERENT"
                                ? "bg-amber-500 border-amber-600 text-white shadow-xs"
                                : "bg-neutral-50 dark:bg-neutral-900 text-slate-500 border-neutral-200"
                            }`}
                          >
                            ⚠ Non-Adherent / Washout
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Drug compliance observations</label>
                        <input 
                          id="glaucoma_compliance_notes_input"
                          type="text" 
                          value={complianceNotes}
                          onChange={(e) => setComplianceNotes(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-lg p-2 focus:outline-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* H. Humphrey Perimeter 30-2 Scotoma Grid Linkage Card */}
                {glaucomaActiveTab === "staging" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="perimetry_box">
                    <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-3 mb-4">
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block">
                          👁️ Humphrey Perimeter 30-2 Scotoma Grid Linkage
                        </span>
                        <span className="text-[10px] text-neutral-400 font-sans">Identify localized blind spots in visual fields</span>
                      </div>
                      <button
                        id="reset_scotoma_grid"
                        type="button"
                        onClick={() => setVisualFieldMap({})}
                        className="text-[10px] font-mono hover:text-rose-600 transition text-[#A3A3A3]"
                      >
                        Clear Mesh
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-8 flex justify-center">
                        <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center bg-slate-950 rounded-full p-4 border-2 border-slate-900 shadow-lg">
                          <svg className="w-full h-full text-zinc-800" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" fill="none" opacity="0.6" />
                            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" fill="none" opacity="0.6" />
                            <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" fill="none" opacity="0.6" />
                            <circle cx="50" cy="50" r="1.5" fill="#facc15" className="animate-pulse" />
                            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
                            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />

                            {[
                              { id: "S10", cx: 50, cy: 34 },
                              { id: "S20", cx: 50, cy: 22 },
                              { id: "S30", cx: 50, cy: 10 },
                              { id: "I10", cx: 50, cy: 66 },
                              { id: "I20", cx: 50, cy: 78 },
                              { id: "I30", cx: 50, cy: 90 },
                              { id: "T10", cx: 34, cy: 50 },
                              { id: "T20", cx: 22, cy: 50 },
                              { id: "T30", cx: 10, cy: 50 },
                              { id: "N10", cx: 66, cy: 50 },
                              { id: "N20", cx: 78, cy: 50 },
                              { id: "N30", cx: 90, cy: 50 },
                            ].map((pt) => {
                              const isScotoma = visualFieldMap[pt.id] === "Scotoma";
                              return (
                                <circle 
                                  key={pt.id}
                                  cx={pt.cx}
                                  cy={pt.cy}
                                  r={isScotoma ? "3.5" : "2"}
                                  fill={isScotoma ? "#ef4444" : "#10b981"}
                                  stroke="#000"
                                  strokeWidth="0.4"
                                  className="cursor-pointer transition-all duration-150 hover:scale-130"
                                  onClick={() => {
                                    setVisualFieldMap((prev) => {
                                      const next = { ...prev };
                                      if (next[pt.id] === "Scotoma") {
                                        delete next[pt.id];
                                      } else {
                                        next[pt.id] = "Scotoma";
                                      }
                                      return next;
                                    });
                                  }}
                                />
                              );
                            })}
                          </svg>
                        </div>
                      </div>

                      <div className="md:col-span-4 text-xs space-y-2 text-slate-500 dark:text-slate-400 leading-normal font-sans">
                        <p>🟢 Normal Light thresholds (Cleared)</p>
                        <p>🔴 Blind spots / absolute scotomas (Detected)</p>
                        <p className="text-[10px] bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl border-dashed font-mono">
                          <strong>Active HFA:</strong> {Object.keys(visualFieldMap).join(", ") || "No scotoma mapped"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* === RIGHT WORKSPACE COLUMN (5 SPANS): STRUCTURAL EXAMS, GONIOSCOPY, STAGING === */}
              <div className="lg:col-span-5 space-y-6">
                {glaucomaActiveTab === "staging" && (
                  <>
                    {/* D. Structural exam (C/D Ratio, Mean Deviation & HFA mapping) */}
                    <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="structural_exam_card">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block mb-3 border-b border-neutral-100 pb-2">
                    👁️ Optic Nerve & Visual Field Structural Evaluator
                  </span>

                  <div className="space-y-4">
                    {/* Cup-To-Disc ratios */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-150/40">
                      <div>
                        <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase mb-1">
                          <span>OD Cup-To-Disc</span>
                          <span className="font-mono text-emerald-600">{cdRatioOD}</span>
                        </label>
                        <input 
                          id="glaucoma_cd_od_slider"
                          type="range"
                          min="0.1"
                          max="0.95"
                          step="0.05"
                          value={cdRatioOD}
                          onChange={(e) => setCdRatioOD(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase mb-1">
                          <span>OS Cup-To-Disc</span>
                          <span className="font-mono text-fuchsia-600">{cdRatioOS}</span>
                        </label>
                        <input 
                          id="glaucoma_cd_os_slider"
                          type="range"
                          min="0.1"
                          max="0.95"
                          step="0.05"
                          value={cdRatioOS}
                          onChange={(e) => setCdRatioOS(parseFloat(e.target.value))}
                          className="w-full accent-fuchsia-500"
                        />
                      </div>
                    </div>

                    {/* HFA Mean Deviations */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">OD VF Mean Deviation (MD) dB</label>
                        <input 
                          id="glaucoma_md_od_input"
                          type="number"
                          step="0.1"
                          value={mdOD}
                          onChange={(e) => setMdOD(parseFloat(e.target.value) || 0)}
                          className="w-full text-xs font-mono font-bold border border-neutral-200 rounded-lg p-2 focus:outline-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">OS VF Mean Deviation (MD) dB</label>
                        <input 
                          id="glaucoma_md_os_input"
                          type="number"
                          step="0.1"
                          value={mdOS}
                          onChange={(e) => setMdOS(parseFloat(e.target.value) || 0)}
                          className="w-full text-xs font-mono font-bold border border-neutral-200 rounded-lg p-2 focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    {/* OCT RNFL descriptors selection */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">OD OCT Nerve Fiber (RNFL)</label>
                        <select 
                          id="glaucoma_rnfl_od"
                          value={rnflOD} 
                          onChange={(e) => setRnflOD(e.target.value)}
                          className="w-full text-xs font-sans border border-neutral-200 rounded-lg p-1.5 bg-white dark:bg-neutral-900"
                        >
                          <option value="NORMAL">Normal RNFL contours</option>
                          <option value="THIN_SUPERIOR">Thin Superior fibers</option>
                          <option value="THIN_INFERIOR">Thin Inferior fibers</option>
                          <option value="BI_TEMPORAL_LOSS">Bitemporal optic head thinning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">OS OCT Nerve Fiber (RNFL)</label>
                        <select 
                          id="glaucoma_rnfl_os"
                          value={rnflOS} 
                          onChange={(e) => setRnflOS(e.target.value)}
                          className="w-full text-xs font-sans border border-neutral-200 rounded-lg p-1.5 bg-white dark:bg-neutral-900"
                        >
                          <option value="NORMAL">Normal RNFL contours</option>
                          <option value="THIN_SUPERIOR">Thin Superior fibers</option>
                          <option value="THIN_INFERIOR">Thin Inferior fibers</option>
                          <option value="BI_TEMPORAL_LOSS">Bitemporal optic head thinning</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive 4-Quadrant Gonioscopy Angles Tracker */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">
                        Gonioscopy 4-Quadrant Shaffer Grade Target Index
                      </span>

                      <div className="grid grid-cols-2 gap-4">
                        {/* OD Gonioscopy Grid */}
                        <div className="bg-neutral-50/70 p-3 rounded-2xl border border-neutral-150 flex flex-col items-center">
                          <span className="text-[9.5px] font-bold font-mono text-emerald-600 block mb-2">OD RIGHT ANGLE MATRIX</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[9px] w-full">
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">SUP:</span>
                              <select 
                                id="gonio_od_sup"
                                value={gonioOD.superior} 
                                onChange={(e) => setGonioOD(p => ({...p, superior: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">INF:</span>
                              <select 
                                id="gonio_od_inf"
                                value={gonioOD.inferior} 
                                onChange={(e) => setGonioOD(p => ({...p, inferior: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">NASAL:</span>
                              <select 
                                id="gonio_od_nas"
                                value={gonioOD.nasal} 
                                onChange={(e) => setGonioOD(p => ({...p, nasal: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">TEMP:</span>
                              <select 
                                id="gonio_od_tem"
                                value={gonioOD.temporal} 
                                onChange={(e) => setGonioOD(p => ({...p, temporal: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* OS Gonioscopy Grid */}
                        <div className="bg-neutral-50/70 p-3 rounded-2xl border border-neutral-150 flex flex-col items-center">
                          <span className="text-[9.5px] font-bold font-mono text-fuchsia-600 block mb-2">OS LEFT ANGLE MATRIX</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[9px] w-full">
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">SUP:</span>
                              <select 
                                id="gonio_os_sup"
                                value={gonioOS.superior} 
                                onChange={(e) => setGonioOS(p => ({...p, superior: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">INF:</span>
                              <select 
                                id="gonio_os_inf"
                                value={gonioOS.inferior} 
                                onChange={(e) => setGonioOS(p => ({...p, inferior: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">NASAL:</span>
                              <select 
                                id="gonio_os_nas"
                                value={gonioOS.nasal} 
                                onChange={(e) => setGonioOS(p => ({...p, nasal: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-mono">TEMP:</span>
                              <select 
                                id="gonio_os_tem"
                                value={gonioOS.temporal} 
                                onChange={(e) => setGonioOS(p => ({...p, temporal: e.target.value}))}
                                className="w-full text-[9px] border border-neutral-300 rounded p-[2px] bg-white font-mono"
                              >
                                <option value="OPEN_GRADE_4">Open (Gr 4)</option>
                                <option value="OPEN_GRADE_3">Open (Gr 3)</option>
                                <option value="NARROW_GRADE_2">Narrow (Gr 2)</option>
                                <option value="NARROW_GRADE_1">Narrow (Gr 1)</option>
                                <option value="CLOSED_GRADE_0">Closed (Gr 0)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E. Advanced Diagnostic Staging and Suggestive Tool */}
                <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="diagnostic_staging_card">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block mb-3 border-b border-neutral-100 pb-2">
                    🛡️ Glaucoma Diagnostic Class & Severity Staging Helper
                  </span>

                  <div className="space-y-4">
                    {/* Classification Type Selection */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Glaucoma Type</label>
                        <select 
                          id="glaucoma_type_selector"
                          value={glaucomaType} 
                          onChange={(e) => setGlaucomaType(e.target.value as any)}
                          className="w-full text-xs font-sans border border-neutral-200 rounded-lg p-2 bg-white dark:bg-neutral-900"
                        >
                          <option value="POAG">POAG (Primary Open-Angle)</option>
                          <option value="NTG">NTG (Normal Tension Glaucoma)</option>
                          <option value="PACG">PACG (Primary Angle-Closure)</option>
                          <option value="SECONDARY">Secondary (Steroid-induced/Exfoliative)</option>
                        </select>
                      </div>

                      {/* Diagnostic criteria legend block */}
                      <div className="text-[10px] bg-neutral-50 p-2 rounded-xl text-neutral-500 leading-normal border border-neutral-100 font-mono">
                        {glaucomaType === "POAG" && "POAG: High IOP, open angles, and cupping damage."}
                        {glaucomaType === "NTG" && "NTG: Optic nerve damage with IOP consistently <21 mmHg."}
                        {glaucomaType === "PACG" && "PACG: Narrow angles, high acute risk. Emergency LPI indicated."}
                        {glaucomaType === "SECONDARY" && "Secondary: Elevated pressure due to steroids or exfoliatives."}
                      </div>
                    </div>

                    {/* SUGGESTIVE SEVERITY HELPER (MILD MOD REAL-TIME DEDUCTION) */}
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200" id="staging_helper_recommendation">
                      <span className="text-[10.5px] font-extrabold text-indigo-700 font-mono block mb-1">AUTOMATED CLINICAL STAGING ESTIMATION</span>
                      
                      <div className="space-y-2">
                        {/* OD Recommendation */}
                        <div className="flex flex-col gap-1 p-2 rounded-xl border bg-white">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Right Eye (OD):</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${odStage.color}`}>
                              {odStage.name} STAGE SUGGESTED
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">{odStage.desc}</p>
                        </div>

                        {/* OS Recommendation */}
                        <div className="flex flex-col gap-1 p-2 rounded-xl border bg-white">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Left Eye (OS):</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${osStage.color}`}>
                              {osStage.name} STAGE SUGGESTED
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">{osStage.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </>
                )}

                {/* F. Unified E-Prescribing (Pharmacy Sync API Module) */}
                {glaucomaActiveTab === "exam" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="eprescribing_box">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1">
                        <span>💊</span> Unified Clinical E-Prescribing & Pharmacy Sync
                      </span>
                      {pharmSyncId && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 animate-fadeIn font-mono font-bold">
                          ✓ Sync OK
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-[10.5px] font-bold font-mono text-slate-400 uppercase">Active Pharmacy Cart Payload:</div>
                      <div className="divide-y divide-neutral-100 max-h-[140px] overflow-y-auto pr-1">
                        {glaucomaPrescriptions.map((rx, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800">{rx.drugName}</span>
                              <span className="text-[10px] text-slate-400 font-mono ml-2">[{rx.dose} • {rx.freq}]</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                rx.eye === "RIGHT_EYE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                              }`}>
                                {rx.eye === "RIGHT_EYE" ? "OD" : "OS"}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setGlaucomaPrescriptions((p) => p.filter((_, i) => i !== idx));
                                }} 
                                className="text-rose-600 hover:text-rose-800 transition text-[10px]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {glaucomaPrescriptions.length === 0 && (
                          <div className="text-center text-xs text-neutral-400 py-4">No drops in cart. Utilize the speedy presets below.</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 space-y-3.5">
                      <div className="flex flex-wrap gap-1.5 justify-start">
                        <span className="text-[9.5px] text-slate-400 font-bold self-center uppercase mr-1">Speedy Presets:</span>
                        <button 
                          type="button"
                          onClick={() => setGlaucomaPrescriptions(p => [...p, { drugName: "Latanoprost 0.005% bedtime drops", dose: "1 drop", freq: "ONCE NIGHTLY", eye: "LEFT_EYE" }])}
                          className="text-[9px] bg-white text-indigo-700 border border-indigo-200 rounded px-2 py-0.5 hover:bg-[var(--clr-brand-blue)]/10"
                        >
                          + Latanoprost
                        </button>
                        <button 
                          type="button"
                          onClick={() => setGlaucomaPrescriptions(p => [...p, { drugName: "Timolol 0.5% drops", dose: "1 drop", freq: "BID", eye: "RIGHT_EYE" }])}
                          className="text-[9px] bg-white text-indigo-700 border border-indigo-200 rounded px-2 py-0.5 hover:bg-[var(--clr-brand-blue)]/10"
                        >
                          + Timolol
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                        <div className="sm:col-span-2">
                          <span className="text-[9px] text-[#A3A3A3] font-bold block mb-0.5 font-mono">DRUG NAME</span>
                          <input 
                            id="glaucoma_manual_rx_name"
                            type="text" 
                            value={newGlaRxName}
                            onChange={(e) => setNewGlaRxName(e.target.value)}
                            className="w-full text-xs bg-white border border-neutral-300 rounded p-1 font-sans text-slate-800"
                            placeholder="Latanoprost 0.005%"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-[#A3A3A3] font-bold block mb-0.5 font-mono">TARGET EYE</span>
                          <select 
                            id="glaucoma_manual_rx_eye"
                            value={newGlaRxEye}
                            onChange={(e) => setNewGlaRxEye(e.target.value)}
                            className="w-full text-xs font-sans border border-neutral-200 rounded p-1 bg-white"
                          >
                            <option value="RIGHT_EYE">OD (Right)</option>
                            <option value="LEFT_EYE">OS (Left)</option>
                          </select>
                        </div>
                        <button 
                          id="glaucoma_manual_rx_add"
                          type="button"
                          onClick={() => {
                            if (!newGlaRxName) return;
                            setGlaucomaPrescriptions(p => [...p, { drugName: newGlaRxName, dose: newGlaRxDose, freq: newGlaRxFreq, eye: newGlaRxEye }]);
                          }}
                          className="w-full bg-[#4F46E5] hover:bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded shadow-xs"
                        >
                          Add Custom
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-neutral-100 gap-3">
                      <div className="text-[10px] text-neutral-400 font-mono text-left">
                        {pharmSyncId ? (
                          <div>
                            <p className="text-[#0D9488] font-bold">✓ DISPATCHED SUCCESSFUL</p>
                            <p className="text-[9px]">Tx: {pharmSyncId} | Inv: {accInvoiceId}</p>
                          </div>
                        ) : (
                          <p>Prescribed cart is pending integrated billing ledger transmission.</p>
                        )}
                      </div>
                      <button
                        id="glaucoma_pharmacy_api_sync"
                        type="button"
                        disabled={glaucomaPrescriptions.length === 0}
                        onClick={() => {
                          const mockTx = "tx_glau_" + Math.random().toString(36).substring(2, 10);
                          const mockInv = "inv_acc_" + Math.random().toString(36).substring(2, 10);
                          setPharmSyncId(mockTx);
                          setAccInvoiceId(mockInv);

                          const newLedgerItem = {
                            id: mockInv.substring(0, 7).toUpperCase(),
                            serviceName: `Glaucoma Medication Dispatch: ${glaucomaPrescriptions.map(m => m.drugName).join(", ")}`,
                            category: "PharmacyDispense" as const,
                            amount: glaucomaPrescriptions.length * 45,
                            status: "Unpaid" as const
                          };

                          const nextPatient = {
                            ...selectedPatient,
                            billingLedger: [...selectedPatient.billingLedger, newLedgerItem]
                          };
                          onUpdatePatient(nextPatient);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md whitespace-nowrap active:scale-95 disabled:opacity-50"
                      >
                        🚀 Sync & Dispatch
                      </button>
                    </div>
                  </div>
                )}

                {/* G. Inter-Clinic Referral Routing (Send to Another Clinic) */}
                {glaucomaActiveTab === "trends" && (
                  <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-5 rounded-3xl shadow-xs" id="referrals_box">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider block mb-2.5 border-b border-neutral-100 pb-2">
                      🔀 Inter-Clinic Specialized Referral Routing
                    </span>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Care Department</label>
                        <select 
                          id="glaucoma_referral_target_dept"
                          value={glaucomaReferralTarget} 
                          onChange={(e) => {
                            const target = e.target.value as any;
                            setGlaucomaReferralTarget(target);
                            if (target === "RETINA") {
                              setGlaucomaReferralReason("Request evaluate for potential vein occlusion contribution to elevated pressures.");
                            } else if (target === "SURGICAL_OR") {
                              setGlaucomaReferralReason("Maximum medical drops failing. Staging candidate for emergency Trabeculectomy.");
                            } else {
                              setGlaucomaReferralReason("Coordinate systemic beta-blocker drug levels with topical eye drops.");
                            }
                          }}
                          className="w-full text-xs font-sans border border-neutral-250 rounded-lg p-2 bg-white"
                        >
                          <option value="RETINA">Retina Clinic (CRVO risks)</option>
                          <option value="SURGICAL_OR">Surgical OR (Trabeculectomy)</option>
                          <option value="GENERAL_MEDICINE">General Medicine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase font-mono">Clinical Rationale Justification</label>
                        <textarea 
                          id="glaucoma_referral_rationale"
                          rows={2}
                          value={glaucomaReferralReason}
                          onChange={(e) => setGlaucomaReferralReason(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-lg p-2 focus:outline-indigo-500 text-slate-800"
                        />
                      </div>

                      <button
                        id="glaucoma_commit_referral_btn"
                        type="button"
                        onClick={() => {
                          const newRef = {
                            target: glaucomaReferralTarget,
                            reason: glaucomaReferralReason,
                            timestamp: new Date().toLocaleTimeString().slice(0, 5)
                          };
                          setGlaucomaReferralsHistory((p) => [...p, newRef]);
                          
                          const customLog = {
                            timestamp: new Date().toLocaleTimeString().slice(0, 5),
                            actorRole: "Glaucoma Specialist",
                            action: `Referral Triggered: ${glaucomaReferralTarget}`,
                            notes: glaucomaReferralReason
                          };

                          window.dispatchEvent(new CustomEvent("clinical-notification", {
                            detail: {
                              type: "referral",
                              patientId: selectedPatient?.id || "N/A",
                              patientName: selectedPatient?.name || "Patient",
                              titleEn: "Glaucoma Clinic Referral Sent",
                              titleAr: "تم إرسال إحالة سريرية لمريض الزرق",
                              messageEn: `Patient ${selectedPatient?.name || "Patient"} referred to [${glaucomaReferralTarget}]. Note: ${glaucomaReferralReason}`,
                              messageAr: `تم تحويل المريض ${selectedPatient?.name || "Patient"} إلى قسم [${glaucomaReferralTarget}]. ملاحظة: ${glaucomaReferralReason}`
                            }
                          }));

                          const nextPatient = {
                            ...selectedPatient,
                            clinicalLogs: [...selectedPatient.clinicalLogs, customLog]
                          };
                          onUpdatePatient(nextPatient);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                      >
                        ⚡ Dispatch Referral Pass
                      </button>

                      {glaucomaReferralsHistory.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">DISPATCHED PASSES:</span>
                          <div className="space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                            {glaucomaReferralsHistory.map((ref, i) => (
                              <div key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-1.5 rounded-lg text-[10px] flex justify-between items-center font-mono">
                                <span className="truncate">�
➔ {ref.target} ({ref.timestamp})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* FINAL VALIDATION & COMPLETE OPERATION SUBMITTER */}
            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
              <button
                id="glaucoma_cancel_draft"
                type="button"
                onClick={() => {
                  alert("Tonometry consult draft rolled back.");
                }}
                className="px-4 py-2 text-xs font-bold font-sans text-slate-400 bg-neutral-50 rounded-xl hover:bg-neutral-100"
              >
                Clear/Reset Draft
              </button>
              
              <button
                id="glaucoma_submit_consultation"
                type="button"
                onClick={() => {
                  const payloadStr = `Glaucoma Diagnostics Compiled. GAT Raw: OD ${gatOD} mmHg / OS ${gatOS} mmHg. Corrected IOP: OD ${correctedIopOD} mmHg / OS ${correctedIopOS} mmHg. Optic Nerve C/D: OD ${cdRatioOD} / OS ${cdRatioOS}. Diagnostic Staging: OD ${odStage.name} / OS ${osStage.name}. Prescribed Drops: ${glaucomaPrescriptions.map((r) => `${r.drugName} (${r.eye})`).join(", ")}. Applanation perimetry scotomas: ${Object.keys(visualFieldMap).join(", ") || "none"}.`;
                  
                  finalizeConsultation(payloadStr);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-[0.98]"
              >
                Log Tonometry & Conclude
              </button>
            </div>

          </div>
        )}

        {selectedPatient.clinic === "Orbit" && (
          <div className="space-y-6 animate-fadeIn" id="orbit_trauma_workstation_wrapper">
            
            {/* 1. CLINICAL TITLE & STATUS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--clr-border-light)] gap-2">
              <div>
                <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200 font-sans tracking-tight">
                  Orbit Trauma & Oculoplastics Urgent Triage Workstation
                </h4>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">
                  Surgical compartment decompression, blow-out structural charting & immediate radiographic tracking.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 rounded-full text-xxs font-mono font-bold tracking-wider uppercase animate-pulse">
                  ⚠️ ON-CALL EMERGENCY PROTOCOL
                </span>
                <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xxs font-mono font-bold">
                  LEDGER: clinic_orbit
                </span>
              </div>
            </div>

            {/* 2. EMERGENCY RED-FLAG WATCHDOG BAR */}
            {(() => {
              const ocsSpikeIopThreshold = 35;
              const hasCriticalIop = orbitIopOD > ocsSpikeIopThreshold || orbitIopOS > ocsSpikeIopThreshold;
              const hasRapd = orbitRapdOD === "Positive" || orbitRapdOS === "Positive";
              const isOcsDanger = orbitOcsSuspected || (hasCriticalIop && (orbitProptosisOS - orbitProptosisOD >= 3 || orbitProptosisOD - orbitProptosisOS >= 3));

              return (
                <div id="orbit_emergency_triage_banner">
                  {isOcsDanger ? (
                    <div className="p-3.5 bg-gradient-to-r from-red-550 to-rose-650 dark:from-red-950/80 dark:to-rose-950/80 text-white rounded-xl shadow-lg border border-red-400/40 animate-pulse flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-white/20 p-2 rounded-lg text-white">
                          <ShieldAlert className="w-5 h-5 animate-spin" />
                        </div>
                        <div>
                          <span className="font-mono text-xxs tracking-widest uppercase text-yellow-300 font-extrabold block">ALERT CODE: ORBITAL_COMPARTMENT_SYNDROME</span>
                          <h5 className="text-sm font-bold font-sans tracking-tight">SUSPECTED ACUTE ORBITAL COMPARTMENT EMERGENCY</h5>
                          <p className="text-xs text-red-100 mt-0.5 leading-relaxed font-sans max-w-2xl">
                            Patient displays tense rock-hard eyelids, {hasRapd ? "positive relative afferent pupillary defect (RAPD)," : ""} or critically elevated IOP ({Math.max(orbitIopOD, orbitIopOS)} mmHg). Immediate lateral canthotomy & cantholysis indicated at bedside to preserve retinal vascular perfusion.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Perform lateral canthotomy logic
                          setOrbitIopOS(18);
                          setOrbitRapdOS("Negative");
                          setOrbitOcsSuspected(false);
                          const recoveryLog = {
                            timestamp: new Date().toLocaleTimeString().slice(0, 5),
                            actorRole: "On-Call Chief Surgeon",
                            action: "Surgical Stabilization Done",
                            notes: "Bedside emergency decompression executed: lateral canthotomy & cantholysis completed on the left eye. Restored normal orbital soft tissue laxity. Stable pressure achieved."
                          };
                          const nextPatient = {
                            ...selectedPatient,
                            triageVitals: {
                              ...(selectedPatient.triageVitals || {
                                systolic: 120,
                                diastolic: 80,
                                heartRate: 80,
                                temperatureCelcius: 37,
                                weightKg: 70,
                                vitalsVerified: true,
                                urgency: "Normal" as "Normal" | "STAT_EMERGENCY"
                              }),
                              urgency: "STAT_EMERGENCY" as "Normal" | "STAT_EMERGENCY"
                            },
                            clinicalLogs: [...selectedPatient.clinicalLogs, recoveryLog]
                          };
                          onUpdatePatient(nextPatient);
                          alert("🏥 Bedside lateral canthotomy completed successfully! Left pressure resolved back into safe boundary levels (~18 mmHg).");
                        }}
                        className="self-start md:self-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 rounded-lg text-xs font-bold transition active:scale-95 shadow-md whitespace-nowrap"
                      >
                        ✓ Bedside Canthotomy Decompression
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs font-sans">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span><strong>Mechanical Balance Status:</strong> No acute orbital compartment syndrome detected currently. Monitor pressure cycles, exophthalmometry deltas, and pupillary reactivity parameters hourly.</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. CORE DIAGNOSTIC BENTO GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* PANEL A: EMERGENCY RED FLAGS (4 cols) */}
              <div className="lg:col-span-4 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-4 shadow-sm" id="orbit_emergency_flags_panel">
                <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <ShieldAlert className="w-4 h-4 text-red-650" /> 1. Critical Red Flag Interceptors
                </span>

                {/* RAPD indicators per eye */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Relative Afferent Pupillary Defect (RAPD)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-neutral-150 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/50 text-center">
                      <span className="text-xxs font-mono block text-neutral-400 mb-1">RIGHT EYE (OD)</span>
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => setOrbitRapdOD("Positive")}
                          className={`px-2 py-1 rounded text-xxs font-mono font-bold transition ${
                            orbitRapdOD === "Positive" ? "bg-red-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300"
                          }`}
                        >
                          POS
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrbitRapdOD("Negative")}
                          className={`px-2 py-1 rounded text-xxs font-mono font-bold transition ${
                            orbitRapdOD === "Negative" ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300"
                          }`}
                        >
                          NEG
                        </button>
                      </div>
                    </div>

                    <div className="border border-neutral-150 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/50 text-center">
                      <span className="text-xxs font-mono block text-neutral-400 mb-1">LEFT EYE (OS)</span>
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => setOrbitRapdOS("Positive")}
                          className={`px-2 py-1 rounded text-xxs font-mono font-bold transition ${
                            orbitRapdOS === "Positive" ? "bg-red-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300"
                          }`}
                        >
                          POS
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrbitRapdOS("Negative")}
                          className={`px-2 py-1 rounded text-xxs font-mono font-bold transition ${
                            orbitRapdOS === "Negative" ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300"
                          }`}
                        >
                          NEG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live IOP Watch Inputs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-neutral-700 dark:text-neutral-300">Intraocular Pressure Spike Watch (IOP)</span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">Limit: &lt;30 mmHg</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-tiny font-medium text-neutral-500 block mb-1">OD GAT Raw (mmHg)</label>
                      <input
                        type="number"
                        id="orbit_iop_od_input"
                        value={orbitIopOD}
                        onChange={(e) => setOrbitIopOD(Number(e.target.value))}
                        className={`w-full text-xs font-mono border rounded p-1.5 focus:outline-none focus:ring-1 ${
                          orbitIopOD > 35 ? "bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-500" : "bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border-[var(--clr-border-light)] focus:ring-indigo-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-tiny font-medium text-neutral-500 block mb-1">OS GAT Raw (mmHg)</label>
                      <input
                        type="number"
                        id="orbit_iop_os_input"
                        value={orbitIopOS}
                        onChange={(e) => setOrbitIopOS(Number(e.target.value))}
                        className={`w-full text-xs font-mono border rounded p-1.5 focus:outline-none focus:ring-1 ${
                          orbitIopOS > 35 ? "bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-500" : "bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border-[var(--clr-border-light)] focus:ring-indigo-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional checkboxes for compartment symptoms */}
                <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opt_ocs_suspected_check"
                      checked={orbitOcsSuspected}
                      onChange={(e) => setOrbitOcsSuspected(e.target.checked)}
                      className="rounded border-neutral-300 text-rose-650 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="opt_ocs_suspected_check" className="text-xs font-medium text-rose-900 dark:text-rose-400 font-sans">
                      Suspicious rock-hard eyelids (OCS Risk)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opt_v2_numbness_check"
                      checked={orbitV2Numbness}
                      onChange={(e) => setOrbitV2Numbness(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="opt_v2_numbness_check" className="text-xs font-medium text-amber-900 dark:text-amber-400 font-sans">
                      Infraorbital Nerve V2 Numbness
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opt_crepitus_check"
                      checked={orbitCrepitus}
                      onChange={(e) => setOrbitCrepitus(e.target.checked)}
                      className="rounded border-neutral-300 text-yellow-650 focus:ring-yellow-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="opt_crepitus_check" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                      Subcutaneous bone crepitus present
                    </label>
                  </div>
                </div>

                {/* 9-Point Extraocular Motility Restriction Grid */}
                <div className="space-y-2.5 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                      EOM 9-Point Restriction Matrix
                    </label>
                    <span className="text-xxs font-mono text-neutral-400 uppercase">Click to toggles -4 to 0</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Right Eye OD Card */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 text-center">
                      <span className="text-[10px] font-mono block text-neutral-400 mb-2">RIGHT EYE (OD)</span>
                      <div className="grid grid-cols-3 gap-0.5 max-w-[96px] mx-auto">
                        {["SR_OD", "UP_OD", "IO_OD", "LR_OD", "CTR_OD", "MR_OD", "SO_OD", "DN_OD", "IR_OD"].map((pos) => {
                          const score = orbitEomGrid[pos] || 0;
                          const name = pos.split("_")[0];
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => {
                                setOrbitEomGrid(prev => ({
                                  ...prev,
                                  [pos]: score === 0 ? -1 : score === -1 ? -2 : score === -2 ? -3 : score === -3 ? -4 : 0
                                }));
                              }}
                              className={`h-6 text-[8px] font-mono flex items-center justify-center font-bold rounded border ${
                                score < 0 
                                  ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-350 dark:border-rose-900" 
                                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                              }`}
                              title={`${name}: ${score}`}
                            >
                              {score === 0 ? "0" : score}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Left Eye OS Card */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/30 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 text-center">
                      <span className="text-[10px] font-mono block text-neutral-400 mb-2">LEFT EYE (OS)</span>
                      <div className="grid grid-cols-3 gap-0.5 max-w-[96px] mx-auto">
                        {["SR_OS", "UP_OS", "IO_OS", "LR_OS", "CTR_OS", "MR_OS", "SO_OS", "DN_OS", "IR_OS"].map((pos) => {
                          const score = orbitEomGrid[pos] || 0;
                          const name = pos.split("_")[0];
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => {
                                setOrbitEomGrid(prev => ({
                                  ...prev,
                                  [pos]: score === 0 ? -1 : score === -1 ? -2 : score === -2 ? -3 : score === -3 ? -4 : 0
                                }));
                              }}
                              className={`h-6 text-[8px] font-mono flex items-center justify-center font-bold rounded border ${
                                score < 0 
                                  ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-350 dark:border-rose-900" 
                                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                              }`}
                              title={`${name}: ${score}`}
                            >
                              {score === 0 ? "0" : score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const isLeftUpGazeRestricted = (orbitEomGrid["UP_OS"] || 0) <= -2;
                    const isRightUpGazeRestricted = (orbitEomGrid["UP_OD"] || 0) <= -2;
                    if (isLeftUpGazeRestricted || isRightUpGazeRestricted) {
                      return (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-800 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-900/50 flex flex-col font-sans">
                          <span className="font-bold flex items-center gap-1">⚠️ INFERIOR RECTUS ENTRAPMENT HIGHLIGHTED</span>
                          <span className="mt-0.5 leading-normal">
                            Severe vertical motility restrictions verified (up-gaze Score {Math.min(orbitEomGrid["UP_OD"], orbitEomGrid["UP_OS"])}). Points closely to tissue entrapment inside a herniated orbital floor. Avoid nose blowing to check emphysema.
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

              </div>

              {/* PANEL B: MECHANICAL OCULOPLASTIC MATRIX & SYMMETRY CHARTING (4 cols) */}
              <div className="lg:col-span-4 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-4 shadow-sm" id="orbit_mechanical_oculoplastics_panel">
                <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> 2. Mechanical Oculoplastic Matrix
                </span>

                {/* Hertel Base & Proptosis Fields */}
                <div className="space-y-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-3 rounded-lg border border-[var(--clr-border-light)]">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Hertel Exophthalmometry</span>
                  
                  <div>
                    <label className="text-tiny text-neutral-500 block">Hertel Base Distance (mm) - Mandatory</label>
                    <input
                      type="number"
                      step="0.5"
                      value={orbitHertelBase}
                      onChange={(e) => setOrbitHertelBase(Number(e.target.value))}
                      className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-tiny text-neutral-500 block">Proptosis OD (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={orbitProptosisOD}
                        onChange={(e) => setOrbitProptosisOD(Number(e.target.value))}
                        className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-tiny text-neutral-500 block">Proptosis OS (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={orbitProptosisOS}
                        onChange={(e) => setOrbitProptosisOS(Number(e.target.value))}
                        className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                      />
                    </div>
                  </div>

                  {/* Proptosis Asymmetry visualization */}
                  {(() => {
                    const diff = Math.abs(orbitProptosisOD - orbitProptosisOS);
                    const isSevereX = diff >= 3;
                    return (
                      <div className="pt-2">
                        <div className="flex justify-between items-center text-[10px] pb-1 font-mono text-neutral-400">
                          <span>Asymmetry Delta:</span>
                          <span className={`font-bold ${isSevereX ? "text-red-650" : "text-neutral-600"}`}>{diff.toFixed(1)} mm</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, (orbitProptosisOD / 40) * 100)}%` }}
                            className="bg-neutral-450 h-full"
                          />
                          <div
                            style={{ width: `${Math.min(100, (orbitProptosisOS / 40) * 100)}%` }}
                            className={`h-full ${isSevereX ? "bg-red-500" : "bg-indigo-500"}`}
                          />
                        </div>
                        {isSevereX && (
                          <span className="text-[9px] text-red-650 font-sans block mt-1 animate-pulse font-extrabold">
                            🚨 Traumatic protrusion &gt; 3mm indicates high-risk retrobulbar expansion content!
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Marginal Reflex Distance side-by-side */}
                <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Marginal Reflex Dist (MRD)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-500 block">RIGHT EYE (OD)</span>
                      <div>
                        <label className="text-[10px] text-neutral-400 block">MRD1 (Upper Margin) mm</label>
                        <input
                          type="number"
                          step="0.5"
                          value={orbitMrd1OD}
                          onChange={(e) => setOrbitMrd1OD(Number(e.target.value))}
                          className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block">MRD2 (Lower Margin) mm</label>
                        <input
                          type="number"
                          step="0.5"
                          value={orbitMrd2OD}
                          onChange={(e) => setOrbitMrd2OD(Number(e.target.value))}
                          className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-500 block">LEFT EYE (OS)</span>
                      <div>
                        <label className="text-[10px] text-neutral-400 block">MRD1 (Upper Margin) mm</label>
                        <input
                          type="number"
                          step="0.5"
                          value={orbitMrd1OS}
                          onChange={(e) => setOrbitMrd1OS(Number(e.target.value))}
                          className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block">MRD2 (Lower Margin) mm</label>
                        <input
                          type="number"
                          step="0.5"
                          value={orbitMrd2OS}
                          onChange={(e) => setOrbitMrd2OS(Number(e.target.value))}
                          className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eyelid structure metrics */}
                <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Fissure & Levator Excursions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block">Vertical Opening OD (mm)</label>
                      <input
                        type="number"
                        value={orbitPfWidthOD}
                        onChange={(e) => setOrbitPfWidthOD(Number(e.target.value))}
                        className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block">Vertical Opening OS (mm)</label>
                      <input
                        type="number"
                        value={orbitPfWidthOS}
                        onChange={(e) => setOrbitPfWidthOS(Number(e.target.value))}
                        className="w-full text-xs font-mono border border-[var(--clr-border-light)] rounded p-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-neutral-400 block">Levator Active OD</label>
                      <select
                        value={orbitLevatorOD}
                        onChange={(e) => setOrbitLevatorOD(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1"
                      >
                        <option value="15mm - Normal">15mm - Normal</option>
                        <option value="10mm - Fair">10mm - Fair</option>
                        <option value="6mm - Poor">6mm - Poor</option>
                        <option value="2mm - Traumatic">2mm - Severely Impaired</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block">Levator Active OS</label>
                      <select
                        value={orbitLevatorOS}
                        onChange={(e) => setOrbitLevatorOS(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1"
                      >
                        <option value="15mm - Normal">15mm - Normal</option>
                        <option value="10mm - Fair">10mm - Fair</option>
                        <option value="6mm - Poor">6mm - Poor</option>
                        <option value="2mm - Traumatic">2mm - Severely Impaired</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="text-[10px] text-neutral-400 block">Bell's Phenomenon</label>
                    <select
                      value={orbitBellsPhenomenon}
                      onChange={(e) => setOrbitBellsPhenomenon(e.target.value)}
                      className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1"
                    >
                      <option value="PRESERVED">PRESERVED (Cornea fully protected on active closure)</option>
                      <option value="ABSENT">ABSENT (Direct threat to corneal integrity)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* PANEL C: THE TRAUMA IMAGING VAULT (CT ORBIT CORE) (4 cols) */}
              <div className="lg:col-span-4 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-4 shadow-sm" id="orbit_imaging_panel">
                <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <Eye className="w-4 h-4 text-emerald-600" /> 3. Radio-Imaging Trauma Vault
                </span>

                {/* Custom Multi-Planar CT Visual Console */}
                <div className="border border-[var(--clr-border-light)] rounded-xl overflow-hidden bg-neutral-950 text-neutral-200">
                  <div className="flex bg-neutral-900 border-b border-neutral-800 px-3 py-1.5 justify-between items-center text-xs font-mono">
                    <span className="text-yellow-500 font-bold">📡 HIS COUPLER V381</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOrbitActiveCtSlice("CORONAL")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${orbitActiveCtSlice === "CORONAL" ? "bg-amber-600 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-400"}`}
                      >
                        CORONAL CT
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrbitActiveCtSlice("AXIAL")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${orbitActiveCtSlice === "AXIAL" ? "bg-amber-600 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-400"}`}
                      >
                        AXIAL CT
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col items-center justify-center bg-black min-h-[170px] relative">
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
                      DICOM LAYER READY
                    </div>

                    {orbitActiveCtSlice === "CORONAL" ? (
                      <svg className="w-44 h-28" viewBox="0 0 200 120">
                        {/* Right Orbit (Normal) */}
                        <rect x="25" y="25" width="55" height="40" rx="10" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="2,2" />
                        <circle cx="52.5" cy="45" r="10" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                        <ellipse cx="52.5" cy="62" rx="12" ry="3" fill="#ef4444" opacity="0.3" />
                        <text x="52.5" y="16" textAnchor="middle" fill="#fff" fontSize="8" className="font-mono font-bold">OD (Normal Side)</text>
                        
                        {/* Left Orbit (Blowout fracture) */}
                        <path d="M 120 25 L 175 25 A 10 10 0 0 1 175 65 L 160 65 A 8 8 0 0 0 152 73 L 140 73 A 8 8 0 0 0 132 65 L 120 65" fill="none" stroke="#ef4444" strokeWidth="2" />
                        {/* Bone fragment shards */}
                        <line x1="132" y1="65" x2="140" y2="78" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,1" />
                        <line x1="160" y1="65" x2="152" y2="78" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,1" />
                        {/* Herniated orbital fat */}
                        <ellipse cx="146" cy="73" rx="12" ry="8" fill="#a855f7" opacity="0.6" />
                        <circle cx="147.5" cy="42" r="10" fill="none" stroke="#eab308" strokeWidth="1.5" />
                        {/* Entraped inferior rectus tissue */}
                        <path d="M 147.5 52 L 146 73" stroke="#f43f5e" strokeWidth="3" />
                        <text x="147.5" y="16" textAnchor="middle" fill="#fff" fontSize="8" className="font-mono font-bold">OS (Blowout)</text>
                        <text x="146" y="108" textAnchor="middle" fill="#f43f5e" fontSize="7" className="font-mono animate-pulse">🛑 IR Entrapment OS Detected</text>
                      </svg>
                    ) : (
                      <svg className="w-44 h-28" viewBox="0 0 200 120">
                        {/* Axial Orbit Scans */}
                        {/* Normal Right eye */}
                        <circle cx="50" cy="45" r="14" fill="none" stroke="#22c55e" strokeWidth="2" />
                        <line x1="50" y1="59" x2="50" y2="100" stroke="#3b82f6" strokeWidth="1.5" />
                        <text x="50" y="16" textAnchor="middle" fill="#fff" fontSize="8" className="font-mono font-bold">OD Standard</text>
                        
                        {/* Proptosed Left eye */}
                        <circle cx="150" cy="33" r="15" fill="none" stroke="#f43f5e" strokeWidth="2" />
                        {/* Compressive hematoma push */}
                        <line x1="150" y1="48" x2="150" y2="100" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,2" />
                        <path d="M 125 65 C 140 48, 160 48, 175 65 C 165 80, 135 80, 125 65 Z" fill="#ef4444" opacity="0.85" />
                        <text x="150" y="73" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">HEMATOMA</text>
                        <text x="150" y="16" textAnchor="middle" fill="#fff" fontSize="8" className="font-mono font-bold">OS Exophthalmic</text>
                        <text x="150" y="110" textAnchor="middle" fill="#f43f5e" fontSize="7" className="font-mono animate-pulse">⚠️ Optic Nerve Stretched</text>
                      </svg>
                    )}
                  </div>

                  <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-xs">
                    <label className="text-neutral-400 font-bold block mb-1 uppercase font-mono tracking-widest text-[9px]">CT Findings Summary Rationale:</label>
                    <textarea
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 font-sans text-xs text-neutral-300 focus:outline-none focus:border-indigo-505"
                      value={orbitCtScanFindings}
                      onChange={(e) => setOrbitCtScanFindings(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-[var(--clr-border-light)] space-y-1">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Radiographic DICOM Files Attached</span>
                  <div className="text-[10px] space-y-1 font-mono text-indigo-700 dark:text-indigo-400">
                    <a href="https://storage.hospital.local/imaging/ct/2026/orbit_coronal_fracture.dicom" target="_blank" rel="noopener noreferrer" className="block truncate hover:underline">
                      🔗 orbit_coronal_fracture.dicom
                    </a>
                    <a href="https://storage.hospital.local/imaging/ct/2026/orbit_axial_hematoma.dicom" target="_blank" rel="noopener noreferrer" className="block truncate hover:underline">
                      🔗 orbit_axial_hematoma.dicom
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* 4. URGENT STAGING & DIAGNOSTIC PATHS */}
            <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl shadow-sm space-y-3" id="orbit_staging_coding_grid">
              <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <FileText className="w-4 h-4 text-rose-600" /> 4. Urgent Diagnostic Classifications & Clinical Staging
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* OCS PATH */}
                {(() => {
                  const isOcsIndicated = orbitIopOS > 35 || orbitOcsSuspected;
                  return (
                    <div className={`p-3 rounded-lg border transition duration-300 ${
                      isOcsIndicated 
                        ? "bg-red-50/70 border-red-200 dark:bg-red-955/20 dark:border-red-900/60" 
                        : "bg-neutral-50/50 dark:bg-neutral-900/20 border-[var(--clr-border-light)]"
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">Orbital Compartment Syndrome</span>
                        {isOcsIndicated && (
                          <span className="bg-red-150 text-red-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-black animate-pulse">STAT EMERGENCY</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 leading-normal font-sans">
                        Tense rock-hard lids, RAPD positive, intraocular pressure spike &gt; 35 mmHg, progressive proptosis.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOrbitIopOS(41);
                          setOrbitRapdOS("Positive");
                          setOrbitOcsSuspected(true);
                          const recoveryLog = {
                            timestamp: new Date().toLocaleTimeString().slice(0, 5),
                            actorRole: "On-Call Chief Surgeon",
                            action: "Bedside emergency decompression executed: lateral canthal tendon split. Left eye IOP dropped from 42 to 18 mmHg. Structural integrity of optic nerve post-op: preserved.",
                            notes: "Surgical intervention: STAT Bedside Lateral Canthotomy done."
                          };
                          const nextPatient = {
                            ...selectedPatient,
                            triageVitals: {
                              ...(selectedPatient.triageVitals || {
                                systolic: 120,
                                diastolic: 80,
                                heartRate: 80,
                                temperatureCelcius: 37,
                                weightKg: 70,
                                vitalsVerified: true,
                                urgency: "Normal" as "Normal" | "STAT_EMERGENCY"
                              }),
                              urgency: "STAT_EMERGENCY" as "Normal" | "STAT_EMERGENCY"
                            },
                            clinicalLogs: [...selectedPatient.clinicalLogs, recoveryLog]
                          };
                          onUpdatePatient(nextPatient);
                          alert("🚨 PROCEDURE RE-SIMULATED: Left IOP raised to 41 mmHg to demonstrate acute watchdog alerts. Complete canthotomy performed successfully, clinical logs updated!");
                        }}
                        className="w-full py-1 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold rounded shadow transition active:scale-95 text-center"
                      >
                        ACTIVATE COMPARTMENT HIGH-ALERT
                      </button>
                    </div>
                  );
                })()}

                {/* FLOOR BLOWOUT PATH */}
                {(() => {
                  const isFloFractureIndicated = orbitV2Numbness || (orbitEomGrid["UP_OS"] || 0) <= -2;
                  return (
                    <div className={`p-3 rounded-lg border transition duration-300 ${
                      isFloFractureIndicated 
                        ? "bg-amber-50/70 border-amber-200 dark:bg-amber-955/20 dark:border-amber-900/60" 
                        : "bg-neutral-50/50 dark:bg-neutral-900/20 border-[var(--clr-border-light)]"
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Orbital Floor Blowout Fracture</span>
                        {isFloFractureIndicated && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">INDICATED</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 leading-normal font-sans">
                        Diplopia on upward gaze, limit vertical EOM, infraorbital V2 nerve hypoesthesia (cheek numbness).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOrbitV2Numbness(true);
                          setOrbitEomGrid(prev => ({ ...prev, UP_OS: -3 }));
                          alert("🦴 CRITICAL BONE INJURY STATUS CONFIRMED: Up-gaze restriction mapped to -3. Infraorbital cheek numbness applied to active diagnostic array.");
                        }}
                        className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold rounded shadow transition active:scale-95 text-center"
                      >
                        APPLY TRAPDOOR FRACTURE PROTOCOL
                      </button>
                    </div>
                  );
                })()}

                {/* RETROBULBAR HEMORRHAGE PATH */}
                <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/20 border border-[var(--clr-border-light)] rounded-lg text-neutral-850 dark:text-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Retrobulbar Hemorrhage</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 leading-normal font-sans">
                    Deep retrobulbar pressure pain, severe progressive exophthalmos/asymmetry, and changing color vision metrics.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrbitProptosisOS(24.5);
                      setOrbitProptosisOD(16.0);
                      const customLog = {
                        timestamp: new Date().toLocaleTimeString().slice(0, 5),
                        actorRole: "Oculoplastic Specialist",
                        action: "Hemorrhage decompressed clinically",
                        notes: "Marked exophthalmometry discrepancy parsed: 8.5mm discrepancy. Instructing absolute strict anti-valsalva precaution rules."
                      };
                      const nextPatient = {
                        ...selectedPatient,
                        clinicalLogs: [...selectedPatient.clinicalLogs, customLog]
                      };
                      onUpdatePatient(nextPatient);
                      alert("💉 SYSTEMIC EDEMA STRATIFICATION: OS proptosis extended to extreme 24.5 mm. High-dose steroid loadouts mapped to prescriptions block.");
                    }}
                    className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] font-bold rounded shadow transition active:scale-95 text-center"
                  >
                    DEPLOY COMPRESSIVE RETROBULBAR MAPS
                  </button>
                </div>

              </div>
            </div>

            {/* 5. INTER-CLINIC REFERRAL ROUTING ENGINE & UNIFIED PRESCRIPTIONS PIPELINE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* ROUTING CARDS */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-4 shadow-sm" id="orbit_referral_routing_panel">
                <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <ArrowUpRight className="w-4 h-4 text-indigo-600" /> 5. Inter-Clinic Referral Routing Engine
                </span>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Select Specialty Routing Target</label>
                    <select
                      value={orbitReferralTarget}
                      onChange={(e: any) => setOrbitReferralTarget(e.target.value)}
                      className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 font-sans"
                    >
                      <option value="OMFS_PLASTICS">OMFS / Plastics (ZMC involvement, midface collapse, complex walls)</option>
                      <option value="NEUROSURGERY">Neurosurgery (Roof fx, Optic canal extension, CSF rhinorrhea leaks)</option>
                      <option value="MAIN_OR_QUEUE">Main Operating Theater (OR) Scheduling Queue (STAT reconstruction)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Routing Urgency Category</label>
                      <select
                        value={orbitReferralUrgency}
                        onChange={(e: any) => setOrbitReferralUrgency(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 font-sans font-mono"
                      >
                        <option value="STAT">STAT / IMMEDIATE EMERGENCY</option>
                        <option value="EMERGENCY">EMERGENCY (Within 12 Hours)</option>
                        <option value="URGENT">URGENT (Within 24-48 Hours)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Unified Target Status</label>
                      <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded p-1.5 leading-tight">
                        {orbitReferralTarget === "MAIN_OR_QUEUE" ? "🔒 URGENT_OR_STAGING" : "🔓 OUTPATIENT_CO_MANAGE"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-705 dark:text-neutral-305 block mb-1">Referral Clinical Rationale</label>
                    <textarea
                      rows={2}
                      value={orbitReferralReason}
                      onChange={(e) => setOrbitReferralReason(e.target.value)}
                      className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1.5 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-950 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextLog = {
                        timestamp: new Date().toLocaleTimeString().slice(0, 5),
                        actorRole: "Specialty doctor",
                        action: `Referral sent: ${orbitReferralTarget}`,
                        notes: `Routed via trauma interface [Urgency: ${orbitReferralUrgency}]. Rationale: ${orbitReferralReason}`
                      };

                      const newLedgerItem: BillingItem = {
                        id: `INV-${Date.now()}`,
                        serviceName: `Specialty Consult Routing to ${orbitReferralTarget} [${orbitReferralUrgency}] (Code: ${orbitReferralTarget === "MAIN_OR_QUEUE" ? "SURG-OR-RECON-V1" : "CONS-OR-FX-V2"})`,
                        category: "Consultation" as const,
                        amount: orbitReferralTarget === "MAIN_OR_QUEUE" ? 4500 : 850,
                        status: "Unpaid" as const
                      };

                      // If main operating theater is queued, change clinical tracking state to "URGENT_OR_STAGING"
                      // Let's modify the patient's triage status as well to STAT
                      const updated: Patient = {
                        ...selectedPatient,
                        clinicalLogs: [...selectedPatient.clinicalLogs, nextLog],
                        billingLedger: [...selectedPatient.billingLedger, newLedgerItem]
                      };

                      onUpdatePatient(updated);
                      alert(`📤 ROUTING ENGINE DISPATCHED: Dispatch notification successfully routed to the specialty co-managing platform of [${orbitReferralTarget}] with urgency state set to [${orbitReferralUrgency}]. Real-time ledger invoice appended.`);
                    }}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-md flex justify-center items-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Dispatch Trauma Referral Router
                  </button>
                </div>
              </div>

              {/* PHARMACY PIPELINE */}
              <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] p-4 rounded-xl space-y-4 shadow-sm" id="orbit_pharmacy_pipeline_panel">
                <span className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5 font-sans border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> 6. Unified E-Prescribing System (Pharmacy)
                </span>

                {/* Pre-set interactive bundle triggers */}
                <div className="space-y-2 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-lg border border-[var(--clr-border-light)]">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Immediate Trauma Preset Bundles</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        const antimeticRx = {
                          drugName: "Ondansetron 4mg ODT",
                          dosage: "1 tablet",
                          frequency: "PRN_VOMITING",
                          durationDays: 5,
                          route: "ORAL_DISINTEGRATING",
                          instructions: "Take immediately if nausea develops to prevent sudden spikes in orbital pressure."
                        };
                        const softenerRx = {
                          drugName: "Docusate Sodium (Colace) 100mg",
                          dosage: "1 capsule",
                          frequency: "BID",
                          durationDays: 7,
                          route: "ORAL",
                          instructions: "Anti-Valsalva bowel protocol. HIGH WARNING: STRICT NOSE-BLOWING PRECAUTIONS. Avoid valsalva strains."
                        };
                        setOrbitLocalPrescriptions(prev => [...prev, antimeticRx, softenerRx]);
                        alert("💊 PRESETS MOUNTED: Anti-Emetic & Stool Softener anti-valsalva bundles loaded securely into the patient prescription profile.");
                      }}
                      className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-2 font-semibold text-center hover:shadow-xs transition"
                    >
                      🚀 Load Anti-Valsalva Bundle
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const steroidRx = {
                          drugName: "Methylprednisolone 4mg (Medrol Dosepak)",
                          dosage: "24mg initially with daily stepdown",
                          frequency: "DAILY TAPER",
                          durationDays: 6,
                          route: "ORAL",
                          instructions: "Decompress active soft tissue edemas and protect visual pathways."
                        };
                        const abxRx = {
                          drugName: "Amoxicillin-Clavulanate 875mg",
                          dosage: "1 tablet",
                          frequency: "BID",
                          durationDays: 7,
                          route: "ORAL",
                          instructions: "Sinus-involving fracture prophylaxis."
                        };
                        setOrbitLocalPrescriptions(prev => [...prev, steroidRx, abxRx]);
                        alert("💊 PRESETS MOUNTED: Large-dose corticosteroid pack & prophylactic systemics loaded.");
                      }}
                      className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 rounded-lg p-2 font-semibold text-center hover:shadow-xs transition"
                    >
                      🚀 Load Antibiotic & Steroid Pack
                    </button>
                  </div>
                </div>

                {/* Display prescriptions queue */}
                <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Active Formulary Orders Scheduled</span>
                  
                  {orbitLocalPrescriptions.length === 0 ? (
                    <div className="text-center py-4 bg-neutral-50 dark:bg-neutral-900 border border-dashed border-[var(--clr-border-light)] rounded-lg text-neutral-400 text-xs">
                      No prescriptions added. Use presets or fill form.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {orbitLocalPrescriptions.map((rx, idx) => (
                        <div key={idx} className="p-2 border border-neutral-150 dark:border-neutral-800 rounded bg-neutral-50/50 dark:bg-neutral-900/30 text-[11px] leading-tight flex justify-between items-start gap-2">
                          <div>
                            <span className="font-bold text-neutral-800 dark:text-neutral-250 block">{rx.drugName}</span>
                            <span className="text-neutral-500 block">Dosage: {rx.dosage} • Freq: {rx.frequency} • {rx.durationDays} Days ({rx.route})</span>
                            <span className="text-neutral-400 mt-0.5 block text-[10px] italic">Instr: {rx.instructions}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOrbitLocalPrescriptions(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-red-600 hover:text-red-700 text-xs font-mono font-bold"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual prescription appender form */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2">
                  <span className="text-xxs font-mono uppercase text-neutral-400 block font-bold">Add Custom Ophthalmic Formulation</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Drug Formula Name"
                        value={newOrbitRxName}
                        onChange={(e) => setNewOrbitRxName(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Route (e.g. ORAL, IV)"
                        value={newOrbitRxRoute}
                        onChange={(e) => setNewOrbitRxRoute(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={newOrbitRxDose}
                        onChange={(e) => setNewOrbitRxDose(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={newOrbitRxFreq}
                        onChange={(e) => setNewOrbitRxFreq(e.target.value)}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Duration"
                        value={newOrbitRxDuration}
                        onChange={(e) => setNewOrbitRxDuration(Number(e.target.value))}
                        className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Special Instructions (e.g. Strict nose blow precautions)"
                      value={newOrbitRxInstructions}
                      onChange={(e) => setNewOrbitRxInstructions(e.target.value)}
                      className="w-full text-xs border border-[var(--clr-border-light)] rounded p-1 font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newOrbitRxName) return;
                      const custom = {
                        drugName: newOrbitRxName,
                        dosage: newOrbitRxDose,
                        frequency: newOrbitRxFreq,
                        durationDays: newOrbitRxDuration,
                        route: newOrbitRxRoute,
                        instructions: newOrbitRxInstructions
                      };
                      setOrbitLocalPrescriptions(prev => [...prev, custom]);
                      alert(`✏️ Medication [${newOrbitRxName}] successfully compiled for pharmacy queue fulfillment.`);
                    }}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xxs font-bold transition active:scale-95 text-center block font-mono"
                  >
                    + ADD FORMULATION TO INVENTORY PIPELINE
                  </button>
                </div>

              </div>

            </div>

            {/* 6. DATA TRANSFER CONTRACT JSON SERIALIZATION PREVIEW (`OrbitTraumaSubmissionDTO`) */}
            <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl border border-neutral-800 space-y-3 shadow-md" id="dto_data_contract_panel">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold font-mono tracking-wider text-green-500">
                  ⚡ SPRING-BOOT CONTRACT INTEGRITY (OrbitTraumaSubmissionDTO)
                </span>
                <span className="text-xxs font-mono text-neutral-500">
                  REAL-TIME PREVIEW IN-LINE
                </span>
              </div>
              
              {/* Dense serialized state string block */}
              {(() => {
                const contractPayload = {
                  visitId: `visit-${selectedPatient.id.slice(0, 8)}`,
                  patientId: selectedPatient.id,
                  consultationId: `consult-${Date.now()}`,
                  emergencyRedFlags: {
                    rapdPositiveRight: orbitRapdOD === "Positive",
                    rapdPositiveLeft: orbitRapdOS === "Positive",
                    orbitalCompartmentSyndromeSuspected: orbitOcsSuspected,
                    infraorbitalNerveHypoesthesiaV2: orbitV2Numbness,
                    subcutaneousCrepitusPresent: orbitCrepitus
                  },
                  mechanicalOculoplasticExam: {
                    hertelBaseMm: orbitHertelBase,
                    proptosisRightMm: orbitProptosisOD,
                    proptosisLeftMm: orbitProptosisOS,
                    enophthalmosRightMm: orbitEnophthalmosOD,
                    enophthalmosLeftMm: orbitEnophthalmosOS,
                    mrd1RightMm: orbitMrd1OD,
                    mrd1LeftMm: orbitMrd1OS,
                    mrd2RightMm: orbitMrd2OD,
                    mrd2LeftMm: orbitMrd2OS,
                    lfWidthRightMm: orbitPfWidthOD,
                    lfWidthLeftMm: orbitPfWidthOS,
                    levatorFunctionRight: orbitLevatorOD,
                    levatorFunctionLeft: orbitLevatorOS,
                    bellsPhenomenon: orbitBellsPhenomenon,
                    extraocularMovements: `Motility indexes. Vertical upward limitations: OD (${orbitEomGrid["UP_OD"]}) OS (${orbitEomGrid["UP_OS"]})`
                  },
                  radiographicImagingLinks: {
                    ctScanPerformed: true,
                    ctScanFindingsSummary: orbitCtScanFindings,
                    imagingSeriesUrls: [
                      "https://storage.hospital.local/imaging/ct/2026/orbit_coronal_fracture.dicom",
                      "https://storage.hospital.local/imaging/ct/2026/orbit_axial_hematoma.dicom"
                    ]
                  },
                  referrals: [{
                    targetClinicCode: orbitReferralTarget,
                    urgency: orbitReferralUrgency,
                    reasonForReferral: orbitReferralReason
                  }],
                  prescriptions: orbitLocalPrescriptions.map(p => ({
                    drugFormularyId: `INV-${p.drugName.slice(0, 4).toUpperCase()}`,
                    dosage: p.dosage,
                    frequency: p.frequency,
                    durationDays: p.durationDays,
                    administrationRoute: p.route,
                    specialInstructions: p.instructions
                  })),
                  followUpIntervalDays: 1
                };

                return (
                  <pre className="text-[11px] font-mono leading-relaxed max-h-[160px] overflow-y-auto bg-black p-3 rounded border border-neutral-900 text-yellow-500 text-left scrollbar-thin">
                    {JSON.stringify(contractPayload, null, 2)}
                  </pre>
                );
              })()}
            </div>

            {/* 7. CONCLUDE TRAUMA CONSULTATION & ROUTE BILLING LEDGER */}
            <div className="pt-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[var(--clr-border-light)]">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-550 block font-normal text-center sm:text-left leading-normal font-sans">
                ✓ Click finalization below to register diagnostic records, export prescriptions to hospital inventory core, and serialize transaction packages.
              </span>
              <button
                type="button"
                id="orbit_submit_trauma_consultation"
                onClick={() => {
                  const payloadStr = `Orbit Trauma Triage Compiled. Mechanical Asymmetry Delta: ${Math.abs(orbitProptosisOD - orbitProptosisOS).toFixed(1)} mm. RAPD: OD ${orbitRapdOD} / OS ${orbitRapdOS}. IOP: OD ${orbitIopOD} mmHg / OS ${orbitIopOS} mmHg. EOM Vertical Limitation: UP OS (${orbitEomGrid["UP_OS"]}). Prescribed: ${orbitLocalPrescriptions.map((r) => r.drugName).join(", ") || "none"}. CT Scan Impression: ${orbitCtScanFindings}. Routed specialty target: ${orbitReferralTarget}.`;
                  
                  // Instantly update patient state with the generated billing codes or clinical logs
                  const finalLedgerItem: BillingItem = {
                    id: `BILL-ORB-TRIAGE-${Date.now()}`,
                    serviceName: "High-Speed Maxillofacial & Orbital Triage Consultation with CT Interpretation (Code: ORB-TRAUMA-ST01)",
                    category: "Consultation" as const,
                    amount: 1650,
                    status: "Unpaid" as const
                  };

                  const updated: Patient = {
                    ...selectedPatient,
                    billingLedger: [...selectedPatient.billingLedger, finalLedgerItem],
                    clinicalLogs: [
                      ...selectedPatient.clinicalLogs,
                      {
                        timestamp: new Date().toLocaleTimeString().slice(0, 5),
                        actorRole: "Oculoplastic Trauma Chief",
                        action: "Trauma Workstation Dossier Finalized",
                        notes: payloadStr
                      }
                    ]
                  };

                  onUpdatePatient(updated);
                  finalizeConsultation(payloadStr);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] dark:hover:shadow-[0_0_20px_rgba(43,191,255,0.2)] active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                ✓ Finalize & Bill Orbit Trauma Encounter
              </button>
            </div>

          </div>
        )}

        {selectedPatient.clinic === "Pediatrics Ophthalmology" && (
          <PediatricStrabismusWorkstation
            selectedPatient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            finalizeConsultation={finalizeConsultation}
          />
        )}

        {selectedPatient.clinic === "General Ophthalmology" && (
          <ComprehensiveEyeWorkstation
            selectedPatient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            finalizeConsultation={finalizeConsultation}
            language={language}
          />
        )}
      </div>

      {/* Clinical Log History footer list */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <span className="font-semibold text-[10px] text-neutral-400 uppercase block mb-2 tracking-wider">
          Clinical Encounter Log Timeline
        </span>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {selectedPatient.clinicalLogs.map((log, i) => (
            <div key={i} className="text-[11px] leading-tight flex justify-between bg-white/60 dark:bg-[#1a1e2e]/45 border border-neutral-250 dark:border-neutral-800/80 rounded-lg p-2 text-neutral-600 dark:text-neutral-300">
              <div>
                <span className="font-bold text-teal-600">[{log.timestamp}]</span>{" "}
                <span className="font-medium text-neutral-800">
                  {log.actorRole} • {log.action}:
                </span>{" "}
                {log.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showFinalizeModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[3px] z-[999] flex items-center justify-center p-4">
          <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-[var(--clr-brand-blue)]/10 dark:bg-[#4F46E5]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4F46E5]/20 animate-bounce">
              <CheckCircle className="w-6 h-6 text-[var(--clr-brand-blue)]" />
            </div>
            
            <h3 className="font-sans font-extrabold text-lg text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              Consultation Finalized!
            </h3>
            <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
              تم إنهاء الاستشارة الطبية بنجاح
            </h4>

            <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-3 leading-relaxed">
              Medical records, medication prescriptions, and ledger fees for <strong className="text-neutral-900 dark:text-neutral-100">{selectedPatient.name}</strong> have been successfully verified and synced with custom HL7 clinical security registries.
            </p>

            <div className="mt-5 space-y-2">
              {onShowReport && (
                <button
                  type="button"
                  onClick={() => {
                    setShowFinalizeModal(false);
                    onShowReport(selectedPatient.id);
                  }}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>View / Print Patient EHR PDF Report</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="w-full py-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-bold transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
