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
    <div className="fixed inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a] flex flex-col items-center justify-center z-50 overflow-hidden font-sans">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('/dust.svg')] bg-repeat opacity-5 pointer-events-none mix-blend-overlay"></div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-8 w-full max-w-xs"
      >
        {/* Main rock logo with floating effect */}
        <div className="relative w-48 h-48 mb-12">
          <motion.img
            src="/rock.svg"
            alt="Rock"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-200 mb-2 tracking-tighter uppercase drop-shadow-lg">
            Meme Rock
          </h1>
          <p className="text-blue-400 text-sm font-bold tracking-[0.2em] uppercase">
            Let's Rock The Chain
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-4">
          <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Loading...</span>
            <span className="text-blue-400">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Status message */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {loadingState === "loading" && (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-400 text-xs font-bold uppercase tracking-wide"
              >
                Preparing...
              </motion.p>
            )}
            {loadingState === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 text-xs font-black uppercase tracking-wide flex items-center gap-2"
              >
                <span>Ready!</span>
              </motion.p>
            )}
            {loadingState === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs font-bold uppercase tracking-wide"
              >
                Connection interrupted...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Simple Footer */}
      <div className="absolute bottom-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest opacity-50">
        Powered by Deep DApp
      </div>
    </div>
  );
};
