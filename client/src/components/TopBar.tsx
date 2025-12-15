import { AnimatedNumber } from "./main/AnimatedNumber";

interface TopBarProps {
  stones: number;
  dust: number;
}

export const TopBar = ({ stones, dust }: TopBarProps) => {
  return (
    // ÖNEMLİ DEĞİŞİKLİK:
    // 'fixed' yerine 'sticky' kullandık.
    // 'sticky': Sayfada yer kaplar (alttaki içeriği ezmez) ama scroll yapınca tepede asılı kalır.
    // 'top-0': Tepeye yapışmasını sağlar.
    // 'z-50': Her zaman en üst katmanda görünür.
    <div className="sticky top-0 z-50 w-full h-16 flex items-center bg-gradient-to-b from-black via-slate-950 to-slate-900/90 backdrop-blur-md shadow-2xl border-b border-white/5">
      <div className="w-full px-4 flex justify-between items-center max-w-screen-lg mx-auto">
        {/* Sol taraf boşluk (İleride logo vs. gelirse buraya) */}
        <div className="flex-1" />

        {/* Kaynaklar Container (Yeni Şık Tasarım) */}
        <div className="flex items-center gap-3">
          {/* 1. Dust Bakiyesi */}
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full opacity-50 transition-opacity group-hover:opacity-75" />
            <div className="relative flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-amber-900/10">
              <img
                src="/dust.svg"
                alt="Dust"
                className="w-6 h-6 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              />
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] text-amber-500/80 font-bold tracking-wider uppercase">
                  Dust
                </span>
                <span className="text-amber-100 font-mono font-bold text-sm">
                  <AnimatedNumber value={dust} decimals={0} />
                </span>
              </div>
            </div>
          </div>

          {/* 2. Stone Bakiyesi */}
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full opacity-50 transition-opacity group-hover:opacity-75" />
            <div className="relative flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-900/10">
              <img
                src="/stone.svg"
                alt="Stone"
                className="w-6 h-6 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] brightness-110"
              />
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] text-cyan-500/80 font-bold tracking-wider uppercase">
                  Stone
                </span>
                <span className="text-cyan-100 font-mono font-bold text-sm">
                  <AnimatedNumber value={stones} decimals={0} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
