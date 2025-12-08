import { useState } from "react";
import Lottie from "lottie-react";
import starAnimation from "../../public/animated-star.json";
import tonAnimation from "../../public/animated-ton.json";
import star from "../../public/star.json";
import { useLoadStonesMarketDataQuery } from "../redux/services/market/market-api";
import { usePurchaseStonesWithStarsMutation } from "../redux/services/star/star-api";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import WebApp from "@twa-dev/sdk";
import "buffer";
import {
  useTonConnectUI,
  useTonAddress,
  SendTransactionRequest,
} from "@tonconnect/ui-react";
import { formatNumber, formatInteger } from "../utils/formatNumber";
import { useGetBalanceDataMutation } from "../redux/services/user/user-api";
import { usePurchaseStonesWithTonMutation } from "../redux/services/ton/ton-api";
import { ShoppingBag, Loader2, Zap } from "lucide-react"; // Yeni ikonlar

type CurrencyType = "stars" | "ton";

interface StarMarketItem {
  stars_price: number;
  stone_amount: number;
  stone_bonus: number;
  total_stones: number;
}

interface TonMarketItem {
  ton_price: number;
  stone_amount: number;
  stone_bonus: number;
  total_stones: number;
}

interface PricingItem {
  id: string;
  currency: number;
  stones: number;
  bonus?: number;
}

interface MarketPageProps {
  stones: number;
}

export const MarketPage = ({}: MarketPageProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [getBalanceData] = useGetBalanceDataMutation();
  const user = useSelector((state: RootState) => state.user);
  const [purchaseStonesWithStarsMutation] =
    usePurchaseStonesWithStarsMutation();
  const [purchaseStonesWithTonMutation] = usePurchaseStonesWithTonMutation();
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyType>("stars");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  // API'den market verilerini çek
  const {
    data: marketData,
    isLoading,
    error,
  } = useLoadStonesMarketDataQuery({});

  // Backend'den gelen verileri PricingItem formatına çevir
  const starsPricing: PricingItem[] =
    marketData?.star_market?.map((item: StarMarketItem) => ({
      id: `stars-${item.stars_price}`,
      currency: item.stars_price,
      stones: item.total_stones,
      bonus: item.stone_bonus,
    })) || [];

  const tonPricing: PricingItem[] =
    marketData?.ton_market?.map((item: TonMarketItem) => ({
      id: `ton-${item.ton_price}`,
      currency: item.ton_price,
      stones: item.total_stones,
      bonus: item.stone_bonus,
    })) || [];

  const handlePurchase = async (item: PricingItem) => {
    // Prevent multiple simultaneous purchases
    if (isPaymentProcessing) {
      return;
    }

    switch (selectedCurrency) {
      case "stars":
        try {
          setProcessingItemId(item.id);
          const { invoice_link } = await purchaseStonesWithStarsMutation({
            user_id: user._id,
            stars_price: item.currency,
          }).unwrap();

          console.log("invoiceLink: ", invoice_link);

          if (!invoice_link) {
            setProcessingItemId(null);
            WebApp.showAlert("Something went wrong during invoice generation.");
            return;
          }

          // WebApp objesinin Telegram Web App içinden erişilebilir olduğunu varsayıyoruz
          WebApp.openInvoice(invoice_link, async (status) => {
            if (status === "paid") {
              // Show loading animation during processing
              setIsPaymentProcessing(true);
              // sleep 2 seconds
              await new Promise((resolve) => setTimeout(resolve, 2000));
              await getBalanceData({ user_id: user._id }).unwrap();
              // Hide loading animation after balance is loaded
              setIsPaymentProcessing(false);
              setProcessingItemId(null);
            } else {
              // If payment was cancelled or failed
              setProcessingItemId(null);
            }
          });
        } catch (error) {
          console.error("❌ Stars to Stones error:", error);
          setIsPaymentProcessing(false);
          setProcessingItemId(null);
          // Hata ayrıntılarını kullanıcıya göstermek isteyebilirsiniz
          WebApp.showAlert("Failed to create invoice. Please try again.");
        }
        break;

      case "ton":
        try {
          setProcessingItemId(item.id);
          console.log(`${item.currency} TON'a tıklandı`);
          if (!walletAddress) {
            setProcessingItemId(null);
            WebApp.showAlert("Please connect your wallet first!");
            tonConnectUI.openModal();
            return;
          }
          const response = await purchaseStonesWithTonMutation({
            user_id: user._id,
            ton_price: item.currency,
            wallet_address: walletAddress,
          }).unwrap();
          console.log("response: ", response);
          if (!response) {
            throw new Error("Failed to create transaction");
          }
          console.log("Backend'den Gelen Payload İçeriği ", response);

          // Show loading during TON transaction
          setIsPaymentProcessing(true);
          await tonConnectUI.sendTransaction(
            response as SendTransactionRequest
          );
          // Wait for transaction to be processed
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await getBalanceData({ user_id: user._id }).unwrap();
          setIsPaymentProcessing(false);
          setProcessingItemId(null);
        } catch (error) {
          console.error("❌ TON to Stones error:", error);
          setIsPaymentProcessing(false);
          setProcessingItemId(null);
        }
        break;

      default:
        console.warn(`Unknown currency selected: ${selectedCurrency}`);
        WebApp.showAlert("Unknown currency type selected.");
        break;
    }
  };

  const currentPricing =
    selectedCurrency === "stars" ? starsPricing : tonPricing;

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <div className="text-slate-400 text-sm animate-pulse">
          Loading market data...
        </div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-red-400 text-sm">Failed to load market data</div>
      </div>
    );
  }

  return (
    // Padding-top eklendi (pt-20) -> TopBar'ın altında kalmaması için
    <div className="min-h-screen bg-slate-950 pt-4 pb-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Content container */}
      <div className="relative max-w-md mx-auto px-4 space-y-6">
        {/* Currency Selector (Switch) */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-lg">
          <div className="grid grid-cols-2 gap-1">
            {/* Stars Button */}
            <button
              onClick={() => setSelectedCurrency("stars")}
              className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                selectedCurrency === "stars"
                  ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="w-6 h-6 flex-shrink-0">
                <Lottie animationData={star} loop={false} />
              </div>
              <span className="text-sm font-bold tracking-wide">Stars</span>
            </button>

            {/* TON Button */}
            <button
              onClick={() => setSelectedCurrency("ton")}
              className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                selectedCurrency === "ton"
                  ? "bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              <img
                src="/ton_symbol.svg"
                alt="TON"
                className="w-5 h-5 brightness-125 drop-shadow-md"
              />
              <span className="text-sm font-bold tracking-wide">TON</span>
              {/* Badge for Offer */}
              <div className="absolute top-1 right-1">
                <div className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Zap className="w-2 h-2 fill-current" />
                  30%
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-3">
          {currentPricing.map((item) => {
            const isProcessingThisItem = processingItemId === item.id;
            const isDisabled = isPaymentProcessing || isProcessingThisItem;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => handlePurchase(item)}
                className={`relative w-full group overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isDisabled
                    ? "bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed"
                    : "bg-slate-900/60 backdrop-blur-md border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {/* Highlight Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                <div className="flex items-center justify-between p-4 relative z-10">
                  {/* Left: Price & Currency */}
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
                        selectedCurrency === "stars"
                          ? "bg-amber-950/30 border-amber-500/20 group-hover:border-amber-500/40"
                          : "bg-blue-950/30 border-cyan-500/20 group-hover:border-cyan-500/40"
                      }`}
                    >
                      {isProcessingThisItem ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : selectedCurrency === "stars" ? (
                        <div className="w-10 h-10">
                          <Lottie animationData={starAnimation} loop={true} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 scale-125">
                          <Lottie animationData={tonAnimation} loop={true} />
                        </div>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Price
                      </span>
                      <span
                        className={`text-xl font-black tracking-tight ${
                          selectedCurrency === "stars"
                            ? "text-amber-400"
                            : "text-cyan-400"
                        }`}
                      >
                        {selectedCurrency === "stars"
                          ? formatInteger(item.currency)
                          : formatNumber(item.currency, 2)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Bonus */}
                  <div className="flex flex-col items-end">
                    {/* Bonus Badge */}
                    {item.bonus ? (
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-1">
                        <span className="text-[10px] font-bold text-emerald-400">
                          +{formatInteger(item.bonus)} Bonus
                        </span>
                      </div>
                    ) : (
                      <div className="h-6" /> /* Spacer to keep alignment */
                    )}

                    {/* Stone Amount */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                        {formatInteger(item.stones)}
                      </span>
                      <img
                        src="/stone.svg"
                        alt="Stone"
                        className="w-6 h-6 brightness-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
