import { useState, useMemo, useCallback } from "react";
import { HiltiLevelThumbnails } from "../components/rock/HiltiLevelThumbnail";
import { HiltiDisplay } from "../components/rock/HiltiDisplay";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { UpgradeRequirements } from "../components/rock/UpgradeRequirements";
import { BoosterPage } from "../components/rock/BoosterPage";
import boosterAnimation from "../../public/animated-booster.json";
import Lottie from "lottie-react";
import { useGetBoostersMutation } from "../redux/services/booster/booster-api";

export const RockPage = () => {
  const [getBoosters] = useGetBoostersMutation();
  const user = useSelector((state: RootState) => state.user);
  const hilti_data = useSelector((state: RootState) => state.hilti);
  const boosters = useSelector((state: RootState) => state.booster);

  // Current user's hilti level
  const currentUserHiltiLevel = useMemo(
    () => parseInt(hilti_data.current_hilti._id.split("_")[1]),
    [hilti_data.current_hilti._id]
  );

  // Selected hilti state (for browsing)
  const [selectedHiltiLevel, setSelectedHiltiLevel] = useState(
    currentUserHiltiLevel
  );

  // Get selected hilti from all_hiltis
  const selectedHilti = useMemo(
    () =>
      hilti_data.all_hiltis.find(
        (h) => h._id === `LEVEL_${selectedHiltiLevel}`
      ) || hilti_data.current_hilti,
    [selectedHiltiLevel, hilti_data.all_hiltis, hilti_data.current_hilti]
  );

  const [showBoosterPage, setShowBoosterPage] = useState(false);

  // Handle level selection
  const handleLevelSelect = useCallback((level: number) => {
    setSelectedHiltiLevel(level);
  }, []);

  const handleBoosterClick = useCallback(async () => {
    setShowBoosterPage(true);
    if (boosters.length === 0) {
      await getBoosters({ user_id: user._id }).unwrap();
    }
  }, [boosters.length, getBoosters, user._id]);

  // Handle upgrade
  const handleUpgrade = useCallback(() => {
    // TODO: Backend'e upgrade isteği gönder
    console.log("Upgrading hilti to level", currentUserHiltiLevel + 1);
  }, [currentUserHiltiLevel]);

  // Check if can upgrade
  const canUpgrade = useMemo(
    () =>
      Object.keys(hilti_data.current_hilti.upgrade_requirements || {})
        .length === 0,
    [hilti_data.current_hilti.upgrade_requirements]
  );

  // If booster page is shown, render it instead
  if (showBoosterPage) {
    return (
      <BoosterPage
        currentHiltiLevel={currentUserHiltiLevel}
        onClose={() => setShowBoosterPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-1">
        {/* Main content */}
        <div className="flex flex-col items-center justify-start pt-2">
          {/* Level thumbnails */}
          <HiltiLevelThumbnails
            currentLevel={currentUserHiltiLevel}
            selectedLevel={selectedHiltiLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />

          {/* Booster button - Prominent position */}
          <div className="w-full px-4 mt-6 mb-4">
            <button
              onClick={handleBoosterClick}
              className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl px-6 py-4 flex items-center justify-center gap-3 group-hover:bg-gradient-to-br group-hover:from-gray-800 group-hover:to-gray-900 transition-all duration-300">
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 group-hover:via-cyan-500/30 blur-xl transition-all duration-300" />

                {/* Lottie animation */}
                <div className="relative w-10 h-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                  <Lottie animationData={boosterAnimation} loop={true} />
                </div>

                {/* Text */}
                <span className="relative text-xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent group-hover:from-cyan-100 group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-300">
                  Boosters
                </span>

                {/* Arrow icon */}
                <svg
                  className="relative w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Hilti display */}
          <div className="mt-2">
            <HiltiDisplay
              selectedHilti={selectedHilti}
              currentUserHiltiLevel={currentUserHiltiLevel}
              userProfitPerHour={user.airdrop_data.profit_per_hour}
            />
          </div>

          {/* Upgrade requirements - Only show for current level */}
          {selectedHiltiLevel === currentUserHiltiLevel && (
            <div className="w-full px-4">
              <UpgradeRequirements
                inviteCount={user.invite_count}
                requiredInvites={
                  hilti_data.current_hilti.upgrade_requirements?.invites || 0
                }
                dustSpent={user.balance_data.dust}
                requiredDust={
                  hilti_data.current_hilti.upgrade_requirements?.spent_dust || 0
                }
                stonesSpent={user.balance_data.stone}
                requiredStones={
                  hilti_data.current_hilti.upgrade_requirements?.spent_stones ||
                  0
                }
                nextLevel={currentUserHiltiLevel + 1}
                canUpgrade={canUpgrade}
                onUpgrade={handleUpgrade}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
