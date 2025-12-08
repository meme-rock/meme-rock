import { motion } from "framer-motion";
import { User, Crown, Pickaxe, Gift, Trophy } from "lucide-react";
import { ITelegramData } from "../../types";

interface ProfileCardProps {
  telegramData: ITelegramData | null;
  isPremium: boolean;
  minerLevel: number;
  hiltiLevel: number;
  rewardDay: number;
  onOpenDailyReward: () => void;
  onOpenAchievements: () => void;
  onOpenPremium: () => void;
}

export const ProfileCard = ({
  telegramData,
  isPremium,
  minerLevel,
  hiltiLevel,
  rewardDay,
  onOpenDailyReward,
  onOpenAchievements,
  onOpenPremium,
}: ProfileCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 w-full max-w-lg mx-auto"
    >
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Dekoratif Arka Plan Işıkları */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* --- ÜST KISIM: Profil Özeti --- */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur opacity-40" />
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 flex items-center justify-center">
                {telegramData?.photo_url ? (
                  <img
                    src={telegramData.photo_url}
                    alt={telegramData.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-500" />
                )}
              </div>
              {/* Premium Tacı (Avatar Üstünde) */}
              {isPremium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-600 p-1 rounded-full border-2 border-slate-900 shadow-lg">
                  <Crown className="w-3 h-3 text-white fill-white" />
                </div>
              )}
            </div>

            {/* İsim & Etiket */}
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {telegramData?.username || "Explorer"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {isPremium && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded tracking-wide uppercase">
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level Rozetleri (Sağ Taraf) */}
          <div className="flex flex-col gap-1.5 items-end">
            {/* Miner Level */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-lg">
              <Pickaxe className="w-3 h-3 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-100">
                Lv.{minerLevel}
              </span>
            </div>
            {/* Hilti Level */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-lg">
              <img
                src="/jackhammer.svg"
                alt="Hilti"
                className="w-3 h-3 opacity-80"
              />
              <span className="text-xs font-mono text-purple-200">
                Lv.{hiltiLevel}
              </span>
            </div>
          </div>
        </div>

        {/* --- ALT KISIM: Grid Butonlar --- */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {/* 1. Daily Reward Button */}
          <button
            onClick={onOpenDailyReward}
            className="group relative overflow-hidden bg-slate-950/50 hover:bg-slate-900 border border-white/5 hover:border-amber-500/30 rounded-2xl p-3 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  Streak
                </span>
                <span className="text-sm font-bold text-white">
                  Day {rewardDay}
                </span>
              </div>
            </div>
            {/* Progress Bar (Alt Çizgi) */}
            <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${(rewardDay / 12) * 100}%` }} // Örnek 12 gün
              />
            </div>
          </button>

          {/* 2. Achievements Button */}
          <button
            onClick={onOpenAchievements}
            className="group relative overflow-hidden bg-slate-950/50 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  Achievements
                </span>
                <span className="text-sm font-bold text-white">View All</span>
              </div>
            </div>
          </button>

          {/* 3. Get Premium (Full Width - Eğer Premium Değilse) */}
          {!isPremium && (
            <button
              onClick={onOpenPremium}
              className="col-span-2 relative overflow-hidden bg-gradient-to-r from-amber-600/10 to-yellow-600/10 hover:from-amber-600/20 hover:to-yellow-600/20 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-center gap-2 group transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold text-amber-100">
                Upgrade to Premium
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
