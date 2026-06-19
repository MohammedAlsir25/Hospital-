export type CostCenter = "HOSPITAL" | "PHARMACY" | "WAREHOUSE" | "OPTICS" | "EMPLOYEES";
export type JournalCategory = "Revenue" | "Expenditure" | "InsuranceClaim" | "Payroll";
export type WalletType = "Main Safe" | "Standard Chartered Bank" | "Insurance Receivables" | "Petty Cash";
export type AccountCategory = "Assets" | "Liabilities" | "Equity" | "Revenue" | "Expenses";
export type AccountingTab = "dashboard" | "coa" | "ledger" | "journal" | "reports";
export type ReportTab = "trial-balance" | "income-statement" | "balance-sheet";

export interface Account {
  code: string;
  name: string;
  nameAr: string;
  category: AccountCategory;
  balance: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  narrative: string;
  category: JournalCategory;
  debit: number;
  credit: number;
  wallet: WalletType;
  verifiedBy: string;
  debitAccountCode?: string;
  creditAccountCode?: string;
  costCenter?: CostCenter;
}

export interface PatientInvoice {
  id: string;
  patientId: string;
  patientName: string;
  insuranceProvider: string;
  billingSource: string;
  physicianName: string;
  physicianId: string;
  encounterId: string;
  icdCode: string;
  items: { serviceName: string; category: string; amount: number; unitPrice: number }[];
  commissionPercentage: number;
  totalAmount: number;
  patientCoPayPayable: number;
  insuranceClaimPayable: number;
  status: string;
  selectedPaymentMethod?: string;
  patientPaidAmount: number;
  claimCode?: string;
  dateCreated: string;
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  provider: string;
  icdCode: string;
  claimAmount: number;
  billingSource: string;
  dateSubmitted: string;
  status: "Ready for Clearinghouse" | "Submitted" | "Settled";
}

export interface VendorBill {
  id: string;
  supplier: string;
  poReference: string;
  invoiceSum: number;
  purchaseQty: number;
  warehouseReceived: number;
  verificationMatch: string;
  disbursementDue: string;
}

export interface DepreciableAsset {
  id: string;
  description: string;
  department: string;
  originalCost: number;
  salvageValue: number;
  usefulLifeMonths: number;
  accumulatedDepreciation: number;
}

export interface AutomationLog {
  id: string;
  originModule: string;
  trigger: string;
  narrative: string;
  timestamp: string;
  ledgerEntryCreated: string;
}

export const SEED_CHART_OF_ACCOUNTS: Account[] = [
  { code: "ACC-1110-CASH", name: "Cash At Drawer - Reception", nameAr: "الصندوق - الاستقبال الرئيسي", category: "Assets", balance: 0, description: "Physical cash in reception drawer for direct clinical co-pays." },
  { code: "ACC-1120-BANK", name: "Standard Chartered Operating Bank", nameAr: "بنك ستاندرد تشارترد - التشغيلي", category: "Assets", balance: 0, description: "Main institutional bank account for digital billing and bank transfers." },
  { code: "ACC-1210-PHARM-INV", name: "Ophthalmic Drug Stock Assets", nameAr: "مخزون الأدوية والمستحضرات", category: "Assets", balance: 0, description: "Valued assets of pharmacy eye drops, tablet boxes, and medications." },
  { code: "ACC-1220-OPTIC-INV", name: "Optical Frame & Lens Inventory Assets", nameAr: "مخزون رعاية العيون والنظارات", category: "Assets", balance: 0, description: "Capital valuation of showroom frame fashion lines and custom laser lens blanks." },
  { code: "ACC-1130-AR", name: "Patient Outstanding co-pays (AR)", nameAr: "حسابات مديني المرضى", category: "Assets", balance: 0, description: "Accounts receivable from open patient co-pay checkouts." },
  { code: "ACC-1140-AR-INSUR", name: "Third-Party Insurance Outstanding Claims", nameAr: "ذمم شركات التأمين الصحي", category: "Assets", balance: 0, description: "Outstanding receivables from medical insurance clearinghouses." },
  { code: "ACC-2110-AP", name: "Certified Vendor Payables (AP)", nameAr: "ذمم حسابات الموردين والدائنين", category: "Liabilities", balance: 0, description: "Accrued obligations owed to medical supply distributors." },
  { code: "ACC-2120-COMM-ACCRUED", name: "Accrued Physician Bonus Commissions", nameAr: "عمولات الأطباء والاستشاريين المستحقة", category: "Liabilities", balance: 0, description: "Unpaid commission percentages due to operating surgeons." },
  { code: "ACC-1510-MACH-OCT", name: "Capital Ophthalmic Laser Hardware", nameAr: "أصول آلات وأجهزة الليزر والعيون", category: "Assets", balance: 0, description: "Acquisition value of top-tier 3D OCT, lasers, and operating microscopes." },
  { code: "ACC-1590-ACCUM-DEPR", name: "Accumulated Depreciation - Equipment", nameAr: "مجمع إهلاك الآلات والمعدات الطبية", category: "Assets", balance: 0, description: "Aggregated monthly wear-and-tear value offsets on clinical machinery." },
  { code: "ACC-3110-EQUITY", name: "Retained Earnings & Reserves", nameAr: "الأرباح المبقاة والاحتياطيات", category: "Equity", balance: 0, description: "Aggregated retained earnings of Al Jawarih Eye Hospital." },
  { code: "ACC-4100-REV-CONSULT", name: "Clinical Consultation Revenues", nameAr: "إيرادات الكشف والتشخيص الطبي", category: "Revenue", balance: 0, description: "Clinical outpatient service invoice collections." },
  { code: "ACC-4200-REV-SURGERY", name: "Surgical Theater Facility Revenue", nameAr: "إيرادات العمليات الجراحية وغرفة العمليات", category: "Revenue", balance: 0, description: "Fees logged from cataracts, strabismus repairs, and orbital trauma surgeries." },
  { code: "ACC-4300-REV-PHARM", name: "Glaucoma & Rx Dispensary Revenues", nameAr: "إيرادات صيدلية المجمع", category: "Revenue", balance: 0, description: "Operational inflows from prescription medicine discharges." },
  { code: "ACC-4400-REV-OPTICAL", name: "Optical POS Frame & Fabrications Revenue", nameAr: "إيرادات معرض البصريات وتركيب العدسات", category: "Revenue", balance: 0, description: "Point of sale revenue from designer frames and lens fabrications." },
  { code: "ACC-5110-EXP-SUPPLIES", name: "Ophthalmic Medical Consumables Expenses", nameAr: "مصروفات مستهلكات ومستلزمات طبية", category: "Expenses", balance: 0, description: "Cost of single-use syringes, procedural drapes, and surgical cartridges." },
  { code: "ACC-5120-EXP-COMM", name: "Consulting Doctor Commission Overhead", nameAr: "مصروفات عمولات الأطباء الاستشاريين", category: "Expenses", balance: 0, description: "Hospital expense matching surgeon procedure commissions." },
  { code: "ACC-5130-EXP-DEPR", name: "Monthly Hardware Depreciation Expense", nameAr: "مصروف إهلاك الآلات الطبية الشهري", category: "Expenses", balance: 0, description: "Non-cash operational expense marking ophthalmic device aging." },
  { code: "ACC-5145-EXP-UTILITY", name: "Hospital Infrastructure Utilities Overhead", nameAr: "مصارف الكهرباء والخدمات للمستشفى", category: "Expenses", balance: 0, description: "Water, high-efficiency power feed for surgical theaters, and safety gases." },
];

export const SEED_VENDOR_BILLS: VendorBill[] = [
  { id: "VB-1001", supplier: "Haag-Streit Diagnostics", poReference: "PO-2026-001", invoiceSum: 28500, purchaseQty: 3, warehouseReceived: 0, verificationMatch: "Pending", disbursementDue: "2026-07-15" },
  { id: "VB-1002", supplier: "Carl Zeiss AG", poReference: "PO-2026-002", invoiceSum: 47500, purchaseQty: 2, warehouseReceived: 2, verificationMatch: "Matched", disbursementDue: "2026-07-01" },
  { id: "VB-1003", supplier: "Alcon Laboratories", poReference: "PO-2026-003", invoiceSum: 12400, purchaseQty: 500, warehouseReceived: 200, verificationMatch: "Partial", disbursementDue: "2026-07-20" },
  { id: "VB-1004", supplier: "Pfizer Ophthalmic", poReference: "PO-2026-004", invoiceSum: 8960, purchaseQty: 200, warehouseReceived: 0, verificationMatch: "Pending", disbursementDue: "2026-08-01" },
];

export function generateJournalId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `JE-${n}`;
}

export function computeTrialBalance(accounts: Account[], entries: JournalEntry[]): { account: Account; totalDebit: number; totalCredit: number; balance: number }[] {
  const updatedBalances = new Map<string, number>();
  const totals = new Map<string, { debit: number; credit: number }>();

  for (const acc of accounts) {
    updatedBalances.set(acc.code, acc.balance);
    totals.set(acc.code, { debit: 0, credit: 0 });
  }

  for (const entry of entries) {
    if (entry.debitAccountCode) {
      const t = totals.get(entry.debitAccountCode);
      if (t) t.debit += entry.debit;
    }
    if (entry.creditAccountCode) {
      const t = totals.get(entry.creditAccountCode);
      if (t) t.credit += entry.credit;
    }
  }

  return accounts.map(acc => {
    const t = totals.get(acc.code) || { debit: 0, credit: 0 };
    const category = acc.category;
    const normalDebit = category === "Assets" || category === "Expenses";
    let balance = acc.balance;
    balance += normalDebit ? (t.debit - t.credit) : (t.credit - t.debit);
    return { account: acc, totalDebit: t.debit, totalCredit: t.credit, balance };
  });
}

export function computeIncomeStatement(trialBalance: { account: Account; balance: number }[]): { revenues: { name: string; amount: number }[]; expenses: { name: string; amount: number }[]; netIncome: number } {
  const revenues = trialBalance.filter(tb => tb.account.category === "Revenue").map(tb => ({ name: tb.account.name, amount: tb.balance }));
  const expenses = trialBalance.filter(tb => tb.account.category === "Expenses").map(tb => ({ name: tb.account.name, amount: Math.abs(tb.balance) }));
  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  return { revenues, expenses, netIncome: totalRevenue - totalExpense };
}

export function computeBalanceSheet(trialBalance: { account: Account; balance: number }[]): { assets: { name: string; amount: number }[]; liabilities: { name: string; amount: number }[]; equity: { name: string; amount: number }[]; totalAssets: number; totalLiabilities: number; totalEquity: number } {
  const assets = trialBalance.filter(tb => tb.account.category === "Assets").map(tb => ({ name: tb.account.name, amount: tb.balance }));
  const liabilities = trialBalance.filter(tb => tb.account.category === "Liabilities").map(tb => ({ name: tb.account.name, amount: tb.balance }));
  const equity = trialBalance.filter(tb => tb.account.category === "Equity").map(tb => ({ name: tb.account.name, amount: tb.balance }));
  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
  const totalEquity = equity.reduce((s, e) => s + e.amount, 0);
  return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
}
