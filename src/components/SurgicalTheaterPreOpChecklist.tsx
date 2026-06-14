/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Check,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  Microscope,
  FileSignature,
  Activity,
  Grid3X3,
  FileText,
  Search,
  Undo2,
  Redo2,
  Printer,
  ChevronDown,
  Sparkles,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  Settings
} from "lucide-react";
import { Patient } from "../types";

export interface SurgicalTheaterPreOpChecklistProps {
  patient: Patient;
  onCommenceSurgery: (updatedPatient: Patient) => void;
  language?: "en" | "ar";
}

export default function SurgicalTheaterPreOpChecklist({
  patient,
  onCommenceSurgery,
  language = "en"
}: SurgicalTheaterPreOpChecklistProps) {
  const isAr = language === "ar";

  // Active worksheet tab
  const [activeSheetTab, setActiveSheetTab] = useState<"OR_QUEUE" | "BED_WARD" | "STERILE_LOG">("OR_QUEUE");

  // Search filter inside the sheet
  const [sheetSearch, setSheetSearch] = useState("");

  // Gridline toggle spreadsheet state
  const [showGridlines, setShowGridlines] = useState(true);

  // Excel active cell tracking
  const [activeCell, setActiveCell] = useState<{ row: number; col: string }>({ row: 1, col: "A" });

  // Formula bar manual input replication
  const [formulaBarText, setFormulaBarText] = useState("");

  // Live Patient Pre-Op parameters (synchronized with Row 1)
  const [livePatientChecks, setLivePatientChecks] = useState({
    trays: false,
    vitals: false,
    consent: false,
    anesthesia: false
  });

  // Mock patient schedules to construct a realistic clinical sheet (Rows 2 to 5)
  const [mockPatients, setMockPatients] = useState([
    {
      id: "PAT-229",
      name: isAr ? "فاطمة الحربي" : "Fatima Al-Harbi",
      procedure: isAr ? "إزالة المياه البيضاء الفاكو + زراعة عدسة" : "Phacoemulsification + IOL Placement",
      eye: "OD",
      surgeon: isAr ? "د. ألكسندر ستيرلينغ" : "Dr. Alex Sterling",
      trays: true,
      vitals: true,
      consent: true,
      anesthesia: true,
      status: "READY"
    },
    {
      id: "PAT-304",
      name: isAr ? "إدوارد سميث" : "Edward Smith",
      procedure: isAr ? "تصفية السائل المائي للزرق (Trabeculectomy)" : "Glaucoma Trabeculectomy",
      eye: "OS",
      surgeon: isAr ? "د. رايان فانس" : "Dr. Ryan Vance",
      trays: true,
      vitals: false,
      consent: true,
      anesthesia: false,
      status: "PENDING"
    },
    {
      id: "PAT-877",
      name: isAr ? "يوسف العتيبي" : "Yousef Al-Otaibi",
      procedure: isAr ? "إصلاح الحول وتقصير العضلات" : "Bilateral Strabismus Recession",
      eye: "OU",
      surgeon: isAr ? "د. ليام أوكونور" : "Dr. Liam O'Connor",
      trays: false,
      vitals: true,
      consent: true,
      anesthesia: true,
      status: "PENDING"
    },
    {
      id: "PAT-112",
      name: isAr ? "سارة أحمد" : "Sara Ahmed",
      procedure: isAr ? "ترميم محجر العين بعد الحوادث" : "Orbital Fracture Reconstruction",
      eye: "OS",
      surgeon: isAr ? "د. صوفيا روس" : "Dr. Sophia Ross",
      trays: false,
      vitals: false,
      consent: false,
      anesthesia: false,
      status: "LOCKED"
    }
  ]);

  // Synchronize internal states if parent patient switches
  useEffect(() => {
    // If the patient is already surgery in progress, auto-check everything
    const isSurgInProgress = patient.status === "SURGERY_IN_PROGRESS";
    setLivePatientChecks({
      trays: isSurgInProgress,
      vitals: isSurgInProgress,
      consent: isSurgInProgress,
      anesthesia: isSurgInProgress
    });
  }, [patient.id, patient.status]);

  // Handle cell navigation setting
  const selectCell = (row: number, col: string, valueStr: string) => {
    setActiveCell({ row, col });
    setFormulaBarText(valueStr);
  };

  // Toggle checklist for the live patient cells
  const handleToggleLiveCheck = (key: keyof typeof livePatientChecks) => {
    const nextVal = !livePatientChecks[key];
    setLivePatientChecks(prev => {
      const updated = { ...prev, [key]: nextVal };
      if (activeCell.row === 1) {
        setFormulaBarText(nextVal ? "TRUE" : "FALSE");
      }
      return updated;
    });
  };

  // Toggle checkbox for mock patient rows
  const handleToggleMockCheck = (index: number, key: "trays" | "vitals" | "consent" | "anesthesia") => {
    setMockPatients(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updatedVal = !item[key];
          // Calculate status
          const allOk = updatedVal && 
            (key === "trays" ? item.vitals && item.consent && item.anesthesia :
             key === "vitals" ? item.trays && item.consent && item.anesthesia :
             key === "consent" ? item.trays && item.vitals && item.anesthesia :
             item.trays && item.vitals && item.consent);
          
          const newStatus = allOk ? "READY" : (item.trays || item.vitals || item.consent || item.anesthesia ? "PENDING" : "LOCKED");
          
          const updatedObj = { ...item, [key]: updatedVal, status: newStatus };
          if (activeCell.row === index + 2) {
            setFormulaBarText(updatedVal ? "TRUE" : "FALSE");
          }
          return updatedObj;
        }
        return item;
      })
    );
  };

  // Formulas calculation engine (mimics SUM, COUNTIF, and AVERAGE spreadsheet logic)
  const totalPatients = 1 + mockPatients.length; // Live + Mocks
  const activeChecksLive = Object.values(livePatientChecks).filter(Boolean).length;
  const activeChecksMocks = mockPatients.reduce((acc, current) => {
    return acc + (current.trays ? 1 : 0) + (current.vitals ? 1 : 0) + (current.consent ? 1 : 0) + (current.anesthesia ? 1 : 0);
  }, 0);

  const totalChecksChecked = activeChecksLive + activeChecksMocks;
  const totalPossibleChecks = totalPatients * 4;
  const totalClearancePercent = Math.round((totalChecksChecked / totalPossibleChecks) * 100);

  const patientsClearedCount = 
    (Object.values(livePatientChecks).every(Boolean) ? 1 : 0) +
    mockPatients.filter(m => m.trays && m.vitals && m.consent && m.anesthesia).length;

  // Render text based on formula bar changes
  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaBarText(val);

    // Apply manual TRUE / FALSE keyword entries to active cell
    const isTrue = val.toUpperCase().trim() === "TRUE" || val.trim() === "1" || val.toUpperCase().trim() === "صح";
    const isFalse = val.toUpperCase().trim() === "FALSE" || val.trim() === "0" || val.toUpperCase().trim() === "خطأ";

    if (isTrue || isFalse) {
      const stateBool = isTrue;
      if (activeCell.row === 1) {
        if (activeCell.col === "D") handleToggleLiveCheck("trays");
        if (activeCell.col === "E") handleToggleLiveCheck("vitals");
        if (activeCell.col === "F") handleToggleLiveCheck("consent");
        if (activeCell.col === "G") handleToggleLiveCheck("anesthesia");
      } else {
        const mockIdx = activeCell.row - 2;
        if (mockIdx >= 0 && mockIdx < mockPatients.length) {
          if (activeCell.col === "D") handleToggleMockCheck(mockIdx, "trays");
          if (activeCell.col === "E") handleToggleMockCheck(mockIdx, "vitals");
          if (activeCell.col === "F") handleToggleMockCheck(mockIdx, "consent");
          if (activeCell.col === "G") handleToggleMockCheck(mockIdx, "anesthesia");
        }
      }
    }
  };

  // Dynamic status evaluation for current patient
  const isCurrentPatientReady = Object.values(livePatientChecks).every(Boolean);

  // Trigger auto verification (Bulk verify)
  const triggerSpreadsheetAutoClear = () => {
    setLivePatientChecks({
      trays: true,
      vitals: true,
      consent: true,
      anesthesia: true
    });
    setMockPatients(prev =>
      prev.map(item => ({
        ...item,
        trays: true,
        vitals: true,
        consent: true,
        anesthesia: true,
        status: "READY"
      }))
    );
    if (activeCell.row === 1) {
      setFormulaBarText("TRUE");
    }
  };

  // Final Action trigger to progress patient status to Operating Theater
  const executeLaunchOR = () => {
    if (!isCurrentPatientReady) return;

    const formattedTime = new Date().toLocaleTimeString().slice(0, 5);
    const logAr = `تأكيد بوابة الأمان السريرية لمريض العمليات: تم التحقق من سلامة الأجهزة الطبية، الغازات الحيوية، هوية المريض والمواقع، وموافقة الجراح لتبدأ الجراحة فوراً.`;
    const logEn = `Surgical Theater Clearance Confirmed via Clinical Spreadsheet Board. All WHO checklist protocols checked. Promoting patient status to SURGERY_IN_PROGRESS and routing patient directly to active Operation Table.`;

    const updatedPatient: Patient = {
      ...patient,
      status: "SURGERY_IN_PROGRESS",
      clinicalLogs: [
        ...patient.clinicalLogs,
        {
          timestamp: formattedTime,
          actorRole: isAr ? "جراح العيون المشرف" : "Attending Ophthalmic Surgeon",
          action: "OR Master Clearance Approved",
          notes: isAr ? logAr : logEn
        }
      ]
    };

    onCommenceSurgery(updatedPatient);
  };

  // Eye translation labels
  const getEyeLabel = (eyeCode: string) => {
    switch (eyeCode) {
      case "OD": return isAr ? "العين اليمنى (OD)" : "OD (Right Eye)";
      case "OS": return isAr ? "العين اليسرى (OS)" : "OS (Left Eye)";
      case "OU": return isAr ? "كلتا العينين (OU)" : "OU (Bilateral)";
      default: return isAr ? "غير محدد" : "Not marked";
    }
  };

  const markedEye = patient.triageVitals?.surgicalEyeMarked || "Unmarked";

  return (
    <div className="bg-[#FFFFFF] border border-[#EAE6DF] rounded-3xl p-5 shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] transition-all duration-300 antialiased text-left text-neutral-800">
      
      {/* Spreadsheet Main Brand Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#EAE6DF] pb-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider">
              {isAr ? "نظام الجداول والتعقيم" : "CLINICAL SHEET WORKBOOK"}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              al_jawarih_surgical_or_board_june2026.xlsx
            </span>
          </div>
          <h3 className="text-base font-black text-neutral-900 mt-1 flex items-center gap-2 font-sans tracking-tight">
            <Grid3X3 className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>{isAr ? "لوحة الجداول السريرية الشاملة لغرفة العمليات" : "Ophthalmic Surgical Master Spreadsheet (OR Board)"}</span>
          </h3>
        </div>

        {/* Dynamic global metrics badge */}
        <div className="mt-3 md:mt-0 flex items-center gap-2.5 font-sans">
          <div className="bg-[#FBFBF9] border border-[#EAE6DF] px-3 py-1.5 rounded-2xl text-right">
            <span className="text-[9px] text-neutral-400 uppercase font-mono block leading-[1]">
              {isAr ? "مستوى الأمان السريري" : "WHO COMPLIANCE RATE"}
            </span>
            <span className="text-xs font-black text-emerald-600 font-mono block mt-0.5">
              {totalClearancePercent}%
            </span>
          </div>
          <div className="bg-[#FBFBF9] border border-[#EAE6DF] px-3 py-1.5 rounded-2xl text-right">
            <span className="text-[9px] text-neutral-400 uppercase font-mono block leading-[1]">
              {isAr ? "المرضى المعتمدون" : "CLEARED PATIENTS"}
            </span>
            <span className="text-xs font-black text-indigo-700 font-mono block mt-0.5">
              {patientsClearedCount} / {totalPatients}
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Google Sheets menu simulation */}
      <div className="bg-[#FBFBF9] border border-[#EAE6DF] rounded-2xl p-2 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 font-medium text-neutral-600">
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px] font-bold">
            {isAr ? "ملف" : "File"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px]">
            {isAr ? "تعديل" : "Edit"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px]">
            {isAr ? "عرض" : "View"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px]">
            {isAr ? "إدراج" : "Insert"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px] text-indigo-600 font-bold">
            {isAr ? "التنسيق السريري" : "Format"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px]">
            {isAr ? "بيانات" : "Data"}
          </span>
          <span className="hover:bg-neutral-200/50 px-2.5 py-1 rounded-md cursor-pointer transition text-[11px] text-amber-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "تدقيق الأجهزة" : "Clinical Tools"}
          </span>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2">
          {/* Gridlines toggle */}
          <button
            onClick={() => setShowGridlines(!showGridlines)}
            className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition flex items-center gap-1 ${
              showGridlines 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                : "bg-white border-[#EAE6DF] text-neutral-400"
            }`}
            title="Toggle Spreadsheet Gridlines"
          >
            <span>{showGridlines ? "Gridlines ON" : "Gridlines OFF"}</span>
          </button>

          <button
            onClick={triggerSpreadsheetAutoClear}
            className="p-1.5 font-bold text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 rounded-lg transition"
            title="Auto-fill with mock data values"
          >
            ⚡ Apply Global Mock Clean
          </button>
        </div>
      </div>

      {/* Spreadsheet Toolbar */}
      <div className="border border-[#EAE6DF] bg-[#FBFBF9] rounded-2xl p-2 mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap text-stone-600">
          <button className="p-1.5 hover:bg-neutral-200/50 rounded-lg transition" title="Undo (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-neutral-200/50 rounded-lg transition" title="Redo (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-neutral-200/50 rounded-lg transition" title="Print Sheet">
            <Printer className="w-3.5 h-3.5" />
          </button>
          <span className="w-[1px] h-4 bg-[#EAE6DF] mx-1" />
          
          <span className="text-[11px] font-mono font-bold bg-white border border-[#EAE6DF] px-2 py-1 rounded-md text-stone-700 select-none">
            Outfit / Cairo
          </span>
          
          <span className="text-[11px] font-mono bg-white border border-[#EAE6DF] px-1.5 py-1 rounded-md text-stone-700 select-none">
            10pt
          </span>
          
          <span className="w-[1px] h-4 bg-[#EAE6DF] mx-1" />
          
          <button className="p-1.5 font-bold hover:bg-neutral-200/50 rounded-lg transition" title="Bold">B</button>
          <button className="p-1.5 italic hover:bg-neutral-200/50 rounded-lg transition" title="Italic">I</button>
          <span className="w-[1px] h-4 bg-[#EAE6DF] mx-1" />
          
          <button className="p-1.5 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg text-[9px] font-bold" title="Toggle Risk Highlighting">
            A (Conditional Format)
          </button>
        </div>

        {/* Live Filter Search input inside the Sheet */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={isAr ? "بحث وتصفية خلايا الجدول..." : "Search sheet cells..."}
            value={sheetSearch}
            onChange={(e) => setSheetSearch(e.target.value)}
            className="w-full bg-white border border-[#EAE6DF] rounded-xl pl-8 pr-3 py-2 text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-indigo-650"
          />
        </div>
      </div>

      {/* Formula Bar with active Cell Index and current text */}
      <div className="bg-[#FFFFFF] border border-[#EAE6DF] rounded-2xl p-1.5 mb-4 flex items-center gap-2">
        <div className="bg-[#FBFBF9] border border-[#EAE6DF] px-3 py-1.5 rounded-xl font-mono text-xs text-neutral-600 font-extrabold select-none min-w-[50px] text-center">
          {activeCell.col}{activeCell.row}
        </div>
        <div className="text-neutral-400 font-mono text-[13px] font-black select-none border-r border-[#EAE6DF] pr-3">
          fx
        </div>
        <input
          type="text"
          value={formulaBarText}
          onChange={handleFormulaBarChange}
          placeholder={isAr ? "أدخل قيمة الخلية أو الصيغة الرياضية (مثل =SUM, TRUE)" : "Enter cell value, formula, or type TRUE / FALSE"}
          className="flex-1 bg-transparent border-none text-[11px] font-mono px-2 py-1 text-neutral-800 placeholder-neutral-450 focus:outline-none focus:ring-0"
        />
        <div className="text-[10px] text-neutral-400 font-mono px-2 select-none hidden lg:block">
          {isAr ? "اضغط إنتر للحفظ" : "Press TRUE/FALSE to toggle checkboxes"}
        </div>
      </div>

      {/* Warning notification regarding active risk highlights inside the sheet */}
      {!isCurrentPatientReady && (
        <div className="mb-4 bg-amber-50/70 border border-amber-200 text-amber-800 p-3 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase text-[9px] tracking-wide block">{isAr ? "تنبيه معايير سلامة المرضى" : "Pre-Op Clearance Block"}</span>
            <p>
              {isAr
                ? `الملف الطبي للمريض الحالي (${patient.name}) يسجل معايير غير مكتملة (FALSE) بالخلايا. يرجى تعديل الخلايا إلى TRUE لتفعيل خيار تفويض الجراحة.`
                : `Current Patient (${patient.name}) has unconfirmed safety parameters in rows D through G. Toggle the spreadsheet cells to TRUE to unlock 'Commence Surgery' authorization.`}
            </p>
          </div>
        </div>
      )}

      {/* SPREADSHEET INTERNAL CONTENT CANVAS */}
      <div className="overflow-x-auto border border-[#EAE6DF] rounded-2xl shadow-inner bg-[#FBFBF9]">
        
        {/* Render Tab 1: OR_QUEUE SHEET */}
        {activeSheetTab === "OR_QUEUE" && (
          <table className={`w-full min-w-[850px] border-collapse bg-white font-sans text-xs ${showGridlines ? 'divide-y divide-[#EAE6DF]' : ''}`}>
            {/* Column Letter Headers (Excel index row) */}
            <thead>
              <tr className="bg-[#F3F1ED] text-[10px] text-stone-500 font-mono select-none h-6">
                <th className="w-10 border border-[#EAE6DF] bg-[#EAE6DF]/60 text-center font-bold"></th>
                <th className="border border-[#EAE6DF] text-center w-[150px]">A</th>
                <th className="border border-[#EAE6DF] text-center w-[180px]">B</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">C</th>
                <th className="border border-[#EAE6DF] text-center w-[85px]">D</th>
                <th className="border border-[#EAE6DF] text-center w-[85px]">E</th>
                <th className="border border-[#EAE6DF] text-center w-[85px]">F</th>
                <th className="border border-[#EAE6DF] text-center w-[85px]">G</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">H</th>
                <th className="border border-[#EAE6DF] text-center w-[120px]">I</th>
              </tr>
              {/* English Label row mirroring headers */}
              <tr className="bg-[#FAF9F6] text-[10px] text-stone-600 font-mono select-none h-7 uppercase tracking-wide">
                <th className="border border-[#EAE6DF] bg-[#EAE6DF]/40 text-center font-bold font-sans">#</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "المريض والمعرف" : "Patient Name & MRN"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "الإجراء الجراحي" : "Surgical Procedure"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "موقع العين" : "Target Eye"}</th>
                <th className="border border-[#EAE6DF] px-1 text-center bg-indigo-50/10 text-indigo-800 font-bold">{isAr ? "تعقيم الأدوات" : "Sterile Tray"}</th>
                <th className="border border-[#EAE6DF] px-1 text-center bg-indigo-50/10 text-indigo-800 font-bold">{isAr ? "العلامات مستقرة" : "Vitals Clear"}</th>
                <th className="border border-[#EAE6DF] px-1 text-center bg-indigo-50/10 text-indigo-800 font-bold">{isAr ? "الموافقة الموقعة" : "Consent Signed"}</th>
                <th className="border border-[#EAE6DF] px-1 text-center bg-indigo-50/10 text-indigo-800 font-bold">{isAr ? "تخدير جاهز" : "Anesthesia Ready"}</th>
                <th className="border border-[#EAE6DF] px-1 text-center font-bold">{isAr ? "حالة الأمان" : "Safety Stage"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center bg-indigo-50/10 text-indigo-900 font-bold">{isAr ? "أفعال تفويض" : "OR Command"}</th>
              </tr>
            </thead>
            <tbody>
              
              {/* ROW 1: THE CURRENT LIVE OPTOMETRY/CLINIC PATIENT PROP */}
              <tr 
                onClick={() => selectCell(1, "A", patient.name)}
                className={`group h-11 transition-all ${
                  activeCell.row === 1 ? "bg-amber-500/5 ring-1 ring-amber-400/20" : "hover:bg-[#FBFBF9]"
                }`}
              >
                {/* Spreadsheet Row Number Left Handle */}
                <td className="border border-[#EAE6DF] bg-[#F1EFEA]/80 font-mono text-[10px] text-stone-500 font-bold text-center select-none w-10">
                  1
                </td>

                {/* Col A: Name & ID with distinctive Active Patient Indicator */}
                <td 
                  onClick={() => selectCell(1, "A", patient.name)}
                  className={`border px-2 text-left ${activeCell.row === 1 && activeCell.col === "A" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white shadow-sm" title="Active workstation selection" />
                      {patient.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-450 uppercase leading-none mt-0.5">{patient.id} (CURRENT DIRECT)</span>
                  </div>
                </td>

                {/* Col B: Procedural Category mapped */}
                <td 
                  onClick={() => selectCell(1, "B", isAr ? "جراحة إزالة المياه البيضاء المتطورة" : "Advanced Phacoemulsification Surgery")}
                  className={`border px-2 text-left ${activeCell.row === 1 && activeCell.col === "B" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                >
                  <div className="font-mono text-[11px] font-medium text-stone-700">
                    {patient.optometryDossier?.subjectiveRefraction 
                      ? (isAr ? "جراحة المياه البيضاء الفاكو + زراعة عدسة (+21.5D)" : "Phacoemulsification Cat. Core (+21.5D)")
                      : (isAr ? "تدخل عيني مخصص من غرف العمليات" : "Comprehensive Ocular OR Care")}
                  </div>
                </td>

                {/* Col C: Targeted surgical eye */}
                <td 
                  onClick={() => selectCell(1, "C", getEyeLabel(markedEye))}
                  className={`border px-2 text-center ${activeCell.row === 1 && activeCell.col === "C" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                >
                  <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase ${markedEye !== "Unmarked" ? "text-indigo-700 font-mono" : "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"}`}>
                    <Eye className="w-3 h-3 text-indigo-500" />
                    {markedEye !== "Unmarked" ? markedEye : (isAr ? "لم تحدد!" : "UNMARKED")}
                  </span>
                </td>

                {/* Col D: Checkbox for STERILE TRAY */}
                <td 
                  onClick={() => {
                    selectCell(1, "D", livePatientChecks.trays ? "TRUE" : "FALSE");
                    handleToggleLiveCheck("trays");
                  }}
                  className={`border text-center cursor-pointer select-none transition ${
                    livePatientChecks.trays ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                  } ${activeCell.row === 1 && activeCell.col === "D" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={livePatientChecks.trays}
                      onChange={() => {}} // Controlled by cell click action
                      className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                    />
                  </div>
                </td>

                {/* Col E: Checkbox for VITALS STABLE */}
                <td 
                  onClick={() => {
                    selectCell(1, "E", livePatientChecks.vitals ? "TRUE" : "FALSE");
                    handleToggleLiveCheck("vitals");
                  }}
                  className={`border text-center cursor-pointer select-none transition ${
                    livePatientChecks.vitals ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                  } ${activeCell.row === 1 && activeCell.col === "E" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={livePatientChecks.vitals}
                      onChange={() => {}}
                      className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                    />
                  </div>
                </td>

                {/* Col F: Checkbox for CONSENT SIGNED */}
                <td 
                  onClick={() => {
                    selectCell(1, "F", livePatientChecks.consent ? "TRUE" : "FALSE");
                    handleToggleLiveCheck("consent");
                  }}
                  className={`border text-center cursor-pointer select-none transition ${
                    livePatientChecks.consent ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                  } ${activeCell.row === 1 && activeCell.col === "F" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={livePatientChecks.consent}
                      onChange={() => {}}
                      className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                    />
                  </div>
                </td>

                {/* Col G: Checkbox for ANESTHESIA BLOCKED */}
                <td 
                  onClick={() => {
                    selectCell(1, "G", livePatientChecks.anesthesia ? "TRUE" : "FALSE");
                    handleToggleLiveCheck("anesthesia");
                  }}
                  className={`border text-center cursor-pointer select-none transition ${
                    livePatientChecks.anesthesia ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                  } ${activeCell.row === 1 && activeCell.col === "G" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={livePatientChecks.anesthesia}
                      onChange={() => {}}
                      className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                    />
                  </div>
                </td>

                {/* Col H: Clearance level status pill */}
                <td 
                  onClick={() => selectCell(1, "H", isCurrentPatientReady ? "READY" : "LOCKED")}
                  className={`border text-center font-bold ${activeCell.row === 1 && activeCell.col === "H" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                >
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    isCurrentPatientReady
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-250 font-mono"
                      : "bg-amber-50 text-amber-700 border border-amber-200 font-mono"
                  }`}>
                    {isCurrentPatientReady ? (
                      <>
                        <Unlock className="w-2.5 h-2.5" />
                        {isAr ? "معتمد جاهز" : "READY OR"}
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5" />
                        {isAr ? "مغلق سريرياً" : "LOCKED PRE"}
                      </>
                    )}
                  </span>
                </td>

                {/* Col I: Launch action button */}
                <td className="border border-[#EAE6DF] px-2 text-center bg-[#FBFBF9]/30">
                  {patient.status === "SURGERY_IN_PROGRESS" ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? "مستمر بالعمليات" : "IN PROGRESS"}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!isCurrentPatientReady}
                      onClick={(e) => {
                        e.stopPropagation();
                        executeLaunchOR();
                      }}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                        isCurrentPatientReady
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
                          : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                      }`}
                    >
                      {isAr ? "بدء الجراحة ➔" : "Commence OR ➔"}
                    </button>
                  )}
                </td>
              </tr>

              {/* MOCK SCHEDULE ROW ENTRIES FOR A ROBUST OR LOG */}
              {mockPatients
                .filter(m => sheetSearch === "" || m.name.toLowerCase().includes(sheetSearch.toLowerCase()) || m.procedure.toLowerCase().includes(sheetSearch.toLowerCase()))
                .map((mPat, index) => {
                  const rIdx = index + 2;
                  const isReady = mPat.trays && mPat.vitals && mPat.consent && mPat.anesthesia;
                  return (
                    <tr 
                      key={mPat.id}
                      onClick={() => selectCell(rIdx, "A", mPat.name)}
                      className={`group h-11 transition-all ${activeCell.row === rIdx ? "bg-amber-500/5" : "hover:bg-[#FBFBF9]"}`}
                    >
                      {/* Left row index */}
                      <td className="border border-[#EAE6DF] bg-[#F1EFEA]/80 font-mono text-[10px] text-stone-500 font-bold text-center select-none w-10">
                        {rIdx}
                      </td>

                      {/* Col A: Name */}
                      <td 
                        onClick={() => selectCell(rIdx, "A", mPat.name)}
                        className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "A" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800">{mPat.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400">{mPat.id} (Scheduled)</span>
                        </div>
                      </td>

                      {/* Col B: Procedure */}
                      <td 
                        onClick={() => selectCell(rIdx, "B", mPat.procedure)}
                        className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "B" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                      >
                        <span className="text-neutral-600 font-medium text-[11px] leading-relaxed">{mPat.procedure}</span>
                      </td>

                      {/* Col C: Eye */}
                      <td 
                        onClick={() => selectCell(rIdx, "C", getEyeLabel(mPat.eye))}
                        className={`border px-2 text-center ${activeCell.row === rIdx && activeCell.col === "C" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                      >
                        <span className="font-mono text-[10px] font-bold text-neutral-500">
                          {mPat.eye}
                        </span>
                      </td>

                      {/* Col D: Checkbox Sterile Tray */}
                      <td 
                        onClick={() => {
                          selectCell(rIdx, "D", mPat.trays ? "TRUE" : "FALSE");
                          handleToggleMockCheck(index, "trays");
                        }}
                        className={`border text-center cursor-pointer select-none transition ${
                          mPat.trays ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                        } ${activeCell.row === rIdx && activeCell.col === "D" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={mPat.trays}
                            onChange={() => {}}
                            className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                          />
                        </div>
                      </td>

                      {/* Col E: Checkbox Vitals Clear */}
                      <td 
                        onClick={() => {
                          selectCell(rIdx, "E", mPat.vitals ? "TRUE" : "FALSE");
                          handleToggleMockCheck(index, "vitals");
                        }}
                        className={`border text-center cursor-pointer select-none transition ${
                          mPat.vitals ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                        } ${activeCell.row === rIdx && activeCell.col === "E" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={mPat.vitals}
                            onChange={() => {}}
                            className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                          />
                        </div>
                      </td>

                      {/* Col F: Checkbox Consent Signed */}
                      <td 
                        onClick={() => {
                          selectCell(rIdx, "F", mPat.consent ? "TRUE" : "FALSE");
                          handleToggleMockCheck(index, "consent");
                        }}
                        className={`border text-center cursor-pointer select-none transition ${
                          mPat.consent ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                        } ${activeCell.row === rIdx && activeCell.col === "F" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={mPat.consent}
                            onChange={() => {}}
                            className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                          />
                        </div>
                      </td>

                      {/* Col G: Checkbox Anesthesia block */}
                      <td 
                        onClick={() => {
                          selectCell(rIdx, "G", mPat.anesthesia ? "TRUE" : "FALSE");
                          handleToggleMockCheck(index, "anesthesia");
                        }}
                        className={`border text-center cursor-pointer select-none transition ${
                          mPat.anesthesia ? "bg-emerald-500/10" : "bg-rose-500/5 hover:bg-neutral-100"
                        } ${activeCell.row === rIdx && activeCell.col === "G" ? 'border-2 border-indigo-600' : 'border-[#EAE6DF]'}`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={mPat.anesthesia}
                            onChange={() => {}}
                            className="rounded border-[#EAE6DF] h-4 w-4 text-emerald-600 focus:ring-0 pointer-events-none"
                          />
                        </div>
                      </td>

                      {/* Col H: Calculated clearance pill status */}
                      <td 
                        onClick={() => selectCell(rIdx, "H", isReady ? "READY" : "LOCKED")}
                        className={`border text-center font-bold ${activeCell.row === rIdx && activeCell.col === "H" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}
                      >
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-semibold ${
                          isReady 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-250 font-mono"
                            : "bg-amber-50 text-amber-700 border border-amber-200 font-mono"
                        }`}>
                          {isReady ? (
                            <>
                              <Unlock className="w-2.5 h-2.5" />
                              {isAr ? "معتمد جاهز" : "READY OR"}
                            </>
                          ) : (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              {isAr ? "قيد التدقيق" : "PENDING"}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Col I: Mock Action - Status displays */}
                      <td className="border border-[#EAE6DF] text-center px-2 bg-[#FBFBF9]/30 text-[10px] text-stone-400 font-mono">
                        {isReady ? (
                          <span className="text-emerald-600 font-black">✓ {isAr ? "مرخص للنقل" : "RELEASE READY"}</span>
                        ) : (
                          <span>⛔ {isAr ? "موقوف مؤقتاً" : "STATION HELD"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {/* SPREADSHEET FORMULA SUMMARY ROW AT THE BOTTOM */}
              <tr className="bg-[#FAF9F6] h-10 select-none text-[11px] font-bold text-neutral-800 border-t-2 border-[#EAE6DF]">
                <td className="border border-[#EAE6DF] bg-[#F1EFEA]/90 text-stone-500 font-mono text-center font-bold">
                  6:8
                </td>
                
                {/* Formulas Name Summary column */}
                <td className="border border-[#EAE6DF] px-2 text-left text-indigo-700 font-bold font-mono">
                  {`=COUNTA(A2:A5)`}
                  <span className="text-[10px] text-stone-500 font-sans block font-normal">
                    {totalPatients} Patients Registrations
                  </span>
                </td>

                <td className="border border-[#EAE6DF] px-2 text-left italic text-stone-450 font-sans leading-tight">
                  Autosum and conditional clearance checks calculated in real-time.
                </td>

                <td className="border border-[#EAE6DF] text-center font-mono text-[10px] text-stone-400">
                  Target (OU)
                </td>

                {/* Col D SUMPRODUCT / COUNTIF Sterile Trays ratio */}
                <td className="border border-[#EAE6DF] text-center bg-indigo-50/10 text-neutral-700 font-mono">
                  {`=COUNTIF(D)`}
                  <span className="text-emerald-700 font-black block text-[10px]">
                    {((livePatientChecks.trays ? 1 : 0) + mockPatients.filter(m => m.trays).length)} / {totalPatients}
                  </span>
                </td>

                {/* Col E Vitals count cleared */}
                <td className="border border-[#EAE6DF] text-center bg-indigo-50/10 text-neutral-700 font-mono">
                  {`=COUNTIF(E)`}
                  <span className="text-emerald-700 font-black block text-[10px]">
                    {((livePatientChecks.vitals ? 1 : 0) + mockPatients.filter(m => m.vitals).length)} / {totalPatients}
                  </span>
                </td>

                {/* Col F Consents count signed */}
                <td className="border border-[#EAE6DF] text-center bg-indigo-50/10 text-neutral-700 font-mono">
                  {`=COUNTIF(F)`}
                  <span className="text-emerald-700 font-black block text-[10px]">
                    {((livePatientChecks.consent ? 1 : 0) + mockPatients.filter(m => m.consent).length)} / {totalPatients}
                  </span>
                </td>

                {/* Col G Anesthesia blocks given */}
                <td className="border border-[#EAE6DF] text-center bg-indigo-50/10 text-neutral-700 font-mono">
                  {`=COUNTIF(G)`}
                  <span className="text-emerald-700 font-black block text-[10px]">
                    {((livePatientChecks.anesthesia ? 1 : 0) + mockPatients.filter(m => m.anesthesia).length)} / {totalPatients}
                  </span>
                </td>

                {/* Col H: Clearance level formula percentage */}
                <td className="border border-[#EAE6DF] text-center text-emerald-700 font-mono bg-[#FAF9F6]">
                  {`=PERCENTIF()`}
                  <span className="text-indigo-800 font-black block text-xs">
                    {totalClearancePercent}%
                  </span>
                </td>

                {/* Col I: Bottom Action corner */}
                <td className="border border-[#EAE6DF] text-center text-[9px] text-stone-400 font-mono">
                  SHEET_END_EOF
                </td>
              </tr>

            </tbody>
          </table>
        )}

        {/* Render Tab 2: BED_WARD BED MAPS SHEET */}
        {activeSheetTab === "BED_WARD" && (
          <table className={`w-full min-w-[850px] border-collapse bg-white font-sans text-xs ${showGridlines ? 'divide-y divide-[#EAE6DF]' : ''}`}>
            <thead>
              <tr className="bg-[#F3F1ED] text-[10px] text-stone-500 font-mono select-none h-6">
                <th className="w-10 border border-[#EAE6DF] bg-[#EAE6DF]/60 text-center font-bold"></th>
                <th className="border border-[#EAE6DF] text-center w-[120px]">A</th>
                <th className="border border-[#EAE6DF] text-center w-[150px]">B</th>
                <th className="border border-[#EAE6DF] text-center w-[180px]">C</th>
                <th className="border border-[#EAE6DF] text-center w-[180px]">D</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">E</th>
                <th className="border border-[#EAE6DF] text-center w-[120px]">F</th>
              </tr>
              <tr className="bg-[#FAF9F6] text-[10px] text-stone-600 font-mono select-none h-7 uppercase tracking-wide">
                <th className="border border-[#EAE6DF] bg-[#EAE6DF]/40 text-center font-bold font-sans">#</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "رقم الغرفة" : "Room Identifier"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "فئة الجناح" : "Ward Cluster Category"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "السرير أ (المريض الحاد)" : "Bed A Patient"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "السرير ب (تحت الملاحظة)" : "Bed B Patient"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "حالة النظام الغذائي" : "Nutritional fasting"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "رصد تخطيط القلب" : "ECG Telemetry State"}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { room: "VIP-101", ward: "Ophthalmic Deluxe Suite", bedA: patient.name + " (" + patient.id + ")", bedB: "[VACANT BED_CLEARED]", fasting: "NPO (Fasting 8h)", telemetry: "ACTIVE" },
                { room: "WARD-M102", ward: "Male Post-Op Surgical", bedA: "Edward Smith", bedB: "Yousef Al-Otaibi", fasting: "Clear Liquids Only", telemetry: "MONITORING" },
                { room: "WARD-F103", ward: "Female Post-Op Surgical", bedA: "Fatima Al-Harbi", bedB: "Sara Ahmed", fasting: "Full Diet Approved", telemetry: "ACTIVE" },
                { room: "DAY-CARE-20", ward: "Refractive Outpatient Wing", bedA: "Rashid Salem Al-Dossari", bedB: "[VACANT FOR DAY_CARE]", fasting: "NPO (Fasting 6h)", telemetry: "INACTIVE" },
                { room: "ER-HOLDING_1", ward: "Acute Orbital Trauma Unit", bedA: "Lydia Vance (Post-Surg)", bedB: "Ali Reda Al-Majid", fasting: "NPO (Fasting 12h)", telemetry: "STAT ALERT" }
              ].map((rowObj, index) => {
                const rIdx = index + 1;
                return (
                  <tr 
                    key={rowObj.room}
                    onClick={() => selectCell(rIdx, "A", rowObj.room)}
                    className={`group h-11 transition-all ${activeCell.row === rIdx ? "bg-amber-500/5" : "hover:bg-[#FBFBF9]"}`}
                  >
                    <td className="border border-[#EAE6DF] bg-[#F1EFEA]/80 font-mono text-[10px] text-stone-500 font-bold text-center select-none w-10">
                      {rIdx}
                    </td>

                    <td className={`border px-2 text-left font-mono font-bold text-neutral-800 ${activeCell.row === rIdx && activeCell.col === "A" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      {rowObj.room}
                    </td>

                    <td className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "B" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className="text-stone-500">{rowObj.ward}</span>
                    </td>

                    <td className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "C" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className="font-extrabold text-[#4F46E5]">{rowObj.bedA}</span>
                    </td>

                    <td className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "D" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className={rowObj.bedB.includes("VACANT") ? "text-emerald-600 italic font-medium" : "text-stone-700 font-bold"}>
                        {rowObj.bedB}
                      </span>
                    </td>

                    <td className={`border px-2 text-center ${activeCell.row === rIdx && activeCell.col === "E" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rowObj.fasting.includes("NPO") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {rowObj.fasting}
                      </span>
                    </td>

                    <td className={`border px-2 text-center ${activeCell.row === rIdx && activeCell.col === "F" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        rowObj.telemetry.includes("STAT") ? "bg-red-500 text-white animate-pulse" :
                        rowObj.telemetry === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {rowObj.telemetry}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Render Tab 3: CSSD AUTOCLAVE STERILE LOG */}
        {activeSheetTab === "STERILE_LOG" && (
          <table className={`w-full min-w-[850px] border-collapse bg-white font-sans text-xs ${showGridlines ? 'divide-y divide-[#EAE6DF]' : ''}`}>
            <thead>
              <tr className="bg-[#F3F1ED] text-[10px] text-stone-500 font-mono select-none h-6">
                <th className="w-10 border border-[#EAE6DF] bg-[#EAE6DF]/60 text-center font-bold"></th>
                <th className="border border-[#EAE6DF] text-center w-[140px]">A</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">B</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">C</th>
                <th className="border border-[#EAE6DF] text-center w-[120px]">D</th>
                <th className="border border-[#EAE6DF] text-center w-[150px]">E</th>
                <th className="border border-[#EAE6DF] text-center w-[120px]">F</th>
                <th className="border border-[#EAE6DF] text-center w-[100px]">G</th>
              </tr>
              <tr className="bg-[#FAF9F6] text-[10px] text-stone-600 font-mono select-none h-7 uppercase tracking-wide">
                <th className="border border-[#EAE6DF] bg-[#EAE6DF]/40 text-center font-bold font-sans">#</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "رقم دفعة التعقيم" : "Autoclave Lot ID"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "حرارة الغرفة" : "Chamber Temp"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "الضغط الجوي" : "Steam Pressure"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "زمن التعقيم الدقيق" : "Exposure Hold"}</th>
                <th className="border border-[#EAE6DF] px-2 text-left">{isAr ? "نوع الصينية والأدوات" : "Surgical Tray Lot"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "المؤشر الحيوي Lot" : "Biological Vial Lot"}</th>
                <th className="border border-[#EAE6DF] px-2 text-center">{isAr ? "قرار الإفراج" : "Autoclave Release"}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { lot: "ST-2026-613A", temp: "134.5 °C", press: "2.12 bar", time: "4.5 min", load: "Phaco / Cataract Tray Set #1", bioLot: "BIO-V-221 (Negative)", status: "RELEASED" },
                { lot: "ST-2026-613B", temp: "134.2 °C", press: "2.10 bar", time: "4.5 min", load: "ENT Micro Otitis Forceps", bioLot: "BIO-V-223 (Negative)", status: "RELEASED" },
                { lot: "ST-2026-613C", temp: "121.0 °C (Rubber)", press: "1.15 bar", time: "15.0 min", load: "Silicon Suture eye bands OU", bioLot: "BIO-V-224 (Negative)", status: "RELEASED" },
                { lot: "ST-2026-613D", temp: "134.8 °C", press: "2.15 bar", time: "5.0 min", load: "Deluxe Titanium implant cassettes", bioLot: "BIO-V-229 (Negative)", status: "RELEASED" },
                { lot: "ST-2026-613E_PREP", temp: "98.2 °C (Heating)", press: "0.45 bar", time: "Calibration", load: "Orbit Micro Bone drill kits", bioLot: "BIO-V-232 (Pending)", status: "HOLD_HEATING" }
              ].map((rowObj, index) => {
                const rIdx = index + 1;
                return (
                  <tr 
                    key={rowObj.lot}
                    onClick={() => selectCell(rIdx, "A", rowObj.lot)}
                    className={`group h-11 transition-all ${activeCell.row === rIdx ? "bg-amber-500/5" : "hover:bg-[#FBFBF9]"}`}
                  >
                    <td className="border border-[#EAE6DF] bg-[#F1EFEA]/80 font-mono text-[10px] text-stone-500 font-bold text-center select-none w-10">
                      {rIdx}
                    </td>

                    <td className={`border px-2 text-left font-mono font-bold text-stone-800 ${activeCell.row === rIdx && activeCell.col === "A" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      {rowObj.lot}
                    </td>

                    <td className={`border px-2 text-center font-mono ${activeCell.row === rIdx && activeCell.col === "B" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className="text-emerald-700 font-extrabold">{rowObj.temp}</span>
                    </td>

                    <td className={`border px-2 text-center font-mono ${activeCell.row === rIdx && activeCell.col === "C" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span>{rowObj.press}</span>
                    </td>

                    <td className={`border px-2 text-left font-mono ${activeCell.row === rIdx && activeCell.col === "D" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span>{rowObj.time}</span>
                    </td>

                    <td className={`border px-2 text-left ${activeCell.row === rIdx && activeCell.col === "E" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className="text-neutral-700 font-bold">{rowObj.load}</span>
                    </td>

                    <td className={`border px-2 text-center ${activeCell.row === rIdx && activeCell.col === "F" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className="text-stone-500 font-mono text-[11px]">{rowObj.bioLot}</span>
                    </td>

                    <td className={`border px-2 text-center ${activeCell.row === rIdx && activeCell.col === "G" ? 'border-2 border-indigo-600 bg-white' : 'border-[#EAE6DF]'}`}>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        rowObj.status === "RELEASED" ? "bg-emerald-50 text-emerald-700 border border-emerald-250 font-mono" : "bg-amber-50 text-amber-700 border border-amber-200 font-mono animate-pulse"
                      }`}>
                        {rowObj.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </div>

      {/* Hospital Workspace Sheet Tabs footer mimicking Excel / Google Sheets exactly */}
      <div className="bg-[#FAF9F6] border-x border-b border-[#EAE6DF] rounded-b-2xl p-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {/* Circular plus button mimicking Google Sheets tab creation */}
          <button className="p-1 hover:bg-neutral-200 rounded-full transition text-stone-500 shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </button>
          
          <span className="w-[1px] h-4 bg-[#EAE6DF] mx-1 shrink-0" />

          {/* Tab 1 button */}
          <button
            onClick={() => {
              setActiveSheetTab("OR_QUEUE");
              setActiveCell({ row: 1, col: "A" });
              setFormulaBarText(patient.name);
            }}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border-t-2 ${
              activeSheetTab === "OR_QUEUE"
                ? "bg-white text-indigo-700 border-indigo-650 rounded-b-none shadow-sm"
                : "bg-transparent text-stone-500 border-transparent hover:bg-neutral-200/50 rounded-lg"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{isAr ? "قائمة العمليات الجراحية" : "🟢 Active OR Queue"}</span>
          </button>

          {/* Tab 2 button */}
          <button
            onClick={() => {
              setActiveSheetTab("BED_WARD");
              setActiveCell({ row: 1, col: "A" });
              setFormulaBarText("VIP-101");
            }}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border-t-2 ${
              activeSheetTab === "BED_WARD"
                ? "bg-white text-indigo-700 border-indigo-650 rounded-b-none shadow-sm"
                : "bg-transparent text-stone-500 border-transparent hover:bg-neutral-200/50 rounded-lg"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{isAr ? "خريطة الأسرّة والأجنحة" : "📊 Bed Allocations & Wards"}</span>
          </button>

          {/* Tab 3 button */}
          <button
            onClick={() => {
              setActiveSheetTab("STERILE_LOG");
              setActiveCell({ row: 1, col: "A" });
              setFormulaBarText("ST-2026-613A");
            }}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border-t-2 ${
              activeSheetTab === "STERILE_LOG"
                ? "bg-white text-indigo-700 border-indigo-650 rounded-b-none shadow-sm"
                : "bg-transparent text-stone-500 border-transparent hover:bg-neutral-200/50 rounded-lg"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>{isAr ? "سجل تعقيم الأدوات CSSD" : "📋 Sterile supply CSSD"}</span>
          </button>
        </div>

        {/* Action Button to trigger the live patient gateway proceed */}
        <div className="flex items-center gap-2">
          {activeSheetTab === "OR_QUEUE" && (
            <>
              {patient.status === "SURGERY_IN_PROGRESS" ? (
                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-3 py-2 border border-emerald-200 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? "تم إرسال المريض ومباشرة الجراحة!" : "PRE-OP COMPLIANCE CLEARED: IN OR"}</span>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!isCurrentPatientReady}
                  onClick={executeLaunchOR}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-300 active:scale-[0.98] flex items-center gap-2 ${
                    isCurrentPatientReady
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-1 ring-indigo-500/10 cursor-pointer"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                  }`}
                >
                  <Unlock className="w-4 h-4 shrink-0" />
                  <span>{isAr ? "تفويض دخول صالة العمليات ➔" : "Authorize Surgical Theater ➔"}</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>

      {/* Spreadsheet Instructions Info-Footer block */}
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-neutral-400 font-sans">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>
          {isAr
            ? "أدخل القيم مباشرة بالضغط على الخلايا (D إلى G) لتغيير حالات التحقق السريري (TRUE / FALSE) وتفعيل معايير سلامة الأجهزة لتجاوز النفق المؤدي للعمليات."
            : "Google-Sheet Interface: Click grid cells (Columns D through G) to toggle boolean clearance or type values into the formula bar. Enforces 100% WHO safety standard compliance."}
        </span>
      </div>

    </div>
  );
}
