import {
  Home,
  User,
  ShoppingCart,
  Pickaxe,
  Trophy,
  ListTodo,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "main", label: "Main", icon: Home, path: "/" },
    { id: "mine", label: "Mine", icon: Pickaxe, path: "/mine" },
    // rock.svg ikonunu diğerlerinden ayırabilmek için benzersiz bir id kullanacağız
    { id: "rock", label: "$ROCK", icon: "/jackhammer.svg", path: "/rock" },
    { id: "leaderboard", label: "Ranks", icon: Trophy, path: "/leaderboard" },
    {
      id: "leaderboard-2",
      label: "Ranks2",
      icon: Trophy,
      path: "/leaderboard-2",
    },
    { id: "task", label: "Task", icon: ListTodo, path: "/task" },
    { id: "market", label: "Market", icon: ShoppingCart, path: "/market" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 px-2 py-2 fixed bottom-0 left-0 right-0 shadow-lg z-50">
      <div className="flex justify-around items-center max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSvgPath = typeof Icon === "string";
          const isActive = location.pathname === item.path;

          // 1. Varsayılan boyut (Lucide ikonları için): w-5 h-5
          let iconSizeClasses = `w-5 h-5`;

          // Ortak sınıfları ekleyin
          const iconClasses = `${iconSizeClasses} mb-0.5 transition-transform duration-300 ${
            isActive ? "scale-110" : ""
          }`;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0 ${
                isActive
                  ? "text-cyan-400 bg-gradient-to-t from-cyan-500/20 to-cyan-400/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              {isSvgPath ? (
                // SVG için <img> etiketi (Özel boyut bu kısma yansıyor)
                <img src={Icon} alt={item.label} className={iconClasses} />
              ) : (
                // Bileşen ikonları (Lucide) (Varsayılan boyutta kalıyor)
                <Icon className={iconClasses} />
              )}
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
