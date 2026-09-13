import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle } from "lucide-react";
import { formatInteger } from "../../utils/formatNumber";

interface BoosterConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  type: "unlock" | "upgrade";
  boosterTitle: string;
  currentLevel?: number;
  nextLevel?: number;
  cost: {
    amount: number;
    currency: "stone" | "dust" | "rock";
  };
  requirements?: {
    stone?: number;
    dust?: number;
    invite?: number;
  };
  userBalance?: {
    stone: number;
    dust: number;
  };
  profitIncrease?: {
    current: number;
    next: number;
  };
}

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
    case "stone":
      return "/stone.svg";
    case "dust":
      return "/dust.svg";
    case "rock":
      return "/rock.svg";
    default:
      return "/rock.svg";
  }
};

export const BoosterConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  type,
  currentLevel,
  nextLevel,
  cost,
  requirements,
  userBalance,
  profitIncrease,
}: BoosterConfirmModalProps) => {
  const isUnlock = type === "unlock";

  // Check if user has enough balance
  const hasEnoughBalance =
    cost.amount === 0 ||
    (cost.currency === "stone"
      ? (userBalance?.stone ?? 0) >= cost.amount
      : (userBalance?.dust ?? 0) >= cost.amount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Content */}
              <div className="relative p-6">
                {/* Level info - Only for upgrade */}
                {!isUnlock &&
                  currentLevel !== undefined &&
                  nextLevel !== undefined && (
                    <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            Level {currentLevel}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Current
                          </div>
                        </div>
                        <div className="text-cyan-400 text-2xl">→</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Level {nextLevel}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Next</div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Profit increase */}
                {profitIncrease && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <img src="/rock.svg" alt="Rock" className="w-5 h-5" />
                        <span className="text-white font-bold">
                          {isUnlock ? "0" : profitIncrease.current}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-1.5">
                        <img src="/rock.svg" alt="Rock" className="w-5 h-5" />
                        <span className="text-cyan-400 font-bold">
                          {profitIncrease.next}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">per hour</span>
                    </div>
                  </div>
                )}

                {/* Cost section - only show if there's an actual cost */}
                {cost.amount > 0 && (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2 font-semibold">
                        {isUnlock ? "Unlock Cost:" : "Upgrade Cost:"}
                      </div>
                      <div
                        className={`p-4 rounded-xl border-2 ${
                          hasEnoughBalance
                            ? "bg-cyan-500/10 border-cyan-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={getCurrencyIcon(cost.currency)}
                              alt={cost.currency}
                              className="w-8 h-8"
                            />
                            <div>
                              <div
                                className={`text-2xl font-bold ${
                                  hasEnoughBalance
                                    ? "text-white"
                                    : "text-red-400"
                                }`}
                              >
                                {formatInteger(cost.amount)}
                              </div>
                              <div className="text-xs text-gray-400 capitalize">
                                {cost.currency}
                              </div>
                            </div>
                          </div>
                          {userBalance && (
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Your balance:
                              </div>
                              <div
                                className={`text-sm font-semibold ${
                                  hasEnoughBalance
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {cost.currency === "stone"
                                  ? formatInteger(userBalance.stone)
                                  : formatInteger(userBalance.dust)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Warning if not enough balance */}
                    {!hasEnoughBalance && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-300">
                          You don't have enough {cost.currency} to complete this
                          action.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Unlock requirements (if any) */}
                {isUnlock && requirements && (
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="text-xs text-gray-400 font-semibold mb-2">
                      Additional Requirements:
                    </div>
                    <div className="space-y-1 text-sm">
                      {requirements.stone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <img
                            src="/stone.svg"
                            alt="Stone"
                            className="w-4 h-4"
                          />
                          <span>{formatInteger(requirements.stone)} Stone</span>
                        </div>
                      )}
                      {requirements.dust && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <img src="/dust.svg" alt="Dust" className="w-4 h-4" />
                          <span>{formatInteger(requirements.dust)} Dust</span>
                        </div>
                      )}
                      {requirements.invite && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Lock className="w-4 h-4" />
                          <span>
                            {requirements.invite} Friend
                            {requirements.invite !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading || !hasEnoughBalance}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all relative overflow-hidden group ${
                      isLoading || !hasEnoughBalance
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white active:scale-95 shadow-lg shadow-cyan-500/30"
                    }`}
                  >
                    {/* Shine effect */}
                    {!isLoading && hasEnoughBalance && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    )}
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span className="relative z-10">Confirm</span>
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
};
