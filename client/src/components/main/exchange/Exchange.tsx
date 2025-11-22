import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useDustToStoneExchangeMutation } from "../../../redux/services/user/user-api";
import { formatInteger } from "../../../utils/formatNumber";

export const StoneTodustExchange = () => {
  const user = useSelector((state: RootState) => state.user);
  const [dustToStoneExchangeMutation] = useDustToStoneExchangeMutation();

  const [amount, setAmount] = useState(100);
  const [inputValue, setInputValue] = useState("100");
  const [isExchanging, setIsExchanging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const dustToStoneRate = 100; // 100 dust = 1 stone

  const userDust = user.balance_data.dust;

  // For dust-to-stone, calculate max in steps of 100
  const maxAmount = Math.floor(userDust / 100) * 100;
  const minAmount = 100;
  const step = 100;

  // Calculate converted amount
  const convertedAmount = amount / dustToStoneRate;

  const handleAmountChange = (value: number) => {
    const clamped = Math.min(Math.max(minAmount, value), maxAmount);
    setAmount(clamped);
    setInputValue(clamped.toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue) || minAmount;

    // For dust-to-stone, round to nearest 100
    let adjustedValue = Math.round(parsed / 100) * 100;

    const finalValue = Math.min(Math.max(minAmount, adjustedValue), maxAmount);
    setAmount(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleExchangeClick = () => {
    if (amount < minAmount || amount > maxAmount) return;
    setShowConfirmModal(true);
  };

  const handleConfirmExchange = async () => {
    if (isNaN(amount) || amount < minAmount) {
      console.error("Invalid amount:", amount);
      return;
    }

    setIsExchanging(true);
    setShowConfirmModal(false);

    try {
      const response = await dustToStoneExchangeMutation({
        user_id: user._id,
        dust: amount,
      });
      console.log("Dust to Stone exchange response:", response);

      setTimeout(() => {
        setIsExchanging(false);
        setAmount(100);
        setInputValue("100");
      }, 1000);
    } catch (error) {
      console.error("Error in exchange:", error);
      setIsExchanging(false);
    }
  };

  const canExchange =
    amount >= minAmount && amount <= maxAmount && !isExchanging;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-5">
        {/* Header - Replaced Toggle */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-2 rounded-lg border border-amber-500/20">
            <span className="text-amber-200 font-bold">
              Dust → Stone Exchange
            </span>
          </div>
        </div>

        {/* Exchange preview */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <img src="/dust.svg" alt="Dust" className="w-8 h-8" />
            <span className="text-white font-bold text-xl">
              {formatInteger(amount)}
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-400" />

          <div className="flex items-center gap-2">
            <img src="/stone.svg" alt="Stone" className="w-8 h-8" />
            <span className="text-amber-400 font-bold text-xl">
              {formatInteger(convertedAmount)}
            </span>
          </div>
        </div>

        {/* Manual input */}
        <div className="mb-3">
          <input
            type="number"
            min={minAmount}
            max={maxAmount}
            step={step}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder={`Enter amount (min: ${minAmount})...`}
            className="w-full bg-black/50 border border-amber-900/50 rounded-lg px-4 py-2.5 text-white text-center font-medium focus:outline-none focus:border-amber-500 transition-colors"
            disabled={isExchanging}
          />
        </div>

        {/* Slider */}
        <div className="mb-4">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={step}
            value={amount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            disabled={isExchanging}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{minAmount}</span>
            <span className="text-gray-400">
              Available: {formatInteger(maxAmount)} Dust
            </span>
            <span>{formatInteger(maxAmount)}</span>
          </div>
        </div>

        {/* Exchange button */}
        <motion.button
          onClick={handleExchangeClick}
          disabled={!canExchange}
          whileHover={canExchange ? { scale: 1.02 } : {}}
          whileTap={canExchange ? { scale: 0.98 } : {}}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            canExchange
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isExchanging ? "Exchanging..." : "Exchange"}
        </motion.button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border-2 border-amber-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <h3 className="text-xl font-black text-amber-400 mb-4 text-center">
                Confirm Exchange
              </h3>

              {/* Exchange details */}
              <div className="bg-black/40 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">You give:</span>
                  <div className="flex items-center gap-2">
                    <img src="/dust.svg" alt="Dust" className="w-6 h-6" />
                    <span className="text-white font-bold text-lg">
                      {formatInteger(amount)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">You get:</span>
                  <div className="flex items-center gap-2">
                    <img src="/stone.svg" alt="Stone" className="w-6 h-6" />
                    <span className="text-amber-400 font-bold text-lg">
                      {formatInteger(convertedAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleConfirmExchange}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
