import { motion, AnimatePresence } from "framer-motion";
import {
  DRILL_UPGRADES,
  MAX_UPGRADE_LEVEL,
  getUpgradeCost,
} from "./drillTypes";

interface DrillUpgradeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  drillCoins: number;
  upgradeLevels: Record<string, number>;
  onUpgrade: (upgradeId: string) => void;
}

export const DrillUpgradeMenu = ({
  isOpen,
  onClose,
  drillCoins,
  upgradeLevels,
  onUpgrade,
}: DrillUpgradeMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1a2540 0%, #0e1525 100%)",
              border: "2px solid #3a7bd5",
              borderBottom: "none",
              boxShadow: "0 -10px 40px rgba(58,123,213,0.3)",
              maxHeight: "75vh",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[#3a5a80]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <span
                style={{
                  fontFamily: "Bungee, cursive",
                  fontSize: "20px",
                  color: "#8ab4f0",
                }}
              >
                Upgrades
              </span>
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{
                  background: "rgba(30,42,70,0.8)",
                  border: "1px solid #3a7bd5",
                }}
              >
                <span
                  style={{
                    fontFamily: "Bungee, cursive",
                    fontSize: "16px",
                    color: "#b0ff90",
                  }}
                >
                  {drillCoins}
                </span>
                <span style={{ fontSize: "14px" }}>DC</span>
              </div>
            </div>

            {/* Upgrade list */}
            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: "calc(75vh - 80px)" }}>
              <div className="flex flex-col gap-3">
                {DRILL_UPGRADES.map((upgrade) => {
                  const level = upgradeLevels[upgrade.id] || 0;
                  const isMaxed = level >= MAX_UPGRADE_LEVEL;
                  const cost = isMaxed ? 0 : getUpgradeCost(upgrade, level);
                  const canAfford = drillCoins >= cost;

                  return (
                    <div
                      key={upgrade.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(20,30,50,0.8)",
                        border: "1px solid #2a4060",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background: "rgba(58,123,213,0.15)",
                          border: "1px solid #3a7bd5",
                        }}
                      >
                        {upgrade.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="truncate"
                          style={{
                            fontFamily: "Bungee, cursive",
                            fontSize: "14px",
                            color: "#dde8f8",
                          }}
                        >
                          {upgrade.name}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#6a8aaa", fontFamily: "Outfit, sans-serif" }}
                        >
                          {upgrade.description}
                        </div>
                        {/* Level bar */}
                        <div className="flex gap-0.5 mt-1.5">
                          {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, i) => (
                            <div
                              key={i}
                              className="h-1.5 rounded-full flex-1"
                              style={{
                                background:
                                  i < level
                                    ? "#3a7bd5"
                                    : "rgba(58,123,213,0.15)",
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Upgrade button */}
                      <button
                        onClick={() => !isMaxed && canAfford && onUpgrade(upgrade.id)}
                        disabled={isMaxed || !canAfford}
                        className="shrink-0 px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-40"
                        style={{
                          background: isMaxed
                            ? "rgba(100,100,100,0.3)"
                            : canAfford
                            ? "linear-gradient(135deg, #3a7bd5 0%, #2a5aaa 100%)"
                            : "rgba(30,42,70,0.5)",
                          border: `1px solid ${
                            isMaxed ? "#555" : canAfford ? "#5a9bf5" : "#3a5a80"
                          }`,
                          fontFamily: "Bungee, cursive",
                          fontSize: "12px",
                          color: isMaxed ? "#888" : canAfford ? "#fff" : "#5a7a9f",
                        }}
                      >
                        {isMaxed ? "MAX" : cost}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
