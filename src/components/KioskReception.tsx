/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  UserPlus,
  ChevronRight,
  Search,
  UserCheck,
  CheckCircle,
  Activity,
  Ear,
  Grid,
  Eye,
  Gauge,
  HeartPulse,
  Baby,
  Compass,
  ArrowRight,
  RefreshCw,
  Plus,
  Hospital
} from "lucide-react";
import { Patient, ClinicType, PatientStatus } from "../types";
import { CLINIC_INFO_MAP } from "../data";
import { useClinicalPriority } from "../hooks/useClinicalPriority";

interface KioskReceptionProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onSelectPatient: (patient: Patient) => void;
  language?: "en" | "ar";
}

export default function KioskReception({ patients, onAddPatient, onSelectPatient, language = "en" }: KioskReceptionProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New Patient Form state
  const [isNewForm, setIsNewForm] = useState(false);
  const [formSubTab, setFormSubTab] = useState<"admin" | "insurance" | "clinical">("admin");
  
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("1995-09-25");
  const [newGender, setNewGender] = useState<"Male" | "Female" | "Other">("Male");
  
  // Administrative Extensions
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("United Arab Emirates");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Insurance / Payer matrix
  const [payerType, setPayerType] = useState<"Self-Pay" | "Private Insurance" | "Government/Corporate Sponsor">("Private Insurance");
  const [providerId, setProviderId] = useState("AXA");
  const [policyNumber, setPolicyNumber] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("2028-12-31");
  const [isPreAuthChecking, setIsPreAuthChecking] = useState(false);
  const [preAuthStatus, setPreAuthStatus] = useState<"idle" | "success" | "none">("idle");

  // Clinical matrix Red Flags
  const [chiefComplaint, setChiefComplaint] = useState("Routine Eye Exam / Glasses Check");
  const [hasDiabetes, setHasDiabetes] = useState(true);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasCKD, setHasCKD] = useState(false);
  
  // Specific Allergies
  const [penicillinAllergy, setPenicillinAllergy] = useState(false);
  const [sulfaAllergy, setSulfaAllergy] = useState(false);
  const [proparacaineAllergy, setProparacaineAllergy] = useState(false);
  const [tropicamideAllergy, setTropicamideAllergy] = useState(false);

  // History & Surgery states
  const [hasGlaucomaHistory, setHasGlaucomaHistory] = useState(false);
  const [lasikSurgery, setLasikSurgery] = useState(false);
  const [cataractSurgery, setCataractSurgery] = useState(false);
  const [retinalSurgery, setRetinalSurgery] = useState(false);
  const [traumaSurgery, setTraumaSurgery] = useState(false);

  // Selected Clinic state
  const { rules: priorityRules } = useClinicalPriority();
  const [checkedRules, setCheckedRules] = useState<string[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicType | null>(null);

  // Simulated live event feed logs
  const [logs, setLogs] = useState<string[]>([]);

  // Search filter - sliced to 50 to support sub-10ms rendering at 100K patient scale
  const foundPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setLogs((prev) => [...prev, `[Identity Verified] Patient ${patient.name} approved.`]);
  };

  const handlePreAuthCheck = () => {
    if (!policyNumber && payerType !== "Self-Pay") {
      setLogs((prev) => [...prev, `⚠️ [Clearinghouse Error] Cannot request Pre-Authorization without an active Policy Number!`]);
      return;
    }
    setIsPreAuthChecking(true);
    setPreAuthStatus("none");
    setLogs((prev) => [...prev, `📡 [E-Claims Clearinghouse] Initiating Electronic Pre-Authorization check for patient with ${providerId || "selected payer"}...`]);
    
    setTimeout(() => {
      setIsPreAuthChecking(false);
      setPreAuthStatus("success");
      setLogs((prev) => [
        ...prev,
        `✅ [Clearinghouse Approval Received] Policy verified. Status: APPROVED. Covered Network: Premium Tier-1. Eligibility Copay: 10%. Ref Code: AUTH-${Math.floor(100000 + Math.random() * 900000)}`
      ]);
    }, 1100);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Compute age from DOB
    const birthYear = new Date(newDob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - birthYear);

    // Allergies compile
    const knownAllergies: string[] = [];
    if (penicillinAllergy) knownAllergies.push("PENICILLIN");
    if (sulfaAllergy) knownAllergies.push("SULFA");

    const ophthalmicDropAllergies: string[] = [];
    if (proparacaineAllergy) ophthalmicDropAllergies.push("PROPARACAINE");
    if (tropicamideAllergy) ophthalmicDropAllergies.push("TROPICAMIDE");

    // History compile
    const previousEyeSurgeries: string[] = [];
    if (lasikSurgery) previousEyeSurgeries.push("LASIK/Vision Correction");
    if (cataractSurgery) previousEyeSurgeries.push("Cataract Surgery");
    if (retinalSurgery) previousEyeSurgeries.push("Retinal Detachment Repair");
    if (traumaSurgery) previousEyeSurgeries.push("Trauma Repair");

    // Determine targeted clinical destination and urgency based on Red Flags!
    let determinedClinic: ClinicType = "General Ophthalmology";
    let calculatedUrgency: "Normal" | "STAT_EMERGENCY" = "Normal";

    // Evaluate checked custom priority rules
    const triggersStatCustom = checkedRules.some(id => {
      const match = priorityRules.find(r => r.id === id);
      return match?.isActive && match?.triggersStat;
    });

    if (chiefComplaint === "Sudden, Painful Vision Loss" || triggersStatCustom) {
      determinedClinic = "Retina"; // central macular/retina vascular emergencies
      calculatedUrgency = "STAT_EMERGENCY";
    } else if (chiefComplaint === "Foreign Body / Chemical Splash") {
      determinedClinic = "Orbit"; // orbital trauma & globe threat clinical department
      calculatedUrgency = "STAT_EMERGENCY";
    } else if (hasGlaucomaHistory) {
      determinedClinic = "Glaucoma";
    } else if (hasDiabetes) {
      determinedClinic = "Medicine";
    } else if (age <= 14) {
      determinedClinic = "Pediatrics Ophthalmology";
    }

    const created: Patient = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      dob: newDob,
      age,
      gender: newGender,
      status: "Registered",
      clinic: determinedClinic,
      clinicalLogs: [
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Client Desk Reception",
          action: "Comprehensive Intake & Triage Registered",
          notes: `Administrative identity generated with Chief Complaint: "${chiefComplaint}". ${
            calculatedUrgency === "STAT_EMERGENCY" 
              ? `🔴 STAT EMERGENCY TRIGGERS INITIATED! Active criteria: ${
                  checkedRules.length > 0 
                    ? checkedRules.map(id => priorityRules.find(r => r.id === id)?.nameEn).filter(Boolean).join(", ") 
                    : chiefComplaint
                }` 
              : ""
          }`,
        },
      ],
      billingLedger: [
        {
          id: `BIL-${Math.floor(100 + Math.random() * 900)}`,
          serviceName: "Clinical Registration & Intake Fee",
          category: "Consultation",
          amount: 25,
          status: payerType === "Self-Pay" ? "Unpaid" : "InsurancePending",
        },
      ],
      // Store complete structured metadata mapping the user's production data schema!
      administrativeProfile: {
        nationalId: nationalId || "784-1990-1234567-1",
        passportNumber: passportNumber || "N99882211",
        fullName: newName,
        dateOfBirth: newDob,
        gender: newGender === "Male" ? "MALE" : newGender === "Female" ? "FEMALE" : "OTHER",
        mobileNumber: mobileNumber || "+971501234567",
        nationality: nationality || "Sudanese",
        emergencyName: emergencyName || "N/A",
        emergencyRelationship: emergencyRelationship || "N/A",
        emergencyPhone: emergencyPhone || "N/A",
      },
      insuranceCoverage: {
        payerType,
        providerId: payerType === "Self-Pay" ? "None" : providerId,
        policyNumber: policyNumber || `MOCK-INS-${Math.floor(10000 + Math.random() * 90000)}`,
        cardExpiryDate,
        preAuthApproved: payerType !== "Self-Pay" ? true : undefined,
        preAuthResponse: payerType !== "Self-Pay" ? "Automated Clearinghouse: APPROVED (Copay 10% verified)." : undefined,
      },
      clinicalTriageFlags: {
        chiefComplaint,
        hasDiabetes,
        hasHypertension,
        hasCKD,
        knownAllergies,
        ophthalmicDropAllergies,
        hasGlaucomaHistory,
        previousEyeSurgeries,
      }
    };

    // Auto-populate basic triageVitals structure to carry the live RED FLAGS
    created.triageVitals = {
      systolic: hasHypertension ? 152 : 120,
      diastolic: hasHypertension ? 94 : 80,
      heartRate: calculatedUrgency === "STAT_EMERGENCY" ? 104 : 76,
      temperatureCelcius: 36.9,
      weightKg: 78,
      urgency: calculatedUrgency,
      vitalsVerified: false,
    };

    onAddPatient(created);
    setSelectedPatient(created);
    setSelectedClinic(determinedClinic);
    setIsNewForm(false);
    
    setLogs((prev) => [
      ...prev,
      `[Intake Completed] Created ID: ${created.id} - ${created.name}`,
      `🔔 [Clinical Triage Tripped] Auto-routing assigned patient to ${determinedClinic} based on triage flags. Urgency: ${calculatedUrgency.toUpperCase()}.`
    ]);

    // Advance to clinic destination selection step is done or skip directly to clinic preview
    setStep(2);
  };

  const handleSelectClinic = (clinic: ClinicType) => {
    setSelectedClinic(clinic);
    setLogs((prev) => [...prev, `[clinic Selected] Scheduled destination routing: ${clinic}`]);
  };

  const handleFinalSubmit = () => {
    if (!selectedPatient || !selectedClinic) return;

    // Deep check for Age Limit on Pediatrics gate!
    let finalClinic = selectedClinic;
    let redirected = false;

    if (selectedClinic === "Pediatrics Ophthalmology" && selectedPatient.age > 14) {
      finalClinic = "General Ophthalmology";
      redirected = true;
      setLogs((prev) => [
        ...prev,
        `⚠️ [Front End Clinical Gate Trigger] Patient's age (${selectedPatient.age} y/o) is over 14. Pediatric module blocked. Automatic Rerouting initiated to General Ophthalmology!`,
      ]);
    }

    const updatedPatient: Patient = {
      ...selectedPatient,
      clinic: finalClinic,
      status: "Registered",
      pediatricRedirected: redirected,
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Self-Service Kiosk",
          action: "Check-In Completed",
          notes: `Kiosk terminal assigned patient to clinical queue [${finalClinic} Queue]${
            redirected ? " - Rerouted from Pediatrics because age > 14" : ""
          }`,
        },
      ],
    };

    onAddPatient(updatedPatient);
    onSelectPatient(updatedPatient);
    setLogs((prev) => [
      ...prev,
      `📡 [WebSocket Dispatch] Sending secure patient payload for ${updatedPatient.name} to central queue...`,
      `✅ [Central Matrix Sync] ${updatedPatient.name} assigned index #${patients.length + 1} at ${finalClinic} clinic.`,
    ]);

    setStep(3);
  };

  const handleResetKiosk = () => {
    setSelectedPatient(null);
    setSelectedClinic(null);
    setNewName("");
    setCheckedRules([]);
    setIsNewForm(false);
    setSearchQuery("");
    setStep(1);
  };

  // Helper function to render Lucide clinical icons
  const getClinicIcon = (iconName: string) => {
    switch (iconName) {
      case "Activity":
        return <Activity className="w-6 h-6 text-emerald-600" />;
      case "Ear":
        return <Ear className="w-6 h-6 text-sky-600" />;
      case "Grid":
        return <Grid className="w-6 h-6 text-amber-600" />;
      case "Eye":
        return <Eye className="w-6 h-6 text-cyan-600" />;
      case "Gauge":
        return <Gauge className="w-6 h-6 text-indigo-600" />;
      case "HeartPulse":
        return <HeartPulse className="w-6 h-6 text-rose-600" />;
      case "Baby":
        return <Baby className="w-6 h-6 text-purple-600" />;
      case "Compass":
        return <Compass className="w-6 h-6 text-teal-600" />;
      default:
        return <Activity className="w-6 h-6 text-neutral-600" />;
    }
  };

  return (
    <div className="bg-[var(--clr-bg-card)] dark:bg-[#151824] border border-neutral-154 dark:border-[#1e2335] rounded-3xl overflow-hidden h-full flex flex-col transition duration-300">
      {/* Top Header progress block */}
      <div className="px-6 py-5 bg-[var(--clr-bg-main)]/60 dark:bg-neutral-900/60 border-b border-[var(--clr-border-light)] dark:border-[#1e2335] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-sans font-black text-neutral-800 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            Self-Check-In Kiosk & Tablet Desk
          </h3>
          <p className="text-xs font-mono text-neutral-400 mt-1">Scenario 1: Kiosk Self Identity Protocol</p>
        </div>
        <div className="flex gap-2 items-center text-xs">
          <div
            className={`px-3 py-1 rounded-lg font-black font-mono uppercase tracking-wider ${
              step === 1 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400"
            }`}
          >
            1. Identity
          </div>
          <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
          <div
            className={`px-3 py-1 rounded-lg font-black font-mono uppercase tracking-wider ${
              step === 2 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400"
            }`}
          >
            2. Clinic
          </div>
          <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
          <div
            className={`px-3 py-1 rounded-lg font-black font-mono uppercase tracking-wider ${
              step === 3 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400"
            }`}
          >
            3. Queue Live
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main interactive panel */}
        <div className="lg:col-span-8 flex flex-col">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-lg font-medium text-neutral-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-500" /> Verify Identity or Create Account
              </h4>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsNewForm(false)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm border transition ${
                    !isNewForm
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-[var(--clr-bg-card)] border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  Search Existing Patient
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewForm(true)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm border transition ${
                    isNewForm
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-[var(--clr-bg-card)] border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  Create New Record (First Visit)
                </button>
              </div>

              {!isNewForm ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Start typing your name to look up..."
                      className="w-full pl-10 pr-4 py-2.5 border border-[var(--clr-border-light)] rounded-xl text-sm bg-white/60 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition dark:text-neutral-100"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="border border-neutral-100 rounded-lg divide-y divide-neutral-100 max-h-56 overflow-y-auto bg-neutral-50/20">
                    {foundPatients.length > 0 ? (
                      foundPatients.map((p) => (
                        <div
                          key={p.id}
                          className={`p-3 text-sm flex justify-between items-center cursor-pointer transition ${
                            selectedPatient?.id === p.id
                              ? "bg-teal-50/80 hover:bg-teal-100/50"
                              : "hover:bg-neutral-50"
                          }`}
                          onClick={() => handleSelectPatient(p)}
                        >
                          <div>
                            <div className="font-medium text-neutral-800 flex items-center gap-2">
                              {p.name}
                              <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {p.id}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              DOB: {p.dob} • Over {p.age} years old • <span className="capitalize">{p.gender}</span>
                            </div>
                          </div>
                          {selectedPatient?.id === p.id ? (
                            <span className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-full font-medium">
                              Active Target
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              Select Profile
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-neutral-400">
                        No matches. Click "Create New Record" to form identity.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!selectedPatient}
                      onClick={() => setStep(2)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 shadow-sm ${
                        selectedPatient
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      Continue to Clinic Grid <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreatePatient} className="space-y-4">
                  {/* Inner Form Navigation */}
                  <div className="flex border-b border-neutral-154 dark:border-neutral-800 pb-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setFormSubTab("admin")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formSubTab === "admin"
                          ? "bg-teal-50 dark:bg-teal-950/30 text-teal-750 dark:text-teal-400 border-b-2 border-teal-600"
                          : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                      }`}
                    >
                      <span>1. Admin Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSubTab("insurance")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formSubTab === "insurance"
                          ? "bg-teal-50 dark:bg-teal-950/30 text-teal-750 dark:text-teal-400 border-b-2 border-teal-600"
                          : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                      }`}
                    >
                      <span>2. Payer & Insurance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSubTab("clinical")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formSubTab === "clinical"
                          ? "bg-teal-50 dark:bg-teal-950/30 text-teal-750 dark:text-teal-400 border-b-2 border-teal-600"
                          : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                      }`}
                    >
                      <span>3. Clinical Flags</span>
                      {(hasDiabetes || hasHypertension || hasCKD) && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </button>
                  </div>

                  {/* TAB 1: ADMINISTRATIVE & IDENTITY */}
                  {formSubTab === "admin" && (
                    <div className="space-y-3 animation-fade-in">
                      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250/20 p-2.5 rounded-xl text-[11px] text-amber-800 dark:text-amber-400 flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>Ensure full legal name matches the official passport or government ID precisely to prevent subsequent insurance claim clearinghouse rejections.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Full Legal Name *</label>
                          <input
                            required={formSubTab === "admin"}
                            type="text"
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200"
                            placeholder="e.g. Mohammed Hamad"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">National Identification ID *</label>
                          <input
                            required={formSubTab === "admin"}
                            type="text"
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                            placeholder="784-1990-1234567-1"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Date of Birth *</label>
                          <input
                            required={formSubTab === "admin"}
                            type="date"
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                            value={newDob}
                            onChange={(e) => setNewDob(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Gender at Birth *</label>
                          <select
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200"
                            value={newGender}
                            onChange={(e) => setNewGender(e.target.value as any)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Passport & Nationality *</label>
                          <div className="flex gap-1">
                            <input
                              required={formSubTab === "admin"}
                              type="text"
                              className="w-1/2 px-2 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                              placeholder="Passport"
                              value={passportNumber}
                              onChange={(e) => setPassportNumber(e.target.value)}
                            />
                            <input
                              required={formSubTab === "admin"}
                              type="text"
                              className="w-1/2 px-2 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200"
                              placeholder="Sudanese"
                              value={nationality}
                              onChange={(e) => setNationality(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Mobile Phone Number *</label>
                          <input
                            required={formSubTab === "admin"}
                            type="text"
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                            placeholder="+971 50 123 4567"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Verified Email Address *</label>
                          <input
                            required={formSubTab === "admin"}
                            type="email"
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                            placeholder="m.hamad@gmail.com"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="border border-neutral-100 dark:border-neutral-800 p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">📞 Emergency Contact Profile (Guardian/Next-Of-Kin)</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 dark:text-neutral-200"
                            value={emergencyName}
                            onChange={(e) => setEmergencyName(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Relationship (e.g. Spouse)"
                            className="w-full px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 dark:text-neutral-200"
                            value={emergencyRelationship}
                            onChange={(e) => setEmergencyRelationship(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Phone Number"
                            className="w-full px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 dark:text-neutral-200 font-mono"
                            value={emergencyPhone}
                            onChange={(e) => setEmergencyPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setFormSubTab("insurance")}
                          className="px-4 py-2 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all"
                        >
                          Next: Insurance Matrix <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INSURANCE & PAYER MATRIX */}
                  {formSubTab === "insurance" && (
                    <div className="space-y-3 animation-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Payer Type Selection</label>
                          <select
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200"
                            value={payerType}
                            onChange={(e) => setPayerType(e.target.value as any)}
                          >
                            <option value="Self-Pay">Self-Pay (Cash / Credit Card)</option>
                            <option value="Private Insurance">Private Insurance</option>
                            <option value="Government/Corporate Sponsor">Government/Corporate Sponsor</option>
                          </select>
                        </div>

                        {payerType !== "Self-Pay" && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Insurance Provider</label>
                              <select
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200"
                                value={providerId}
                                onChange={(e) => setProviderId(e.target.value)}
                              >
                                <option value="Daman">Daman National Health</option>
                                <option value="AXA">AXA / GIG Gulf</option>
                                <option value="Bupa">Bupa Global Premium</option>
                                <option value="Cigna">Cigna Middle East</option>
                                <option value="ADNIC">ADNIC Platinum</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Card Expiry Date</label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                                value={cardExpiryDate}
                                onChange={(e) => setCardExpiryDate(e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {payerType !== "Self-Pay" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">Policy / Card Number *</label>
                            <input
                              required={payerType !== "Self-Pay" && formSubTab === "insurance"}
                              type="text"
                              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-mono"
                              placeholder="DMN-2026-XYZ-8822"
                              value={policyNumber}
                              onChange={(e) => setPolicyNumber(e.target.value)}
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={handlePreAuthCheck}
                              disabled={isPreAuthChecking}
                              className="w-full py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isPreAuthChecking ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Ping Clearinghouse...
                                </>
                              ) : (
                                <>
                                  <span>Verify Policy Pre-Authorization</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pre auth result simulator */}
                      {payerType !== "Self-Pay" && preAuthStatus === "success" && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 rounded-xl text-xs text-emerald-850 dark:text-emerald-400 space-y-1 animation-fade-in">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Insurance Pre-Authorization: SECURED</span>
                          </div>
                          <p className="text-[11px] opacity-90 leading-relaxed font-mono">
                            E-Claims response: Provider Daman/AXA has APPROVED pre-approval for today's OPD consultation bundle. Copay: 10% patient liability. Auth code logged.
                          </p>
                        </div>
                      )}

                      {payerType === "Self-Pay" && (
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-154 dark:border-neutral-800 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                          <p className="font-bold">Self-Pay Program Active</p>
                          <p className="text-[11px]" >No e-claims file will be pushed to central insurance hubs. The patient will be billed directly via cash or card terminal upon closing clinical consultations.</p>
                        </div>
                      )}

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setFormSubTab("admin")}
                          className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-medium"
                        >
                          ← Back to Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormSubTab("clinical")}
                          className="px-4 py-2 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all"
                        >
                          Next: Clinical Flags <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CLINICAL REQUIREMENTS & RED FLAGS */}
                  {formSubTab === "clinical" && (
                    <div className="space-y-4 animation-fade-in">
                      {/* Chief Complaint Dropdown */}
                      <div>
                        <label className="block text-[10.5px] font-black uppercase text-neutral-500 mb-1">🚨 Chief Complaint (Reason for Visit Today) *</label>
                        <select
                          className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 focus:outline-teal-500 dark:text-neutral-200 font-bold text-neutral-800"
                          value={chiefComplaint}
                          onChange={(e) => setChiefComplaint(e.target.value)}
                        >
                          <option value="Routine Eye Exam / Glasses Check">Routine Eye Exam / Glasses Check</option>
                          <option value="Gradual Blurry Vision">Gradual Blurry Vision</option>
                          <option value="Sudden, Painful Vision Loss">Sudden, Painful Vision Loss (🔴 Triggers Immediate STAT Emergency routing to Retina)</option>
                          <option value="Foreign Body / Chemical Splash">Foreign Body / Chemical Splash (🔴 Triggers Immediate STAT Emergency routing to Orbit Trauma)</option>
                          <option value="Post-Operative Follow-Up">Post-Operative Follow-Up</option>
                        </select>
                      </div>

                      {/* Red Flags Checkboxes */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                          Clinical "Red Flag Checkbox Matrix" (Intake Checklist)
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-rose-50/20 dark:bg-rose-950/5 p-3 border border-rose-250/10 rounded-xl">
                          <label className="flex items-start gap-2.5 p-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-rose-400 text-rose-600 accent-rose-600 w-4 h-4"
                              checked={hasDiabetes}
                              onChange={(e) => setHasDiabetes(e.target.checked)}
                            />
                            <div>
                              <span className="block text-xs font-bold text-neutral-850 dark:text-neutral-200">Diabetes Mellitus (Type 1 or 2)</span>
                              <span className="block text-[10px] text-neutral-450">Triggers dilated fundus order & retinal check.</span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 p-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-rose-400 text-rose-600 accent-rose-600 w-4 h-4"
                              checked={hasHypertension}
                              onChange={(e) => setHasHypertension(e.target.checked)}
                            />
                            <div>
                              <span className="block text-xs font-bold text-neutral-850 dark:text-neutral-200">Hypertension (High BP)</span>
                              <span className="block text-[10px] text-neutral-450">Heightened retinal stroke & bleeding risk.</span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 p-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-rose-400 text-rose-600 accent-rose-600 w-4 h-4"
                              checked={hasCKD}
                              onChange={(e) => setHasCKD(e.target.checked)}
                            />
                            <div>
                              <span className="block text-xs font-bold text-neutral-850 dark:text-neutral-200">Renal Failure / CKD</span>
                              <span className="block text-[10px] text-neutral-450">Affects medication clearance & contrast angiograms.</span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 p-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-rose-400 text-rose-600 accent-rose-600 w-4 h-4"
                              checked={hasGlaucomaHistory}
                              onChange={(e) => setHasGlaucomaHistory(e.target.checked)}
                            />
                            <div>
                              <span className="block text-xs font-bold text-neutral-850 dark:text-neutral-200">Glaucoma History (Personal/Family)</span>
                              <span className="block text-[10px] text-neutral-450">Forces priority Goldman Applanation IOP screening.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Active Admin Priority Rules */}
                      {priorityRules.some(r => r.isActive) && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                            🛡️ {language === "ar" ? "أولويات وشروط المسؤول النشطة" : "Active Admin Priority Entry Criteria"}
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-indigo-500/5 dark:bg-neutral-950/20 p-3 border border-indigo-200/20 rounded-xl">
                            {priorityRules.filter(r => r.isActive).map(rule => (
                              <label 
                                key={rule.id}
                                className="flex items-start gap-2.5 p-1.5 cursor-pointer hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 rounded-lg select-none"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-1 rounded text-teal-600 accent-teal-600 w-4 h-4 font-bold"
                                  checked={checkedRules.includes(rule.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setCheckedRules(prev => [...prev, rule.id]);
                                    } else {
                                      setCheckedRules(prev => prev.filter(id => id !== rule.id));
                                    }
                                  }}
                                />
                                <div>
                                  <span className="block text-xs font-bold text-[#0F172A] dark:text-neutral-200">
                                    {language === "ar" ? rule.nameAr : rule.nameEn}
                                  </span>
                                  <span className="block text-[10px] text-neutral-450 leading-tight">
                                    {language === "ar" ? rule.descriptionAr : rule.descriptionEn}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allergies Matrix */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">🚫 Active Drug & Drop Allergies</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={penicillinAllergy}
                              onChange={(e) => setPenicillinAllergy(e.target.checked)}
                            />
                            <span>Penicillin</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sulfaAllergy}
                              onChange={(e) => setSulfaAllergy(e.target.checked)}
                            />
                            <span>Sulfa Drugs</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-rose-50/10 border border-rose-200/20 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={proparacaineAllergy}
                              onChange={(e) => setProparacaineAllergy(e.target.checked)}
                            />
                            <span>Proparacaine</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-rose-50/10 border border-rose-200/20 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tropicamideAllergy}
                              onChange={(e) => setTropicamideAllergy(e.target.checked)}
                            />
                            <span>Tropicamide</span>
                          </label>
                        </div>
                      </div>

                      {/* Ophthalmic & Surgical History */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">👁️ Known Ophthalmic Surgical History</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lasikSurgery}
                              onChange={(e) => setLasikSurgery(e.target.checked)}
                            />
                            <span>LASIK/Laser</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cataractSurgery}
                              onChange={(e) => setCataractSurgery(e.target.checked)}
                            />
                            <span>Cataract Op</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={retinalSurgery}
                              onChange={(e) => setRetinalSurgery(e.target.checked)}
                            />
                            <span>Retina Shield</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={traumaSurgery}
                              onChange={(e) => setTraumaSurgery(e.target.checked)}
                            />
                            <span>Orbit Trauma</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setFormSubTab("insurance")}
                          className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-medium"
                        >
                          ← Back to Insurance
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4" /> Save Record & Auto-Assess Queue
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-3 flex justify-between items-center">
                <h4 className="text-lg font-medium text-neutral-800 flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-teal-500" /> Select Specialty Destination Clinic
                </h4>
                <div className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono">
                  Active Patient: {selectedPatient?.name} ({selectedPatient?.age} y/o)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {(Object.keys(CLINIC_INFO_MAP) as ClinicType[]).map((clinic) => {
                  const info = CLINIC_INFO_MAP[clinic];
                  const isSelected = selectedClinic === clinic;

                  return (
                    <div
                      key={clinic}
                      onClick={() => handleSelectClinic(clinic)}
                      className={`p-3 border rounded-xl cursor-pointer transition flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs scale-102"
                          : "border-neutral-100 hover:border-neutral-200 text-neutral-600 bg-neutral-50/20 hover:bg-neutral-50"
                      }`}
                    >
                      {getClinicIcon(info.icon)}
                      <span className="font-sans font-medium text-xs mt-2 block leading-none">
                        {clinic}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedClinic && (
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-lg text-xs leading-relaxed text-neutral-600 mb-4 flex gap-1.5 items-start">
                  <span className="text-teal-600 font-bold block shrink-0 mt-0.5">ℹ️ CLINIC SUMMARY:</span>
                  <div>
                    {CLINIC_INFO_MAP[selectedClinic].description}
                    <div className="text-rose-600 mt-1 font-medium bg-rose-50 px-1.5 py-0.5 rounded inline-block">
                      {CLINIC_INFO_MAP[selectedClinic].gatekeeperDesc}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 font-medium"
                >
                  ← Back to Identity
                </button>
                <button
                  type="button"
                  disabled={!selectedClinic}
                  onClick={handleFinalSubmit}
                  className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 shadow-sm ${
                    selectedClinic
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  Generate Ticket & Queue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-teal-600 animate-bounce" />
              </div>

              <h4 className="text-xl font-medium text-neutral-800">Check-In Successful!</h4>
              <p className="text-sm text-neutral-500 max-w-md mt-1.5">
                Successfully assigned patient <span className="font-semibold text-neutral-800">{selectedPatient?.name}</span> to the <span className="font-semibold text-neutral-800">{selectedPatient?.clinic} Clinic Queue</span>. Please proceed to the clinic triage lounge.
              </p>

              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mt-6 max-w-sm w-full font-mono text-left text-xs text-neutral-700">
                <div className="border-b border-neutral-200/50 pb-2 mb-2 flex justify-between">
                  <span className="font-bold">CAREFLOW HIS SYSTEM TICKET</span>
                  <span className="text-teal-600 font-bold">LIVE</span>
                </div>
                <div className="space-y-1">
                  <div>Patient ID: <span className="font-bold float-right">{selectedPatient?.id}</span></div>
                  <div>Department: <span className="font-bold float-right capitalize">{selectedPatient?.clinic}</span></div>
                  <div>Priority Indicator: <span className="font-bold text-teal-600 float-right">Normal FIFO</span></div>
                  {selectedPatient?.pediatricRedirected && (
                    <div className="text-rose-600 text-tiny mt-1 leading-none font-sans font-bold">
                      * REDIRECT GATE TRIGGERED: DOB checking enforces age Limit. Blocked pediatric rerouted gen eye.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetKiosk}
                className="mt-6 px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg text-sm font-medium flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Check In Next Patient
              </button>
            </div>
          )}
        </div>

        {/* Live WebSocket Matrix Feed Column */}
        <div className="lg:col-span-4 bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex flex-col">
          <div className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>📡 Live WebSocket Feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="flex-1 bg-neutral-900 rounded-lg p-3 overflow-y-auto max-h-80 font-mono text-xs text-amber-400 space-y-1.5 border border-neutral-800">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-neutral-500">[{new Date().toLocaleTimeString().slice(0, 5)}]</span> {log}
                </div>
              ))
            ) : (
              <div className="text-neutral-500 italic text-center pt-2">
                Kiosk standing by... click elements to observe live WebSocket network packets.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
