export interface User {
  id: string;
  username: string;
  avatar: string;
  rank: number;
  minerLevel: number;
  jackhammerLevel: number;
  totalInvites: number;
  profitPerHour: number;
  totalRock: number;
}

export interface WeeklyUser {
  id: string;
  username: string;
  avatar: string;
  weeklyInvites: number;
}

export const currentUser: User = {
  id: "current",
  username: "CryptoMiner_TR",
  avatar: "/male-gaming-avatar.png",
  rank: 156,
  minerLevel: 12,
  jackhammerLevel: 8,
  totalInvites: 23,
  profitPerHour: 450,
  totalRock: 125680,
};

export const mockUsers: User[] = [
  {
    id: "1",
    username: "DiamondHands",
    avatar: "/crypto-avatar-gold-crown.jpg",
    rank: 1,
    minerLevel: 50,
    jackhammerLevel: 45,
    totalInvites: 1250,
    profitPerHour: 15000,
    totalRock: 8500000,
  },
  {
    id: "2",
    username: "RockLegend",
    avatar: "/gaming-avatar-silver-knight.jpg",
    rank: 2,
    minerLevel: 48,
    jackhammerLevel: 42,
    totalInvites: 980,
    profitPerHour: 12500,
    totalRock: 7200000,
  },
  {
    id: "3",
    username: "MiningKing",
    avatar: "/gaming-avatar-bronze-warrior.jpg",
    rank: 3,
    minerLevel: 45,
    jackhammerLevel: 40,
    totalInvites: 850,
    profitPerHour: 10800,
    totalRock: 6100000,
  },
  {
    id: "4",
    username: "CryptoQueen",
    avatar: "/gaming-avatar-female-queen.jpg",
    rank: 4,
    minerLevel: 43,
    jackhammerLevel: 38,
    totalInvites: 720,
    profitPerHour: 9500,
    totalRock: 5400000,
  },
  {
    id: "5",
    username: "BlockMaster",
    avatar: "/gaming-avatar-ninja-dark.jpg",
    rank: 5,
    minerLevel: 41,
    jackhammerLevel: 36,
    totalInvites: 650,
    profitPerHour: 8200,
    totalRock: 4800000,
  },
  {
    id: "6",
    username: "TokenHunter",
    avatar: "/gaming-avatar-robot-blue.jpg",
    rank: 6,
    minerLevel: 39,
    jackhammerLevel: 34,
    totalInvites: 580,
    profitPerHour: 7100,
    totalRock: 4200000,
  },
  {
    id: "7",
    username: "AirdropPro",
    avatar: "/gaming-avatar-space-astronaut.jpg",
    rank: 7,
    minerLevel: 37,
    jackhammerLevel: 32,
    totalInvites: 520,
    profitPerHour: 6400,
    totalRock: 3700000,
  },
  {
    id: "8",
    username: "CoinCollector",
    avatar: "/gaming-avatar-pirate-treasure.jpg",
    rank: 8,
    minerLevel: 35,
    jackhammerLevel: 30,
    totalInvites: 470,
    profitPerHour: 5800,
    totalRock: 3300000,
  },
  {
    id: "9",
    username: "MineForever",
    avatar: "/gaming-avatar-wizard-magic.jpg",
    rank: 9,
    minerLevel: 33,
    jackhammerLevel: 28,
    totalInvites: 420,
    profitPerHour: 5200,
    totalRock: 2900000,
  },
  {
    id: "10",
    username: "GoldDigger",
    avatar: "/gaming-avatar-cowboy-western.jpg",
    rank: 10,
    minerLevel: 31,
    jackhammerLevel: 26,
    totalInvites: 380,
    profitPerHour: 4700,
    totalRock: 2600000,
  },
];

export const mockWeeklyUsers: WeeklyUser[] = [
  {
    id: "w1",
    username: "InviteKing",
    avatar: "/gaming-avatar-king-golden.jpg",
    weeklyInvites: 156,
  },
  {
    id: "w2",
    username: "FriendsMaster",
    avatar: "/gaming-avatar-hero-cape.jpg",
    weeklyInvites: 134,
  },
  {
    id: "w3",
    username: "NetworkPro",
    avatar: "/gaming-avatar-cyber-punk.jpg",
    weeklyInvites: 112,
  },
  {
    id: "w4",
    username: "ReferralBoss",
    avatar: "/gaming-avatar-boss-suit.jpg",
    weeklyInvites: 98,
  },
  {
    id: "w5",
    username: "ShareMachine",
    avatar: "/gaming-avatar-machine-robot.jpg",
    weeklyInvites: 87,
  },
  {
    id: "w6",
    username: "CommunityLead",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 76,
  },
  {
    id: "w7",
    username: "GrowthHacker",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 65,
  },
  {
    id: "w8",
    username: "TeamBuilder",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 54,
  },
  {
    id: "w9",
    username: "SocialStar",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 43,
  },
  {
    id: "w10",
    username: "ViralMiner",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 38,
  },
];

export const lastWeekWinners: WeeklyUser[] = [
  {
    id: "lw1",
    username: "LegendInviter",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 203,
  },
  {
    id: "lw2",
    username: "SuperReferrer",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 187,
  },
  {
    id: "lw3",
    username: "NetworkGuru",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 165,
  },
  {
    id: "lw4",
    username: "CommunityKing",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 142,
  },
  {
    id: "lw5",
    username: "GrowthMaster",
    avatar: "/placeholder.svg?height=48&width=48",
    weeklyInvites: 128,
  },
];
