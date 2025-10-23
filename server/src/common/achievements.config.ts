export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  requiredInvites: number;
  stoneReward: number;
}

export const ACHIEVEMENTS_CONFIG: AchievementConfig[] = [
  {
    id: 'invite_1',
    title: 'First Friend',
    description: 'Invite your first friend',
    requiredInvites: 1,
    stoneReward: 10,
  },
  {
    id: 'invite_2',
    title: 'Social Starter',
    description: 'Invite 2 friends',
    requiredInvites: 2,
    stoneReward: 20,
  },
  {
    id: 'invite_5',
    title: 'Network Builder',
    description: 'Invite 5 friends',
    requiredInvites: 5,
    stoneReward: 50,
  },
  {
    id: 'invite_25',
    title: 'Community Leader',
    description: 'Invite 25 friends',
    requiredInvites: 25,
    stoneReward: 300,
  },
  {
    id: 'invite_100',
    title: 'Influencer',
    description: 'Invite 100 friends',
    requiredInvites: 100,
    stoneReward: 1250,
  },
  {
    id: 'invite_1000',
    title: 'Legend',
    description: 'Invite 1000 friends',
    requiredInvites: 1000,
    stoneReward: 15000,
  },
];
