import { shallowEqual, useSelector } from "react-redux";
import { useGetLeaderboardQuery } from "../../redux/services/ranks/ranks-api";
import { RootState } from "../../redux/store";
import { CardGeneral } from "./CardGeneral";
import { formatInteger } from "../../utils/formatNumber";
import { Loader2 } from "lucide-react";

export const GeneralRanking = () => {
  const currentUserId = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );
  const {
    data: leaderboardData,
    isLoading,
    isError,
  } = useGetLeaderboardQuery(currentUserId, {
    skip: !currentUserId, // currentUserId yoksa sorgu yapma
    refetchOnMountOrArgChange: true, // Her mount'ta fresh data
  });
  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading leaderboard...</p>
        </div>
      )}
      {/* Current User Rank */}
      {!isLoading &&
        !isError &&
        leaderboardData &&
        leaderboardData.currentUserRank > 0 && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10b981]/50 to-[#10b981]/20 rounded-2xl blur-sm" />
            <div className="relative bg-[#12121a] border border-[#10b981]/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-[#10b981]">
                  Your Rank
                </span>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                  #{formatInteger(leaderboardData?.currentUserRank!)}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Leader Board*/}
      <div>
        <div className="space-y-2.5">
          {leaderboardData?.leaderboard.map((user) => (
            <CardGeneral user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};
