import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import {
  WarehouseProduct, TransferLog, FreightShipment, WarehouseTab,
  SEED_WAREHOUSE_PRODUCTS, DEFAULT_DESTINATIONS,
  INITIAL_TRANSFER_LOGS, INITIAL_FREIGHT_SHIPMENTS,
} from "../types/warehouse";

interface WarehouseState {
  products: WarehouseProduct[];
  destinations: string[];
  activeDestination: string;
  transfers: TransferLog[];
  shipments: FreightShipment[];
  activeTab: WarehouseTab;
  activeFilter: string;
  selectedProduct: WarehouseProduct | null;
}

type WarehouseAction =
  | { type: "SET_TAB"; payload: WarehouseTab }
  | { type: "SET_FILTER"; payload: string }
  | { type: "SET_DESTINATION"; payload: string }
  | { type: "ADD_DESTINATION"; payload: string }
  | { type: "RECEIVE_STOCK"; payload: { sku: string; qty: number } }
  | { type: "WRITE_OFF"; payload: { sku: string } }
  | { type: "BULK_RECEIVE"; payload: string[] }
  | { type: "BULK_WRITE_OFF"; payload: string[] }
  | { type: "ADD_TRANSFER"; payload: TransferLog }
  | { type: "SELECT_PRODUCT"; payload: WarehouseProduct | null };

function warehouseReducer(state: WarehouseState, action: WarehouseAction): WarehouseState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_FILTER":
      return { ...state, activeFilter: action.payload };
    case "SET_DESTINATION":
      return { ...state, activeDestination: action.payload };
    case "ADD_DESTINATION":
      return {
        ...state,
        destinations: state.destinations.includes(action.payload)
          ? state.destinations
          : [...state.destinations, action.payload],
      };
    case "RECEIVE_STOCK":
      return {
        ...state,
        products: state.products.map(p =>
          p.sku === action.payload.sku
            ? { ...p, onHandQty: p.onHandQty + action.payload.qty, status: "Optimized" as const }
            : p
        ),
      };
    case "WRITE_OFF":
      return {
        ...state,
        products: state.products.map(p =>
          p.sku === action.payload.sku
            ? { ...p, onHandQty: 0, status: "Deficient" as const }
            : p
        ),
      };
    case "BULK_RECEIVE":
      return {
        ...state,
        products: state.products.map(p =>
          action.payload.includes(p.sku)
            ? { ...p, onHandQty: p.onHandQty + 200, status: "Optimized" as const }
            : p
        ),
      };
    case "BULK_WRITE_OFF":
      return {
        ...state,
        products: state.products.map(p =>
          action.payload.includes(p.sku)
            ? { ...p, onHandQty: 0, status: "Deficient" as const }
            : p
        ),
      };
    case "ADD_TRANSFER":
      return { ...state, transfers: [action.payload, ...state.transfers] };
    case "SELECT_PRODUCT":
      return { ...state, selectedProduct: action.payload };
    default:
      return state;
  }
}

const initialState: WarehouseState = {
  products: SEED_WAREHOUSE_PRODUCTS,
  destinations: DEFAULT_DESTINATIONS,
  activeDestination: "HOSPITAL",
  transfers: INITIAL_TRANSFER_LOGS,
  shipments: INITIAL_FREIGHT_SHIPMENTS,
  activeTab: "dashboard",
  activeFilter: "All",
  selectedProduct: null,
};

interface WarehouseContextValue {
  state: WarehouseState;
  dispatch: React.Dispatch<WarehouseAction>;
  setTab: (tab: WarehouseTab) => void;
  setFilter: (filter: string) => void;
  setDestination: (dest: string) => void;
  addDestination: (dest: string) => void;
  receiveStock: (sku: string, qty: number) => void;
  writeOff: (sku: string) => void;
  bulkReceive: (skus: string[]) => void;
  bulkWriteOff: (skus: string[]) => void;
  addTransfer: (log: TransferLog) => void;
  selectProduct: (p: WarehouseProduct | null) => void;
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(warehouseReducer, initialState);

  const setTab = useCallback((tab: WarehouseTab) => dispatch({ type: "SET_TAB", payload: tab }), []);
  const setFilter = useCallback((filter: string) => dispatch({ type: "SET_FILTER", payload: filter }), []);
  const setDestination = useCallback((dest: string) => dispatch({ type: "SET_DESTINATION", payload: dest }), []);
  const addDestination = useCallback((dest: string) => dispatch({ type: "ADD_DESTINATION", payload: dest }), []);
  const receiveStock = useCallback((sku: string, qty: number) => dispatch({ type: "RECEIVE_STOCK", payload: { sku, qty } }), []);
  const writeOff = useCallback((sku: string) => dispatch({ type: "WRITE_OFF", payload: { sku } }), []);
  const bulkReceive = useCallback((skus: string[]) => dispatch({ type: "BULK_RECEIVE", payload: skus }), []);
  const bulkWriteOff = useCallback((skus: string[]) => dispatch({ type: "BULK_WRITE_OFF", payload: skus }), []);
  const addTransfer = useCallback((log: TransferLog) => dispatch({ type: "ADD_TRANSFER", payload: log }), []);
  const selectProduct = useCallback((p: WarehouseProduct | null) => dispatch({ type: "SELECT_PRODUCT", payload: p }), []);

  return (
    <WarehouseContext.Provider value={{
      state, dispatch,
      setTab, setFilter, setDestination, addDestination,
      receiveStock, writeOff, bulkReceive, bulkWriteOff,
      addTransfer, selectProduct,
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error("useWarehouse must be used within WarehouseProvider");
  return ctx;
}
