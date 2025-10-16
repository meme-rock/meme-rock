import { useEffect, useRef } from "react";

interface AdsgramAdComponentProps {
  blockId: string; // Format: "task-X" where X is a decimal number (e.g., "task-1234")
  onReward?: () => void;
  onError?: () => void;
  debug?: boolean;
}

/**
 * Adsgram Web Component Wrapper
 * Uses @adsgram/react package's web component
 *
 * @param blockId - Adsgram block ID in format "task-X" (e.g., "task-1234")
 * @param onReward - Callback when user completes ad and receives reward
 * @param onError - Callback when ad fails to load or show
 * @param debug - Enable debug mode (shows console logs)
 */
export const AdsgramAdComponent = ({
  blockId,
  onReward,
  onError,
  debug = false,
}: AdsgramAdComponentProps) => {
  const taskRef = useRef<HTMLElement>(null);

  // Validate block ID format
  useEffect(() => {
    if (blockId && !blockId.match(/^task-\d+$/)) {
      console.warn(
        `⚠️ Adsgram block ID should be in format "task-X" where X is a number. Current: "${blockId}"`
      );
    }
  }, [blockId]);

  useEffect(() => {
    // Listen for custom show event
    const handleShowAd = (event: CustomEvent) => {
      if (event.detail.blockId === blockId && taskRef.current) {
        // Trigger ad show by dispatching click event
        taskRef.current.click();
      }
    };

    window.addEventListener(
      "show-adsgram" as any,
      handleShowAd as EventListener
    );

    return () => {
      window.removeEventListener(
        "show-adsgram" as any,
        handleShowAd as EventListener
      );
    };
  }, [blockId]);

  useEffect(() => {
    const element = taskRef.current;
    if (!element) return;

    // Set up event listeners for Adsgram events
    const handleReward = () => {
      console.log("✅ Adsgram: Reward received");
      onReward?.();
    };

    const handleError = () => {
      console.error("❌ Adsgram: Error occurred");
      onError?.();
    };

    // Add event listeners
    element.addEventListener("onReward", handleReward as EventListener);
    element.addEventListener("onError", handleError as EventListener);

    return () => {
      element.removeEventListener("onReward", handleReward as EventListener);
      element.removeEventListener("onError", handleError as EventListener);
    };
  }, [onReward, onError]);

  return (
    // @ts-ignore - Adsgram web component
    <adsgram-task
      ref={taskRef}
      data-block-id={blockId}
      data-debug={debug.toString()}
      data-debug-console="false"
      className="hidden"
      style={{ display: "none" }}
    />
  );
};
