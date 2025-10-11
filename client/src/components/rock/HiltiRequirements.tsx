import { CheckCircle2, XCircle } from "lucide-react";

interface HiltiRequirementsProps {
  requirements: Record<string, any>;
  nextLevel: number;
  canUpgrade: boolean;
  onUpgrade: () => void;
}

export const HiltiRequirements = ({
  requirements,
  nextLevel,
  canUpgrade,
  onUpgrade,
}: HiltiRequirementsProps) => {
  const requirementEntries = Object.entries(requirements || {});

  if (nextLevel > 5) {
    return (
      <div className="mt-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">
            Maximum Level Reached
          </h3>
          <p className="text-gray-400 text-sm">
            Your Hilti is at maximum power!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          Upgrade to Level {nextLevel}
        </h3>
      </div>

      {requirementEntries.length > 0 ? (
        <div className="space-y-3 mb-4">
          {requirementEntries.map(([key, value]) => {
            // Parse requirement key to make it readable
            const displayName = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <div
                key={key}
                className="flex items-center justify-between bg-black/40 rounded-lg p-3 border border-gray-800"
              >
                <span className="text-gray-300 text-sm">{displayName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-semibold">{value}</span>
                  {canUpgrade ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-4">
          No requirements for this level
        </p>
      )}

      <button
        onClick={onUpgrade}
        disabled={!canUpgrade}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          canUpgrade
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {canUpgrade ? "Upgrade Hilti" : "Requirements Not Met"}
      </button>
    </div>
  );
};
