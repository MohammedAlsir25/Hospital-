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

// Clear mock arrays to set up E2E REST/WebSocket blank slate
export const INITIAL_PHARMACY_STOCK: PharmacyMeds[] = [];
export const INITIAL_WAREHOUSE_PRODUCTS: WarehouseProduct[] = [];
export const INITIAL_OPTICS_PRODUCTS: OpticsProduct[] = [];
export const INITIAL_LEDGER: TransactionJournal[] = [];
