/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, ClinicType } from "./types";

export const CLINIC_INFO_MAP: Record<
  ClinicType,
  {
    icon: string;
    description: string;
    color: string;
    gatekeeperDesc: string;
  }
> = {
  "Medicine": {
    icon: "Activity",
    description: "Type 2 Diabetes reviews, systemic reports, Fasting Blood Sugar lab orders.",
    color: "emerald",
    gatekeeperDesc: "Mandatory Block: Preventing consultation close until today's triage vitals are validated against drug-drug interactions.",
  },
  "ENT": {
    icon: "Ear",
    description: "Otoscopy, rhinology, laryngoscopy, ear drop regimens, hearing assessments.",
    color: "sky",
    gatekeeperDesc: "Hearing Loss Lock: Doctors must attach Audiometry/Tympanometry test files to unlock the external referral module.",
  },
  "Dental": {
    icon: "Grid",
    description: "Odontogram-driven direct charting, caries pulling, procedure insurance billing.",
    color: "amber",
    gatekeeperDesc: "Billing Ledger Link: Marking tooth extracted/restored automatically updates surgical ledgers in real-time.",
  },
  "Retina": {
    icon: "Eye",
    description: "Diabetic retinopathy logging, fundus photographic history, intravitreal injections.",
    color: "cyan",
    gatekeeperDesc: "Dilation Time Gate: A mandatory 20-minute nurse pupil-dilation log prevents retina input activation.",
  },
  "Glaucoma": {
    icon: "Gauge",
    description: "Goldmann Tonometry, Cup-to-Disc charting, pressure-reducing drops.",
    color: "indigo",
    gatekeeperDesc: "Strict IOP Constraint: Direct boundary rules trigger immediate visual error windows on invalid inputs (e.g. >80 mmHg).",
  },
  "Orbit": {
    icon: "HeartPulse",
    description: "Exophthalmometry metrics, extraocular limits, high-res cranial CT scans.",
    color: "rose",
    gatekeeperDesc: "Priority Trigger: Glode Exposure or Acute Orbital Trauma flags route the patient instantly to the top of doctor queues as STAT.",
  },
  "Pediatrics Ophthalmology": {
    icon: "Baby",
    description: "Strabismus esotropia angles, visual chart toggles (LEA Symbols / Allen Cards).",
    color: "purple",
    gatekeeperDesc: "Age Gatekeeper: Auto-computes patient age from DOB. If age > 14, pediatric modules block, rerouting them to General Eye.",
  },
  "General Ophthalmology": {
    icon: "Compass",
    description: "Visual acuity maps, refraction specs (Sphere/Cylinder/Axis), slit-lamp exam.",
    color: "teal",
    gatekeeperDesc: "Optical Isolated Engine: Isolation separating glasses refraction formulas from pharmacy-dispensable drugs.",
  },
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PAT-001",
    name: "John Harrison",
    dob: "1972-04-12",
    age: 54,
    gender: "Male",
    status: "Triaged",
    clinic: "Medicine",
    triageVitals: {
      systolic: 135,
      diastolic: 85,
      heartRate: 72,
      temperatureCelcius: 36.8,
      weightKg: 82,
      urgency: "Normal",
      vitalsVerified: true,
    },
    clinicalLogs: [
      { timestamp: "18:30", actorRole: "Receptionist", action: "Tablet Check-in", notes: "Self-service kiosk check-in" },
      { timestamp: "18:35", actorRole: "Triage Nurse", action: "Vitals Recorded", notes: "BP slightly elevated (135/85 mmHg)." },
    ],
    billingLedger: [
      { id: "BIL-101", serviceName: "Clinical Registration Fee", category: "Consultation", amount: 25, status: "InsurancePending" },
      { id: "BIL-102", serviceName: "Triage Vitals Check", category: "Consultation", amount: 15, status: "InsurancePending" },
    ],
  },
  {
    id: "PAT-002",
    name: "Aidan Vance",
    dob: "1994-11-23",
    age: 31,
    gender: "Male",
    status: "Registered",
    clinic: "ENT",
    clinicalLogs: [
      { timestamp: "18:32", actorRole: "Receptionist", action: "Check-in Complete", notes: "Chief complaint: unilateral hearing loss" },
    ],
    billingLedger: [
      { id: "BIL-201", serviceName: "Clinical Registration Fee", category: "Consultation", amount: 25, status: "Unpaid" },
    ],
  },
  {
    id: "PAT-003",
    name: "Sarah Jenkins",
    dob: "1988-08-15",
    age: 37,
    gender: "Female",
    status: "Triaged",
    clinic: "Dental",
    triageVitals: {
      systolic: 120,
      diastolic: 80,
      heartRate: 68,
      temperatureCelcius: 37.0,
      weightKg: 65,
      urgency: "Normal",
      vitalsVerified: true,
    },
    clinicalLogs: [
      { timestamp: "18:25", actorRole: "Receptionist", action: "Kiosk Check-in", notes: "Dental patient checking in" },
      { timestamp: "18:28", actorRole: "Triage Nurse", action: "Vitals Recorded", notes: "Vitals normal" },
    ],
    billingLedger: [
      { id: "BIL-301", serviceName: "Clinical Registration Fee", category: "Consultation", amount: 25, status: "Unpaid" },
    ],
  },
  {
    id: "PAT-004",
    name: "Lydia Vance",
    dob: "2018-05-19",
    age: 8,
    gender: "Female",
    status: "Registered",
    clinic: "Pediatrics Ophthalmology",
    clinicalLogs: [
      { timestamp: "18:34", actorRole: "Receptionist", action: "Tablet Check-in", notes: "Pediatric eye screening scheduled" },
    ],
    billingLedger: [
      { id: "BIL-401", serviceName: "Clinical Registration Fee", category: "Consultation", amount: 25, status: "Unpaid" },
    ],
  },
  {
    id: "PAT-005",
    name: "Marcus Aurelius",
    dob: "1960-01-01",
    age: 66,
    gender: "Male",
    status: "Triaged",
    clinic: "Orbit",
    triageVitals: {
      systolic: 140,
      diastolic: 90,
      heartRate: 88,
      temperatureCelcius: 38.2,
      weightKg: 78,
      urgency: "Normal",
      vitalsVerified: true,
    },
    clinicalLogs: [
      { timestamp: "18:10", actorRole: "Receptionist", action: "Check-in Queue", notes: "Left orbit inflammation. Drooping lid." },
    ],
    billingLedger: [
      { id: "BIL-501", serviceName: "Clinical Registration Fee", category: "Consultation", amount: 25, status: "Unpaid" },
    ],
  },
];

export const SUGGESTED_DEVELOPER_PROMPTS = [
  {
    title: "🏥 Patient DB SQLite Offline Handler (Android)",
    prompt: "Generate an Android SQLite OpenHelper / Room implementation for local offline caching of clinical patients and vitals when Wi-Fi connection drops in the mobile clinic. Include database sync logic status flags (is_cached, sync_pending). Use robust Java.",
    category: "Android Offline Dev",
  },
  {
    title: "🦷 Odontogram to Billing Ledger Script (Java Spring)",
    prompt: "Write a Spring Boot RestController with a clinical database mapping that triggers dental billing actions. When a tooth state update transitions to 'Extracted' or 'Restored', compute matching fees, update the patient ledger immediately inside a single ACID database transaction, and log authorization roles.",
    category: "Integration / Dental Rule",
  },
  {
    title: "🔔 STAT Emergency Priority Overrides (Java Threads / SQL)",
    prompt: "Create a Java backend algorithm or SQL trigger logic that guarantees a patient flagged as Acute Orbital Trauma or Globe Exposure skips the chronological FIFO queue, flashes on the doctor UI, and takes immediate priority at position 1. Help me build this beautifully.",
    category: "System Workflow / STAT Gate",
  },
  {
    title: "📝 HIPAA Drug-Drug & Triage Safety Gate (Java Spring)",
    prompt: "Create a Java service method with custom validation annotation verifying that triage vitals have been verified for the day before allowing a doctor to close the encounter. Also, prevent drug-drug conflicts with an active contraindication rule engine.",
    category: "Clinical Gatekeepers",
  },
  {
    title: "📱 Overriding Native Tablet Back Button (Android)",
    prompt: "Generate a Kotlin code snippet inside an Android Activity overriding the OnBackPressedDispatcher callback. When the patient is in the middle of a triage form, trigger a secure alert dialog explaining that data loss will occur, and block standard back propagation. Also check Wi-Fi network states.",
    category: "Tablet Android Build",
  },
  {
    title: "📊 HL7/FHIR Compliant Pharmacy Inventory Database",
    prompt: "Write an enterprise SQL database schema modeling pharmacy medication stocks, drug classification codes (RxNorm), patient prescription dispensaries, and role-based tracking tables. It must isolate glass refraction optical data types to prevent pharmacists from accidentally processing optical metrics.",
    category: "Accounting & Pharmacy Isolation",
  },
];
