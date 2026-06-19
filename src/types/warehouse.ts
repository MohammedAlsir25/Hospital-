export type WarehouseTab = "dashboard" | "inventory" | "transfers" | "freight";

export type WarehouseStatus = "Optimized" | "Warning" | "ExpiringSoon" | "Deficient";

export interface WarehouseProduct {
  sku: string;
  productName: string;
  category: string;
  supplier: string;
  batchNum: string;
  expiryDate: string;
  onHandQty: number;
  criticalMin: number;
  unit: string;
  unitCost: number;
  status: WarehouseStatus;
}

export interface TransferLog {
  id: string;
  item: string;
  qty: number;
  source: string;
  dest: string;
  priority: string;
  status: string;
}

export interface FreightShipment {
  id: string;
  carrier: string;
  cargo: string;
  weight: string;
  cost: string;
  date: string;
  status: string;
  isOptimized: boolean;
}

export const SEED_WAREHOUSE_PRODUCTS: WarehouseProduct[] = [
  {
    sku: "OPH-001",
    productName: "Sterile Ophthalmic Examination Packs",
    category: "Consumables",
    supplier: "MediSupply Corp",
    batchNum: "BATCH-2405-A",
    expiryDate: "2027-06-15",
    onHandQty: 340,
    criticalMin: 100,
    unit: "pcs",
    unitCost: 12.50,
    status: "Optimized",
  },
  {
    sku: "OPH-002",
    productName: "Glaucoma Custom Visual Field Papers",
    category: "Consumables",
    supplier: "Zeiss Medical",
    batchNum: "BATCH-2405-B",
    expiryDate: "2026-12-01",
    onHandQty: 45,
    criticalMin: 80,
    unit: "rolls",
    unitCost: 85.00,
    status: "Deficient",
  },
  {
    sku: "OPH-003",
    productName: "Corneal Topographer Calibration Plates",
    category: "Instruments",
    supplier: "Topcon Healthcare",
    batchNum: "CAL-2026-01",
    expiryDate: "2028-03-20",
    onHandQty: 12,
    criticalMin: 5,
    unit: "pcs",
    unitCost: 420.00,
    status: "Warning",
  },
  {
    sku: "OPH-004",
    productName: "Standard Syringes & Micro-Cannulas",
    category: "Consumables",
    supplier: "Becton Dickinson",
    batchNum: "BD-7861-24",
    expiryDate: "2026-08-30",
    onHandQty: 1200,
    criticalMin: 500,
    unit: "pcs",
    unitCost: 1.80,
    status: "Optimized",
  },
  {
    sku: "OPH-005",
    productName: "Latanoprost 0.005% Ophthalmic Drops",
    category: "Pharmaceuticals",
    supplier: "Pfizer Ophthalmic",
    batchNum: "PFIZ-4432",
    expiryDate: "2026-09-15",
    onHandQty: 280,
    criticalMin: 200,
    unit: "bottles",
    unitCost: 34.00,
    status: "Warning",
  },
  {
    sku: "OPH-006",
    productName: "Zeiss Lumera OR Microscope Prisms",
    category: "Instruments",
    supplier: "Carl Zeiss AG",
    batchNum: "Z-2026-007",
    expiryDate: "2030-01-01",
    onHandQty: 8,
    criticalMin: 3,
    unit: "pcs",
    unitCost: 12500.00,
    status: "Optimized",
  },
  {
    sku: "OPH-007",
    productName: "Vitrectomy High-Speed Handpieces",
    category: "Surgical",
    supplier: "Alcon Laboratories",
    batchNum: "ALC-8842-26",
    expiryDate: "2028-11-01",
    onHandQty: 24,
    criticalMin: 15,
    unit: "pcs",
    unitCost: 2800.00,
    status: "ExpiringSoon",
  },
  {
    sku: "OPH-008",
    productName: "Intraocular Lens Implants (Hydrophobic)",
    category: "Surgical",
    supplier: "Johnson & Johnson Vision",
    batchNum: "JJV-5561-26",
    expiryDate: "2027-04-01",
    onHandQty: 65,
    criticalMin: 40,
    unit: "pcs",
    unitCost: 450.00,
    status: "Optimized",
  },
  {
    sku: "OPH-009",
    productName: "Surgical Drapes & Sterile Towels",
    category: "Consumables",
    supplier: "Kimberly-Clark",
    batchNum: "KC-3321-26",
    expiryDate: "2027-10-01",
    onHandQty: 560,
    criticalMin: 300,
    unit: "packs",
    unitCost: 8.50,
    status: "Optimized",
  },
  {
    sku: "OPH-010",
    productName: "Fluorescein Angiography Dye Vials",
    category: "Pharmaceuticals",
    supplier: "Akorn Pharmaceuticals",
    batchNum: "AKRN-7782",
    expiryDate: "2026-07-15",
    onHandQty: 30,
    criticalMin: 50,
    unit: "vials",
    unitCost: 95.00,
    status: "Deficient",
  },
];

export const DEFAULT_DESTINATIONS = ["HOSPITAL", "PHARMACY", "OPTICS_POS", "CLINIC_WEST", "CLINIC_EAST"];

export const INITIAL_TRANSFER_LOGS: TransferLog[] = [
  { id: "TXF-29402", item: "Yellow Gold Laser Calibration Lens blanks", qty: 20, source: "BLOCK_C_MONITOR", dest: "OPTICS_LAB", priority: "Urgent", status: "Delivered & Verified" },
  { id: "TXF-29403", item: "Glaucoma Custom Visual Field Calibration Papers", qty: 200, source: "VOL_B_DRY_STOCK", dest: "CLINIC_WEST", priority: "Routine", status: "In Transit" },
];

export const INITIAL_FREIGHT_SHIPMENTS: FreightShipment[] = [
  { id: "FRT-1029", carrier: "Aramex Air Cargo Ops", cargo: "Zeiss Lumera OR Microscope replacement prisms", weight: "12 kgs", cost: "$5,500", date: "2026-06-08", status: "Customs Declared & Verified", isOptimized: true },
  { id: "FRT-1030", carrier: "DHL Medical Express", cargo: "Syringes, intravenous bulk batch", weight: "145 kgs", cost: "$1,200", date: "2026-06-06", status: "Delivered & Synced AP", isOptimized: true },
  { id: "FRT-1031", carrier: "Saudi Post Freight", cargo: "Latanoprost raw clinical compound vials", weight: "5 kgs", cost: "$4,500", date: "2026-06-03", status: "Direct To Sterile Fridge", isOptimized: true },
  { id: "FRT-1032", carrier: "FedEx Health Chain Courier", cargo: "Ophthalmic High-Speed Vitrectomy handpieces", weight: "8 kgs", cost: "$9,200", date: "2026-06-09", status: "Border Customs Hold & Review", isOptimized: false },
];
