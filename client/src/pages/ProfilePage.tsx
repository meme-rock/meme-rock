import { ProfileHeader } from "../components/profile/ProfileHeader";
import { AirdropStats } from "../components/profile/AirdropStats";
import { InviteSection } from "../components/profile/InviteSection";
import { WalletConnection } from "../components/profile/WalletConnection";
import { UserStats } from "../components/profile/UserStats";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user);
  // TODO: Bu veriler Redux'tan ve backend'den gelecek
  const userData = {
    username: user.telegram_data.username,
    photoUrl: user.telegram_data.photo_url,
    userId: user._id,
  };

  const airdropData = {
    totalEarned: 125000,
    dailyEarnings: 5000,
    nextAirdrop: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };

  const inviteData = {
    inviteCount: 12,
    inviteLink: `https://t.me/testforbilal_bot/testforbilal?startapp=${user._id}`,
    bonusPerInvite: 1000,
  };

  const statsData = {
    miningLevel: 3,
    totalStones: 50000,
    miningStreak: 7,
    tasksCompleted: 15,
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Header */}
        <ProfileHeader
          username={userData.username}
          photoUrl={userData.photoUrl}
          userId={userData.userId}
        />

        {/* Airdrop Stats */}
        <AirdropStats
          totalEarned={airdropData.totalEarned}
          dailyEarnings={airdropData.dailyEarnings}
          nextAirdrop={airdropData.nextAirdrop}
        />

        {/* Invite Section */}
        <InviteSection
          inviteCount={inviteData.inviteCount}
          inviteLink={inviteData.inviteLink}
          bonusPerInvite={inviteData.bonusPerInvite}
        />

        {/* Wallet Connection */}
        <WalletConnection />

        {/* User Stats */}
        <UserStats stats={statsData} />
      </div>
    </div>
  );
};
