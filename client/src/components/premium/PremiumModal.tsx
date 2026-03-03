import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Clock, Rocket, ShieldCheck } from "lucide-react";
import { PaymentButtons } from "../shared/PaymentButtons";
import { EBoosterUnlockCurrencyType } from "../../types/enums";
import WebApp from "@twa-dev/sdk";
import { useState } from "react";
import { usePurchasePremiumWithStarsMutation } from "../../redux/services/star/star-api";
import { usePurchasePremiumWithTonMutation } from "../../redux/services/ton/ton-api";
import { useIsPremiumMutation } from "../../redux/services/user/user-api";
import {
  useTonConnectUI,
  useTonAddress,
  SendTransactionRequest,
} from "@tonconnect/ui-react";

interface PremiumModalProps {
  user_id: string;
  isOpen: boolean;
  onClose: () => void;
  premiumStarPrice?: number;
  premiumTonPrice?: number;
}

const premiumBenefits = [
  {
    title: "4x Mining Rewards",
    description: "Quadruple your mining output",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "24H Mining Storage",
    description: "Extended storage capacity",
    icon: Clock,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "Exclusive Boosters",
    description: "Access premium-only boosters",
    icon: Rocket,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Season Validity",
    description: "Active for the entire season",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export const PremiumModal = ({
  user_id,
  isOpen,
  onClose,
  premiumStarPrice = 500,
  premiumTonPrice = 0.5,
}: PremiumModalProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const [
    purchasePremiumWithStars,
    { isLoading: isPurchasingPremiumWithStars },
  ] = usePurchasePremiumWithStarsMutation();

  const [purchasePremiumWithTon, { isLoading: isPurchasingPremiumWithTon }] =
    usePurchasePremiumWithTonMutation();

  const [isPremium] = useIsPremiumMutation();

  const handleStarPurchase = async () => {
    try {
      const { invoice_link } = await purchasePremiumWithStars({
        user_id: user_id,
      }).unwrap();

      if (!invoice_link) {
        throw new Error("Failed to purchase premium with stars");
      }

      WebApp.openInvoice(invoice_link, async (status) => {
        if (status === "paid") {
          setIsPaymentProcessing(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await isPremium({ user_id: user_id }).unwrap();
          WebApp.showAlert("Premium purchased successfully");
          setIsPaymentProcessing(false);
          onClose();
        }
      });
    } catch (error) {
      console.error("Purchase Premium with Stars error:", error);
      setIsPaymentProcessing(false);
      WebApp.showAlert(
        "Failed to purchase premium with stars. Please try again."
      );
    }
  };

  const handleTonPurchase = async () => {
    try {
      setIsPaymentProcessing(true);
      if (!walletAddress) {
        WebApp.showAlert("Please connect your wallet first!");
        tonConnectUI.openModal();
        setIsPaymentProcessing(false);
        return;
      }
      const response = await purchasePremiumWithTon({
        user_id: user_id,
        wallet_address: walletAddress,
      }).unwrap();
      if (!response) {
        throw new Error("Failed to purchase premium with ton");
      }
      await tonConnectUI.sendTransaction(response as SendTransactionRequest);
      setIsPaymentProcessing(false);
    } catch (error) {
      console.error("Purchase Premium with Ton error:", error);
      setIsPaymentProcessing(false);
      WebApp.showAlert(
        "Failed to purchase premium with ton. Please try again."
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isPaymentProcessing ? undefined : onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm max-h-[85vh] bg-slate-900 border border-amber-500/20 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col"
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent pointer-events-none" />

              {/* Close button */}
              {!isPaymentProcessing && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Content */}
              <div className="relative p-6 overflow-y-auto flex-1">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  {/* Crown icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/40 mb-4"
                  >
                    <Crown className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-black text-white mb-1">
                    Go Premium
                  </h3>
                  <p className="text-sm text-slate-400">
                    Unlock the full power of your mining operation
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-2.5">
                  {premiumBenefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.07 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${benefit.bg}`}
                      >
                        <div className="flex-shrink-0">
                          <Icon className={`w-5 h-5 ${benefit.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white">
                            {benefit.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {benefit.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Payment section */}
              <div className="p-5 pt-4 border-t border-slate-800/50 flex-shrink-0">
                <p className="text-[11px] text-slate-500 font-semibold mb-3 text-center uppercase tracking-wider">
                  Choose payment method
                </p>
                <PaymentButtons
                  starOption={
                    premiumStarPrice
                      ? {
                          type: EBoosterUnlockCurrencyType.STAR,
                          amount: premiumStarPrice,
                        }
                      : undefined
                  }
                  tonOption={
                    premiumTonPrice
                      ? {
                          type: EBoosterUnlockCurrencyType.TON,
                          amount: premiumTonPrice,
                        }
                      : undefined
                  }
                  onStarClick={handleStarPurchase}
                  onTonClick={handleTonPurchase}
                  isStarLoading={isPurchasingPremiumWithStars}
                  isTonLoading={isPurchasingPremiumWithTon}
                  isProcessing={isPaymentProcessing}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
