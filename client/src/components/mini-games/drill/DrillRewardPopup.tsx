import { motion, AnimatePresence } from "framer-motion";
import { DrillReward } from "./drillTypes";

interface RewardEntry {
  id: number;
  reward: DrillReward;
}

interface DrillRewardPopupProps {
  rewards: RewardEntry[];
}

const rewardConfig: Record<DrillReward["type"], { label: string; color: string }> = {
  stone: { label: "Stone", color: "#ffe066" },
  rock_coin: { label: "Rock Coin", color: "#66ccff" },
  drill_coin: { label: "Drill Coin", color: "#b0ff90" },
};

export const DrillRewardPopup = ({ rewards }: DrillRewardPopupProps) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1">
      <AnimatePresence>
        {rewards.map((entry) => {
          const cfg = rewardConfig[entry.reward.type];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.6 }}
              transition={{ duration: 0.4 }}
              className="px-4 py-1.5 rounded-xl"
              style={{
                background: "rgba(10,14,26,0.85)",
                border: `2px solid ${cfg.color}`,
                boxShadow: `0 0 15px ${cfg.color}40`,
                fontFamily: "Bungee, cursive",
                fontSize: "18px",
                color: cfg.color,
                textShadow: `0 0 8px ${cfg.color}60`,
              }}
            >
              +{entry.reward.amount} {cfg.label}!
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
