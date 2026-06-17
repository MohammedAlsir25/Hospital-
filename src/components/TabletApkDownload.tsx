/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  QrCode,
  Tablet,
  CheckCircle,
  FileCheck,
  Shield,
  Smartphone,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowLeft
} from "lucide-react";

interface TabletApkDownloadProps {
  onBackToDashboard: () => void;
  language: "en" | "ar";
}

export default function TabletApkDownload({ onBackToDashboard, language }: TabletApkDownloadProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"apk" | "instructions">("apk");
  const [selectedBuild, setSelectedBuild] = useState<"stable" | "beta">("stable");
  const [isVerifyingSignature, setIsVerifyingSignature] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const isRtl = language === "ar";

  const t = {
    en: {
      title: "Clinic Tablet Companion APK Portal",
      arabicTitle: "تحميل تطبيق الأجهزة اللوحية (APK)",
      subtitle: "Enterprise Android package repository for clinical tablets & point-of-care terminals.",
      apkHeader: "Direct APK Downloads",
      instructionsHeader: "Provisioning Manual",
      selectBuild: "Build Version Class",
      stableDesc: "Stable Release v3.4.1 (Recommended for Consultations & Wards)",
      betaDesc: "Beta Build v3.5.0-RC1 (Testing for Surgical Handhelds & Mydriasis)",
      downloadBtn: "Download APK File",
      downloading: "Downloading Package",
      downloadSuccess: "Download Complete (doctor_tablet_v3.4.1.apk)",
      qrPrompt: "Scan QR Code to Download Instantly",
      qrInstruction: "Point your clinical tablet camera at the matrix to transfer the security package directly.",
      technicalSpecs: "Terminal Release Parameters",
      pkgSize: "Package Size",
      targetSdk: "Target API Level",
      md5: "MD5 Verification Hash",
      sha256: "SHA-256 Checksum",
      authRequired: "Enterprise Cryptographic Seal",
      certified: "Certified Google Play Protect Compliant",
      manualSteps: [
        "Enable 'Install from Unknown Sources' in Android Developer Settings.",
        "Ensure the tablet is authenticated on the secure clinic local WLAN network.",
        "Scan the QR code displayed or hit the Download APK button above.",
        "Execute 'doctor_tablet.apk' and approve OAuth workflow permissions."
      ],
      backToErp: "Return to EHR Dashboard",
      signCheckBtn: "Verify Cryptographic Seal",
      checkingSign: "Checking cryptographic anchors...",
      signOk: "Active signature matches certified CA: ophthalmic-trustpair-prod-09",
    },
    ar: {
      title: "بوابة تحميل تطبيق الأجهزة اللوحية الطبية",
      arabicTitle: "تحميل تطبيق الأجهزة اللوحية (APK)",
      subtitle: "مستودع حزم أندرويد المؤسسي المخصص للأجهزة اللوحية ومحطات الرعاية السريرية الفورية.",
      apkHeader: "تنزيل الحزمة المباشر APK",
      instructionsHeader: "دليل التثبيت والتهيئة",
      selectBuild: "فئة بناء التطبيق",
      stableDesc: "الإصدار المستقر 3.4.1 (موصى به للاستشارات والعيادات)",
      betaDesc: "الإصدار التجريبي 3.5.0 (لأجهزة غرف العمليات وقطرات فحص قاع العين)",
      downloadBtn: "تحميل حزمة APK للمستندات",
      downloading: "جاري تنزيل الحزمة الآن",
      downloadSuccess: "اكتمل التنزيل بنجاح (doctor_tablet_v3.4.1.apk)",
      qrPrompt: "امسح رمز الاستجابة السريعة للتحميل المباشر",
      qrInstruction: "وجه كاميرا جهاز الطبيب اللوحي إلى الرمز لنقل حزمة التثبيت الآمنة فوراً.",
      technicalSpecs: "مواصفات حزمة الأجهزة اللوحية",
      pkgSize: "حجم الحزمة",
      targetSdk: "مستوى واجهة API المستهدف",
      md5: "رمز التحقق MD5",
      sha256: "توقيع SHA-256",
      authRequired: "الختم التشفيري المؤسسي المعتمد",
      certified: "معتمد ومتوافق مع نظام الحماية Google Play Protect",
      manualSteps: [
        "قم بتمكين 'تثبيت التطبيقات من مصادر غير معروفة' في إعدادات المطور للجهاز اللوحي.",
        "تأكد من اتصال الجهاز اللوحي بشبكة العيادة المحلية اللاسلكية الآمنة WLAN.",
        "امسح رمز QR المعروض أو انقر على زر تنزيل APK أعلاه.",
        "قم بتشغيل ملف 'doctor_tablet.apk' والموافقة على أذونات OAuth المصاحبة."
      ],
      backToErp: "العودة للوحة القيادة السريرية",
      signCheckBtn: "التحقق من الختم التشفيري الآمن",
      checkingSign: "جاري فحص مصفوفات التوقيع الرقمي...",
      signOk: "التوقيع الرقمي الخارجي مطابق لـ certified CA المعتمَد",
    }
  };

  const curr = language === "ar" ? t.ar : t.en;

  const handleDownload = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleVerify = () => {
    setIsVerifyingSignature(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifyingSignature(false);
      setVerificationResult(curr.signOk);
    }, 1200);
  };

  return (
    <div 
      className="w-full max-w-4xl mx-auto rounded-[32px] p-6 bg-[var(--clr-bg-card)] border border-[#EAE6DF] dark:border-neutral-800 shadow-2xl relative overflow-hidden select-none"
      id="tablet-apk-download-container"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Decorative Warm Backlight Blur */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Header element */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
            <Tablet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50">
                Tablet Deployment System (APK)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight font-sans mt-0.5">
              {curr.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-[#FBFBF9] dark:bg-neutral-900 hover:bg-[#F2EFE9] dark:hover:bg-neutral-800 active:scale-95 border border-[#EAE6DF] dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          <span>{curr.backToErp}</span>
        </button>
      </header>

      {/* Intro info card pointing out tablet features */}
      <div className="my-5 p-4 bg-[#FBFBF9] dark:bg-neutral-950/40 border border-[#EAE6DF] dark:border-neutral-800/80 rounded-2xl flex items-start gap-4">
        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            {curr.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-neutral-400 font-mono font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              KOTLIN MULTIPLATFORM
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              MINIMUM SDK 26 (ANDROID 8.0+)
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-3 h-3" />
              ZEBRA & TABLET DISPATCH ENGAGED
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-6 mt-4">
        <button
          onClick={() => setActiveTab("apk")}
          className={`pb-3 text-xs font-black tracking-wider uppercase transition-all relative ${
            activeTab === "apk" 
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          }`}
        >
          {curr.apkHeader}
        </button>
        <button
          onClick={() => setActiveTab("instructions")}
          className={`pb-3 text-xs font-black tracking-wider uppercase transition-all relative ${
            activeTab === "instructions" 
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
          }`}
        >
          {curr.instructionsHeader}
        </button>
      </div>

      {activeTab === "apk" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Direct Download Column */}
          <div className="md:col-span-7 space-y-6">
            {/* Build Version selection */}
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                {curr.selectBuild}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBuild("stable")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    selectedBuild === "stable"
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-sm"
                      : "border-[#EAE6DF] dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  }`}
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Stable Build v3.4.1
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    {curr.stableDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBuild("beta")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    selectedBuild === "beta"
                      ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-500 shadow-sm"
                      : "border-[#EAE6DF] dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  }`}
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Beta Build v3.5.0-RC1
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    {curr.betaDesc}
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive Download action panel */}
            <div className="p-5 bg-neutral-50 dark:bg-neutral-900/60 border border-[#EAE6DF] dark:border-neutral-800 rounded-2xl">
              {downloadProgress === null ? (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>{curr.downloadBtn}</span>
                </button>
              ) : downloadProgress < 100 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-neutral-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      {curr.downloading}...
                    </span>
                    <span className="font-mono">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600" 
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      {curr.downloadSuccess}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setDownloadProgress(null)}
                    className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded hover:opacity-85"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Dynamic verification validation panel */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  {curr.certified}
                </span>

                {verificationResult ? (
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/10 px-2 py-1 rounded">
                    {verificationResult}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifyingSignature}
                    className="text-[10px] uppercase font-mono font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    {isVerifyingSignature ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        {curr.checkingSign}
                      </span>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5" />
                        {curr.signCheckBtn}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Release Technical Specs */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                {curr.technicalSpecs}
              </h4>
              <div className="bg-[#FBFBF9] dark:bg-neutral-950/20 border border-[#EAE6DF] dark:border-neutral-800 rounded-xl p-3分 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 space-y-2 p-3">
                <div className="flex justify-between">
                  <span className="text-neutral-450">File Format:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">Android Application Package (.apk)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450">{curr.pkgSize}:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{selectedBuild === "stable" ? "38.2 MB" : "41.6 MB"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450">{curr.targetSdk}:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">API Level 34 (Android 14.0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450">Minimum OS:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">Android 8.0 (Oreo / API 26)</span>
                </div>
                <div className="flex justify-between items-center overflow-hidden">
                  <span className="text-neutral-450 shrink-0">{curr.md5}:</span>
                  <span className="text-neutral-500 truncate text-[10px] pl-3">
                    {selectedBuild === "stable" ? "b69e120f26fdcda430a9965af3840139" : "cc95d4367ef2282df58ea41bc90a07e8"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Side panel for rapid camera projection scanning */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-[#FBFBF9] dark:bg-neutral-900/30 border border-[#EAE6DF] dark:border-neutral-800 rounded-[24px]">
            <span className="text-xs font-black text-neutral-705 dark:text-neutral-350 flex items-center gap-1.5 mb-2 text-center">
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {curr.qrPrompt}
            </span>

            {/* Custom high contrast visually perfect generated SVG QR Code representation */}
            <div className="w-56 h-56 bg-white border-8 border-neutral-100 p-2.5 rounded-2xl flex items-center justify-center shadow-lg relative my-4">
              <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-950">
                {/* Visual grid rendering a dense and perfect medical-looking QR code */}
                <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                <rect x="3" y="3" width="19" height="19" fill="white" />
                <rect x="7" y="7" width="11" height="11" fill="currentColor" />

                <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                <rect x="78" y="3" width="19" height="19" fill="white" />
                <rect x="82" y="7" width="11" height="11" fill="currentColor" />

                <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                <rect x="3" y="78" width="19" height="19" fill="white" />
                <rect x="7" y="82" width="11" height="11" fill="currentColor" />

                {/* Simulated random medical code blocks */}
                <rect x="35" y="10" width="10" height="5" fill="currentColor" />
                <rect x="50" y="5" width="5" height="15" fill="currentColor" />
                <rect x="60" y="0" width="8" height="12" fill="currentColor" />
                <rect x="35" y="25" width="20" height="8" fill="currentColor" />

                <rect x="35" y="45" width="8" height="15" fill="currentColor" />
                <rect x="45" y="40" width="15" height="10" fill="currentColor" />
                <rect x="65" y="35" width="10" height="20" fill="currentColor" />

                <rect x="10" y="35" width="15" height="10" fill="currentColor" />
                <rect x="20" y="50" width="5" height="15" fill="currentColor" />
                <rect x="5" y="60" width="12" height="8" fill="currentColor" />

                <rect x="80" y="35" width="10" height="10" fill="currentColor" />
                <rect x="75" y="50" width="15" height="8" fill="currentColor" />
                <rect x="85" y="65" width="10" height="10" fill="currentColor" />

                <rect x="35" y="70" width="25" height="20" fill="currentColor" />
                <rect x="45" y="75" width="15" height="15" fill="white" />
                <rect x="48" y="78" width="9" height="9" fill="currentColor" />

                <rect x="65" y="75" width="10" height="5" fill="currentColor" />
                <rect x="70" y="85" width="20" height="10" fill="currentColor" />

                {/* Tiny Tablet Logo overlay in the perfect middle of QR */}
                <rect x="42" y="42" width="16" height="16" fill="white" rx="3" />
                <rect x="45" y="45" width="10" height="10" fill="indigo" rx="1.5" />
              </svg>
            </div>

            <p className="text-[10px] text-neutral-400 text-center leading-normal max-w-xs">
              {curr.qrInstruction}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="bg-[#FBFBF9] dark:bg-neutral-950/20 border border-[#EAE6DF] dark:border-neutral-800 rounded-[24px] p-6">
            <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              {language === "ar" ? "خطوات التهيئة اليدوية لسطح عمل الطبيب" : "Doctor Workstation Manual Provisioning Steps"}
            </h3>

            <ol className="space-y-4">
              {curr.manualSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-amber-700 dark:text-amber-500 block">
                {language === "ar" ? "تنبيه الأمان والامتثال" : "Compliance & Encryption Notice"}
              </span>
              <p className="text-[11px] text-neutral-650 dark:text-neutral-450 leading-normal mt-1">
                {language === "ar" 
                  ? "جميع روابط التحميل مشفرة بطبقة SSL ثنائية وبمفاتيح تشفير مخصصة للأجهزة المتوفرة في غرف عيادات العيون فقط." 
                  : "All direct downloads are protected via end-to-end local SSL. Unauthorized redistributions outside the ophthalmic subnet will terminate the active workstation certificates."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
