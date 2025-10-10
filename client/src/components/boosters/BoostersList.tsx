import { BoosterCard, Booster } from "./BoosterCard";

interface BoostersListProps {
  boosters: Booster[];
  userStones: number;
  onUnlock: (boosterId: string) => void;
  onUpgrade: (boosterId: string) => void;
}

export const BoostersList = ({
  boosters,
  userStones,
  onUnlock,
  onUpgrade,
}: BoostersListProps) => {
  return (
    <div className="space-y-3">
      {boosters.map((booster, index) => (
        <BoosterCard
          key={booster.id}
          booster={booster}
          userStones={userStones}
          onUnlock={onUnlock}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
};
