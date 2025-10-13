import { Battery } from "lucide-react";

interface EnergyDisplayProps {
  currentEnergy: number;
  maxEnergy: number;
}

export const EnergyDisplay = ({
  currentEnergy,
  maxEnergy,
}: EnergyDisplayProps) => {
  const energyPercentage = (currentEnergy / maxEnergy) * 100;

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold">Energy</span>
          </div>
          <span className="text-cyan-400 font-bold">
            {currentEnergy} / {maxEnergy}
          </span>
        </div>

        {/* Energy Bar */}
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${energyPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
