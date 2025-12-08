import { Crown, Pickaxe, User, Users } from "lucide-react";
import { formatInteger, formatNumber } from "../../utils/formatNumber";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export interface GeneralUser {
  _id: string;
  username: string;
  photoUrl?: string;
  rank: number;
  airdropCoins: number;
  profitPerHour: number;
  isPremium: boolean;
  minerLevel: number;
  hiltiLevel: number;
  inviteCount: number;
}

export interface GeneralUserCardProps {
  user: GeneralUser;
}

function getMedalColor(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-yellow-500/20";
    case 2:
      return "bg-gradient-to-br from-slate-300 to-slate-400 text-black shadow-slate-500/20";
    case 3:
      return "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-500/20";
    default:
      return "bg-slate-800 text-slate-400 border border-slate-700";
  }
}

export const CardGeneral = ({ user }: GeneralUserCardProps) => {
  const allHiltis = useSelector(
    (state: RootState) => state.hilti.all_hiltis,
    shallowEqual
  );

  const currentUserId = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );

  // Profit calculation logic preserved
  const calculatedProfit =
    user.profitPerHour +
    (allHiltis.find((hilti) => hilti._id === `LEVEL_${user.hiltiLevel}`)
      ?.profit_per_hour || 0);

  const isCurrentUser = user._id === currentUserId;

  return (
    <div
      key={user._id}
      className={`bg-slate-900/80 backdrop-blur-md border rounded-xl p-3 transition-all duration-200  ${
        isCurrentUser
          ? "border-green-500/50 bg-green-500/5"
          : "border-slate-800"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg ${getMedalColor(
            user.rank
          )}`}
        >
          {user.rank}
        </div>

        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <User className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          {/* Top 3 Crown Overlay */}
          {user.rank <= 3 && (
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${getMedalColor(
                user.rank
              )}`}
            >
              <Crown className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-100 truncate text-sm">
              {user.username}
            </h3>
            {user.isPremium && (
              <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {/* Miner Level */}
            <div className="flex items-center gap-1.5">
              <Pickaxe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-500">Miner</span>
              <span className="text-xs font-medium text-slate-300 ml-auto">
                Lv.{user.minerLevel}
              </span>
            </div>

            {/* Jackhammer Level */}
            <div className="flex items-center gap-1.5">
              <img
                src="/jackhammer.svg"
                alt="Hilti"
                className="w-3.5 h-3.5 opacity-80"
              />
              <span className="text-xs text-slate-500">Hilti</span>
              <span className="text-xs font-medium text-slate-300 ml-auto">
                Lv.{user.hiltiLevel}
              </span>
            </div>

            {/* Total Invites */}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-slate-500">Invites</span>
              <span className="text-xs font-medium text-slate-300 ml-auto">
                {formatInteger(user.inviteCount)}
              </span>
            </div>

            {/* Profit Per Hour */}
            <div className="flex items-center gap-1.5">
              <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
              <span className="text-xs text-slate-500">PPH</span>
              <span className="text-xs font-medium text-slate-300 ml-auto">
                {formatInteger(calculatedProfit)}
              </span>
            </div>
          </div>

          {/* Total ROCK - Footer Section */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60">
            <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
            <span className="text-xs text-slate-500">Total ROCK</span>
            <span className="text-sm font-bold text-slate-200 ml-auto">
              {formatNumber(user.airdropCoins, 2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
