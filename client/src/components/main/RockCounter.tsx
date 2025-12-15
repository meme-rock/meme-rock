import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { AnimatedNumber } from "./AnimatedNumber";
import { useMemo } from "react";
import { getResponsiveFontSize, formatNumber } from "../../utils/formatNumber";

export const RockCounter = () => {
  const displayRocks = useSelector(
    (state: RootState) => state.user.displayRocks
  );

  const user = useSelector((state: RootState) => state.user);
  const hilti_data = useSelector((state: RootState) => state.hilti);

  const fontSizeClass = useMemo(
    () => getResponsiveFontSize(displayRocks),
    [displayRocks]
  );

  const totalProfitPerHour = useMemo(() => {
    const userProfit = user.airdrop_data?.profit_per_hour || 0;
    const hiltiProfit =
      typeof hilti_data.current_hilti === "object" &&
      hilti_data.current_hilti !== null
        ? (hilti_data.current_hilti as any).profit_per_hour || 0
        : 0;
    return userProfit + hiltiProfit;
  }, [user.airdrop_data?.profit_per_hour, hilti_data.current_hilti]);

  return (
    <div className="relative w-full px-4 mt-4 mb-6 z-10">
      {/* 1. Arkadaki Sabit Işık (Ambient Glow) 
          Animasyonsuz, sadece derinlik katar. */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" />

      {/* 2. Ana Kart (Glass Effect) */}
      <div className="relative bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center py-6 px-4 relative">
          {/* Label: Total Balance */}
          <span className="text-[12px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-1">
            AIRDROP
          </span>
          <div className="flex items-center justify-center gap-3 relative z-10">
            {/* Rock Icon */}
            <div className="relative">
              {/* İkon Arkası Hafif Parlama */}
              <div className="absolute inset-0 rounded-full" />
              <img
                src="/rock.svg"
                alt="Rock"
                className="relative w-14 h-14 object-contain"
              />
            </div>

            {/* Sayı Değeri */}
            <div className="h-16 flex items-center">
              <AnimatedNumber
                value={displayRocks}
                decimals={2}
                className={`text-white ${fontSizeClass} font-black tracking-tighter whitespace-nowrap drop-shadow-md`}
              />
            </div>
          </div>

          {/* PROFIT KAPSÜLÜ (Alt Kısım) */}
          <div className="mt-3">
            <div className="flex items-center gap-3 bg-slate-950/40 border border-white/5 rounded-full pl-1.5 pr-4 py-1.5 shadow-inner">
              {/* Yeşil İkon Kutucuğu */}
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <img src="/rock.svg" alt="rock" className="w-6 h-6" />
              </div>

              {/* Profit Text */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Profit/h
                </span>
                <div className="w-[1px] h-3 bg-white/10" /> {/* Ayraç */}
                <span className="text-blue-400 font-bold text-sm font-mono tracking-wide">
                  +{formatNumber(totalProfitPerHour, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
