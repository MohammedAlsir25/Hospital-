/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Baby, 
  Eye, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  Info, 
  Plus, 
  Trash2, 
  Calendar, 
  Sliders, 
  Settings, 
  Dna, 
  Glasses, 
  FileCheck
} from "lucide-react";
import { Patient, BillingItem, ClinicalLogEntry } from "../types";

export interface PediatricStrabismusWorkstationProps {
  selectedPatient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  finalizeConsultation: (notesPayload: string) => void;
}

export default function PediatricStrabismusWorkstation({
  selectedPatient,
  onUpdatePatient,
  finalizeConsultation
}: PediatricStrabismusWorkstationProps) {
  
  // 1. Developmental & Neonatal Triage Context
  const [gestationalAge, setGestationalAge] = useState<number>(() => {
    // Attempt to guess if they are premie or have metadata in system, default normal range
    return selectedPatient.age <= 1 ? 29 : 38;
  });
  const [birthWeight, setBirthWeight] = useState<number>(() => {
    return selectedPatient.age <= 1 ? 1200 : 3100;
  });
  
  const [milestones, setMilestones] = useState({
    grossMotor: false,
    cognitive: false,
    languageSpeech: false,
    fineMotor: false,
    socialEmotional: false,
  });

  // ROP screening validation
  const isRopRisk = gestationalAge <= 30 || birthWeight <= 1500;

  // 2. Pediatric Visual Acuity (VA) Method Matcher
  const [vaMethod, setVaMethod] = useState<"CSM" | "Teller Cards" | "LEA Symbols" | "HOTV Letters" | "Snellen">("LEA Symbols");
  const [vaOD, setVaOD] = useState<string>("20/30");
  const [vaOS, setVaOS] = useState<string>("20/80");
  const [vaOU, setVaOU] = useState<string>("20/30");

  // 3. The Motor Exam: 9 Cardinal Gazes & Alignment Matrix
  const [deviationType, setDeviationType] = useState<"ESOTROPIA" | "EXOTROPIA" | "HYPERTROPIA" | "HYPOTROPIA">("ESOTROPIA");
  const [isConstant, setIsConstant] = useState<boolean>(true);
  const [pctDistance, setPctDistance] = useState<number>(30); // in prism diopters Delta
  const [pctNear, setPctNear] = useState<number>(35); // in prism diopters Delta
  
  // 9 Cardinal Gazes: value from -4 (extreme underaction) to +4 (extreme overaction)
  const [gazeValues, setGazeValues] = useState<Record<string, number>>({
    UL: 0, // Up-Left (Superior Rectus / Inferior Oblique)
    U: 0,  // Up (Superior Recti)
    UR: 2, // Up-Right (Inferior Oblique overaction, common in V-pattern)
    L: -1, // Left (Lateral Rectus OS / Medial Rectus OD)
    C: 0,  // Center (Primary Position)
    R: 0,  // Right (Medial OS / Lateral OD)
    DL: 0, // Down-Left (Inferior Rectus / Superior Oblique)
    D: 0,  // Down (Inferior Recti)
    DR: 0  // Down-Right (Superior Oblique)
  });

  const [headPosture, setHeadPosture] = useState({
    faceTurnRight: false,
    faceTurnLeft: false,
    headTiltRight: false,
    headTiltLeft: false,
    chinUp: false,
    chinDown: false,
  });

  // 4. Sensory & Binocular Vision Function Panel
  const [stereoacuity, setStereoacuity] = useState<number>(400); // arc sec
  const [worth4Dot, setWorth4Dot] = useState<"NORMAL_FUSION" | "RIGHT_SUPPRESSION" | "LEFT_SUPPRESSION" | "DIPLOPIA">("LEFT_SUPPRESSION");
  const [bagoliniResults, setBagoliniResults] = useState<string>("Left suppression bar; right diagonal intact.");
  const [sensoryAmsler, setSensoryAmsler] = useState<string>("UNABLE_TO_PERFORM");

  // 5. Cycloplegic Refraction Grid
  const [cycloplegiaAchieved, setCycloplegiaAchieved] = useState<boolean>(true);
  const [refractionAgent, setRefractionAgent] = useState<string>("Cyclopentolate 1%");
  const [cycloplegicTimestamp, setCycloplegicTimestamp] = useState<string>("10:15");
  
  const [sphereOD, setSphereOD] = useState<string>("+3.25");
  const [cylinderOD, setCylinderOD] = useState<string>("-0.50");
  const [axisOD, setAxisOD] = useState<string>("90");
  const [sphereOS, setSphereOS] = useState<string>("+5.50");
  const [cylinderOS, setCylinderOS] = useState<string>("-1.00");
  const [axisOS, setAxisOS] = useState<string>("180");
  const [glassesPrescribed, setGlassesPrescribed] = useState<boolean>(true);

  // 6. Amblyopia Management Compliance Matrix
  const [amblyopiaPresent, setAmblyopiaPresent] = useState<boolean>(true);
  const [amblyopiaType, setAmblyopiaType] = useState<"STRABISMIC" | "REFRACTIVE" | "DEPRIVATION" | "MIXED">("STRABISMIC");
  const [amblyopiaEye, setAmblyopiaEye] = useState<"RIGHT_EYE" | "LEFT_EYE" | "BILATERAL">("LEFT_EYE");
  
  const [patchingHours, setPatchingHours] = useState<number>(4);
  const [patchType, setPatchType] = useState<string>("Adhesive Orthoptic Edge-Gard");
  const [occlusionRegimen, setOcclusionRegimen] = useState<string>("Patch Right Eye 4 hours daily during active near visual tasks.");
  const [complianceRating, setComplianceRating] = useState<"GOOD" | "FAIR" | "POOR">("GOOD");
  
  const [penalizationActive, setPenalizationActive] = useState<boolean>(false);
  const [atropineBlurInstructions, setAtropineBlurInstructions] = useState<string>("1 drop Atropine 1% inside Right Eye daily on weekends (Sat/Sun) to penalize sound eye.");

  // 7. Referral Dispatcher State
  const [referralTarget, setReferralTarget] = useState<string>("None");
  const [referralUrgency, setReferralUrgency] = useState<"ROUTINE" | "URGENT" | "STAT_EMERGENCY">("ROUTINE");
  const [referralReason, setReferralReason] = useState<string>("");
  const [referralHistory, setReferralHistory] = useState<Array<{target: string, date: string, status: string}>>([]);

  // 8. Unified E-Prescribing Pharmacy Orders
  const [pediatricPrescriptions, setPediatricPrescriptions] = useState<Array<{
    id: string;
    drugName: string;
    dose: string;
    freq: string;
    duration: string;
    instructions: string;
  }>>([
    {
      id: "rx-cyclopentolate-1",
      drugName: "Cyclopentolate 1% Ophthalmic Drops",
      dose: "1 drop",
      freq: "ONCE",
      duration: "1 day",
      instructions: "Administered in-clinic for cycloplegic retinoscopy check."
    }
  ]);

  const [customPrescription, setCustomPrescription] = useState({
    name: "Cyclopentolate 1% Ophthalmic Drops",
    dose: "1 drop",
    freq: "ONCE",
    duration: "1 day",
    instructions: "In-clinic use."
  });

  // Dose safety warnings
  const [bypassSafetyChecked, setBypassSafetyChecked] = useState<boolean>(false);
  
  // Compute if age under 1 year
  const isInfant = selectedPatient.age < 1;

  // Watch prescriptions for Atropine 1% in Infant
  const hasAtropine1InInfant = isInfant && pediatricPrescriptions.some(rx => 
    rx.drugName.toLowerCase().includes("atropine 1%")
  );

  const handleAddPrescription = (name: string, defaultDose = "1 drop", defaultFreq = "BID", defaultDuration = "30 days", defaultInstructions = "") => {
    const nextRx = {
      id: `peds-rx-${Date.now()}`,
      drugName: name,
      dose: defaultDose,
      freq: defaultFreq,
      duration: defaultDuration,
      instructions: defaultInstructions
    };
    setPediatricPrescriptions(p => [...p, nextRx]);
  };

  const handleRemovePrescription = (id: string) => {
    setPediatricPrescriptions(p => p.filter(rx => rx.id !== id));
  };

  // Quick Action Dosing Helper
  const downgradeAtropine = () => {
    setPediatricPrescriptions(p => 
      p.map(rx => {
        if (rx.drugName.toLowerCase().includes("atropine 1%")) {
          return {
            ...rx,
            drugName: "Atropine 0.5% Ophthalmic Drops (Infant Safe Dosing)"
          };
        }
        return rx;
      })
    );
    setBypassSafetyChecked(false);
  };

  const cycleGazeValue = (gazeKey: string, direction: number) => {
    setGazeValues(prev => {
      let nextVal = prev[gazeKey] + direction;
      if (nextVal > 4) nextVal = -4;
      if (nextVal < -4) nextVal = 4;
      return {
        ...prev,
        [gazeKey]: nextVal
      };
    });
  };

  // Formulate output compilation
  const handleFinalSubmit = () => {
    if (hasAtropine1InInfant && !bypassSafetyChecked) {
      alert("🚨 HIGH PRIORITY BLOCK: Atropine 1% detected for patients under 12 months. Please resolve the warning or click bypass before filing!");
      return;
    }

    // Capture complete state notes conforming to PediatricConsultationSubmissionDTO
    const payloadObject = {
      visitId: `V-${Date.now().toString().slice(-6)}`,
      patientId: selectedPatient.id,
      neonatalContext: {
        gestationalAgeWeeks: gestationalAge,
        birthWeightGrams: birthWeight,
        developmentalMilestones: Object.entries(milestones)
          .filter(([, checked]) => checked)
          .map(([name]) => name)
          .join(", ") || "No significant cognitive/motor milestone delays."
      },
      pediatricVisualAcuity: {
        vaMethod,
        vaRight: vaOD,
        vaLeft: vaOS,
        vaBinocular: vaOU
      },
      cycloplegicRefraction: {
        cycloplegiaAchieved,
        refractionAgent,
        refractionRightSph: parseFloat(sphereOD) || 0,
        refractionRightCyl: parseFloat(cylinderOD) || 0,
        refractionRightAxis: parseInt(axisOD) || 0,
        refractionLeftSph: parseFloat(sphereOS) || 0,
        refractionLeftCyl: parseFloat(cylinderOS) || 0,
        refractionLeftAxis: parseInt(axisOS) || 0,
        glassesPrescribed
      },
      strabismusMotorExam: {
        deviationType,
        deviationConstant: isConstant,
        deviationDistanceNearPd: `Distance: ${pctDistance} PD, Near: ${pctNear} PD`,
        coverTestDistance: `${isConstant ? "Constant" : "Intermittent"} alignment mismatch: ${pctDistance} Prism Diopters at distance`,
        ductionsRight: `Gaze values SR/IO OD: ${gazeValues.UR > 0 ? "+" : ""}${gazeValues.UR}; LR/MR OD: ${gazeValues.L}`,
        versions: `Gaze grid: [UL:${gazeValues.UL}, U:${gazeValues.U}, UR:${gazeValues.UR}, L:${gazeValues.L}, C:${gazeValues.C}, R:${gazeValues.R}, DL:${gazeValues.DL}, D:${gazeValues.D}, DR:${gazeValues.DR}]`,
        headPosture: Object.entries(headPosture)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ") || "Normal symmetrical head alignment."
      },
      sensoryBinocularExam: {
        worth4Dot,
        stereoacuitySeconds: stereoacuity,
        bagoliniGlasses: bagoliniResults,
        amslerGrid: sensoryAmsler
      },
      amblyopiaManagement: {
        amblyopiaPresent,
        amblyopiaType,
        amblyopiaEye,
        patchingHoursPerDay: patchingHours,
        occlusionTherapy: occlusionRegimen,
        atropinePenalization: penalizationActive ? atropineBlurInstructions : "Inactive"
      }
    };

    const strabismusDossier = `Pediatric Strabismus Consultation Finalized. \n` +
      `- Triage: ${gestationalAge} weeks gestational, ${birthWeight}g birth weight. ROP Screen: ${isRopRisk ? "REQUIRED (ALERT TRIGGERED)" : "Routine monitoring"}. \n` +
      `- Acuity (via ${vaMethod}): OD ${vaOD} | OS ${vaOS} | OU ${vaOU}. \n` +
      `- Deviation: ${isConstant ? "Constant" : "Intermittent"} ${deviationType} (${pctDistance} PD Distance, ${pctNear} PD Near). \n` +
      `- Nine Cardinal Gazes: [UL: ${gazeValues.UL} | U: ${gazeValues.U} | UR: ${gazeValues.UR} / L: ${gazeValues.L} | C: ${gazeValues.C} | R: ${gazeValues.R} / DL: ${gazeValues.DL} | D: ${gazeValues.D} | DR: ${gazeValues.DR}]. \n` +
      `- Amblyopia regimen: ${amblyopiaPresent ? `Active ${amblyopiaType} amblyopia targeting ${amblyopiaEye}. Patch ${patchingHours} hrs/day (${complianceRating} compliance).` : "None"}. \n` +
      `- Refraction SPH: OD ${sphereOD} OS ${sphereOS} (Agent: ${refractionAgent}). \n` +
      `- Routing dispatch: ${referralTarget === "None" ? "No specialty escalations required" : `${referralTarget} is scheduled (${referralUrgency})`}. \n` +
      `- Prescribed items: ${pediatricPrescriptions.map(rx => rx.drugName).join(", ")}.`;

    // Add appropriate billing item
    const bills: BillingItem[] = [
      {
        id: `BILL-PED-${Date.now()}`,
        serviceName: `Orthoptic Evaluation & Strabismus Alignment Profiling (Code: ORTHO-ST-9GAZE)`,
        category: "Consultation",
        amount: 850,
        status: "Unpaid"
      }
    ];

    if (glassesPrescribed) {
      bills.push({
        id: `BILL-REFR-${Date.now()}`,
        serviceName: "Pediatric Cycloplegic Refraction Review (Code: REFR-CYCL-PEDS)",
        category: "Consultation",
        amount: 250,
        status: "Unpaid"
      });
    }

    // Check if referral was sent to Surgical queue
    let nextStatus = selectedPatient.status;
    if (referralTarget === "MAIN_OR_QUEUE") {
      nextStatus = "InConsult"; // Keep in consult while updating logs
    }

    const updatedPatient: Patient = {
      ...selectedPatient,
      status: nextStatus,
      billingLedger: [...selectedPatient.billingLedger, ...bills],
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Pediatric Strabismus Specialist",
          action: "Strabismus Examination Finalized",
          notes: strabismusDossier
        },
        ...(referralTarget !== "None" ? [{
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "System Router",
          action: "Specialty Referral Dispatched",
          notes: `Sent to ${referralTarget} Clinic. Priority: ${referralUrgency}. Rationale: ${referralReason || "Strabismus alignment core referral"}`
        }] : [])
      ]
    };

    if (referralTarget === "MAIN_OR_QUEUE") {
      // Set indicator for surgery recommended and simulation status
      (updatedPatient as any).surgeryRecommended = true;
      (updatedPatient as any).surgeryType = "Bilateral Medial Rectus Recession";
      (updatedPatient as any).referralStatus = "SURGICAL_PENDING";
    }

    onUpdatePatient(updatedPatient);
    finalizeConsultation(strabismusDossier);
    alert("✨ Pediatric Strabismus & Amblyopia workstation compilation completed successfully! Records and prescriptions have been synchronized.");
  };

  const dispatchReferralNow = () => {
    if (referralTarget === "None") {
      alert("Please select a valid inter-clinic target queue first!");
      return;
    }
    const newRef = {
      target: referralTarget,
      date: new Date().toLocaleTimeString().slice(0, 5),
      status: "Dispatched"
    };

    setReferralHistory(prev => [...prev, newRef]);
    
    // Auto populate reasonable reasons if empty
    if (!referralReason) {
      if (referralTarget === "NEURO_OPHTHALMOLOGY") {
        setReferralReason("Acute onset infantile onset esotropia. Rule out abducens (6th nerve) paralysis, cranial pathology, or infantile nystagmus syndrome.");
      } else if (referralTarget === "ORBIT_OCULOPLASTICS") {
        setReferralReason("Severe congenital blepharoptosis obscuring visual axis OS, imminent risk of deprivational bilateral amblyopia. Request surgical correction.");
      } else if (referralTarget === "GENERAL_OPHTHALMOLOGY_OPTICAL") {
        setReferralReason("Provide high-index safety polycarbonate lenses to correct fully accommodative esotropia of high hyperopic spectrum.");
      } else if (referralTarget === "MAIN_OR_QUEUE") {
        setReferralReason("Schedule Bilateral Medial Rectus Recession for large angle constant Esotropia (35 PD) persistent post-cycloplegia.");
      }
    }

    alert(`🚀 Patient successfully routed to queue: ${referralTarget}! This queue will process the dispatch transaction on final consultation compilation.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-sans" id="pediatric_strabismus_workstation">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--clr-border-light)] pb-3 gap-2">
        <div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            👶 Pediatric Ophthalmology & Strabismus Workstation
          </h3>
          <p className="text-xs text-neutral-500">
            Integrated diagnostic dashboard for juvenile misalignments, micro-surgical planning, and sensory occlusion tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xxs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[var(--clr-brand-blue)]/10 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            Pediatric Active Range
          </span>
          {isPreemieOrLowWeight(gestationalAge, birthWeight) && (
            <span className="text-xxs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-amber-50 text-amber-700 animate-pulse">
              ROP TIMELINES ACTIVE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- LEFT HAND SECTION (8 cols): CLINICAL CORE --- */}
        <div className="lg:col-span-8 space-y-6">

          {/* BLOCK 1: Neonatal context & Developmental Milestones */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3">
              <Baby className="w-4 h-4 text-[#4F46E5]" />
              Developmental & Neonatal Triage Context
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-dashed border-[var(--clr-border-light)] mb-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-550 font-medium mb-1">Gestational Age (weeks)</label>
                  <input
                    type="number"
                    min="20"
                    max="45"
                    value={gestationalAge}
                    onChange={(e) => setGestationalAge(parseInt(e.target.value) || 38)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-550 font-medium mb-1">Birth Weight (grams)</label>
                  <input
                    type="number"
                    min="300"
                    max="6000"
                    value={birthWeight}
                    onChange={(e) => setBirthWeight(parseInt(e.target.value) || 3000)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                {isRopRisk ? (
                  <div className="w-full bg-amber-50/70 border border-amber-200/90 rounded-xl p-2.5 flex gap-2 items-start animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-tiny text-amber-900">
                      <span className="font-bold block">⚠️ ACTIVE ROP SCREENING MANDATED</span>
                      Born at {gestationalAge} wks / {birthWeight}g (Matches criteria ≤30 wks or ≤1500g). Schedule ophthalmology screening without delay!
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 flex gap-2 items-center">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-tiny text-emerald-800">
                      ROP risk criteria normal; monitoring within infant pediatric timeline guidelines.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Developmental Milestone Checklist */}
            <div>
              <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-2">Neonatal Milestone Assessment Checklist</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { key: "grossMotor", label: "Gross Motor Delay" },
                  { key: "cognitive", label: "Cognitive Delay" },
                  { key: "languageSpeech", label: "Language Delay" },
                  { key: "fineMotor", label: "Fine Motor Delay" },
                  { key: "socialEmotional", label: "Social/Emotional" }
                ].map((item) => (
                  <label 
                    key={item.key} 
                    className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-xxs font-medium cursor-pointer transition ${
                      milestones[item.key as keyof typeof milestones]
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-neutral-50/40 border-neutral-150 hover:bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={milestones[item.key as keyof typeof milestones]}
                      onChange={(e) => setMilestones(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-neutral-300 text-red-500 focus:ring-red-400"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>


          {/* BLOCK 2: Visual Acuity Matcher Matrix */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Eye className="w-4 h-4 text-[#4F46E5]" />
              Pediatric Visual Acuity (VA) Method Matcher
            </h4>

            {/* Test Modality Picker */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Acuity Testing Modality</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: "CSM", label: "CSM", sub: "Infants" },
                  { id: "Teller Cards", label: "Teller Cards", sub: "Preferential" },
                  { id: "LEA Symbols", label: "LEA Symbols", sub: "Interactive" },
                  { id: "HOTV Letters", label: "HOTV Letters", sub: "Verbal Matching" },
                  { id: "Snellen", label: "Snellen/LogMAR", sub: "Older Kids" }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setVaMethod(method.id as any)}
                    className={`p-2 border rounded-xl text-center transition ${
                      vaMethod === method.id 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <div className="text-xs font-extrabold">{method.label}</div>
                    <div className={`text-[9px] ${vaMethod === method.id ? "text-indigo-200" : "text-neutral-400"}`}>{method.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* VA Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">Right Eye (OD)</label>
                <input
                  type="text"
                  value={vaOD}
                  onChange={(e) => setVaOD(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 20/30 or CSM"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">Left Eye (OS)</label>
                <input
                  type="text"
                  value={vaOS}
                  onChange={(e) => setVaOS(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 20/80 or CSM"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-neutral-600 mb-1">Binocular (OU)</label>
                <input
                  type="text"
                  value={vaOU}
                  onChange={(e) => setVaOU(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 20/30"
                />
              </div>
            </div>
          </div>


          {/* BLOCK 3: Motor Exam, 9 Cardinal Gazes & Alignment Matrix */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Activity className="w-4 h-4 text-[#4F46E5]" />
              The Motor Exam: 9 Cardinal Gazes & Alignment Matrix
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Deviation Staging */}
              <div className="space-y-4">
                <span className="block text-[10px] text-neutral-500 font-bold uppercase">Deviation Properties</span>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-700">Ocular Alignment Anomaly</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "ESOTROPIA", label: "Esotropia (ET - Inward)" },
                      { id: "EXOTROPIA", label: "Exotropia (XT - Outward)" },
                      { id: "HYPERTROPIA", label: "Hypertropia (HT - Upward)" },
                      { id: "HYPOTROPIA", label: "Hypotropia (HoT - Downward)" }
                    ].map((stg) => (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => setDeviationType(stg.id as any)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xxs font-semibold transition ${
                          deviationType === stg.id 
                            ? "bg-[var(--clr-brand-blue)]/10 border-indigo-300 text-indigo-900" 
                            : "bg-neutral-50/50 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {stg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pt-2 bg-neutral-50/50 p-2 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={isConstant}
                        onChange={(e) => setIsConstant(e.target.checked)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-tiny block">Constant Deviation</span>
                        <span className="text-[10px] text-neutral-500 leading-none">Unvarying throughout gaze</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Prism Cover Test Slider Measurements */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
                      <span>Distance Deviation (6 meters)</span>
                      <span className="font-extrabold pr-1 text-indigo-600 font-mono">{pctDistance} Δ</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="75"
                      step="1"
                      value={pctDistance}
                      onChange={(e) => setPctDistance(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
                      <span>Near Deviation (33 cm)</span>
                      <span className="font-extrabold pr-1 text-indigo-600 font-mono">{pctNear} Δ</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="75"
                      step="1"
                      value={pctNear}
                      onChange={(e) => setPctNear(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 9 Cardinal Gazes Matrix Tool */}
              <div className="space-y-3 bg-neutral-50/50 p-3 rounded-2xl border border-neutral-150">
                <div className="flex justify-between items-center pb-1 border-b border-neutral-200">
                  <span className="block text-[10px] text-neutral-550 font-bold uppercase">9 Cardinal Gaze Grid (Ductions/Versions)</span>
                  <span className="text-[9px] text-indigo-600 font-mono">Click cells to check strength matrix</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
                  
                  {/* Row 1 */}
                  {renderGazeButton("UL", "Superior Left", "SR/IO")}
                  {renderGazeButton("U", "Superior", "Recti")}
                  {renderGazeButton("UR", "Superior Right", "IO/SR")}

                  {/* Row 2 */}
                  {renderGazeButton("L", "Lateral Left", "LR/MR")}
                  <div className="bg-indigo-600 text-white border border-indigo-700 rounded-xl p-1 text-center shrink flex flex-col justify-center items-center shadow">
                    <span className="text-[10px] font-bold block select-none">Primary</span>
                    <span className="text-[9px] font-mono leading-none font-bold">0</span>
                  </div>
                  {renderGazeButton("R", "Lateral Right", "MR/LR")}

                  {/* Row 3 */}
                  {renderGazeButton("DL", "Inferior Left", "IR/SO")}
                  {renderGazeButton("D", "Inferior", "Recti")}
                  {renderGazeButton("DR", "Inferior Right", "SO/IR")}

                </div>

                <p className="text-[10px] text-neutral-500 leading-tight pt-1 text-center font-mono">
                  Legend: <span className="text-red-650 font-semibold">-4 (Severe Restriction)</span> to <span className="text-emerald-700 font-semibold">+4 (Overaction)</span>
                </p>

                {/* Compensatory Head Postures */}
                <div className="pt-2 border-t border-neutral-200/50">
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase mb-1.5">Abnormal Head Posture (Compensatory)</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { key: "faceTurnLeft", label: "Face Turn Left" },
                      { key: "faceTurnRight", label: "Face Turn Right" },
                      { key: "headTiltLeft", label: "Head Tilt Left" },
                      { key: "headTiltRight", label: "Head Tilt Right" },
                      { key: "chinUp", label: "Chin Up" },
                      { key: "chinDown", label: "Chin Down" }
                    ].map((pstr) => (
                      <label key={pstr.key} className="flex items-center gap-1.5 text-xxs text-neutral-650 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={headPosture[pstr.key as keyof typeof headPosture]}
                          onChange={(e) => setHeadPosture(prev => ({ ...prev, [pstr.key]: e.target.checked }))}
                          className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{pstr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>


          {/* BLOCK 4: Sensory & Binocular Vision Panel */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Dna className="w-4 h-4 text-[#4F46E5]" />
              Sensory & Binocular Vision Function Panel
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stereoacuity */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Stereoacuity Depth Perception (seconds of arc)</label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    { value: 40, label: "40\" (Healthy standard)" },
                    { value: 120, label: "120\" (Stereo Circles)" },
                    { value: 400, label: "400\" (Animals)" },
                    { value: 800, label: "800\" (Random Dot)" },
                    { value: 3000, label: "3000\" (Stereo Fly)" },
                    { value: 9999, label: "No stereopsis / Suppression" }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setStereoacuity(preset.value)}
                      className={`p-1 text-left px-2 border rounded-lg text-xxs font-medium transition ${
                        stereoacuity === preset.value
                          ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                          : "bg-neutral-50/50 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xxs font-bold text-neutral-600 shrink-0">Custom Score:</span>
                  <input
                    type="number"
                    value={stereoacuity}
                    onChange={(e) => setStereoacuity(parseInt(e.target.value) || 0)}
                    className="w-full max-w-[100px] text-xs font-semibold px-2 py-1 border border-neutral-250 dark:bg-neutral-900 rounded-md focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <span className="text-xxs text-neutral-500">arc seconds (")</span>
                </div>
              </div>

              {/* Worth 4 Dot & Bagolini */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Worth 4-Dot Sensory Fusion Test</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { val: "NORMAL_FUSION", label: "Normal Fusion (4 Dots)" },
                      { val: "RIGHT_SUPPRESSION", label: "Right Suppression (3 Red)" },
                      { val: "LEFT_SUPPRESSION", label: "Left Suppression (2 Green)" },
                      { val: "DIPLOPIA", label: "Diplopia (5 Dots Red/Grn)" }
                    ].map((test) => (
                      <button
                        key={test.val}
                        type="button"
                        onClick={() => setWorth4Dot(test.val as any)}
                        className={`py-1 px-2 border rounded-lg text-xxs font-medium text-left leading-normal transition ${
                          worth4Dot === test.val
                            ? "bg-[var(--clr-brand-blue)]/10 border-indigo-300 text-indigo-950 font-bold"
                            : "bg-neutral-50/50 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {test.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Bagolini Striated Glasses Report</label>
                  <input
                    type="text"
                    value={bagoliniResults}
                    onChange={(e) => setBagoliniResults(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 border border-neutral-200 rounded-lg dark:bg-neutral-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Describe axis intersecting lines..."
                  />
                </div>
              </div>
            </div>
          </div>


          {/* BLOCK 5: Cycloplegic Refraction Grid */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-4">
              <Glasses className="w-4 h-4 text-[#4F46E5]" />
              Cycloplegic Refraction Grid
            </h4>

            <div className="space-y-4">
              {/* Tracker Panel */}
              <div className="bg-[#FBFBF9] dark:bg-neutral-900 p-2.5 border border-[var(--clr-border-light)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xxs font-extrabold text-[#4F46E5] uppercase tracking-wider px-2 py-1 bg-[var(--clr-brand-blue)]/10 rounded">
                    Drops Instilled Progress Tracker
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={cycloplegiaAchieved}
                      onChange={(e) => setCycloplegiaAchieved(e.target.checked)}
                      id="peds_cycloplegia"
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="peds_cycloplegia" className="cursor-pointer font-bold">Verify Full Pupil Clearance (Cycloplegia)</label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={refractionAgent}
                    onChange={(e) => setRefractionAgent(e.target.value)}
                    className="text-xs bg-white dark:bg-neutral-800 border border-neutral-250 p-1.5 rounded-lg font-medium"
                  >
                    <option value="Cyclopentolate 1%">Cyclopentolate 1% drops</option>
                    <option value="Atropine 1%">Atropine 1% diagnostic drops</option>
                    <option value="Cyclopentolate 0.5%">Cyclopentolate 0.5% (Infant)</option>
                    <option value="None">None (Dry Skia/Retinoscopy)</option>
                  </select>
                  <input
                    type="time"
                    value={cycloplegicTimestamp}
                    onChange={(e) => setCycloplegicTimestamp(e.target.value)}
                    className="text-xs border border-neutral-250 p-1 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nowStr = new Date().toLocaleTimeString().slice(0, 5);
                      setCycloplegicTimestamp(nowStr);
                    }}
                    className="px-2 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded text-xxs font-bold"
                  >
                    Now
                  </button>
                </div>
              </div>

              {/* Retinoscopy numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* OD */}
                <div className="p-3 border border-neutral-200 bg-neutral-50/20 rounded-xl space-y-2">
                  <div className="text-xxs font-mono font-bold text-gray-500 border-b pb-1">RIGHT EYE (OD) OBJECTIVE SKIA</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-500 block">Sphere (SPH)</label>
                      <input
                        type="text"
                        value={sphereOD}
                        onChange={(e) => setSphereOD(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="+3.50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-550 block">Cylinder (CYL)</label>
                      <input
                        type="text"
                        value={cylinderOD}
                        onChange={(e) => setCylinderOD(e.target.value)}
                        className="w-full text-xs font-mono font-semibold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="-0.50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 block">Axis (°)</label>
                      <input
                        type="text"
                        value={axisOD}
                        onChange={(e) => setAxisOD(e.target.value)}
                        className="w-full text-xs font-mono font-semibold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>

                {/* OS */}
                <div className="p-3 border border-neutral-200 bg-neutral-50/20 rounded-xl space-y-2">
                  <div className="text-xxs font-mono font-bold text-gray-500 border-b pb-1">LEFT EYE (OS) OBJECTIVE SKIA</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-550 block">Sphere (SPH)</label>
                      <input
                        type="text"
                        value={sphereOS}
                        onChange={(e) => setSphereOS(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="+5.75"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 block">Cylinder (CYL)</label>
                      <input
                        type="text"
                        value={cylinderOS}
                        onChange={(e) => setCylinderOS(e.target.value)}
                        className="w-full text-xs font-mono font-semibold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="-1.25"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-550 block">Axis (°)</label>
                      <input
                        type="text"
                        value={axisOS}
                        onChange={(e) => setAxisOS(e.target.value)}
                        className="w-full text-xs font-mono font-semibold border border-neutral-250 p-1 text-center bg-white"
                        placeholder="180"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Prescription Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-500">
                  Refractive status requires direct eyeglasses prescription release:
                </span>
                <label className="flex items-center gap-2 cursor-pointer bg-neutral-50 p-2 border rounded-xl hover:bg-neutral-100/80 transition">
                  <input
                    type="checkbox"
                    checked={glassesPrescribed}
                    onChange={(e) => setGlassesPrescribed(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-neutral-850">Prescribe Spectacles Now</span>
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* --- RIGHT HAND SECTION (4 cols): COMPLIANCE & ESCALATION CONTROL PANEL --- */}
        <div className="lg:col-span-4 space-y-6">

          {/* BLOCK 6: Advanced Amblyopia & Treatment Tracking Matrix */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3 border-b pb-1.5 border-neutral-200">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-orange-600" />
                Amblyopia Compliance Tracking
              </h4>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amblyopiaPresent}
                  onChange={(e) => setAmblyopiaPresent(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 scale-90"
                />
                <span className="text-xxs font-bold text-neutral-600">Active</span>
              </label>
            </div>

            {amblyopiaPresent ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-medium">Type</label>
                    <select
                      value={amblyopiaType}
                      onChange={(e) => setAmblyopiaType(e.target.value as any)}
                      className="w-full text-xxs bg-neutral-50 p-1.5 border border-neutral-250 rounded font-bold"
                    >
                      <option value="STRABISMIC">Strabismic</option>
                      <option value="REFRACTIVE">Refractive</option>
                      <option value="DEPRIVATION">Deprivation (Ptosis)</option>
                      <option value="MIXED">Mixed Spectrum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-medium">Target Eye</label>
                    <select
                      value={amblyopiaEye}
                      onChange={(e) => setAmblyopiaEye(e.target.value as any)}
                      className="w-full text-xxs bg-neutral-50 p-1.5 border border-neutral-250 rounded font-bold"
                    >
                      <option value="LEFT_EYE">OS (Left Eye)</option>
                      <option value="RIGHT_EYE">OD (Right Eye)</option>
                      <option value="BILATERAL">OU (Bilateral)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-block 1: Occlusion Therapy */}
                <div className="p-2.5 bg-neutral-50/55 border border-neutral-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center pb-1 border-b border-neutral-200">
                    <span className="text-xxs font-mono font-bold text-orange-700">1. Occlusion Patching Regimen</span>
                    <span className="text-xxs bg-emerald-50 text-emerald-700 font-extrabold px-1.5 rounded">Patch sound eye</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-neutral-500">Daily Hours</label>
                      <select
                        value={patchingHours}
                        onChange={(e) => {
                          const hrs = parseInt(e.target.value);
                          setPatchingHours(hrs);
                          setOcclusionRegimen(`Patch sound eye ${hrs} hours daily during active near visual tasks (schoolwork, reading).`);
                        }}
                        className="w-full text-xxs bg-white/80 p-1 border rounded"
                      >
                        <option value={2}>2 Hours</option>
                        <option value={4}>4 Hours</option>
                        <option value={6}>6 Hours</option>
                        <option value={12}>Full-time (12 hrs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-neutral-500 font-medium">Compliances</label>
                      <select
                        value={complianceRating}
                        onChange={(e) => setComplianceRating(e.target.value as any)}
                        className="w-full text-xxs bg-white/80 p-1 border rounded font-semibold"
                      >
                        <option value="GOOD">Good Compliance</option>
                        <option value="FAIR">Fair (Intermittent)</option>
                        <option value="POOR">Poor (Refusals)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-neutral-500">Patch Device Style</label>
                    <select
                      value={patchType}
                      onChange={(e) => setPatchType(e.target.value)}
                      className="w-full text-xxs bg-white p-1 border rounded"
                    >
                      <option value="Adhesive Orthoptic Edge-Gard">Adhesive Kids Patch</option>
                      <option value="Fabric Sleeve for Spectacles">Fabric Glasses Sleeve</option>
                      <option value="Glass-mounted Static Cling-Film">Glass Static Foil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-neutral-500">Regimen Statement</label>
                    <textarea
                      value={occlusionRegimen}
                      onChange={(e) => setOcclusionRegimen(e.target.value)}
                      rows={2}
                      className="w-full text-xxs border p-1 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Sub-block 2: Atropine Penalization */}
                <div className="p-2.5 bg-neutral-50/55 border border-neutral-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={penalizationActive}
                        onChange={(e) => setPenalizationActive(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500 scale-90"
                      />
                      <span className="text-xxs font-mono font-bold text-neutral-850">2. Pharmacological Penalization</span>
                    </label>
                  </div>

                  {penalizationActive && (
                    <div className="space-y-2 animate-fadeIn">
                      <p className="text-[10px] text-[#F59E0B] leading-normal font-sans">
                        ℹ️ Penalization blurs the healthy sound eye optically using dilating drops to force the lazy amblyopic eye to work.
                      </p>
                      <div>
                        <label className="block text-[9px] text-neutral-500">Atropine 1% drop instructions</label>
                        <textarea
                          value={atropineBlurInstructions}
                          onChange={(e) => setAtropineBlurInstructions(e.target.value)}
                          rows={2}
                          className="w-full text-xxs border p-1 rounded bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-400">
                Amblyopia/lazy eye treatment is currently not scheduled or marked inactive for this patient. Click active checkbox to configure occlusion pathway.
              </div>
            )}
          </div>


          {/* BLOCK 7: Inter-Clinic Referral Routing Engine (Dispatch to Queues) */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3">
              <Sliders className="w-4 h-4 text-purple-600 animate-pulse" />
              Inter-Clinic Referral Routing Engine
            </h4>

            <div className="space-y-3.5">
              
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Target Specialist Specialty Queue</label>
                <div className="flex flex-col gap-1">
                  {[
                    { id: "None", label: "No Specialist Referral (Local Care)" },
                    { id: "NEURO_OPHTHALMOLOGY", label: "Neurology / Neuro-Ophthalmology" },
                    { id: "ORBIT_OCULOPLASTICS", label: "Orbit & Oculoplastics Clinic (Congenital Ptosis)" },
                    { id: "GENERAL_OPHTHALMOLOGY_OPTICAL", label: "General Ophthalmology & Spectacles Optical Shop" },
                    { id: "MAIN_OR_QUEUE", label: "Surgical Main Operating Theater Queue (ET/XT Correction)" }
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => {
                        setReferralTarget(target.id);
                        if (target.id === "None") {
                          setReferralReason("");
                        } else {
                          // Auto populate reason if empty
                          if (target.id === "NEURO_OPHTHALMOLOGY") {
                            setReferralReason("Acute squint onset/nystagmus. Exclude space occupying lesions & CN6 palsy.");
                          } else if (target.id === "ORBIT_OCULOPLASTICS") {
                            setReferralReason("Severe congenital ptosis OS obscuring primary gaze. Risk of deprivation amblyopia.");
                          } else if (target.id === "GENERAL_OPHTHALMOLOGY_OPTICAL") {
                            setReferralReason("Provide high hypermetropia compound spectacles for refractive accommodative ET.");
                          } else if (target.id === "MAIN_OR_QUEUE") {
                            setReferralReason("Bilateral Medial Rectus Recession (Surgical squint reconstruction) indicated.");
                          }
                        }
                      }}
                      className={`text-left text-xxs p-2 border rounded-xl transition ${
                        referralTarget === target.id
                          ? "bg-purple-100 border-purple-400 text-purple-950 font-bold"
                          : "bg-neutral-50/70 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>

              {referralTarget !== "None" && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-neutral-500">Urgency Mode</label>
                      <select
                        value={referralUrgency}
                        onChange={(e) => setReferralUrgency(e.target.value as any)}
                        className="w-full text-xxs bg-neutral-50 p-1 border rounded"
                      >
                        <option value="ROUTINE">Routine Handoff</option>
                        <option value="URGENT">Urgent (CN Cranial Palsy)</option>
                        <option value="STAT_EMERGENCY">STAT Emergent Queue</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={dispatchReferralNow}
                        className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-700 text-white rounded text-xxs font-bold transition shadow"
                      >
                        ✈️ Send Now
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-neutral-500 font-medium">Referral Reason / Clinical Summary</label>
                    <textarea
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      rows={2}
                      className="w-full text-xxs border p-1 rounded bg-white"
                      placeholder="Input clinical indications..."
                    />
                  </div>
                </div>
              )}

              {referralHistory.length > 0 && (
                <div className="pt-2 border-t border-neutral-150">
                  <span className="block text-[9px] text-neutral-400 font-bold uppercase mb-1">Queue Dispatches Done in active session:</span>
                  <div className="space-y-1">
                    {referralHistory.map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-[var(--clr-brand-blue)]/10 border border-indigo-100 rounded-lg p-1.5 font-mono">
                        <span className="truncate max-w-[150px] font-bold text-indigo-950">{h.target}</span>
                        <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1 rounded">Dispatched {h.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>


          {/* BLOCK 8: Unified E-Prescribing System & Pediatric Dosing Safety Checks */}
          <div className="bg-[var(--clr-bg-card)] p-4 rounded-2xl border border-[var(--clr-border-light)] hover:shadow-[0_0_30px_rgba(79,70,229,0.05)] transition-all duration-300">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-2">
              <Plus className="w-4 h-4 text-[#4F46E5]" />
              Unified E-Prescribing Pharmacy Orders
            </h4>

            {/* Safety Warning Panel */}
            {hasAtropine1InInfant && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl mb-3 flex flex-col gap-2 shadow-inner animate-pulse">
                <div className="flex gap-2 items-start">
                  <ShieldAlert className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
                  <div className="text-xxs leading-normal">
                    <span className="font-extrabold block text-xs">🚨 LEOPARD DOSING SAFETY BREACH!</span>
                    Potent <span className="font-bold underline">Atropine 1.0% Drops</span> are strictly contraindicated in infants under 12 months (Current Patient Age: <strong className="underline">{selectedPatient.age} years/months</strong>) due to catastrophic risk of systemic toxicity (rapid tachycardia, hyperthermia, dry mouth, extreme flush).
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={downgradeAtropine}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold px-2 py-1 transition"
                  >
                    ✓ AUTO DOWNGRADE TO ATROPINE 0.5% / INFANT SAFE
                  </button>
                  <button
                    type="button"
                    onClick={() => setBypassSafetyChecked(!bypassSafetyChecked)}
                    className={`text-[9px] font-mono px-2 py-1 rounded transition border ${
                      bypassSafetyChecked 
                        ? "bg-red-200 border-red-400 text-red-950 font-bold" 
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {bypassSafetyChecked ? "🚨 Bypass Blocked Active" : "Bypass with Chief authorization"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Quick Preset Tiles */}
              <div>
                <span className="block text-[9px] text-neutral-500 font-bold uppercase mb-1">Quick-Add Formularies</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Cyclopentolate 0.5% drops (Infant Formula)", "1 drop", "ONCE", "1 day", "Instill for skia check.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    💧 Cyclopentolate 0.5%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Cyclopentolate 1.0% Ophthalmic Drops", "1 drop", "ONCE", "1 day", "In-clinic use.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    💧 Cyclopentolate 1.0%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Atropine 1.0% Ophthalmic Drops (Strict check)", "1 drop", "ONCE WEEKLY (Sunday)", "30 days", "Amblyopia Penalization routine.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    🚨 Atropine 1.0% Drops
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Atropine 1.0% Ophthalmic Ointment", "Apply thin layer ribbon", "ONCE DAILY (Bedtime)", "10 days", "Occlusion penalization alternate.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    🎗️ Atropine 1.0% Ointment
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Pediatric Lubricating Eye Drops", "1 drop", "QID", "30 days", "Ensure eye comfort post-cycloplegia.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    💧 Pediatric Tear Drops
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPrescription("Olopatadine 0.1% Pediatric Allergy Drops", "1 drop", "BID (Daily)", "14 days", "Child allergy drops.")}
                    className="text-left text-xxs p-1.5 bg-neutral-50 outline-none hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium"
                  >
                    🌸 Olopatadine Allergy
                  </button>
                </div>
              </div>

              {/* Active prescription listings */}
              <div>
                <span className="block text-[9px] text-[#4F46E5] font-bold uppercase tracking-widest mb-1.5">Active Prescription Order Panel</span>
                {pediatricPrescriptions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-neutral-400 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                    No active prescriptions queued. Utilize Quick-Add Tiles above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {pediatricPrescriptions.map((rx) => (
                      <div 
                        key={rx.id} 
                        className={`p-2 rounded-xl border text-xxs flex justify-between items-start transition ${
                          rx.drugName.toLowerCase().includes("atropine 1%") && isInfant
                            ? "bg-red-50/80 border-red-350"
                            : "bg-white border-neutral-200"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-neutral-900 block truncate max-w-[180px]">{rx.drugName}</span>
                          <span className="text-gray-500 block font-mono">
                            Dose: {rx.dose} • Freq: {rx.freq} • Dur: {rx.duration}
                          </span>
                          {rx.instructions && (
                            <span className="text-[10px] text-indigo-700 block italic leading-none font-sans">
                              *Instruction: {rx.instructions}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(rx.id)}
                          className="p-1 hover:text-red-600 rounded bg-neutral-50 hover:bg-red-50 text-neutral-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER ACTION PANEL CONCLUDE AND SUBMIT */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#FBFBF9] dark:bg-neutral-900 border border-[var(--clr-border-light)] rounded-2xl gap-3">
        <div className="flex gap-2 items-center">
          <Info className="w-5 h-5 text-[#4F46E5] shrink-0" />
          <span className="text-xxs text-neutral-550 leading-relaxed max-w-md">
            Click finalizing compiles all alignment parameters, sensory score cards, e-prescribing dispatches, and cross-clinic surgical schedulers. This records a CPT-compliant <strong>ORTHO-ST-9GAZE</strong> encounter mapping.
          </span>
        </div>
        
        <div className="flex gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset current pediatric strabismus assessment drafting?")) {
                setGazeValues({ UL:0, U:0, UR:0, L:0, C:0, R:0, DL:0, D:0, DR:0 });
                setReferralTarget("None");
                setPediatricPrescriptions([]);
                alert("Draft reset successfully.");
              }
            }}
            className="px-4 py-2 text-xxs font-bold text-neutral-400 bg-white border border-neutral-150 rounded-xl hover:bg-neutral-50 transition"
          >
            Reset Form
          </button>
          
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4F46E5] to-indigo-700 hover:from-indigo-700 text-white rounded-xl text-xxs font-bold transition shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] active:scale-95 duration-200"
          >
            ✓ Compile & Finalize Pediatric Consultation
          </button>
        </div>
      </div>

    </div>
  );

  // Helper renderer for each cardinal gaze cell
  function renderGazeButton(gazeKey: string, ariaLabel: string, sublabel: string) {
    const val = gazeValues[gazeKey];
    const isOveraction = val > 0;
    const isUnderaction = val < 0;
    
    let btnColor = "bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50";
    if (isOveraction) {
      btnColor = "bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold";
    } else if (isUnderaction) {
      btnColor = "bg-red-50 border-red-200 text-red-950 font-extrabold";
    }

    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={() => cycleGazeValue(gazeKey, 1)}
          className={`w-full aspect-square border rounded-xl p-1 text-center shrink flex flex-col justify-between items-center transition duration-150 active:scale-95 shadow-sm ${btnColor}`}
        >
          <span className="text-[8px] text-gray-500 font-bold block leading-none truncate max-w-[50px]">{sublabel}</span>
          <span className="text-xs font-mono font-extrabold block">
            {val > 0 ? `+${val}` : val}
          </span>
          <span className="text-[7px] text-neutral-400 block font-mono">{gazeKey}</span>
        </button>
      </div>
    );
  }

  // Preemie Helper
  function isPreemieOrLowWeight(ga: number, wt: number) {
    return ga <= 30 || wt <= 1500;
  }
}
