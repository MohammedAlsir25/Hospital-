/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  hospitalName: string;
  subtitle: string;
  activeEmployee: string;
  systemSecure: string;
  patientIndex: string;
  sortByUrgency: string;
  searchPlaceholder: string;
  themeToggle: string;
  langToggle: string;
  
  // Launchers
  pharmacyLauncher: string;
  warehouseLauncher: string;
  opticsLauncher: string;
  accountingLauncher: string;

  // Sidebar zones
  zoneFrontDesk: string;
  zoneClinicalCare: string;
  zoneDiagnosticsSurgery: string;
  zonePharmacyOptical: string;
  zoneFinanceInventory: string;
  zoneGovernanceAdmin: string;

  // Views / Tabs
  dashboard: string;
  inquiryReg: string;
  queueBoard: string;
  emrReception: string;
  appointments: string;
  kioskSelf: string;

  optometry: string;
  emrDoctor: string;
  medicineClinic: string;
  entClinic: string;
  dentalClinic: string;
  retinaClinic: string;
  glaucomaClinic: string;
  orbitClinic: string;
  pediatricsClinic: string;
  generalOphth: string;

  laboratory: string;
  radiology: string;
  surgeryBooking: string;
  operatingRoom: string;
  admissionWard: string;
  dischargeCheckout: string;

  pharmacyDept: string;
  medicineCatalog: string;
  medicineInventory: string;
  batchesExpiry: string;
  opticalShowroom: string;
  showroomBrands: string;
  opticsLab: string;
  orderPipeline: string;
  posCheckout: string;

  accountsRevenue: string;
  insuranceClaims: string;
  commissions: string;
  pnlReport: string;
  accountingPeriods: string;
  inventoryStore: string;
  suppliers: string;
  stockTransfers: string;
  stocktakes: string;
  reservations: string;
  writeOffs: string;
  locations: string;

  commandCenter: string;
  medicalDirector: string;
  financialDirector: string;
  executiveDash: string;
  clinicAnalytics: string;
  outcomeTracker: string;
  hrOffice: string;
  patientPortal: string;
  shiftCalendar: string;
  notifications: string;
  settings: string;
}

export const TRANSLATIONS: Record<"en" | "ar", TranslationSet> = {
  en: {
    hospitalName: "Al Jawarih Eye Hospital",
    subtitle: "Unified Clinical ERP & Specialty EMR Suite",
    activeEmployee: "Active Employee:",
    systemSecure: "System: SECURE & HL7 COMPLIANT",
    patientIndex: "Live Patient Index Queue",
    sortByUrgency: "Emergency Sorting Active",
    searchPlaceholder: "Search patient registries (e.g. Harrison)...",
    themeToggle: "Theme Mode",
    langToggle: "العربية",

    pharmacyLauncher: "Pharmacy",
    warehouseLauncher: "Warehouse",
    opticsLauncher: "Optics POS",
    accountingLauncher: "Accounting",

    zoneFrontDesk: "Front Desk Registration",
    zoneClinicalCare: "Clinical Specialty Care",
    zoneDiagnosticsSurgery: "Diagnostics & Surgery",
    zonePharmacyOptical: "Pharmacy & Optical Rooms",
    zoneFinanceInventory: "Finance & Supply Chains",
    zoneGovernanceAdmin: "Governance & Operations",

    dashboard: "Administrative Dashboard",
    inquiryReg: "Inquiry & Quick Registration",
    queueBoard: "Smart TV Waiting Queue Screen",
    emrReception: "Kiosk EMR Desk",
    appointments: "Schedules & Appointments",
    kioskSelf: "Interactive Tablet Self Check-In",

    optometry: "Visual Refraction & Visual Acuity",
    emrDoctor: "Doctor EMR Diagnostics Consult",
    medicineClinic: "General Family Medicine Clinic",
    entClinic: "Otorhinolaryngology (ENT) Clinic",
    dentalClinic: "Comprehensive Dental Clinic",
    retinaClinic: "Macula & Retina Pathology Gate",
    glaucomaClinic: "Tonometry & Glaucoma IOP",
    orbitClinic: "Orbit Trauma Urgent Triage",
    pediatricsClinic: "Pediatric Strabismus Room",
    generalOphth: "General Comprehensive Eye Room",

    laboratory: "Clinical Hematology Lab Specs",
    radiology: "Computed Tomography & CT Imaging",
    surgeryBooking: "Operating Room Surgical Schedules",
    operatingRoom: "Active Surgical Theatre Room",
    admissionWard: "Inpatient Bed Admission Ward",
    dischargeCheckout: "Encounter Discharge Billing",

    pharmacyDept: "Pharmacy Prescription Portal",
    medicineCatalog: "Interactive Drug Master List",
    medicineInventory: "Pharmacy Stock Ledger Index",
    batchesExpiry: "Batch Tracking & Alerts",
    opticalShowroom: "Optical Showroom & Fitting POS",
    showroomBrands: "Designer Brands Registry",
    opticsLab: "Refractive Lens Preparation",
    orderPipeline: "Showroom Refraction Pipeline",
    posCheckout: "Optical Sales Cash Receipt",

    accountsRevenue: "Receivables & Ledger Sheets",
    insuranceClaims: "Third Party HIPAA Pre-Auth",
    commissions: "Referral & Staff Commission Matrix",
    pnlReport: "Profit & Loss Account Matrix",
    accountingPeriods: "Monthly Close Parameters",
    inventoryStore: "Hospital Central Logistics",
    suppliers: "Pharma Manufacturer Directory",
    stockTransfers: "Internal Logistics Allocations",
    stocktakes: "Audited Physical Inventory",
    reservations: "Patient Procedure Holds",
    writeOffs: "Ancillary Discards & Waste",
    locations: "Facility Room Asset Indexes",

    commandCenter: "IT Command & Active Terminals",
    medicalDirector: "Chief Clinical Officer Panel",
    financialDirector: "Chief Financial Officer Sheets",
    executiveDash: "Boardroom executive KPI suite",
    clinicAnalytics: "Aggregated Surgical Auditing",
    outcomeTracker: "AI Visual Treatment Analytics",
    hrOffice: "Staff Roster & Pin Clearance",
    patientPortal: "Secure Patient FHIR Gateway",
    shiftCalendar: "Physician On-Duty Schedules",
    notifications: "Critical Telemetry Alerts",
    settings: "Workspace Environmental Setup",
  },
  ar: {
    hospitalName: "مستشفى الجوارح لطب العيون",
    subtitle: "نظام إي أر بي طبي موحد وسجل تخصصي شامل",
    activeEmployee: "الموظف النشط:",
    systemSecure: "حالة النظام: آمن ومتوافق مع معايير HL7-FHIR",
    patientIndex: "طابور مؤشر المرضى المباشر",
    sortByUrgency: "نظام فرز الطوارئ نشط",
    searchPlaceholder: "ابحث في سجلات المرضى (مثال: Harrison)...",
    themeToggle: "نمط الواجهة",
    langToggle: "English",

    pharmacyLauncher: "الصيدلية",
    warehouseLauncher: "المستودع",
    opticsLauncher: "البصريات والمبيعات",
    accountingLauncher: "المحاسبة والمالية",

    zoneFrontDesk: "مكتب الاستقبال والتسجيل",
    zoneClinicalCare: "العيادات التخصصية الشاملة",
    zoneDiagnosticsSurgery: "التشخيص والعمليات الجراحية",
    zonePharmacyOptical: "أقسام الصيدلية والبصريات",
    zoneFinanceInventory: "المالية والمخازن وسلاسل الإمداد",
    zoneGovernanceAdmin: "الحوكمة والإدارة والعمليات",

    dashboard: "لوحة القيادة الإدارية",
    inquiryReg: "الاستعلام والتسجيل السريع",
    queueBoard: "شاشة طابور الانتظار الذكية",
    emrReception: "مكتب الاستقبال الطبي المتكامل",
    appointments: "المواعيد وجدول الحجوزات",
    kioskSelf: "جهاز الخدمة الذاتية اللوحي",

    optometry: "فحص قياس النظر حدة الإبصار",
    emrDoctor: "استشارة طبيب العيون التخصصية",
    medicineClinic: "عيادة طب الأسرة والأمراض المزمنة",
    entClinic: "عيادة الأذن والأنف والحنجرة",
    dentalClinic: "عيادة طب الأسنان وجراحة الفم",
    retinaClinic: "عيادة أمراض الشبكية والاعتلال السكري",
    glaucomaClinic: "عيادة المياه الزرقاء وضغط العين",
    orbitClinic: "فرز طوارئ إصابات محجر العين",
    pediatricsClinic: "عيادة عيون الأطفال والحول",
    generalOphth: "عيادة العيون العامة الشاملة",

    laboratory: "مختبر الفحوصات والدم والتحاليل",
    radiology: "قسم الأشعة التشخيصية والمقطعية",
    surgeryBooking: "مكتب حجز وجدولة العمليات",
    operatingRoom: "غرفة العمليات الجراحية النشطة",
    admissionWard: "أجنحة التنويم الداخلي والأسرة",
    dischargeCheckout: "الفواتير الحسابية ومغادرة المريض",

    pharmacyDept: "بوابة صرف الوصفات الطبية",
    medicineCatalog: "دليل الأدوية الرئيسي الشامل",
    medicineInventory: "مخزون الأدوية في الصيدلية",
    batchesExpiry: "تتبع شحنات الأدوية وصلاحيتها",
    opticalShowroom: "معرض النظارات والعدسات اللاصقة",
    showroomBrands: "سجل ماركات النظارات العالمية",
    opticsLab: "معمل قص وتركيب العدسات الطبية",
    orderPipeline: "خط متابعة تجهيز النظارات",
    posCheckout: "فاتورة مبيعات البصريات والمحاسر",

    accountsRevenue: "أوراق الذمم الحسابية والإيرادات",
    insuranceClaims: "مطالبات التأمين الصحي لسلامة المرضى",
    commissions: "حساب العمولات الطبية والتحويلات",
    pnlReport: "حساب الخسائر والأرباح والمركز المالي",
    accountingPeriods: "إغلاق الفترات المحاسبية الشهرية",
    inventoryStore: "مستودع المستلزمات الطبية المركزي",
    suppliers: "دليل الموردين وشركات الأدوية",
    stockTransfers: "التحويلات الداخلية للمخازن والعهد",
    stocktakes: "جرد وتدقيق المخزون الفعلي",
    reservations: "حجز مستلزمات العمليات المقررة",
    writeOffs: "إتلاف وهدر الأصول والمستلزمات",
    locations: "أماكن تصنيف أجهزة ومرافق المستشفى",

    commandCenter: "غرفة التحكم ومراقبة أطراف الشبكة",
    medicalDirector: "لوحة تحكم المدير الطبي للمستشفي",
    financialDirector: "تقارير المدير المالي الحسابية",
    executiveDash: "لوحة المدراء التنفيذيين ومؤشرات الأداء",
    clinicAnalytics: "إحصائيات التدقيق الجراحي والعلاجي",
    outcomeTracker: "تحليلات الذكاء الاصطناعي لنتائج العلاج",
    hrOffice: "مكتب الموارد البشرية والرواتب والدوام",
    patientPortal: "بوابة المريض الإلكترونية للتواصل المباشر",
    shiftCalendar: "جدول مناوبات الأطباء المناوبين",
    notifications: "التنبيهات السلكية ونظام الإنذار",
    settings: "إعدادات وتخصيص بيئة عمل المستشفى",
  }
};
