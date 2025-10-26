export type AchievementType = "invite" | "ad";

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  requiredCount: number;
  stoneReward: number;
  icon: string;
}

// Invite Achievements
export const INVITE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "invite_1",
    type: "invite",
    title: "First Friend",
    description: "Invite your first friend",
    requiredCount: 1,
    stoneReward: 10,
    icon: "👤",
  },
  {
    id: "invite_2",
    type: "invite",
    title: "Social Starter",
    description: "Invite 2 friends",
    requiredCount: 2,
    stoneReward: 20,
    icon: "👥",
  },
  {
    id: "invite_5",
    type: "invite",
    title: "Network Builder",
    description: "Invite 5 friends",
    requiredCount: 5,
    stoneReward: 50,
    icon: "🌟",
  },
  {
    id: "invite_25",
    type: "invite",
    title: "Community Leader",
    description: "Invite 25 friends",
    requiredCount: 25,
    stoneReward: 300,
    icon: "👑",
  },
  {
    id: "invite_100",
    type: "invite",
    title: "Influencer",
    description: "Invite 100 friends",
    requiredCount: 100,
    stoneReward: 1250,
    icon: "🔥",
  },
  {
    id: "invite_1000",
    type: "invite",
    title: "Legend",
    description: "Invite 1000 friends",
    requiredCount: 1000,
    stoneReward: 15000,
    icon: "💎",
  },
];

// Ad Watching Achievements
export const AD_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ad_50",
    type: "ad",
    title: "Ad Explorer",
    description: "Watch 50 ads",
    requiredCount: 50,
    stoneReward: 100,
    icon: "📺",
  },
  {
    id: "ad_100",
    type: "ad",
    title: "Ad Enthusiast",
    description: "Watch 100 ads",
    requiredCount: 100,
    stoneReward: 250,
    icon: "📱",
  },
  {
    id: "ad_500",
    type: "ad",
    title: "Ad Master",
    description: "Watch 500 ads",
    requiredCount: 500,
    stoneReward: 1500,
    icon: "🎬",
  },
  {
    id: "ad_1000",
    type: "ad",
    title: "Ad Champion",
    description: "Watch 1000 ads",
    requiredCount: 1000,
    stoneReward: 3500,
    icon: "🏆",
  },
  {
    id: "ad_2500",
    type: "ad",
    title: "Ad Legend",
    description: "Watch 2500 ads",
    requiredCount: 2500,
    stoneReward: 10000,
    icon: "⭐",
  },
];

// Combined achievements list
export const ACHIEVEMENTS: Achievement[] = [
  ...INVITE_ACHIEVEMENTS,
  ...AD_ACHIEVEMENTS,
];
