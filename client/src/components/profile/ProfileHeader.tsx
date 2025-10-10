import { motion } from "framer-motion";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  username?: string;
  photoUrl?: string;
  userId?: string;
}

export const ProfileHeader = ({
  username = "Guest",
  photoUrl,
  userId,
}: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-cyan-500 bg-gray-800 flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-cyan-400" />
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
      </div>

      {/* User info */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-1">{username}</h2>
        {userId && <p className="text-sm text-gray-400">ID: {userId}</p>}
      </div>
    </motion.div>
  );
};
