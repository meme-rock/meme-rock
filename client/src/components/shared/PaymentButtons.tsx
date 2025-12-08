import Lottie from "lottie-react";
import animatedStar from "../../../public/animated-star.json";
import animatedTon from "../../../public/animated-ton.json";
import { EBoosterUnlockCurrencyType } from "../../types/enums";

interface PaymentButtonsProps {
  starOption?: {
    type: EBoosterUnlockCurrencyType;
    amount: number;
  };
  tonOption?: {
    type: EBoosterUnlockCurrencyType;
    amount: number;
  };
  onStarClick: () => void;
  onTonClick: () => void;
  isStarLoading?: boolean;
  isTonLoading?: boolean;
  isProcessing?: boolean;
}

export const PaymentButtons = ({
  starOption,
  tonOption,
  onStarClick,
  onTonClick,
  isStarLoading = false,
  isTonLoading = false,
  isProcessing = false,
}: PaymentButtonsProps) => {
  if (!starOption && !tonOption) {
    return null;
  }

  // Herhangi bir işlem varsa butonları disable etmek için genel kontrol
  const isAnyActionInProgress = isStarLoading || isTonLoading || isProcessing;

  return (
    <div className="flex items-center gap-2">
      {/* STAR Payment Button */}
      {starOption && (
        <button
          onClick={onStarClick}
          // Herhangi bir işlem varsa tıklamayı engelle
          disabled={isAnyActionInProgress}
          className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 relative overflow-hidden group ${
            // Butonun sönükleşmesi için genel durumu (isAnyActionInProgress) kullanabiliriz
            // VEYA sadece kendi loading durumunda sönükleşsin isterseniz burayı isStarLoading yapabilirsiniz.
            // Genelde işlem varken diğer butonun da sönükleşmesi (disabled hissi) daha iyi bir UX sağlar.
            isAnyActionInProgress
              ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-amber-600"
              : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 active:scale-95"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

          {/* DÜZELTME BURADA: Görsel olarak dots göstermek için SADECE isStarLoading'e bakıyoruz */}
          {isStarLoading ? (
            <div className="relative z-10 flex items-center gap-2">
              {/* Pulsing Star Icon */}
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <div className="w-7 h-7 bg-yellow-400 rounded-full opacity-20"></div>
                </div>
              </div>
              {/* Animated Dots */}
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-7 h-7 relative z-10">
                <Lottie animationData={animatedStar} loop={true} />
              </div>
              <span className="relative z-10 text-lg font-bold">
                {starOption.amount}
              </span>
            </>
          )}
        </button>
      )}

      {/* OR Separator */}
      {tonOption && starOption && (
        <span className="text-gray-400 font-bold text-sm px-1">OR</span>
      )}

      {/* TON Payment Button */}
      {tonOption && (
        <button
          onClick={onTonClick}
          // Herhangi bir işlem varsa tıklamayı engelle
          disabled={isAnyActionInProgress}
          className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 relative overflow-hidden group ${
            isAnyActionInProgress
              ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-blue-600 to-blue-700"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

          {/* DÜZELTME BURADA: Görsel olarak dots göstermek için SADECE isTonLoading'e bakıyoruz */}
          {isTonLoading ? (
            <div className="relative z-10 flex items-center gap-2">
              {/* Pulsing TON Icon */}
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <div className="w-7 h-7 bg-blue-400 rounded-full opacity-20"></div>
                </div>
              </div>
              {/* Animated Dots */}
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-7 h-7 relative z-10">
                <Lottie animationData={animatedTon} loop={true} />
              </div>
              <span className="relative z-10 text-lg font-bold">
                {tonOption.amount}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
