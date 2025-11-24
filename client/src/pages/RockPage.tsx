import { useState, useMemo, useCallback } from "react";
import { HiltiLevelThumbnails } from "../components/rock/HiltiLevelThumbnail";
import { HiltiDisplay } from "../components/rock/HiltiDisplay";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { HiltiUpgradeButton } from "../components/rock/HiltiUpgradeButton";
import { BoosterPage } from "../components/rock/BoosterPage";
import boosterAnimation from "../../public/animated-booster.json";
import Lottie from "lottie-react";
import { useGetBoostersMutation } from "../redux/services/booster/booster-api";
import { useUpgradeHiltiMutation } from "../redux/services/hilti/hilti-api";
import WebApp from "@twa-dev/sdk";

export const RockPage = () => {
  const [getBoosters] = useGetBoostersMutation();
  const [upgradeHilti, { isLoading: isUpgrading }] = useUpgradeHiltiMutation();

  // Select only needed fields to avoid re-renders from displayRocks updates
  const userId = useSelector((state: RootState) => state.user._id);
  const userProfitPerHour = useSelector(
    (state: RootState) => state.user.airdrop_data.profit_per_hour
  );
  const balanceData = useSelector(
    (state: RootState) => state.user.balance_data,
    shallowEqual
  );

  const hilti_data = useSelector(
    (state: RootState) => state.hilti,
    shallowEqual
  );
  const boosters = useSelector(
    (state: RootState) => state.booster,
    shallowEqual
  );

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
      await getBoosters({ user_id: userId }).unwrap();
    }
  }, [boosters.length, getBoosters, userId]);

  // Handle upgrade
  const handleUpgrade = useCallback(async () => {
    if (isUpgrading) return;

    try {
      await upgradeHilti({ user_id: userId }).unwrap();
      WebApp.showAlert("Hilti upgraded successfully! 🎉");
    } catch (error: any) {
      console.error("Error upgrading hilti:", error);
      const errorMessage =
        error?.data?.message || "Failed to upgrade hilti. Please try again.";
      WebApp.showAlert(errorMessage);
    }
  }, [isUpgrading, upgradeHilti, userId]);

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
            minLevel={currentUserHiltiLevel}
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
                <div className="relative w-10 h-10">
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
              userProfitPerHour={userProfitPerHour}
            />
          </div>

          {/* Hilti Upgrade Button */}
          <HiltiUpgradeButton
            selectedHilti={selectedHilti}
            selectedHiltiLevel={selectedHiltiLevel}
            currentUserHiltiLevel={currentUserHiltiLevel}
            userStoneBalance={balanceData.stone}
            userProfitPerHour={userProfitPerHour}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
          />
        </div>
      </div>
    </div>
  );
};
