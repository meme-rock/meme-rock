import { Users } from "lucide-react";
import { lastWeekWinners } from "../../lib/mock-data";

function getMedalStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-br from-[#ffd700] to-[#b8860b] text-black";
    case 2:
      return "bg-gradient-to-br from-[#c0c0c0] to-[#808080] text-black";
    case 3:
      return "bg-gradient-to-br from-[#cd7f32] to-[#8b4513] text-white";
    default:
      return "bg-[#1a1a25] ";
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
    <div className="px-4 pb-8 max-h-[60vh] overflow-y-auto">
      <div className="space-y-2.5">
        {lastWeekWinners.map((user, index) => {
          const rank = index + 1;
          const prize = getPrize(rank);

          return (
            <div
              key={user.id}
              className={`bg-[#1a1a25]/50 border border-[#2a2a35] rounded-xl p-3 ${
                rank <= 3 ? "border-[#10b981]/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${getMedalStyle(
                    rank
                  )}`}
                >
                  {rank}
                </div>

                {/* Profile Picture */}
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#2a2a35] flex-shrink-0"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#f5f5f5] truncate text-sm">
                    {user.username}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">
                      {user.weeklyInvites}
                    </span>
                    <span className="text-xs text-[#252530]">invite</span>
                  </div>
                </div>

                {/* Prize Earned */}
                {prize && (
                  <div className="flex-shrink-0 flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <img src="./stone.svg" className="w-5 h-5" />
                      <span className="text-sm font-bold">
                        {prize.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
