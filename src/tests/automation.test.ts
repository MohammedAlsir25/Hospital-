/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { Patient, PatientStatus, BillingItem } from "../types";

// --- ERP & EHR SYSTEM AUTOMATION CONTROLLER ---
class AutomatedClinicController {
  public patients: Patient[] = [];
  public currentTimestamp: string = "09:00 AM";

  constructor(initialPatients: Patient[]) {
    this.patients = [...initialPatients];
  }

  // Automation Step 1: Admission & Registration
  public registerPatient(patient: Omit<Patient, "status" | "clinicalLogs" | "billingLedger">): Patient {
    const newPatient: Patient = {
      ...patient,
      status: "Registered",
      clinicalLogs: [
        {
          timestamp: this.currentTimestamp,
          actorRole: "receptionist",
          action: "Patient self-admitted",
          notes: `Self-admitted to ${patient.clinic}`,
        },
      ],
      billingLedger: [],
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  // Automation Step 2: Automated Triage Audit & Vitals Check-in
  public performTriage(
    patientId: string,
    vitals: {
      systolic: number;
      diastolic: number;
      heartRate: number;
      temperatureCelcius: number;
      weightKg: number;
      urgency: "Normal" | "STAT_EMERGENCY";
    }
  ): Patient {
    const patientIndex = this.patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found");

    const patient = this.patients[patientIndex];
    patient.status = "Triaged";
    patient.triageVitals = {
      ...vitals,
      vitalsVerified: true,
    };

    // Automated flag validation
    const ageEscalationFlag = patient.clinic === "Pediatrics Ophthalmology" && patient.age > 14;
    const urgencyAlert = vitals.urgency === "STAT_EMERGENCY";

    patient.clinicalLogs.push({
      timestamp: this.currentTimestamp,
      actorRole: "nurse",
      action: "Vitals Recorded",
      notes: `Urgency level: ${vitals.urgency}.${
        ageEscalationFlag ? " [ALERT DETECTED] Patient exceeds pediatric age threshold!" : ""
      }${urgencyAlert ? " [STAT ALERT] Primary trauma dispatch triggered." : ""}`,
    });

    return patient;
  }

  // Automation Step 3: Physician Optometry & Careflow Diagnostic Routing
  public administerConsultation(
    patientId: string,
    diagnoses: string,
    prescribedMedicines: string[],
    clinicRef: string
  ): Patient {
    const patientIndex = this.patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found");

    const patient = this.patients[patientIndex];
    patient.status = "InConsult";

    // Append diagnosis to medical journal
    patient.clinicalLogs.push({
      timestamp: this.currentTimestamp,
      actorRole: "doctor",
      action: "Consultation Diagnosis & Rx Plan",
      notes: `Diagnosis: ${diagnoses}. Prescribed: ${prescribedMedicines.join(", ")}`,
    });

    // Auto-generate ERP Billing Accruals based on clinical procedures performed
    patient.billingLedger.push({
      id: `BIL-${Math.floor(Date.now() + Math.random() * 1000)}`,
      serviceName: "Comprehensive Eye Consult",
      category: "Consultation",
      amount: 120,
      status: "Unpaid",
    });

    if (prescribedMedicines.length > 0) {
      patient.billingLedger.push({
        id: `BIL-${Math.floor(Date.now() + Math.random() * 1000 + 1)}`,
        serviceName: "Ophthalmic Eye Drop Dispense Fee",
        category: "PharmacyDispense",
        amount: 45,
        status: "Unpaid",
      });
      patient.status = "Dispensing"; // Reroute to Pharmacy
    } else {
      patient.status = "BillingPending"; // Dispatch directly to general accounting checkout
    }

    return patient;
  }

  // Automation Step 4: Ledger Settle & Checkout
  public checkoutAndSettle(patientId: string): Patient {
    const patientIndex = this.patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) throw new Error("Patient not found");

    const patient = this.patients[patientIndex];
    
    // Automatically settle all outstanding items in ledger
    patient.billingLedger = patient.billingLedger.map((item) => ({
      ...item,
      status: "Paid",
    }));

    patient.status = "Completed";
    patient.clinicalLogs.push({
      timestamp: this.currentTimestamp,
      actorRole: "accountant",
      action: "Checkout invoice payment",
      notes: "Co-pay settled. Insurance claims uploaded. Patient checked out.",
    });

    return patient;
  }
}

// --- AUTOMATION INTEGRATION TESTS ---
describe("E2E Automated Clinical Workstation and Billing Pipelines", () => {
  it("should successfully run the full clinical life-cycle to completion with correct logs and ledger accruals", () => {
    const controller = new AutomatedClinicController([]);

    // 1. Admission Automation
    const patient = controller.registerPatient({
      id: "PAT-AUTO-99",
      name: "Augustus Caesar",
      dob: "1980-09-23",
      age: 45,
      gender: "Male",
      clinic: "Orbit",
    });

    expect(patient.status).toBe("Registered");
    expect(patient.clinicalLogs[0].action).toContain("Patient self-admitted");

    // 2. Triage Automation (Emergency STAT route)
    const triagedPatient = controller.performTriage("PAT-AUTO-99", {
      systolic: 155,
      diastolic: 95,
      heartRate: 112,
      temperatureCelcius: 37.1,
      weightKg: 82,
      urgency: "STAT_EMERGENCY",
    });

    expect(triagedPatient.status).toBe("Triaged");
    expect(triagedPatient.triageVitals?.urgency).toBe("STAT_EMERGENCY");
    expect(triagedPatient.clinicalLogs[1].notes).toContain("[STAT ALERT]");

    // 3. Consultation Automation (With prescription billing triggers)
    const consultedPatient = controller.administerConsultation(
      "PAT-AUTO-99",
      "Glaucoma suspected. Intraocular pressure measured high at 24mmHg.",
      ["Timolol Maleate 0.5% Eyedrops"],
      "Orbit"
    );

    // Because medicine is prescribed, status should be 'Dispensing'
    expect(consultedPatient.status).toBe("Dispensing");
    expect(consultedPatient.billingLedger.length).toBe(2); // Consultation + Pharmacy dispense fee
    expect(consultedPatient.billingLedger[0].status).toBe("Unpaid");
    expect(consultedPatient.billingLedger[1].serviceName).toContain("Ophthalmic Eye Drop");

    // 4. ERP Billing Checkout Automation
    const completedPatient = controller.checkoutAndSettle("PAT-AUTO-99");

    expect(completedPatient.status).toBe("Completed");
    expect(completedPatient.billingLedger.every((item) => item.status === "Paid")).toBe(true);
    expect(completedPatient.clinicalLogs[3].actorRole).toBe("accountant");
  });

  it("should automatically tag overage pediatric patients upon Triage check-in", () => {
    const controller = new AutomatedClinicController([]);

    controller.registerPatient({
      id: "PAT-AUTO-100",
      name: "Titus Flavius",
      dob: "2009-03-12",
      age: 17, // Older than pediatric threshold 14
      gender: "Male",
      clinic: "Pediatrics Ophthalmology",
    });

    const triaged = controller.performTriage("PAT-AUTO-100", {
      systolic: 110,
      diastolic: 70,
      heartRate: 80,
      temperatureCelcius: 36.6,
      weightKg: 58,
      urgency: "Normal",
    });

    // Validates that clinical rules auto-detected pediatric age violation warning log
    expect(triaged.clinicalLogs[1].notes).toContain("[ALERT DETECTED] Patient exceeds pediatric age threshold!");
  });
});
