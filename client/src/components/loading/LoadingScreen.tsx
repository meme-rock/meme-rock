import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLoadingMutation } from "../../redux/services/user/user-api";
import { IUser } from "../../types";
import WebApp from "@twa-dev/sdk";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [loadingMutation] = useLoadingMutation();

  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const telegramUser = WebApp.initDataUnsafe.user;
        if (telegramUser) {
          const { id, is_premium, ...rest } = telegramUser;
          const user = {
            _id: id.toString(),
            telegram_data: {
              ...rest,
              is_telegram_premium: is_premium,
            },
          };
          // Redux RTK Query ile loading mutation'ını çağır
          await loadingMutation({
            user: user as unknown as Partial<IUser>,
          }).unwrap();
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, [loadingMutation]);
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black opacity-90"></div>

      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Logo container with glow effect */}
        <motion.div
          className="relative mb-8"
          animate={{
            filter: [
              "drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))",
              "drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))",
              "drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src="/rock-miner.svg"
            alt="Rock Miner"
            className="w-28 h-28 filter brightness-110"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Title with enhanced typography */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-2 tracking-tight">
            MEME ROCK
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-32 mx-auto"
          />
        </motion.div>

        {/* Enhanced progress bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
          className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden mb-6"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full"
          />
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px rgba(251, 191, 36, 0.5)",
                "0 0 20px rgba(251, 191, 36, 0.8)",
                "0 0 10px rgba(251, 191, 36, 0.5)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          />
        </motion.div>

        {/* Loading text with fade animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          className="text-center"
        >
          <motion.p
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-gray-300 text-lg font-medium mb-1"
          >
            Initializing Mining Operation
          </motion.p>
          <motion.p
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="text-gray-500 text-sm"
          >
            Connecting to blockchain...
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
