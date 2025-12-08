import { ChevronUp, Gift, Loader2, Trophy } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";
import { getNextWeeklyResetTime } from "../../utils/timeUtils";
import { useMemo } from "react";
import { CardWeekly } from "./CardWeekly";
import { useGetWeeklyInvitesLeaderboardQuery } from "../../redux/services/ranks/ranks-api";
import { formatInteger } from "../../utils/formatNumber";

interface WeeklyRankingProps {
  onShowLastWeek: () => void;
}

const prizes = [
  { place: 1, amount: 5000, color: "from-[#ffd700] to-[#b8860b]" },
  { place: 2, amount: 2500, color: "from-[#c0c0c0] to-[#808080]" },
  { place: 3, amount: 1250, color: "from-[#cd7f32] to-[#8b4513]" },
  { place: 4, amount: 500, color: "from-[#a855f7] to-purple-700" },
  { place: 5, amount: 250, color: "from-[#a855f7] to-purple-700" },
];

export const WeeklyRanking = ({ onShowLastWeek }: WeeklyRankingProps) => {
  // Haftalık invite leaderboard'ı için API çağrısı
  const {
    data: weeklyInviteUsers,
    isLoading: isLoading,
    isError: isError,
  } = useGetWeeklyInvitesLeaderboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const nextResetTime = useMemo(() => getNextWeeklyResetTime(), []);
  const { formattedTime } = useCountdown(nextResetTime);
  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">
            Loading weekly leaderboard...
          </p>
        </div>
      )}
      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-slate-400 text-sm">
            Failed to load weekly leaderboard.
          </p>
        </div>
      )}
      {/* Countdown Timer */}
      <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/30 rounded-2xl p-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <p className="text-2xl font-black bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Weekly Prizes */}
      <div className="bg-[#12121a] border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-[#a855f7]" />
          <h2 className="text-base font-semibold text-[#f5f5f5]">
            Weekly Prizes
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {prizes.map((prize) => (
            <div key={prize.place} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center mb-1.5 shadow-lg`}
              >
                <span className="text-sm font-bold text-white">
                  {formatInteger(prize.place)}
                </span>
              </div>
              <img src="/stone.svg" alt="stone" className="w-7 h-7" />
              <span className="text-xs font-bold">
                {formatInteger(prize.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Week Winners Button */}
      <button
        onClick={onShowLastWeek}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a25] hover:bg-[#1a1a25]/80 border border-border rounded-xl transition-all duration-200 group"
      >
        <Trophy className="w-4 h-4 text-[#ffd700]" />
        <span className="text-sm font-medium text-[#f5f5f5]">
          Last Week Winners
        </span>
        <ChevronUp className="w-4 h-4 text-[#252530]-[#f5f5f5] group-hover:text-[#f5f5f5] transition-colors" />
      </button>

      {/* Top Weekly */}
      <div>
        <div className="space-y-2.5">
          {weeklyInviteUsers?.map((user) => {
            return <CardWeekly user={user} />;
          })}
        </div>
      </div>
    </div>
  );
};
