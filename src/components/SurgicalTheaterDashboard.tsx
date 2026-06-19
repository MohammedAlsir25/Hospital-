/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Grid3X3,
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
  Settings,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Layers,
  Sparkle,
  Grid,
  Lock,
  Unlock
} from "lucide-react";
import { Patient, PatientStatus } from "../types";

export interface SurgicalTheaterDashboardProps {
  patient: Patient;
  onUpdatePatient?: (updatedPatient: Patient) => void;
  language?: "en" | "ar";
}

interface SpreadsheetRow {
  id: string; // Internal cell row identifier
  room: string; // Column A: Room
  patientName: string; // Column B: Patient Name
  procedure: string; // Column C: Procedure
  surgeon: string; // Column D: Surgeon
  anesthesiaStatus: "GENERAL" | "LOCAL" | "BLOCKED" | "PENDING"; // Column E: Anesthesia Status
  sterileTrayStatus: "STERILE" | "PENDING" | "CLEARED" | "REFITTED"; // Column F: Sterile Tray Status
  status: "READY" | "IN_PROGRESS" | "POST_OP" | "STAGED";
  urgency: "HIGH" | "ROUTINE" | "STAT";
}

export default function SurgicalTheaterDashboard({
  patient,
  onUpdatePatient,
  language = "en"
}: SurgicalTheaterDashboardProps) {
  const isAr = language === "ar";

  // Spreadsheet state toggles
  const [showGridlines, setShowGridlines] = useState(true);
  const [activeCell, setActiveCell] = useState<{ row: number; col: string }>({ row: 1, col: "B" });
  const [formulaBarText, setFormulaBarText] = useState("");
  const [validationAlert, setValidationAlert] = useState<string | null>(null);
  const [sheetSearch, setSheetSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"ALL" | "STAT" | "HIGH" | "ROUTINE">("ALL");

  const [rows, setRows] = useState<SpreadsheetRow[]>([]);

  // Synchronize Row 1 with parent 'patient' prop changes instantly
  useEffect(() => {
    setRows(prev =>
      prev.map(r => {
        if (r.id === "ROW_1") {
          return {
            ...r,
            patientName: patient.name,
            procedure: patient.clinicalTriageFlags?.chiefComplaint || r.procedure,
            status: patient.status === "SURGERY_IN_PROGRESS" ? "IN_PROGRESS" : "STAGED"
          };
        }
        return r;
      })
    );
  }, [patient.name, patient.status, patient.clinicalTriageFlags]);

  // Cell Selection action
  const handleCellSelect = (rowIdx: number, colKey: string, currentVal: string) => {
    setActiveCell({ row: rowIdx, col: colKey });
    setFormulaBarText(currentVal);
    setValidationAlert(null);
  };

  // Grid Update executor (saves edits from formula bar into target spreadsheet cells)
  const applyCellEdit = (rowIdx: number, colKey: string, newValue: string) => {
    setRows(prev =>
      prev.map((r, idx) => {
        if (idx === rowIdx) {
          const updated = { ...r };
          switch (colKey) {
            case "A":
              updated.room = newValue;
              break;
            case "B":
              updated.patientName = newValue;
              // If we are updating Row 1 patient name, invoke onUpdatePatient if passed to keep master in sync
              if (rowIdx === 0 && onUpdatePatient) {
                onUpdatePatient({ ...patient, name: newValue });
              }
              break;
            case "C":
              updated.procedure = newValue;
              break;
            case "D":
              updated.surgeon = newValue;
              break;
            case "E":
              // Anesthesia ENUM check
              const cleanAnes = newValue.toUpperCase().trim();
              if (["GENERAL", "LOCAL", "BLOCKED", "PENDING"].includes(cleanAnes)) {
                updated.anesthesiaStatus = cleanAnes as any;
              } else {
                setValidationAlert(
                  isAr 
                    ? "قيمة التخدير غير صالحة. الرجاء إدخال: GENERAL أو LOCAL أو BLOCKED أو PENDING"
                    : "Invalid Anesthesia value. Use GENERAL, LOCAL, BLOCKED, or PENDING."
                );
              }
              break;
            case "F":
              // Sterile Tray ENUM check
              const cleanSterile = newValue.toUpperCase().trim();
              if (["STERILE", "PENDING", "CLEARED", "REFITTED"].includes(cleanSterile)) {
                updated.sterileTrayStatus = cleanSterile as any;
              } else {
                setValidationAlert(
                  isAr
                    ? "قيمة التعقيم غير صالحة. الرجاء إدخال: STERILE أو PENDING أو CLEARED أو REFITTED"
                    : "Invalid Sterile value. Use STERILE, PENDING, CLEARED, or REFITTED."
                );
              }
              break;
            default:
              break;
          }
          return updated;
        }
        return r;
      })
    );
  };

  // Listen to keyboard or formula prompt submission
  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetIdx = activeCell.row - 1;
    if (targetIdx >= 0 && targetIdx < rows.length) {
      applyCellEdit(targetIdx, activeCell.col, formulaBarText);
    }
  };

  // Fast dropdown toggler for status cells
  const quickToggleAnesthesia = (rowIdx: number, current: string) => {
    const states: ("GENERAL" | "LOCAL" | "BLOCKED" | "PENDING")[] = ["GENERAL", "LOCAL", "BLOCKED", "PENDING"];
    const nextIdx = (states.indexOf(current as any) + 1) % states.length;
    const nextVal = states[nextIdx];
    
    setRows(prev => prev.map((r, idx) => idx === rowIdx ? { ...r, anesthesiaStatus: nextVal } : r));
    if (activeCell.row === rowIdx + 1 && activeCell.col === "E") {
      setFormulaBarText(nextVal);
    }
  };

  const quickToggleSterile = (rowIdx: number, current: string) => {
    const states: ("STERILE" | "PENDING" | "CLEARED" | "REFITTED")[] = ["STERILE", "PENDING", "CLEARED", "REFITTED"];
    const nextIdx = (states.indexOf(current as any) + 1) % states.length;
    const nextVal = states[nextIdx];
    
    setRows(prev => prev.map((r, idx) => idx === rowIdx ? { ...r, sterileTrayStatus: nextVal } : r));
    if (activeCell.row === rowIdx + 1 && activeCell.col === "F") {
      setFormulaBarText(nextVal);
    }
  };

  const toggleRowStatus = (rowIdx: number, current: string) => {
    const states: ("READY" | "IN_PROGRESS" | "POST_OP" | "STAGED")[] = ["READY", "IN_PROGRESS", "POST_OP", "STAGED"];
    const nextIdx = (states.indexOf(current as any) + 1) % states.length;
    const nextVal = states[nextIdx];
    setRows(prev => prev.map((r, idx) => idx === rowIdx ? { ...r, status: nextVal } : r));

    // If updating row 1 (live patient) to IN_PROGRESS, sync back to master patient
    if (rowIdx === 0 && onUpdatePatient) {
      const updatedStatus: PatientStatus = nextVal === "IN_PROGRESS" ? "SURGERY_IN_PROGRESS" : "InConsult";
      onUpdatePatient({
        ...patient,
        status: updatedStatus
      });
    }
  };

  // Spreadsheet dynamic formulas engine calculator triggers
  const sumFormulaTotal = rows.length;
  const countSterile = rows.filter(r => r.sterileTrayStatus === "STERILE" || r.sterileTrayStatus === "CLEARED").length;
  const countPendingSterile = rows.filter(r => r.sterileTrayStatus === "PENDING").length;
  
  const getAnesthesiaLabel = (status: string) => {
    switch (status) {
      case "GENERAL": return isAr ? "تخدير كلي (GENERAL)" : "General Inhaled";
      case "LOCAL": return isAr ? "تخدير موضعي (LOCAL)" : "Local Ophthalmic";
      case "BLOCKED": return isAr ? "حصر العصب (BLOCKED)" : "Retrobulbar Block";
      default: return isAr ? "معلق (PENDING)" : "Anesthetic Prep Pending";
    }
  };

  const getSterilePillStyle = (status: string) => {
    switch (status) {
      case "STERILE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "CLEARED":
        return "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400";
    }
  };

  // Inject a new mock patient row into the spreadsheet
  const handleAddNewRow = () => {
    const nextRowId = rows.length + 1;
    const newEntry: SpreadsheetRow = {
      id: `ROW_${nextRowId}`,
      room: `OR-Suite ${nextRowId % 4 || 4}`,
      patientName: isAr ? `مريض مجدول جديد ${nextRowId}` : `Scheduled Patient ${nextRowId}`,
      procedure: isAr ? "استبدال عدسة عينية" : "Presbyopia Lens Exchange",
      surgeon: "Dr. Sophia Ross",
      anesthesiaStatus: "LOCAL",
      sterileTrayStatus: "PENDING",
      status: "STAGED",
      urgency: "ROUTINE"
    };
    setRows(prev => [...prev, newEntry]);
  };

  // Filter spreadsheet matching local states
  const filteredRows = rows.filter(r => {
    const matchSearch = 
      r.patientName.toLowerCase().includes(sheetSearch.toLowerCase()) ||
      r.procedure.toLowerCase().includes(sheetSearch.toLowerCase()) ||
      r.room.toLowerCase().includes(sheetSearch.toLowerCase()) ||
      r.surgeon.toLowerCase().includes(sheetSearch.toLowerCase());
    
    const matchUrgency = urgencyFilter === "ALL" || r.urgency === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  return (
    <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-3xl p-6 shadow-sm antialiased text-left text-[var(--clr-text-body)]">
      
      {/* Dynamic Master Spreadsheet Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-[var(--clr-border-light)] pb-5 mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-[9px] rounded-lg bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] border border-[var(--clr-brand-blue)]/20 text-[10px] font-bold uppercase tracking-wider font-mono">
              {isAr ? "جدول البيانات الجراحية" : "SURGICAL METRICS GRID"}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-[11px] text-[var(--clr-text-muted)] font-mono flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              or_clinical_theater_sheet.xlsx
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[var(--clr-text-title)] mt-1.5 flex items-center gap-2 font-sans tracking-tight">
            <FileSpreadsheet className="w-5 h-5 text-[var(--clr-brand-blue)] shrink-0" />
            <span>{isAr ? "شاشة تعقيم وفحص وجدولة غرف العمليات" : "Surgical Theater Spreadsheet & Sterile Log"}</span>
          </h2>
          <p className="text-xs text-[var(--clr-text-muted)] mt-1 leading-relaxed">
            {isAr 
              ? "نظام تعقب معايير الأمان الموحد لغرفة العمليات المركزية. انقر على أي خلية لتعديل قيمها أو اختيار الحالات."
              : "Unified Google-Sheets style clinical tracking grid for live theater logs. Click on any cell to edit or toggle parameters directly."}
          </p>
        </div>

        {/* Dynamic global metrics counters */}
        <div className="flex items-center gap-2.5 font-sans shrink-0">
          <div className="bg-[var(--clr-bg-main)] border border-[var(--clr-border-light)] px-4 py-2 rounded-2xl text-right">
            <span className="text-[9px] text-[var(--clr-text-muted)] uppercase font-mono block leading-[1]">
              {isAr ? "دقة التعقيم" : "STERILE RATIO"}
            </span>
            <span className="text-sm font-black text-emerald-600 font-mono block mt-0.5">
              {sumFormulaTotal > 0 ? Math.round((countSterile / sumFormulaTotal) * 100) : 0}%
            </span>
          </div>
          <div className="bg-[var(--clr-bg-main)] border border-[var(--clr-border-light)] px-4 py-2 rounded-2xl text-right">
            <span className="text-[9px] text-[var(--clr-text-muted)] uppercase font-mono block leading-[1]">
              {isAr ? "إجمالي الحالات المجدولة" : "MASTER REGISTERED"}
            </span>
            <span className="text-sm font-black text-[var(--clr-brand-blue)] font-mono block mt-0.5">
              {sumFormulaTotal} {isAr ? "مرضى فرعيين" : "Active Cases"}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets Styled Submenu File Nav */}
      <div className="bg-[var(--clr-bg-main)] border border-[var(--clr-border-light)] rounded-2xl p-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-x-3.5 gap-y-2 font-medium text-[var(--clr-text-body)]">
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px] font-bold">
            {isAr ? "ملف" : "File"}
          </span>
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px]">
            {isAr ? "تعديل" : "Edit"}
          </span>
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px]">
            {isAr ? "عرض" : "View"}
          </span>
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px] text-[var(--clr-brand-blue)] font-extrabold">
            {isAr ? "تنسيق سريري" : "Format"}
          </span>
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px]">
            {isAr ? "بيانات" : "Data"}
          </span>
          <span className="hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <Sparkle className="w-3.5 h-3.5" />
            {isAr ? "صيغ سريرية" : "Clinical Formula Manager"}
          </span>
        </div>

        {/* Action Controls for Grid settings */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Gridlines toggle button */}
          <button
            onClick={() => setShowGridlines(!showGridlines)}
            className={`p-2 px-3 rounded-xl border text-[10px] font-bold uppercase transition flex items-center gap-1.5 ${
              showGridlines 
                ? "bg-[var(--clr-brand-blue)]/10 border-[var(--clr-brand-blue)]/20 text-[var(--clr-brand-blue)]" 
                : "bg-[var(--clr-bg-card)] border-[var(--clr-border-light)] text-[var(--clr-text-muted)]"
            }`}
            title="Toggle Excel Grid lines"
          >
            <Grid className="w-3 h-3" />
            <span>{showGridlines ? "Gridlines ON" : "Gridlines OFF"}</span>
          </button>

          {/* Add patient Row button */}
          <button
            onClick={handleAddNewRow}
            className="p-2 px-3 bg-[var(--clr-brand-blue)] text-white hover:opacity-90 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:scale-[0.98] border border-transparent shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>{isAr ? "إضافة مريض للجدول" : "Insert Row"}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Formula Toolbar Bar */}
      <div className="border border-[var(--clr-border-light)] bg-[var(--clr-bg-main)] rounded-2xl p-2 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 flex-wrap text-[var(--clr-text-muted)]">
          <button className="p-1.5 hover:bg-neutral-200/50 dark:hover:bg-white/5 rounded-lg transition" title="Undo (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-neutral-200/50 dark:hover:bg-white/5 rounded-lg transition" title="Redo (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => window.print()}
            className="p-1.5 hover:bg-neutral-200/50 dark:hover:bg-white/5 rounded-lg transition" 
            title="Print Sheets Model"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--clr-brand-blue)]" />
          </button>
          <span className="w-[1px] h-4 bg-[var(--clr-border-light)] mx-1" />
          
          <span className="text-[11px] font-mono font-bold bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] px-2.5 py-1 rounded-lg text-[var(--clr-text-body)] select-none">
            {isAr ? "كايرو / مونو" : "Outfit / JetBrains"}
          </span>
          
          <span className="text-[11px] font-mono bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] px-1.5 py-1 rounded-lg text-[var(--clr-text-body)] select-none">
            10pt
          </span>

          <span className="w-[1px] h-4 bg-[var(--clr-border-light)] mx-1" />

          {/* Inline filters */}
          <span className="text-[10px] font-bold text-[var(--clr-text-muted)] px-1">{isAr ? "تصفية الأرقام:" : "Fasting/Priority Urgency:"}</span>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] text-[10px] font-bold px-2 py-1 rounded-lg text-[var(--clr-text-body)] focus:outline-none"
          >
            <option value="ALL">{isAr ? "جميع الأولويات" : "All Priorities"}</option>
            <option value="STAT">🚨 STAT (Urgent)</option>
            <option value="HIGH">⭐️ High Priority</option>
            <option value="ROUTINE">📅 Routine</option>
          </select>
        </div>

        {/* Live Filter Search input */}
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--clr-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder={isAr ? "بحث وتصفية خلايا المسرح الجراحي..." : "Filter patient rows..."}
            value={sheetSearch}
            onChange={(e) => setSheetSearch(e.target.value)}
            className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl pl-9 pr-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--clr-brand-blue)]"
          />
        </div>
      </div>

      {/* Formula Bar with active Cell Index and current text */}
      <form onSubmit={handleFormulaSubmit} className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-2xl p-2 mb-4 flex items-center gap-2 shadow-inner">
        <div className="bg-[var(--clr-bg-main)] border border-[var(--clr-border-light)] px-3 py-1.5 rounded-xl font-mono text-xs text-[var(--clr-text-muted)] font-bold select-none min-w-[55px] text-center">
          {activeCell.col}{activeCell.row}
        </div>
        <div className="text-indigo-400 font-mono text-[14px] font-bold select-none border-r border-[var(--clr-border-light)] pr-3 flex items-center gap-1">
          <span className="italic font-serif">f</span><span>x</span>
        </div>
        <input
          type="text"
          value={formulaBarText}
          onChange={(e) => setFormulaBarText(e.target.value)}
          placeholder={isAr ? "أدخل قيمة الخلية أو اضغط 'إدخال' للتعديل..." : "Type cell text here. Press Enter key to commit edits..."}
          className="flex-1 bg-transparent border-none text-[12px] font-mono px-2 py-1 text-[var(--clr-text-body)] placeholder-[var(--clr-text-muted)]/50 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] border border-[var(--clr-brand-blue)]/20 text-[10px] font-bold rounded-xl hover:bg-[var(--clr-brand-blue)] hover:text-white transition uppercase"
        >
          {isAr ? "إدخال" : "Commit"}
        </button>
      </form>

      {/* Error or validation banners */}
      {validationAlert && (
        <div className="mb-4 bg-rose-55 hover:bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-2xl text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationAlert}</span>
          </div>
          <button onClick={() => setValidationAlert(null)}>
            <X className="w-4 h-4 text-neutral-450 hover:text-rose-700" />
          </button>
        </div>
      )}

      {/* SPREADSHEET INTERNAL CONTENT CANVAS */}
      <div className="overflow-x-auto border border-[var(--clr-border-light)] rounded-2xl shadow-sm bg-[var(--clr-bg-main)]">
        <table className={`w-full min-w-[900px] border-collapse bg-[var(--clr-bg-card)] font-sans text-xs ${showGridlines ? 'divide-y divide-[var(--clr-border-light)]' : ''}`}>
          
          {/* Column Alphabet Headers */}
          <thead>
            <tr className="bg-[var(--clr-bg-main)] text-[10px] text-[var(--clr-text-muted)] font-mono select-none h-6">
              <th className="w-10 border border-[var(--clr-border-light)] bg-black/5 dark:bg-white/5 text-center font-bold font-mono"></th>
              <th className="border border-[var(--clr-border-light)] text-center w-[120px]">A</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[190px]">B</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[220px]">C</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[180px]">D</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[150px]">E</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[150px]">F</th>
              <th className="border border-[var(--clr-border-light)] text-center w-[110px]">G</th>
            </tr>
            {/* Functional Column Labels */}
            <tr className="bg-[var(--clr-bg-main)] text-[10px] text-[var(--clr-text-title)] font-bold font-mono select-none h-8 uppercase tracking-wider">
              <th className="border border-[var(--clr-border-light)] bg-black/5 dark:bg-white/5 text-center font-sans font-black">#</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left">{isAr ? "رقم الغرفة / الجناح" : "Room"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left">{isAr ? "اسم المريض" : "Patient Name"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left">{isAr ? "الإجراء الجراحي" : "Procedure"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left">{isAr ? "الطبيب الجراح" : "Surgeon"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left text-[var(--clr-brand-blue)] font-extrabold">{isAr ? "حالة التخدير" : "Anesthesia Status"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-left text-[var(--clr-brand-blue)] font-extrabold">{isAr ? "مستوى تعقيم المستلزمات" : "Sterile Tray Status"}</th>
              <th className="border border-[var(--clr-border-light)] px-3 text-center">{isAr ? "حالة العبور" : "Stage Gate"}</th>
            </tr>
          </thead>
          <tbody>
            
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={99} className="p-8 text-center">
                  <div className="text-neutral-400 text-xs italic">
                    No surgical cases scheduled. All hardcoded mock data cleared.
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((r, index) => {
              const rIdx = index + 1;
              const isLivePatientRow = r.id === "ROW_1";

              return (
                <tr 
                  key={r.id}
                  className={`group h-12 transition-all ${
                    activeCell.row === rIdx ? "bg-[var(--clr-brand-blue)]/5" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {/* Left row index */}
                  <td className="border border-[var(--clr-border-light)] bg-black/5 dark:bg-white/5 font-mono text-[10px] text-[var(--clr-text-muted)] font-black text-center select-none w-10">
                    {rIdx}
                  </td>

                  {/* Col A: Room */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "A", r.room)}
                    className={`border px-3 text-left min-w-[120px] transition font-mono ${
                      activeCell.row === rIdx && activeCell.col === "A" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)] text-[var(--clr-text-muted)]'
                    }`}
                  >
                    <span className="font-semibold block">{r.room}</span>
                  </td>

                  {/* Col B: Patient Name */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "B", r.patientName)}
                    className={`border px-3 text-left min-w-[180px] transition ${
                      activeCell.row === rIdx && activeCell.col === "B" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)] text-[var(--clr-text-title)]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-extrabold flex items-center gap-1.5 text-xs">
                        {isLivePatientRow && (
                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse border border-white" title="Active EHR Workstation Patient" />
                        )}
                        {r.patientName}
                      </span>
                      {isLivePatientRow ? (
                        <span className="text-[9px] font-bold text-indigo-700 dark:text-[#2BBFFF] tracking-wider uppercase font-mono leading-none mt-0.5">
                          {isAr ? "المركب النشط للمحطة" : "🏥 ACTIVE DESK CORE"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-400 dark:text-neutral-500 leading-none mt-0.5">
                          SECURE ID: {r.id}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Col C: Procedure */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "C", r.procedure)}
                    className={`border px-3 text-left min-w-[200px] transition ${
                      activeCell.row === rIdx && activeCell.col === "C" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)] text-[var(--clr-text-body)]'
                    }`}
                  >
                    <span className="text-[11px] font-medium block max-w-xs truncate" title={r.procedure}>
                      {r.procedure}
                    </span>
                  </td>

                  {/* Col D: Surgeon */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "D", r.surgeon)}
                    className={`border px-3 text-left min-w-[150px] transition ${
                      activeCell.row === rIdx && activeCell.col === "D" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)] text-[var(--clr-text-muted)] font-mono'
                    }`}
                  >
                    <span className="font-sans font-semibold text-xs text-[var(--clr-text-body)] block">{r.surgeon}</span>
                  </td>

                  {/* Col E: Anesthesia Status (With easy quick toggle click) */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "E", r.anesthesiaStatus)}
                    className={`border px-3 text-left min-w-[140px] cursor-pointer hover:bg-[var(--clr-brand-blue)]/5 transition ${
                      activeCell.row === rIdx && activeCell.col === "E" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 group/btn">
                      <span className="text-[11px] font-bold font-mono text-[var(--clr-text-title)]">
                        {getAnesthesiaLabel(r.anesthesiaStatus)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          quickToggleAnesthesia(rIdx - 1, r.anesthesiaStatus);
                        }}
                        className="opacity-0 group-hover/btn:opacity-100 p-0.5 bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] rounded text-[9px] font-black transition uppercase ml-2 select-none"
                      >
                        {isAr ? "بدل" : "Cycle"}
                      </button>
                    </div>
                  </td>

                  {/* Col F: Sterile Tray Status (With easy indicator and click cycle) */}
                  <td 
                    onClick={() => handleCellSelect(rIdx, "F", r.sterileTrayStatus)}
                    className={`border px-3 text-left min-w-[140px] cursor-pointer hover:bg-[var(--clr-brand-blue)]/5 transition ${
                      activeCell.row === rIdx && activeCell.col === "F" 
                        ? 'border-2 border-[var(--clr-brand-blue)] bg-[var(--clr-bg-card)]' 
                        : 'border-[var(--clr-border-light)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 group/btn">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase font-mono tracking-wider ${getSterilePillStyle(r.sterileTrayStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.sterileTrayStatus === "STERILE" || r.sterileTrayStatus === "CLEARED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {r.sterileTrayStatus}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          quickToggleSterile(rIdx - 1, r.sterileTrayStatus);
                        }}
                        className="opacity-0 group-hover/btn:opacity-100 p-0.5 bg-[var(--clr-brand-blue)]/10 text-[var(--clr-brand-blue)] rounded text-[9px] font-black transition uppercase ml-2 select-none"
                      >
                        {isAr ? "بدل" : "Cycle"}
                      </button>
                    </div>
                  </td>

                  {/* Col G: Urgency/FASTING or OR gate status control */}
                  <td className="border border-[var(--clr-border-light)] px-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => toggleRowStatus(rIdx - 1, r.status)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono border transition ${
                        r.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400"
                          : r.status === "READY"
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : r.status === "POST_OP"
                          ? "bg-indigo-50/20 text-indigo-700 border-indigo-200"
                          : "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-850 dark:text-neutral-400"
                      }`}
                    >
                      {r.status}
                    </button>
                  </td>

                </tr>
              );
            }))}

            {/* SPREADSHEET FORMULA SUMMARY FOOTER ROW */}
            <tr className="bg-[var(--clr-bg-main)] h-11 select-none text-[11px] font-bold text-[var(--clr-text-title)] font-mono border-t-2 border-[var(--clr-border-light)]">
              <td className="border border-[var(--clr-border-light)] bg-black/5 dark:bg-white/5 text-center font-bold">
                Σ
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 text-left">
                {`=COUNT(A1:A${sumFormulaTotal})`}
                <span className="text-[10px] text-[var(--clr-text-muted)] font-sans block font-semibold leading-none mt-1">
                  {sumFormulaTotal} {isAr ? "صالات نشطة" : "OR Rooms Logged"}
                </span>
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 text-indigo-700 dark:text-[#2BBFFF] font-bold">
                {`=COUNTA(B1:B${sumFormulaTotal})`}
                <span className="text-[9px] text-[var(--clr-text-muted)] font-sans block font-normal leading-none mt-1">
                  {isAr ? "تحليل أسماء مسجلة" : "Patient records calculated"}
                </span>
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 text-neutral-450 italic font-sans font-medium text-[10px]">
                {isAr ? "تحديث تلقائي مستمر" : "Continuous cell formula feed active"}
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 font-semibold text-neutral-450">
                Ophthalmic theater stats
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 text-neutral-700 font-mono">
                {`=MUTED`}
                <span className="text-[10px] font-bold block text-[var(--clr-text-muted)] leading-none mt-1">
                  Active block checks
                </span>
              </td>
              <td className="border border-[var(--clr-border-light)] px-3 text-emerald-700 font-mono">
                {`=COUNTIF(D:D, STERILE)`}
                <span className="text-emerald-600 font-bold block text-[10px] leading-none mt-1">
                  {countSterile} / {sumFormulaTotal} {isAr ? "معقم" : "Ready"}
                </span>
              </td>
              <td className="border border-[var(--clr-border-light)] text-center text-[9px] text-[var(--clr-text-muted)] font-normal">
                EOF_SECURE_V2
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Helper Guide info block */}
      <div className="mt-4 bg-[var(--clr-bg-main)] hover:bg-[var(--clr-bg-main)]/90 border border-[var(--clr-border-light)] p-3 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 text-[var(--clr-text-muted)]">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase text-[9px] tracking-wide block text-[var(--clr-text-title)]">
            {isAr ? "دليل صيغ الأمان الطبي السريع" : "Google Sheets Integration Help Guide"}
          </span>
          <p>
            {isAr
              ? "لتغيير اسم المريض، حدد الخلية B1 واكتب في شريط الصيغ بالأعلى ثم اضغط إدخال. دورات الحصانة الموضعية (LOCAL) أو الكلية يتم تعقبها لضمان التوافق التام مع متطلبات منظمة الصحة العالمية (WHO)."
              : "Use the Formula Bar to input complex surgical strings into selected cells. Anesthesia and Sterile Status are cyclical to secure real-time WHO pre-operative compliance checklists."}
          </p>
        </div>
      </div>

    </div>
  );
}
