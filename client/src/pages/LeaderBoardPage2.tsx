import { X } from "lucide-react";
import { TabSelector } from "../components/leaderboard/tabSelector";
import { useState } from "react";
import { GeneralRanking } from "../components/leaderboard/generalRanking";
import { WeeklyRanking } from "../components/leaderboard/weeklyRanking";
import { LastWeekWinners } from "../components/leaderboard/lastWeekWinners";
import { motion, AnimatePresence } from "framer-motion"; // 1. Framer Motion import edildi

export const LeaderBoardPage2 = () => {
  const [activeTab, setActiveTab] = useState<"general" | "weekly">("general");
  const [showLastWeek, setShowLastWeek] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-4">
          <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {activeTab === "general" ? (
          <GeneralRanking />
        ) : (
          <WeeklyRanking onShowLastWeek={() => setShowLastWeek(true)} />
        )}
      </div>

      {/* Last Week Winners Bottom Sheet - Animasyonlu Kapsayıcı */}
      <AnimatePresence>
        {showLastWeek && (
          <>
            {/* Backdrop (Arka plan karartma - Fade In/Out) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLastWeek(false)}
            />

            {/* Bottom Sheet (Panel - Slide Up/Down) */}
            <motion.div
              initial={{ y: "100%" }} // Başlangıç: Ekranın altında
              animate={{ y: 0 }} // Görünür: Yerine oturur
              exit={{ y: "100%" }} // Çıkış: Tekrar aşağı kayar
              transition={{ type: "spring", damping: 25, stiffness: 300 }} // Yaylanma efekti
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#12121a] rounded-t-3xl border-t border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              // Ekstra: Paneli aşağı kaydırarak kapatabilmek için drag özellikleri
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                // Eğer kullanıcı paneli aşağı doğru hızlıca çekerse kapat
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowLastWeek(false);
                }
              }}
            >
              {/* Tutamaç (Handle Bar) */}
              <div className="flex items-center justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-600/40 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 className="text-lg font-bold text-[#f5f5f5]">
                  Last Winners
                </h2>
                <button
                  onClick={() => setShowLastWeek(false)}
                  className="p-2 rounded-full bg-[#1a1a25] hover:bg-[#20202c] transition-colors border border-white/5"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* İçerik */}
              <div className="overflow-hidden rounded-t-xl">
                <LastWeekWinners />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
