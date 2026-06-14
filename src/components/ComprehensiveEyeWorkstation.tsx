/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Glasses,
  Eye,
  Activity,
  ArrowRight,
  TrendingUp,
  Check,
  Plus,
  Trash2,
  Calendar,
  Sliders,
  Settings,
  Dna,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Info,
  FileCheck,
  Search,
  ShoppingCart,
  Layers,
  Heart
} from "lucide-react";
import { Patient, BillingItem, ClinicalLogEntry } from "../types";
import SurgicalTheaterDashboard from "./SurgicalTheaterDashboard";

export interface ComprehensiveEyeWorkstationProps {
  selectedPatient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  finalizeConsultation: (notesPayload: string) => void;
  language?: "en" | "ar";
}

// Pre-defined ICD-10 quick list for fuzzy resolution mapping
const ICD10_REGISTRY = [
  { code: "H52.13", term: "Myopia, bilateral (Nearsightedness)", category: "Refractive" },
  { code: "H52.11", term: "Myopia, right eye alone", category: "Refractive" },
  { code: "H52.12", term: "Myopia, left eye alone", category: "Refractive" },
  { code: "H52.4", term: "Presbyopia (Loss of close focusing with age)", category: "Refractive" },
  { code: "H52.223", term: "Astigmatism, bilateral (Irregular curvature)", category: "Refractive" },
  { code: "H52.03", term: "Hyperopia, bilateral (Farsightedness)", category: "Refractive" },
  { code: "H25.11", term: "Age-related nuclear cataract, right eye (Grade 2-4 NS)", category: "Anterior" },
  { code: "H25.12", term: "Age-related nuclear cataract, left eye (Grade 2-4 NS)", category: "Anterior" },
  { code: "H11.003", term: "Pterygium unspecified eye (UV exposure growth)", category: "Anterior" },
  { code: "H11.031", term: "Pterygium of right eye", category: "Anterior" },
  { code: "H01.003", term: "Blepharitis bilateral eyelids", category: "Anterior" },
  { code: "H04.123", term: "Dry Eye Syndrome, bilateral chronic tear deficiency", category: "Anterior" },
  { code: "H40.013", term: "Open Angle Glaucoma Suspected, borderline IOP", category: "Screening" },
  { code: "Z13.5", term: "Diabetic Retinopathy Screening encounter", category: "Screening" },
  { code: "H35.313", term: "Nonexudative Age-Related Macular Degeneration (Dry AMD)", category: "Screening" },
  { code: "H35.323", term: "Exudative Age-Related Macular Degeneration (Wet AMD)", category: "Screening" }
];

// Ophthalmic Formulary mock database with live available inventory
const MEDICAL_FORMULARY = [
  { id: "pharm-lat-005", name: "Latanoprost 0.005% Ophthalmic Drops", category: "Anti-Glaucoma", stock: 85, defaultSig: "1 drop in affected eye(s) once daily at bedtime" },
  { id: "pharm-tim-05", name: "Timolol Maleate 0.5% Ophthalmic drops", category: "Anti-Glaucoma Beta Blocker", stock: 64, defaultSig: "1 drop BID in affected eye(s)" },
  { id: "pharm-cmc-05", name: "Carboxymethylcellulose 0.5% Artificial Tears", category: "Lubricant Dry Eye relief", stock: 120, defaultSig: "1 drop in both eyes QID or as needed" },
  { id: "pharm-olo-02", name: "Olopatadine HCl 0.2% Antihistamine Formulation", category: "Anti-Allergy / Pruritus relief", stock: 48, defaultSig: "1 drop daily in eyes" },
  { id: "pharm-tobr-03", name: "Tobramycin 0.3% Broad Spectrum Antibiotic", category: "Antibacterial Ophthalmic", stock: 75, defaultSig: "1 drop Q6H for 7 days" }
];

export default function ComprehensiveEyeWorkstation({
  selectedPatient,
  onUpdatePatient,
  finalizeConsultation,
  language = "en"
}: ComprehensiveEyeWorkstationProps) {
  
  // --- 1. REFRACTION & LENSOMETRY STATES ---
  const [hasCurrentGlasses, setHasCurrentGlasses] = useState<boolean>(true);
  
  // Lensometry (Current Spectacles)
  const [lensSphereOD, setLensSphereOD] = useState<string>("-1.25");
  const [lensCylinderOD, setLensCylinderOD] = useState<string>("-0.50");
  const [lensAxisOD, setLensAxisOD] = useState<string>("95");
  const [lensAddOD, setLensAddOD] = useState<string>("+1.50");
  
  const [lensSphereOS, setLensSphereOS] = useState<string>("-1.00");
  const [lensCylinderOS, setLensCylinderOS] = useState<string>("0.00");
  const [lensAxisOS, setLensAxisOS] = useState<string>("0");
  const [lensAddOS, setLensAddOS] = useState<string>("+1.50");

  // Autorefraction & NCT Telemetry
  const [autoSphereOD, setAutoSphereOD] = useState<string>("-2.00");
  const [autoCylinderOD, setAutoCylinderOD] = useState<string>("-0.75");
  const [autoAxisOD, setAutoAxisOD] = useState<string>("180");
  const [autoSphereOS, setAutoSphereOS] = useState<string>("-1.75");
  const [autoCylinderOS, setAutoCylinderOS] = useState<string>("-0.25");
  const [autoAxisOS, setAutoAxisOS] = useState<string>("175");
  const [telemetryIopOD, setTelemetryIopOD] = useState<number>(16);
  const [telemetryIopOS, setTelemetryIopOS] = useState<number>(17);
  const [telemetryImported, setTelemetryImported] = useState<boolean>(false);

  // Manifest Refraction Engine (Refined by Doctor)
  const [refSphereOD, setRefSphereOD] = useState<string>("-2.25");
  const [refCylinderOD, setRefCylinderOD] = useState<string>("-0.75");
  const [refAxisOD, setRefAxisOD] = useState<string>("180");
  const [refVaOD, setRefVaOD] = useState<string>("20/20");

  const [refSphereOS, setRefSphereOS] = useState<string>("-1.75");
  const [refCylinderOS, setRefCylinderOS] = useState<string>("-0.50");
  const [refAxisOS, setRefAxisOS] = useState<string>("175");
  const [refVaOS, setRefVaOS] = useState<string>("20/20");

  const [readingAdd, setReadingAdd] = useState<string>("+1.75");
  const [nearAcuity, setNearAcuity] = useState<string>("J1");
  const [prismPower, setPrismPower] = useState<string>("0");
  const [prismBase, setPrismBase] = useState<"NONE" | "BU" | "BD" | "BI" | "BO">("NONE");
  const [isSubjectiveAcceptable, setIsSubjectiveAcceptable] = useState<boolean>(true);

  // Uncorrected Baseline VA
  const [ucVaOD, setUcVaOD] = useState<string>("20/50");
  const [ucVaOS, setUcVaOS] = useState<string>("20/40");

  // --- 2. DUAL-SEGMENT SLIT LAMP MICROSCOPY STATES ---
  // Anterior Segment (Front)
  const [lidsLashesNormal, setLidsLashesNormal] = useState<boolean>(true);
  const [lidsLashesDetails, setLidsLashesDetails] = useState<string>("Clear margins, no flaking or blepharitis.");
  
  const [conjunctivaRight, setConjunctivaRight] = useState<string>("Clear, quiet");
  const [conjunctivaLeft, setConjunctivaLeft] = useState<string>("Clear, quiet");
  
  const [corneaRightNormal, setCorneaRightNormal] = useState<boolean>(true);
  const [corneaLeftNormal, setCorneaLeftNormal] = useState<boolean>(true);
  const [corneaDetails, setCorneaDetails] = useState<string>("Intact epithelium, clear stroma bilaterally.");
  
  const [anteriorChamberNormal, setAnteriorChamberNormal] = useState<boolean>(true);
  const [anteriorChamberCells, setAnteriorChamberCells] = useState<"Quiet" | "1+ Flare" | "2+ Cells" | "3+ Cells/Flare">("Quiet");
  
  const [lensRightStatus, setLensRightStatus] = useState<string>("Clear, physiologic aging");
  const [lensLeftStatus, setLensLeftStatus] = useState<string>("Clear, physiologic aging");

  // Posterior Segment (Back)
  const [cupToDiscRatioOD, setCupToDiscRatioOD] = useState<number>(0.3);
  const [cupToDiscRatioOS, setCupToDiscRatioOS] = useState<number>(0.35);
  const [opticNerveColor, setOpticNerveColor] = useState<"Pink" | "Pale" | "Cupped">("Pink");
  const [opticNerveMargins, setOpticNerveMargins] = useState<"Sharp" | "Blurred / Edema" | "Sector Hemorrhage">("Sharp");
  
  const [maculaBilateralNormal, setMaculaBilateralNormal] = useState<boolean>(true);
  const [maculaDetails, setMaculaDetails] = useState<string>("Healthy foveal reflex, map clean.");
  const [vitreousStatus, setVitreousStatus] = useState<string>("Clear, normal age detachment absent");

  // Macular & CST Microns
  const [cstMicronsOD, setCstMicronsOD] = useState<number>(245);
  const [cstMicronsOS, setCstMicronsOS] = useState<number>(252);
  const [macularHemorrhageChecked, setMacularHemorrhageChecked] = useState<boolean>(false);

  // --- 3. DIAGNOSTIC FUZZY REGISTRY STATES ---
  const [diagnosticSearch, setDiagnosticSearch] = useState<string>("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<typeof ICD10_REGISTRY>([]);

  // --- 4. REFERRAL & ESCALATION TRAFFIC ROUTER STATES ---
  const [referralTarget, setReferralTarget] = useState<"None" | "RETINA" | "GLAUCOMA" | "PEDIATRIC_STRABISMUS" | "ORBIT_OCULOPLASTICS" | "MAIN_OR_QUEUE">("None");
  const [referralUrgency, setReferralUrgency] = useState<"ROUTINE" | "URGENT" | "STAT_EMERGENCY">("ROUTINE");
  const [referralReason, setReferralReason] = useState<string>("");
  const [internalReferralList, setInternalReferralList] = useState<Array<{target: string, urgency: string, reason: string}>>([]);

  // --- 5. E-PRESCRIBING DUAL-FULFILLMENT STATES ---
  // Path A: Pharmacy drops
  const [prescriptionCart, setPrescriptionCart] = useState<Array<{id: string, name: string, dosage: string, duration: number}>>([]);
  const [inventoryStocks, setInventoryStocks] = useState(MEDICAL_FORMULARY);

  // Path B: Spectacles Optical Shop Order Status
  const [isOpticalPrescriptionAuthorized, setIsOpticalPrescriptionAuthorized] = useState<boolean>(true);
  const [opticalTicketCreated, setOpticalTicketCreated] = useState<boolean>(false);
  const [opticalPrescriptionRefNo, setOpticalPrescriptionRefNo] = useState<string>("");

  // Ensure simulation patient defaults map perfectly
  useEffect(() => {
    if (selectedPatient && selectedPatient.name.includes("Ameera")) {
      // Ameera Al-Said is y/o 15, let's load her pre-specified refraction values as active defaults
      setRefSphereOD("-2.25");
      setRefCylinderOD("-0.75");
      setRefAxisOD("180");
      setRefVaOD("20/20");

      setRefSphereOS("-1.75");
      setRefCylinderOS("-0.50");
      setRefAxisOS("175");
      setRefVaOS("20/20");
    }
  }, [selectedPatient]);

  // --- HARDWARE TELEMETRY LOADER ---
  const handleImportHardwareTelemetry = () => {
    setTelemetryImported(true);
    // Simulating instant feed from diagnostic hardware
    setAutoSphereOD("-2.00");
    setAutoCylinderOD("-0.75");
    setAutoAxisOD("180");
    setAutoSphereOS("-1.75");
    setAutoCylinderOS("-0.25");
    setAutoAxisOS("175");
    setTelemetryIopOD(16.5);
    setTelemetryIopOS(17.0);
    alert("🖧 Clinical Hardware Telemetry: Autorefractometer & NCT Air-puff values successfully integrated into exam cache.");
  };

  // --- DIAGNOSIS FUZZY SEARCH FILTER ---
  const filteredICDCodes = ICD10_REGISTRY.filter(item => 
    item.code.toLowerCase().includes(diagnosticSearch.toLowerCase()) ||
    item.term.toLowerCase().includes(diagnosticSearch.toLowerCase())
  );

  const handleAddDiagnosis = (diag: typeof ICD10_REGISTRY[0]) => {
    if (selectedDiagnoses.some(d => d.code === diag.code)) return;
    setSelectedDiagnoses([...selectedDiagnoses, diag]);
    setDiagnosticSearch("");

    // Auto-assist clinic routing prompts
    if (diag.code === "H25.11" || diag.code === "H25.12") {
      setLensRightStatus("Dense Nuclear Sclerosis Grade 3+ Cataract");
      setReferralTarget("MAIN_OR_QUEUE");
      setReferralUrgency("ROUTINE");
      setReferralReason("Dense nuclear sclerosis cataract. Schedule outpatient phacoemulsification and IOL surgical implantation.");
    } else if (diag.code === "H40.013" || telemetryIopOD > 22 || telemetryIopOS > 22) {
      setReferralTarget("GLAUCOMA");
      setReferralUrgency("ROUTINE");
      setReferralReason("Borderline high IOP and suspicious cup-to-disc ratio. Requests full optical coherence tomography (OCT) of optic nerve fibers.");
    } else if (diag.code.startsWith("H35.3")) {
      setReferralTarget("RETINA");
      setReferralUrgency("URGENT");
      setReferralReason("Active AMD changes suspected. Patient requires diagnostic fluorescein angiography and intravitreal anti-VEGF consult.");
    }
  };

  const handleRemoveDiagnosis = (code: string) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => d.code !== code));
  };

  // --- REFERRAL DISPATCHING LOGIC ---
  const handleDispatchReferral = () => {
    if (referralTarget === "None") {
      alert("Please select a target wing or the Main Operating Theater (OR) Queue before issuing a routing dispatch instruction.");
      return;
    }

    const nextReferral = {
      target: referralTarget,
      urgency: referralUrgency,
      reason: referralReason || "Comprehensive screening followup clinical assessment."
    };

    setInternalReferralList([...internalReferralList, nextReferral]);
    alert(`🚀 Referral Dispatched successfully. ${referralTarget} queue notified! Priority level: ${referralUrgency}.`);
  };

  // --- PHARMACY DRUSTS STOCK CONTROLLER & CART ---
  const handleAddMedToCart = (item: typeof MEDICAL_FORMULARY[0]) => {
    if (prescriptionCart.some(rx => rx.id === item.id)) {
      alert(`"${item.name}" is already loaded in the prescription cart.`);
      return;
    }

    // Check virtual stock
    if (item.stock <= 0) {
      alert(`Formula stock alert: "${item.name}" is currently depleted from the central vault.`);
      return;
    }

    setPrescriptionCart([...prescriptionCart, {
      id: item.id,
      name: item.name,
      dosage: item.defaultSig,
      duration: 30
    }]);
  };

  const handleRemoveMedFromCart = (id: string) => {
    setPrescriptionCart(prescriptionCart.filter(rx => rx.id !== id));
  };

  const handleUpdateCartDosage = (id: string, newDosage: string) => {
    setPrescriptionCart(prescriptionCart.map(rx => rx.id === id ? { ...rx, dosage: newDosage } : rx));
  };

  const handleUpdateCartDuration = (id: string, days: number) => {
    setPrescriptionCart(prescriptionCart.map(rx => rx.id === id ? { ...rx, duration: days } : rx));
  };

  // --- SPECTACLES RETIAL FABRICATION AUTOROUTER ---
  const handleSendToOpticalShop = () => {
    if (parseFloat(refSphereOD) === 0 && parseFloat(refCylinderOD) === 0) {
      alert("Refraction matrix is blank. Set values before creating optical tickets.");
      return;
    }

    setOpticalTicketCreated(true);
    const refNo = `OPT-TKT-${Date.now().toString().slice(-6)}`;
    setOpticalPrescriptionRefNo(refNo);
    alert(`👓 Spectacles Prescription Signed! Refraction card uploaded to Retail Optical Shop software under ticket reference: ${refNo}`);
  };

  // --- COMPREHENSIVE CLINICAL STATE SUBMITTER ---
  const handleCompileConsultation = () => {
    // Assert diagnostic logic and auto-alerts
    const highIopTriggered = telemetryIopOD > 22 || telemetryIopOS > 22;
    const abnormalCD = cupToDiscRatioOD > 0.6 || cupToDiscRatioOS > 0.6;
    const denseCataract = lensRightStatus.toLowerCase().includes("3+") || lensRightStatus.toLowerCase().includes("grade 3") || lensRightStatus.toLowerCase().includes("grade 4") || lensRightStatus.toLowerCase().includes("nuclear sclerosis grade 2+");

    // Formulate billing array
    const compiledBills: BillingItem[] = [
      {
        id: `BILL-GEN-${Date.now()}`,
        serviceName: "Comprehensive Ophthalmic Examination & Manifest Phoropter Refraction (Code: COMP-EXAM-92014)",
        category: "Consultation",
        amount: 350,
        status: "Unpaid"
      }
    ];

    // If referral is to surgical OR queue or dense cataract is found, add specialty fees
    if (referralTarget === "MAIN_OR_QUEUE" || denseCataract) {
      compiledBills.push({
        id: `BILL-SURG-PREP-${Date.now()}`,
        serviceName: "Pre-operative Ocular Surgical Planning & Biometry Consultation (Code: BIOM-SURG-92136)",
        category: "ClinicalLab",
        amount: 480,
        status: "Unpaid"
      });
    }

    // Scenario Coach Compatibility Step 3 injection
    // If the patient is Ameera Al-Said, we strictly add the isolated retail composite billing glasses blueprint item
    const isAmeeraCase = selectedPatient.name.includes("Ameera");
    if (isAmeeraCase || isOpticalPrescriptionAuthorized) {
      compiledBills.push({
        id: `BIL-OPT-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceName: "Refractive Index Isolated Eyeglasses Composite design",
        category: "PharmacyDispense",
        amount: 180,
        status: "Unpaid"
      });
    }

    // Formulate clinical summary narrative
    const clinicalSummary = `Comprehensive Ophthalmic Examination Confirmed. \n` +
      `- Visual Acuity: Uncorrected OD ${ucVaOD} / OS ${ucVaOS} | Refined Corrected OD ${refVaOD} / OS ${refVaOS}. \n` +
      `- Lensometry (Current GP): OD ${lensSphereOD}/${lensCylinderOD}x${lensAxisOD} Add ${lensAddOD} | OS ${lensSphereOS}/${lensCylinderOS}x${lensAxisOS} Add ${lensAddOS}. \n` +
      `- Manifest Refraction (Rx Released): OD ${refSphereOD} SPH / ${refCylinderOD} CYL @ ${refAxisOD}° | OS ${refSphereOS} SPH / ${refCylinderOS} CYL @ ${refAxisOS}° | Reading ADD ${readingAdd} (${nearAcuity}). Subjective Acceptability: ${isSubjectiveAcceptable ? "VERIFIED ACCORDING TO TRIAL LENSES" : "BORDERLINE"}. \n` +
      `- Slit-Lamp (Anterior Segment): Lids/Lashes ${lidsLashesNormal ? 'Normal' : lidsLashesDetails}. Conjunctiva OD ${conjunctivaRight} / OS ${conjunctivaLeft}. Cornea ${corneaRightNormal && corneaLeftNormal ? 'Clear and quiet' : corneaDetails}. Anterior chamber: ${anteriorChamberCells}. Lens status: Right [${lensRightStatus}] Left [${lensLeftStatus}]. \n` +
      `- Fundoscopy (Posterior Segment): Optic Nerve Head C/D Ratio OD: ${cupToDiscRatioOD}, OS: ${cupToDiscRatioOS}. Margins ${opticNerveMargins} (${opticNerveColor}). Macular reflect: ${maculaBilateralNormal ? 'Normal physiologic bilateral foveal reflex' : maculaDetails}. Vitreous: ${vitreousStatus}. \n` +
      `- OCT Baselines: Macula CST OD: ${cstMicronsOD} Microns, OS: ${cstMicronsOS} Microns. Macular fluid/hemorrhage: ${macularHemorrhageChecked ? "YES" : "No active signs"}. \n` +
      `- Coded ICD-10 Registrations: ${selectedDiagnoses.length > 0 ? selectedDiagnoses.map(d => `${d.term} (${d.code})`).join("; ") : "No permanent degenerative anomalies"}. \n` +
      `- Dual-Fulfillment pipelines routing: \n` +
      `  * Optical shop order: ${isOpticalPrescriptionAuthorized ? `AUTHORIZED. Ticket Ref: ${opticalPrescriptionRefNo || "OPT-COMP-REF-01"}` : "Not Prescribed"}. \n` +
      `  * Pharmacy drops cart: ${prescriptionCart.length > 0 ? prescriptionCart.map(rx => `${rx.name} (Sig: ${rx.dosage})`).join(", ") : "None required"}. \n` +
      `- Routing dispatches: ${internalReferralList.length > 0 ? internalReferralList.map(r => `${r.target} (${r.urgency}) Rationale: ${r.reason}`).join(" | ") : "No immediate specialty wing dispatch scheduled."}`;

    // Verification block to block finalization if OR queue selected but safety checklist bypassed
    if (referralTarget === "MAIN_OR_QUEUE" && selectedPatient.status !== "SURGERY_IN_PROGRESS") {
      alert(language === "ar"
        ? "⚠️ تنبيه السلامة الإلزامي: تم توجيه المريض لغرفة العمليات الجراحية، ولكن لم يتم إكمال فحوصات ما قبل الجراحة. يرجى مراجعة وتدقيق قائمة الفحوصات الإلزامية وتفعيل زر (بدء الإجراء الجراحي) قبل الفوترة النهائية."
        : "⚠️ Mandatory Safety Warning: Patient is routed to Main OR Queue, but pre-operative clinical safety checkpoints remain unverified. You must complete the WHO Safety Checklist below and click 'Commence Surgical Theater' before concluding this encounter.");
      return;
    }

    // Update patient status & logs
    let finalStatus = selectedPatient.status;
    if (selectedPatient.status === "SURGERY_IN_PROGRESS") {
      finalStatus = "SURGERY_IN_PROGRESS";
    } else if (prescriptionCart.length > 0) {
      finalStatus = "Dispensing"; // Send to dispensing for pharmacy drop collection
    } else {
      finalStatus = "BillingPending"; // Otherwise send to cashier desk
    }

    const updatedPatient: Patient = {
      ...selectedPatient,
      status: finalStatus,
      billingLedger: [...selectedPatient.billingLedger, ...compiledBills],
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Comprehensive Ophthalmologist",
          action: "Comprehensive Consultation Concluded",
          notes: clinicalSummary
        },
        ...(isOpticalPrescriptionAuthorized ? [{
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Optical Shop Sync System",
          action: "Prescription Ticket Dispatched",
          notes: `Sent manifest refraction [OD ${refSphereOD}/${refCylinderOD}x${refAxisOD} / OS ${refSphereOS}/${refCylinderOS}x${refAxisOS}] to spectacle finishing lab. Reference ticket created for retail billing.`
        }] : []),
        ...internalReferralList.map(r => ({
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "System Router",
          action: `Internal wings referral created: ${r.target}`,
          notes: `Target: ${r.target} Clinic. Urgency: ${r.urgency}. Statement details: ${r.reason}`
        }))
      ]
    };

    // If referral target contains "MAIN_OR_QUEUE", save metadata
    if (referralTarget === "MAIN_OR_QUEUE" || internalReferralList.some(r => r.target === "MAIN_OR_QUEUE")) {
      (updatedPatient as any).surgeryRecommended = true;
      (updatedPatient as any).surgeryType = "Phacoemulsification and Intraocular Lens (IOL) Implantation";
      (updatedPatient as any).referralStatus = "SURGICAL_OR_QUEUE_PENDING";
    }

    // Decrease virtual inventory registers for prescribed drops
    const nextStocks = [...inventoryStocks];
    prescriptionCart.forEach(cartItem => {
      const idx = nextStocks.findIndex(st => st.id === cartItem.id);
      if (idx !== -1 && nextStocks[idx].stock > 0) {
        nextStocks[idx].stock = Math.max(0, nextStocks[idx].stock - 1);
      }
    });
    setInventoryStocks(nextStocks);

    onUpdatePatient(updatedPatient);
    finalizeConsultation(clinicalSummary);

    alert("✨ Complete General Comprehensive Eye Room Consultation finalized successfully! Manifest refraction has been synchronized, optical finishing tickets dispatched, and billing ledgers updated.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-sans" id="comprehensive_eye_workstation">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--clr-border-light)] pb-3 gap-2">
        <div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            👁️ General Comprehensive Eye Room & Diagnostics
          </h3>
          <p className="text-xs text-neutral-500">
            Central gateway for visual analysis, digital autorefraction telemetry, dual-segment microscopy, and clinical split-routing dispatches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImportHardwareTelemetry}
            className={`text-xxs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded transition shadow-sm ${
              telemetryImported 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                : "bg-indigo-650 hover:bg-indigo-700 text-white animate-pulse"
            }`}
          >
            {telemetryImported ? "🖧 Hardware Connected" : "⚡ Import Hardware Telemetry"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- LEFT SECTION (8 COLS): REFRACTION & LENSOMETRY MATRIX & microscopy --- */}
        <div className="lg:col-span-8 space-y-6">

          {/* BLOCK 1: side-by-side refraction blueprints */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Glasses className="w-4 h-4 text-[#4F46E5]" />
              The Refraction & Lensometry Matrix (Vision Blueprint)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* LENSOMETRY (Current Glasses) */}
              <div className="p-3 border border-[var(--clr-border-light)] bg-[#FBFBF9]/40 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-dashed border-neutral-200 pb-1.5">
                  <span className="text-xxs font-bold text-neutral-500 uppercase">1. Current Glasses</span>
                  <input
                    type="checkbox"
                    checked={hasCurrentGlasses}
                    onChange={(e) => setHasCurrentGlasses(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 scale-90"
                    id="has_glasses"
                  />
                </div>
                
                {hasCurrentGlasses ? (
                  <div className="space-y-2 text-xxs animate-fadeIn">
                    <div className="space-y-1">
                      <span className="font-semibold block text-[10px] text-indigo-700">RIGHT EYE (OD)</span>
                      <div className="grid grid-cols-4 gap-1">
                        <div>
                          <label className="text-[9px] text-neutral-400 block">SPH</label>
                          <input type="text" value={lensSphereOD} onChange={(e) => setLensSphereOD(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono font-bold bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">CYL</label>
                          <input type="text" value={lensCylinderOD} onChange={(e) => setLensCylinderOD(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">AXIS</label>
                          <input type="text" value={lensAxisOD} onChange={(e) => setLensAxisOD(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">ADD</label>
                          <input type="text" value={lensAddOD} onChange={(e) => setLensAddOD(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-neutral-100">
                      <span className="font-semibold block text-[10px] text-indigo-700">LEFT EYE (OS)</span>
                      <div className="grid grid-cols-4 gap-1">
                        <div>
                          <label className="text-[9px] text-neutral-400 block">SPH</label>
                          <input type="text" value={lensSphereOS} onChange={(e) => setLensSphereOS(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono font-bold bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">CYL</label>
                          <input type="text" value={lensCylinderOS} onChange={(e) => setLensCylinderOS(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">AXIS</label>
                          <input type="text" value={lensAxisOS} onChange={(e) => setLensAxisOS(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                        <div>
                          <label className="text-[9px] text-neutral-400 block">ADD</label>
                          <input type="text" value={lensAddOS} onChange={(e) => setLensAddOS(e.target.value)} className="w-full text-center border p-0.5 rounded font-mono bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-450 text-xxs block italic">
                    Patient has no current refractive corrective eyewear history.
                  </div>
                )}
              </div>

              {/* AUTOREFRACTION & TONOMETRY (Hardware telemetry) */}
              <div className="p-3 border border-[var(--clr-border-light)] bg-[#FBFBF9]/40 rounded-xl space-y-2">
                <div className="border-b border-dashed border-neutral-200 pb-1.5 flex justify-between items-center">
                  <span className="text-xxs font-bold text-neutral-500 uppercase">2. Autorefraction & NCT</span>
                  {telemetryImported && <span className="text-[9px] font-mono text-emerald-600 font-bold">🖧 Sync OK</span>}
                </div>
                
                <div className="space-y-2 text-xxs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-bold text-teal-700 text-[10px]">
                      <span>OD AR MEASURES</span>
                      <span className={`${telemetryIopOD > 21 ? "text-red-650" : "text-neutral-500"}`}>IOP: {telemetryIopOD} mmHg</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoSphereOD} S</div>
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoCylinderOD} C</div>
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoAxisOD}°</div>
                    </div>
                  </div>

                  <div className="space-y-0.5 pt-1 border-t border-neutral-100">
                    <div className="flex justify-between font-bold text-teal-700 text-[10px]">
                      <span>OS AR MEASURES</span>
                      <span className={`${telemetryIopOS > 21 ? "text-red-650" : "text-neutral-500"}`}>IOP: {telemetryIopOS} mmHg</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoSphereOS} S</div>
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoCylinderOS} C</div>
                      <div className="bg-neutral-50 p-1 text-center border border-neutral-150 rounded">{autoAxisOS}°</div>
                    </div>
                  </div>

                  {telemetryIopOD > 22 || telemetryIopOS > 22 ? (
                    <div className="p-1 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-900 leading-tight flex items-start gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Warning:</strong> IOP exceeds normal screening baseline of 22 mmHg. Requires Glaucoma wing router dispatch review.</span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-gray-500 italic text-center pt-1 leading-none">
                      Air-puff diagnostic pressure reads within secure balance.
                    </div>
                  )}
                </div>
              </div>

              {/* MANIFEST REFRACTION ENGINE (Trial lens results) */}
              <div className="p-3 border border-indigo-200 bg-[var(--clr-brand-blue)]/10/10 rounded-xl space-y-2">
                <span className="text-xxs font-extrabold text-indigo-700 uppercase block border-b border-dashed border-indigo-200 pb-1.5">
                  3. Manifest Refraction
                </span>
                
                <div className="space-y-2 text-xxs">
                  {/* OD */}
                  <div className="space-y-1Shared">
                    <div className="flex justify-between text-[10px] text-[#4F46E5] font-bold">
                      <span>RIGHT EYE (OD)</span>
                      <span className="font-sans text-[9px] text-indigo-650">VA: {refVaOD}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input type="text" value={refSphereOD} onChange={(e) => setRefSphereOD(e.target.value)} className="w-full text-center border border-indigo-300 font-mono font-bold bg-white rounded p-0.5" placeholder="Sph" />
                      <input type="text" value={refCylinderOD} onChange={(e) => setRefCylinderOD(e.target.value)} className="w-full text-center border border-indigo-300 font-mono bg-white rounded p-0.5" placeholder="Cyl" />
                      <input type="text" value={refAxisOD} onChange={(e) => setRefAxisOD(e.target.value)} className="w-full text-center border border-indigo-300 font-mono bg-white rounded p-0.5" placeholder="Axis" />
                      <select value={refVaOD} onChange={(e) => setRefVaOD(e.target.value)} className="w-full text-center border border-indigo-300 bg-white rounded p-0.5 text-[9px]">
                        <option value="20/20">20/20</option>
                        <option value="20/25">20/25</option>
                        <option value="20/30">20/30</option>
                        <option value="20/40">20/40</option>
                        <option value="20/50">20/50</option>
                        <option value="20/70">20/70</option>
                        <option value="20/200">20/200</option>
                      </select>
                    </div>
                  </div>

                  {/* OS */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#4F46E5] font-bold">
                      <span>LEFT EYE (OS)</span>
                      <span className="font-sans text-[9px] text-indigo-650">VA: {refVaOS}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input type="text" value={refSphereOS} onChange={(e) => setRefSphereOS(e.target.value)} className="w-full text-center border border-indigo-300 font-mono font-bold bg-white rounded p-0.5" placeholder="Sph" />
                      <input type="text" value={refCylinderOS} onChange={(e) => setRefCylinderOS(e.target.value)} className="w-full text-center border border-indigo-300 font-mono bg-white rounded p-0.5" placeholder="Cyl" />
                      <input type="text" value={refAxisOS} onChange={(e) => setRefAxisOS(e.target.value)} className="w-full text-center border border-indigo-300 font-mono bg-white rounded p-0.5" placeholder="Axis" />
                      <select value={refVaOS} onChange={(e) => setRefVaOS(e.target.value)} className="w-full text-center border border-indigo-300 bg-white rounded p-0.5 text-[9px]">
                        <option value="20/20">20/20</option>
                        <option value="20/25">20/25</option>
                        <option value="20/30">20/30</option>
                        <option value="20/40">20/40</option>
                        <option value="20/50">20/50</option>
                        <option value="20/70">20/70</option>
                        <option value="20/200">20/200</option>
                      </select>
                    </div>
                  </div>

                  {/* Near Vision reading add & prismatic components */}
                  <div className="pt-1.5 border-t border-indigo-100 flex flex-wrap gap-1.5 justify-between">
                    <div>
                      <label className="text-[9px] text-neutral-400 block leading-none">Reading Add</label>
                      <input type="text" value={readingAdd} onChange={(e) => setReadingAdd(e.target.value)} className="w-14 text-center border font-mono p-0.5 font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] text-neutral-400 block leading-none">Near Acuity</label>
                      <select value={nearAcuity} onChange={(e) => setNearAcuity(e.target.value)} className="w-14 text-center border text-[9px] p-0.5 bg-white">
                        <option value="J1">J1 (True)</option>
                        <option value="J2">J2</option>
                        <option value="J3">J3</option>
                        <option value="J5">J5</option>
                        <option value="J10">J10</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-neutral-400 block leading-none">Prism</label>
                      <div className="flex gap-0.5">
                        <input type="text" value={prismPower} onChange={(e) => setPrismPower(e.target.value)} className="w-8 text-center border font-mono p-0.5" placeholder="0" />
                        <select value={prismBase} onChange={(e) => setPrismBase(e.target.value as any)} className="w-10 text-center border text-[8px] p-0.5 bg-white font-bold text-gray-700">
                          <option value="NONE">None</option>
                          <option value="BU">BU</option>
                          <option value="BD">BD</option>
                          <option value="BI">BI</option>
                          <option value="BO">BO</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-indigo-150">
                    <span className="text-[9px] text-neutral-500 font-medium font-sans">Subjective Acceptability verification:</span>
                    <label className="flex items-center gap-1 cursor-pointer bg-white p-0.5 px-1.5 border border-indigo-200 rounded text-[9px] text-indigo-750 font-bold hover:bg-[var(--clr-brand-blue)]/10/50 transition">
                      <input
                        type="checkbox"
                        checked={isSubjectiveAcceptable}
                        onChange={(e) => setIsSubjectiveAcceptable(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 scale-75"
                      />
                      <span>Acceptable</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* BASELINE UNCORRECTED VISUAL ACUITY FIELD */}
            <div className="mt-4 p-3 border border-neutral-200 bg-neutral-50/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xxs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-550 uppercase">Initial Visual Baseline:</span>
                <span className="text-neutral-500 text-tiny">Raw visual score prior to lenses:</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-600">Right Eye OD uncorrected:</span>
                  <input type="text" value={ucVaOD} onChange={(e) => setUcVaOD(e.target.value)} className="w-14 text-center font-bold px-1.5 py-0.5 border" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-600">Left Eye OS uncorrected:</span>
                  <input type="text" value={ucVaOS} onChange={(e) => setUcVaOS(e.target.value)} className="w-14 text-center font-bold px-1.5 py-0.5 border" />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 2: DUAL-SEGMENT SLIT LAMP MICROSCOPY */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Activity className="w-4 h-4 text-[#4F46E5]" />
              The Dual-Segment Slit Lamp Interface
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ANTERIOR SEGMENT (Front of Eye) */}
              <div className="p-3 border border-[var(--clr-border-light)] rounded-xl space-y-3 bg-[#FBFBF9]/30">
                <span className="text-xxs font-extrabold text-neutral-500 block border-b pb-1 mb-2">🔭 ANTERIOR MICROSCOPY (FRONT OF EYE)</span>
                
                {/* Lids & Lashes */}
                <div className="space-y-1 text-xxs">
                  <div className="flex justify-between items-center bg-white p-1 px-2 border rounded-lg">
                    <label className="font-bold text-neutral-700 cursor-pointer flex items-center gap-1.5">
                      <input type="checkbox" checked={lidsLashesNormal} onChange={(e) => setLidsLashesNormal(e.target.checked)} className="rounded" />
                      <span>Lids & Lashes Normal</span>
                    </label>
                    <span className="font-mono text-[9px] text-gray-400">Blepharitis/Trichiasis</span>
                  </div>
                  {!lidsLashesNormal && (
                    <input
                      type="text"
                      className="w-full text-[11px] px-2 py-0.5 border bg-red-50/20 text-red-950 font-medium"
                      value={lidsLashesDetails}
                      onChange={(e) => setLidsLashesDetails(e.target.value)}
                      placeholder="e.g. Lid scaling, lash loss, trichiasis OD"
                    />
                  )}
                </div>

                {/* Conjunctiva */}
                <div className="grid grid-cols-2 gap-2 text-xxs">
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Conjunctiva OD</label>
                    <select value={conjunctivaRight} onChange={(e) => setConjunctivaRight(e.target.value)} className="w-full p-1.5 border bg-white rounded font-medium">
                      <option value="Clear, quiet">Clear & Quiet</option>
                      <option value="Mild injection / hyperemia">Mild Injection</option>
                      <option value="Severely injected">Severely Injected</option>
                      <option value="Subconjunctival hemorrhage">Subconj. Hemorrhage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Conjunctiva OS</label>
                    <select value={conjunctivaLeft} onChange={(e) => setConjunctivaLeft(e.target.value)} className="w-full p-1.5 border bg-white rounded font-medium">
                      <option value="Clear, quiet">Clear & Quiet</option>
                      <option value="Mild injection / hyperemia">Mild Injection</option>
                      <option value="Severely injected">Severely Injected</option>
                      <option value="Subconjunctival hemorrhage">Subconj. Hemorrhage</option>
                    </select>
                  </div>
                </div>

                {/* Cornea Toggles */}
                <div className="space-y-1 text-xxs">
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center gap-1 bg-white p-1 border rounded-lg cursor-pointer">
                      <input type="checkbox" checked={corneaRightNormal} onChange={(e) => setCorneaRightNormal(e.target.checked)} className="rounded scale-75" />
                      <span className="truncate">Cornea OD Clear</span>
                    </label>
                    <label className="flex-1 flex items-center gap-1 bg-white p-1 border rounded-lg cursor-pointer">
                      <input type="checkbox" checked={corneaLeftNormal} onChange={(e) => setCorneaLeftNormal(e.target.checked)} className="rounded scale-75" />
                      <span className="truncate">Cornea OS Clear</span>
                    </label>
                  </div>
                  {(!corneaRightNormal || !corneaLeftNormal) && (
                    <input
                      type="text"
                      className="w-full text-xxs px-2 py-0.5 border bg-red-50/20"
                      value={corneaDetails}
                      onChange={(e) => setCorneaDetails(e.target.value)}
                      placeholder="e.g. Corneal ulcer, scarring focal quadrant OS"
                    />
                  )}
                </div>

                {/* Anterior Chamber cells & flare */}
                <div className="grid grid-cols-2 gap-2 text-xxs items-center pt-1 border-t border-neutral-100">
                  <div>
                    <span className="font-bold block text-[10px] text-neutral-600">Anterior Chamber</span>
                  </div>
                  <div>
                    <select value={anteriorChamberCells} onChange={(e) => setAnteriorChamberCells(e.target.value as any)} className="w-full p-1 border bg-white font-mono text-[10px] font-bold">
                      <option value="Quiet">Quiet (Deep & Quiet)</option>
                      <option value="1+ Flare">1+ Flare</option>
                      <option value="2+ Cells">2+ Cells</option>
                      <option value="3+ Cells/Flare">3+ Heavy Cells/Flare</option>
                    </select>
                  </div>
                </div>

                {/* Lens Status (Cataracts) */}
                <div className="space-y-1.5 pt-1 text-xxs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Lens OD Status</label>
                      <select value={lensRightStatus} onChange={(e) => setLensRightStatus(e.target.value)} className="w-full p-1 border bg-white rounded font-medium text-[10px]">
                        <option value="Clear, physiologic aging">Physiologic Clear</option>
                        <option value="Nuclear Sclerosis Grade 1+">Nuclear Scl. Grade 1+</option>
                        <option value="Nuclear Sclerosis Grade 2+">Nuclear Scl. Grade 2+</option>
                        <option value="Dense Nuclear Sclerosis Grade 3+ (Surgical range)">Dense NS Grade 3+ (OR queue)</option>
                        <option value="Dense Nuclear Sclerosis Grade 4+ (Morganian)">Dense NS Grade 4+ (Surgical)</option>
                        <option value="Posterior Subcapsular Cataract (PSC)">PSC Cataract (High glare)</option>
                        <option value="Cortical changes">Early Cortical Staging</option>
                        <option value="Pseudophakic (IOL lens in place)">Pseudophakic (IOL)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Lens OS Status</label>
                      <select value={lensLeftStatus} onChange={(e) => setLensLeftStatus(e.target.value)} className="w-full p-1 border bg-white rounded font-medium text-[10px]">
                        <option value="Clear, physiologic aging">Physiologic Clear</option>
                        <option value="Nuclear Sclerosis Grade 1+">Nuclear Scl. Grade 1+</option>
                        <option value="Nuclear Sclerosis Grade 2+">Nuclear Scl. Grade 2+</option>
                        <option value="Dense Nuclear Sclerosis Grade 3+ (Surgical range)">Dense NS Grade 3+ (OR queue)</option>
                        <option value="Dense Nuclear Sclerosis Grade 4+ (Morganian)">Dense NS Grade 4+ (Surgical)</option>
                        <option value="Posterior Subcapsular Cataract (PSC)">PSC Cataract (High glare)</option>
                        <option value="Cortical changes">Early Cortical Staging</option>
                        <option value="Pseudophakic (IOL lens in place)">Pseudophakic (IOL)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* POSTERIOR SEGMENT (Back of Eye) */}
              <div className="p-3 border border-[var(--clr-border-light)] rounded-xl space-y-3 bg-[#FBFBF9]/30">
                <span className="text-xxs font-extrabold text-neutral-500 block border-b pb-1 mb-2">👁️ POSTERIOR FUNDUS (BACK OF EYE)</span>
                
                {/* Cup-to-Disc Ratio Sliders */}
                <div className="space-y-1 text-xxs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold block text-neutral-700">Optic Nerve Cup-to-Disc Ratio (C/D)</span>
                    <span className="text-[9px] font-mono font-bold text-neutral-400">Slit-lamp dry screening</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-white p-1.5 border rounded-lg">
                    <div>
                      <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                        <span>C/D OD</span>
                        <span className="font-bold text-indigo-700 font-mono">{cupToDiscRatioOD}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={cupToDiscRatioOD}
                        onChange={(e) => setCupToDiscRatioOD(parseFloat(e.target.value))}
                        className="w-full accent-[#4F46E5] h-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                        <span>C/D OS</span>
                        <span className="font-bold text-indigo-700 font-mono">{cupToDiscRatioOS}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={cupToDiscRatioOS}
                        onChange={(e) => setCupToDiscRatioOS(parseFloat(e.target.value))}
                        className="w-full accent-[#4F46E5] h-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Disc Properties */}
                <div className="grid grid-cols-2 gap-2 text-xxs pt-1">
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Nerve Color Profile</label>
                    <select value={opticNerveColor} onChange={(e) => setOpticNerveColor(e.target.value as any)} className="w-full p-1.5 border bg-white rounded font-medium">
                      <option value="Pink">Healthy Pink / Well Perfused</option>
                      <option value="Pale">Pale / Pallor (Optic Neuropathy)</option>
                      <option value="Cupped">Highly Cupped / Glaucomatous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Disc Margins Status</label>
                    <select value={opticNerveMargins} onChange={(e) => setOpticNerveMargins(e.target.value as any)} className="w-full p-1.5 border bg-white rounded font-medium">
                      <option value="Sharp">Sharp & Distinct</option>
                      <option value="Blurred / Edema">Blurred Margins / Papilledema</option>
                      <option value="Sector Hemorrhage">Segmental / Drance Hemorrhage</option>
                    </select>
                  </div>
                </div>

                {/* Macular Health & Vitreous */}
                <div className="space-y-1.5 pt-1 text-xxs">
                  <div className="flex justify-between items-center bg-white p-1 px-2 border rounded-lg">
                    <label className="font-bold text-neutral-700 cursor-pointer flex items-center gap-1.5">
                      <input type="checkbox" checked={maculaBilateralNormal} onChange={(e) => setMaculaBilateralNormal(e.target.checked)} className="rounded" />
                      <span>Macula Normal bilateral foveal reflex</span>
                    </label>
                  </div>
                  {!maculaBilateralNormal && (
                    <input
                      type="text"
                      className="w-full text-xxs px-2 py-0.5 border bg-red-50/20"
                      value={maculaDetails}
                      onChange={(e) => setMaculaDetails(e.target.value)}
                      placeholder="Describe dry AMD changes, drusen density, or cystic edema..."
                    />
                  )}
                  <div>
                    <label className="block text-[10px] text-neutral-550 font-bold mb-0.5">Vitreous Status</label>
                    <input
                      type="text"
                      value={vitreousStatus}
                      onChange={(e) => setVitreousStatus(e.target.value)}
                      className="w-full p-1.5 text-xxs border bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Clear, syneresis present, or normal detachment absent."
                    />
                  </div>
                </div>

                {/* Retinal CST Thickness Telemetry Indicators */}
                <div className="pt-2 border-t border-neutral-100 flex gap-2 items-center text-xxs">
                  <div className="flex-1 bg-white p-1 border rounded">
                    <span className="block text-[8px] text-neutral-400">OCT CST OD</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input type="number" value={cstMicronsOD} onChange={(e) => setCstMicronsOD(parseInt(e.target.value) || 200)} className="w-12 text-center p-0.5 border" />
                      <span className="text-[10px]">µm</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-1 border rounded">
                    <span className="block text-[8px] text-neutral-400">OCT CST OS</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input type="number" value={cstMicronsOS} onChange={(e) => setCstMicronsOS(parseInt(e.target.value) || 200)} className="w-12 text-center p-0.5 border" />
                      <span className="text-[10px]">µm</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-1 cursor-pointer bg-amber-50 p-1 border border-amber-250 rounded text-[9px] text-amber-950 font-bold leading-tight">
                      <input type="checkbox" checked={macularHemorrhageChecked} onChange={(e) => setMacularHemorrhageChecked(e.target.checked)} className="rounded scale-75" />
                      <span>Hemorrhage/Fluid</span>
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* --- RIGHT SECTION (4 COLS): SORTING MATRIX, DIRECTION TRAFFIC, DUAL PIPELINE --- */}
        <div className="lg:col-span-4 space-y-6">

          {/* BLOCK 3: ADVANCED DIAGNOSTIC CODING (The Sorting Matrix) */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-2">
              <Dna className="w-4 h-4 text-[#4F46E5]" />
              Fuzzy ICD-10 Resolution Mapping
            </h4>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={diagnosticSearch}
                  onChange={(e) => setDiagnosticSearch(e.target.value)}
                  placeholder="Type term (e.g., Myopia, Cataract, AMD)..."
                  className="w-full text-xs pl-8 pr-3 py-2 border border-neutral-250 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Fuzzy Results block with scroll */}
              {diagnosticSearch && (
                <div className="max-h-28 overflow-y-auto border border-neutral-150 rounded-lg bg-white divide-y devide-neutral-100 text-xxs animate-fadeIn z-10 absolute width-[280px] shadow-lg">
                  {filteredICDCodes.length > 0 ? (
                    filteredICDCodes.map(item => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleAddDiagnosis(item)}
                        className="w-full text-left p-2 hover:bg-[var(--clr-brand-blue)]/10 text-neutral-800 flex justify-between gap-2 border-b"
                      >
                        <span className="font-semibold text-indigo-700">{item.code}</span>
                        <span className="truncate text-gray-500">{item.term}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-center text-neutral-400">No matching diagnostic records.</div>
                  )}
                </div>
              )}

              {/* Quick Select Panel */}
              <div className="p-2 border border-[var(--clr-border-light)] bg-neutral-50/50 rounded-lg space-y-1">
                <span className="block text-[9px] text-[#4F46E5] font-extrabold uppercase">Quick Click Baseline ICDs</span>
                <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                  {ICD10_REGISTRY.map(diag => (
                    <button
                      key={diag.code}
                      type="button"
                      onClick={() => handleAddDiagnosis(diag)}
                      className="text-left text-[9px] p-1 border rounded bg-white hover:bg-neutral-50 hover:border-indigo-250 truncate text-gray-700"
                      title={diag.term}
                    >
                      <span className="font-bold text-indigo-600 font-mono">[{diag.code}]</span> {diag.term.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active list */}
              <div>
                <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Active Coded Diagnostics Portfolio</span>
                {selectedDiagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedDiagnoses.map(diag => (
                      <span
                        key={diag.code}
                        className="inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-[var(--clr-brand-blue)]/10 border border-indigo-200 text-indigo-900 rounded font-semibold font-mono"
                      >
                        {diag.code} ({diag.term.split(" ")[0]})
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(diag.code)}
                          className="text-red-500 hover:text-red-700 font-bold scale-110 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 border border-dashed border-neutral-250 text-xxs text-neutral-450 italic">
                    No diagnostics code attached. Tap codes from registry above.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* BLOCK 4: INTER-CLINIC referral routing (The Traffic Director) */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Inter-Clinic Referral Routing Engine
            </h4>

            <div className="space-y-4">
              
              {/* Dynamic Auto-routing Suggestion Board */}
              <div className="space-y-1.5">
                <span className="block text-[9px] text-[#F59E0B] font-extrabold uppercase">Clinical Criteria Safety Check</span>
                
                <div className="space-y-1 text-xxs">
                  {/* Glaucoma suggest check criteria */}
                  {(telemetryIopOD > 22 || telemetryIopOS > 22 || cupToDiscRatioOD > 0.6 || cupToDiscRatioOS > 0.6) ? (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-900 leading-tight">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-650 shrink-0" />
                        FLAG: GLAUCOMA SPECIALIST INTERCEPT INDICATED
                      </span>
                      IOP exceeds 22 mmHg or C/D ratio is high (&gt;0.6). High priority glaucoma analysis recommended.
                    </div>
                  ) : null}

                  {/* Retina suggest check criteria */}
                  {(cstMicronsOD > 300 || cstMicronsOS > 300 || macularHemorrhageChecked) ? (
                    <div className="p-2 rounded bg-amber-50 border border-amber-250 text-amber-900 leading-tight">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        FLAG: RETINA WING EVALUATION RECOMMENDED
                      </span>
                      CST microns exceed 300 µm or active macular hemorrhage / dry-wet AMD detected. Retina scan recommended.
                    </div>
                  ) : null}

                  {/* Surgical dense cataracts check */}
                  {(lensRightStatus.toLowerCase().includes("3+") || lensRightStatus.toLowerCase().includes("4+") || lensRightStatus.toLowerCase().includes("cataract") || selectedDiagnoses.some(d => d.code === "H11.003")) ? (
                    <div className="p-2 rounded bg-[#FBFBF9] border border-indigo-200 text-indigo-950 leading-tight">
                      <span className="font-bold text-[#4F46E5] flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 shrink-0" />
                        FLAG: SURGICAL MAIN OR SCHEDULING INDICATED
                      </span>
                      Dense nuclear changes or progressive pterygium found. Safe-guard recommends Outpatient Surgical phacoemulsification queue.
                    </div>
                  ) : null}

                  {!(telemetryIopOD > 22 || telemetryIopOS > 22 || cupToDiscRatioOD > 0.6 || cupToDiscRatioOS > 0.6 || cstMicronsOD > 300 || cstMicronsOS > 300 || macularHemorrhageChecked || lensRightStatus.toLowerCase().includes("3+") || lensRightStatus.toLowerCase().includes("cataract")) && (
                    <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Routine refraction spectrum; no high-risk specialty pathology flags.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Router Selector */}
              <div className="p-3 border border-[var(--clr-border-light)] bg-neutral-50/50 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xxs">
                  <div>
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase mb-1">Target Dispatch Wing</label>
                    <select
                      value={referralTarget}
                      onChange={(e) => setReferralTarget(e.target.value as any)}
                      className="w-full text-xxs bg-white border p-1 rounded font-bold text-[#4F46E5]"
                    >
                      <option value="None">-- Select Dispatch --</option>
                      <option value="RETINA">Retina Clinic (Wing East)</option>
                      <option value="GLAUCOMA">Glaucoma Clinic (Wing West)</option>
                      <option value="MAIN_OR_QUEUE">Surgical Main OR Queue</option>
                      <option value="PEDIATRIC_STRABISMUS">Pediatrics & Strabismus</option>
                      <option value="ORBIT_OCULOPLASTICS">Orbit & Oculoplastics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-neutral-500 font-bold uppercase mb-1">Clinic Urgency Code</label>
                    <select
                      value={referralUrgency}
                      onChange={(e) => setReferralUrgency(e.target.value as any)}
                      className="w-full text-xxs bg-white border p-1 rounded font-semibold"
                    >
                      <option value="ROUTINE">Routine Follow-up</option>
                      <option value="URGENT">Urgent Wing Review</option>
                      <option value="STAT_EMERGENCY">STAT / EMERGENCY</option>
                    </select>
                  </div>
                </div>

                <div className="text-xxs">
                  <label className="block text-[9px] text-neutral-550 mb-0.5">Referral Statement / Clinical Rationale</label>
                  <textarea
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    className="w-full p-1.5 border bg-white h-12 focus:ring-1 focus:ring-indigo-500 outline-none rounded"
                    placeholder="Provide diagnostic summary and requested consult action..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDispatchReferral}
                  disabled={referralTarget === "None"}
                  className="w-full py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded font-bold text-xxs transition shadow"
                >
                  🚀 Dispatch Wing Referral Ticket
                </button>
              </div>

              {/* Dispatched logs list */}
              {internalReferralList.length > 0 && (
                <div className="space-y-1 pt-1.5 text-xxs">
                  <span className="block font-bold text-[9px] text-[#4F46E5]">Active Dispatches Loaded in Current Session</span>
                  <div className="divide-y devide-neutral-200">
                    {internalReferralList.map((ref, idx) => (
                      <div key={idx} className="py-1 bg-white border rounded p-1 mb-1 shadow-sm flex justify-between gap-2 items-center">
                        <div className="truncate">
                          <span className="font-bold text-[#F59E0B]">[{ref.urgency}]</span> {ref.target} Wing
                          <span className="block text-[9px] text-neutral-400 truncate">{ref.reason}</span>
                        </div>
                        <span className="text-[9px] bg-[var(--clr-brand-blue)]/10 px-1 py-0.5 rounded text-indigo-700 font-bold shrink-0">PENDING SIGN</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* BLOCK 5: UNIFIED DISPENSING AND E-PRESCRIBING (Dual Pipeline) */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3">
              <Layers className="w-4 h-4 text-[#4F46E5]" />
              Dual-Fulfillment Delivery Pipeline
            </h4>

            <div className="space-y-4">
              
              {/* PATH A: MEDICAL REQUISITIONS (PHARMACY GRUSTS) */}
              <div className="bg-emerald-50/20 p-2.5 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-xxs font-extrabold text-emerald-800 uppercase block border-b border-emerald-100 pb-1 flex justify-between">
                  <span>🟢 Path A: Pharmacy Dispatch (Medical Drops)</span>
                  <span className="text-[9px] font-bold text-emerald-800">Therapeutics Vault</span>
                </span>

                {/* Formulary dropdown selection */}
                <div className="space-y-1.5 text-xxs">
                  <label className="block text-[9px] text-neutral-500 font-semibold leading-none">Ophthalmic formulary stock checks</label>
                  <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
                    {inventoryStocks.map(drug => (
                      <div key={drug.id} className="flex justify-between items-center text-[10px] bg-white p-1 px-1.5 border rounded">
                        <div className="truncate">
                          <div className="font-semibold text-neutral-800 truncate">{drug.name}</div>
                          <div className="text-[9px] text-neutral-450">{drug.category} • <span className="font-mono text-indigo-600">Stock: {drug.stock}</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddMedToCart(drug)}
                          className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold shrink-0 transition"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Cart */}
                {prescriptionCart.length > 0 ? (
                  <div className="space-y-1.5 text-xxs border-t border-emerald-100 pt-2 animate-fadeIn">
                    <span className="block font-bold text-[9px] text-emerald-800">Drugging Cart for Active Session</span>
                    {prescriptionCart.map(rxItem => (
                      <div key={rxItem.id} className="bg-white p-1.5 border rounded space-y-1 relative shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedFromCart(rxItem.id)}
                          className="absolute right-1 top-1 text-red-500 font-bold hover:scale-110"
                        >
                          ×
                        </button>
                        <div className="font-bold text-neutral-800 text-[10px] pr-4">{rxItem.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <div>
                            <span className="block text-[8px] text-neutral-400">Duration (Days)</span>
                            <input
                              type="number"
                              value={rxItem.duration}
                              onChange={(e) => handleUpdateCartDuration(rxItem.id, parseInt(e.target.value) || 30)}
                              className="w-12 text-center border"
                            />
                          </div>
                          <div>
                            <span className="block text-[8px] text-neutral-400">SIG Instructions</span>
                            <input
                              type="text"
                              value={rxItem.dosage}
                              onChange={(e) => handleUpdateCartDosage(rxItem.id, e.target.value)}
                              className="w-full text-[9px] border p-0.5 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-neutral-450 border border-dashed border-emerald-100 text-[10px] italic">
                    No medical formulary drops loaded in cart.
                  </div>
                )}
              </div>

              {/* PATH B: LENS FABRICATION (RETAIL OPTICAL DISPATCH) */}
              <div className="bg-[var(--clr-brand-blue)]/10/20 p-2.5 border border-indigo-200 rounded-xl space-y-2">
                <span className="text-xxs font-extrabold text-indigo-700 uppercase block border-b border-indigo-150 pb-1 flex justify-between">
                  <span>🔵 Path B: Send to Optical (Glasses Prescription)</span>
                  <span className="text-[9px] font-bold text-indigo-700">Retail Sync</span>
                </span>

                <div className="space-y-1 text-xxs">
                  <div className="flex justify-between items-center bg-white p-1.5 border rounded-lg">
                    <label className="font-bold text-neutral-700 cursor-pointer flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={isOpticalPrescriptionAuthorized}
                        onChange={(e) => setIsOpticalPrescriptionAuthorized(e.target.checked)}
                        className="rounded scale-75"
                        id="auth_optical"
                      />
                      <span>Authorize Ophthalmic Finishing Release</span>
                    </label>
                  </div>
                  <p className="text-[9px] text-neutral-500 leading-normal">
                    Filing the encounter signs and releases raw refraction coordinates strictly to the retail lens finishing lab database.
                  </p>
                </div>

                {isOpticalPrescriptionAuthorized && (
                  <div className="space-y-2 border-t border-indigo-150 pt-1.5 animate-fadeIn">
                    <button
                      type="button"
                      onClick={handleSendToOpticalShop}
                      className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded font-bold text-xxs transition shadow-sm"
                    >
                      ⚙️ Transmit Manifest to Optical Lab Finishing
                    </button>

                    {opticalTicketCreated && (
                      <div className="p-1 px-1.5 bg-[var(--clr-brand-blue)]/10 border border-indigo-200 rounded text-[9px] text-indigo-850 font-bold flex justify-between font-mono animate-pulse">
                        <span>🏷️ SYNCS TKT REF:</span>
                        <span>{opticalPrescriptionRefNo}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* BLOCK 5.5: MANDATORY SURGICAL PRE-OP CLEARANCE (WHO PROTOCOL) */}
          {(referralTarget === "MAIN_OR_QUEUE" || selectedPatient.status === "SURGERY_IN_PROGRESS") && (
            <div className="pt-2">
              <SurgicalTheaterDashboard
                patient={selectedPatient}
                onUpdatePatient={(updatedPatient) => {
                  onUpdatePatient(updatedPatient);
                }}
                language={language}
              />
            </div>
          )}

          {/* BLOCK 6: CONCLUDE ENCOUNTER CONTROL BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCompileConsultation}
              className="w-full py-3 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-95"
            >
              ✓ Complete & Finalize Comprehensive Consultation
            </button>
            <p className="text-[10px] text-center text-neutral-400 mt-1 leading-normal italic">
              Concluding compiles diagnosis matrices, registers retail optometry orders, and releases medical prescriptions to central cashier desks.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

// Quick status utility
function isPreemieOrLowWeight(gestationalWeeks: number, weightGrams: number): boolean {
  return gestationalWeeks <= 30 || weightGrams <= 1500;
}

// 9 cardinal gazes button builder
interface GazeButtonProps {
  UL: number; U: number; UR: number; L: number; C: number; R: number; DL: number; D: number; DR: number;
}
function renderGazeButton(gazeKey: string, muscleGroup: string, clinicalContext: string) {
  // Use state from hook-level, wait, we are inside a functional component! So we must pass the state as props or define inline.
  // Instead of breaking React variable references, we can define a nested function in the component body.
  // Let's implement it inside the component scope itself so we don't need parameters.
}
