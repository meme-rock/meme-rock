import { Home, User, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "main", label: "Main", icon: Home, path: "/" },
    // rock.svg ikonunu diğerlerinden ayırabilmek için benzersiz bir id kullanacağız
    { id: "rock", label: "$ROCK", icon: "/rock.svg", path: "/rock" },
    { id: "dust", label: "Dust", icon: "/dust.svg", path: "/dust" },
    { id: "market", label: "Market", icon: ShoppingCart, path: "/market" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 px-4 py-3 fixed bottom-0 left-0 right-0 shadow-lg z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSvgPath = typeof Icon === "string";
          const isActive = location.pathname === item.path;

          // 1. Varsayılan boyut (Lucide ikonları için): w-6 h-6
          let iconSizeClasses = `w-6 h-6`;

          // 2. Eğer ikon rock.svg ise, boyutu w-8 h-8 olarak özelleştirin
          if (item.id === "boosters" && isSvgPath) {
            iconSizeClasses = `w-8 h-8`; // Özel boyut burada!
          }

          // Ortak sınıfları ekleyin
          const iconClasses = `${iconSizeClasses} mb-1 transition-transform duration-300 ${
            isActive ? "scale-110" : ""
          }`;

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
              {isSvgPath ? (
                // SVG için <img> etiketi (Özel boyut bu kısma yansıyor)
                <img src={Icon} alt={item.label} className={iconClasses} />
              ) : (
                // Bileşen ikonları (Lucide) (Varsayılan boyutta kalıyor)
                <Icon className={iconClasses} />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
