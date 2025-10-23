export interface Achievement {
  id: string;
  title: string;
  description: string;
  requiredInvites: number;
  stoneReward: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "invite_1",
    title: "First Friend",
    description: "Invite your first friend",
    requiredInvites: 1,
    stoneReward: 10,
    icon: "👤",
  },
  {
    id: "invite_2",
    title: "Social Starter",
    description: "Invite 2 friends",
    requiredInvites: 2,
    stoneReward: 20,
    icon: "👥",
  },
  {
    id: "invite_5",
    title: "Network Builder",
    description: "Invite 5 friends",
    requiredInvites: 5,
    stoneReward: 50,
    icon: "🌟",
  },
  {
    id: "invite_25",
    title: "Community Leader",
    description: "Invite 25 friends",
    requiredInvites: 25,
    stoneReward: 300,
    icon: "👑",
  },
  {
    id: "invite_100",
    title: "Influencer",
    description: "Invite 100 friends",
    requiredInvites: 100,
    stoneReward: 1250,
    icon: "🔥",
  },
  {
    id: "invite_1000",
    title: "Legend",
    description: "Invite 1000 friends",
    requiredInvites: 1000,
    stoneReward: 15000,
    icon: "💎",
  },
];
