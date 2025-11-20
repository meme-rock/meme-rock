import { useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import {
  User,
  Copy,
  Check,
  Wallet,
  Crown,
  Users,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatNumber, formatInteger } from "../utils/formatNumber";
import { TonConnectButton } from "@tonconnect/ui-react";

export const ProfilePage = () => {
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Select user data from Redux
  const userId = useSelector((state: RootState) => state.user._id);
  const telegramData = useSelector(
    (state: RootState) => state.user.telegram_data,
    shallowEqual
  );
  const isPremium = useSelector(
    (state: RootState) => state.user.is_premium,
    shallowEqual
  );
  const inviteCount = useSelector(
    (state: RootState) => state.user.invite_count,
    shallowEqual
  );
  const airdropData = useSelector(
    (state: RootState) => state.user.airdrop_data,
    shallowEqual
  );

  const inviteLink = `https://t.me/testforbilal_bot/testforbilal?startapp=${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectWallet = () => {
    // TODO: Implement TON wallet connection
    setWalletConnected(!walletConnected);
  };

  // Calculate potential airdrop allocation
  const baseReward = airdropData.rock_coins;
  const multiplier = isPremium ? 4 : 3;
  const potentialReward = baseReward * multiplier;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-6 max-w-lg space-y-4">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-60" />
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-400/50 bg-slate-800">
                {telegramData?.photo_url ? (
                  <img
                    src={telegramData.photo_url}
                    alt={telegramData.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              {isPremium && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">
                  {telegramData?.username || "Guest"}
                </h2>
                {isPremium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">
                {telegramData?.first_name} {telegramData?.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">TON Wallet</h3>
          </div>

          {walletConnected ? (
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300 font-medium mb-1">
                  Connected
                </p>
                <p className="text-sm text-emerald-400 font-mono">
                  UQBw...xY7z
                </p>
              </div>
              <button
                onClick={handleConnectWallet}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <TonConnectButton />
          )}

          <p className="text-xs text-slate-400 mt-3 text-center">
            Connect your TON wallet to receive airdrop rewards
          </p>
        </div>

        {/* Invite Section Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Invite Friends</h3>
          </div>

          {/* Invite Stats */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-200">Total Invites</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                {formatInteger(inviteCount)}
              </span>
            </div>
          </div>

          {/* Invite Link */}
          <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
            <p className="text-xs text-slate-400 mb-2">Your invite link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-slate-900/50 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Share Invite Link
          </button>
        </div>

        {/* Potential Airdrop Allocation */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Airdrop Allocation</h3>
          </div>

          {/* Season 1 Info */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-amber-200 font-medium">
                Season 1 Reward
              </span>
              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300 font-bold">
                  {multiplier}x
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Base Coins:</span>
                <span className="text-white font-bold">
                  {formatNumber(baseReward, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Multiplier:</span>
                <span className="text-amber-400 font-bold">{multiplier}x</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-200 font-medium">
                  Potential Reward:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                  {formatNumber(potentialReward, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Premium Incentive */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-purple-200 font-medium mb-1">
                  Upgrade to Premium for 4x Rewards!
                </p>
                <p className="text-xs text-purple-300/70 mb-3">
                  Premium users get 4x multiplier instead of 3x for Season 1
                  airdrop. Unlock maximum rewards now!
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  Get Premium
                </button>
              </div>
            </div>
          )}

          {/* Premium Active Badge */}
          {isPremium && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-xl p-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm text-purple-200 font-medium">
                  Premium Active
                </p>
                <p className="text-xs text-purple-300/70">
                  You're getting maximum 4x rewards!
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
