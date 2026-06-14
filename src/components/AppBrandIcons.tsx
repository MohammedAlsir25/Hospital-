import React from "react";

interface IconProps {
  className?: string;
  isDark?: boolean;
}

// 1. Al Jawarih Multi-Specialty Diamond Logo (Eye, Ear, Tooth) matching user attachment
export function MultiSpecialtyIcon({ className = "w-9 h-9" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Diamond - JH Logo Initials */}
      <path d="M50 6L72 28L50 50L28 28L50 6Z" fill="#0B1358" />
      <text x="50" y="32" fill="white" fontSize="13" fontWeight="bold" fontFamily="'Inter', system-ui, sans-serif" textAnchor="middle">JH</text>
      
      {/* Left Diamond - Eye (Ophthalmology) */}
      <path d="M28 28L50 50L28 72L6 50L28 28Z" fill="#44C4FF" />
      {/* Eye symbol outline drawing */}
      <path d="M14 50C14 50 18 45 23 45C28 45 32 50 32 50C32 50 28 55 23 55C18 55 14 50 14 50Z" stroke="#003554" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="50" r="3" fill="#003554" />

      {/* Right Diamond - Ear (Audiology & ENT Clinics) */}
      <path d="M72 28L94 50L72 72L50 50L72 28Z" fill="#E892FF" />
      {/* Ear icon drawing */}
      <path d="M67 43.5C70.5 40 76.5 42.5 76.5 46.5C76.5 49 73 51.5 73 53C73 54.5 75 55.5 75 57C75 59.5 69.5 60.5 67.5 56.5" stroke="#4A0E4E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Bottom Diamond - Tooth (Dental Clinics) */}
      <path d="M50 50L72 72L50 94L28 72L50 50Z" fill="#FF7E15" />
      {/* Clean Tooth vector shape */}
      <path d="M44 68C44 65.5 46 65.5 50 65.5C54 65.5 56 65.5 56 68C56 71.5 55 75 55 78C55 78.5 54.2 79 53 79C52 79 51.2 77.5 50 77.5C48.8 77.5 48 79 47 79C45.8 79 45 78.5 45 78C45 75 44 71.5 44 68Z" fill="#4B2300" />
    </svg>
  );
}

// 2. Minimalist Ophthalmic Iris & Lens Focus
export function OphthalmicIrisIcon({ className = "w-9 h-9" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" stroke="#4F46E5" strokeWidth="4.5" />
      <circle cx="50" cy="50" r="23" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="50" cy="50" r="11" fill="#0F172A" />
      <path d="M22 50C22 50 36 31 50 31C64 31 78 50 78 50C78 50 64 69 50 69C36 69 22 50 22 50Z" stroke="#4F46E5" strokeWidth="3" />
    </svg>
  );
}

// 3. Clinical Cross Lineage wireframe
export function ClinicalCrossIcon({ className = "w-9 h-9" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="36" y="10" width="28" height="80" rx="8" fill="#4F46E5" />
      <rect x="10" y="36" width="80" height="28" rx="8" fill="#4F46E5" />
      <circle cx="50" cy="50" r="16" fill="white" />
      <path d="M50 40V60M40 50H60" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// 4. Al Jawarih Crest (Premium Wellness Shield)
export function GoldCrestIcon({ className = "w-9 h-9" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8L88 28V64L50 90L12 64V28L50 8Z" stroke="#F59E0B" strokeWidth="5.5" strokeLinejoin="round" />
      <path d="M50 20L75 33V58L50 76L25 58V33L50 20Z" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="2.5" />
      <path d="M38 52C42 45 46 41 50 41C54 41 58 45 62 52" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="54" r="5" fill="#F59E0B" />
    </svg>
  );
}

export const APP_ICONS_REGISTRY = [
  {
    id: "multi-specialty",
    nameEn: "Al Jawarih Diamond Logo",
    nameAr: "شعار الجوارح الماسي الطبي",
    descriptionEn: "Multi-specialty diamond emblem featuring Eye, Ear, and Tooth clinical representations with the core initials 'JH'.",
    descriptionAr: "الشعار الماسي لربط تخصصات العيون، السمع والأنف والحنجرة، والأسنان مع الحروف الرئيسية للـ مستشفى.",
    render: (className?: string) => <MultiSpecialtyIcon className={className || "w-9 h-9"} />
  },
  {
    id: "ophthalmic-iris",
    nameEn: "Ophthalmic Iris Lens",
    nameAr: "عدسة وقزحية عيون متطورة",
    descriptionEn: "Precision iris diagrammatic ring ideal for eye specialty services.",
    descriptionAr: "قشرة دائرية متمحورة حول شبكية العين مثالية لعيادات العيون التخصصية الفائقة.",
    render: (className?: string) => <OphthalmicIrisIcon className={className || "w-9 h-9"} />
  },
  {
    id: "clinical-cross",
    nameEn: "Clinical Medical Cross",
    nameAr: "الصليب الطبي الكلاسيكي",
    descriptionEn: "Unified emergency and secure clinical operations cross layout.",
    descriptionAr: "شعار الصليب الموحد للتدخل السريع والفرز الآمن لخدمات الطوارئ الطبية.",
    render: (className?: string) => <ClinicalCrossIcon className={className || "w-9 h-9"} />
  },
  {
    id: "gold-crest",
    nameEn: "Al Jawarih Wellness Shield",
    nameAr: "درع وقاية الرفاه الذهبي",
    descriptionEn: "Gold-bound crest of visual excellence and high-end healthcare clinical security.",
    descriptionAr: "درع التميز البصري المطلي بالذهب ليدل على فخامة خدمات الضيافة وصحة العيون.",
    render: (className?: string) => <GoldCrestIcon className={className || "w-9 h-9"} />
  }
];
