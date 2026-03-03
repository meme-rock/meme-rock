import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { DrillEngine } from "./drillEngine";
import { DrillRewardPopup } from "./DrillRewardPopup";
import { DrillGameOverModal } from "./DrillGameOverModal";
import { DrillUpgradeMenu } from "./DrillUpgradeMenu";
import { loadDrillState, saveDrillState } from "./drillStorage";
import {
  DrillReward,
  DrillEngineConfig,
  DRILL_UPGRADES,
  ROCKS_PER_AD,
  MAX_ADS_PER_DAY,
  DAILY_ROCKS,
  getUpgradeCost,
} from "./drillTypes";
import { updateUserStones } from "../../../redux/slices/userSlice";
import { useAdsgram } from "../../../ad/hooks/useAdsgram";

interface RewardEntry {
  id: number;
  reward: DrillReward;
}

let rewardIdCounter = 0;

export const DrillGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DrillEngine | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const userStone = useSelector(
    (state: any) => state.user.balance_data?.stone ?? 0
  );

  // Drill state from localStorage
  const [drillState, setDrillState] = useState(() => loadDrillState());
  const drillStateRef = useRef(drillState);
  drillStateRef.current = drillState;

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [remainingRocks, setRemainingRocks] = useState(drillState.remainingRocks);
  const [drillCoins, setDrillCoins] = useState(drillState.drillCoins);
  const [rockHP, setRockHP] = useState({ hp: 80, maxHP: 80 });

  // Ad hook
  const adsgram = useAdsgram(import.meta.env.VITE_ADSGRAM_BLOCK_ID || "");
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Refs for callback closures
  const userStoneRef = useRef(userStone);
  userStoneRef.current = userStone;

  // Build engine config from upgrade levels
  const getEngineConfig = useCallback(
    (state: typeof drillState): DrillEngineConfig => {
      const drillPowerLevel = state.upgradeLevels["drill_power"] || 0;
      const rapidFireLevel = state.upgradeLevels["rapid_fire"] || 0;
      return {
        drillPower: 1 + drillPowerLevel,
        comboSpeed: rapidFireLevel * 0.5,
        totalRocksSmashed: state.totalRocksSmashed,
      };
    },
    []
  );

  // Show reward popup
  const showRewardPopup = useCallback((reward: DrillReward) => {
    const id = ++rewardIdCounter;
    setRewards((prev) => [...prev, { id, reward }]);
    setTimeout(() => {
      setRewards((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  }, []);

  // Handle rock smashed
  const handleRockSmashed = useCallback(
    (rockRewards: DrillReward[]) => {
      const state = drillStateRef.current;
      let newDrillCoins = state.drillCoins;
      let stoneEarned = 0;

      for (const reward of rockRewards) {
        if (reward.type === "drill_coin") {
          newDrillCoins += reward.amount;
          showRewardPopup(reward);
        } else if (reward.type === "stone") {
          stoneEarned += reward.amount;
          showRewardPopup(reward);
        } else if (reward.type === "rock_coin") {
          showRewardPopup(reward);
        }
      }

      // Update drill state
      const newState = {
        ...state,
        remainingRocks: state.remainingRocks - 1,
        drillCoins: newDrillCoins,
        totalRocksSmashed: state.totalRocksSmashed + 1,
      };
      setDrillState(newState);
      saveDrillState(newState);
      setRemainingRocks(newState.remainingRocks);
      setDrillCoins(newDrillCoins);

      // Dispatch stone to Redux
      if (stoneEarned > 0) {
        dispatch(
          updateUserStones({ stones: userStoneRef.current + stoneEarned })
        );
      }
    },
    [dispatch, showRewardPopup]
  );

  // Handle game over
  const handleGameOver = useCallback(() => {
    setShowGameOver(true);
  }, []);

  // Handle HP change
  const handleHPChange = useCallback((hp: number, maxHP: number) => {
    setRockHP({ hp, maxHP });
  }, []);

  // Initialize engine
  useEffect(() => {
    // Load Bungee font
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Bungee&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    if (!containerRef.current) return;

    const state = drillStateRef.current;
    const config = getEngineConfig(state);

    const engine = new DrillEngine(containerRef.current, {
      onRockSmashed: handleRockSmashed,
      onGameOver: handleGameOver,
      onHPChange: handleHPChange,
      onHideHint: () => setShowHint(false),
    }, config);

    engine.setRemainingRocks(state.remainingRocks);
    engine.setUpgradeLevels(
      state.upgradeLevels["stone_refinery"] || 0,
      state.upgradeLevels["mineral_scanner"] || 0
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
      document.head.removeChild(link);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch ad handler
  const handleWatchAd = useCallback(async () => {
    setIsAdLoading(true);
    try {
      const result = await adsgram.showAd();
      if (result.success) {
        const state = drillStateRef.current;
        const newState = {
          ...state,
          remainingRocks: state.remainingRocks + ROCKS_PER_AD,
          adsWatchedToday: state.adsWatchedToday + 1,
        };
        setDrillState(newState);
        saveDrillState(newState);
        setRemainingRocks(newState.remainingRocks);
        setShowGameOver(false);

        // Resume engine
        if (engineRef.current) {
          engineRef.current.setRemainingRocks(newState.remainingRocks);
          engineRef.current.resumeGame();
        }
      }
    } finally {
      setIsAdLoading(false);
    }
  }, [adsgram]);

  // Handle upgrade
  const handleUpgrade = useCallback(
    (upgradeId: string) => {
      const state = drillStateRef.current;
      const upgrade = DRILL_UPGRADES.find((u) => u.id === upgradeId);
      if (!upgrade) return;

      const currentLevel = state.upgradeLevels[upgradeId] || 0;
      const cost = getUpgradeCost(upgrade, currentLevel);
      if (state.drillCoins < cost) return;

      const newState = {
        ...state,
        drillCoins: state.drillCoins - cost,
        upgradeLevels: {
          ...state.upgradeLevels,
          [upgradeId]: currentLevel + 1,
        },
      };
      setDrillState(newState);
      saveDrillState(newState);
      setDrillCoins(newState.drillCoins);

      // Update engine config
      if (engineRef.current) {
        engineRef.current.updateConfig(getEngineConfig(newState));
        engineRef.current.setUpgradeLevels(
          newState.upgradeLevels["stone_refinery"] || 0,
          newState.upgradeLevels["mineral_scanner"] || 0
        );
      }
    },
    [getEngineConfig]
  );

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (engineRef.current) {
      const muted = engineRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  const handleBack = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      navigate("/mini-games");
    },
    [navigate]
  );

  const hpPct = rockHP.maxHP > 0 ? rockHP.hp / rockHP.maxHP : 0;

  return (
    <div className="relative w-full h-full">
      {/* UI Overlay - Top Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0) 100%)",
          pointerEvents: "none",
        }}
      >
        {/* Row 1: Back, DrillCoins, Remaining Rocks, Sound */}
        <div className="flex justify-between items-center px-3 pt-3 pb-1">
          {/* Back */}
          <button
            onClick={handleBack}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(30,42,70,0.85)",
              border: "2px solid #3a7bd5",
              boxShadow: "0 0 20px rgba(58,123,213,0.3)",
              pointerEvents: "auto",
            }}
          >
            <ArrowLeft className="w-5 h-5 text-[#8ab4f0]" />
          </button>

          {/* DrillCoins */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: "rgba(30,42,70,0.85)",
              border: "2px solid #3a7bd5",
              boxShadow: "0 0 20px rgba(58,123,213,0.3)",
              pointerEvents: "auto",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: "radial-gradient(circle at 35% 35%, #b0ff90, #60c040)",
                border: "2px solid #40a020",
                boxShadow: "0 0 8px rgba(100,220,60,0.5)",
                fontFamily: "Bungee, cursive",
                color: "#1a3010",
              }}
            >
              D
            </div>
            <span
              style={{
                fontFamily: "Bungee, cursive",
                fontSize: "18px",
                color: "#b0ff90",
                textShadow: "0 0 10px rgba(176,255,144,0.4)",
              }}
            >
              {drillCoins}
            </span>
          </div>

          {/* Remaining Rocks */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: "rgba(30,42,70,0.85)",
              border: "2px solid #5a8fcf",
              boxShadow: "0 0 20px rgba(90,143,207,0.3)",
              pointerEvents: "auto",
            }}
          >
            <span style={{ fontSize: "16px" }}>{"\u26CF"}</span>
            <span
              style={{
                fontFamily: "Bungee, cursive",
                fontSize: "16px",
                color: "#8ab4f0",
                textShadow: "0 0 10px rgba(138,180,240,0.3)",
              }}
            >
              {remainingRocks}/{DAILY_ROCKS + (drillState.adsWatchedToday * ROCKS_PER_AD)}
            </span>
          </div>

          {/* Sound */}
          <button
            onClick={toggleMute}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 cursor-pointer transition-all"
            style={{
              background: "rgba(30,42,70,0.85)",
              border: `2px solid ${isMuted ? "#555" : "#3a7bd5"}`,
              color: isMuted ? "#555" : "#8ab4f0",
              boxShadow: `0 0 20px ${isMuted ? "rgba(85,85,85,0.2)" : "rgba(58,123,213,0.3)"}`,
              pointerEvents: "auto",
            }}
          >
            {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
          </button>
        </div>

        {/* Row 2: HP bar */}
        <div className="px-4 pb-2">
          <div
            className="relative h-4 rounded-full overflow-hidden"
            style={{
              background: "rgba(26,32,44,0.8)",
              border: "1px solid #3a5a80",
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
              style={{
                width: `${Math.max(0, hpPct * 100)}%`,
                background:
                  hpPct > 0.5
                    ? "linear-gradient(90deg, #3a7bd5, #5a9bf5)"
                    : hpPct > 0.25
                    ? "linear-gradient(90deg, #f0a030, #f5c040)"
                    : "linear-gradient(90deg, #ff4444, #ff6666)",
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                fontFamily: "Bungee, cursive",
                fontSize: "10px",
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              HP: {Math.max(0, Math.ceil(rockHP.hp))}/{rockHP.maxHP}
            </div>
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Reward Popups */}
      <DrillRewardPopup rewards={rewards} />

      {/* Upgrade Button (bottom-right) */}
      {!showGameOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowUpgradeMenu(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="fixed bottom-6 right-4 z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90"
          style={{
            background: "linear-gradient(135deg, rgba(30,42,70,0.9) 0%, rgba(20,30,50,0.9) 100%)",
            border: "2px solid #3a7bd5",
            boxShadow: "0 0 25px rgba(58,123,213,0.4)",
          }}
        >
          {"\uD83D\uDD27"}
        </button>
      )}

      {/* Hint */}
      {showHint && !showGameOver && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10 text-sm pointer-events-none"
          style={{
            color: "rgba(138,180,240,0.6)",
            fontFamily: "Outfit, sans-serif",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          Tap or hold to drill the rock!
        </div>
      )}

      {/* Upgrade Menu */}
      <DrillUpgradeMenu
        isOpen={showUpgradeMenu}
        onClose={() => setShowUpgradeMenu(false)}
        drillCoins={drillCoins}
        upgradeLevels={drillState.upgradeLevels}
        onUpgrade={handleUpgrade}
      />

      {/* Game Over Modal */}
      {showGameOver && (
        <DrillGameOverModal
          adsWatchedToday={drillState.adsWatchedToday}
          onWatchAd={handleWatchAd}
          onBack={(e?: any) => {
            if (e) {
              e.stopPropagation?.();
              e.preventDefault?.();
            }
            navigate("/mini-games");
          }}
          isAdLoading={isAdLoading}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
