import { motion } from "framer-motion";
import { TrendingUp, Clock, Coins } from "lucide-react";

interface HourlyEarningsProps {
  hourlyRate: number;
  totalEarned24h: number;
}

export const HourlyEarnings = ({
  hourlyRate,
  totalEarned24h,
}: HourlyEarningsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {/* Main earnings card */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-2xl p-6 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400/70">
              Hourly Rate
            </h3>
          </div>
          <Coins className="w-6 h-6 text-yellow-400" />
        </div>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2"
          >
            {hourlyRate.toLocaleString()}
          </motion.div>
          <p className="text-sm text-gray-400">$ROCK per hour</p>
        </div>
      </div>

      {/* 24h earnings */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Last 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              +{totalEarned24h.toLocaleString()}
            </span>
            <span className="text-xs text-yellow-400">$ROCK</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
