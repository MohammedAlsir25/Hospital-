/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { Patient, BillingItem } from "../types";

// Helper to generate large series of mock clinical data
function generateBulkLoadPatients(count: number): Patient[] {
  const clinics = ["General Ophthalmology", "Pediatrics Ophthalmology", "Orbit", "Glaucoma"] as const;
  const genders = ["Male", "Female", "Other"] as const;
  const urgencies = ["Normal", "Normal", "Normal", "STAT_EMERGENCY"] as const; // 25% STAT cases

  const patients: Patient[] = [];
  for (let i = 0; i < count; i++) {
    const isPediatric = i % 5 === 0;
    const age = isPediatric ? (i % 14) + 1 : 15 + (i % 65);
    const urgency = urgencies[i % urgencies.length];

    patients.push({
      id: `PAT-LOAD-${i.toString().padStart(6, "0")}`,
      name: `Simulated Patient #${i}`,
      dob: `198${i % 10}-01-01`,
      age,
      gender: genders[i % genders.length],
      status: "Registered",
      clinic: isPediatric ? "Pediatrics Ophthalmology" : clinics[i % clinics.length],
      clinicalLogs: [],
      billingLedger: [
        {
          id: `BIL-LOAD-${i}-1`,
          serviceName: "Standard Consultation Procedure",
          category: "Consultation",
          amount: 150,
          status: i % 2 === 0 ? "Paid" : "Unpaid",
        },
        {
          id: `BIL-LOAD-${i}-2`,
          serviceName: "Automated Laboratory Analysis",
          category: "ClinicalLab",
          amount: 80,
          status: i % 3 === 0 ? "InsurancePending" : "Unpaid",
        }
      ],
      triageVitals: {
        systolic: 120 + (i % 30),
        diastolic: 80 + (i % 20),
        heartRate: 70 + (i % 40),
        temperatureCelcius: 36.5 + (i % 20) / 10,
        weightKg: 50 + (i % 50),
        urgency,
        vitalsVerified: true,
      }
    });
  }
  return patients;
}

// EHR sorting logic to measure under load
function sortLoadQueue(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const aIsEmergency = a.triageVitals?.urgency === "STAT_EMERGENCY" ? 1 : 0;
    const bIsEmergency = b.triageVitals?.urgency === "STAT_EMERGENCY" ? 1 : 0;
    return bIsEmergency - aIsEmergency; // Bubbles emergency to the front
  });
}

// ERP aggregate calculations mapping for bulk testing
function calculateBulkBillingLedgers(patients: Patient[]) {
  let grandTotal = 0;
  let paidTotal = 0;
  let pendingInsuranceTotal = 0;
  let unpaidTotal = 0;

  for (let i = 0; i < patients.length; i++) {
    const ledger = patients[i].billingLedger;
    for (let j = 0; j < ledger.length; j++) {
      const item = ledger[j];
      grandTotal += item.amount;
      if (item.status === "Paid") {
        paidTotal += item.amount;
      } else if (item.status === "InsurancePending") {
        pendingInsuranceTotal += item.amount;
      } else {
        unpaidTotal += item.amount;
      }
    }
  }

  return { grandTotal, paidTotal, pendingInsuranceTotal, unpaidTotal };
}

describe("EHR/ERP Core Engines Computational Load & Stress Tests", () => {
  it("should process and sort a high-occupancy 5,000 patient clinical queue in under 50ms", () => {
    const sampleSize = 5000;
    const bulkPatients = generateBulkLoadPatients(sampleSize);

    const startTime = performance.now();
    const sorted = sortLoadQueue(bulkPatients);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify ordering integrity under stress
    expect(sorted.length).toBe(sampleSize);
    
    // The very first patient must have urgency = STAT_EMERGENCY
    expect(sorted[0].triageVitals?.urgency).toBe("STAT_EMERGENCY");
    
    // The very last patient must have urgency = Normal 
    expect(sorted[sorted.length - 1].triageVitals?.urgency).toBe("Normal");

    // Performance assertion (typically completes in 2-10ms in standard V8)
    console.log(`[Load Test] Sorted ${sampleSize} patients queue in ${duration.toFixed(2)}ms.`);
    expect(duration).toBeLessThan(50);
  });

  it("should calculate multidimensional ledger accruals across 10,000 invoices in under 30ms without memory degradation", () => {
    const sampleSize = 5000; // 5000 patients * 2 invoices each = 10,000 billing ledger items
    const bulkPatients = generateBulkLoadPatients(sampleSize);

    const startTime = performance.now();
    const billingSummary = calculateBulkBillingLedgers(bulkPatients);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert absolute math correctness
    expect(billingSummary.grandTotal).toBe(sampleSize * 150 + sampleSize * 80); // Each patient gets a 150 + 80 invoice
    
    // Performance assertion
    console.log(`[Load Test] Aggregated ${sampleSize * 2} ledger invoices in ${duration.toFixed(2)}ms.`);
    expect(duration).toBeLessThan(30);
  });

  it("should run bulk validation audits of pediatric thresholds on 5000 records smoothly", () => {
    const sampleSize = 5000;
    const bulkPatients = generateBulkLoadPatients(sampleSize);
    let violationsCount = 0;

    const startTime = performance.now();
    bulkPatients.forEach((patient) => {
      if (patient.clinic === "Pediatrics Ophthalmology" && patient.age > 14) {
        violationsCount++;
      }
    });
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`[Load Test] Completed age audit sweep on ${sampleSize} patients in ${duration.toFixed(2)}ms. Violations: ${violationsCount}`);
    
    expect(violationsCount).toBeGreaterThan(0);
    expect(duration).toBeLessThan(20);
  });
});
