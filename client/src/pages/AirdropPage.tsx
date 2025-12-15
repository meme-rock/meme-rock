import { useState } from "react";
import { Map as MapIcon, ChevronRight } from "lucide-react";
import { RoadmapModal } from "../components/airdrop/RoadmapModal";
import { StatCard } from "../components/airdrop/StatCard";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const AirdropPage = () => {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const { total_mined, total_participants } = useSelector(
    (state: RootState) => state.stats
  );

  return (
    <>
      <div
        className="min-h-screen relative flex flex-col"
        style={{
          backgroundImage: "url('/airdrop-page-bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay - Arka planı biraz daha koyulaştırarak buz mavisi elementlerin parlamasını sağladık */}
        <div className="absolute inset-0 bg-[#0f172a]/60" />

        {/* Content Container */}
        {/* 'justify-center' yerine 'pt-32' (veya ihtiyaca göre pt-24) kullanarak yukarıdan sabit boşluk verdik */}
        <div className="relative z-10 flex-1 flex flex-col items-center pt-20 px-6 pb-8">
          <div className="w-full max-w-sm space-y-10">
            {/* 2. StatCard Bileşenlerinin Kullanımı */}
            <StatCard
              icon={"ROCK"}
              label="Total Mined"
              value={total_mined}
              iconColorClass="bg-blue-500/20 border-blue-400/30 text-blue-300"
            />

            <StatCard
              icon={"USER"}
              label="Total Participants"
              value={total_participants}
              iconColorClass="bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
            />

            {/* 3. Özelleştirilmiş Harita Butonu */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="w-full group relative overflow-hidden bg-[#2c3b4b]/80 border border-[#4a5b6b] rounded-2xl p-4 transition-all duration-300 shadow-lg active:scale-95"
            >
              {/* Arka plan deseni veya gradyanı (Harita hissi için) */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent opacity-0 transition-opacity duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center border border-[#334155] transition-colors">
                    <MapIcon className="w-6 h-6 text-cyan-200/80" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-cyan-50 font-semibold text-lg tracking-wide">
                      View Roadmap
                    </span>
                    <span className="text-cyan-200/50 text-xs uppercase tracking-wider font-medium">
                      Explore the Journey
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-cyan-500/50 transition-all" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />
    </>
  );
};
