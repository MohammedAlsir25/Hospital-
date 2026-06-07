/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Lock, Unlock, Key, FileJson, BadgeAlert, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ClinicalRole } from "../types";

interface RbacScreenProps {
  activeRole: ClinicalRole;
  onSelectRole: (role: ClinicalRole) => void;
}

export default function RbacScreen({ activeRole, onSelectRole }: RbacScreenProps) {
  const [showToken, setShowToken] = useState(false);

  // Mock employee directory matching standard hospital scenarios
  const employees: {
    id: string;
    name: string;
    role: ClinicalRole;
    dept: string;
    token: string;
    permissions: string[];
  }[] = [
    {
      id: "EMP-RECP90",
      name: "Mildred Vance",
      role: "receptionist",
      dept: "Front Operations",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWlsZHJlZCIsImF1dGgiOlsiS2lvc2tSZWdpc3RyYXRpb24iLCJRdWV1ZVN5bmMiXSwiaWQiOiJFTVAtUkVDUDkwIn0.signature",
      permissions: ["Access Check-in Kiosks", "Register Patient Profiles", "View Live Kiosk Waitlist Matrix"]
    },
    {
      id: "EMP-NURS41",
      name: "Sister Beatrice",
      role: "nurse",
      dept: "Clinical Triage Care",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQmVhdHJpY2UiLCJhdXRoIjpbIkNhcHR1cmVWaXRhbHMiLCJQdXBpbERpbGF0b3JHb3Zlcm5vciJdLCJpZCI6IkVNUC1OVVJTNDEifQ.signature",
      permissions: ["Record & Verify Triage Vitals", "Initiate 20-Min Pupil Dilation Timers", "Flag Ophthalmic Trauma Priority Slots"]
    },
    {
      id: "EMP-DOCT12",
      name: "Dr. Alexander Sterling",
      role: "doctor",
      dept: "Ophthalmology Specialty Services",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWxleGFuZGVyIiwiYXV0aCI6WyJDb25zdWx0YXRpb25BY3Rpb24iLCJPZG9udG9ncmFtRGlyZWN0U3luYyIsIkdsYXVjb21hSU9QQm91bmRhcmllcyIsIlBlZGlhdHJpY0RGQm9hdCJdLCJpZCI6IkVNUC1ET0NUMTIifQ.signature",
      permissions: ["Diagnose & Close Consultations", "Edit Dental Odontograms", "Override Drug Alerts", "Log Visual Acuity Spectacle refractions"]
    },
    {
      id: "EMP-PHAR08",
      name: "Pharmacist Vance Jr.",
      role: "pharmacist",
      dept: "Chemical Inventory Pharmacy",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVmFuY2VKciIsImF1dGgiOlsiRGVkdWN0Q2hlbWljYWxTdG9ja3MiLCJSdk5vcm1BY2Nlc3MiXSwiaWQiOiJFTVAtUEhBUjA4In0.signature",
      permissions: ["View Prescriptions Dispatch Queues", "Deduct Active Chemical Drug Stocks", "Analyze RxNorm Warning Modules"]
    },
    {
      id: "EMP-ACCT33",
      name: "Ebenezer Ledger",
      role: "accountant",
      dept: "Accounts & Financials Checkout",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRWJlbmV6ZXIiLCJhdXRoIjpbIkNsZWFyQmlsbExlZGdlcnMiLCJQYXRpZW50RGlzY2hhcmdlXCJdLCJpZCI6IkVNUC1BQ0NUMTMifQ.signature",
      permissions: ["Apply Cashier Payments", "View Itemized Ledger Bills", "Approve Final Hospital Discharges"]
    }
  ];

  const activeEmployee = employees.find((e) => e.role === activeRole) || employees[2];

  return (
    <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col h-full space-y-6 transition duration-300">
      {/* Header section */}
      <div>
        <h3 className="font-sans font-semibold text-neutral-800 text-lg flex items-center gap-1.5">
          <Shield className="w-5 h-5 text-teal-600" /> Employee Authenticator & Role-Based Security
        </h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Scenario 4: Securely log in to hospital endpoints. The decrypted permission vector determines what screen boundaries remain active, instantly locking unauthorized divisions.
        </p>
      </div>

      {/* Selector of Mock Emp Identities */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {employees.map((emp) => {
          const isSelected = emp.role === activeRole;
          return (
            <div
              key={emp.id}
              onClick={() => onSelectRole(emp.role)}
              className={`p-3.5 border rounded-xl cursor-pointer transition text-left flex flex-col justify-between ${
                isSelected
                  ? "bg-teal-50/80 dark:bg-teal-950/20 border-teal-500 text-teal-900 dark:text-teal-300 shadow-xs"
                  : "bg-white/50 dark:bg-[#1E2235]/40 border-neutral-300 dark:border-neutral-800 hover:border-[#FF841A]/50 hover:bg-white dark:hover:bg-[#151824]"
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-neutral-400 font-semibold block">{emp.id}</span>
                <span className="font-sans font-bold text-xs text-neutral-850 block mt-1">{emp.name}</span>
                <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider font-sans block mt-1">
                  {emp.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decrypt Token Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-neutral-100">
        {/* Profile Card & Decrypted Authorizations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#E5DFCE]/15 dark:bg-[#1E2235]/40 p-5 rounded-2xl border border-neutral-300 dark:border-neutral-800 space-y-3">
            <span className="text-[10px] font-mono font-bold text-teal-600 block tracking-wider uppercase">
              Decrypted JWT Token claims & Authorization Attributes
            </span>

            <div className="space-y-1 text-xs">
              <div>Name: <span className="font-bold text-neutral-850 float-right">{activeEmployee.name}</span></div>
              <div>User ID: <span className="font-mono text-neutral-600 float-right">{activeEmployee.id}</span></div>
              <div>Role Authority: <span className="text-teal-700 font-extrabold float-right uppercase">{activeEmployee.role}</span></div>
              <div>Hospital Dept: <span className="text-neutral-500 font-medium float-right">{activeEmployee.dept}</span></div>
            </div>

            <div className="pt-2 border-t border-neutral-200/50">
              <span className="text-[10px] font-semibold text-neutral-500 block mb-2 uppercase tracking-wide">
                Signed Security Privileges Vector
              </span>
              <div className="space-y-1.5">
                {activeEmployee.permissions.map((perm, index) => (
                  <div key={index} className="text-xs flex items-center gap-1.5 text-neutral-700">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Binary JSON view */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-neutral-900 text-amber-400 rounded-2xl p-4 font-mono text-[10px] space-y-3 border border-neutral-800 flex-1 flex flex-col">
            <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2">
              <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                <FileJson className="w-3.5 h-3.5" /> Simulated JWT Token Payload
              </span>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-[9px] uppercase underline text-teal-400 hover:text-teal-300 transition"
              >
                {showToken ? "Peek Claims" : "Peek Claims Details"}
              </button>
            </div>

            {showToken ? (
              <pre className="flex-1 whitespace-pre-wrap leading-relaxed text-emerald-400 overflow-x-auto select-all">
{`{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "id": "${activeEmployee.id}",
  "name": "${activeEmployee.name}",
  "role": "${activeEmployee.role}",
  "dept": "${activeEmployee.dept}",
  "scope": [
    ${activeEmployee.permissions.map(p => `"${p}"`).join(",\n    ")}
  ],
  "exp": ${Math.floor(Date.now() / 1000) + 3600}
}`}
              </pre>
            ) : (
              <pre className="flex-1 whitespace-pre-wrap leading-relaxed text-neutral-500 overflow-x-auto overflow-y-hidden select-all text-ellipsis">
                {activeEmployee.token}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-start gap-2">
        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-teal-600" />
        <div className="leading-relaxed">
          <strong>HIPAA Compliant System Enforcement:</strong> When navigating the app's top bar tabs, observing your active role is crucial. Clicking different tabs will automatically show how standard locks and screen overlays (pointer-events: none) deny unauthorized access on other departments, ensuring complete security adherence.
        </div>
      </div>
    </div>
  );
}
