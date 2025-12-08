import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { Crown, Sparkles } from "lucide-react";

// Components
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { InviteSection } from "../components/profile/InviteSection";
import { WalletConnection } from "../components/profile/WalletConnection";

export const ProfilePage = () => {
  // Select user data from Redux
  const user = useSelector((state: RootState) => state.user, shallowEqual);
  const {
    _id: userId,
    telegram_data: telegramData,
    is_premium: isPremium,
    invite_count: inviteCount,
  } = user;

  const inviteLink = `https://t.me/testforbilal_bot/testforbilal?startapp=${userId}`;

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
      {/* Background Gradients (Darker Theme) */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Üst orta hafif mavi ışık */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-cyan-900/10 blur-[100px]" />
        {/* Alt kısım hafif gri ışık */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-slate-900/20 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* 1. Header Section */}
        <ProfileHeader
          username={telegramData?.username}
          photoUrl={telegramData?.photo_url}
          userId={userId}
          isPremium={isPremium}
        />

        {/* 4. Premium Upsell (Only if not premium) */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">
                    Boost Your Rewards
                  </h4>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    Upgrade to{" "}
                    <span className="text-amber-400 font-semibold">
                      Premium
                    </span>{" "}
                    to unlock 4x multiplier and exclusive mining capabilities.
                  </p>
                </div>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Get Premium Access
              </button>
            </div>
          </div>
        )}

        {/* 5. Wallet & Invite Modules */}
        <WalletConnection />

        <InviteSection inviteCount={inviteCount || 0} inviteLink={inviteLink} />
      </div>
    </div>
  );
};
