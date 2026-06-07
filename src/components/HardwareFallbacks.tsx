/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Signal, SignalHigh, Wifi, WifiOff, Database, ShieldAlert, CheckCircle, RefreshCw, Smartphone } from "lucide-react";

export default function HardwareFallbacks() {
  const [wifiState, setWifiState] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [backButtonPresses, setBackButtonPresses] = useState<string[]>([]);
  const [offlineCache, setOfflineCache] = useState<
    { id: string; name: string; notes: string; timestamp: string; syncStatus: "Synced" | "PendingSync" }[]
  >([
    { id: "PAT-OFF-11", name: "David Miller", notes: "ENT otoscopy results cached", timestamp: "18:22", syncStatus: "Synced" },
    { id: "PAT-OFF-12", name: "Leopold Bloom", notes: "Glaucoma pressure checked 14 mmHg", timestamp: "18:31", syncStatus: "Synced" }
  ]);

  const [simName, setSimName] = useState("");
  const [simNotes, setSimNotes] = useState("");

  const handleSimulateBackButton = () => {
    const timestamp = new Date().toLocaleTimeString().slice(0, 5);
    setBackButtonPresses((p) => [
      `[${timestamp}] Intercepted Android hardware Back key. Overrode default Activity transition to prevent data loss.`,
      ...p
    ]);
    alert("⚠️ NATIVE APK OVERRIDE: Accidental back button exit blocked. Data loss prevented during active consultation form entry!");
  };

  const handleCreateOfflinePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName) return;

    const newObj = {
      id: `PAT-OFF-${Math.floor(100 + Math.random() * 900)}`,
      name: simName,
      notes: simNotes || "Offline dental/ophthalmic logs",
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      syncStatus: (wifiState === "OFFLINE" ? "PendingSync" : "Synced") as any
    };

    setOfflineCache((prev) => [newObj, ...prev]);
    setSimName("");
    setSimNotes("");
    
    if (wifiState === "OFFLINE") {
      alert("📡 WIFI OFFLINE: Patient diagnostics saved to Tablet's secure SQLite encrypted cache. Will auto-sync when clinic Wi-Fi returns.");
    } else {
      alert("✅ Patient diagnostics synchronized directly with the central hospital Spring Boot Database cluster.");
    }
  };

  const handleToggleWifi = () => {
    const nextState = wifiState === "ONLINE" ? "OFFLINE" : "ONLINE";
    setWifiState(nextState);
  };

  const syncOfflineDrafts = () => {
    if (wifiState === "OFFLINE") {
      alert("⚠️ Sync impossible. Turn Wi-Fi back ONLINE to dispatch the queue.");
      return;
    }
    setOfflineCache((prev) =>
      prev.map((item) => ({ ...item, syncStatus: "Synced" }))
    );
    alert("📡 SQLite Auto-sync completed. All offline medical drafts uploaded and reconciled with central database servers.");
  };

  return (
    <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col h-full space-y-6 transition duration-300">
      {/* Detail header */}
      <div>
        <h3 className="font-sans font-semibold text-neutral-800 text-lg flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-teal-600" /> Native APK Hardware & Connection Fallbacks
        </h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Scenario 5: Simulate tablet Wi-Fi drops and native Android hardware button event hooks to protect records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Android hardware override logs & simulators */}
        <div className="lg:col-span-6 space-y-5">
          {/* Back button override controller */}
          <div className="bg-neutral-50/50 border border-neutral-100 p-5 rounded-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-teal-600 tracking-wider block uppercase">
              Tablet Event Hooks: Accidental Navigation Bypass
            </span>
            <span className="font-semibold text-sm text-neutral-80 block">Standard Hardware Back Interceptor</span>
            <p className="text-xs text-neutral-500 leading-normal">
              Entering patient clinical data triggers native Kotlin activity callback handlers, blocking standard Android activity destructions.
            </p>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleSimulateBackButton}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-xs rounded-lg font-bold flex items-center gap-1.5"
              >
                Press Android Back Key
              </button>
            </div>

            {backButtonPresses.length > 0 && (
              <div className="bg-neutral-100 p-2.5 rounded font-mono text-[9px] text-rose-700 max-h-24 overflow-y-auto leading-tight space-y-1 mt-2 border border-neutral-200">
                {backButtonPresses.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Wi-Fi network toggle */}
          <div className="bg-neutral-50/50 border border-neutral-100 p-5 rounded-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-teal-600 tracking-wider block uppercase">
              Wi-Fi Connection drops & network toggles
            </span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-neutral-80 block">Clinic Wi-Fi Transceiver</span>
              {wifiState === "ONLINE" ? (
                <span className="text-emerald-700 bg-emerald-50 text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" /> ONLINE (DIRECT SYNC)
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" /> OFFLINE (SQLITE MODE)
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500 leading-normal">
              Toggle this Wi-Fi switch to mimic tablet signal lost inside deep clinical radiation wards. This automatically redirects queries to immediate offline caches.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleToggleWifi}
                className={`w-full py-2 rounded-lg text-xs font-semibold uppercase transition flex items-center justify-center gap-2 ${
                  wifiState === "ONLINE"
                    ? "bg-amber-600 hover:bg-amber-705 text-white"
                    : "bg-emerald-600 hover:bg-emerald-705 text-white"
                }`}
              >
                {wifiState === "ONLINE" ? "Force Wi-Fi Connection Loss" : "Reconnect Wi-Fi Network"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Offline SQLite Cache and Syncer list */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-teal-600 tracking-wider block uppercase mb-2">
                Encrypted SQLite Offline Table Cache
              </span>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm text-neutral-80 flex items-center gap-1.5/2">
                  <Database className="w-4 h-4 text-teal-600" /> Patients SQLite Table Drafts
                </span>
                <button
                  type="button"
                  onClick={syncOfflineDrafts}
                  className="text-tiny bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-2 py-1 rounded flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Force DB Sync
                </button>
              </div>

              {/* Sim table form */}
              <form onSubmit={handleCreateOfflinePatient} className="grid grid-cols-2 gap-2.5 mb-4 bg-[var(--clr-bg-card)] p-3.5 border border-neutral-250 dark:border-neutral-850 rounded-2xl shadow-xs">
                <input
                  required
                  type="text"
                  placeholder="Simulate Patient Name"
                  className="p-1.5 px-3 border border-neutral-300 dark:border-neutral-850 bg-white/65 dark:bg-neutral-900 text-xs rounded-lg focus:outline-teal-500 font-medium"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Clinical diagnostic notes"
                  className="p-1.5 px-3 border border-neutral-300 dark:border-neutral-850 bg-white/65 dark:bg-neutral-900 text-xs rounded-lg focus:outline-teal-500 font-medium"
                  value={simNotes}
                  onChange={(e) => setSimNotes(e.target.value)}
                />
                <button
                  type="submit"
                  className="col-span-2 py-2 bg-[#0F1E46] hover:bg-[#1A2E65] text-white rounded-xl text-tiny font-sans uppercase font-bold tracking-wider transition cursor-pointer"
                >
                  Record Offline Consultation Form
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {offlineCache.map((draft) => (
                  <div key={draft.id} className="p-2.5 bg-[var(--clr-bg-card)] border border-neutral-150/70 dark:border-neutral-850 rounded-xl text-xs flex justify-between items-center transition">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{draft.name}</span>
                        <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100/60 dark:bg-neutral-900 px-1 py-0.5 rounded font-black">{draft.id}</span>
                      </div>
                      <div className="text-tiny text-neutral-500 mt-0.5 mt-0.5-special font-sans">{draft.notes}</div>
                    </div>
                    {draft.syncStatus === "Synced" ? (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 rounded flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> Synced
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-mono font-bold px-1.5 rounded animate-pulse flex items-center gap-0.5">
                        ⚠️ Cache Pen
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
