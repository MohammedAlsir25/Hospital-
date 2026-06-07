/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Play,
  CheckCircle2,
  Lock,
  UserCheck,
  Eye,
  FileText,
  DollarSign,
  Video,
  Database
} from "lucide-react";
import { Patient, ClinicalRole, ClinicType, BillingItem, PatientStatus } from "../types";

interface ScenarioCoachProps {
  patients: Patient[];
  onUpdatePatient: (updated: Patient) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  activeRole: ClinicalRole;
  setActiveRole: (role: ClinicalRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  language: "en" | "ar";
}

interface ScenarioStep {
  nameEn: string;
  nameAr: string;
  targetView: string;
  targetRole: ClinicalRole;
  patientStatus: PatientStatus;
  patientClinic?: ClinicType;
  instructionsEn: string;
  instructionsAr: string;
  employeeDutyEn: string;
  employeeDutyAr: string;
  actionButtonLabelEn: string;
  actionButtonLabelAr: string;
}

interface Scenario {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeEn: string;
  badgeAr: string;
  color: string;
  targetPatientId: string;
  steps: ScenarioStep[];
}

export default function ScenarioCoach({
  patients,
  onUpdatePatient,
  selectedPatientId,
  setSelectedPatientId,
  activeRole,
  setActiveRole,
  activeView,
  setActiveView,
  language
}: ScenarioCoachProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("retina_journey");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Define 3 High-Fidelity Scenarios
  const scenarios: Scenario[] = [
    {
      id: "retina_journey",
      titleEn: "Case I: Diabetic Retina Pathway",
      titleAr: "الحالة الأولى: مسار اعتلال الشبكية السكري",
      subtitleEn: "Ophthalmic pupil dilation, fundus charting, specific eye drops, & checkout",
      subtitleAr: "توسيع بؤبؤ العين، تخطيط قاع الشبكية، صرف قطرة متخصصة، والدفع",
      badgeEn: "Dilation & Mapping",
      badgeAr: "توسيع البؤبؤ ورسم الآفات",
      color: "cyan",
      targetPatientId: "PAT-001",
      steps: [
        {
          nameEn: "Kiosk Registration",
          nameAr: "تسجيل المريض بالذكاء الذاتي",
          targetView: "kiosk_enrollment",
          targetRole: "receptionist",
          patientStatus: "Registered",
          instructionsEn: "John Harrison checks in via the self-service tablet lobby, choosing the special Retina consult pathway.",
          instructionsAr: "يقوم المريض جون هاريسون بتسجيل دخوله عبر جهاز الاستقبال الذاتي، ويختار مسار استشارة الشبكية التخصصي.",
          employeeDutyEn: "Mildred (Receptionist) reviews John's database profile and schedules his encounter into the central registry database.",
          employeeDutyAr: "ملدريد (موظفة الاستقبال) تراجع بيانات جون لتثبيته في طابور العيادة وتحديد الفاتورة الأولية للخدمة.",
          actionButtonLabelEn: "Set Patient Registered",
          actionButtonLabelAr: "تسجيل المريض كمسجل جديد"
        },
        {
          nameEn: "Pre-Triage Vitals",
          nameAr: "وزن وفحص العلامات الحيوية",
          targetView: "clinical_consult",
          targetRole: "nurse",
          patientStatus: "Triaged",
          instructionsEn: "John is called to the triage desk. Vitals must be checked to confirm systemic values before medications.",
          instructionsAr: "يتم استدعاء جون إلى مكتب قياس العلامات. من الضروري فحص النظام للتأكد من ملاءمة ضغط الدم قبل إعطاء القطرات.",
          employeeDutyEn: "Sister Beatrice (Nurse) checks BP (135/85 mmHg) and logs temperature. She flags that diabetic history complies.",
          employeeDutyAr: "الممرضة بياتريس تفحص ضغط الدم (135/85) وتقيس النبض ودرجة الحرارة وتوثق استقرار حالته.",
          actionButtonLabelEn: "Save Vitals Check & Triage",
          actionButtonLabelAr: "حفظ وفحص العلامات الحيوية"
        },
        {
          nameEn: "Pupil Dilation countdown",
          nameAr: "بدء عداد توسيع حدقة العين",
          targetView: "clinical_consult",
          targetRole: "nurse",
          patientStatus: "InConsult",
          patientClinic: "Retina",
          instructionsEn: "The retina requires a dilated pupil. Administer formulation drops and activate the 20-minute countdown lock.",
          instructionsAr: "فحص الشبكية يتطلب بؤبؤ متسع بالكامل. ضع قطرة توسيع الحدقة وابدأ مؤقت العد التنازلي التلقائي.",
          employeeDutyEn: "Sister Beatrice applies diagnostic drops and logs dilation start, which locks retina canvas inputs from accidental doctors' clicks.",
          employeeDutyAr: "تقوم الممرضة بوضع قطرات توسيع العين وتبدأ تشغيل عداد الدقائق لحماية شبكة سلامة المريض الطبية.",
          actionButtonLabelEn: "Trigger Dilation countdown Timer",
          actionButtonLabelAr: "تفعيل عداد مؤقت توسيع بؤبؤ العين"
        },
        {
          nameEn: "Retina Lesion Mapping",
          nameAr: "رسم آفات الشبكية على المخطط",
          targetView: "clinical_consult",
          targetRole: "doctor",
          patientStatus: "InConsult",
          patientClinic: "Retina",
          instructionsEn: "Hassan's pupil is fully dilated. Dr. Sterling uses the ophthalmic biomicroscope lamp to map lesions.",
          instructionsAr: "بؤبؤ المريض متسع بالكامل الآن. يستخدم الدكتور ستيرلينغ المجهر الطبي لرسم وتحديد آفات الشبكية وقاع العين.",
          employeeDutyEn: "Dr. Sterling (Consultant) plots diabetic hemorrhages and drusen directly on the ocular canvas, logging coordinates into notes.",
          employeeDutyAr: "يقوم الطبيب ستيرلينغ برسم آفة شبكية وتوثيق النزيف بدقة على مخطط قاع العين وتخزين إحداثيات المشكلة.",
          actionButtonLabelEn: "Plot Lesions & Finalize Exam",
          actionButtonLabelAr: "تسمير مكان الآفة وإنهاء الاستشارة"
        },
        {
          nameEn: "Drug Stock Deduction",
          nameAr: "صرف الأدوية وخصم المخزون",
          targetView: "diagnostics_labs",
          targetRole: "pharmacist",
          patientStatus: "Dispensing",
          instructionsEn: "The doctor prescribes Latanoprost Eye Drops. Retrieve from physical vault and dispense to John.",
          instructionsAr: "قرر الدكتور كتابة قطرة المياه الزرقاء والضغط 'لاتانوبروست'. يجب خصمها وصرفها للمريض من مستودع المواد الطبية.",
          employeeDutyEn: "Pharmacist Vance checks pharmaceutical inventory stocks, deducts the drop, and compiles a signed high-fidelity prescription PDF.",
          employeeDutyAr: "الصيدلي فانس يقوم بمطابقة الدواء وخصمه من المخزن الإلكتروني وصياغة الوصفة الطبية الآمنة المشفرة.",
          actionButtonLabelEn: "Dispense Drug & Download Paper PDF",
          actionButtonLabelAr: "صرف قطرة العين وتصدير مستند الوصفة"
        },
        {
          nameEn: "Cashier Ledger checkout",
          nameAr: "تسوية الحساب مع المحاسب المالي",
          targetView: "diagnostics_labs",
          targetRole: "accountant",
          patientStatus: "BillingPending",
          instructionsEn: "Review itemized invoice (Consultation fee, Triage vitals, Latanoprost drops). Patient has unpaid ledger balance.",
          instructionsAr: "عرض الفاتورة الإجمالية الشاملة (كشف العيادة، قياس العلامات، وقطرات الصيدلية) لتحصيل القيمة من المريض المباشر.",
          employeeDutyEn: "Ebenezer (Cashier Accountant) clears outstanding billing item invoices to PAID and runs the patient's finalized Discharge.",
          employeeDutyAr: "إبينيزر (المحاسب المالي) يراجع الفواتير غير المدفوعة ويحول حالتها إلى 'مسدد' ثم يضغط 'تسريح المريض والأرشفة'.",
          actionButtonLabelEn: "Swipe Payment & Fully Discharge",
          actionButtonLabelAr: "سداد حساب الفاتورة وإجراء المغادرة الكاملة"
        }
      ]
    },
    {
      id: "stat_trauma",
      titleEn: "Case II: STAT Emergency Orbit Trauma",
      titleAr: "الحالة الثانية: طوارئ إصابة محجر العين (مستعجل جداً)",
      subtitleEn: "Trauma priority override, vertical oculomotor score, DICOM skull PACS review, & surgery billing",
      subtitleAr: "تخطي طابور الأولوية، فحص حركة عضلات العين، مراجعة صور الأشعة المقطعية، وحجز الجراحة",
      badgeEn: "Emergency STAT",
      badgeAr: "طوارئ في الحال",
      color: "rose",
      targetPatientId: "PAT-005",
      steps: [
        {
          nameEn: "Emergency Intake Priority",
          nameAr: "استقبال حالة الطوارئ الحرجة",
          targetView: "kiosk_enrollment",
          targetRole: "receptionist",
          patientStatus: "Registered",
          instructionsEn: "Marcus Aurelius arrives with severe left orbit trauma and drooping eyelid. Trigger STAT Emergency override.",
          instructionsAr: "يصل المريض ماركوس أوريليوس يعاني من كسر في محجر العين وارتخاء كامل في الجفن. يجب رفع درجة الأولوية إلى قصوى.",
          employeeDutyEn: "Mildred flags Marcus as 'STAT_EMERGENCY' in EMR database. Blinking red banners appear on all staff dashboards.",
          employeeDutyAr: "تقبل ملدريد البيانات وترفع تيجان الإنذار في النظام ليظهر اسم المريض باللون الأحمر والتحذير الوامض لسرعة الاستدعاء.",
          actionButtonLabelEn: "Trigger Urgent STAT Emergency Flag",
          actionButtonLabelAr: "تفعيل إنذار الطوارئ الفوري"
        },
        {
          nameEn: "STAT Priority Consult",
          nameAr: "استشارة الطوارئ الفورية للعين",
          targetView: "clinical_consult",
          targetRole: "doctor",
          patientStatus: "InConsult",
          patientClinic: "Orbit",
          instructionsEn: "Marcus bypasses all other patients in the list. Dr. Sterling checks binocular excursion limits immediately.",
          instructionsAr: "يتخطى ماركوس جميع مرضى الانتظار تلقائياً. يقوم الدكتور ستيرلينغ فوراً بفحص حركة عضلات العين وحركة الجفن.",
          employeeDutyEn: "Dr. Sterling sets muscle movement score to 2/5 (severe deficit consistent with orbital blowout fracture blowout).",
          employeeDutyAr: "يوثق الطبيب تقييد حركة العين الرأسية بـ 5/2 ويؤكد شكوكه حول حدوث كسر وفخ في عضلات محجر العين السفلي.",
          actionButtonLabelEn: "Log Orbit Restriction Score (2/5)",
          actionButtonLabelAr: "تسجيل تقييد حركة العين (2/5)"
        },
        {
          nameEn: "Neuro-Radiology PACS DICOM Scan",
          nameAr: "استدعاء أشعة مقطعية DICOM",
          targetView: "diagnostics_labs",
          targetRole: "nurse",
          patientStatus: "InConsult",
          patientClinic: "Orbit",
          instructionsEn: "Order urgent Cranial Orbit CT. Review the neuro DICOM scan slices to check blowout state.",
          instructionsAr: "سحب وتحليل الأشعة المقطعية فوراً ومراجعة مقاطع عظام العين لمشاهدة التفتت تحت حدقة محجر العين.",
          employeeDutyEn: "The technologist queries axial skull tomograms, showing blowout fracture boundaries. Results are attached to patient records.",
          employeeDutyAr: "يتم تحميل ملفات الأشعة ثلاثية الأبعاد DICOM في النظام للتأكد من وجود الكسر وتهتك العضلات بصرياً.",
          actionButtonLabelEn: "Pull Neuro DICOM Cranial Scan",
          actionButtonLabelAr: "سحب وعرض أشعة مقطع الجمجمة"
        },
        {
          nameEn: "Emergency Procedure Billing",
          nameAr: "إثبات الفاتورة الجراحية العاجلة",
          targetView: "diagnostics_labs",
          targetRole: "accountant",
          patientStatus: "BillingPending",
          instructionsEn: "Dr. Sterling orders surgical reconstruction. This logs an item of $1,850 directly to Marcus's financial checkout statement.",
          instructionsAr: "يعتمد الطبيب قرار إجراء جراحة جفن ترميمية عاجلة. يتسبب هذا في إدراج مبلغ 1,850 دولار مباشرةً في حساب المريض.",
          employeeDutyEn: "CFO Ebenezer conducts ledger billing verification and coordinates pre-authorization with the traumatology insurance carrier.",
          employeeDutyAr: "إبينيزر يراجع مطالبات التغطية للتأمين الطبي لاعتماد بند العملية وتغطيتها مالياً بالكامل تمهيداً للجراحة.",
          actionButtonLabelEn: "Log $1850 surgical Bill Claim",
          actionButtonLabelAr: "أدرج بند فاتورة جراحية بـ1850$"
        },
        {
          nameEn: "Complete Discharge Files",
          nameAr: "تسوية الحساب وإنهاء التنويم",
          targetView: "diagnostics_labs",
          targetRole: "accountant",
          patientStatus: "Completed",
          instructionsEn: "Financial claims are cleared. Discharge Marcus to the active Operating Theatre database ward registry.",
          instructionsAr: "تم سداد البنود وتكللت بالنجاح المالي والاعتماد. يتم تسريح المريض لغرفة معالجة العمليات.",
          employeeDutyEn: "Ebenezer finalizes discharge files, closing EMR record log history and logging archived success stats.",
          employeeDutyAr: "ينهي المحاسب الملف المالي والسريري بشكل متكامل لإغلاق الملف وحفظ السجلات الطبية.",
          actionButtonLabelEn: "Archive Record & Discharge Marcus",
          actionButtonLabelAr: "أرشفة السجل الطبي وتفريغ المريض"
        }
      ]
    },
    {
      id: "pediatric_gate",
      titleEn: "Case III: Age Safeguard & Glass Refraction",
      titleAr: "الحالة الثالثة: حارس السن وقياس النظر",
      subtitleEn: "Pediatric check-in threshold safeguard, automatic clinic reroute, refraction charts, refraction formulas",
      subtitleAr: "اختبار سن المريض التلقائي، إعادة التوجيه لعيادة الكبار، تحديد قياسات العدسات الطبية",
      badgeEn: "Age Guard Rail",
      badgeAr: "محدد جدار السن",
      color: "purple",
      targetPatientId: "PAT-004", // Lydia Vance (Lydia is 8 in original, but let's simulate her or a new patient at age 15)
      steps: [
        {
          nameEn: "Intake Validation Attempt",
          nameAr: "محاولة تسجيل الطفل بالسن",
          targetView: "kiosk_enrollment",
          targetRole: "receptionist",
          patientStatus: "Registered",
          instructionsEn: "Ameera Al-Said (Age 15) attempts to check-in to Pediatrics. Pediatrics has a strict limit of 14 Yr.",
          instructionsAr: "تحاول المريضة أميرة السعيد (15 سنة) حجز عيادة عيون الأطفال، بينما محدد السن الأقصى لعيادة الأطفال هو 14 سنة.",
          employeeDutyEn: "EMR front-end middleware validates age. The receptionist explains the policy as the tablet triggers dynamic clinic reassignment.",
          employeeDutyAr: "تقرأ خوارزمية السجل وبوابة التسجيل السن فوراً وتقارنه بحدود العيادة الطبية لتنبيه موظف الاستقبال.",
          actionButtonLabelEn: "Check Age & Trigger Safeguard",
          actionButtonLabelAr: "فحص السن وتفعيل جدار الحماية"
        },
        {
          nameEn: "Automatic Reroute Action",
          nameAr: "إعادة التوجيه التلقائي لعيادة العيون",
          targetView: "kiosk_enrollment",
          targetRole: "receptionist",
          patientStatus: "Registered",
          instructionsEn: "The Pediatrics Ophthalmology module locks. EMR dynamically assigns Ameera to General Ophthalmology.",
          instructionsAr: "يغلق حقل عيادة الأطفال تلقائياً، ويعيد النظام جدولة أميرة إلى قسم العيادة الشاملة لعيون الكبار العام.",
          employeeDutyEn: "Mildred is prompted with an audit alert: 'Client age > 14. Diverting medical path to GeneralComprehensive Room.' Queue updates.",
          employeeDutyAr: "يظهر إنذار لـ ملدريد: 'عمر المريض 15 سنة. تم رصد التحويل إلى عيادة العيون العامة'. يتبدل طابور الانتظار تلقائياً.",
          actionButtonLabelEn: "Reroute Patient dynamically",
          actionButtonLabelAr: "تنفيذ إعادة التوجيه الفوري في الطابور"
        },
        {
          nameEn: "Refraction Index Charting",
          nameAr: "قياس انكسار الضوء وتحديد العدسة",
          targetView: "clinical_consult",
          targetRole: "doctor",
          patientStatus: "InConsult",
          patientClinic: "General Ophthalmology",
          instructionsEn: "Ameera is examined. Dr. Sterling uses trial lenses and charts Sphere (-2.25) and Cylinder (-0.75) values.",
          instructionsAr: "يتم فحص أميرة. يقيس الدكتور قصر النظر والانحراف (الاستجماتيزم) لتثبيت قياس مقاس عدسة النظارة الطبية بدقة.",
          employeeDutyEn: "Dr. Sterling completes the optical refraction spreadsheet blueprint. Sphere, Cylinder, and axis parameters are locked.",
          employeeDutyAr: "يكتب الدكتور قياسات انكسار الضوء (المجال السطحي -2.25، والأسطوانة -0.75، والمحور 180) ويحفظ المعادلة.",
          actionButtonLabelEn: "Save Refraction specs",
          actionButtonLabelAr: "تخزين معادلة كشف النظارة"
        },
        {
          nameEn: "Ancillary Optics Blueprint Sales",
          nameAr: "معمل تجهيز النظارات والعدسات",
          targetView: "diagnostics_labs",
          targetRole: "pharmacist",
          patientStatus: "Dispensing",
          instructionsEn: "Pass the refractive blueprint eyeglasses order. Pharmacist Vance registers the isolated visual glass design.",
          instructionsAr: "تحويل طلب النظارة لخط تجهيز النظارات للتصميم الفعلي وربطه بالفاتورة الحسابية لشرائه.",
          employeeDutyEn: "Pharmacist registers the isolated glass design ($180) to accounting, preventing chemical pharmacology stock mixing.",
          employeeDutyAr: "يقوم الصيدلي بتسجيل تكلفة النظرة المعزولة في الفاتورة بقيمة 180 دولار استعداداً لتفصيلها في ورشة البصريات.",
          actionButtonLabelEn: "Add Glasses Blueprint to billing",
          actionButtonLabelAr: "إدراج النظارة الطبية في حساب الفاتورة"
        },
        {
          nameEn: "Final Ledger Clear",
          nameAr: "تسوية الحساب الكلي والأرشفة",
          targetView: "diagnostics_labs",
          targetRole: "accountant",
          patientStatus: "Completed",
          instructionsEn: "Clear Ameera's pending invoices and print out her custom glasses prescription card in the Cashier Ledger.",
          instructionsAr: "تحصيل فاتورة مقاس النظارة وتجهيزها وتسليم وثيقة مقاس القياسات مطبوعة للمريض ومغادرة المستشفى.",
          employeeDutyEn: "Ebenezer closes the patient's record, marking files discharged with a successful clinical log transition history.",
          employeeDutyAr: "يضغط إبينيزر دفع كامل الحساب ويطلق إشعار تسريح المريض السعيد بنجاح.",
          actionButtonLabelEn: "Pay Bill & Close Pediatric Case",
          actionButtonLabelAr: "دفع وإكمال مسار المريض وحفل الملف"
        }
      ]
    }
  ];

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const activeStep = activeScenario.steps[currentStepIndex] || activeScenario.steps[0];

  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    setCurrentStepIndex(0);
    setSimulationLogs((prev) => [
      ...prev,
      `🔄 [Scenario Switch] Loaded ${scenarios.find((s) => s.id === id)?.titleEn}. Starting at Step 1...`
    ]);
  };

  const handleApplyEnviroment = () => {
    // Stage 1: Change EMR View & Active Role
    setActiveRole(activeStep.targetRole);
    setActiveView(activeStep.targetView);
    setSelectedPatientId(activeScenario.targetPatientId);

    // If step assigns clinic, update patient's clinic
    const currentPatient = patients.find((p) => p.id === activeScenario.targetPatientId);
    if (currentPatient && activeStep.patientClinic) {
      onUpdatePatient({
        ...currentPatient,
        clinic: activeStep.patientClinic
      });
    }

    setSimulationLogs((prev) => [
      ...prev,
      `🎭 [Hotswap Environment] Set Workspace Role to [${activeStep.targetRole.toUpperCase()}] and Canvas Screen View to [${activeStep.targetView.toUpperCase()}]. selected Patient ID: [${activeScenario.targetPatientId}].`
    ]);

    setToastMessage(
      language === "ar"
        ? `تم مطابقة الواجهة! الآن في شاشة [${activeStep.targetView}] بدور [${activeStep.targetRole}] للمريض [${activeScenario.targetPatientId}].`
        : `Interface matched! Now in [${activeStep.targetView}] as [${activeStep.targetRole}] for Patient [${activeScenario.targetPatientId}].`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteStepDB = () => {
    const pId = activeScenario.targetPatientId;
    const currentPatient = patients.find((p) => p.id === pId);
    if (!currentPatient) return;

    // Build the medical execution states for each scenario & step index
    let notes = "";
    let updatedPatient: Patient = { ...currentPatient };

    if (activeScenarioId === "retina_journey") {
      switch (currentStepIndex) {
        case 0: // Registered
          updatedPatient = {
            ...currentPatient,
            name: "John Harrison (Retina Study)",
            status: "Registered",
            clinic: "Medicine",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Scenario Coach",
                action: "Simulated Registration Check-In",
                notes: "Hassan Al-Jawarih self-registers for Ophthalmic Retina Evaluation."
              }
            ]
          };
          notes = "Database sync: Set status to Registered. Scheduled Ophthalmic entry.";
          break;
        case 1: // Triaged Vitals
          updatedPatient = {
            ...currentPatient,
            status: "Triaged",
            triageVitals: {
              systolic: 135,
              diastolic: 85,
              heartRate: 72,
              temperatureCelcius: 36.8,
              weightKg: 82,
              urgency: "Normal",
              vitalsVerified: true
            },
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Triage Nurse (Sim)",
                action: "Vitals Recorded",
                notes: "Systolic: 135, Diastolic: 85, HR: 72, Temp: 36.8 Celsius. System checked safe for drops."
              }
            ]
          };
          notes = "Database updated: Triage blood pressure and heart rate successfully logs. Patient cleared for medicine drops.";
          break;
        case 2: // Pupil dilation countdown timer
          updatedPatient = {
            ...currentPatient,
            status: "InConsult",
            clinic: "Retina",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Triage Sister (Sim)",
                action: "Dilation drops administered",
                notes: "Latanoprost dilation drops instilled in left/right eyes. Mandatory 20-minute timer started."
              }
            ]
          };
          notes = "Mydriatic safety clock engaged! Locked clinical inputs successfully. Patient resting in clinic waiting chair.";
          break;
        case 3: // Ocular Retina graphing
          updatedPatient = {
            ...currentPatient,
            status: "LabsPending",
            clinic: "Retina",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Ophthalmologist (Sim)",
                action: "Fundus Examination",
                notes: "Ophthalmic biomicroscopy completed under fully dilated pupil. Hemorrhages and cotton wool spots found near coordinates X:125, Y:98."
              }
            ],
            billingLedger: [
              ...currentPatient.billingLedger,
              {
                id: `BIL-RET-${Math.floor(100 + Math.random() * 900)}`,
                serviceName: "Fundus Biomicroscopy Laser Mapping",
                category: "ClinicalLab",
                amount: 120,
                status: "Unpaid"
              }
            ]
          };
          notes = "Ocular map verified! Plotted coordinates synced successfully with electronic EMR record. Laser mapping bill added ($120).";
          break;
        case 4: // Stock dispense Latanoprost drops
          updatedPatient = {
            ...currentPatient,
            status: "BillingPending",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Main Pharmacist (Sim)",
                action: "Latanoprost Dispensed",
                notes: "1 unit of Latanoprost 0.005% Ophthalmic Drops picked up. Physical warehouse inventory deducted."
              }
            ],
            billingLedger: [
              ...currentPatient.billingLedger,
              {
                id: `BIL-RX-${Math.floor(100 + Math.random() * 900)}`,
                serviceName: "Latanoprost 0.005% Drops (60ml)",
                category: "PharmacyDispense",
                amount: 35,
                status: "Unpaid"
              }
            ]
          };
          notes = "Warehouse stock reduced from active vaults. Digitally certified RxNorm prescription PDF downloaded successfully!";
          break;
        case 5: // Cashier pay & Discharge
          const clearedLedger = currentPatient.billingLedger.map((b) => ({ ...b, status: "Paid" as const }));
          updatedPatient = {
            ...currentPatient,
            status: "Completed",
            billingLedger: clearedLedger,
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Cashier System (Sim)",
                action: "Encounter Cleared & Closed",
                notes: "Invoice paid in full. Patient Hassan discharged from active EHR systems."
              }
            ]
          };
          notes = "Financial synchronization complete. All invoices paid. Patient successfully archived. Case closed!";
          break;
        default:
          break;
      }
    } else if (activeScenarioId === "stat_trauma") {
      switch (currentStepIndex) {
        case 0: // Emergency Priority Override
          updatedPatient = {
            ...currentPatient,
            status: "Registered",
            clinic: "Orbit",
            triageVitals: {
              ...(currentPatient.triageVitals || {
                systolic: 140,
                diastolic: 90,
                heartRate: 88,
                temperatureCelcius: 38.2,
                weightKg: 78,
                vitalsVerified: true
              }),
              urgency: "STAT_EMERGENCY"
            },
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Emergency Desk",
                action: "STAT Intake Alert",
                notes: "Left orbit acute trauma. Flagged STAT Emergency. Shifting to index position #1!"
              }
            ]
          };
          notes = "Critical trauma dispatch! Robert bypasses standard queues. Globally flashing red alerts visible.";
          break;
        case 1: // Consult: Muscle movement limits
          updatedPatient = {
            ...currentPatient,
            status: "InConsult",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Consultant Dr. Sterling (Sim)",
                action: "Muscle Excursion Scoring",
                notes: "Vertical oculomotor score logged at score: 2/5. Drooping eyelid and soft tissue protrusion noted."
              }
            ]
          };
          notes = "Oculomotor limitation score locked. Diagnosed lower orbital wall entrapment risk.";
          break;
        case 2: // Radiology Scan
          updatedPatient = {
            ...currentPatient,
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Radiology Tech",
                action: "PACS CT imaging complete",
                notes: " Axial and coronal DICOM tomogram scans uploaded. Disclosed orbital blowout fractures."
              }
            ],
            billingLedger: [
              ...currentPatient.billingLedger,
              {
                id: `BIL-RAD-${Math.floor(100 + Math.random() * 900)}`,
                serviceName: "Urgent Ocular Skull CT (Tomography)",
                category: "RadiologyProof",
                amount: 320,
                status: "Unpaid"
              }
            ]
          };
          notes = "Imaging uploaded! Real skull slice scans loaded on PACS view card. Radiology bill logged ($320).";
          break;
        case 3: // Surgical Recon Hold Fee added
          updatedPatient = {
            ...currentPatient,
            status: "BillingPending",
            billingLedger: [
              ...currentPatient.billingLedger,
              {
                id: `BIL-SURG-${Math.floor(1000 + Math.random() * 9000)}`,
                serviceName: "Emergency Orbital Blowout Reconstruction Surgery Fee",
                category: "DentalSurgical",
                amount: 1850,
                status: "Unpaid"
              }
            ]
          };
          notes = "Pre-authorization approved! Heavy operating theater procedure cost ($1,850) charged to invoice.";
          break;
        case 4: // Clear balance and discharge
          const traumaCleared = currentPatient.billingLedger.map((b) => ({ ...b, status: "Paid" as const }));
          updatedPatient = {
            ...currentPatient,
            status: "Completed",
            billingLedger: traumaCleared,
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Emergency Cashier",
                action: "Claims Fully Settled",
                notes: "Trauma surgery ledger status set to PAID. Sent to active wards database."
              }
            ]
          };
          notes = "All trauma invoices matched and cleared. Captain Mercer transferred safely to physical Operating Theatre!";
          break;
        default:
          break;
      }
    } else if (activeScenarioId === "pediatric_gate") {
      switch (currentStepIndex) {
        case 0: // Intake Validation Attempt
          notes = "Front-end age validation completed. Detected age 15 ( DOB 2011). Triggered Pediatrics limit gate!";
          break;
        case 1: // Automatic Reroute Action
          updatedPatient = {
            ...currentPatient,
            clinic: "General Ophthalmology",
            pediatricRedirected: true,
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "EMR Age Gatekeeper",
                action: "Schedules Rerouted",
                notes: "Patient age is 15. Blocked pediatric consultation entry and rerouted demographics."
              }
            ]
          };
          notes = "Diverted Ameera Al-Said to the correct Comprehensive General Ophthalmology clinic queue.";
          break;
        case 2: // Refraction Index Sphere/Cylinder
          updatedPatient = {
            ...currentPatient,
            status: "LabsPending",
            clinic: "General Ophthalmology",
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Ophthalmologist (Sim)",
                action: "Ocular Refraction Recorded",
                notes: "Sphere: -2.25, Cylinder: -0.75, Axis: 180. Ordered custom eyeglasses refraction compound blueprint."
              }
            ]
          };
          notes = "Glasses prescription refraction index calculated! Sphere (-2.25), Cylinder (-0.75), and Axis (180) logged.";
          break;
        case 3: // Add eyeglasses layout to billing
          updatedPatient = {
            ...currentPatient,
            status: "BillingPending",
            billingLedger: [
              ...currentPatient.billingLedger,
              {
                id: `BIL-OPT-${Math.floor(100 + Math.random() * 900)}`,
                serviceName: "Refractive Index Isolated Eyeglasses Composite design",
                category: "PharmacyDispense",
                amount: 180,
                status: "Unpaid"
              }
            ]
          };
          notes = "Optical lab blueprint registered to cashier desk. Glass manufacturing hold order created ($180).";
          break;
        case 4: // Pay & Close
          const optPaid = currentPatient.billingLedger.map((b) => ({ ...b, status: "Paid" as const }));
          updatedPatient = {
            ...currentPatient,
            status: "Completed",
            billingLedger: optPaid,
            clinicalLogs: [
              ...currentPatient.clinicalLogs,
              {
                timestamp: new Date().toLocaleTimeString().slice(0, 5),
                actorRole: "Ledger Cashier",
                action: "Invoice Paid",
                notes: "Eyeglasses sales finalized. Refraction cards printed and patient discharged."
              }
            ]
          };
          notes = "Clearance verified! Ameera receives her custom lens blueprint card. Sabbatical logs archived successfully.";
          break;
        default:
          break;
      }
    }

    // Dispatch update to parent state
    onUpdatePatient(updatedPatient);

    // Append simulation logs
    setSimulationLogs((prev) => [
      ...prev,
      `⚡ [DB Execution] Run step [${activeStep.nameEn}]: ${notes}`
    ]);

    setToastMessage(
      language === "ar"
        ? `تم محاكاة كتابة البيانات الطبية! البند: ${notes.slice(0, 40)}...`
        : `Simulated clinical write! Action: ${notes.slice(0, 45)}...`
    );
    setTimeout(() => setToastMessage(null), 3000);

    // Advance index if not last step
    if (currentStepIndex < activeScenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setSimulationLogs((prev) => [
        ...prev,
        `🎉 [Scenario Completed] Successfully executed all steps of ${activeScenario.titleEn}! Clinic record state in perfect sync.`
      ]);
    }
  };

  const handleResetStep = () => {
    setCurrentStepIndex(0);
    setSimulationLogs((prev) => [
      ...prev,
      `🔄 [Reset] Restarted current walkthrough scenario back to Step 1.`
    ]);
  };

  const activeStepMetaEn = `Step ${currentStepIndex + 1} of ${activeScenario.steps.length}: ${activeStep.nameEn}`;
  const activeStepMetaAr = `الخطوة ${currentStepIndex + 1} من ${activeScenario.steps.length}: ${activeStep.nameAr}`;

  return (
    <div className="bg-[var(--clr-bg-card)] dark:bg-[var(--clr-bg-card)] border border-neutral-350 dark:border-neutral-850 rounded-3xl shadow-sm overflow-hidden flex flex-col gap-0 transition-all duration-300">
      
      {/* Top bar with quick tabs */}
      <div className="p-5 bg-neutral-100/40 dark:bg-neutral-900/85 border-b border-neutral-300 dark:border-neutral-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-[#0F1E46] dark:text-[#2BBFFF] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Sparkles className="w-4 h-4 text-[#FF841A]" />
            {language === "ar" ? "مدرب المحاكاة التفاعلية لمسار المرضى والموظفين" : "Interactive CareFlow Scenario walkthrough coach"}
          </h3>
          <span className="text-[10px] text-neutral-400 block font-mono">
            {language === "ar" ? "طابق أدوار الموظفين بالكامل لتعلم كيفية تلبية رغبات المرضى السريرية" : "Match employee roles and databases to learn clinical execution protocols step by step"}
          </span>
        </div>

        {/* Quick Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                activeScenarioId === s.id
                  ? s.color === "cyan"
                    ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200"
                    : s.color === "rose"
                    ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200"
                    : "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200"
                  : "bg-neutral-100 dark:bg-neutral-850 text-neutral-500 hover:text-neutral-700 border border-transparent"
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{language === "ar" ? s.badgeAr : s.badgeEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main scenario body split */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
        
        {/* Absolute floating toast */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F1E46] dark:bg-[#1A2B5E] text-white border border-[#2BBFFF]/20 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Left column: Narrative & Instruction cards */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Active case summary header */}
          <div className="bg-[#F5F1EA]/50 dark:bg-[#1E2235]/40 border border-neutral-300 dark:border-neutral-800 p-4 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
            <span className="text-[9px] font-mono font-black text-[#FF841A] block uppercase tracking-widest mb-1">
              {language === "ar" ? "تفاصيل حالة المحاكاة النشطة" : "ACTIVE SIMULATION PROFILE CASE"}
            </span>
            <h4 className="font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-teal-500 rounded-full" />
              {language === "ar" ? activeScenario.titleAr : activeScenario.titleEn}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              {language === "ar" ? activeScenario.subtitleAr : activeScenario.subtitleEn}
            </p>
          </div>

          {/* Stepper timeline */}
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-b dark:border-neutral-800 no-scrollbar">
            {activeScenario.steps.map((st, sIdx) => {
              const isPast = sIdx < currentStepIndex;
              const isCurrent = sIdx === currentStepIndex;
              return (
                <div key={st.nameEn} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(sIdx)}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      isCurrent
                        ? "bg-[#0F1E46] dark:bg-[#2BBFFF] text-[#2BBFFF] dark:text-[#0F1E46] scale-103 shadow-md shadow-neutral-400/10 dark:shadow-teal-950/20 ring-2 ring-[#2BBFFF]/20"
                        : isPast
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/50"
                        : "bg-[var(--clr-bg-card)] dark:bg-[#151824] border border-neutral-200 dark:border-neutral-850 text-neutral-450 hover:border-[#FF841A]/50"
                    }`}
                    title={language === "ar" ? st.nameAr : st.nameEn}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                      isCurrent 
                        ? "bg-[#2BBFFF]/20 dark:bg-[#0F1E46]/20 text-inherit" 
                        : isPast 
                        ? "bg-emerald-200/50 dark:bg-emerald-950/50 text-inherit"
                        : "bg-neutral-100 dark:bg-neutral-820 text-neutral-400"
                    }`}>
                      {sIdx + 1}
                    </span>
                    <span className="hidden sm:inline max-w-[105px] truncate font-sans">
                      {language === "ar" ? st.nameAr : st.nameEn}
                    </span>
                  </button>
                  {sIdx < activeScenario.steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-800 mx-1 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Guidelines Split Row cards with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeScenarioId}_${currentStepIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              
              {/* 1. Patient Perspective Card */}
              <div className="bg-[var(--clr-bg-card)] dark:bg-[#151824] border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-500" />
                <div>
                  <span className="text-[9px] font-mono font-black text-teal-600 dark:text-teal-400 block tracking-widest uppercase mb-2 pl-1.5">
                    🎒 {language === "ar" ? "مسار المريض وأهدافه" : "PATIENT PERSPECTIVE PATH"}
                  </span>
                  <span className="font-extrabold text-[11px] text-[#0F1E46] dark:text-neutral-300 font-mono tracking-wider block mb-2 pl-1.5 uppercase">
                    {language === "ar" ? activeStepMetaAr : activeStepMetaEn}
                  </span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans pl-1.5">
                    {language === "ar" ? activeStep.instructionsAr : activeStep.instructionsEn}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-150 dark:border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase pl-1.5">
                  <span>Target Status</span>
                  <span className="text-[#FF841A] font-mono font-black bg-[#FF841A]/5 px-2 py-0.5 rounded border border-[#FF841A]/10">
                    {activeStep.patientStatus}
                  </span>
                </div>
              </div>

              {/* 2. Employee Objective Card */}
              <div className="bg-teal-50/20 dark:bg-teal-950/5 border border-teal-100 dark:border-teal-900/50 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                <div>
                  <span className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-500 block tracking-widest uppercase mb-2 pl-1.5">
                    👔 {language === "ar" ? "مهام الموظف وإرشادات العمل" : "EMPLOYEE OPERATION DUTY"}
                  </span>
                  <div className="flex items-center gap-1.5 mb-2.5 pl-1.5">
                    <span className="text-[10px] uppercase font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-100/50 dark:bg-teal-950/45 px-2 py-0.5 rounded border border-teal-200/50">
                      {activeStep.targetRole.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium select-none">is active on desk</span>
                  </div>
                  <p className="text-xs text-neutral-650 dark:text-neutral-350 leading-relaxed font-sans pl-1.5">
                    {language === "ar" ? activeStep.employeeDutyAr : activeStep.employeeDutyEn}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-teal-100/50 dark:border-neutral-800/80 flex justify-between items-center text-[10px] pl-1.5">
                  <span className="text-neutral-400 font-bold uppercase">Required View</span>
                  <span className="text-[#2BBFFF] font-mono font-black bg-[#2BBFFF]/5 px-2.5 py-0.5 rounded border border-[#2BBFFF]/10 uppercase">
                    {activeStep.targetView.replace("_", " ")}
                  </span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Action hotkeys for the step */}
          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 shadow-md border border-neutral-800">
            <div className="flex items-center gap-12 border-b md:border-b-0 pb-2 md:pb-0 font-sans">
              <div className="text-xs">
                <span className="text-neutral-450 text-[9px] uppercase font-mono tracking-widest block mb-0.5">Active Step Guide Execution</span>
                <span className="font-extrabold text-[12px] text-teal-400">
                  {language === "ar" ? "تحكم في الواجهات الطبية والبيانات" : "Control EHR interface context & state write"}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 flex-grow md:flex-none justify-end w-full md:w-auto">
              <button
                type="button"
                onClick={handleApplyEnviroment}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 hover:text-white rounded-xl text-[10.5px] font-extrabold uppercase flex items-center gap-1.5 transition duration-200 cursor-pointer"
                title="Change active role and active visual tab instantly in the health EMR"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === "ar" ? "تهيئة بيئة العمل" : "1. Match Interface"}</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteStepDB}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[10.5px] font-black uppercase flex items-center gap-1.5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer block"
                title="Inject clinical vitals, dilation, retina logs, or pay bills into patient database"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>
                  {language === "ar" ? activeStep.actionButtonLabelAr : activeStep.actionButtonLabelEn}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Local Simulator Live Logs Terminal */}
        <div className="lg:col-span-5 bg-neutral-950 text-neutral-200 p-4.5 rounded-2xl border border-neutral-850 flex flex-col justify-between font-mono text-[10.5px] shadow-lg relative min-h-[350px]">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-neutral-850 pb-2.5">
              <span className="text-[9px] text-[#2BBFFF] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                📡 Central Simulation Sync Logs (Live)
              </span>
              <button
                type="button"
                onClick={() => setSimulationLogs([])}
                className="text-[9px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
              >
                Clear Screen
              </button>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 no-scrollbar">
              <div className="text-[9px] text-neutral-600 font-semibold tracking-wide">
                [SYSTEM READY] Listening for clinic database transactions... HL7_Reconcile = true.
              </div>
              
              {simulationLogs.map((logStr, lIdx) => {
                let textCol = "text-neutral-300";
                if (logStr.includes("[Hotswap")) textCol = "text-[#2BBFFF]";
                if (logStr.includes("[DB Execution]")) textCol = "text-emerald-400";
                if (logStr.includes("[Scenario Completed]")) textCol = "text-yellow-400 font-black animate-pulse bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/20";
                if (logStr.includes("⚠️")) textCol = "text-rose-400 font-semibold";

                return (
                  <div key={lIdx} className={`leading-normal border-b border-neutral-900/40 pb-2 last:border-b-0 ${textCol}`}>
                    <span className="text-[9px] text-neutral-600 block mb-0.5 select-none">
                      TIMESTAMP: {new Date().toLocaleTimeString().slice(0, 8)} UTC
                    </span>
                    {logStr}
                  </div>
                );
              })}

              {simulationLogs.length === 0 && (
                <div className="py-20 text-center text-neutral-600 italic">
                  No simulations run yet on this turn.<br />
                  Click "1. Match Interface" or "2. Auto-Write" on the left to fire mock live server transactions.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-900 flex justify-between items-center text-[9.5px]">
            <span className="text-neutral-500 font-bold">Registry Focus: {activeScenario.targetPatientId}</span>
            <button
              onClick={handleResetStep}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition cursor-pointer text-[9.5px] font-bold"
            >
              Reset Current Walkthrough
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
