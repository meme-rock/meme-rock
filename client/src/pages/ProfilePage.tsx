import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";

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

        {/* 5. Wallet & Invite Modules */}
        <WalletConnection />

        <InviteSection inviteCount={inviteCount || 0} inviteLink={inviteLink} />
      </div>
    </div>
  );
};
