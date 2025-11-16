import { motion } from "framer-motion";
import { BarChart3, Zap, Trophy, Target } from "lucide-react";
import { formatInteger } from "../../utils/formatNumber";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface UserStatsProps {
  stats: {
    miningLevel: number;
    totalStones: number;
    miningStreak: number;
    tasksCompleted: number;
  };
}

export const UserStats = ({ stats }: UserStatsProps) => {
  const statItems: Stat[] = [
    {
      label: "Mining Level",
      value: stats.miningLevel,
      icon: <Trophy className="w-5 h-5" />,
      color: "yellow",
    },
    {
      label: "Total Stones",
      value: formatInteger(stats.totalStones),
      icon: <BarChart3 className="w-5 h-5" />,
      color: "blue",
    },
    {
      label: "Mining Streak",
      value: `${stats.miningStreak} days`,
      icon: <Zap className="w-5 h-5" />,
      color: "orange",
    },
    {
      label: "Tasks Done",
      value: stats.tasksCompleted,
      icon: <Target className="w-5 h-5" />,
      color: "green",
    },
  ];

  const colorClasses = {
    yellow: {
      bg: "from-yellow-900/30 to-orange-900/30",
      border: "border-yellow-600/30",
      text: "text-yellow-400",
    },
    blue: {
      bg: "from-blue-900/30 to-cyan-900/30",
      border: "border-blue-600/30",
      text: "text-blue-400",
    },
    orange: {
      bg: "from-orange-900/30 to-red-900/30",
      border: "border-orange-600/30",
      text: "text-orange-400",
    },
    green: {
      bg: "from-green-900/30 to-emerald-900/30",
      border: "border-green-600/30",
      text: "text-green-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Your Statistics</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat, index) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-4`}
            >
              <div className={`mb-2 ${colors.text}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
