import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  photoUrl?: string;
  username?: string;
}

export const ProfileAvatar = ({ photoUrl, username }: ProfileAvatarProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/profile")}
      className="cursor-pointer group relative"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500 bg-gray-800 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/50">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={username || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-cyan-400" />
        )}
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </div>
  );
};
