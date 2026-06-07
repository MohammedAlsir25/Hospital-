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

interface SpecialtyClinicsProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onUpdatePatient: (updated: Patient) => void;
  activeRole: ClinicalRole;
}

export default function SpecialtyClinics({
  patients,
  selectedPatient,
  onUpdatePatient,
  activeRole
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

  // Next-Gen Interactive Diagnostic States
  const [retinaLesions, setRetinaLesions] = useState<{ x: number; y: number; type: string }[]>([]);
  const [selectedLesionType, setSelectedLesionType] = useState<string>("Hemorrhage");
  const [visualFieldMap, setVisualFieldMap] = useState<Record<string, "Normal" | "Scotoma">>({});
  const [lensFitted, setLensFitted] = useState<boolean>(false);

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
      <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-neutral-850 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px] transition duration-300">
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
  const toggleToothState = (toothId: number) => {
    const states = ["Healthy", "Caries", "Extracted", "Restored"];
    const current = clinicState.odontogram[toothId] || "Healthy";
    const nextIndex = (states.indexOf(current) + 1) % states.length;
    const nextState = states[nextIndex];

    const updatedOdontogram = {
      ...clinicState.odontogram,
      [toothId]: nextState
    };

    setClinicState((prev) => ({
      ...prev,
      odontogram: updatedOdontogram
    }));

    // CRITICAL CORRECTION FIX: Direct database billing auto-injection
    let chargeName = "";
    let fee = 0;

    if (nextState === "Extracted") {
      chargeName = `Tooth #${toothId} Surgical Extraction Fee`;
      fee = 175;
    } else if (nextState === "Restored") {
      chargeName = `Tooth #${toothId} Composite Restoration Fee`;
      fee = 120;
    } else if (nextState === "Caries") {
      chargeName = `Tooth #${toothId} Dental Diagnostic Radiograph review`;
      fee = 45;
    }

    let nextLedger = [...selectedPatient.billingLedger];

    // Remove legacy itemized charges for this specific tooth if reverting to Healthy
    nextLedger = nextLedger.filter((item) => !item.serviceName.includes(`Tooth #${toothId}`));

    if (fee > 0) {
      const billingItem: BillingItem = {
        id: `BIL-DENT-${toothId}-${Date.now()}`,
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
          action: "Odontogram State Updated",
          notes: `Tooth #${toothId} changed to ${nextState}. Direct Ledger Sync injected $${fee}. State Updated: ${JSON.stringify(
            updatedOdontogram
          )}`
        }
      ]
    };

    onUpdatePatient(updatedPatient);
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
    alert(`Consultation finalized for ${selectedPatient.name}. Tasks successfully dispatched to Pharmacy & Billing!`);
  };

  return (
    <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-neutral-850 rounded-3xl shadow-xs flex flex-col h-full relative transition duration-300">
      {/* Clinic lock notification when not acting as doctor */}
      {!isDoctor && (
        <div className="absolute inset-0 bg-neutral-900/45 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-6 text-center select-none rounded-3xl">
          <div className="bg-[var(--clr-bg-card)] dark:bg-[#1a1e2e] p-6 rounded-3xl shadow-xl max-w-sm border border-neutral-200 dark:border-neutral-800">
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

        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Main Interactive Specialist Clinic Area */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Scenario Guide banner */}
        <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl text-xs text-teal-800 leading-relaxed">
          <span className="font-bold underline uppercase">Scenario Trigger:</span> {CLINIC_INFO_MAP[selectedPatient.clinic]?.gatekeeperDesc}
        </div>

        {/* Dynamic Clinic-Specific Workspace */}
        {selectedPatient.clinic === "Medicine" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1.5">
              Type 2 Diabetes systemic parameters
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Diabetes Review Notes</label>
                <textarea
                  className="w-full text-xs border border-neutral-200 rounded-lg p-2 h-20 focus:outline-teal-500"
                  placeholder="Review insulin resistance, dietary logs, and overall systemic indices..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Dispensing Pharmaceutical Order</label>
                <input
                  type="text"
                  className="w-full text-xs border border-neutral-200 rounded-lg p-1.5 focus:outline-teal-500 mb-2"
                  placeholder="e.g. Metformin HCL 500mg BID"
                  value={prescriptionInput}
                  onChange={(e) => setPrescriptionInput(e.target.value)}
                />
                <label className="block text-xs font-medium text-neutral-600 mb-1">Required Clinical Lab Panel</label>
                <input
                  type="text"
                  className="w-full text-xs border border-neutral-200 rounded-lg p-1.5 focus:outline-teal-500"
                  placeholder="e.g. Fasting Blood Sugar (FBS) & HbA1c"
                  value={labOrderInput}
                  onChange={(e) => setLabOrderInput(e.target.value)}
                />
              </div>
            </div>

            {showDoseWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Clinical Warn Gatekeeper: Adverse Systolic/Drug Contraindication Warning!</span>
                </div>
                <p className="leading-tight">
                  The computed vitals show a Systolic value of **{selectedPatient.triageVitals?.systolic} mmHg**. Metformin combined with unmonitored cardiovascular anomalies requires manual doctor override confirmation.
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setClinicState((p) => ({ ...p, warningsCleared: true }))}
                    className="px-2.5 py-1 bg-amber-600 text-white font-medium rounded text-tiny"
                  >
                    I have checked drug-drug overrides (Approve)
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={consultationClosed}
                onClick={handleMedicineCloseConsultation}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                {consultationClosed ? "Consultation Closed" : "Finalize Medicine Operations"}
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "ENT" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1.5">
              Ear, Nose & Throat Diagnostics
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Otoscopy / Rhinology assessment</label>
                  <textarea
                    className="w-full text-xs border border-neutral-200 rounded-lg p-2 h-24 focus:outline-teal-500"
                    placeholder="Describe tympanic membrane visual sheen, fluid logs, or nasal blockage indices..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clinicState.hearingLossDiagnosed}
                      onChange={(e) =>
                        setClinicState((p) => ({ ...p, hearingLossDiagnosed: e.target.checked }))
                      }
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Flag Diagnosis: <strong>Hearing Loss</strong></span>
                  </label>
                </div>
              </div>

              <div className="bg-neutral-50/50 p-4 border border-neutral-100 rounded-xl space-y-3">
                <span className="font-semibold text-xs block text-neutral-700">Referral Verification Requirements</span>
                <p className="text-tiny text-neutral-500">
                  If "Hearing Loss" is flagged, clinicians are structurally restricted from completing external medical transfers until Audiometry profiles are joined.
                </p>

                {clinicState.hearingLossDiagnosed && (
                  <div className="border border-dashed border-neutral-250 dark:border-neutral-800 p-2.5 text-center bg-white/60 dark:bg-neutral-900/60 rounded-xl">
                    {clinicState.audiometryFileAttached ? (
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          {clinicState.audiometryFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setClinicState((p) => ({
                              ...p,
                              audiometryFileAttached: false,
                              audiometryFileName: ""
                            }))
                          }
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-neutral-400 text-tiny block mb-2">No audiology file attached.</span>
                        <button
                          type="button"
                          onClick={() =>
                            setClinicState((p) => ({
                              ...p,
                              audiometryFileAttached: true,
                              audiometryFileName: "audiogram_PAT002_left_ear_db.pdf"
                            }))
                          }
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-tiny font-medium text-neutral-700"
                        >
                          Attach Mock Tympanometry File
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={handleEntReferralUnlock}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
              >
                Unlock External Referral Module
              </button>
              <button
                type="button"
                onClick={() => finalizeConsultation("ENT evaluation complete.")}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                Finalize ENT File
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Dental" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                  Anatomical Upper/Lower Odontogram Arch
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click teeth crowns dynamically to toggle health states and auto-inject bills into the accounting ledger.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                <span className="flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Healthy
                </span>
                <span className="flex items-center gap-1 bg-rose-50 text-rose-850 px-2 py-0.5 rounded border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Caries (Cavity)
                </span>
                <span className="flex items-center gap-1 bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span> Extracted (Empty)
                </span>
                <span className="flex items-center gap-1 bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Restored (Amalgam)
                </span>
              </div>
            </div>

            <div className="space-y-4 bg-neutral-50/50 p-4 border border-neutral-150 rounded-2xl">
              {/* Maxillary Row (Upper 1-16) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest pl-1 block">
                  Upper Maxillary Arch (Teeth 1 - 16)
                </span>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((idx) => {
                    const status = clinicState.odontogram[idx] || "Healthy";
                    let isCaries = status === "Caries";
                    let isExtracted = status === "Extracted";
                    let isRestored = status === "Restored";

                    let fillColor = "#FBFBF9";
                    let strokeColor = "#CCCCCC";
                    let accentColor = "text-neutral-500";
                    let btnBg = "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800";

                    if (status === "Healthy") {
                      fillColor = "#F0FDFA";
                      strokeColor = "#14B8A6";
                      accentColor = "text-teal-700 font-bold";
                      btnBg = "bg-teal-50/30 hover:bg-teal-50 border-teal-200";
                    } else if (isCaries) {
                      fillColor = "#FEF2F2";
                      strokeColor = "#EF4444";
                      accentColor = "text-rose-700 font-bold";
                      btnBg = "bg-rose-50 border-rose-300 hover:bg-rose-100/50";
                    } else if (isExtracted) {
                      fillColor = "transparent";
                      strokeColor = "#94A3B8";
                      accentColor = "text-neutral-450 line-through";
                      btnBg = "bg-neutral-150 border-neutral-300 border-dashed hover:bg-neutral-200/45";
                    } else if (isRestored) {
                      fillColor = "#E0F2FE";
                      strokeColor = "#0EA5E9";
                      accentColor = "text-sky-700 font-semibold";
                      btnBg = "bg-sky-50 border-sky-350 hover:bg-sky-100/50";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleToothState(idx)}
                        className={`p-1.5 border rounded-xl flex flex-col items-center justify-between h-20 transition group text-center cursor-pointer shadow-xs ${btnBg}`}
                      >
                        <span className={`text-[11px] font-mono select-none block leading-none ${accentColor}`}>{idx}</span>
                        
                        <svg className="w-7 h-7 my-1.5 transition group-hover:scale-105 duration-150" viewBox="0 0 24 24" fill="none">
                          {isExtracted ? (
                            <path d="M6 3C8 3 9 5 12 5C15 5 16 3 18 3V14H6V3Z" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3,3" />
                          ) : (
                            <path 
                              d="M6 3C7.5 3 8.5 4.5 12 4.5C15.5 4.5 16.5 3 18 3V13C18 17 15.5 20 12 20C8.5 20 6 17 6 13V3Z" 
                              fill={fillColor} 
                              stroke={strokeColor} 
                              strokeWidth="1.5" 
                            />
                          )}
                          {isCaries && <circle cx="12" cy="11" r="2.5" fill="#B91C1C" />}
                          {isRestored && <rect x="9.5" y="8" width="5" height="5" rx="1" fill="#0284C7" stroke="#E0F2FE" strokeWidth="0.5" />}
                        </svg>

                        <span className="text-[7.5px] font-mono tracking-tighter uppercase block truncate w-full text-neutral-450 leading-none">
                          {status.slice(0, 4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mandibular Row (Lower 17-32) */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-200/50">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest pl-1 block">
                  Lower Mandibular Arch (Teeth 17 - 32)
                </span>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                  {Array.from({ length: 16 }, (_, i) => i + 17).map((idx) => {
                    const status = clinicState.odontogram[idx] || "Healthy";
                    let isCaries = status === "Caries";
                    let isExtracted = status === "Extracted";
                    let isRestored = status === "Restored";

                    let fillColor = "#FBFBF9";
                    let strokeColor = "#CCCCCC";
                    let accentColor = "text-neutral-500";
                    let btnBg = "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800";

                    if (status === "Healthy") {
                      fillColor = "#F0FDFA";
                      strokeColor = "#14B8A6";
                      accentColor = "text-teal-700 font-bold";
                      btnBg = "bg-teal-50/30 hover:bg-teal-50 border-teal-200";
                    } else if (isCaries) {
                      fillColor = "#FEF2F2";
                      strokeColor = "#EF4444";
                      accentColor = "text-rose-700 font-bold";
                      btnBg = "bg-rose-50 border-rose-300 hover:bg-rose-100/50";
                    } else if (isExtracted) {
                      fillColor = "transparent";
                      strokeColor = "#94A3B8";
                      accentColor = "text-neutral-450 line-through";
                      btnBg = "bg-neutral-150 border-neutral-300 border-dashed hover:bg-neutral-200/45";
                    } else if (isRestored) {
                      fillColor = "#E0F2FE";
                      strokeColor = "#0EA5E9";
                      accentColor = "text-sky-700 font-semibold";
                      btnBg = "bg-sky-50 border-sky-350 hover:bg-sky-100/50";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleToothState(idx)}
                        className={`p-1.5 border rounded-xl flex flex-col items-center justify-between h-20 transition group text-center cursor-pointer shadow-xs ${btnBg}`}
                      >
                        <span className={`text-[11px] font-mono select-none block leading-none ${accentColor}`}>{idx}</span>
                        
                        <svg className="w-7 h-7 my-1.5 transition group-hover:scale-105 duration-150" viewBox="0 0 24 24" fill="none">
                          {isExtracted ? (
                            <path d="M6 3C8 3 9 5 12 5C15 5 16 3 18 3V14H6V3Z" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3,3" />
                          ) : (
                            <path 
                              d="M6 3C7.5 3 8.5 4.5 12 4.5C15.5 4.5 16.5 3 18 3V13C18 17 15.5 20 12 20C8.5 20 6 17 6 13V3Z" 
                              fill={fillColor} 
                              stroke={strokeColor} 
                              strokeWidth="1.5" 
                            />
                          )}
                          {isCaries && <circle cx="12" cy="11" r="2.5" fill="#B91C1C" />}
                          {isRestored && <rect x="9.5" y="8" width="5" height="5" rx="1" fill="#0284C7" stroke="#E0F2FE" strokeWidth="0.5" />}
                        </svg>

                        <span className="text-[7.5px] font-mono tracking-tighter uppercase block truncate w-full text-neutral-450 leading-none">
                          {status.slice(0, 4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2">
              <span className="font-semibold text-xs block text-neutral-700">Real-Time Ledger Transaction Feed</span>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {selectedPatient.billingLedger
                  .filter((item) => item.serviceName.includes("Tooth #"))
                  .map((item) => (
                    <div key={item.id} className="text-xs font-mono flex justify-between py-1 bg-white/60 dark:bg-neutral-900/60 px-2.5 rounded-lg border border-neutral-250 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                      <span>✓ {item.serviceName}</span>
                      <span className="font-bold text-amber-700">${item.amount}.00</span>
                    </div>
                  ))}
                {selectedPatient.billingLedger.filter((item) => item.serviceName.includes("Tooth #")).length === 0 && (
                  <div className="text-xs text-neutral-400 italic text-center py-2 h-8">
                    No active dental surgeries plotted. Click teeth above to test Spring Boot direct billing injector.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => finalizeConsultation("Odontogram chart locked on server. Dental consult complete.")}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                Lock Odontogram State & Finalize
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Retina" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                  Retinal Mapping & Laser Photocoagulation Care
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  The central EMR locks this terminal until pupil dilation achieves maximum response.
                </p>
              </div>
              <span className="text-xs bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full font-mono font-medium">
                Dilation Protocol Gate Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dilation Clock and Forms */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-neutral-50 p-4 border border-neutral-154 rounded-2xl space-y-3">
                  <span className="font-semibold text-xs text-neutral-700 block">Dilation Counter Widget</span>
                  
                  {clinicState.dilationCompleted ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1 shadow-xs">
                      <div className="font-semibold flex items-center gap-1 text-emerald-700">
                        <CheckCircle className="w-4.5 h-4.5" /> Dilation Period Complete!
                      </div>
                      <p className="text-neutral-500 leading-normal">
                        Pupils successfully dilated & mapped. Next-gen diagnostic fundus inputs are now unlocked.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-cyan-50/50 border border-cyan-150 rounded-xl text-xs text-cyan-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Mydriatic Lock Countdown:</span>
                        <span className="font-mono font-bold text-sm text-cyan-700 dark:text-cyan-400 bg-white/70 dark:bg-neutral-900/80 px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-900/50 shadow-tiny">
                          {Math.floor(clinicState.dilationSecondsRemaining / 60)}m{" "}
                          {clinicState.dilationSecondsRemaining % 60}s
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setClinicState((p) => ({ ...p, dilationTimerActive: !p.dilationTimerActive }))
                          }
                          className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-tiny font-bold font-mono shadow-xs transition"
                        >
                          {clinicState.dilationTimerActive ? "Pause Countdown" : "Start 20m Timer"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setClinicState((p) => ({
                              ...p,
                              dilationSecondsRemaining: 0,
                              dilationCompleted: true
                            }))
                          }
                          className="px-2.5 py-1.5 bg-white/70 dark:bg-[#1e2335] border border-cyan-300 dark:border-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-lg text-tiny font-bold font-mono shadow-xs hover:bg-cyan-50/70 dark:hover:bg-[#1a1e2e]/80 transition cursor-pointer"
                        >
                          ⚡ Fast-Track
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Fundus Image & Camera Index Identifier</label>
                    <input
                      disabled={!clinicState.dilationCompleted}
                      type="text"
                      className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:outline-teal-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="e.g. IMG-FND-L904"
                      defaultValue={clinicState.dilationCompleted ? "IMG-FND-7842" : ""}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Therapeutic injection / Laser Code</label>
                    <input
                      disabled={!clinicState.dilationCompleted}
                      type="text"
                      className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:outline-teal-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="e.g. CPT-67028 Anti-VEGF dosing"
                      defaultValue={clinicState.dilationCompleted ? "CPT-67028 Intravitreal Aflibercept" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Retina Map */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full bg-[var(--clr-bg-card)] dark:bg-[#1a1e2e]/30 border border-neutral-250 dark:border-neutral-850 p-4 rounded-3xl flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-neutral-700">Digital Fundus Lesion Mapper</span>
                    {clinicState.dilationCompleted && (
                      <div className="flex gap-1.5">
                        {(["Hemorrhage", "Cotton Wool", "Drusen", "Macular Hole"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedLesionType(type)}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${
                              selectedLesionType === type
                                ? "bg-cyan-600 text-white border-cyan-600"
                                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border-neutral-200"
                            }`}
                          >
                            {type === "Hemorrhage" ? "🔴 " : type === "Cotton Wool" ? "☁️ " : type === "Drusen" ? "🟡 " : "⭕ "}
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fundus Visual Box */}
                  <div className="relative w-full aspect-square max-w-[280px] rounded-full border-4 border-neutral-800 bg-black overflow-hidden flex items-center justify-center shadow-md">
                    {!clinicState.dilationCompleted ? (
                      <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center p-4 text-center">
                        <svg className="w-8 h-8 text-neutral-500 mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs font-bold text-neutral-400">PUPIL LOCK ACTIVE</span>
                        <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                          Retinal imaging requires dilation. Use countdown timer or fast-track button.
                        </p>
                      </div>
                    ) : (
                      <svg 
                        className="w-full h-full cursor-crosshair bg-amber-950/20" 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                          setRetinaLesions((prev) => [...prev, { x, y, type: selectedLesionType }]);
                          
                          // Add coordinate note to consultation notes text field
                          setConsultationNotes((prev) => 
                            prev + `\n[Retina Map: Plotted ${selectedLesionType} at coordinate X:${x}%, Y:${y}%]`
                          );
                        }}
                        viewBox="0 0 100 100"
                      >
                        {/* Styled dilated retina tissue background */}
                        <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                          <stop offset="75%" stopColor="#be123c" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#4c0519" stopOpacity="1" />
                        </radialGradient>
                        <circle cx="50%" cy="50%" r="48%" fill="url(#fundusGrad)" />

                        {/* Optic Disc */}
                        <ellipse cx="75%" cy="50%" rx="6" ry="8" fill="#fef08a" opacity="0.85" />
                        
                        {/* Macula Center */}
                        <circle cx="35%" cy="50%" r="4" fill="#881337" opacity="0.6" />
                        <circle cx="35%" cy="50%" r="1" fill="#4c0519" />

                        {/* Radiating Blood Vessels */}
                        <path d="M 75 50 Q 60 40 40 38 Q 20 42 10 40" stroke="#991b1b" strokeWidth="0.8" fill="none" opacity="0.8" />
                        <path d="M 75 50 Q 65 60 50 63 Q 30 65 15 70" stroke="#991b1b" strokeWidth="0.8" fill="none" opacity="0.8" />
                        <path d="M 75 50 Q 80 30 85 20" stroke="#991b1b" strokeWidth="0.6" fill="none" opacity="0.7" />
                        <path d="M 75 50 Q 80 70 85 85" stroke="#991b1b" strokeWidth="0.6" fill="none" opacity="0.7" />
                        <path d="M 50 63 Q 48 85 45 92" stroke="#be123c" strokeWidth="0.5" fill="none" opacity="0.6" />

                        {/* Plotted Lesion Markers */}
                        {retinaLesions.map((lesion, idx) => {
                          let markerColor = "#EF4444";
                          if (lesion.type === "Cotton Wool") markerColor = "#FFFFFF";
                          if (lesion.type === "Drusen") markerColor = "#FBBF24";
                          if (lesion.type === "Macular Hole") markerColor = "#67e8f9";

                          return (
                            <g key={idx}>
                              <circle 
                                cx={`${lesion.x}%`} 
                                cy={`${lesion.y}%`} 
                                r="2.5" 
                                fill={markerColor} 
                                stroke="#000" 
                                strokeWidth="0.5"
                                className="animate-pulse" 
                              />
                              <text 
                                x={`${lesion.x + 3}%`} 
                                y={`${lesion.y + 1}%`} 
                                fill="#fff" 
                                fontSize="3" 
                                fontWeight="bold"
                                className="font-mono bg-black"
                              >
                                {lesion.type.slice(0, 4)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>

                  {clinicState.dilationCompleted && (
                    <div className="w-full mt-3">
                      <div className="flex justify-between items-center border-t border-neutral-100 pt-2 text-[10px] text-neutral-400">
                        <span>Click canvas to plot diagnostic findings</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setRetinaLesions([]);
                            setConsultationNotes((prev) => prev.replace(/\[Retina Map: Plotted .*\]/g, ""));
                          }} 
                          className="hover:text-rose-600 font-bold transition flex items-center"
                        >
                          Clear coordinates
                        </button>
                      </div>
                      
                      {retinaLesions.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2 bg-neutral-50 p-2 rounded-lg border border-neutral-150 max-h-16 overflow-y-auto">
                          {retinaLesions.map((lesion, idx) => (
                            <div key={idx} className="text-[9px] font-mono flex items-center gap-1 text-neutral-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-700"></span>
                              <span>{lesion.type} at ({lesion.x}%, {lesion.y}%)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={!clinicState.dilationCompleted}
                onClick={() => finalizeConsultation(`Fundus mappings complete with ${retinaLesions.length} lesions logged.`)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
              >
                Finalize Retina Operations
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Glaucoma" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                  Glaucoma Tonometry & Visual Field Analyser
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Execute Goldmann perimetric sector tracing to detect optic nerve tunnel progression.
                </p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-mono font-medium">
                Surgical Filter Active
              </span>
            </div>

            {clinicState.glaucomaErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-lg text-xs font-medium">
                {clinicState.glaucomaErrorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: IOP dials and prescriptions */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-neutral-50 p-4 border border-neutral-150 rounded-2xl space-y-3">
                  <span className="font-semibold text-xs text-neutral-700 block">Goldmann Applanation IOP Dial</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">OS (Left Eye) mmHg</label>
                      <input
                        type="number"
                        className="w-full text-xs border border-neutral-300 dark:border-neutral-800 rounded-lg p-2 focus:outline-teal-500 font-mono font-bold bg-white/60 dark:bg-neutral-900 dark:text-neutral-100"
                        value={clinicState.iopLeftEye}
                        onChange={(e) => handleIopChange("left", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">OD (Right Eye) mmHg</label>
                      <input
                        type="number"
                        className="w-full text-xs border border-neutral-300 dark:border-neutral-800 rounded-lg p-2 focus:outline-teal-500 font-mono font-bold bg-white/60 dark:bg-neutral-900 dark:text-neutral-100"
                        value={clinicState.iopRightEye}
                        onChange={(e) => handleIopChange("right", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Cup-to-Disc Ratio Charting</label>
                    <input
                      type="text"
                      className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:outline-teal-500"
                      placeholder="e.g. OS: 0.45, OD: 0.65 visual defects"
                      defaultValue="OS: 0.55 asymmetric, OD: 0.62 thinning"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Pressure-Reducing Prescriptions</label>
                    <input
                      type="text"
                      className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:outline-teal-550"
                      placeholder="e.g. Latanoprost 0.005% ophthalmic drops QHS"
                      defaultValue="Latanoprost 0.005% ophthalmic drops, 1 drop OS QHS"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Field Perimeter Plotter */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full bg-[var(--clr-bg-card)] dark:bg-[#1a1e2e]/30 border border-neutral-250 dark:border-neutral-850 p-4 rounded-3xl flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-neutral-700">Goldmann Automated Perimeter</span>
                    <button
                      type="button"
                      onClick={() => setVisualFieldMap({})}
                      className="text-[10px] font-bold text-neutral-450 hover:text-rose-600 transition"
                    >
                      Reset Perimeter Mesh
                    </button>
                  </div>

                  <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-850">
                    <svg className="w-full h-full text-neutral-600" viewBox="0 0 100 100">
                      {/* Concentric Circle Guides: 10, 20, 30 degree eccentricities */}
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" fill="none" opacity="0.4" />
                      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" fill="none" opacity="0.4" />
                      <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" fill="none" opacity="0.4" />
                      
                      {/* Center Fovea */}
                      <circle cx="50" cy="50" r="1.5" fill="#14b8a6" className="animate-pulse" />

                      {/* Quad Axes */}
                      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                      <line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" strokeWidth="0.3" opacity="0.25" />
                      <line x1="22" y1="78" x2="78" y2="22" stroke="currentColor" strokeWidth="0.3" opacity="0.25" />

                      {/* Quadrant Text Labels */}
                      <text x="12" y="47" fill="#6b7280" fontSize="3" className="font-mono">Temporal</text>
                      <text x="78" y="47" fill="#6b7280" fontSize="3" className="font-mono">Nasal</text>
                      <text x="52" y="14" fill="#6b7280" fontSize="3" className="font-mono">Sup</text>
                      <text x="52" y="88" fill="#6b7280" fontSize="3" className="font-mono">Inf</text>

                      {/* Interactive Angle-Degree Plot Sectors */}
                      {[
                        { id: "S10", cx: 50, cy: 34, label: "S 10°" },
                        { id: "S20", cx: 50, cy: 22, label: "S 20°" },
                        { id: "S30", cx: 50, cy: 10, label: "S 30°" },
                        { id: "I10", cx: 50, cy: 66, label: "I 10°" },
                        { id: "I20", cx: 50, cy: 78, label: "I 20°" },
                        { id: "I30", cx: 50, cy: 90, label: "I 30°" },
                        { id: "T10", cx: 34, cy: 50, label: "T 10°" },
                        { id: "T20", cx: 22, cy: 50, label: "T 20°" },
                        { id: "T30", cx: 10, cy: 50, label: "T 30°" },
                        { id: "N10", cx: 66, cy: 50, label: "N 10°" },
                        { id: "N20", cx: 78, cy: 50, label: "N 20°" },
                        { id: "N30", cx: 90, cy: 50, label: "N 30°" },

                        // Diagonal Grid Points
                        { id: "ST15", cx: 39, cy: 39, label: "ST 15°" },
                        { id: "ST25", cx: 30, cy: 30, label: "ST 25°" },
                        { id: "SN15", cx: 61, cy: 39, label: "SN 15°" },
                        { id: "SN25", cx: 70, cy: 30, label: "SN 25°" },
                        { id: "IT15", cx: 39, cy: 61, label: "IT 15°" },
                        { id: "IT25", cx: 30, cy: 70, label: "IT 25°" },
                        { id: "IN15", cx: 61, cy: 61, label: "IN 15°" },
                        { id: "IN25", cx: 70, cy: 70, label: "IN 25°" },
                      ].map((pt) => {
                        const isScotoma = visualFieldMap[pt.id] === "Scotoma";
                        return (
                          <g 
                            key={pt.id} 
                            className="cursor-pointer group"
                            onClick={() => {
                              setVisualFieldMap((prev) => {
                                const next = { ...prev };
                                if (next[pt.id] === "Scotoma") {
                                  delete next[pt.id];
                                } else {
                                  next[pt.id] = "Scotoma";
                                }
                                
                                // Append findings to doctor consult logs notes
                                const scotomaKeys = Object.keys(next);
                                setConsultationNotes((prevNotes) => {
                                  const base = prevNotes.replace(/\[EMR Visual Field:.*\]/g, "");
                                  return base + `\n[EMR Visual Field: Scotomas plotted on ${scotomaKeys.join(", ") || "none"}]`;
                                });

                                return next;
                              });
                            }}
                          >
                            <circle 
                              cx={pt.cx} 
                              cy={pt.cy} 
                              r={isScotoma ? "3.5" : "1.8"} 
                              fill={isScotoma ? "#ef4444" : "#10b981"} 
                              stroke="#000"
                              strokeWidth="0.4"
                              className="transition-all duration-150 group-hover:scale-130"
                            />
                            <title>{pt.label}: Click to toggle Vision anomaly</title>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="w-full mt-3 text-center">
                    <span className="text-[10px] text-neutral-400 font-sans block leading-normal">
                      🟢 Responsive Green = Light Detected (Verified) • 🔴 Clicked Red = Blind Spot (Scotoma)
                    </span>
                    {Object.keys(visualFieldMap).length > 0 && (
                      <div className="mt-2 text-[10px] bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-100 font-mono text-left inline-block">
                        <strong>Identified Scotomas:</strong> {Object.keys(visualFieldMap).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={!!clinicState.glaucomaErrorMsg}
                onClick={() => finalizeConsultation(`Glaucoma tonometric diagnostics compiled. OS IOP: ${clinicState.iopLeftEye}, OD IOP: ${clinicState.iopRightEye}. Scotomas: ${Object.keys(visualFieldMap).join(", ") || "none"}`)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
              >
                Log Tonometry & Conclude
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Orbit" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1.5 justify-between flex">
              <span>Orbit Specialty & Cranial Neuro-Operations</span>
              <span className="text-xs text-rose-600 font-mono uppercase font-semibold">Triage Trauma Handler Active</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-700 block">Exophthalmometry Metrics</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-tiny font-medium text-neutral-500">Left Eye Proptosis (mm)</label>
                    <input type="number" className="w-full text-xs border border-neutral-200 rounded p-1.5 font-mono" defaultValue={18} />
                  </div>
                  <div>
                    <label className="text-tiny font-medium text-neutral-500">Right Eye Proptosis (mm)</label>
                    <input type="number" className="w-full text-xs border border-neutral-200 rounded p-1.5 font-mono" defaultValue={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Extraocular Movement Boundaries</label>
                  <select className="w-full text-xs border border-neutral-200 rounded p-1.5">
                    <option value="5">Full ranges (unpaired normal)</option>
                    <option value="3">Slight cranial limitation on elevation</option>
                    <option value="1">Severe ocular entrapment / Acute Orbital restriction</option>
                  </select>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-xl space-y-2">
                <span className="font-semibold text-xs text-rose-800 block flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Priority Override Queue Logic
                </span>
                <p className="text-tiny text-neutral-500 leading-normal">
                  If the patient triage record flags **Acute Orbital Trauma** or **Globe Exposure**, the central HIS engine executes an immediate database sorting bypass. The file skips all Standard FIFO queues and moves to position 1 as a flashing STAT alert.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated: Patient = {
                        ...selectedPatient,
                        triageVitals: {
                          ...(selectedPatient.triageVitals || {
                            systolic: 120,
                            diastolic: 80,
                            heartRate: 80,
                            temperatureCelcius: 37,
                            weightKg: 70,
                            vitalsVerified: true,
                            urgency: "Normal"
                          }),
                          urgency: "STAT_EMERGENCY"
                        },
                        clinicalLogs: [
                          ...selectedPatient.clinicalLogs,
                          {
                            timestamp: new Date().toLocaleTimeString().slice(0, 5),
                            actorRole: "Triage Nurse",
                            action: "STAT Trigger Processed",
                            notes: "Flagged patient with Globe Exposure. Triggering automatic database sorting override!"
                          }
                        ]
                      };
                      onUpdatePatient(updated);
                      alert("⚠️ STATE APPLIED: Patient flagged as STAT Emergency. Watch them relocate immediately to the flashing top of the active queue on the left sidebar!");
                    }}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-tiny font-bold rounded"
                  >
                    TRIGGER ACUTE ORBITAL TRAUMA (STAT)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => finalizeConsultation("Exophthalmometry computed. CT High-Res scan dispatched to Radiology.")}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                Dispatch Radiology Orders & Close Consult
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "Pediatrics Ophthalmology" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1.5 flex justify-between">
              <span>Strabismus & Eye-Patching Therapy</span>
              <span className="text-xs text-purple-600 font-mono">Child-Friendly LEA Charts</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Visual Target Charts Model</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setClinicState((p) => ({ ...p, visualChartType: "LEA Symbols" }))}
                    className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                      clinicState.visualChartType === "LEA Symbols"
                        ? "bg-purple-100 border-purple-400 text-purple-900 font-bold dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300"
                        : "bg-[var(--clr-bg-card)] dark:bg-[#151824] border-neutral-250 dark:border-neutral-800 text-neutral-600 dark:text-neutral-405"
                    }`}
                  >
                    LEA Symbols (Shapes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setClinicState((p) => ({ ...p, visualChartType: "Allen Cards" }))}
                    className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                      clinicState.visualChartType === "Allen Cards"
                        ? "bg-purple-100 border-purple-400 text-purple-900 font-bold dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300"
                        : "bg-[var(--clr-bg-card)] dark:bg-[#151824] border-neutral-250 dark:border-neutral-800 text-neutral-600 dark:text-neutral-405"
                    }`}
                  >
                    Allen Cards (Images)
                  </button>
                </div>

                <label className="block text-xs font-medium text-neutral-600 mb-1">Strabismus Esotropia Deviation Angle</label>
                <input
                  type="text"
                  className="w-full text-xs border border-neutral-200 rounded p-1.5 focus:outline-teal-500"
                  placeholder="e.g. 15 Diopters Esotropia left ocular focus"
                />
              </div>

              <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-xl space-y-2">
                <span className="font-semibold text-xs text-neutral-700 block">Patching Regimen Log</span>
                <label className="flex items-center gap-2 text-xs text-neutral-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicState.isPatchingAdvised}
                    onChange={(e) => setClinicState((p) => ({ ...p, isPatchingAdvised: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Advise 2-Hour Daily patching sequence (Occlusion Therapy)</span>
                </label>
                <div className="text-tiny text-neutral-500 leading-normal pt-1.5 border-t border-neutral-200/50 mt-1">
                  <strong>Demographic Rule:</strong> Patient is computed to be **{selectedPatient.age} years old**. System validates age strictly; if age &gt; 14 during Kiosk Check-In, registration routing blocks pediatric screening access automatically.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => finalizeConsultation(`Pediatric patching regimen assigned on ${clinicState.visualChartType}.`)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                Authorize Pediatric Screening Form
              </button>
            </div>
          </div>
        )}

        {selectedPatient.clinic === "General Ophthalmology" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b border-neutral-100 pb-1.5 flex justify-between">
              <span>Visual Acuity Refraction Engine</span>
              <span className="text-xs text-teal-600 font-mono">Isolated Optical Database Model</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                <span className="font-semibold text-xs text-neutral-700 block">Virtual Phoropter Inputs</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-500 block">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      className="w-full text-xs border border-neutral-300 dark:border-neutral-850 rounded p-1 font-mono text-center bg-white/60 dark:bg-neutral-900 dark:text-neutral-100"
                      value={clinicState.refractionSphere}
                      onChange={(e) => setClinicState((p) => ({ ...p, refractionSphere: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      className="w-full text-xs border border-neutral-300 dark:border-neutral-850 rounded p-1 font-mono text-center bg-white/60 dark:bg-neutral-900 dark:text-neutral-100"
                      value={clinicState.refractionCylinder}
                      onChange={(e) => setClinicState((p) => ({ ...p, refractionCylinder: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block">Axis (°)</label>
                    <input
                      type="number"
                      className="w-full text-xs border border-neutral-300 dark:border-neutral-850 rounded p-1 font-mono text-center bg-white/60 dark:bg-neutral-900 dark:text-neutral-100"
                      value={clinicState.refractionAxis}
                      onChange={(e) => setClinicState((p) => ({ ...p, refractionAxis: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="text-tiny text-neutral-500 dark:text-neutral-400 leading-normal pt-1 bg-white/60 dark:bg-[#1a1e2e]/50 p-2 border border-neutral-250 dark:border-neutral-800 rounded font-mono">
                  Current RX Blueprint Formula: <br />
                  <span className="text-teal-700 font-bold">
                    SPH: {clinicState.refractionSphere} DS • CYL: {clinicState.refractionCylinder} DC • AXIS: {clinicState.refractionAxis}°
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-semibold text-xs text-neutral-700 block">Optical isolation details</span>
                <p className="text-tiny text-neutral-500 leading-relaxed">
                  <strong>The ISO Security Fix:</strong> Optical prescription formulas are saved strictly inside optical refraction records. The Pharmacy module is isolated from these structures, preventing optometry data from mistakenly processing as an active medication dispatch order inside chemical inventory rows.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Slit-Lamp Eye Health Assessment</label>
                  <textarea
                    className="w-full text-xs border border-neutral-200 rounded-lg p-2 h-14 focus:outline-teal-500"
                    placeholder="Describe cornea clear, anterior chambers deep and quiet, lens status..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  // Direct database check log
                  addClinicalLog("Optical Diagnosis Logged", `Sphere: ${clinicState.refractionSphere}, Cylinder: ${clinicState.refractionCylinder}, Axis: ${clinicState.refractionAxis}. Refraction is isolated from chemicals in central tables.`);
                  finalizeConsultation(`Eyeglasses refraction specs successfully populated: ${clinicState.refractionSphere} / ${clinicState.refractionCylinder} x ${clinicState.refractionAxis}.`);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
              >
                Log Refraction Formula
              </button>
            </div>
          </div>
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
    </div>
  );
}
