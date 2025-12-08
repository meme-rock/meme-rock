import { Users } from "lucide-react";
import { lastWeekWinners } from "../../lib/mock-data";

// Dereceye göre stil ve efektleri belirleyen yardımcı fonksiyon
function getRankStyles(rank: number) {
  switch (rank) {
    case 1:
      return {
        cardBg: "bg-yellow-500/10 hover:bg-yellow-500/15",
        border: "border-yellow-500/30",
        badge:
          "bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-yellow-500/50",
        text: "text-yellow-100",
        shadow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
        ring: "ring-yellow-500/30",
      };
    case 2:
      return {
        cardBg: "bg-slate-400/10 hover:bg-slate-400/15",
        border: "border-slate-400/30",
        badge:
          "bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/50",
        text: "text-slate-100",
        shadow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
        ring: "ring-slate-400/30",
      };
    case 3:
      return {
        cardBg: "bg-orange-700/10 hover:bg-orange-700/15",
        border: "border-orange-700/30",
        badge:
          "bg-gradient-to-br from-orange-300 to-orange-700 shadow-orange-600/50",
        text: "text-orange-100",
        shadow: "shadow-[0_0_15px_rgba(234,88,12,0.15)]",
        ring: "ring-orange-600/30",
      };
    default:
      return {
        cardBg: "bg-[#1a1a25]/60 hover:bg-[#1a1a25]",
        border: "border-white/5",
        badge: "bg-[#2a2a35] text-white/50",
        text: "text-gray-300",
        shadow: "",
        ring: "ring-white/5",
      };
  }
}

function getPrize(rank: number) {
  switch (rank) {
    case 1:
      return 5000;
    case 2:
      return 2500;
    case 3:
      return 1250;
    case 4:
      return 500;
    case 5:
      return 250;
    default:
      return null;
  }
}

export const LastWeekWinners = () => {
  return (
    // DÜZELTME: pb-24 ekleyerek en alttaki elemanın navbar altında kalmasını engelledik
    <div className="px-1 pb-24 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div className="space-y-3 pt-2">
        {lastWeekWinners.map((user, index) => {
          const rank = index + 1;
          const prize = getPrize(rank);
          const styles = getRankStyles(rank);
          const isTop3 = rank <= 3;

          return (
            <div
              key={user.id}
              className={`
                relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200
                ${styles.cardBg} ${styles.border} ${styles.shadow}
              `}
            >
              {/* Rank Badge (Sıra Numarası) */}
              <div
                className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center 
                  text-xs font-bold shadow-lg ${styles.badge} 
                  ${isTop3 ? "text-black" : "border border-white/10"}
                `}
              >
                #{rank}
              </div>

              {/* Avatar */}
              <div
                className={`relative rounded-full p-[2px] ${
                  isTop3 ? styles.badge : "bg-[#2a2a35]"
                }`}
              >
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover bg-[#12121a]"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate text-sm ${styles.text}`}>
                  {user.username}
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400">
                      {user.weeklyInvites}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                    Invites
                  </span>
                </div>
              </div>

              {/* Prize Earned */}
              {prize && (
                <div className="flex-shrink-0 flex flex-col items-end justify-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/stone.svg"
                      alt="Prize"
                      className="w-4 h-4 drop-shadow-md"
                    />
                    <span
                      className={`text-sm font-bold ${
                        isTop3 ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {prize.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
