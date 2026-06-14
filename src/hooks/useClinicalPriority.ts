import { useState, useEffect } from "react";

export interface PriorityRule {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  className: string; // Icon or style tag
  triggersStat: boolean;
  isActive: boolean;
  isSystem?: boolean;
}

const DEFAULT_PRIORITY_RULES: PriorityRule[] = [
  {
    id: "surgery-followup",
    nameEn: "Post-Surgical Follow-up",
    nameAr: "متابعة ما بعد الجراحة",
    descriptionEn: "Patients returning for post-operative ophthalmic suture checks, vitrectomy gas-gap monitoring, or corneal graft reviews.",
    descriptionAr: "المرضى العائدون لمتابعة ما بعد الجراحة، فحص الغرز العينية، أو مراجعة زراعة القرنية.",
    className: "from-amber-500/10 to-amber-600/5 border-amber-250",
    triggersStat: true,
    isActive: true,
    isSystem: true
  },
  {
    id: "doctor-directive",
    nameEn: "Physician Direct Directive",
    nameAr: "توجيه واعتراض مباشر من الطبيب المعالج",
    descriptionEn: "Urgent recall or emergency clinical intervention ordered directly by the consultant ophthalmologist.",
    descriptionAr: "استدعاء عاجل أو تدخل سريري طارئ مطلوب مباشرة من قِبل الطبيب الاستشاري.",
    className: "from-indigo-500/10 to-indigo-600/5 border-indigo-250",
    triggersStat: true,
    isActive: true,
    isSystem: true
  },
  {
    id: "monocular-status",
    nameEn: "Monocular Vision Vulnerability",
    nameAr: "حالة عين واحدة عاملة (خطر فقدان البصر)",
    descriptionEn: "Patient has only one functional eye; any acute complaint gets prioritized as high-risk STAT.",
    descriptionAr: "المريض لديه عين واحدة صالحة للعمل؛ أي شكوى حادة تعتبر عالية الخطورة وفرز طارئ.",
    className: "from-purple-500/10 to-purple-600/5 border-purple-250",
    triggersStat: true,
    isActive: true,
    isSystem: true
  }
];

export function useClinicalPriority() {
  const [rules, setRules] = useState<PriorityRule[]>(() => {
    try {
      const saved = localStorage.getItem("careflow_priority_rules");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to restore priority rules:", e);
    }
    return DEFAULT_PRIORITY_RULES;
  });

  useEffect(() => {
    localStorage.setItem("careflow_priority_rules", JSON.stringify(rules));
  }, [rules]);

  const addRule = (newRule: Omit<PriorityRule, "id" | "isSystem">) => {
    const id = `custom-rule-${Date.now()}`;
    const rule: PriorityRule = {
      ...newRule,
      id,
      isSystem: false
    };
    setRules(prev => [...prev, rule]);
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id || r.isSystem)); // protect systems if needed, but allow custom deletion
  };

  const toggleRuleActive = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const updateRule = (id: string, updated: Partial<PriorityRule>) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  // Automated logic formula to calculate if patient should be upgraded to "STAT_EMERGENCY"
  const evaluatePriority = (
    redFlags: {
      suddenVisionLoss: boolean;
      chemicalSplash: boolean;
      severeEyePain: boolean;
      retinalDetachmentRisk: boolean;
      [key: string]: boolean;
    },
    checkedRuleIds: string[]
  ): {
    urgency: "Normal" | "STAT_EMERGENCY";
    triggerReasonsEn: string[];
    triggerReasonsAr: string[];
  } => {
    const triggerReasonsEn: string[] = [];
    const triggerReasonsAr: string[] = [];

    // 1. Evaluate classic clinical red flags
    if (redFlags.suddenVisionLoss) {
      triggerReasonsEn.push("Sudden, Painful Vision Loss (Major Vascular Block)");
      triggerReasonsAr.push("فقدان بصر مفاجئ ومؤلم (انسداد وعائي رئيسي)");
    }
    if (redFlags.chemicalSplash) {
      triggerReasonsEn.push("Chemical Splash / Ophthalmic Foreign Substance");
      triggerReasonsAr.push("رذاذ كيميائي / جسم غريب في العين");
    }
    if (redFlags.severeEyePain) {
      triggerReasonsEn.push("Severe Uncontrolled Intraocular Pain (Glaucoma Spike)");
      triggerReasonsAr.push("ألم حاد غير مسيطر عليه داخل العين (ارتفاع ضغط العين)");
    }
    if (redFlags.retinalDetachmentRisk) {
      triggerReasonsEn.push("Acute Flashes & Floaters (Retinal Detachment risk)");
      triggerReasonsAr.push("وميض حاد وأجسام عائمة (خطر انفصال الشبكية)");
    }

    // 2. Evaluate active admin Priority Rules
    rules.forEach(rule => {
      if (rule.isActive && checkedRuleIds.includes(rule.id)) {
        if (rule.triggersStat) {
          triggerReasonsEn.push(`Admin Priority Override: ${rule.nameEn}`);
          triggerReasonsAr.push(`تجاوز الأولوية للمسؤول: ${rule.nameAr}`);
        }
      }
    });

    const shouldBeStat = triggerReasonsEn.length > 0;

    return {
      urgency: shouldBeStat ? "STAT_EMERGENCY" : "Normal",
      triggerReasonsEn,
      triggerReasonsAr
    };
  };

  return {
    rules,
    addRule,
    deleteRule,
    toggleRuleActive,
    updateRule,
    evaluatePriority
  };
}
