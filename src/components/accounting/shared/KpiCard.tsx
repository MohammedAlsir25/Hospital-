import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  sublabel?: string;
}

const trendColors = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-rose-600 dark:text-rose-400",
  neutral: "text-neutral-400",
};

export default function KpiCard({ label, value, trend = "neutral", icon, sublabel }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-[#121520] border border-[#EAE6DF] dark:border-neutral-800 p-5 rounded-2xl shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] hover:border-[#4F46E5]/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
          {label}
        </span>
        {icon && <div className="text-[#4F46E5] dark:text-[#2BBFFF]">{icon}</div>}
      </div>
      <div className={`text-3xl font-extrabold text-[#0F172A] dark:text-white font-mono tracking-tight ${trendColors[trend]}`}>
        {value}
      </div>
      {sublabel && (
        <p className="text-[10px] text-neutral-400 mt-2 font-mono leading-relaxed">{sublabel}</p>
      )}
    </div>
  );
}
