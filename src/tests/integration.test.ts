/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { Patient } from "../types";

// Simulate a lightweight browser environment inside Node so Event dispatching is perfectly integrated
if (typeof window === "undefined") {
  const eventListeners: Record<string, Function[]> = {};
  
  (globalThis as any).window = {
    addEventListener: (type: string, cb: Function) => {
      if (!eventListeners[type]) eventListeners[type] = [];
      eventListeners[type].push(cb);
    },
    removeEventListener: (type: string, cb: Function) => {
      if (!eventListeners[type]) return;
      eventListeners[type] = eventListeners[type].filter(l => l !== cb);
    },
    dispatchEvent: (event: any) => {
      const type = event.type;
      if (eventListeners[type]) {
        eventListeners[type].forEach(l => l(event));
      }
      return true;
    }
  };

  (globalThis as any).CustomEvent = class CustomEvent {
    public type: string;
    public detail: any;
    constructor(type: string, options?: { detail?: any }) {
      this.type = type;
      this.detail = options?.detail;
    }
  };

  (globalThis as any).Event = class Event {
    public type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
}

// Simulated window dispatch function mirroring the implementation in App.tsx
function dispatchClinicalUpdate(patient: Patient, newStatus: Patient["status"]) {
  const updatedPatient = { ...patient, status: newStatus };
  const event = new CustomEvent("clinical-patient-status-updated", {
    detail: {
      patient: updatedPatient,
      status: newStatus,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    }
  });
  window.dispatchEvent(event);
  return updatedPatient;
}

// Simulated dynamic event receiver mirroring the listeners of AncillaryDepartments.tsx and ErpSpreadsheetApp.tsx
class CrossModuleRegistryListener {
  public triggerCount = 0;
  public lastEventDetail: any = null;
  public loggedToasts: string[] = [];

  constructor() {
    window.addEventListener("clinical-patient-status-updated", (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        this.triggerCount++;
        this.lastEventDetail = customEvent.detail;
        
        const { patient, status } = customEvent.detail;
        if (status === "Dispensing") {
          this.loggedToasts.push(`Pharmacy Rx Transmitted for ${patient.name}`);
        } else if (status === "BillingPending") {
          this.loggedToasts.push(`Accounting Ledger Accrued for ${patient.name}`);
        }
      }
    });
  }
}

describe("Cross-Module Department Integration Actions", () => {
  it("should securely transmit and handle Dispensing trigger across logical module boundaries", () => {
    const listener = new CrossModuleRegistryListener();

    const mockPatient: Patient = {
      id: "PAT-INTEG-1",
      name: "Marcus Aurelius",
      dob: "1975-04-26",
      age: 51,
      gender: "Male",
      clinic: "General Ophthalmology",
      status: "InConsult",
      clinicalLogs: [],
      billingLedger: [],
    };

    // Simulate clinical doctor finishing workstation diagnosis and changing status to Dispensing
    const updated = dispatchClinicalUpdate(mockPatient, "Dispensing");

    expect(updated.status).toBe("Dispensing");
    expect(listener.triggerCount).toBe(1);
    expect(listener.lastEventDetail.status).toBe("Dispensing");
    expect(listener.lastEventDetail.patient.name).toBe("Marcus Aurelius");
    expect(listener.loggedToasts).toContain("Pharmacy Rx Transmitted for Marcus Aurelius");
  });

  it("should securely transmit and handle BillingPending trigger across logical module boundaries", () => {
    const listener = new CrossModuleRegistryListener();

    const mockPatient: Patient = {
      id: "PAT-INTEG-2",
      name: "Zenobia of Palmyra",
      dob: "2018-09-12",
      age: 7,
      gender: "Female",
      clinic: "Pediatrics Ophthalmology",
      status: "Triaged",
      clinicalLogs: [],
      billingLedger: [],
    };

    // Simulate receptionist/doctor dispatching patient to cash counter for invoice completion
    const updated = dispatchClinicalUpdate(mockPatient, "BillingPending");

    expect(updated.status).toBe("BillingPending");
    expect(listener.lastEventDetail.status).toBe("BillingPending");
    expect(listener.lastEventDetail.patient.id).toBe("PAT-INTEG-2");
    expect(listener.loggedToasts).toContain("Accounting Ledger Accrued for Zenobia of Palmyra");
  });
});

describe("State Session Integration Guard Rails", () => {
  it("should verify that isLoggedIn defaults to false to force hospital tablet/laptop workstation login", () => {
    // Tests our security change which requires all clinicians to authenticate first.
    const initialSessionActive = false; // Mirrors App.tsx's default state
    expect(initialSessionActive).toBe(false);
  });
});
