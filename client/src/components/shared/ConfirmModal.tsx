import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { memo } from "react";
import { formatInteger } from "../../utils/formatNumber"; // Format fonksiyonun varsa

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  amount: number;
  currency: "STONE" | "DUST" | "TON" | "STAR"; // Genişletilebilir
  isLoading?: boolean;
}

export const ConfirmModal = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Transaction",
    description = "Are you sure you want to proceed?",
    amount,
    currency,
    isLoading = false,
  }: ConfirmModalProps) => {
    // Currency'ye göre ikon ve renk belirleme
    const getCurrencyConfig = () => {
      switch (currency) {
        case "STONE":
          return { icon: "/stone.svg", color: "text-white", label: "Stone" };
        case "DUST":
          return { icon: "/dust.svg", color: "text-purple-300", label: "Dust" };
        case "TON":
          return { icon: "/ton.svg", color: "text-blue-400", label: "TON" };
        default:
          return {
            icon: "/star.svg",
            color: "text-yellow-400",
            label: "Stars",
          };
      }
    };

    const config = getCurrencyConfig();

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={isLoading ? undefined : onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-sm bg-[#1a1f2e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
              >
                {/* Close Button */}
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="p-6 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

                  <p className="text-gray-400 text-sm mb-6 px-4">
                    {description}
                  </p>

                  {/* Amount Card */}
                  <div className="w-full bg-black/20 rounded-xl p-4 mb-6 border border-white/5 flex items-center justify-center gap-3">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                      Cost:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${config.color}`}>
                        {formatInteger(amount)}
                      </span>
                      <img src={config.icon} className="w-6 h-6" alt="" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={onConfirm}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Confirm
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
