import { motion } from "framer-motion";
import { Coins, TrendingUp, Calendar } from "lucide-react";

interface AirdropStatsProps {
  totalEarned: number;
  dailyEarnings: number;
  nextAirdrop?: Date;
}

export const AirdropStats = ({
  totalEarned,
  dailyEarnings,
  nextAirdrop,
}: AirdropStatsProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Airdrop Earnings</h3>
      </div>

      {/* Main stats */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-2xl p-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-yellow-400/70 mb-2">Total $ROCK Earned</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
          >
            {totalEarned.toLocaleString()}
          </motion.div>
          <p className="text-xs text-gray-400 mt-2">$ROCK Tokens</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily earnings */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <p className="text-xl font-bold text-white">
            +{dailyEarnings.toLocaleString()}
          </p>
        </div>

        {/* Next airdrop */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Next Drop</span>
          </div>
          <p className="text-xs font-semibold text-cyan-400">
            {nextAirdrop ? formatDate(nextAirdrop) : "TBA"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
