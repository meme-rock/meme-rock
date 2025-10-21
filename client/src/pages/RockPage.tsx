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
import { RockCounter } from "../components/rock/RockCounter";

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
          {/* Rock Counter */}
          <RockCounter />

          {/* Level thumbnails */}
          <HiltiLevelThumbnails
            currentLevel={currentUserHiltiLevel}
            selectedLevel={selectedHiltiLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />

          {/* Hilti display */}
          <div className="mt-2">
            <HiltiDisplay
              selectedHilti={selectedHilti}
              currentUserHiltiLevel={currentUserHiltiLevel}
              userProfitPerHour={user.airdrop_data.profit_per_hour}
            />
          </div>

          {/* Booster button */}
          <button
            onClick={handleBoosterClick}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <div className="w-8 h-8">
              <Lottie animationData={boosterAnimation} loop={true} />
            </div>
            <span>Boosters</span>
          </button>

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
