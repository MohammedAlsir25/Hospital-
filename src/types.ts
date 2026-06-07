/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClinicalRole = "receptionist" | "nurse" | "doctor" | "pharmacist" | "accountant";

export type PatientStatus =
  | "Registered"
  | "Triaged"
  | "InConsult"
  | "LabsPending"
  | "Dispensing"
  | "BillingPending"
  | "Completed";

export interface Patient {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  status: PatientStatus;
  clinic: ClinicType;
  triageVitals?: TriageVitals;
  clinicalLogs: ClinicalLogEntry[];
  billingLedger: BillingItem[];
  pediatricRedirected?: boolean;
}

export type ClinicType =
  | "Medicine"
  | "ENT"
  | "Dental"
  | "Retina"
  | "Glaucoma"
  | "Orbit"
  | "Pediatrics Ophthalmology"
  | "General Ophthalmology";

export interface TriageVitals {
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperatureCelcius: number;
  weightKg: number;
  urgency: "Normal" | "STAT_EMERGENCY";
  vitalsVerified: boolean;
}

export interface ClinicalLogEntry {
  timestamp: string;
  actorRole: string;
  action: string;
  notes: string;
}

export interface BillingItem {
  id: string;
  serviceName: string;
  category: "Consultation" | "DentalSurgical" | "ClinicalLab" | "RadiologyProof" | "PharmacyDispense";
  amount: number;
  status: "Unpaid" | "Paid" | "InsurancePending";
}

export interface ClinicState {
  // Medicine
  warningsCleared: boolean;
  // ENT
  hearingLossDiagnosed: boolean;
  audiometryFileAttached: boolean;
  audiometryFileName: string;
  // Dental
  odontogram: Record<number, string>; // toothIndex -> condition ('Healthy' | 'Caries' | 'Extracted' | 'Restored')
  // Retina
  dilationTimerActive: boolean;
  dilationSecondsRemaining: number;
  dilationCompleted: boolean;
  // Glaucoma
  iopLeftEye: number;
  iopRightEye: number;
  glaucomaErrorMsg: string;
  // Orbit
  movementScore: number; // 1 to 5
  // Pediatrics Ophthalmology
  visualChartType: "LEA Symbols" | "Allen Cards";
  isPatchingAdvised: boolean;
  // General Ophthalmology
  refractionSphere: number;
  refractionCylinder: number;
  refractionAxis: number;
}
