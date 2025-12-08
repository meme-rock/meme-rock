import { useState, useEffect } from "react";
import {
  User,
  ShoppingCart,
  Pickaxe,
  Trophy,
  ListTodo,
  LayoutGrid,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Menü açıkken başka bir sayfaya gidilirse menüyü kapat
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // 1. SOL TARAFTAKİLER (Mine, Rock)
  const leftItems = [
    { id: "mine", label: "Mine", icon: Pickaxe, path: "/mine" },
    { id: "rock", label: "Rock", icon: "/jackhammer.svg", path: "/rock" },
  ];

  // 2. ORTA (Ana Buton - Main)
  const centerItem = {
    id: "main",
    label: "Main",
    icon: "/rock.svg",
    path: "/",
  };

  const isMainActive = location.pathname === centerItem.path;

  // 3. SAĞ TARAFTAKİLER (Ranks) + MENU BUTONU
  const rightItems = [
    {
      id: "leaderboard-2",
      label: "Ranks",
      icon: Trophy,
      path: "/leaderboard-2",
    },
  ];

  // 4. MENÜ İÇİNDEKİLER (Task, Market, Profile)
  const menuItems = [
    { id: "task", label: "Task", icon: ListTodo, path: "/task" },
    { id: "market", label: "Market", icon: ShoppingCart, path: "/market" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  // Yardımcı Fonksiyon: Buton Renderlama
  const renderNavItem = (item: any, isMenu: boolean = false) => {
    const Icon = item.icon;
    const isSvgPath = typeof Icon === "string";
    const isActive = location.pathname === item.path;

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`relative flex flex-col items-center justify-center py-2 px-1 flex-1 group ${
          isMenu
            ? "flex-row gap-2.5 py-2.5 px-3 w-full justify-start hover:bg-white/5 rounded-xl"
            : ""
        }`}
      >
        {/* İKON ALANI */}
        <div
          className={`relative p-1.5 rounded-xl transition-all duration-300 ${
            isActive && !isMenu
              ? "bg-cyan-500/10 text-cyan-400 transform -translate-y-1"
              : isMenu && isActive
              ? "text-cyan-400"
              : "text-slate-500 group-hover:text-slate-300"
          }`}
        >
          {isSvgPath ? (
            <img
              src={Icon}
              alt={item.label}
              className={`transition-all ${
                isMenu ? "w-4.5 h-4.5" : "w-5 h-5"
              } ${
                isActive
                  ? "brightness-125 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]"
                  : "opacity-70 grayscale"
              }`}
            />
          ) : (
            // @ts-ignore
            <Icon
              className={`transition-all ${
                isMenu ? "w-4.5 h-4.5" : "w-5 h-5"
              } ${isActive ? "drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" : ""}`}
            />
          )}
        </div>

        {/* ETİKET ALANI */}
        <span
          className={`font-medium transition-colors duration-300 ${
            isMenu ? "text-xs" : "text-[9px] mt-1"
          } ${
            isActive
              ? "text-cyan-400"
              : "text-slate-500 group-hover:text-slate-300"
          }`}
        >
          {item.label}
        </span>

        {/* Normal Navbar için Aktif Çizgisi */}
        {isActive && !isMenu && (
          <motion.div
            layoutId="navbar-active"
            className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-b-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
          />
        )}
      </button>
    );
  };

  return (
    <>
      {/* 1. MENÜ POPUP */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-4 z-50 w-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 overflow-hidden"
            >
              <div className="flex flex-col gap-0.5">
                {menuItems.map((item) => renderNavItem(item, true))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. NAVBAR GÖVDE */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        <div className="bg-slate-950/95 backdrop-blur-xl border-t border-white/5 pb-safe-bottom relative">
          <div className="flex items-end justify-between px-2 h-16 max-w-screen-lg mx-auto relative">
            {/* SOL GRUP */}
            <div className="flex-1 flex justify-around items-center h-full pb-1">
              {leftItems.map((item) => renderNavItem(item))}
            </div>

            {/* ORTA - BÜYÜK MAIN BUTONU */}
            <div className="relative -top-6 mx-2 flex-shrink-0 z-20">
              <button
                onClick={() => navigate(centerItem.path)}
                className="group relative w-16 h-16 rounded-full flex items-center justify-center"
              >
                {/* 1. Dış Halka (LED Efekti) 
                    - Aktifse: Cyan Glow (LED yanıyor) ve border yok gibi
                    - Pasifse: Glow yok, sadece koyu çerçeve
                */}
                <div
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                    isMainActive
                      ? "bg-cyan-900/20 border-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)]" // LED YANIYOR
                      : "bg-slate-950 border-slate-950 shadow-none" // LED SÖNÜK
                  }`}
                />

                {/* 2. İç Daire (Arka Plan)
                    - HER ZAMAN: Mavi Gradient (Değişmez)
                */}
                <div className="absolute inset-1.5 rounded-full flex items-center justify-center shadow-inner bg-gradient-to-br from-cyan-500 to-blue-600">
                  {/* 3. İkon */}
                  <img
                    src={centerItem.icon}
                    alt="Main"
                    // w-25 h-20 çok büyüktü, w-10 h-10 (40px) ideal boyuta çekildi.
                    // İkon her zaman net ve parlak, aktifken ekstra parlıyor.
                    className={`w-15 h-15 transition-all duration-300 ${
                      isMainActive
                        ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                        : "brightness-100 opacity-100"
                    }`}
                  />
                </div>

                {/* Alt Etiket (Opsiyonel - İsterseniz silebilirsiniz) */}
                <span
                  className={`absolute -bottom-5 text-[10px] font-bold drop-shadow-md transition-colors duration-300 ${
                    isMainActive ? "text-cyan-400" : "text-slate-600"
                  }`}
                ></span>
              </button>
            </div>

            {/* SAĞ GRUP */}
            <div className="flex-1 flex justify-around items-center h-full pb-1">
              {rightItems.map((item) => renderNavItem(item))}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative flex flex-col items-center justify-center py-2 px-1 flex-1 group"
              >
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                    isMenuOpen
                      ? "bg-slate-800 text-white"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <LayoutGrid className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium mt-1 ${
                    isMenuOpen ? "text-white" : "text-slate-600"
                  }`}
                >
                  More
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
