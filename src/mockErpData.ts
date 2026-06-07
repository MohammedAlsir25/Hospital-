/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PharmacyMeds {
  id: string;
  name: string;
  catalogCode: string;
  drugClass: string;
  isChemical: boolean;
  stock: number;
  unit: string;
  pricePerUnit: number;
}

export interface WarehouseProduct {
  sku: string;
  productName: string;
  supplier: string;
  batchNum: string;
  expiryDate: string;
  onHandQty: number;
  criticalMin: number;
  status: "Optimized" | "Warning" | "ExpiringSoon" | "Deficient";
}

export interface OpticsProduct {
  id: string;
  brand: string;
  model: string;
  frameStyle: string;
  material: string;
  lensType: string;
  showroomStock: number;
  price: number;
}

export interface TransactionJournal {
  id: string;
  timestamp: string;
  narrative: string;
  category: "Revenue" | "Expenditure" | "InsuranceClaim" | "Payroll";
  debit: number;
  credit: number;
  wallet: "Main Safe" | "Standard Chartered Bank" | "Insurance Receivables" | "Petty Cash";
  verifiedBy: string;
}

export const INITIAL_PHARMACY_STOCK: PharmacyMeds[] = [
  { id: "PH-001", name: "Latanoprost 0.005% Eye Drops", catalogCode: "RX-LAT-005", drugClass: "Prostaglandin Analog", isChemical: true, stock: 120, unit: "bottle", pricePerUnit: 18.5 },
  { id: "PH-002", name: "Timolol Maleate 0.5% Drops", catalogCode: "RX-TIM-050", drugClass: "Beta-Blocker", isChemical: true, stock: 95, unit: "bottle", pricePerUnit: 14.0 },
  { id: "PH-003", name: "Brimonidine Tartrate 0.15%", catalogCode: "RX-BRI-015", drugClass: "Alpha-2 Agonist", isChemical: true, stock: 68, unit: "bottle", pricePerUnit: 22.0 },
  { id: "PH-004", name: "Prednisolone Acetate 1% Drops", catalogCode: "RX-PRE-100", drugClass: "Corticosteroid", isChemical: true, stock: 140, unit: "bottle", pricePerUnit: 25.0 },
  { id: "PH-005", name: "Moxifloxacin HCl 0.5% Drops", catalogCode: "RX-MOX-050", drugClass: "Fluoroquinolone Antibiotic", isChemical: true, stock: 180, unit: "bottle", pricePerUnit: 28.5 },
  { id: "PH-006", name: "Cyclopentolate Drops 1.0%", catalogCode: "RX-CYC-010", drugClass: "Mydriatic / Cycloplegic", isChemical: true, stock: 45, unit: "bottle", pricePerUnit: 16.0 },
  { id: "PH-007", name: "Carboxymethylcellulose 0.5%", catalogCode: "RX-CMC-050", drugClass: "Lubricant Artificial Tears", isChemical: false, stock: 350, unit: "unit-vial", pricePerUnit: 12.5 },
  { id: "PH-008", name: "Ciprofloxacin Tablets 500mg", catalogCode: "RX-CIP-500", drugClass: "Fluoroquinolone Systemic", isChemical: false, stock: 240, unit: "pill-box", pricePerUnit: 35.0 },
  { id: "PH-009", name: "Doxycycline Monohydrate 100mg", catalogCode: "RX-DOX-100", drugClass: "Tetracycline Systemic", isChemical: false, stock: 110, unit: "pill-box", pricePerUnit: 19.0 },
  { id: "PH-010", name: "Metformin HCl ER 500mg", catalogCode: "RX-MET-500", drugClass: "Biguanide Oral Systemic", isChemical: false, stock: 500, unit: "pill-box", pricePerUnit: 8.5 }
];

export const INITIAL_WAREHOUSE_PRODUCTS: WarehouseProduct[] = [
  { sku: "SKU-OPT-901", productName: "Goldmann Tonometer Prisms (Disposable)", supplier: "Haag-Streit Clinical Corp", batchNum: "BCH-2026-6671", expiryDate: "2029-12-01", onHandQty: 450, criticalMin: 100, status: "Optimized" },
  { sku: "SKU-MED-802", productName: "Sterile Single-Use Intraocular Syringes", supplier: "Becton-Dickinson Med", batchNum: "BCH-2026-9022", expiryDate: "2028-04-15", onHandQty: 800, criticalMin: 200, status: "Optimized" },
  { sku: "SKU-PH-109", productName: "Latanoprost 0.005% Solution Concentrate", supplier: "Pfizer Specialty Pharma", batchNum: "BCH-LAT-5512", expiryDate: "2026-08-30", onHandQty: 45, criticalMin: 50, status: "ExpiringSoon" },
  { sku: "SKU-PH-202", productName: "Timolol Maleate Active API Compound (Cryo)", supplier: "Sigma-Aldrich Labs", batchNum: "BCH-TIM-1120", expiryDate: "2027-11-20", onHandQty: 15, criticalMin: 30, status: "Warning" },
  { sku: "SKU-ORB-303", productName: "Orbital Titanium Reconstruction Mesh Plates", supplier: "Stryker Craniofacial", batchNum: "BCH-STR-7622", expiryDate: "2035-03-10", onHandQty: 18, criticalMin: 10, status: "Optimized" },
  { sku: "SKU-OPT-404", productName: "High-Index Glass Refractive Lenses blank (1.61)", supplier: "Hoya Optics JP", batchNum: "BCH-HOY-8812", expiryDate: "2031-01-01", onHandQty: 120, criticalMin: 50, status: "Optimized" },
  { sku: "SKU-DIS-505", productName: "Sterile Ophthalmic Patient Drapes (Trauma Pack)", supplier: "3M Healthcare Division", batchNum: "BCH-3M-4420", expiryDate: "2026-07-22", onHandQty: 8, criticalMin: 40, status: "Deficient" }
];

export const INITIAL_OPTICS_PRODUCTS: OpticsProduct[] = [
  { id: "OPT-001", brand: "Ray-Ban", model: "Aviator Classic Gold", frameStyle: "Full Rim Metal", material: "Monel Alloy", lensType: "Polarized G-15", showroomStock: 14, price: 165 },
  { id: "OPT-002", brand: "Oakley", model: "Flak 2.0 XL Sport", frameStyle: "Half Rim Wrap", material: "O-Matter Polymer", lensType: "Prizm Field", showroomStock: 8, price: 185 },
  { id: "OPT-003", brand: "Prada", model: "Sartorial Minimalist Black", frameStyle: "Full Rim Rectangle", material: "Acetate Sheet", lensType: "Anti-Reflective Hydrophobic", showroomStock: 9, price: 295 },
  { id: "OPT-004", brand: "Persol", model: "Steve McQueen Series", frameStyle: "Full Rim Folding", material: "Natural Mazuchelli", lensType: "Crystal Green", showroomStock: 4, price: 340 },
  { id: "OPT-005", brand: "Silhouette", model: "Titan Minimal Art Accent", frameStyle: "Rimless Light", material: "B-Titanium", lensType: "Progressive BlueCut", showroomStock: 18, price: 380 },
  { id: "OPT-006", brand: "Tom Ford", model: "Blue Block FT5505", frameStyle: "Full Rim Aviator", material: "Cellulose Acetate", lensType: "Standard Blue Control", showroomStock: 12, price: 260 }
];

export const INITIAL_LEDGER: TransactionJournal[] = [
  { id: "JE-9081", timestamp: "18:30:12", narrative: "Optical Spectacles Sale - Persol (Cash)", category: "Revenue", debit: 340, credit: 0, wallet: "Main Safe", verifiedBy: "Cashier Ebenezer" },
  { id: "JE-9082", timestamp: "18:35:45", narrative: "Patient Co-Pay Consultation Fee (PAT-001)", category: "Revenue", debit: 40, credit: 0, wallet: "Main Safe", verifiedBy: "Receptionist Mildred" },
  { id: "JE-9083", timestamp: "18:40:00", narrative: "Procured Haq-Streit Calibration Kits (Inv. #772)", category: "Expenditure", debit: 0, credit: 1200, wallet: "Standard Chartered Bank", verifiedBy: "Director Alexander" },
  { id: "JE-9084", timestamp: "18:42:15", narrative: "Triage Vitals Check Claim Submission (AXA Patient #002)", category: "InsuranceClaim", debit: 15, credit: 0, wallet: "Insurance Receivables", verifiedBy: "Nurse Beatrice" },
  { id: "JE-9085", timestamp: "18:48:30", narrative: "Ancillary Outpatient Rx Dispensed - Moxifloxacin", category: "Revenue", debit: 28.5, credit: 0, wallet: "Petty Cash", verifiedBy: "Pharmacist Vance" },
  { id: "JE-9086", timestamp: "18:50:00", narrative: "Glaucoma Surgical Tray Refurbishment Fee", category: "Expenditure", debit: 0, credit: 150, wallet: "Petty Cash", verifiedBy: "Cashier Ebenezer" }
];
