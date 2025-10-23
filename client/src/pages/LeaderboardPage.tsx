import { useState, useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import {
  Trophy,
  TrendingUp,
  Users,
  Clock,
  Pickaxe,
  User,
  Crown,
} from "lucide-react";

type LeaderboardTab = "ranking" | "weekly";

interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  photoUrl?: string;
  minerLevel: number;
  hiltiLevel: number;
  profitPerHour: number;
  totalCoins: number;
  isPremium: boolean;
}

interface WeeklyInviteUser {
  rank: number;
  userId: string;
  username: string;
  photoUrl?: string;
  weeklyInvites: number;
  isPremium: boolean;
}

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("ranking");
  const currentUserId = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );

  // Mock data - Backend'den gelecek
  const leaderboardUsers: LeaderboardUser[] = useMemo(
    () => [
      {
        rank: 1,
        userId: "123456",
        username: "CryptoKing",
        photoUrl: undefined,
        minerLevel: 5,
        hiltiLevel: 5,
        profitPerHour: 15000,
        totalCoins: 1250000,
        isPremium: true,
      },
      {
        rank: 2,
        userId: "789012",
        username: "MoonMiner",
        photoUrl: undefined,
        minerLevel: 5,
        hiltiLevel: 4,
        profitPerHour: 12500,
        totalCoins: 980000,
        isPremium: true,
      },
      {
        rank: 3,
        userId: "345678",
        username: "DiamondHands",
        photoUrl: undefined,
        minerLevel: 4,
        hiltiLevel: 5,
        profitPerHour: 11000,
        totalCoins: 875000,
        isPremium: false,
      },
      // Add more mock users
      ...Array.from({ length: 7 }, (_, i) => ({
        rank: i + 4,
        userId: `user_${i + 4}`,
        username: `Player${i + 4}`,
        photoUrl: undefined,
        minerLevel: 3 - Math.floor(i / 3),
        hiltiLevel: 3 - Math.floor(i / 3),
        profitPerHour: 8000 - i * 500,
        totalCoins: 500000 - i * 50000,
        isPremium: false,
      })),
    ],
    []
  );

  const weeklyInviteUsers: WeeklyInviteUser[] = useMemo(
    () => [
      {
        rank: 1,
        userId: "user1",
        username: "InviteChamp",
        photoUrl: undefined,
        weeklyInvites: 145,
        isPremium: true,
      },
      {
        rank: 2,
        userId: "user2",
        username: "Referrer Pro",
        photoUrl: undefined,
        weeklyInvites: 98,
        isPremium: true,
      },
      {
        rank: 3,
        userId: "user3",
        username: "ShareMaster",
        photoUrl: undefined,
        weeklyInvites: 76,
        isPremium: false,
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        rank: i + 4,
        userId: `invite_user_${i + 4}`,
        username: `Inviter${i + 4}`,
        photoUrl: undefined,
        weeklyInvites: 50 - i * 5,
        isPremium: false,
      })),
    ],
    []
  );

  // Calculate time until weekly reset (every Monday 00:00 UTC)
  const getTimeUntilReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(
      now.getUTCDate() + ((7 - now.getUTCDay() + 1) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);

    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-orange-500";
      case 2:
        return "from-slate-300 to-slate-400";
      case 3:
        return "from-amber-600 to-amber-700";
      default:
        return "from-slate-600 to-slate-700";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getWeeklyPrize = (rank: number): number => {
    const prizes: { [key: number]: number } = {
      1: 5000,
      2: 2500,
      3: 1250,
      4: 500,
      5: 250,
    };
    return prizes[rank] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Compete with players worldwide
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("ranking")}
              className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "ranking"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Rankings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === "weekly"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Weekly Invites</span>
              </div>
            </button>
          </div>
        </div>

        {/* Rankings Tab */}
        {activeTab === "ranking" && (
          <div className="space-y-3">
            {leaderboardUsers.map((user) => {
              const isCurrentUser = user.userId === currentUserId;
              return (
                <div
                  key={user.userId}
                  className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 ${
                    isCurrentUser
                      ? "border-purple-500/50 ring-2 ring-purple-500/30"
                      : "border-slate-700/50 hover:border-slate-600/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(
                        user.rank
                      )} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                    >
                      {user.rank <= 3 ? (
                        <span className="text-2xl">
                          {getRankIcon(user.rank)}
                        </span>
                      ) : (
                        <span className="text-lg">#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-400/50 bg-slate-800">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      {user.isPremium && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-0.5">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">
                          {user.username}
                        </h3>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Levels */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-400/30 rounded px-1.5 py-0.5">
                          <Pickaxe className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-blue-300">
                            Lv {user.minerLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-400/30 rounded px-1.5 py-0.5">
                          <img
                            src="/jackhammer.svg"
                            alt="Hilti"
                            className="w-3 h-3"
                          />
                          <span className="text-[10px] text-purple-300">
                            Lv {user.hiltiLevel}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Per Hour: </span>
                          <span className="text-cyan-400 font-bold">
                            {user.profitPerHour.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Total: </span>
                          <span className="text-amber-400 font-bold">
                            {user.totalCoins.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly Invites Tab */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            {/* Reset Timer */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-200 font-medium">
                    Resets In:
                  </span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {getTimeUntilReset()}
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mb-3">
                Weekly leaderboard resets every Monday at 00:00 UTC
              </p>

              {/* Prizes */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-purple-200 font-semibold mb-2 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Weekly Prizes
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((rank) => {
                    const prize = getWeeklyPrize(rank);
                    const rankColor =
                      rank === 1
                        ? "from-yellow-400 to-orange-500"
                        : rank === 2
                        ? "from-slate-300 to-slate-400"
                        : rank === 3
                        ? "from-amber-600 to-amber-700"
                        : "from-slate-600 to-slate-700";

                    return (
                      <div
                        key={rank}
                        className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50"
                      >
                        <div
                          className={`text-lg font-bold bg-gradient-to-br ${rankColor} bg-clip-text text-transparent mb-0.5`}
                        >
                          {getRankIcon(rank)}
                        </div>
                        <div className="flex items-center justify-center gap-0.5">
                          <img
                            src="/stone.svg"
                            alt="Stone"
                            className="w-3 h-3"
                          />
                          <span className="text-[10px] font-bold text-amber-400">
                            {prize}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly Invite Users */}
            <div className="space-y-3">
              {weeklyInviteUsers.map((user) => {
                const isCurrentUser = user.userId === currentUserId;
                return (
                  <div
                    key={user.userId}
                    className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 ${
                      isCurrentUser
                        ? "border-purple-500/50 ring-2 ring-purple-500/30"
                        : "border-slate-700/50 hover:border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(
                          user.rank
                        )} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                      >
                        {user.rank <= 3 ? (
                          <span className="text-2xl">
                            {getRankIcon(user.rank)}
                          </span>
                        ) : (
                          <span className="text-lg">#{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-400/50 bg-slate-800">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        {user.isPremium && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-0.5">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white truncate">
                            {user.username}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </div>

                        {/* Weekly Invites */}
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-slate-400">
                            This Week:
                          </span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                            {user.weeklyInvites}
                          </span>
                          <span className="text-sm text-slate-500">
                            invites
                          </span>
                        </div>

                        {/* Prize */}
                        {getWeeklyPrize(user.rank) > 0 && (
                          <div className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-500/30 rounded-lg px-2 py-1 w-fit">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span className="text-xs text-slate-400">
                              Prize:
                            </span>
                            <img
                              src="/stone.svg"
                              alt="Stone"
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-sm font-bold text-amber-400">
                              {getWeeklyPrize(user.rank)}
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
        )}
      </div>
    </div>
  );
};
