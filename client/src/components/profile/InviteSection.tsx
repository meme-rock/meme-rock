import { motion } from "framer-motion";
import { formatInteger } from "../../utils/formatNumber";
import { Users, Copy, Check, Gift } from "lucide-react";
import { useState } from "react";

interface InviteSectionProps {
  inviteCount: number;
  inviteLink: string;
  bonusPerInvite: number;
}

export const InviteSection = ({
  inviteCount,
  inviteLink,
  bonusPerInvite,
}: InviteSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Invite Friends</h3>
      </div>

      {/* Invite count card */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/30 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-purple-400/70 mb-1">Friends Invited</p>
            <p className="text-4xl font-black text-white">{inviteCount}</p>
          </div>
          <div className="bg-purple-500/20 p-4 rounded-full">
            <Gift className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Bonus per invite</p>
          <p className="text-lg font-bold text-yellow-400">
            +{formatInteger(bonusPerInvite)} $ROCK
          </p>
        </div>
      </div>

      {/* Invite link */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2">Your Invite Link</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-gray-800 text-gray-300 px-3 py-2 rounded-lg text-sm border border-gray-700 focus:outline-none focus:border-cyan-500"
          />
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              copied
                ? "bg-green-600 text-white"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
