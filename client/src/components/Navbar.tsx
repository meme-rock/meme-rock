import { Home, Zap, User, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "main", label: "Main", icon: Home, path: "/" },
    { id: "boosters", label: "Boosters", icon: Zap, path: "/boosters" },
    { id: "market", label: "Market", icon: ShoppingCart, path: "/market" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 px-4 py-3 fixed bottom-0 left-0 right-0 shadow-lg z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-cyan-400 bg-gradient-to-t from-cyan-500/20 to-cyan-400/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform duration-300 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
