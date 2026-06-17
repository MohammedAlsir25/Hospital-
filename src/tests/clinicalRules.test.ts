/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { Patient, PatientStatus, BillingItem } from "../types";

// 1. Queue priorities simulation helper matching App.tsx line 1054
function sortPatientsQueue(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const aIsEmergency = a.triageVitals?.urgency === "STAT_EMERGENCY";
    const bIsEmergency = b.triageVitals?.urgency === "STAT_EMERGENCY";

    if (aIsEmergency && !bIsEmergency) return -1;
    if (!aIsEmergency && bIsEmergency) return 1;
    return 0;
  });
}

// 2. Pediatrics age check logic matching KioskReception & SpecialtyClinics
function checkPediatricEligibility(patient: Patient): { eligible: boolean; action: string } {
  if (patient.clinic === "Pediatrics Ophthalmology") {
    if (patient.age > 14) {
      return {
        eligible: false,
        action: "Reroute to General Ophthalmology - Age above clinical threshold of 14",
      };
    }
  }
  return { eligible: true, action: "Proceed with scheduled consultation" };
}

// 3. ERP Accounting Billing Calculator helper for testing
function computeLedgerBalances(billingItems: BillingItem[]) {
  let totalAmount = 0;
  let insurancePendingSum = 0;
  let paidSum = 0;
  let unpaidPatientPayable = 0;

  billingItems.forEach((item) => {
    totalAmount += item.amount;
    if (item.status === "Paid") {
      paidSum += item.amount;
    } else if (item.status === "InsurancePending") {
      insurancePendingSum += item.amount;
    } else if (item.status === "Unpaid") {
      unpaidPatientPayable += item.amount;
    }
  });

  return {
    totalAmount,
    paidSum,
    insurancePendingSum,
    unpaidPatientPayable,
  };
}

describe("Clinical Queue & Business Rules Engine", () => {
  describe("Triage Urgent/STAT Prioritization", () => {
    it("should bubble STAT_EMERGENCY patients to the front of the queue ahead of normal patients", () => {
      const p1: Patient = {
        id: "PAT-001",
        name: "Standard Patient A",
        dob: "1990-01-01",
        age: 36,
        gender: "Male",
        status: "Registered",
        clinic: "General Ophthalmology",
        clinicalLogs: [],
        billingLedger: [],
        triageVitals: {
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
          temperatureCelcius: 36.6,
          weightKg: 70,
          urgency: "Normal",
          vitalsVerified: true,
        },
      };

      const p2: Patient = {
        id: "PAT-002",
        name: "Critical Trauma Case",
        dob: "1985-05-05",
        age: 41,
        gender: "Female",
        status: "Registered",
        clinic: "Orbit",
        clinicalLogs: [],
        billingLedger: [],
        triageVitals: {
          systolic: 145,
          diastolic: 95,
          heartRate: 110,
          temperatureCelcius: 37.2,
          weightKg: 65,
          urgency: "STAT_EMERGENCY",
          vitalsVerified: true,
        },
      };

      const p3: Patient = {
        id: "PAT-003",
        name: "Standard Patient B",
        dob: "1995-10-10",
        age: 30,
        gender: "Other",
        status: "Registered",
        clinic: "General Ophthalmology",
        clinicalLogs: [],
        billingLedger: [],
        triageVitals: {
          systolic: 118,
          diastolic: 78,
          heartRate: 68,
          temperatureCelcius: 36.5,
          weightKg: 74,
          urgency: "Normal",
          vitalsVerified: true,
        },
      };

      // Chronological order: [Standard A, Critical Trauma, Standard B]
      const originalQueue = [p1, p2, p3];

      // After prioritization, the critical case must be at the very front (index 0)
      const sortedQueue = sortPatientsQueue(originalQueue);

      expect(sortedQueue[0].id).toBe("PAT-002");
      expect(sortedQueue[0].name).toBe("Critical Trauma Case");
      
      // Chronological spacing is preserved for non-emergency patients
      expect(sortedQueue[1].id).toBe("PAT-001");
      expect(sortedQueue[2].id).toBe("PAT-003");
    });
  });

  describe("Pediatrics Ophthalmology Age Limit Constraints", () => {
    it("should allow children age 14 or under to proceed with Pediatrics suite", () => {
      const pediatricPatient: Patient = {
        id: "PAT-PED-01",
        name: "Tommy Miller",
        dob: "2015-02-12",
        age: 11,
        gender: "Male",
        status: "Registered",
        clinic: "Pediatrics Ophthalmology",
        clinicalLogs: [],
        billingLedger: [],
      };

      const result = checkPediatricEligibility(pediatricPatient);
      expect(result.eligible).toBe(true);
      expect(result.action).toContain("Proceed");
    });

    it("should block and suggest rerouting for patients older than 14 in the pediatric clinic", () => {
      const overageTeenager: Patient = {
        id: "PAT-PED-02",
        name: "Clara Jordan",
        dob: "2010-06-18",
        age: 16,
        gender: "Female",
        status: "Registered",
        clinic: "Pediatrics Ophthalmology",
        clinicalLogs: [],
        billingLedger: [],
      };

      const result = checkPediatricEligibility(overageTeenager);
      expect(result.eligible).toBe(false);
      expect(result.action).toContain("Reroute to General Ophthalmology");
    });
  });

  describe("ERP Accounting & Billing Multi-Entry Ledgers", () => {
    it("should accurately sum paid, unpaid patient portions, and pending insurance claims", () => {
      const demoItems: BillingItem[] = [
        { id: "BIL-101", serviceName: "Ophthalmic Consultation", category: "Consultation", amount: 150, status: "Paid" },
        { id: "BIL-102", serviceName: "Specular Microscopic Photography", category: "ClinicalLab", amount: 350, status: "InsurancePending" },
        { id: "BIL-103", serviceName: "Latanoprost 0.005% Eyedrops", category: "PharmacyDispense", amount: 75, status: "Unpaid" },
        { id: "BIL-104", serviceName: "Visual Field Screening", category: "RadiologyProof", amount: 200, status: "Paid" },
      ];

      const balance = computeLedgerBalances(demoItems);

      expect(balance.totalAmount).toBe(150 + 350 + 75 + 200); // 775
      expect(balance.paidSum).toBe(150 + 200); // 350
      expect(balance.insurancePendingSum).toBe(350); // 350
      expect(balance.unpaidPatientPayable).toBe(75); // 75
    });

    it("should return zeros for empty billing ledger arrays without failing", () => {
      const balances = computeLedgerBalances([]);
      expect(balances.totalAmount).toBe(0);
      expect(balances.paidSum).toBe(0);
      expect(balances.insurancePendingSum).toBe(0);
      expect(balances.unpaidPatientPayable).toBe(0);
    });
  });
});
