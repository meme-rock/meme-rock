import { useState } from "react";
import { Rocket, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { IBooster } from "../../types";
import { EHiltiLevel } from "../../types/enums";

interface BoostersListProps {
  currentLevel: number;
}

export const BoostersList = ({ currentLevel }: BoostersListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Bu veriler backend'den gelecek
  const mockBoosters: IBooster[] = [
    {
      _id: "1",
      title: "Energy Boost",
      unlock_price: 1000,
      required_hilti_level: EHiltiLevel.LEVEL_1,
      boost_rate: 10,
      description: "Increases energy regeneration by 10%",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Speed Boost",
      unlock_price: 2500,
      required_hilti_level: EHiltiLevel.LEVEL_2,
      boost_rate: 15,
      description: "Increases mining speed by 15%",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Power Boost",
      unlock_price: 5000,
      required_hilti_level: EHiltiLevel.LEVEL_3,
      boost_rate: 20,
      description: "Increases rock income by 20%",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "4",
      title: "Ultra Boost",
      unlock_price: 10000,
      required_hilti_level: EHiltiLevel.LEVEL_4,
      boost_rate: 30,
      description: "Increases all stats by 30%",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "5",
      title: "Mega Boost",
      unlock_price: 25000,
      required_hilti_level: EHiltiLevel.LEVEL_5,
      boost_rate: 50,
      description: "Doubles your mining efficiency",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Filter boosters based on current hilti level
  const availableBoosters = mockBoosters.filter((booster) => {
    const requiredLevel = Number(booster.required_hilti_level.split("_")[1]);
    return currentLevel >= requiredLevel;
  });

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
                key={booster._id}
                className="bg-black/40 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <h4 className="text-white font-semibold">
                      {booster.title}
                    </h4>
                  </div>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded font-semibold">
                    +{booster.boost_rate}%
                  </span>
                </div>

                {booster.description && (
                  <p className="text-xs text-gray-400 mb-3">
                    {booster.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Unlock Price</span>
                  <div className="flex items-center gap-1">
                    <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
                    <span className="text-purple-400 font-semibold">
                      {booster.unlock_price.toLocaleString()}
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
