import { motion } from "framer-motion";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";

export const WalletConnection = () => {
  const walletAddress = useTonAddress();
  const isConnected = !!walletAddress;

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">TON Wallet</h3>
      </div>

      {/* Wallet card */}
      <div
        className={`rounded-2xl p-6 border ${
          isConnected
            ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-600/30"
            : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700"
        }`}
      >
        {isConnected ? (
          <>
            {/* Connected state */}
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-green-400 font-semibold">
                  Wallet Connected
                </p>
                <p className="text-xs text-gray-400">
                  {formatAddress(walletAddress)}
                </p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 mb-4">
              <p className="text-xs text-gray-400 mb-1">
                Airdrop tokens will be sent to this wallet
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected state */}
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-white font-semibold">
                  Connect Your Wallet
                </p>
                <p className="text-xs text-gray-400">
                  Required to receive $ROCK airdrop
                </p>
              </div>
            </div>
          </>
        )}

        {/* TON Connect Button */}
        <div className="flex justify-center">
          <TonConnectButton />
        </div>
      </div>
    </motion.div>
  );
};
