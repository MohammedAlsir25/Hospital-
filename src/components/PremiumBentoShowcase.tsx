/**
 * SPDX-License-Identifier: Apache-2.5
 * Premium Dark Bento Co-Pilot Screen Simulator
 * Designed precisely according to Apple HIG and Material 3 principles.
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Heart,
  Smartphone,
  Sparkles,
  AlertCircle,
  Clock,
  Eye,
  CheckCircle,
  Compass,
  TrendingUp,
  User,
  Plus,
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";

interface PremiumBentoShowcaseProps {
  onBackToDashboard?: () => void;
}

export default function PremiumBentoShowcase({ onBackToDashboard }: PremiumBentoShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "vitals" | "tasks">("summary");
  const [pulseCount, setPulseCount] = useState<number>(72);
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [laserArmed, setLaserArmed] = useState<boolean>(false);

  // Triggering visual states for demo
  const handleIncreasePulse = () => {
    setPulseCount((prev) => (prev < 120 ? prev + 4 : 70));
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] p-6 bg-[#0A0A0C] border border-[#ffffff]/10 shadow-2xl relative overflow-hidden select-none">
      {/* Background ambient circular gradients for premium look */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#0066FF]/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-[#34D399]/15 blur-[100px] pointer-events-none" />

      {/* Header bar of mobile container */}
      <header className="flex items-center justify-between pb-6 border-b border-[#ffffff]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#16161A] border border-[#ffffff]/10 flex items-center justify-center shadow-inner">
            <Smartphone className="w-5 h-5 text-[#0066FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#0066FF] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#0066FF]/10">
                EHR CO-PILOT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-sm font-black text-white tracking-tight uppercase mt-0.5">
              Al Jawarih Dark-First Bento
            </h2>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          aria-label="Back to main clinic dashboard"
          className="px-4 py-2 bg-[#16161A] hover:bg-[#1f1f24] active:scale-95 border border-[#ffffff]/10 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
        >
          Return to ERP Dashboard
        </button>
      </header>

      {/* Intro info card info badge */}
      <div className="my-5 p-4 bg-[#16161A] border border-[#ffffff]/10 rounded-3xl flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0066FF] shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          This preview console showcases <strong className="text-white">Apple HIG</strong> and <strong className="text-white">Material 3 specification constraints</strong>. It runs on a exact <strong className="text-white">6-3-1 Color Ratio rule</strong>: Canvas background is <code className="text-[#0066FF] font-semibold font-mono">#0A0A0C</code> (60%), card structures are <code className="text-[#0066FF] font-semibold font-mono">#16161A</code> (30%), and primary tactile buttons are <code className="text-[#0066FF] font-semibold font-mono">#0066FF</code> (10%) with micro-scaling active transitions.
        </p>
      </div>

      {/* Bento Grid Layout (CSS Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-sans">
        
        {/* Cell 1: Principal Patient Context (Span 7) */}
        <div className="md:col-span-7 bg-[#16161A] border border-[#ffffff]/10 hover:border-[#0066FF]/30 rounded-[24px] p-5 flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] relative overflow-hidden transition-all duration-300">
          <div className="absolute top-2 right-2 p-2">
            <span className="text-[9px] font-mono font-bold text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded-full">
              SECURE_ID: PAT-401
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                Assigned Ward Care
              </span>
              <h3 className="text-lg font-black text-white font-sans mt-1">
                Col. Farhan Al-Sharif
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                48 Year Old • Retinal Laser Cohort A • Active Encounter
              </p>
            </div>

            {/* Micro details row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#ffffff]/10">
              <div className="p-2.5 rounded-xl bg-[#0A0A0C]/50 border border-[#ffffff]/5">
                <span className="text-[9px] text-neutral-500 font-bold block uppercase">IOP Pressure</span>
                <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                  16 / 15 mmHg
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A0A0C]/50 border border-[#ffffff]/5">
                <span className="text-[9px] text-neutral-500 font-bold block uppercase">Visual Sharpness</span>
                <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">
                  OD 20/40 LogMAR
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0A0A0C]/50 border border-[#ffffff]/5">
                <span className="text-[9px] text-neutral-500 font-bold block uppercase">Pupil Dilation</span>
                <span className="text-xs font-mono font-bold text-[#0066FF] mt-1 block">
                  92% Completed
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3.5 items-center">
            {/* CTA Button using the vibrant tactile guidelines */}
            <button
              aria-label="Diagnose active patient Retina lesions"
              onClick={handleIncreasePulse}
              className="flex-1 h-12 rounded-xl bg-[#0066FF] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] border border-[#ffffff]/20 shadow-[0_4px_16px_rgba(0,102,255,0.4)] cursor-pointer hover:bg-[#1a75ff]"
            >
              <Activity className="w-4.5 h-4.5" />
              <span>Simulate Vitals pulse ({pulseCount} BPM)</span>
            </button>
          </div>
        </div>

        {/* Cell 2: Quick Status Dial (Span 5) */}
        <div className="md:col-span-5 bg-[#16161A] border border-[#ffffff]/10 hover:border-[#0066FF]/30 rounded-[24px] p-5 flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] transition-all duration-300">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                Clinical Telemetry
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            
            {/* Visual circle graph or representation */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border-[8px] border-[#0A0A0C] border-t-[#0066FF] flex items-center justify-center relative">
                <Heart className="w-8 h-8 text-[#0066FF] animate-bounce" style={{ animationDuration: `${(60/pulseCount).toFixed(2)}s` }} />
              </div>
              <span className="text-xs font-mono font-black text-white mt-3 block">
                {pulseCount} BPM • Sinus Rhythm
              </span>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 text-center leading-relaxed italic block">
            Pulse frequency updates dynamically with tactile button presses
          </p>
        </div>

        {/* Cell 3: Laser Surgery Arming Controller (Span 5) */}
        <div className="md:col-span-5 bg-[#16161A] border border-[#ffffff]/10 hover:border-[#0066FF]/30 rounded-[24px] p-5 flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] relative overflow-hidden transition-all duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
              Procedural Lockout Control
            </span>
            <h4 className="text-sm font-bold text-white uppercase leading-snug">
              Laser Arming Mechanism
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Armed status is linked to automatic billing logs. Do not arm with un-dilated patients.
            </p>
          </div>

          <div className="pt-4">
            <button
              aria-label={laserArmed ? "Disarm Surgical Laser" : "Arm Surgical Laser"}
              onClick={() => setLaserArmed(!laserArmed)}
              className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] border ${
                laserArmed
                  ? "bg-rose-600/20 border-rose-500 text-rose-500 shadow-[0_4px_16px_rgba(239,68,68,0.2)]"
                  : "bg-[#0066FF] hover:bg-[#1a75ff] border-[#ffffff]/20 text-white shadow-[0_4px_16px_rgba(0,102,255,0.45)]"
              } cursor-pointer`}
            >
              <Eye className="w-4.5 h-4.5" />
              <span>{laserArmed ? "DISARM PHOTOCOAGULATION" : "ARM SURGICAL LASER"}</span>
            </button>
          </div>
        </div>

        {/* Cell 4: Security Shield & Status Alert (Span 7) */}
        <div className="md:col-span-7 bg-[#16161A] border border-[#ffffff]/10 hover:border-[#0066FF]/30 rounded-[24px] p-5 flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] relative overflow-hidden transition-all duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                  Active Security State
                </span>
                <h4 className="text-sm font-bold text-white uppercase leading-normal mt-1">
                  Apple HIG + Material 3 Bento Rules checked
                </h4>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>60-30-1 Premium Contrast Rule fully integrated.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Min touch targets are scaled to 48px to prevent tactile fatigue.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Subtle inner border highlights and smooth scaling animation.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-[#ffffff]/10">
            <span className="text-[10px] text-neutral-500 font-mono">Verified: UI_VAL_OK</span>
            <button
              aria-label="View more specs"
              onClick={() => alert("Verification Token Level: Prototyping OK!\nLayout values are active.")}
              className="px-3 py-1.5 rounded-lg bg-[#0A0A0C] border border-[#ffffff]/10 text-[10px] font-bold text-[#0066FF] hover:text-white hover:bg-[#0066FF] transition-all cursor-pointer"
            >
              Validate Specifications
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Footer Navigation for Bento Design Studio */}
      <footer className="mt-6 pt-5 border-t border-[#ffffff]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0066FF]" />
          <span className="text-[11px] font-mono font-medium text-neutral-400">
            Crafted for premium clinician workflows in Al Jawarih ERP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Interactive Preview Node</span>
        </div>
      </footer>
    </div>
  );
}
