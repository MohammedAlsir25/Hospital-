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

interface KioskReceptionProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onSelectPatient: (patient: Patient) => void;
}

export default function KioskReception({ patients, onAddPatient, onSelectPatient }: KioskReceptionProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New Patient Form state
  const [isNewForm, setIsNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("1995-06-15");
  const [newGender, setNewGender] = useState<"Male" | "Female" | "Other">("Male");

  // Selected Clinic state
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

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Compute age from DOB
    const birthYear = new Date(newDob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - birthYear);

    const created: Patient = {
      id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      dob: newDob,
      age,
      gender: newGender,
      status: "Registered",
      clinic: "Medicine", // placeholder
      clinicalLogs: [
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Client Kiosk",
          action: "Identity Registered",
          notes: `Self-registered at desk. DOB: ${newDob}`,
        },
      ],
      billingLedger: [
        {
          id: `BIL-${Math.floor(100 + Math.random() * 900)}`,
          serviceName: "Clinical Registration Fee",
          category: "Consultation",
          amount: 25,
          status: "Unpaid",
        },
      ],
    };

    onAddPatient(created);
    setSelectedPatient(created);
    // Move on
    setIsNewForm(false);
    setLogs((prev) => [...prev, `[New Account Created] ID: ${created.id} - ${created.name}`]);
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
                <form onSubmit={handleCreatePatient} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Full Legal Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-teal-500"
                      placeholder="e.g. Eleanor Vance"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Date of Birth</label>
                      <input
                        required
                        type="date"
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-teal-500"
                        value={newDob}
                        onChange={(e) => setNewDob(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Gender Identity</label>
                      <select
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-teal-500"
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value as any)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add & Select Record
                    </button>
                  </div>
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
