import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { updateDisplayRocks } from "../redux/slices/userSlice";

/**
 * Global rock counter hook
 * Runs continuously across all pages and updates Redux every 2 seconds
 * Uses requestAnimationFrame for accurate time tracking
 * Compensates for time when app is in background
 */
export const useGlobalRockCounter = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const hilti = useSelector((state: RootState) => state.hilti);

  const rafIdRef = useRef<number | null>(null);
  const lastSnapshotRef = useRef(Date.now());
  const accumulatedRocksRef = useRef(0);
  const isActiveRef = useRef(true);
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Calculate total profit per hour
    const totalProfitPerHour =
      user.game_data.profit_per_hour + hilti.current_hilti.rock_income;
    const rocksPerSecond = totalProfitPerHour / 3600;

    if (totalProfitPerHour <= 0) return;

    const animate = () => {
      if (!isActiveRef.current) return;

      const now = Date.now();
      const deltaTime = (now - lastSnapshotRef.current) / 1000;

      // Accumulate rocks in memory
      accumulatedRocksRef.current += rocksPerSecond * deltaTime;
      lastSnapshotRef.current = now;

      // Update Redux every 2 seconds
      if (accumulatedRocksRef.current >= rocksPerSecond * 2) {
        const newDisplayRocks = user.displayRocks + accumulatedRocksRef.current;
        dispatch(updateDisplayRocks(newDisplayRocks));
        accumulatedRocksRef.current = 0; // Reset accumulator
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    isActiveRef.current = true;
    lastSnapshotRef.current = Date.now();
    accumulatedRocksRef.current = 0;
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      isActiveRef.current = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    dispatch,
    user.game_data.profit_per_hour,
    hilti.current_hilti.rock_income,
    user.displayRocks,
  ]);

  // Handle visibility change with time compensation
  useEffect(() => {
    const handleVisibilityChange = () => {
      const totalProfitPerHour =
        user.game_data.profit_per_hour + hilti.current_hilti.rock_income;
      const rocksPerSecond = totalProfitPerHour / 3600;

      if (document.hidden) {
        // Tab hidden - save current time and pause
        hiddenTimeRef.current = Date.now();
        isActiveRef.current = false;
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
      } else {
        // Tab visible again - calculate rocks earned while hidden
        if (hiddenTimeRef.current !== null) {
          const now = Date.now();
          const elapsedSeconds = (now - hiddenTimeRef.current) / 1000;
          const missedRocks = elapsedSeconds * rocksPerSecond;

          // Add missed rocks to display
          if (missedRocks > 0) {
            const newDisplayRocks = user.displayRocks + missedRocks;
            dispatch(updateDisplayRocks(newDisplayRocks));
            console.log(
              `Compensated ${missedRocks.toFixed(
                2
              )} rocks for ${elapsedSeconds.toFixed(0)}s background time`
            );
          }

          hiddenTimeRef.current = null;
        }

        // Resume counter
        isActiveRef.current = true;
        lastSnapshotRef.current = Date.now();
        accumulatedRocksRef.current = 0;
        rafIdRef.current = requestAnimationFrame(() => {
          // Trigger animation loop restart
          const animate = () => {
            if (!isActiveRef.current) return;

            const now = Date.now();
            const deltaTime = (now - lastSnapshotRef.current) / 1000;

            accumulatedRocksRef.current += rocksPerSecond * deltaTime;
            lastSnapshotRef.current = now;

            if (accumulatedRocksRef.current >= rocksPerSecond * 2) {
              const newDisplayRocks =
                user.displayRocks + accumulatedRocksRef.current;
              dispatch(updateDisplayRocks(newDisplayRocks));
              accumulatedRocksRef.current = 0;
            }

            rafIdRef.current = requestAnimationFrame(animate);
          };
          animate();
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    dispatch,
    user.displayRocks,
    user.game_data.profit_per_hour,
    hilti.current_hilti.rock_income,
  ]);
};
