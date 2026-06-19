/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClinicalRole = "receptionist" | "nurse" | "doctor" | "pharmacist" | "accountant" | "hr_manager" | "admin" | "warehouse";

export type PatientStatus =
  | "Registered"
  | "Triaged"
  | "InConsult"
  | "LabsPending"
  | "Dispensing"
  | "BillingPending"
  | "Completed"
  | "SURGERY_IN_PROGRESS";

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

  // Administrative & Hospital Requirements (Legal & Financial)
  administrativeProfile?: {
    nationalId: string;
    passportNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    mobileNumber: string;
    nationality: string;
    emergencyName?: string;
    emergencyRelationship?: string;
    emergencyPhone?: string;
  };

  // Insurance & Payer Matrix
  insuranceCoverage?: {
    payerType: "Self-Pay" | "Private Insurance" | "Government/Corporate Sponsor";
    providerId: string; // e.g. Daman, AXA, Bupa, etc.
    policyNumber: string;
    cardExpiryDate: string;
    preAuthApproved?: boolean;
    preAuthResponse?: string;
  };

  // Clinical Requirements Red Flag Checkbox Matrix
  clinicalTriageFlags?: {
    chiefComplaint: string; // Dropdown value
    hasDiabetes: boolean;
    hasHypertension: boolean;
    hasCKD: boolean; // Chronic Kidney Disease / Renal Failure
    knownAllergies: string[]; // e.g. Penicillin, Sulfa
    ophthalmicDropAllergies: string[]; // e.g. Proparacaine, Tropicamide
    hasGlaucomaHistory: boolean;
    previousEyeSurgeries: string[]; // LASIK, Cataract, etc.
  };
  optometryDossier?: OptometryEncounterDossier;
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
  bloodGlucoseMmol?: number;
  isGlucoseFasting?: boolean;
  autorefractionEstimateRight?: string;
  autorefractionEstimateLeft?: string;
  nctIopRightMmHg?: number;
  nctIopLeftMmHg?: number;
  dilationTimerActive?: boolean;
  dilationSecondsRemaining?: number;
  dilationCheckedAt?: string;
  dilationEye?: "RIGHT" | "LEFT" | "BILATERAL";
  surgicalEyeMarked?: "OD" | "OS" | "OU";
  preOpDropsGiven?: boolean;
  dilationCompleted?: boolean;
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

export interface AppNotification {
  id: string;
  type: "lab" | "referral" | "alert" | "system";
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  timestamp: string;
  patientName?: string;
  patientId?: string;
}

export interface LensometryData {
  hasCurrentSpectacles: boolean;
  rightEyeOd: { sphere: string; cylinder: string; axis: number; addition: string };
  leftEyeOs: { sphere: string; cylinder: string; axis: number; addition: string };
  lensType: "Single Vision" | "Bifocal" | "Progressive" | "Prism" | "None";
}

export interface VisualAcuity {
  distanceUnaided: { od: string; os: string };
  distanceAided: { od: string; os: string };
  pinholeAcuity: { od: string; os: string };
}

export interface SubjectiveRefraction {
  finalPrescriptionOd: { sphere: string; cylinder: string; axis: number };
  finalPrescriptionOs: { sphere: string; cylinder: string; axis: number };
  vertexDistanceMm?: number;
}

export interface OptometryEncounterDossier {
  encounterId: string;
  patientId: string;
  optometristStaffId: string;
  lensometryData: LensometryData;
  visualAcuity: VisualAcuity;
  subjectiveRefraction: SubjectiveRefraction;
  tonometryIopMmHg: {
    rightEyeOd: number;
    leftEyeOs: number;
    measurementMethod: "NON_CONTACT_TONOMETRY" | "GOLDMANN_APP_TONOMETRY";
  };
  targetSpecialtyDestination: string;
  completedAt?: string;
  optometristPinSigned?: boolean;
  clinicalFlags?: string[];
}

