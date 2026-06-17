import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, Volume2, VolumeX, Beaker, Share2, Sparkles, CheckCircle2 } from "lucide-react";
import { AppNotification } from "../types";

interface NotificationStackProps {
  notifications: AppNotification[];
  onDelete: (id: string) => void;
  language: "en" | "ar";
  mute: boolean;
  onToggleMute: () => void;
}

export default function NotificationStack({
  notifications,
  onDelete,
  language,
  mute,
  onToggleMute
}: NotificationStackProps) {
  const [showDemoButtons, setShowDemoButtons] = useState(false);

  // Quick generator to test sounds & alerts live on demand!
  const triggerMockLabAlert = () => {
    const mockNames = ["Amna Al-Mansoori", "Marcus Vance", "Mohammed Hamad", "Fatima Al-Suwaidi"];
    const patientName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const labTests = [
      { en: "Fasting Blood Sugar: 12.4 mmol/L [CRITICAL HIGH]", ar: "سكر الدم الصائم: 12.4 ملي مول/لتر [مرتفع للغاية]" },
      { en: "HbA1c Glycemic Panel: 8.6% [DM Action Required]", ar: "فحص السكري التراكمي: 8.6% [مطلوب تدخل طبي]" },
      { en: "Urinalysis Microalbumin: 320 mg/L [Renal Precaution]", ar: "تحليل زلال البول: 320 ملغ/لتر [تنبيه للفحص الكلوي]" },
      { en: "Optical Finished Lenses Completed & Calibrated [OD: -1.75 / OS: -2.00]", ar: "تم الانتهاء من تجهيز وفحص عدسات النظارة [يمين: -1.75 / يسار: -2.00]" }
    ];
    const picked = labTests[Math.floor(Math.random() * labTests.length)];

    window.dispatchEvent(
      new CustomEvent("clinical-notification", {
        detail: {
          type: "lab",
          patientId: "PAT-" + Math.floor(Math.random() * 900 + 100),
          patientName,
          titleEn: "Laboratory Report Received",
          titleAr: "تم استلام تقرير المختبر",
          messageEn: `Patient ${patientName}: ${picked.en}`,
          messageAr: `المريض ${patientName}: ${picked.ar}`
        }
      })
    );
  };

  const triggerMockReferralAlert = () => {
    const mockNames = ["Amna Al-Mansoori", "Marcus Vance", "Eleanor Vance", "Mohammed Hamad"];
    const patientName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const departments = [
      { code: "Retina Clinic", ar: "عيادة الشبكية" },
      { code: "Glaucoma Clinic", ar: "عيادة المياه الزرقاء" },
      { code: "Orbit Trauma", ar: "عيادة المحجر وإصابات العين" },
      { code: "Surgical OR", ar: "غرفة العمليات الجراحية" }
    ];
    const pickedDept = departments[Math.floor(Math.random() * departments.length)];

    window.dispatchEvent(
      new CustomEvent("clinical-notification", {
        detail: {
          type: "referral",
          patientId: "PAT-" + Math.floor(Math.random() * 900 + 100),
          patientName,
          titleEn: "Inter-Clinic Referral Dispatched",
          titleAr: "تم إرسال إحالة سريرية",
          messageEn: `Attending physician has routed patient ${patientName} directly to [${pickedDept.code}] for urgent pathology check.`,
          messageAr: `قام الطبيب المعالج بتحويل المريض ${patientName} فوراً إلى [${pickedDept.ar}] للمتابعة الطارئة.`
        }
      })
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 max-w-sm w-[350px] pointer-events-none select-none"
      dir={language === "ar" ? "rtl" : "ltr"}
      id="ehr_notification_overlay"
    >
      {/* 1. Controlling Panel & Action Bar - Tactile, Glass-morphism style */}
      <div className="bg-white/90 dark:bg-neutral-950/90 backdrop-blur border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-2xl shadow-lg pointer-events-auto flex items-center justify-between gap-2.5 transition">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6.5 h-6.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center text-indigo-650 shrink-0">
            <Bell className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-neutral-800 dark:text-neutral-300 tracking-wider block">
              {language === "ar" ? "لوحة الإشعارات الحية" : "Live Clinical Intercom"}
            </span>
            <span className="text-[8.5px] font-mono text-neutral-400 block truncate">
              {notifications.length} {language === "ar" ? "إشعارات معلقة" : "active stacking alerts"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Demo simulators toggle */}
          <button
            onClick={() => setShowDemoButtons(!showDemoButtons)}
            type="button"
            className="px-2 py-1 text-[8.5px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border border-neutral-154 dark:border-neutral-800 rounded-lg hover:bg-neutral-100 transition"
            title="Toggle Live Scenarios Testing Controllers"
          >
            {showDemoButtons ? (language === "ar" ? "إخفاء المحاكي" : "Hide Sim") : (language === "ar" ? "المحاكاة" : "Simulate")}
          </button>

          {/* Audio toggle button */}
          <button
            onClick={onToggleMute}
            type="button"
            className={`p-1.5 rounded-lg border transition ${
              mute
                ? "bg-rose-50 dark:bg-rose-950/20 border-rose-154 dark:border-rose-900 text-rose-600"
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-154 dark:border-emerald-800 text-emerald-600"
            }`}
            title={mute ? "Unmute Clinical Sound System" : "Mute Sound Alerts"}
          >
            {mute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Demonstrators (only shown when user clicks Simulation button) */}
      {showDemoButtons && (
        <div className="bg-amber-50/90 dark:bg-neutral-900/90 backdrop-blur border border-amber-200 dark:border-amber-950 p-2 rounded-xl shadow-md pointer-events-auto flex gap-1.5">
          <button
            onClick={triggerMockLabAlert}
            className="flex-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1 transition"
          >
            🧪 {language === "ar" ? "نتيجة مختبر" : "+ Lab Report"}
          </button>
          <button
            onClick={triggerMockReferralAlert}
            className="flex-1 py-1 px-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[8px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1 transition"
          >
            🔀 {language === "ar" ? "إحالة طبيب" : "+ Referral"}
          </button>
        </div>
      )}

      {/* 2. Notifications Stacking Layer */}
      <div className="flex flex-col gap-2.5 max-h-[450px] overflow-y-auto pr-1 select-text">
        <AnimatePresence>
          {notifications.map((notif) => {
            const isLab = notif.type === "lab";
            const isReferral = notif.type === "referral";

            // Visual themes based on notification classifications
            const themeBg = isLab 
              ? "bg-emerald-50/95 dark:bg-neutral-900/95 border-emerald-200 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-100"
              : isReferral
              ? "bg-indigo-50/95 dark:bg-neutral-900/95 border-indigo-200 dark:border-indigo-900/70 text-indigo-900 dark:text-indigo-100"
              : "bg-amber-50/95 dark:bg-neutral-900/95 border-amber-200 dark:border-amber-950/70 text-amber-900 dark:text-amber-100";

            const progressColor = isLab
              ? "bg-emerald-500"
              : isReferral
              ? "bg-indigo-500"
              : "bg-amber-500";

            const iconContainer = isLab
              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600"
              : isReferral
              ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600"
              : "bg-amber-100 dark:bg-amber-950/50 text-amber-600";

            return (
              <motion.div
                key={notif.id}
                initial={{ x: 150, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 150, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`w-full relative border rounded-2xl shadow-xl overflow-hidden pointer-events-auto p-4 flex gap-3 group transition ${themeBg}`}
              >
                {/* Visual Accent Glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent dark:from-white/5 pointer-events-none`} />

                {/* Left Dynamic Category Icon */}
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconContainer}`}>
                  {isLab ? (
                    <Beaker className="w-4 h-4" />
                  ) : isReferral ? (
                    <Share2 className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                {/* Core Message details */}
                <div className="flex-1 min-w-0 pr-1 select-text">
                  <div className="flex items-center justify-between mb-0.5 gap-1.5">
                    <span className="font-sans font-bold text-xs uppercase tracking-tight text-neutral-850 dark:text-neutral-200">
                      {language === "ar" ? notif.titleAr : notif.titleEn}
                    </span>
                    <span className="font-mono text-[8px] bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1 rounded font-medium">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[11.5px] leading-relaxed select-text opacity-90 font-medium">
                    {language === "ar" ? notif.messageAr : notif.messageEn}
                  </p>

                  {/* Patient tag identifiers & Discard Action Button */}
                  <div className="mt-2 flex items-center justify-between gap-1.5 pt-1.5 border-t border-black/5 dark:border-white/5">
                    {(notif.patientName || notif.patientId) ? (
                      <span className="text-[8px] uppercase tracking-wide bg-neutral-300/35 dark:bg-neutral-950/50 px-1.5 py-0.5 rounded font-bold font-mono text-neutral-600 dark:text-neutral-300">
                        👤 {notif.patientName}
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={() => onDelete(notif.id)}
                      className="px-2.5 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1 border border-black/10 dark:border-white/10 active:scale-[0.95]"
                      title="Discard and Dismiss Notification"
                    >
                      <span>{language === "ar" ? "تجاهل" : "Discard"}</span>
                    </button>
                  </div>
                </div>

                {/* Dismiss X Button */}
                <button
                  type="button"
                  onClick={() => onDelete(notif.id)}
                  className="p-1 rounded-lg hover:bg-neutral-250/20 text-neutral-400 transition self-start cursor-pointer hover:text-rose-600 dark:hover:text-rose-400"
                  aria-label="Remove Notification Alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Progress bar countdown indicator at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 8.0, ease: "linear" }}
                    className={`h-full ${progressColor}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
