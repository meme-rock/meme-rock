import { useState } from "react";
import Lottie from "lottie-react";
import starAnimation from "../../public/animated-star.json";
import tonAnimation from "../../public/animated-ton.json";
import star from "../../public/star.json";
import {
  useLoadStonesMarketDataQuery,
  useStarsToStonesMutation,
  useTonToStonesMutation,
} from "../redux/services/market/market-api";
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
  const [starsToStonesMutation] = useStarsToStonesMutation();
  const [tonToStonesMutation] = useTonToStonesMutation();
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
          const { invoice_link } = await starsToStonesMutation({
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
          const response = await tonToStonesMutation({
            user_id: user._id,
            stone_amount: item.stones,
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
        // selectedCurrency, ne 'stars' ne de 'ton' ise burası çalışır
        console.warn(`Unknown currency selected: ${selectedCurrency}`);
        WebApp.showAlert("Unknown currency type selected.");
        break;
    }
    /* if (selectedCurrency === "stars") {
      const { invoice_link } = await starsToStonesMutation({
        user_id: user._id,
        stars_price: item.currency,
      }).unwrap();
      console.log("invoiceLink: ", invoice_link);
      if (!invoice_link) {
        WebApp.showAlert("Something went wrong");
        return;
      }
      WebApp.openInvoice(invoice_link);
    } else {
      console.log(`${item.currency} TON'a tıklandı`);
    } */
    // Telegram Web App purchase logic would go here
  };

  const currentPricing =
    selectedCurrency === "stars" ? starsPricing : tonPricing;

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-lg">Failed to load market data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative max-w-md mx-auto px-4 py-2">
        {/* Currency Selector */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-1 mb-4">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setSelectedCurrency("stars")}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                selectedCurrency === "stars"
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <div className="w-10 h-10">
                <Lottie animationData={star} />
              </div>
              <span>Stars</span>
            </button>
            <button
              onClick={() => setSelectedCurrency("ton")}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                selectedCurrency === "ton"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <img
                src="/ton_symbol.svg"
                alt="TON"
                className="w-8 h-8 filter brightness-110"
              />
              <span>TON +20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - Click to Expand */}
        <div className="space-y-3">
          {currentPricing.map((item) => {
            const isProcessingThisItem = processingItemId === item.id;
            const isDisabled = isPaymentProcessing || isProcessingThisItem;

            return (
              <div
                key={item.id}
                className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
                  isDisabled
                    ? "border-gray-700 opacity-60 cursor-not-allowed"
                    : "border-gray-800 hover:border-gray-700 cursor-pointer"
                }`}
                onClick={() => !isDisabled && handlePurchase(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedCurrency === "stars"
                          ? "bg-yellow-500/20 border border-yellow-500/30"
                          : "bg-blue-500/20 border border-blue-500/30"
                      }`}
                    >
                      {isProcessingThisItem ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : selectedCurrency === "stars" ? (
                        <div className="w-10 h-10">
                          <Lottie animationData={starAnimation} loop={true} />
                        </div>
                      ) : (
                        <div className="w-10 h-10">
                          <Lottie animationData={tonAnimation} loop={true} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-bold ${
                            selectedCurrency === "stars"
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        >
                          {selectedCurrency === "stars"
                            ? formatInteger(item.currency)
                            : formatNumber(item.currency, 2)}
                        </span>
                        {isProcessingThisItem && (
                          <span className="text-gray-400 text-sm">
                            Processing...
                          </span>
                        )}
                      </div>
                      {item.bonus ? (
                        <div className="text-green-400 text-sm font-medium">
                          +{formatInteger(item.bonus)} bonus stones
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/stone.svg"
                        alt="Stone"
                        className="w-5 h-5 filter brightness-110"
                      />
                      <div className="text-white font-bold text-xl">
                        {formatInteger(item.stones)}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">stones</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
