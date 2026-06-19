export interface PharmacyMeds {
  id: string;
  name: string;
  catalogCode: string;
  drugClass: string;
  isChemical: boolean;
  stock: number;
  unit: string;
  pricePerUnit: number;
  category: "Medicine" | "Personal Care" | "Beauty & Cosmetics" | "Baby Care" | "First Aid & OTC" | "Supplements" | "Medical Devices";
  costPrice: number;
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
  debitAccountCode?: string;
  creditAccountCode?: string;
  costCenter?: "HOSPITAL" | "PHARMACY" | "WAREHOUSE" | "OPTICS" | "EMPLOYEES";
}

export const INITIAL_PHARMACY_STOCK: PharmacyMeds[] = [];

export const INITIAL_OPTICS_PRODUCTS: OpticsProduct[] = [];

export const INITIAL_LEDGER: TransactionJournal[] = [];
