import { X, Flag, MapPin, Check } from "lucide-react";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoadmapMilestone {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  quarter: string;
}

const milestones: RoadmapMilestone[] = [
  {
    id: 1,
    title: "PRE SEASON",
    description: "Project Launch & Community Building",
    status: "current",
    quarter: "Q1 2025",
  },
  {
    id: 2,
    title: "ALPHA LAUNCH",
    description: "Mini App Release & First Users",
    status: "upcoming",
    quarter: "Q1 2025",
  },
  {
    id: 3,
    title: "BETA TEST",
    description: "Feature Testing & Improvements",
    status: "upcoming",
    quarter: "Q2 2025",
  },
  {
    id: 4,
    title: "V1.0 RELEASE",
    description: "Full Platform Launch",
    status: "upcoming",
    quarter: "Q3 2025",
  },
  {
    id: 5,
    title: "FUTURE GOAL",
    description: "Token Launch & Exchange Listing",
    status: "upcoming",
    quarter: "Q4 2025",
  },
];

export const RoadmapModal = ({ isOpen, onClose }: RoadmapModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-slate-900/60 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(8,145,178,0.2)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/50 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Flag className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cyan-50 leading-tight tracking-wide">
                Roadmap
              </h2>
              <p className="text-cyan-400/60 text-xs font-medium">
                Our journey to the summit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800/50 rounded-full flex items-center justify-center text-cyan-400/50 hover:text-cyan-50 hover:bg-cyan-900/50 transition-all border border-transparent hover:border-cyan-500/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roadmap Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0f172a] to-[#0B1120]">
          {/* Map-style Path */}
          <div className="relative">
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1;
              const isCompleted = milestone.status === "completed";
              const isCurrent = milestone.status === "current";

              return (
                <div key={milestone.id} className="relative flex gap-4 mb-0">
                  {/* Left Side - Icon and Path */}
                  <div className="flex flex-col items-center">
                    {/* Milestone Marker */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 relative z-10 transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" // COMPLETED: Green
                          : isCurrent
                          ? "bg-sky-600/20 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)]" // CURRENT: Ice Blue
                          : "bg-slate-900 border-slate-700" // UPCOMING: Dark Slate
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <MapPin className="w-5 h-5 text-sky-300 animate-bounce-slight" />
                      ) : isLast ? (
                        <Flag className="w-5 h-5 text-slate-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-slate-600" />
                      )}
                    </div>

                    {/* Dotted Path Line */}
                    {!isLast && (
                      <div className="w-0.5 h-16 flex flex-col items-center justify-between py-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              isCompleted
                                ? "bg-emerald-500/40 shadow-[0_0_5px_rgba(16,185,129,0.5)]" // Dots Green
                                : isCurrent
                                ? "bg-sky-500/20"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side - Content */}
                  <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                    <div
                      className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-950/20 border-emerald-500/30" // Card Green
                          : isCurrent
                          ? "bg-sky-900/20 border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.15)]"
                          : "bg-slate-900/40 border-slate-800"
                      }`}
                    >
                      {/* Quarter Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isCurrent
                            ? "bg-sky-500/20 text-sky-200 border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {milestone.quarter}
                      </span>

                      {/* Title */}
                      <h3
                        className={`text-base font-bold mt-2 tracking-wide ${
                          isCompleted
                            ? "text-emerald-100"
                            : isCurrent
                            ? "text-white drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]"
                            : "text-slate-500"
                        }`}
                      >
                        {milestone.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={`text-xs mt-1 font-medium ${
                          isCompleted
                            ? "text-emerald-400/60"
                            : isCurrent
                            ? "text-sky-200/70"
                            : "text-slate-600"
                        }`}
                      >
                        {milestone.description}
                      </p>

                      {/* Current Stage Indicator */}
                      {isCurrent && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                          </span>
                          <span className="text-[10px] text-sky-300 font-bold uppercase tracking-widest">
                            In Progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
