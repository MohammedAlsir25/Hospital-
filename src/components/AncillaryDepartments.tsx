/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Package,
  Activity,
  Image,
  Layers,
  CheckCircle2,
  AlertCircle,
  Receipt,
  UserCheck,
  CreditCard,
  Building,
  Printer,
  FileDown,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { Patient, ClinicalRole, BillingItem } from "../types";

interface AncillaryDepartmentsProps {
  patients: Patient[];
  onUpdatePatient: (updated: Patient) => void;
  activeRole: ClinicalRole;
}

export default function AncillaryDepartments({
  patients,
  onUpdatePatient,
  activeRole
}: AncillaryDepartmentsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ""
  );

  // Local state for prescription draft items
  const [prescriptionItems, setPrescriptionItems] = useState<{
    code: string;
    name: string;
    dosage: string;
    qty: number;
  }[]>([]);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pdfRendering, setPdfRendering] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Auto-fill prescription recommended treatment on patient switch
  React.useEffect(() => {
    if (!selectedPatient) return;
    
    let defaultItems: { code: string; name: string; dosage: string; qty: number }[] = [];
    
    switch (selectedPatient.clinic) {
      case "Medicine":
        defaultItems = [
          { code: "RX-MET-500", name: "Metformin HCL 500mg (Oral)", dosage: "1 tablet twice daily with meals", qty: 60 }
        ];
        break;
      case "Retina":
      case "Glaucoma":
        defaultItems = [
          { code: "RX-LAT-005", name: "Latanoprost 0.005% (Ophthalmic Drops)", dosage: "1 drop in the affected eye(s) once daily at bedtime", qty: 1 }
        ];
        break;
      case "ENT":
        defaultItems = [
          { code: "RX-AMO-250", name: "Amoxicillin Susp 250mg (Oral)", dosage: "5ml three times daily for 7 days", qty: 1 }
        ];
        break;
      case "Dental":
        defaultItems = [
          { code: "RX-AMO-250", name: "Amoxicillin Susp 250mg (Oral)", dosage: "500mg every 8 hours for 5 days", qty: 15 }
        ];
        break;
      case "Orbit":
      case "Pediatrics Ophthalmology":
        defaultItems = [
          { code: "RX-CYC-010", name: "Cyclopentolate 1% (Pupil Dilator Drops)", dosage: "Instill 1 drop 20 minutes prior to exam", qty: 1 }
        ];
        break;
      default:
        defaultItems = [
          { code: "RX-MET-500", name: "Metformin HCL 500mg (Oral)", dosage: "1 tablet daily", qty: 30 }
        ];
        break;
    }
    setPrescriptionItems(defaultItems);
  }, [selectedPatientId]);
  
  // Local Pharmacy stock inventory table (simulation state)
  const [pharmacyStocks, setPharmacyStocks] = useState([
    { code: "RX-MET-500", name: "Metformin HCL 500mg (Oral)", stock: 1540, drugClass: "Antidiabetic", isChemical: true },
    { code: "RX-LAT-005", name: "Latanoprost 0.005% (Ophthalmic Drops)", stock: 85, drugClass: "Glaucoma Pressure Reducer", isChemical: true },
    { code: "RX-AMO-250", name: "Amoxicillin Susp 250mg (Oral)", stock: 210, drugClass: "Antibacterial", isChemical: true },
    { code: "RX-CYC-010", name: "Cyclopentolate 1% (Pupil Dilator Drops)", stock: 120, drugClass: "Diagnostic Ophthalmic Mydriatic", isChemical: true },
    { code: "OPT-PHO-GLASS", name: "Refraction Index Eyeglasses Blueprint model", stock: 1, drugClass: "Isolated Visual Optometry Type", isChemical: false }
  ]);

  // Radiology simulator image state
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  const handlePayBillItem = (itemId: string) => {
    if (!selectedPatient) return;

    const updatedLedger = selectedPatient.billingLedger.map((item) =>
      item.id === itemId ? { ...item, status: "Paid" as const } : item
    );

    const updatedPatient: Patient = {
      ...selectedPatient,
      billingLedger: updatedLedger,
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Accounts Cashier",
          action: "Transaction Receipt Formed",
          notes: `Billing Item id ${itemId} verified paid via direct credit/insurance ledger clearance.`
        }
      ]
    };

    onUpdatePatient(updatedPatient);
  };

  const handleDischargePatient = () => {
    if (!selectedPatient) return;

    const allPaid = selectedPatient.billingLedger.every((i) => i.status === "Paid");
    if (!allPaid) {
      alert("MANDATORY FINANCIAL BARRIER: Patient has unpaid claims. Clear invoice items in Cashier Desk before final discharge.");
      return;
    }

    const updatedPatient: Patient = {
      ...selectedPatient,
      status: "Completed",
      clinicalLogs: [
        ...selectedPatient.clinicalLogs,
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          actorRole: "Cashier Ledger System",
          action: "Patient Discharged",
          notes: "All invoice amounts cleared. Medical records compiled and closed."
        }
      ]
    };

    onUpdatePatient(updatedPatient);
    alert(`Success: ${selectedPatient.name} has been fully discharged. Files archived.`);
  };

  const handleDispenseStock = (drugCode: string, qty: number = 30) => {
    // Only pharmacist can dispense stock
    if (activeRole !== "pharmacist" && activeRole !== "doctor") {
      alert("ROLE RESTRICTION ERROR: ONLY pharmacists or Doctors are authorized to deduct chemical pharmaceutical stock registries.");
      return;
    }

    setPharmacyStocks((prev) =>
      prev.map((item) => {
        if (item.code === drugCode) {
          if (item.stock < qty) {
            alert(`Critical error: Insufficient stocks for ${item.name}`);
            return item;
          }
          return { ...item, stock: item.stock - qty };
        }
        return item;
      })
    );

    alert(`Successfully dispensed ${qty} units of ${drugCode} from active chemical storage vaults.`);
  };

  const handleUpdateDosage = (code: string, dosage: string) => {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.code === code ? { ...item, dosage } : item))
    );
  };

  const handleUpdateQty = (code: string, qty: number) => {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.code === code ? { ...item, qty } : item))
    );
  };

  const handleRemoveDraftItem = (code: string) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.code !== code));
  };

  const handleAddToRxDraft = (drug: { code: string; name: string; drugClass: string; isChemical: boolean }) => {
    const exists = prescriptionItems.some((item) => item.code === drug.code);
    if (exists) {
      alert(`"${drug.name}" is already included in the active prescription list!`);
      return;
    }
    setPrescriptionItems((prev) => [
      ...prev,
      {
        code: drug.code,
        name: drug.name,
        dosage: drug.code === "RX-LAT-005"
          ? "1 drop in the affected eye(s) once daily at bedtime"
          : drug.code === "RX-CYC-010"
          ? "Instill 1 drop 20 minutes prior to ophthalmic examination"
          : "1 tablet daily",
        qty: drug.code === "RX-LAT-005" || drug.code === "RX-CYC-010" ? 1 : 30
      }
    ]);
  };

  const handleDownloadPrescription = () => {
    if (!selectedPatient) return;
    setPdfRendering(true);
    setPdfSuccess(false);

    setTimeout(() => {
      setPdfRendering(false);
      setPdfSuccess(true);

      const dateString = new Date().toLocaleString();
      const patientNameSafe = selectedPatient.name.replace(/\s+/g, "_") || "Patient";

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CareFlow Prescription - ${selectedPatient.name}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; color: #1f2937; padding: 40px; margin: 0; line-height: 1.5; }
    .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
    .hospital-title { font-size: 24px; font-weight: bold; color: #0f766e; margin: 0; letter-spacing: 0.5px; }
    .hospital-sub { font-size: 11px; text-transform: uppercase; color: #6b7280; margin: 5px 0 0 0; }
    .meta-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 25px; background: #f9fafb; font-size: 13px; }
    .barcode { font-family: monospace; font-size: 16px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1.5px; color: #111827; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .field { margin-bottom: 10px; }
    .label { font-size: 10px; text-transform: uppercase; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 2px; }
    .value { font-weight: 600; font-size: 13px; color: #1f2937; }
    .rx-symbol { font-size: 32px; font-family: Georgia, serif; font-style: italic; color: #0f766e; margin-bottom: 15px; }
    .med-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    .med-table th { border-bottom: 2px solid #e5e7eb; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
    .med-table td { border-bottom: 1px solid #f3f4f6; padding: 12px 10px; font-size: 13px; }
    .signature-area { margin-top: 50px; border-top: 1px dashed #d1d5db; padding-top: 20px; text-align: right; }
    .sig-label { font-size: 11px; color: #9ca3af; }
    .sig-value { font-family: 'Courier New', monospace; font-size: 12px; color: #059669; font-weight: bold; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hospital-title">✙ CAREFLOW SPECIALTY CLINICAL CENTER</div>
    <div class="hospital-sub">EHR Digital Prescription & Secure Auth Module</div>
    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">410 Hospital Boulevard, Sector 4 | Lic: #REG-HIPAA-2026-X9</div>
  </div>

  <div class="meta-box">
    <div class="grid">
      <div>
        <div class="barcode">|||| | ||| | || ||| || ||| | |||</div>
        <div class="field">
          <span class="label">Prescription Token ID</span>
          <span class="value">RX-2026-${selectedPatient.id}-7792</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #6b7280;">Date-Time: ${dateString}</div>
        <div class="field" style="margin-top: 10px;">
          <span class="label">Prescribing Physician</span>
          <span class="value">Dr. Alexander Sterling, MD (#EMP-DOCT12)</span>
        </div>
      </div>
    </div>
  </div>

  <div class="meta-box" style="background: #ffffff; border-color: #9ca3af;">
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #0f766e; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
      Patient Demographics & Encounter Vitals Summary
    </div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
      <div class="field">
        <span class="label">Patient Name</span>
        <span class="value" style="font-size: 15px; color: #111827;">${selectedPatient.name}</span>
      </div>
      <div class="field">
        <span class="label">Registry ID</span>
        <span class="value" style="font-family: monospace;">${selectedPatient.id}</span>
      </div>
      <div class="field">
        <span class="label">DOB & Age</span>
        <span class="value">${selectedPatient.dob} (${selectedPatient.age} yr)</span>
      </div>
      <div class="field">
        <span class="label">Gender</span>
        <span class="value">${selectedPatient.gender}</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f3f4f6; padding: 10px; border-radius: 6px;">
      <div class="field">
        <span class="label">Encounter Blood Pressure</span>
        <span class="value">${selectedPatient.triageVitals ? `${selectedPatient.triageVitals.systolic}/${selectedPatient.triageVitals.diastolic} mmHg` : '120/80 mmHg (Estimated)'}</span>
      </div>
      <div class="field">
        <span class="label">Heart Rate</span>
        <span class="value">${selectedPatient.triageVitals ? `${selectedPatient.triageVitals.heartRate} bpm` : '72 bpm'}</span>
      </div>
      <div class="field">
        <span class="label">Body Temp</span>
        <span class="value">${selectedPatient.triageVitals ? `${selectedPatient.triageVitals.temperatureCelcius} °C` : '37.0 °C'}</span>
      </div>
      <div class="field">
        <span class="label">Patient Weight</span>
        <span class="value">${selectedPatient.triageVitals ? `${selectedPatient.triageVitals.weightKg} kg` : '74 kg'}</span>
      </div>
    </div>
  </div>

  <div class="rx-symbol">℞</div>

  <table class="med-table">
    <thead>
      <tr>
        <th style="width: 10%;">#</th>
        <th style="width: 45%;">Formulation Catalog Product</th>
        <th style="width: 35%;">Directions / Dosage Regimen</th>
        <th style="width: 10%; text-align: right;">Disp Qty</th>
      </tr>
    </thead>
    <tbody>
      ${prescriptionItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>
            <div style="font-weight: bold; color: #111827;">${item.name}</div>
            <div style="font-size: 10px; font-family: monospace; color: #6b7280;">Code: ${item.code}</div>
          </td>
          <td style="font-style: italic; color: #374151;">${item.dosage}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">${item.qty} units</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="signature-area">
    <div class="sig-value">Digitally Signed & Certified via Security Key Token (HS256)</div>
    <div class="sig-label">Authenticated Clinician Electronic Signature Badge</div>
    <div style="font-size: 10px; color: #9ca3af; margin-top: 5px;">CareFlow EHR Cloud Ingress Registry • Verification: SEC_HL7_VERIFIED</div>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Prescription_PDF_${patientNameSafe}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Selector sidebar column */}
      <div className="lg:col-span-4 bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs flex flex-col h-full min-h-[400px]">
        <h3 className="font-sans font-semibold text-neutral-800 text-sm mb-1 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-teal-600" /> Department Integration Hub
        </h3>
        <p className="text-xs text-neutral-400 mb-4 leading-tight">
          Select a patient profile to inspect downstream Laboratory, Radiology, Pharmacy, and Financial Checkout flows.
        </p>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {patients.map((p) => {
            const billTotal = p.billingLedger.reduce((sum, item) => sum + item.amount, 0);
            const unpaidCount = p.billingLedger.filter((item) => item.status !== "Paid").length;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                  selectedPatientId === p.id
                    ? "bg-teal-50 border-teal-200 text-teal-900"
                    : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 text-neutral-605"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-xs block text-neutral-800">{p.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tight block mt-0.5">
                      Clinic: {p.clinic} • State: <strong className="text-teal-700">{p.status}</strong>
                    </span>
                  </div>
                  {unpaidCount > 0 ? (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-mono px-1.5 rounded font-bold">
                      ${billTotal} Pending
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono px-1.5 rounded font-bold flex items-center gap-0.5">
                      ✓ Cleared
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Department Modules area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {selectedPatient ? (
          <>
            {/* Split row for Lab & Radiology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Module 1: Diagnostic Laboratory */}
              <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold text-teal-600 block tracking-wider uppercase">
                  🧪 Ancillary Module A: Diagnostic Lab Desk
                </span>
                <span className="font-sans font-semibold text-sm text-neutral-850 block">Ordered Patient Bio-panels</span>
                
                <div className="border border-neutral-100 rounded-lg p-3 bg-neutral-50/50 space-y-2">
                  <div className="flex justify-between items-center pr-1 text-xs">
                    <span className="font-medium text-neutral-700">Fasting Blood Sugar (FBS)</span>
                    <span className="text-amber-600 font-mono text-[10px] bg-amber-50 px-1.5 rounded font-medium">Pending Sample</span>
                  </div>
                  <div className="flex justify-between items-center pr-1 text-xs">
                    <span className="font-medium text-neutral-700">HbA1c levels</span>
                    <span className="text-neutral-400 font-mono text-[10px] bg-neutral-100 px-1.5 rounded">Awaiting Triage Verification</span>
                  </div>
                  <div className="flex justify-between items-center pr-1 text-xs">
                    <span className="font-medium text-neutral-700">Urinalysis Panel</span>
                    <span className="text-emerald-600 font-mono text-[10px] bg-emerald-50 px-1.5 rounded font-semibold">✓ Completed</span>
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Laboratory specimens registered for ${selectedPatient.name}. Auto-mapping dispatched to main PostgreSQL clusters.`)}
                    className="w-full py-1.5 bg-neutral-900 text-white rounded text-tiny font-mono uppercase font-bold"
                  >
                    Dispatch Lab Specimen Pull
                  </button>
                </div>
              </div>

              {/* Module 2: Radiology & Digital Imaging */}
              <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold text-teal-600 block tracking-wider uppercase">
                  🩻 Ancillary Module B: Neuro-Radiology PACS
                </span>
                <span className="font-sans font-semibold text-sm text-neutral-850 block">X-Ray & High-Res Cranial CT</span>

                <div className="border border-dashed border-neutral-200 rounded-lg h-24 flex flex-col items-center justify-center p-2 text-center bg-neutral-950 text-white relative overflow-hidden">
                  {activeScanId ? (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-emerald-400">PAT_ORBIT_AXIAL_102.DICOM</div>
                      <div className="flex justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400">Interactive SLICES LOADED</span>
                      </div>
                      <span className="text-[9px] block text-neutral-300">Orbit/Globe Structure: Intact</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Image className="w-7 h-7 text-neutral-500 mx-auto animate-pulse" />
                      <span className="text-neutral-400 text-tiny block">Awaiting Imaging Order...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveScanId(selectedPatient.id)}
                    className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-tiny font-semibold"
                  >
                    Pull Dicom PACS Proof Scan
                  </button>
                </div>
              </div>
            </div>

            {/* Module 3: Active Chemical Pharmacy Stock Register */}
            <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-600 block tracking-wider uppercase">
                    💊 Ancillary Module C: Main Pharmacy & Diagnostic Rx Dispatcher
                  </span>
                  <span className="font-sans font-semibold text-sm text-neutral-850 block">Authorized RxNorm Active Stock Sheets & Custom Formulation Builder</span>
                </div>
                <div className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  Clinical Drug-Drug Overrides active
                </div>
              </div>

              {/* Master-Detail Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Left Side: Pharmaceutical Catalog Sheets */}
                <div className="xl:col-span-7 space-y-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Available Clinic Formulations ({pharmacyStocks.length})
                  </span>
                  <div className="border border-neutral-154 dark:border-[#1e2335] rounded-xl overflow-hidden bg-[var(--clr-bg-card)]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-neutral-150 text-neutral-500 font-mono text-[10px]">
                          <th className="p-3 font-medium">Catalog Code</th>
                          <th className="p-3 font-medium">Pharmaceutical Formulation / Unit</th>
                          <th className="p-3 font-medium text-right">Inventory</th>
                          <th className="p-3 font-medium text-center">Registrar Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-[var(--clr-bg-card)]">
                        {pharmacyStocks.map((drug) => (
                          <tr key={drug.code} className={drug.isChemical ? "hover:bg-neutral-50/40" : "bg-neutral-50/30 hover:bg-neutral-50/50"}>
                            <td className="p-3 font-mono text-[10px] text-neutral-500">{drug.code}</td>
                            <td className="p-3">
                              <span className="font-semibold text-neutral-800 block text-tiny leading-normal">{drug.name}</span>
                              <span className="text-[9px] font-mono text-neutral-400 block">{drug.drugClass}</span>
                            </td>
                            <td className="p-3 text-right font-bold text-neutral-700 whitespace-nowrap">{drug.stock} pcs</td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDispenseStock(drug.code, 30)}
                                  className="bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-[9px] px-2 py-1 rounded"
                                  title="Deduct 30 items directly from stock registry"
                                >
                                  Deduct 30
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddToRxDraft(drug)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white font-mono text-[9px] px-2 py-1 rounded flex items-center gap-0.5"
                                  title="Add formulation to patient script draft"
                                >
                                  <Plus className="w-2.5 h-2.5" /> Draft Rx
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Active Patient Prescription Workspace */}
                <div className="xl:col-span-5 bg-neutral-50/50 border border-neutral-154 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-200/50">
                      <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider">
                        Patient Prescription Draft
                      </span>
                      <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        For: {selectedPatient.name}
                      </span>
                    </div>

                    {prescriptionItems.length > 0 ? (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {prescriptionItems.map((item) => (
                          <div key={item.code} className="bg-[var(--clr-bg-card)] dark:bg-[#1A1E2E] p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2.5 shadow-xs transition duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-xs text-neutral-800 leading-tight block">{item.name}</span>
                                <span className="text-[9.5px] font-mono text-neutral-400 block mt-0.5">{item.code}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftItem(item.code)}
                                className="text-neutral-300 hover:text-rose-600 transition p-0.5"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-12 gap-2 pt-2 border-t border-neutral-110/50">
                              <div className="col-span-8">
                                <label className="text-[9px] font-mono text-neutral-400 block font-semibold mb-0.5">Directions & Dosage</label>
                                <input
                                  type="text"
                                  className="w-full p-1 border border-neutral-200 rounded text-[11px] focus:outline-teal-500 font-medium text-neutral-800"
                                  value={item.dosage}
                                  onChange={(e) => handleUpdateDosage(item.code, e.target.value)}
                                  placeholder="Example: 1 tab daily with meals"
                                />
                              </div>
                              <div className="col-span-4">
                                <label className="text-[9px] font-mono text-neutral-400 block font-semibold mb-0.5">Dispense Qty</label>
                                <input
                                  type="number"
                                  className="w-full p-1 border border-neutral-200 rounded text-[11px] focus:outline-teal-500 font-bold text-neutral-800 text-right font-mono"
                                  value={item.qty}
                                  onChange={(e) => handleUpdateQty(item.code, Math.max(1, parseInt(e.target.value) || 1))}
                                  min={1}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-neutral-450 dark:text-neutral-500 italic text-xs bg-[#E5DFCE]/10 dark:bg-neutral-900/40 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl flex flex-col items-center justify-center px-4 space-y-1">
                        <span>No medications added to active Rx draft.</span>
                        <span className="text-[10px] text-neutral-400 not-italic">Click "+ Draft Rx" on any catalog item on the left to add.</span>
                      </div>
                    )}
                  </div>
                  
                  {prescriptionItems.length > 0 && (
                    <div className="pt-3 border-t border-neutral-200/50 mt-4 flex flex-col gap-2">
                      <div className="p-2 bg-teal-50 border border-teal-100 rounded-lg text-[10px] text-teal-800 leading-normal mb-1">
                        <strong>Clinical Gatekeeper Check:</strong> This prescription is validated and ready for printing or direct central cloud sync.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPrescriptionModal(true);
                          setPdfSuccess(false);
                          setPdfRendering(false);
                        }}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <FileText className="w-4 h-4 text-teal-400 animate-pulse" />
                        Generate PDF Prescription
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Module 4: Central Accounts Cashier Desk */}
            <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-mono font-bold text-teal-600 block tracking-wider uppercase">
                💵 Ancillary Module D: Central Billing & Financial Cashier
              </span>
              <div className="flex justify-between items-center">
                <span className="font-sans font-semibold text-sm text-neutral-850 block">Itemized Ledger & Coverage Audit</span>
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono">
                  Checking Invoice profile: {selectedPatient.name}
                </span>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 space-y-3">
                <div className="divide-y divide-neutral-200/60 font-mono text-xs">
                  {selectedPatient.billingLedger.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center text-neutral-650">
                      <div>
                        <div className="font-semibold text-neutral-800">{item.serviceName}</div>
                        <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Category: {item.category} • ID: {item.id}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-neutral-800">${item.amount}.00</span>
                        {item.status === "Paid" ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Paid</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePayBillItem(item.id)}
                            className="text-tiny bg-teal-600 hover:bg-teal-700 text-white font-bold px-2 py-0.5 rounded uppercase"
                          >
                            Clear Claim (Pay)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedPatient.billingLedger.length === 0 && (
                    <div className="text-center py-4 text-neutral-400 italic">No invoice items logged.</div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-neutral-500 font-bold block">TOTAL OUTSTANDING CHARGES</span>
                    <span className="text-lg font-bold font-mono text-neutral-800">
                      ${selectedPatient.billingLedger.reduce((sum, item) => sum + item.amount, 0)}.00
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDischargePatient}
                    className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-850 rounded-lg text-xs font-semibold"
                  >
                    Final Verification & Discharge Files
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl shadow-xs text-neutral-500 dark:text-neutral-400 transition">
            Select a patient on the left column to run Ancillary department simulations.
          </div>
        )}
      </div>

      {/* Dynamic PDF Prescription Simulated Printable Document Modal Overlay */}
      {showPrescriptionModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Non-printable action bar */}
            <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-[9px] md:text-xs font-bold text-neutral-350 tracking-wider uppercase">
                  SECURE RX TRANSACTION PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPrescription}
                  disabled={pdfRendering}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-emerald-400 font-semibold text-[10px] md:text-xs rounded-lg flex items-center gap-1 transition disabled:opacity-50"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  {pdfRendering ? "Compiling PDF..." : pdfSuccess ? "Downloaded!" : "Save PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[10px] md:text-xs rounded-lg flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-neutral-400 hover:text-white transition p-1 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Rendering Feedback Toast */}
            {pdfRendering && (
              <div className="bg-emerald-950 text-emerald-100 px-6 py-2 text-tiny font-mono flex items-center gap-2 animate-pulse shrink-0">
                <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                <span>Generating high-fidelity medical file... Signing hash token claims with HS256 algorithm...</span>
              </div>
            )}
            {pdfSuccess && (
              <div className="bg-emerald-50 text-emerald-850 border-b border-emerald-100 px-6 py-2 text-xs font-sans font-medium flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Prescription document compiled and downloaded as complete stand-alone printable EHR HTML template.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfSuccess(false)}
                  className="text-emerald-600 font-bold underline hover:text-emerald-700 text-tiny"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Printable layout body */}
            <div id="printable-prescription-page" className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 select-text bg-white">
              
              {/* Logo & Corporate Hospital Branding */}
              <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-teal-600 rounded flex items-center justify-center text-white font-black text-xs">
                      +
                    </div>
                    <span className="font-sans font-black tracking-wide text-sm md:text-base text-neutral-900">
                      CAREFLOW SPECIALTY CLINICS
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-mono tracking-wider block mt-1">
                    INTEGRATED HL7-FHIR ELECTRONIC HEALTH RECORD PLATFORM
                  </span>
                  <span className="text-[11px] text-neutral-500 block leading-normal mt-1 max-w-sm">
                    410 Hospital Boulevard, Sector 4, Clinicia MD <br />
                    Lic: <strong className="text-neutral-700">#REG-HIPAA-2026-X9</strong> | Tel: +1 (555) 019-2830
                  </span>
                </div>

                <div className="text-right font-mono">
                  {/* barcode art */}
                  <div className="text-neutral-900 font-bold select-none leading-none tracking-widest text-xs md:text-sm opacity-85">
                    |||| | ||| | || ||| || ||| | |||
                  </div>
                  <span className="text-[8px] text-neutral-400 block mt-1">PRESCRIPTION TOKEN ID</span>
                  <span className="text-[11px] font-bold text-neutral-800">
                    RX-2026-{selectedPatient.id}-7792
                  </span>
                  <span className="text-[8px] text-neutral-400 block mt-1">GENERATED TIMESTAMP</span>
                  <span className="text-[11px] text-neutral-505">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Diagnosis Doctor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase block tracking-wider">
                    Prescribing Clinician Registry
                  </span>
                  <div className="font-bold text-neutral-800 text-xs">Dr. Alexander Sterling, MD</div>
                  <div className="text-neutral-500 text-tiny">Specialist Chief of Ophthalmology Services</div>
                  <div className="text-[9px] font-mono text-neutral-450 mt-1">
                    License ID: <strong className="text-emerald-700">#EMP-DOCT12</strong> • Dept Room: 412
                  </div>
                </div>

                <div className="space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase block tracking-wider">
                    EHR Cloud Sync Status
                  </span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SECURE DIRECT-SYNC
                  </div>
                  <div className="text-neutral-505 text-tiny">Reconciled with central Spring Boot Database</div>
                  <div className="text-[9px] font-mono text-neutral-450 mt-1">
                    Registry Code: <strong className="text-neutral-700">HL7_RXNorm_v35</strong>
                  </div>
                </div>
              </div>

              {/* Patient Core Demographics & Triage integration */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-900 text-white px-3 py-1.5 font-mono text-[9px] uppercase font-bold tracking-wider flex justify-between items-center">
                  <span>Patient Profile & Encounter Diagnostics</span>
                  <span className="text-teal-400 font-extrabold bg-teal-950/40 px-1.5 py-0.5 rounded text-[8px]">
                    ENCOUNTER SUMMARY
                  </span>
                </div>
                
                <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-b border-neutral-150">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tight block">Patient Name</span>
                    <span className="font-bold text-neutral-800">{selectedPatient.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tight block">Registry DOB</span>
                    <span className="font-medium text-neutral-600">{selectedPatient.dob}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tight block">Computed Age & Gender</span>
                    <span className="font-medium text-neutral-600">{selectedPatient.age} years • {selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tight block">Encounter Clinic Ref</span>
                    <span className="font-bold text-teal-700 font-mono text-[10px]">{selectedPatient.clinic}</span>
                  </div>
                </div>

                {/* Vitals breakdown */}
                <div className="bg-neutral-50/50 p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[8px] font-mono text-neutral-400 uppercase block">Encounter Blood Pressure</span>
                    <span className="font-bold text-neutral-800 font-mono">
                      {selectedPatient.triageVitals
                        ? `${selectedPatient.triageVitals.systolic}/${selectedPatient.triageVitals.diastolic} mmHg`
                        : "120/80 mmHg (Estimated)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-400 uppercase block">Triage Heart Rate</span>
                    <span className="font-bold text-neutral-800 font-mono">
                      {selectedPatient.triageVitals ? `${selectedPatient.triageVitals.heartRate} bpm` : "72 bpm"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-400 uppercase block">Body Temperature</span>
                    <span className="font-bold text-neutral-800 font-mono">
                      {selectedPatient.triageVitals ? `${selectedPatient.triageVitals.temperatureCelcius} °C` : "37.0 °C"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-400 uppercase block">Recorded Body Weight</span>
                    <span className="font-bold text-neutral-800 font-mono">
                      {selectedPatient.triageVitals ? `${selectedPatient.triageVitals.weightKg} kg` : "74 kg"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Serif RX Icon symbol */}
              <div className="font-serif italic text-3xl text-teal-700 leading-none select-none font-medium">
                ℞
              </div>

              {/* Core Active Prescribed Items list */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-2.5 font-medium text-center" style={{ width: "8%" }}>#</th>
                      <th className="p-2.5 font-medium" style={{ width: "42%" }}>Product Formulation Name / Unit</th>
                      <th className="p-2.5 font-medium" style={{ width: "38%" }}>EHR Dosage & Regimen Directions</th>
                      <th className="p-2.5 font-medium text-right" style={{ width: "12%" }}>Disp Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150 bg-white">
                    {prescriptionItems.map((item, index) => (
                      <tr key={item.code} className="hover:bg-neutral-50/25">
                        <td className="p-2.5 text-center font-mono font-bold text-neutral-400">{index + 1}</td>
                        <td className="p-2.5">
                          <span className="font-extrabold text-neutral-850 block">{item.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase block">{item.code}</span>
                        </td>
                        <td className="p-2.5 font-sans font-medium text-neutral-600 bg-teal-50/10 italic text-[11px]">
                          "{item.dosage}"
                        </td>
                        <td className="p-2.5 text-right font-bold text-neutral-800 font-mono bg-neutral-50/10 whitespace-nowrap">
                          {item.qty} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Doctor Electronic Signature Authorization */}
              <div className="pt-4 border-t border-dashed border-neutral-300 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div className="space-y-1 max-w-sm">
                  <div className="text-[8px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                    Presbytery Authenticity Notice
                  </div>
                  <p className="text-[9px] text-neutral-500 leading-normal">
                    This document serves as an electronic verification of treatment directives. Medications dispensed must be tracked inside central hospital drug registries under strict HIPAA guidelines. Clinicians can authorize reprints via physical terminal keys.
                  </p>
                </div>

                <div className="text-right space-y-1 col-span-1 shrink-0">
                  <div className="font-mono text-[9px] text-emerald-600 font-bold tracking-tight">
                    Signed Electronically: Dr. Alexander Sterling
                  </div>
                  <div className="text-[8px] text-neutral-400 block uppercase font-mono tracking-wider">
                    Clinician Electronic Seal Authorization Badge
                  </div>
                  <div className="text-[8px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded inline-block font-mono">
                    Token Key: {selectedPatient.id}-HS256-JWT-SEC_VAL
                  </div>
                </div>
              </div>

            </div>
            
            {/* Non-printable modal footer controls */}
            <div className="bg-neutral-50 px-6 py-3.5 flex items-center justify-end gap-3 shrink-0 border-t border-neutral-100">
              <span className="text-[9px] text-neutral-450 font-mono mr-auto">
                CareFlow Hospital Management Suite v5.8.5
              </span>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-250 text-neutral-700 font-semibold text-xs rounded-lg transition"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleDownloadPrescription}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-xs rounded-lg transition"
              >
                Download Compiled HTML-PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
