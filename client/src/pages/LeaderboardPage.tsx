import { useState } from "react";
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
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  useGetLeaderboardQuery,
  useGetWeeklyInvitesLeaderboardQuery,
} from "../redux/services/ranks/ranks-api";
import { formatNumber, formatInteger } from "../utils/formatNumber";

type LeaderboardTab = "ranking" | "weekly";

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("ranking");
  const [showLastWeekWinners, setShowLastWeekWinners] = useState(false);
  const currentUserId = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );

  // Gerçek API'den veri çek
  const {
    data: leaderboardData,
    isLoading,
    isError,
    refetch,
  } = useGetLeaderboardQuery(currentUserId, {
    skip: !currentUserId, // currentUserId yoksa sorgu yapma
    refetchOnMountOrArgChange: true, // Her mount'ta fresh data
  });

  // Haftalık invite leaderboard'ı için API çağrısı
  const {
    data: weeklyInviteUsers,
    isLoading: isWeeklyLoading,
    isError: isWeeklyError,
    refetch: refetchWeekly,
  } = useGetWeeklyInvitesLeaderboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Calculate time until weekly reset (every Monday 08:00 UTC)
  const getTimeUntilReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(
      now.getUTCDate() + ((7 - now.getUTCDay() + 1) % 7 || 7)
    );
    nextMonday.setUTCHours(8, 0, 0, 0);

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
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Loading leaderboard...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-400 text-sm mb-4">
                  Failed to load leaderboard
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Your Rank Display (Always show at top) */}
            {!isLoading &&
              !isError &&
              leaderboardData &&
              leaderboardData.currentUserRank > 0 && (
                <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-5 mb-4 shadow-lg shadow-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-3">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">
                          Your Current Rank
                        </p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                          #{formatInteger(leaderboardData.currentUserRank)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Keep mining!</p>
                      <p className="text-xs text-purple-300 font-semibold">
                        Climb higher 🚀
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Leaderboard List */}
            {!isLoading &&
              !isError &&
              leaderboardData?.leaderboard.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-4 transition-all duration-300"
                  >
                    {/* Header: Rank, Avatar, Username, Premium */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank Badge */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRankColor(
                          user.rank
                        )} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                      >
                        <span className="text-lg">{getRankIcon(user.rank)}</span>
                      </div>

                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-400/50 bg-slate-800 flex-shrink-0">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">
                            <User className="w-7 h-7 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Username & Premium Badge */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate mb-1">
                          {user.username}
                        </h3>
                        {user.isPremium && (
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg px-2 py-1 w-fit">
                            <Crown className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-300">
                              Premium
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Row: Levels + Per Hour */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {/* Left side: Levels */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-400/30 rounded-lg px-2 py-1.5">
                          <Pickaxe className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-300 font-semibold">
                            Lv {user.minerLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-400/30 rounded-lg px-2 py-1.5">
                          <img
                            src="/jackhammer.svg"
                            alt="Hilti"
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-purple-300 font-semibold">
                            Lv {user.hiltiLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-400/30 rounded-lg px-2 py-1.5">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300 font-semibold">
                            {formatInteger(user.inviteCount)}
                          </span>
                        </div>
                      </div>

                      {/* Right side: Profit Per Hour (Small) */}
                      <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/40 border border-blue-700/40 rounded-lg px-3 py-2 min-w-[110px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src="/rock.svg" alt="Rock" className="w-3.5 h-3.5" />
                          <span className="text-[10px] text-blue-300/70 font-medium">
                            Per Hour
                          </span>
                        </div>
                        <p className="text-sm font-bold text-blue-200">
                          {formatInteger(user.profitPerHour)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Total Coins (Prominent) */}
                    <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/40 border border-blue-700/40 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="/rock.svg" alt="Rock" className="w-5 h-5" />
                        <span className="text-xs text-blue-300/80 font-medium">
                          Total Rock Coins
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-200">
                        {formatNumber(user.airdropCoins, 2)}
                      </p>
                    </div>
                  </div>
                );
              })}

            {/* Empty State */}
            {!isLoading &&
              !isError &&
              leaderboardData?.leaderboard.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Trophy className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 text-sm">
                    No players on the leaderboard yet
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Be the first to mine and claim the top spot!
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Weekly Invites Tab */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            {/* Header Section with Timer and Last Week Winners */}
            <div className="space-y-3">
              {/* Reset Timer - Enhanced Design */}
              <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-pink-900/40 backdrop-blur-xl border border-purple-400/40 rounded-2xl p-5 shadow-lg shadow-purple-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2.5 rounded-xl border border-purple-400/30">
                      <Clock className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-300/80 font-medium mb-0.5">
                        Competition Resets In
                      </p>
                      <p className="text-2xl font-black bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
                        {getTimeUntilReset()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-950/40 rounded-xl p-3 border border-purple-500/20">
                  <p className="text-xs text-purple-200/90 text-center font-medium">
                    📅 Resets every Monday at 08:00 UTC
                  </p>
                </div>
              </div>

              {/* Weekly Prizes - Enhanced Design */}
              <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-yellow-900/30 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-5 shadow-lg shadow-amber-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-400/30">
                      <Trophy className="w-5 h-5 text-amber-300" />
                    </div>
                    <h3 className="text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                      Weekly Prizes
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLastWeekWinners(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-200 border border-blue-400/30 shadow-md hover:shadow-lg"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Last Week</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
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
                        className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 text-center border border-amber-500/20 hover:border-amber-400/40 transition-all"
                      >
                        <div
                          className={`text-base font-black bg-gradient-to-br ${rankColor} bg-clip-text text-transparent mb-2`}
                        >
                          #{rank}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <img
                            src="/stone.svg"
                            alt="Stone"
                            className="w-4 h-4"
                          />
                          <span className="text-xs font-bold text-amber-300">
                            {formatInteger(prize)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isWeeklyLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-slate-400 text-sm">
                  Loading weekly leaderboard...
                </p>
              </div>
            )}

            {/* Error State */}
            {isWeeklyError && (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-400 text-sm mb-4">
                  Failed to load weekly leaderboard
                </p>
                <button
                  onClick={() => refetchWeekly()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Weekly Invite Users */}
            {!isWeeklyLoading && !isWeeklyError && weeklyInviteUsers && (
              <div className="space-y-3">
                {weeklyInviteUsers.map((user) => {
                  const isCurrentUser = user._id === currentUserId;
                  return (
                    <div
                      key={user._id}
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
                          <span className="text-base">{getRankIcon(user.rank)}</span>
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
                              {formatInteger(user.inviteCount)}
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
                                {formatInteger(getWeeklyPrize(user.rank))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isWeeklyLoading &&
              !isWeeklyError &&
              (!weeklyInviteUsers || weeklyInviteUsers.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Users className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 text-sm">
                    No invites this week yet
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Start inviting friends to climb the weekly leaderboard!
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Last Week Winners Modal */}
      {showLastWeekWinners && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowLastWeekWinners(false)}
        >
          <div
            className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-black border-t border-slate-700 rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-xl border-b border-amber-500/30 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-400/30">
                    <Crown className="w-6 h-6 text-amber-300" />
                  </div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                    Last Week Winners
                  </h2>
                </div>
                <button
                  onClick={() => setShowLastWeekWinners(false)}
                  className="bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-xl transition-colors border border-slate-600"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>
              <p className="text-xs text-amber-300/70">
                Top performers from previous competition
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Mock data - bu kısım backend'den gelecek */}
              {[
                {
                  rank: 1,
                  username: "Champion",
                  inviteCount: 156,
                  prize: 5000,
                  photoUrl: undefined,
                },
                {
                  rank: 2,
                  username: "Runner Up",
                  inviteCount: 124,
                  prize: 2500,
                  photoUrl: undefined,
                },
                {
                  rank: 3,
                  username: "ThirdPlace",
                  inviteCount: 98,
                  prize: 1250,
                  photoUrl: undefined,
                },
                {
                  rank: 4,
                  username: "TopInviter",
                  inviteCount: 76,
                  prize: 500,
                  photoUrl: undefined,
                },
                {
                  rank: 5,
                  username: "ReferralKing",
                  inviteCount: 65,
                  prize: 250,
                  photoUrl: undefined,
                },
              ].map((winner) => (
                <div
                  key={winner.rank}
                  className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(
                        winner.rank
                      )} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                    >
                      <span className="text-lg">#{winner.rank}</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/50 bg-slate-800 flex-shrink-0">
                      {winner.photoUrl ? (
                        <img
                          src={winner.photoUrl}
                          alt={winner.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-600">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate mb-1">
                        {winner.username}
                      </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{formatInteger(winner.inviteCount)} invites</span>
                          </div>
                    </div>

                    {/* Prize */}
                    <div className="flex items-center gap-1.5 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2">
                      <img
                        src="/stone.svg"
                        alt="Stone"
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-bold text-amber-300">
                        {formatInteger(winner.prize)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-4">
              <button
                onClick={() => setShowLastWeekWinners(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
