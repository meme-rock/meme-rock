import { motion } from "framer-motion";
import { User, Crown } from "lucide-react";

interface ProfileHeaderProps {
  username?: string;
  photoUrl?: string;
  userId?: string;
  isPremium?: boolean;
}

export const ProfileHeader = ({
  username = "Guest",
  photoUrl,
  userId,
  isPremium,
}: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden"
    >
      {/* Hafif parlama efekti */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-900/10 via-transparent to-transparent opacity-50" />

      {/* Avatar */}
      <div className="relative z-10">
        <div
          className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${
            isPremium
              ? "border-amber-500 shadow-lg shadow-amber-500/20"
              : "border-cyan-500/30"
          } bg-slate-950 flex items-center justify-center`}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-600" />
          )}
        </div>
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1.5 rounded-full border-4 border-slate-900">
            <Crown className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 z-10">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
            {username}
          </h2>
          {isPremium && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
              PREMIUM
            </span>
          )}
        </div>

        {userId && (
          <p className="text-sm text-slate-400 font-mono">ID: {userId}</p>
        )}
      </div>
    </motion.div>
  );
};
