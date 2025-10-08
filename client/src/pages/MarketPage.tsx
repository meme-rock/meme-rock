import { useState } from "react";
import Lottie from "lottie-react";
import starAnimation from "../../public/animated-star.json";
import tonAnimation from "../../public/animated-ton.json";
import star from "../../public/star.json";

type CurrencyType = "stars" | "ton";

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
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyType>("stars");

  const starsPricing: PricingItem[] = [
    { id: "stars-100", currency: 100, stones: 100 },
    { id: "stars-500", currency: 500, stones: 600, bonus: 100 },
    { id: "stars-1000", currency: 1000, stones: 1300, bonus: 300 },
    { id: "stars-2500", currency: 2500, stones: 3500, bonus: 1000 },
  ];

  const tonPricing: PricingItem[] = [
    { id: "ton-1", currency: 1.01, stones: 120, bonus: 20 },
    { id: "ton-5", currency: 5.01, stones: 720, bonus: 220 },
    { id: "ton-10", currency: 10.01, stones: 1500, bonus: 500 },
    { id: "ton-25", currency: 25.01, stones: 4000, bonus: 1400 },
  ];

  const handlePurchase = (item: PricingItem) => {
    console.log(
      `Purchasing ${item.stones} stones for ${item.currency} ${selectedCurrency}`
    );
    // Telegram Web App purchase logic would go here
  };

  const currentPricing =
    selectedCurrency === "stars" ? starsPricing : tonPricing;

  return (
    <div className="flex-1 bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Stone Display */}
        <div className="flex justify-center mb-8"></div>
        {/* Currency Selector */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-1 mb-6">
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
              <span>Telegram Stars</span>
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
                className="w-5 h-5 filter brightness-110"
              />
              <span>TON +20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - Click to Expand */}
        <div className="space-y-4">
          {currentPricing.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-300 cursor-pointer"
              onClick={() => handlePurchase(item)}
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
                    {selectedCurrency === "stars" ? (
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
                          ? item.currency.toLocaleString()
                          : item.currency.toFixed(2)}
                      </span>
                    </div>
                    {item.bonus && (
                      <div className="text-green-400 text-sm font-medium">
                        +{item.bonus} bonus stones
                      </div>
                    )}
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
                      {item.stones.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">stones</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-gray-900/30 border border-gray-800/50 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                Purchase Information
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {selectedCurrency === "stars"
                  ? "Telegram Stars purchases are processed instantly. Stars can be purchased from Telegram Premium or earned through activities."
                  : "TON purchases include 20% bonus stones. All transactions are processed securely through The Open Network."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
