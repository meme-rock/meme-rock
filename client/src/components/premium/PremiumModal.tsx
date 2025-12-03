import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Rocket, Star, Check } from "lucide-react";
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
          // Show loading animation during processing
          setIsPaymentProcessing(true);
          // Wait 2 seconds for payment confirmation
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await isPremium({ user_id: user_id }).unwrap();
          // Refresh user data to update premium status
          WebApp.showAlert("Premium purchased successfully");
          // Hide loading animation after user data is loaded
          setIsPaymentProcessing(false);
          // Close modal after successful purchase
          onClose();
        }
      });
    } catch (error) {
      console.error("❌ Purchase Premium with Stars error:", error);
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
      console.error("❌ Purchase Premium with Ton error:", error);
      setIsPaymentProcessing(false);
      WebApp.showAlert(
        "Failed to purchase premium with ton. Please try again."
      );
    }
  };
  const premiumBenefits = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "2x Mining Speed",
      description: "Mine stones twice as fast",
    },
    {
      icon: <Rocket className="w-5 h-5 text-cyan-400" />,
      title: "Exclusive Boosters",
      description: "Access to premium-only boosters",
    },
    {
      icon: <Star className="w-5 h-5 text-purple-400" />,
      title: "Premium Badge",
      description: "Show off your premium status",
    },
    {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      title: "Priority Support",
      description: "Get help faster with priority support",
    },
  ];

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[85vh] bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/10 pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                disabled={isPaymentProcessing}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Content */}
              <div className="relative p-6 overflow-y-auto flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl">Premium</h3>
                    <p className="text-gray-400 text-sm">
                      Unlock exclusive benefits
                    </p>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3">
                  {premiumBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <div className="mt-0.5">{benefit.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {benefit.description}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Payment Buttons - Fixed at bottom */}
              <div className="p-6 pt-0 border-t border-gray-800/50 flex-shrink-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black">
                <p className="text-xs text-gray-400 font-semibold mb-3 text-center">
                  Choose your payment method:
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
