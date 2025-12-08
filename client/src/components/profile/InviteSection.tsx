import { motion } from "framer-motion";
import { Users, Copy, Check, UserPlus } from "lucide-react";
import { useState } from "react";

interface InviteSectionProps {
  inviteCount: number;
  inviteLink: string;
}

export const InviteSection = ({
  inviteCount,
  inviteLink,
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
        <Users className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Invite Friends</h3>
      </div>

      {/* Invite count card */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
        {/* Arka plan efekti */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <p className="text-sm text-indigo-300/70 mb-1">Friends Invited</p>
            <p className="text-4xl font-black text-white tracking-tight">
              {inviteCount}
            </p>
          </div>
          <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        {/* Invite link */}

        <p className="text-xs text-slate-400 mb-2">Your Invite Link</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-slate-950 text-slate-300 px-3 py-3 rounded-lg text-sm border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
          />
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center min-w-[3rem] ${
              copied
                ? "bg-emerald-600 text-white border border-emerald-500"
                : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500"
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
