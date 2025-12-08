import { Users } from "lucide-react";
import { formatInteger } from "../../utils/formatNumber";

export interface WeeklyUser {
  _id: string;
  username: string;
  photoUrl?: string;
  rank: number;
  inviteCount: number;
}

interface WeeklyUserCardProps {
  user: WeeklyUser;
}

function getMedalStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-br from-[#ffd700] to-[#b8860b] text-black shadow-lg shadow-[#ffd700]/20";
    case 2:
      return "bg-gradient-to-br from-[#c0c0c0] to-[#808080] text-black shadow-lg shadow-[#c0c0c0]/20";
    case 3:
      return "bg-gradient-to-br from-[#cd7f32] to-[#8b4513] text-white shadow-lg shadow-[#cd7f32]/20";
    default:
      return "bg-[#1a1a25] text-[#252530]-[#f5f5f5]";
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

export const CardWeekly = ({ user }: WeeklyUserCardProps) => {
  const prize = getPrize(user.rank);
  return (
    <div
      className={`bg-[#12121a] border border-border rounded-xl p-3 transition-all duration-200 ${
        user.rank <= 3 ? "border-[#10b981]/20" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank Badge */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${getMedalStyle(
            user.rank
          )}`}
        >
          {user.rank}
        </div>

        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photoUrl || "/placeholder.svg"}
            alt={user.username}
            className="w-11 h-11 rounded-full object-cover border-2 border-border"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#f5f5f5] truncate text-sm">
            {user.username}
          </h3>

          <div className="flex items-center gap-1.5 mt-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">
              {user.inviteCount}
            </span>
          </div>
        </div>

        {/* Prize Badge */}
        {prize && (
          <div className="flex-shrink-0 flex flex-col items-end">
            <span className="text-sm font-bold text-white">
              {formatInteger(prize)}
            </span>
            <img src="/stone.svg" alt="stone" className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
