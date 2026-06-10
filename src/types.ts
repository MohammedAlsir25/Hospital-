/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClinicalRole = "receptionist" | "nurse" | "doctor" | "pharmacist" | "accountant" | "hr_manager";

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

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  contactNumber: string;
  jobTitle: string;
  baseSalary: number;
  commissionPercentage: number;
  employmentStatus: "ACTIVE" | "SUSPENDED" | "TERMINATED" | "ON_LEAVE";
  hiredDate: string;
  accruedCommissionSecured: number;
  
  // Enterprise clinical extensions
  department?: string; // e.g. "RETINA_CLINIC", "GLAUCOMA_CLINIC", "ORBIT_CLINIC", "TRIAGE", "PHARMACY", "ADMINISTRATION"
  roleType?: "ATTENDING" | "RESIDENT" | "NURSE" | "ADMIN" | "TECH";
  medicalLicenseNumber?: string;
  licenseExpiryDate?: string; // ISO date string
  boardCertifications?: string[];
  clinicalPrivileges?: string[]; // e.g. ["MACULAR_SURGERY", "LASER_PHOTOCOAGULATION", "INTRAVITREAL_INJECTIONS"]
  malpracticeInsuranceExpiry?: string; // ISO date string
  overtimeHours?: number;
  onCallDuty?: boolean;
  biometricId?: string;
  assignedRoom?: string; // e.g., "Retina Room 1"
  performanceScore?: number; // 1-5 rating
  peerFeedback?: string;
}
