import { useState } from "react";
import { HiltiLevelThumbnails } from "../components/rock/HiltiLevelThumbnail";
import { HiltiDisplay } from "../components/rock/HiltiDisplay";
import { EnergyDisplay } from "../components/rock/EnergyDisplay";
import { HiltiRequirements } from "../components/rock/HiltiRequirements";
import { BoostersList } from "../components/rock/BoostersList";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const RockPage = () => {
  const hilti_data = useSelector((state: RootState) => state.hilti);
  console.log("hilti: ", hilti_data);

  const currentLevel = Number(hilti_data.hilti._id.split("_")[1]);
  const [currentEnergy, setCurrentEnergy] = useState(hilti_data.current_energy);

  const maxEnergy = hilti_data.hilti.max_energy; // Her level için farklı max energy olabilir

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
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/50 active:scale-95"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentEnergy > 0 ? "⚡ Drill Rock" : "No Energy"}
          </button>

          {/* Boosters section */}
          <BoostersList currentLevel={currentLevel} />

          {/* Upgrade requirements */}
          <div className="w-full px-4">
            <HiltiRequirements
              requirements={hilti_data.hilti.upgrade_requirements}
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
