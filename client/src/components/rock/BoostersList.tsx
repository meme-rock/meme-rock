import { useState } from "react";
import { Rocket, ChevronDown, ChevronUp } from "lucide-react";

interface BoostersListProps {
  currentLevel: number;
}

export const BoostersList = ({ currentLevel }: BoostersListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Bu veriler backend'den gelecek
  const mockBoosters = [
    {
      id: 1,
      title: "Energy Boost",
      unlockPrice: 1000,
      requiredLevel: 1,
    },
    {
      id: 2,
      title: "Speed Boost",
      unlockPrice: 2500,
      requiredLevel: 2,
    },
    {
      id: 3,
      title: "Power Boost",
      unlockPrice: 5000,
      requiredLevel: 3,
    },
    {
      id: 4,
      title: "Ultra Boost",
      unlockPrice: 10000,
      requiredLevel: 4,
    },
    {
      id: 5,
      title: "Mega Boost",
      unlockPrice: 25000,
      requiredLevel: 5,
    },
  ];

  const availableBoosters = mockBoosters.filter(
    (booster) => currentLevel >= booster.requiredLevel
  );

  return (
    <div className="mt-4 w-full px-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          <span>Boosters ({availableBoosters.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-4 shadow-lg space-y-3">
          {availableBoosters.length > 0 ? (
            availableBoosters.map((booster) => (
              <div
                key={booster.id}
                className="bg-black/40 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{booster.title}</h4>
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                    Level {booster.requiredLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Unlock Price</span>
                  <div className="flex items-center gap-1">
                    <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
                    <span className="text-cyan-400 font-semibold">
                      {booster.unlockPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">
                No boosters available yet. Upgrade your Hilti to unlock!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
