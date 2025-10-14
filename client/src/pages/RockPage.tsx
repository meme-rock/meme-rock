import { useState } from "react";
import { HiltiLevelThumbnails } from "../components/rock/HiltiLevelThumbnail";
import { HiltiDisplay } from "../components/rock/HiltiDisplay";
import { EnergyDisplay } from "../components/rock/EnergyDisplay";
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
  console.log("boosters: ", boosters);
  const currentLevel = Number(hilti_data.hilti._id.split("_")[1]);
  const [currentEnergy, setCurrentEnergy] = useState(hilti_data.current_energy);
  const [showBoosterPage, setShowBoosterPage] = useState(false);

  const maxEnergy = hilti_data.hilti.max_energy; // Her level için farklı max energy olabilir

  const handleBoosterClick = async () => {
    setShowBoosterPage(true);
    if (boosters.length === 0) {
      console.log("boosters is empty, fetching boosters");
      await getBoosters({ user_id: user._id }).unwrap().then();
      console.log("boosters2: ", boosters);
    }
  };
  // Handle mine/drill action
  const handleDrill = () => {
    if (currentEnergy <= 0) return;

    // TODO: Backend'e drill isteği gönder
    setCurrentEnergy((prev) => Math.max(0, prev - 1));
    console.log("Drilling rock, current energy:", currentEnergy - 1);
  };

  // Handle upgrade
  const handleUpgrade = () => {
    // TODO: Backend'e upgrade isteği gönder
    console.log("Upgrading hilti to level", currentLevel + 1);
  };

  // TODO: Bu kontrol backend'den gelecek gerçek verilerle yapılacak
  const canUpgrade =
    Object.keys(hilti_data.hilti.upgrade_requirements || {}).length === 0;

  // If booster page is shown, render it instead
  if (showBoosterPage) {
    return (
      <BoosterPage
        currentHiltiLevel={currentLevel}
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
          <HiltiLevelThumbnails currentLevel={currentLevel} maxLevel={5} />

          {/* Hilti display */}
          <div className="mt-2">
            <HiltiDisplay
              level={currentLevel}
              rockIncome={hilti_data.hilti.rock_income}
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

          {/* Energy display */}
          <div className="mt-4 w-full">
            <EnergyDisplay
              currentEnergy={currentEnergy}
              maxEnergy={maxEnergy}
            />
          </div>

          {/* Drill button */}
          <button
            onClick={handleDrill}
            disabled={currentEnergy <= 0}
            className={`mt-4 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              currentEnergy > 0
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/50 active:scale-95"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentEnergy > 0 ? "⚡ Drill Rock" : "No Energy"}
          </button>

          {/* Upgrade requirements */}
          <div className="w-full px-4">
            <UpgradeRequirements
              inviteCount={7} // Kullanıcının yaptığı davet sayısı
              requiredInvites={2} // Gerekli davet sayısı
              dustSpent={999} // Harcanan dust
              requiredDust={3} // Gerekli dust
              stonesSpent={1000} // Harcanan stone
              requiredStones={3} // Gerekli stone
              nextLevel={currentLevel + 1}
              canUpgrade={canUpgrade}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
