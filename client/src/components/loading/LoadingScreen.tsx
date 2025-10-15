import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLoadingMutation } from "../../redux/services/user/user-api";
import { IUser } from "../../types";
import WebApp from "@twa-dev/sdk";
import { preloadAssetsWithProgress } from "../../utils/preloadAssets";

interface LoadingScreenProps {
  onComplete: () => void;
}

type LoadingState = "loading" | "success" | "error";

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [loadingMutation] = useLoadingMutation();
  const hasLoadedRef = useRef(false);
  const hasPreloadedRef = useRef(false);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [progress, setProgress] = useState(0);
  const [assetsProgress, setAssetsProgress] = useState(0);
  const minLoadTimeRef = useRef<number>(Date.now());

  // Preload assets with progress tracking
  useEffect(() => {
    if (hasPreloadedRef.current) return;
    hasPreloadedRef.current = true;

    preloadAssetsWithProgress((loaded, total) => {
      const percentage = (loaded / total) * 100;
      setAssetsProgress(percentage);
      console.log(
        `Assets loaded: ${loaded}/${total} (${percentage.toFixed(0)}%)`
      );
    });
  }, []);

  // Update progress based on assets and data loading
  useEffect(() => {
    // Combine assets progress (50% weight) with simulated progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = Math.min(assetsProgress * 0.5 + prev * 0.5, 90);
        if (prev >= targetProgress) return prev;
        return prev + Math.random() * 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [assetsProgress]);

  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedRef.current) {
      console.log("User already loaded, skipping...");
      return;
    }

    const loadUser = async () => {
      try {
        hasLoadedRef.current = true;
        setLoadingState("loading");

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

          console.log("Loading user:", id);

          // Call loading mutation
          await loadingMutation({
            user: user as unknown as Partial<IUser>,
          }).unwrap();

          console.log("User loaded successfully");
          setLoadingState("success");
          setProgress(100);

          // Check if minimum time (3s) has elapsed
          const elapsed = Date.now() - minLoadTimeRef.current;
          const remainingTime = Math.max(0, 3000 - elapsed);

          // Wait for remaining time + brief pause
          setTimeout(() => {
            onComplete();
          }, remainingTime + 500);
        } else {
          throw new Error("No Telegram user data available");
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setLoadingState("error");
        hasLoadedRef.current = false;

        // Retry after 2 seconds
        setTimeout(() => {
          setLoadingState("loading");
          setProgress(0);
          hasLoadedRef.current = false;
        }, 2000);
      }
    };

    loadUser();
  }, [loadingMutation, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-950 via-gray-950 to-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated floating rocks */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.img
            key={i}
            src="/rock.svg"
            alt=""
            className="absolute"
            style={{
              width: `${20 + Math.random() * 30}px`,
              filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))",
            }}
            initial={{
              x: `${Math.random() * 100}%`,
              y: "120%",
              rotate: Math.random() * 360,
              opacity: 0,
            }}
            animate={{
              y: ["-20%", "-120%"],
              rotate: [null, Math.random() * 360 + 360],
              opacity: [0, 0.15, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center px-8"
      >
        {/* Main rock logo with orbital rocks */}
        <div className="relative w-48 h-48 mb-8">
          {/* Orbital ring */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Orbital rocks */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-70px)`,
                }}
              >
                <motion.img
                  src="/rock.svg"
                  alt=""
                  className="w-8 h-8"
                  animate={{
                    scale: [1, 1.2, 1],
                    filter: [
                      "drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))",
                      "drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))",
                      "drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Center rock with glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glow effect */}
            <motion.div
              className="absolute w-32 h-32 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 40px 20px rgba(168, 85, 247, 0.2)",
                  "0 0 60px 30px rgba(168, 85, 247, 0.4)",
                  "0 0 40px 20px rgba(168, 85, 247, 0.2)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main rock */}
            <motion.img
              src="/rock.svg"
              alt="Rock"
              className="relative w-28 h-28 z-10"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
                filter: [
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))",
                  "drop-shadow(0 0 30px rgba(168, 85, 247, 0.9))",
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2 tracking-tight">
            MEME ROCK
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-sm mb-8 font-medium tracking-wider"
        >
          MINE • COLLECT • EARN
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 280 }}
          transition={{ delay: 0.8 }}
          className="mb-4"
        >
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-purple-900/50">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full relative overflow-hidden"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>Loading data...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </motion.div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          {loadingState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.p
                className="text-purple-300 text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Preparing your mining operation...
              </motion.p>
              {/* Loading dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          {loadingState === "success" && (
            <motion.p
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-green-400 text-sm font-bold flex items-center gap-2"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                ✨
              </motion.span>
              Ready to mine!
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ duration: 0.5 }}
              >
                🚀
              </motion.span>
            </motion.p>
          )}
          {loadingState === "error" && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm font-medium"
            >
              Connection failed. Retrying...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <p className="text-gray-600 text-xs">Powered by Deep DApp</p>
        <motion.div
          className="flex gap-1"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-purple-500/50 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
