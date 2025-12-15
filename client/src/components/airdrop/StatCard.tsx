import { Users } from "lucide-react";
import { formatNumber } from "../../utils/formatNumber";

interface StatCardProps {
  icon: "USER" | "ROCK";
  label: string;
  value: number;
  iconColorClass: string; // İkon rengini özelleştirmek için
}

export const StatCard = ({
  icon,
  label,
  value,
  iconColorClass,
}: StatCardProps) => {
  return (
    <div className="relative overflow-hidden bg-cyan-900/10 border border-cyan-200/20 rounded-2xl p-5 group transition-all duration-300">
      {/* Hafif parlama efekti */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-cyan-400/10 blur-2xl" />

      <div className="relative z-10 flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-opacity-20 backdrop-blur-sm ${iconColorClass}`}
        >
          {icon === "USER" ? (
            <Users className="w-5 h-5 opacity-90" />
          ) : (
            <img src="/rock.svg" alt="Rock" className="w-8 h-8 opacity-90" />
          )}
        </div>
        <span className="text-cyan-100/70 text-sm font-medium tracking-wide">
          {label}
        </span>
      </div>
      <div className="relative z-10 text-4xl font-bold text-white tracking-tight pl-1">
        {formatNumber(value)}
      </div>
    </div>
  );
};
