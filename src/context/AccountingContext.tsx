import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import {
  Account, JournalEntry, PatientInvoice, InsuranceClaim,
  VendorBill, DepreciableAsset, AutomationLog,
  CostCenter, JournalCategory, WalletType,
  SEED_CHART_OF_ACCOUNTS, SEED_VENDOR_BILLS, generateJournalId
} from "../types/accounting";

interface AccountingState {
  accounts: Account[];
  journal: JournalEntry[];
  patientInvoices: PatientInvoice[];
  insuranceClaims: InsuranceClaim[];
  vendorBills: VendorBill[];
  depreciableAssets: DepreciableAsset[];
  automationLogs: AutomationLog[];
}

type AccountingAction =
  | { type: "ADD_JOURNAL_ENTRY"; payload: JournalEntry }
  | { type: "ADD_JOURNAL_ENTRIES"; payload: JournalEntry[] }
  | { type: "UPDATE_ACCOUNT_BALANCE"; payload: { code: string; balance: number } }
  | { type: "BULK_UPDATE_ACCOUNTS"; payload: Account[] }
  | { type: "SET_PATIENT_INVOICES"; payload: PatientInvoice[] }
  | { type: "SET_INSURANCE_CLAIMS"; payload: InsuranceClaim[] }
  | { type: "SET_VENDOR_BILLS"; payload: VendorBill[] }
  | { type: "SET_DEPRECIABLE_ASSETS"; payload: DepreciableAsset[] }
  | { type: "SET_AUTOMATION_LOGS"; payload: AutomationLog[] }
  | { type: "RESET" };

const initialAccounts = SEED_CHART_OF_ACCOUNTS.map(a => ({ ...a }));

const initialState: AccountingState = {
  accounts: initialAccounts,
  journal: [],
  patientInvoices: [],
  insuranceClaims: [],
  vendorBills: SEED_VENDOR_BILLS.map(v => ({ ...v })),
  depreciableAssets: [],
  automationLogs: [],
};

function accountingReducer(state: AccountingState, action: AccountingAction): AccountingState {
  switch (action.type) {
    case "ADD_JOURNAL_ENTRY":
      return { ...state, journal: [action.payload, ...state.journal] };
    case "ADD_JOURNAL_ENTRIES":
      return { ...state, journal: [...action.payload, ...state.journal] };
    case "UPDATE_ACCOUNT_BALANCE":
      return {
        ...state,
        accounts: state.accounts.map(a =>
          a.code === action.payload.code ? { ...a, balance: action.payload.balance } : a
        ),
      };
    case "BULK_UPDATE_ACCOUNTS":
      return { ...state, accounts: action.payload };
    case "SET_PATIENT_INVOICES":
      return { ...state, patientInvoices: action.payload };
    case "SET_INSURANCE_CLAIMS":
      return { ...state, insuranceClaims: action.payload };
    case "SET_VENDOR_BILLS":
      return { ...state, vendorBills: action.payload };
    case "SET_DEPRECIABLE_ASSETS":
      return { ...state, depreciableAssets: action.payload };
    case "SET_AUTOMATION_LOGS":
      return { ...state, automationLogs: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function applyDoubleEntry(accounts: Account[], debitCode: string, creditCode: string, amount: number) {
  return accounts.map(acc => {
    if (acc.code === debitCode) {
      const isDebitNormal = acc.category === "Assets" || acc.category === "Expenses";
      return { ...acc, balance: acc.balance + (isDebitNormal ? amount : -amount) };
    }
    if (acc.code === creditCode) {
      const isCreditNormal = acc.category === "Liabilities" || acc.category === "Equity" || acc.category === "Revenue";
      return { ...acc, balance: acc.balance + (isCreditNormal ? amount : -amount) };
    }
    return acc;
  });
}

interface AccountingContextValue {
  state: AccountingState;
  postJournalEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  dispatch: React.Dispatch<AccountingAction>;
}

const AccountingContext = createContext<AccountingContextValue | null>(null);

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(accountingReducer, initialState);

  const postJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    const je: JournalEntry = {
      ...entry,
      id: generateJournalId(),
      timestamp: new Date().toLocaleTimeString(),
    };
    dispatch({ type: "ADD_JOURNAL_ENTRY", payload: je });
    if (entry.debitAccountCode && entry.creditAccountCode && entry.debit > 0) {
      const updated = applyDoubleEntry(state.accounts, entry.debitAccountCode, entry.creditAccountCode, entry.debit);
      dispatch({ type: "BULK_UPDATE_ACCOUNTS", payload: updated });
    }
  }, [state.accounts]);

  return (
    <AccountingContext.Provider value={{ state, postJournalEntry, dispatch }}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error("useAccounting must be used within AccountingProvider");
  return ctx;
}
