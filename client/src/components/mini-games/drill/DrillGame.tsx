import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { DrillEngine } from "./drillEngine";
import { DrillRewardPopup } from "./DrillRewardPopup";
import { DrillGameOverModal } from "./DrillGameOverModal";
import { DrillUpgradeMenu } from "./DrillUpgradeMenu";
import {
  DrillReward,
  getUpgradeCost,
} from "./drillTypes";
import { updateUserStones } from "../../../redux/slices/userSlice";
import { useAdsgram } from "../../../ad/hooks/useAdsgram";
import {
  useStartSessionMutation,
  useEndSessionMutation,
  useUpgradeMiniGameMutation,
  useClaimAdRewardMutation,
  useLazyGetMiniGameStateQuery,
} from "../../../redux/services/mini-game/mini-game-api";
import type {
  RockSequenceItem,
  MiniGameConfigFromAPI,
  UpgradeDefFromAPI,
} from "../../../redux/services/mini-game/responses";

interface RewardEntry {
  id: number;
  reward: DrillReward;
}

let rewardIdCounter = 0;

// Default config used while loading
const DEFAULT_CONFIG: MiniGameConfigFromAPI = {
  daily_plays: 20,
  max_ads_per_day: 5,
  plays_per_ad: 5,
  max_upgrade_level: 10,
  upgrades: [],
};

export const DrillGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DrillEngine | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const userId = useSelector((state: any) => state.user._id ?? "");
  const userStone = useSelector(
    (state: any) => state.user.balance_data?.stone ?? 0
  );

  // API hooks
  const [fetchState] = useLazyGetMiniGameStateQuery();
  const [startSession] = useStartSessionMutation();
  const [endSession] = useEndSessionMutation();
  const [upgradeMiniGame] = useUpgradeMiniGameMutation();
  const [claimAdReward] = useClaimAdRewardMutation();

  // Game state from API
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dailyPlaysLeft, setDailyPlaysLeft] = useState(0);
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [drillCoins, setDrillCoins] = useState(0);
  const [upgradeLevels, setUpgradeLevels] = useState<Record<string, number>>({});

  // Config from API
  const [config, setConfig] = useState<MiniGameConfigFromAPI>(DEFAULT_CONFIG);

  // Session state - stored in refs to avoid closure issues
  const sessionIdRef = useRef<string | null>(null);
  const rocksSmashed = useRef(0);
  const userStoneRef = useRef(userStone);
  userStoneRef.current = userStone;

  // Pending rock sequence: set by handlePlay, consumed by useEffect to create engine
  const [pendingSequence, setPendingSequence] = useState<RockSequenceItem[] | null>(null);
  const pendingConfigRef = useRef<{ drillPower: number; comboSpeed: number } | null>(null);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [rockHP, setRockHP] = useState({ hp: 80, maxHP: 80 });

  // Ad hook
  const adsgram = useAdsgram(import.meta.env.VITE_ADSGRAM_BLOCK_ID || "");
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Show reward popup
  const showRewardPopup = useCallback((reward: DrillReward) => {
    const id = ++rewardIdCounter;
    setRewards((prev) => [...prev, { id, reward }]);
    setTimeout(() => {
      setRewards((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  }, []);

  // Stable callback refs for engine (avoids stale closures)
  const showRewardPopupRef = useRef(showRewardPopup);
  showRewardPopupRef.current = showRewardPopup;

  const handleRockSmashedRef = useRef((_index: number, rockRewards: DrillReward[]) => {
    rocksSmashed.current++;
    // Update remaining rocks counter dynamically
    setDailyPlaysLeft((prev) => Math.max(0, prev - 1));
    // Update drill coins in real-time from rewards
    for (const reward of rockRewards) {
      showRewardPopupRef.current(reward);
      if (reward.type === "drill_coin") {
        setDrillCoins((prev) => prev + reward.amount);
      }
    }
  });

  const handleGameOverRef = useRef(async () => {
    setIsPlaying(false);
    const sid = sessionIdRef.current;

    if (sid && userId) {
      try {
        const result = await endSession({
          user_id: userId,
          game_type: "DRILL",
          rocksSmashed: rocksSmashed.current,
        }).unwrap();

        const ns = result.data.new_state;
        setDailyPlaysLeft(ns.daily_plays_left);
        setAdsWatchedToday(ns.ads_watched_today);
        setDrillCoins(ns.game_data.drill_coins);
        setUpgradeLevels(ns.game_data.upgrade_levels);

        if (result.data.rewards.stones > 0) {
          dispatch(
            updateUserStones({
              stones: userStoneRef.current + result.data.rewards.stones,
            })
          );
        }
      } catch (err) {
        console.error("Error ending session:", err);
      }
    }

    sessionIdRef.current = null;
    setShowGameOver(true);
  });
  // Keep ref updated with latest userId/endSession/dispatch
  useEffect(() => {
    handleGameOverRef.current = async () => {
      setIsPlaying(false);
      const sid = sessionIdRef.current;

      if (sid && userId) {
        try {
          const result = await endSession({
            user_id: userId,
            game_type: "DRILL",
            rocksSmashed: rocksSmashed.current,
          }).unwrap();

          const ns = result.data.new_state;
          setDailyPlaysLeft(ns.daily_plays_left);
          setAdsWatchedToday(ns.ads_watched_today);
          setDrillCoins(ns.game_data?.drill_coins ?? 0);
          setUpgradeLevels(ns.game_data?.upgrade_levels ?? {});

          if (result.data.rewards.stones > 0) {
            dispatch(
              updateUserStones({
                stones: userStoneRef.current + result.data.rewards.stones,
              })
            );
          }
        } catch (err) {
          console.error("Error ending session:", err);
        }
      }

      sessionIdRef.current = null;
      setShowGameOver(true);
    };
  }, [userId, endSession, dispatch]);

  // Load initial state from API
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadState = async () => {
      try {
        const result = await fetchState({
          user_id: userId,
          game_type: "DRILL",
        }).unwrap();

        const d = result.data;
        setDailyPlaysLeft(d.daily_plays_left);
        setAdsWatchedToday(d.ads_watched_today);
        setDrillCoins(d.game_data?.drill_coins ?? 0);
        setUpgradeLevels(d.game_data?.upgrade_levels ?? {});
        if (d.config) {
          setConfig(d.config);
        }
      } catch (err) {
        console.error("Error loading game state:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [userId, fetchState]);

  // Load Bungee font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Bungee&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Create engine AFTER container is in DOM (triggered by pendingSequence + isPlaying)
  useEffect(() => {
    if (!isPlaying || !pendingSequence || !containerRef.current) return;

    const engineConfig = pendingConfigRef.current || { drillPower: 1, comboSpeed: 0 };

    if (engineRef.current) {
      // Engine already exists (ad reward → new session), just update
      engineRef.current.updateConfig(engineConfig);
      engineRef.current.setRockSequence(pendingSequence);
      engineRef.current.resumeGame();
    } else {
      // Create new engine
      const engine = new DrillEngine(
        containerRef.current,
        {
          onRockSmashed: (index: number, rws: DrillReward[]) =>
            handleRockSmashedRef.current(index, rws),
          onGameOver: () => handleGameOverRef.current(),
          onHPChange: (hp: number, maxHP: number) => setRockHP({ hp, maxHP }),
          onHideHint: () => setShowHint(false),
        },
        engineConfig,
        pendingSequence
      );
      engineRef.current = engine;
    }

    setPendingSequence(null);
  }, [isPlaying, pendingSequence]);

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Start a new play session
  const handlePlay = useCallback(async () => {
    if (!userId || dailyPlaysLeft <= 0) return;

    try {
      const result = await startSession({
        user_id: userId,
        game_type: "DRILL",
      }).unwrap();

      const d = result.data;
      sessionIdRef.current = d.session_id;
      setDrillCoins(d.drill_coins ?? 0);
      setUpgradeLevels(d.upgrade_levels ?? {});
      rocksSmashed.current = 0;

      const drillPowerLevel = (d.upgrade_levels ?? {})["drill_power"] || 0;
      const rapidFireLevel = (d.upgrade_levels ?? {})["rapid_fire"] || 0;
      pendingConfigRef.current = {
        drillPower: 1 + drillPowerLevel,
        comboSpeed: rapidFireLevel * 0.5,
      };

      // Set state → triggers re-render → containerRef becomes available → useEffect creates engine
      setShowGameOver(false);
      setIsPlaying(true);
      setPendingSequence(d.rock_sequence);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  }, [userId, dailyPlaysLeft, startSession]);

  // Watch ad handler
  const handleWatchAd = useCallback(async () => {
    setIsAdLoading(true);
    try {
      const adResult = await adsgram.showAd();
      if (adResult.success && userId) {
        const result = await claimAdReward({
          user_id: userId,
          game_type: "DRILL",
        }).unwrap();

        setDailyPlaysLeft(result.data.daily_plays_left);
        setAdsWatchedToday(result.data.ads_watched_today);
        setShowGameOver(false);

        // Start new session (handlePlay will set isPlaying + pendingSequence)
        await handlePlay();
      }
    } catch (err) {
      console.error("Error claiming ad reward:", err);
    } finally {
      setIsAdLoading(false);
    }
  }, [adsgram, userId, claimAdReward, handlePlay]);

  // Handle upgrade via API
  const handleUpgrade = useCallback(
    async (upgradeId: string) => {
      if (!userId) return;

      const upgrade = config.upgrades.find((u) => u.id === upgradeId);
      if (!upgrade) return;

      const currentLevel = upgradeLevels[upgradeId] || 0;
      const cost = getUpgradeCost(upgrade.base_cost, upgrade.cost_multiplier, currentLevel);
      if (drillCoins < cost) return;

      try {
        const result = await upgradeMiniGame({
          user_id: userId,
          game_type: "DRILL",
          upgradeId,
        }).unwrap();

        setDrillCoins(result.data.new_drill_coins);
        setUpgradeLevels(result.data.upgrade_levels);

        if (engineRef.current) {
          const drillPowerLevel = result.data.upgrade_levels["drill_power"] || 0;
          const rapidFireLevel = result.data.upgrade_levels["rapid_fire"] || 0;
          engineRef.current.updateConfig({
            drillPower: 1 + drillPowerLevel,
            comboSpeed: rapidFireLevel * 0.5,
          });
        }
      } catch (err) {
        console.error("Error upgrading:", err);
      }
    },
    [userId, drillCoins, upgradeLevels, upgradeMiniGame, config.upgrades]
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
  const maxRocksToday = config.daily_plays + adsWatchedToday * config.plays_per_ad;

  // Loading state
  if (isLoading) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center"
        style={{ background: "#0a0e1a" }}
      >
        <div
          style={{
            fontFamily: "Bungee, cursive",
            fontSize: "18px",
            color: "#8ab4f0",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  // Pre-play state: show Play button
  if (!isPlaying && !showGameOver) {
    return (
      <div
        className="w-full min-h-screen flex flex-col items-center justify-center gap-6 relative"
        style={{ background: "#0a0e1a" }}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(30,42,70,0.85)",
            border: "2px solid #3a7bd5",
          }}
        >
          <ArrowLeft className="w-5 h-5 text-[#8ab4f0]" />
        </button>

        {/* Drill Coins */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{
            background: "rgba(30,42,70,0.85)",
            border: "2px solid #3a7bd5",
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{
              background: "radial-gradient(circle at 35% 35%, #b0ff90, #60c040)",
              border: "2px solid #40a020",
              fontFamily: "Bungee, cursive",
              color: "#1a3010",
            }}
          >
            D
          </div>
          <span
            style={{
              fontFamily: "Bungee, cursive",
              fontSize: "20px",
              color: "#b0ff90",
            }}
          >
            {drillCoins}
          </span>
        </div>

        {/* Remaining rocks info */}
        <div
          style={{
            fontFamily: "Bungee, cursive",
            fontSize: "14px",
            color: "#8ab4f0",
          }}
        >
          Rocks: {dailyPlaysLeft}/{maxRocksToday}
        </div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={dailyPlaysLeft <= 0}
          className="px-8 py-4 rounded-2xl text-lg transition-all active:scale-95"
          style={{
            fontFamily: "Bungee, cursive",
            background:
              dailyPlaysLeft > 0
                ? "linear-gradient(135deg, #3a7bd5, #5a9bf5)"
                : "rgba(30,42,70,0.5)",
            color: dailyPlaysLeft > 0 ? "#fff" : "#555",
            border: `2px solid ${dailyPlaysLeft > 0 ? "#5a9bf5" : "#333"}`,
            boxShadow:
              dailyPlaysLeft > 0
                ? "0 0 30px rgba(58,123,213,0.4)"
                : "none",
          }}
        >
          {dailyPlaysLeft > 0 ? "PLAY" : "No Rocks Left"}
        </button>

        {/* Upgrade button */}
        <button
          onClick={() => setShowUpgradeMenu(true)}
          className="px-6 py-3 rounded-xl transition-all active:scale-95"
          style={{
            fontFamily: "Bungee, cursive",
            fontSize: "14px",
            background: "rgba(30,42,70,0.85)",
            border: "2px solid #3a7bd5",
            color: "#8ab4f0",
          }}
        >
          Upgrades
        </button>

        {/* Upgrade Menu */}
        <DrillUpgradeMenu
          isOpen={showUpgradeMenu}
          onClose={() => setShowUpgradeMenu(false)}
          drillCoins={drillCoins}
          upgradeLevels={upgradeLevels}
          onUpgrade={handleUpgrade}
          upgrades={config.upgrades}
          maxUpgradeLevel={config.max_upgrade_level}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen" style={{ background: "#0a0e1a" }}>
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
              {dailyPlaysLeft}/{maxRocksToday}
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
      {!showGameOver && isPlaying && (
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
      {showHint && !showGameOver && isPlaying && (
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
        upgradeLevels={upgradeLevels}
        onUpgrade={handleUpgrade}
        upgrades={config.upgrades}
        maxUpgradeLevel={config.max_upgrade_level}
      />

      {/* Game Over Modal */}
      {showGameOver && (
        <DrillGameOverModal
          adsWatchedToday={adsWatchedToday}
          maxAdsPerDay={config.max_ads_per_day}
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
