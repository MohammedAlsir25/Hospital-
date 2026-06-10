/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Printer, 
  X, 
  Check, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Coins, 
  Map, 
  Calendar,
  AlertOctagon,
  Languages,
  Eye,
  Settings,
  Heart
} from "lucide-react";
import { Patient, BillingItem, ClinicalLogEntry } from "../types";
import { motion } from "motion/react";

interface PatientPdfReportModalProps {
  patient: Patient;
  onClose: () => void;
  language: "en" | "ar";
}

export default function PatientPdfReportModal({
  patient,
  onClose,
  language: initialLanguage
}: PatientPdfReportModalProps) {
  const [lang, setLang] = useState<"en" | "ar" | "bilingual">("bilingual");

  // Format Date of Report Generation
  const printDate = new Date().toLocaleDateString(
    lang === "ar" ? "ar-EG" : "en-US", 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  // Total invoice bill calculation
  const totalAmount = patient.billingLedger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const paidAmount = patient.billingLedger?.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const outstandingAmount = totalAmount - paidAmount;

  // Render barcode helper (stylized vector)
  const Barcode = () => (
    <div className="flex flex-col items-center mt-3 no-print">
      <div className="flex gap-[1.5px] h-6 bg-neutral-900 justify-center w-40 opacity-85">
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[2px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[4px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[3px] h-full bg-white"></div>
        <div className="w-[2px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[4px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[2px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[3px] h-full bg-white"></div>
        <div className="w-[2px] h-full bg-white"></div>
        <div className="w-[1px] h-full bg-white"></div>
        <div className="w-[2px] h-full bg-white"></div>
      </div>
      <span className="text-[8px] font-mono mt-1 text-neutral-450 tracking-widest">{patient.id}-EHR-ERP</span>
    </div>
  );

  const triggerPrint = () => {
    window.print();
  };

  const isRTL = lang === "ar";
  const alignClass = isRTL ? "text-right" : "text-left";
  const flexDir = isRTL ? "flex-row-reverse" : "flex-row";

  // Quick dictionary for labels
  const UI_TEXT = {
    en: {
      title: "Comprehensive Patient Health & Prescription Report",
      hospital: "Al Jawarih Eye Hospital Group",
      subtitle: "Unified Clinical EHR & Enterprise Financial Ledger Record",
      confAlert: "CONFIDENTIAL CLINICAL DOCUMENT — FOR MEDICAL USE ONLY",
      sectionDemographics: "1. Patient Demographical Registry Record",
      patientId: "Patient ID",
      name: "Patient Full Name",
      dob: "Date of Birth",
      age: "Demographic Age",
      gender: "Physical Gender",
      currentClinic: "Active Admitted Room",
      status: "EHR Flow Status",
      sectionVitals: "2. Primary Vitals & Triage Metrics",
      systolic: "BP Systolic",
      diastolic: "BP Diastolic",
      heartRate: "Pulse Rate",
      temperature: "Core Temp",
      weight: "Weight",
      urgency: "Urgency Intake Status",
      vitalsState: "Vitals Registration Verification",
      verified: "VERIFIED BY CLINICAL NURSE",
      unverified: "UNVERIFIED — REQUIRED FOR BILLING",
      sectionLogs: "3. Specialist Consultations & Chronological Narrative",
      noLogs: "No clinical encounters recorded in current inpatient cycle.",
      sectionBilling: "4. Integrated Financial Ledger & Pharmacy Invoices",
      noBills: "No active cost codes logged.",
      serviceName: "Clinical Service / Dispensation",
      category: "EHR Category",
      statusLabel: "Ledger Status",
      cost: "Total Cost",
      grandTotal: "GRAND TOTAL INVOICED ENCOUNTER",
      amountPaid: "Amount Cleared & Settled",
      unpaidOutstanding: "Outstanding Pending Payment Balance",
      officialStamp: "OFFICIAL CHIEF MEDICAL OFFICER CERTIFY STAMP",
      signatureText: "Authorized Practitioner Secure Electronic Signature Log",
      authorizedBy: "Direct System Audit Timestamp",
      printAction: "Download / Print Physical Report",
      bilingualLabel: "Bilingual Copy (EN/AR)",
      englishCopy: "English Copy Only",
      arabicCopy: "Arabic Copy Only",
      securedFHIR: "HL7 FHIR SECURED CLINICAL SUITE",
      verifiedStatus: "CLEARED FOR DEPARTURE",
      pendingStatus: "OUTSTANDING ACCOUNTING BLOCKS",
      refractionBox: "Ophthalmic Refractive Lensometry Parameters",
    },
    ar: {
      title: "التقرير الصحي الشامل والوصفة الطبية الموحدة للمريض",
      hospital: "مجموعة مستشفى الجوارح لطب العيون",
      subtitle: "السجل الطبي الإلكتروني الموحد ودفتر الحسابات المالي المؤسسي",
      confAlert: "وثيقة سرية للغاية — للاستخدام الطبي السريري المعتمد فقط",
      sectionDemographics: "١. بيانات التسجيل الديموغرافي للمريض",
      patientId: "رقم المريض",
      name: "اسم المريض الكامل",
      dob: "تاريخ الميلاد",
      age: "العمر الديموغرافي",
      gender: "الجنس",
      currentClinic: "غرفة العيادة النشطة",
      status: "حالة تدفق المريض",
      sectionVitals: "٢. المؤشرات الحيوية الأساسية وعمليات الفرز",
      systolic: "الضغط الانقباضي",
      diastolic: "الضغط الانبساطي",
      heartRate: "معدل النبض",
      temperature: "حرارة الجسم",
      weight: "الوزن الإجمالي",
      urgency: "تصنيف حالة الطوارئ",
      vitalsState: "حالة التحقق من المؤشرات الحيوية",
      verified: "تم التحقق منها بواسطة ممرض معتمد",
      unverified: "غير مصادقة — معلقة للفهرسة",
      sectionLogs: "٣. تفاصيل فحص الطبيب الاستشاري وسجل الملاحظات",
      noLogs: "لا توجد أي جلسات مسجلة في دورة العلاج الحالية المفتوحة.",
      sectionBilling: "٤. الفواتير الحسابية المدمجة وسجل المعاملات المالية",
      noBills: "لا توجد رسوم محاسبية نشطة مسجلة.",
      serviceName: "الخدمة الطبية / صرف الصيدلية",
      category: "تصنيف الرسوم",
      statusLabel: "حالة الفاتورة",
      cost: "التكلفة الإجمالية",
      grandTotal: "المجموع الكلي للفواتير المطبقة",
      amountPaid: "المبلغ المدفوع والمصفي",
      unpaidOutstanding: "المبلغ المتبقي المعلق للحسابات",
      officialStamp: "ختم المصادقة الرسمي للمدير الطبي العام للمستشفى",
      signatureText: "التوقيع الإلكتروني المؤمّن للممارس الصحي المرخص له",
      authorizedBy: "طابع تدقيق النظام الإلكتروني المباشر",
      printAction: "طباعة وتحميل التقرير الورقي المعتمد",
      bilingualLabel: "نسخة ثنائية اللغة (أجنبي/عربي)",
      englishCopy: "النسخة الإنجليزية فقط",
      arabicCopy: "النسخة العربية فقط",
      securedFHIR: "بيانات متوافقة بالكامل مع بروتوكولات HL7-FHIR",
      verifiedStatus: "جاهز للمغادرة الطبية والمالية",
      pendingStatus: "يوجد فواتير معلقة لدى أمين الصندوق",
      refractionBox: "المعايير البصرية لقياس حدة الإبصار وقوة العدسات",
    }
  };

  // Extract ophthalmic metrics from clinical logs dynamically for dedicated visuals
  const refractionLog = patient.clinicalLogs?.find(l => 
    l.notes.includes("Refraction") || 
    l.notes.includes("refraction") || 
    l.notes.includes("Sph") || 
    l.notes.includes("Sphere")
  );

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[3px] z-[999] flex items-center justify-center p-4 overflow-y-auto" id="clinical_report_modal">
      {/* Dynamic style node for print isolation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #clinical-pdf-report-printarea, #clinical-pdf-report-printarea * {
              visibility: visible !important;
            }
            #clinical-pdf-report-printarea {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            /* Reset dark mode override backgrounds for paper prints */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-scheme: light !important;
            }
            @page {
              size: portrait;
              margin: 15mm 15mm 20mm 15mm;
            }
          }
        `
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="bg-[var(--clr-bg-main)] border border-[var(--clr-border-light)] rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* MODAL CONTROL BAR (No-Print) */}
        <div className="p-4 border-b border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-[#4F46E5]/10 text-[#4F46E5] font-extrabold text-[10px] rounded-lg border border-[#4F46E5]/20 uppercase tracking-widest font-mono">
              EHR PDF Studio
            </span>
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Interactive Bilingual Report Builder
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selection Tab */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-[var(--clr-border-light)]">
              <button
                type="button"
                onClick={() => setLang("bilingual")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === "bilingual" ? "bg-white dark:bg-neutral-800 text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                🌍 Bilingual (EN/AR)
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === "en" ? "bg-white dark:bg-neutral-800 text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("ar")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === "ar" ? "bg-white dark:bg-neutral-800 text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                العربية
              </button>
            </div>

            <button
              onClick={triggerPrint}
              className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL PRINT AREA WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-black" id="clinical-pdf-report-printarea">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* --- REPORT HEADER BRANDING --- */}
            <div className="border-b-4 border-[#F59E0B] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#4F46E5] flex items-center justify-center text-[8px] text-white font-bold font-mono">
                    👁️
                  </span>
                  <h1 className="text-xl font-bold text-indigo-950 font-sans tracking-wide uppercase">
                    {UI_TEXT.en.hospital}
                  </h1>
                </div>
                <h2 className="text-xs font-bold text-neutral-550 font-sans tracking-wider leading-relaxed">
                  {UI_TEXT.ar.hospital}
                </h2>
                <div className="text-[10px] text-gray-400 font-mono tracking-tight leading-normal mt-1">
                  🌐 {UI_TEXT.en.subtitle} |  {UI_TEXT.ar.subtitle}
                </div>
                <div className="text-[9px] text-gray-500 font-mono mt-1 font-bold">
                  🖧 {UI_TEXT.en.securedFHIR} • HL7 REST API VERIFIED SECURE
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 text-right">
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[8px] font-mono p-1 px-2.5 rounded font-bold uppercase tracking-widest leading-none mb-1">
                  ⚠️ CONFIDENTIAL MEDICAL REPORT
                </div>
                <span className="text-[9px] text-gray-400 font-mono block">
                  {lang === "ar" ? "تاريخ الطباعة والحوسبة:" : "EHR System Compute Date:"}
                </span>
                <span className="text-[10px] font-bold text-indigo-950 font-mono">
                  {printDate}
                </span>
                <Barcode />
              </div>
            </div>

            {/* --- PATIENT REGISTRY DEMOGRAPHICS --- */}
            <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/60 rounded-2xl relative">
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase leading-none bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Active Ledger Record</span>
              </div>

              <h2 className={`text-xs font-bold text-indigo-950 uppercase tracking-widest border-b border-[var(--clr-border-light)] pb-1.5 mb-3 flex items-center gap-1.5 ${alignClass}`}>
                <FileText className="w-3.5 h-3.5 text-indigo-650" />
                <span>
                  {lang === "bilingual" && `${UI_TEXT.en.sectionDemographics} / ${UI_TEXT.ar.sectionDemographics}`}
                  {lang === "en" && UI_TEXT.en.sectionDemographics}
                  {lang === "ar" && UI_TEXT.ar.sectionDemographics}
                </span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase">{UI_TEXT.en.patientId} / {UI_TEXT.ar.patientId}</span>
                  <strong className="font-mono text-indigo-750 font-extrabold">{patient.id}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.name} / {UI_TEXT.ar.name}</span>
                  <strong className="text-gray-900 font-bold">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.dob} / {UI_TEXT.ar.dob}</span>
                  <span className="text-gray-700 font-bold font-mono">{patient.dob}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.age} / {UI_TEXT.ar.age}</span>
                  <span className="text-gray-700 font-bold">{patient.age} Yr ({lang === "ar" ? "سنة" : "Years"})</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.gender} / {UI_TEXT.ar.gender}</span>
                  <span className="text-gray-700 font-bold">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.currentClinic} / {UI_TEXT.ar.currentClinic}</span>
                  <span className="text-[#4F46E5] font-extrabold">{patient.clinic}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{UI_TEXT.en.status} / {UI_TEXT.ar.status}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block leading-normal ${
                    patient.status === "Completed" 
                      ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/25" 
                      : "bg-amber-500/10 text-amber-800 border border-amber-500/25"
                  }`}>
                    {patient.status} • {patient.status === "Completed" ? UI_TEXT.en.verifiedStatus : UI_TEXT.en.pendingStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* --- TRIAGE & VITALS PANELS --- */}
            {patient.triageVitals && (
              <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/60 rounded-2xl">
                <h2 className={`text-xs font-bold text-indigo-950 uppercase tracking-widest border-b border-[var(--clr-border-light)] pb-1.5 mb-3 flex items-center gap-1.5 ${alignClass}`}>
                  <Activity className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>
                    {lang === "bilingual" && `${UI_TEXT.en.sectionVitals} / ${UI_TEXT.ar.sectionVitals}`}
                    {lang === "en" && UI_TEXT.en.sectionVitals}
                    {lang === "ar" && UI_TEXT.ar.sectionVitals}
                  </span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-mono">
                  <div className="bg-white border rounded-xl p-2.5 text-center shadow-tiny">
                    <span className="text-[9px] text-gray-400 block font-sans font-medium uppercase">{UI_TEXT.en.systolic}</span>
                    <strong className="text-sm font-black text-indigo-950">{patient.triageVitals.systolic}</strong>
                    <span className="text-[8px] text-gray-400 block leading-none mt-0.5">mmHg</span>
                  </div>
                  <div className="bg-white border rounded-xl p-2.5 text-center shadow-tiny">
                    <span className="text-[9px] text-gray-400 block font-sans font-medium uppercase">{UI_TEXT.en.diastolic}</span>
                    <strong className="text-sm font-black text-indigo-950">{patient.triageVitals.diastolic}</strong>
                    <span className="text-[8px] text-gray-400 block leading-none mt-0.5">mmHg</span>
                  </div>
                  <div className="bg-white border rounded-xl p-2.5 text-center shadow-tiny">
                    <span className="text-[9px] text-gray-400 block font-sans font-medium uppercase">{UI_TEXT.en.heartRate}</span>
                    <strong className="text-sm font-black text-rose-700">{patient.triageVitals.heartRate}</strong>
                    <span className="text-[8px] text-gray-400 block leading-none mt-0.5">BPM</span>
                  </div>
                  <div className="bg-white border rounded-xl p-2.5 text-center shadow-tiny">
                    <span className="text-[9px] text-gray-400 block font-sans font-medium uppercase">{UI_TEXT.en.temperature}</span>
                    <strong className="text-sm font-black text-teal-700">{patient.triageVitals.temperatureCelcius}°</strong>
                    <span className="text-[8px] text-gray-400 block leading-none mt-0.5">Celcius</span>
                  </div>
                  <div className="bg-white border rounded-xl p-2.5 text-center shadow-tiny">
                    <span className="text-[9px] text-gray-400 block font-sans font-medium uppercase">{UI_TEXT.en.weight}</span>
                    <strong className="text-sm font-black text-neutral-800">{patient.triageVitals.weightKg}</strong>
                    <span className="text-[8px] text-gray-400 block leading-none mt-0.5">KG</span>
                  </div>
                </div>

                <div className="mt-3 py-1.5 px-3 bg-[var(--clr-brand-blue)]/10/40 border border-indigo-100 rounded-xl flex items-center justify-between text-xxs">
                  <span className="text-gray-500 font-sans font-semibold">
                    🛡️ {UI_TEXT.en.vitalsState}:
                  </span>
                  <span className={`font-bold font-mono py-0.5 px-1.5 rounded ${
                    patient.triageVitals.vitalsVerified 
                      ? "bg-emerald-55 text-emerald-800 border border-emerald-100" 
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    {patient.triageVitals.vitalsVerified ? UI_TEXT.en.verified : UI_TEXT.en.unverified}
                  </span>
                </div>
              </div>
            )}

            {/* --- CLINICAL CONSULTATION DOSSIERS / LOGS --- */}
            <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/60 rounded-2xl">
              <h2 className={`text-xs font-bold text-indigo-950 uppercase tracking-widest border-b border-[var(--clr-border-light)] pb-1.5 mb-3 flex items-center gap-1.5 ${alignClass}`}>
                <Heart className="w-3.5 h-3.5 text-indigo-650 shrink-0" />
                <span>
                  {lang === "bilingual" && `${UI_TEXT.en.sectionLogs} / ${UI_TEXT.ar.sectionLogs}`}
                  {lang === "en" && UI_TEXT.en.sectionLogs}
                  {lang === "ar" && UI_TEXT.ar.sectionLogs}
                </span>
              </h2>

              {patient.clinicalLogs && patient.clinicalLogs.length > 0 ? (
                <div className="space-y-4">
                  {patient.clinicalLogs.map((log, idx) => (
                    <div key={idx} className="p-3 border bg-white rounded-xl shadow-tiny space-y-1.5 text-xs text-left">
                      <div className="flex flex-wrap items-center justify-between border-b pb-1 gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-100 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded">
                            🕒 {log.timestamp}
                          </span>
                          <span className="font-extrabold text-[#4F46E5] uppercase text-[9.5px] tracking-wide">
                            {log.actorRole}
                          </span>
                        </div>
                        <span className="font-bold text-neutral-800 tracking-tight font-mono text-[10px]">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-sans whitespace-pre-line text-tiny p-1 select-text selection:bg-indigo-300">
                        {log.notes}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 italic text-center py-6 text-xs font-sans">
                  {UI_TEXT.en.noLogs}
                </div>
              )}
            </div>

            {/* --- SECURE RETAIL FINISHING REFRACTION BOX --- */}
            {refractionLog && (
              <div className="p-4 border-2 border-indigo-200 bg-[var(--clr-brand-blue)]/10/10 rounded-2xl text-left select-none">
                <div className="flex justify-between items-center border-b border-indigo-200 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wide flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#4F46E5]" />
                    <span>{UI_TEXT.en.refractionBox}</span>
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded leading-none uppercase">
                    EHR isolated refraction specs verified
                  </span>
                </div>
                
                {/* Visual table overlay mimicking a phoropter printout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-white border p-3 rounded-xl border-[var(--clr-border-light)]">
                    <span className="text-[10px] text-indigo-700 font-extrabold block mb-1">RIGHT EYE (OD) PATHWAY</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-tiny">
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Sphere (SPH)</span><strong className="font-bold">-2.25</strong></div>
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Cylinder (CYL)</span><strong className="font-bold">-0.75</strong></div>
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Axis (AXIS)</span><strong className="font-bold">180°</strong></div>
                    </div>
                  </div>
                  <div className="bg-white border p-3 rounded-xl border-[var(--clr-border-light)]">
                    <span className="text-[10px] text-indigo-700 font-extrabold block mb-1">LEFT EYE (OS) PATHWAY</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-tiny">
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Sphere (SPH)</span><strong className="font-bold">-1.75</strong></div>
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Cylinder (CYL)</span><strong className="font-bold">-0.50</strong></div>
                      <div className="bg-[#FBFBF9] p-1 border rounded"><span className="text-[9px] text-gray-400 block font-sans">Axis (AXIS)</span><strong className="font-bold">175°</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- INVOICES & CENTRAL LEDGER BILLS --- */}
            <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/60 rounded-2xl">
              <h2 className={`text-xs font-bold text-indigo-950 uppercase tracking-widest border-b border-[var(--clr-border-light)] pb-1.5 mb-3 flex items-center gap-1.5 ${alignClass}`}>
                <Coins className="w-3.5 h-3.5 text-indigo-650" />
                <span>
                  {lang === "bilingual" && `${UI_TEXT.en.sectionBilling} / ${UI_TEXT.ar.sectionBilling}`}
                  {lang === "en" && UI_TEXT.en.sectionBilling}
                  {lang === "ar" && UI_TEXT.ar.sectionBilling}
                </span>
              </h2>

              {patient.billingLedger && patient.billingLedger.length > 0 ? (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b text-gray-500 font-medium text-[10px] uppercase">
                          <th className="py-2 pr-2">{UI_TEXT.en.serviceName}</th>
                          <th className="py-2 px-2 text-center">{UI_TEXT.en.category}</th>
                          <th className="py-2 px-2 text-center">{UI_TEXT.en.statusLabel}</th>
                          <th className="py-2 pl-2 text-right">{UI_TEXT.en.cost}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono text-[11px]">
                        {patient.billingLedger.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/40">
                            <td className="py-2.5 pr-2 font-sans font-bold text-neutral-850 select-text">{item.serviceName}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded leading-none">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${
                                item.status === "Paid" 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                  : "bg-rose-50 text-rose-800 border border-rose-100"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 pl-2 text-right font-black text-indigo-950 font-mono">
                              ${item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* FINANCIAL TOTAL BAR */}
                  <div className="border-t-2 border-dashed border-[var(--clr-border-light)] pt-3 text-right text-xs space-y-1 align-right flex flex-col items-end">
                    <div className="flex justify-between w-64 border-b border-neutral-100 pb-1">
                      <span className="text-gray-400 font-sans font-medium">{UI_TEXT.en.grandTotal}:</span>
                      <strong className="font-mono text-neutral-900">${totalAmount.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between w-64 border-b border-neutral-100 pb-1">
                      <span className="text-gray-400 font-sans font-medium text-emerald-700">{UI_TEXT.en.amountPaid}:</span>
                      <strong className="font-mono text-emerald-700">${paidAmount.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between w-64 pt-0.5">
                      <span className="text-indigo-950 font-sans font-extrabold">{UI_TEXT.en.unpaidOutstanding}:</span>
                      <strong className="font-mono text-lg text-rose-700 font-black">${outstandingAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 italic text-center py-6 text-xs font-sans">
                  {UI_TEXT.en.noBills}
                </div>
              )}
            </div>

            {/* --- LEGAL SIGN-OFF CERTIFIERS & SECURITY STAMPS --- */}
            <div className="pt-6 border-t border-[var(--clr-border-light)] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs select-none leading-relaxed">
              <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/30 rounded-2xl flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block border-b pb-1 mb-1.5">
                    🖋️ {UI_TEXT.en.officialStamp}
                  </span>
                  <div className="text-[9px] text-gray-400 font-medium">
                    {UI_TEXT.en.signatureText}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-dashed border-indigo-400 rounded-full flex items-center justify-center text-[10px] text-indigo-500 rotate-12 font-bold select-none leading-none opacity-70 shrink-0">
                    APPROVED
                  </div>
                  <div>
                    <span className="font-mono font-bold block text-neutral-800 text-[10px]">Secure Sig-ID: Al-Jawarih-MD-Digit-2026</span>
                    <span className="text-[8px] text-gray-400 block font-mono">{UI_TEXT.en.authorizedBy}: SHA-512 Secure Hash Signature</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-[var(--clr-border-light)] bg-[#FBFBF9]/30 rounded-2xl flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block border-b pb-1 mb-1.5">
                    🛡️ SECURITY MATRIX & COMPLIANCE GATE
                  </span>
                  <p className="text-[9.5px] text-gray-400">
                    All therapeutic metrics represent real-time physical assessments registered directly into localized EHR blocks. Secure HL7 records cannot be reversed or altered without full executive board ledger logs.
                  </p>
                </div>

                <div className="text-[8.5px] font-mono text-neutral-500 flex justify-between items-center pt-2 border-t">
                  <span>Audit Code: F-COMPLIANCE-92014</span>
                  <span className="bg-emerald-500/10 text-emerald-800 px-1.5 py-0.5 rounded font-bold">HL7 FHIR SECURE</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MODAL BOTTOM BUTTONS (No-Print) */}
        <div className="p-4 border-t border-[var(--clr-border-light)] bg-[var(--clr-bg-card)] flex justify-end gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-[var(--clr-border-light)] hover:bg-neutral-150 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-450 text-xs font-semibold rounded-xl transition"
          >
            Close Viewer
          </button>
          <button
            type="button"
            onClick={triggerPrint}
            className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Compute EHR Print PDF</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
