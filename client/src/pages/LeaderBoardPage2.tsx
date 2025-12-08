import { X } from "lucide-react";
import { TabSelector } from "../components/leaderboard/tabSelector";
import { useState } from "react";
import { GeneralRanking } from "../components/leaderboard/generalRanking";
import { WeeklyRanking } from "../components/leaderboard/weeklyRanking";
import { LastWeekWinners } from "../components/leaderboard/lastWeekWinners";

export const LeaderBoardPage2 = () => {
  const [activeTab, setActiveTab] = useState<"general" | "weekly">("general");
  const [showLastWeek, setShowLastWeek] = useState(false);
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-4">
          <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {activeTab === "general" ? (
          <GeneralRanking />
        ) : (
          <WeeklyRanking onShowLastWeek={() => setShowLastWeek(true)} />
        )}
      </div>

      {/* Last Week Winners Bottom Sheet */}
      {showLastWeek && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLastWeek(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#12121a] rounded-t-3xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center py-3">
              <div className="w-12 h-1.5 bg-border rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 pb-4">
              <h2 className="text-lg font-bold text-[#f5f5f5]">Last Winners</h2>
              <button
                onClick={() => setShowLastWeek(false)}
                className="p-2 rounded-full bg-[#1a1a25] hover:bg-[#1a1a25]/80 transition-colors"
              >
                <X className="w-5 h-5 text-[#252530]-[#f5f5f5]" />
              </button>
            </div>

            <LastWeekWinners />
          </div>
        </div>
      )}
    </div>
  );
};
