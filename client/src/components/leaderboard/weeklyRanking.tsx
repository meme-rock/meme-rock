import { ChevronUp, Gift, Loader2, Trophy, Timer } from "lucide-react";
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
  { place: 4, amount: 500, color: "from-gray-900 to-gray-800" },
  { place: 5, amount: 250, color: "from-gray-900 to-gray-800" },
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
      <div className="relative overflow-hidden bg-[#1a1a25] border border-emerald-500/20 rounded-2xl p-5 shadow-lg group">
        {/* Arka plan efektleri (Ambient Light) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-70" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5">
          {/* Label ve İkon */}
          <div className="flex items-center gap-2 text-emerald-500/90 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
            <Timer className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Weekly Reset
            </span>
          </div>

          {/* Timer Text
             tabular-nums: Rakamların genişliğini eşitler (Titremeyi engeller)
             font-mono: Dijital saat hissi verir
          */}
          <p className="text-3xl sm:text-4xl font-black text-white tracking-widest tabular-nums font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] mt-1">
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Weekly Prizes */}
      <div className="bg-gradient-to-b from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        {/* Hafif arka plan parıltısı */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className="bg-purple-500/15 p-2 rounded-xl">
            <Gift className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Weekly Prizes
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-3 relative z-10">
          {prizes.map((prize) => (
            <div
              key={prize.place}
              className="flex flex-col items-center bg-white/5 border border-white/5 rounded-xl py-3 px-1 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center mb-2 shadow-lg ring-4 ring-[#181820]`}
              >
                <span className="text-xs font-extrabold text-white drop-shadow-sm">
                  {formatInteger(prize.place)}
                </span>
              </div>
              <img
                src="/stone.svg"
                alt="stone"
                className="w-8 h-8 drop-shadow-md mb-1"
              />
              <span className="text-[11px] font-bold text-gray-200">
                {formatInteger(prize.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Week Winners Button */}
      <button
        onClick={onShowLastWeek}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#1a1a25] hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-xl transition-all duration-300 group shadow-lg"
      >
        {/* Kupa ikonuna hafif bir altın parıltısı (glow) ve hover'da büyüme efekti ekledim */}
        <Trophy className="w-4 h-4 text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.4)] transition-transform group-hover:scale-110" />

        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
          Last Week Winners
        </span>

        {/* Ok işareti hover olunca yukarı hafifçe kayar ve parlar */}
        <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-300" />
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
