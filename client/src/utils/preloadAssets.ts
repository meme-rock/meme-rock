/**
 * Preload images and SVG assets for optimal loading experience
 * Returns a promise that resolves when all assets are loaded
 */

const ASSETS_TO_PRELOAD = [
  // Core assets
  "/rock.svg",
  "/rock-miner.svg",
  "/stone.svg",
  "/dust.svg",
  "/ton_symbol.svg",

  // Hiltis
  "/assets/hiltis/hilti-level-1.svg",
  "/assets/hiltis/hilti-level-2.svg",
  "/assets/hiltis/hilti-level-3.svg",
  "/assets/hiltis/hilti-level-4.svg",
  "/assets/hiltis/hilti-level-5.svg",

  // Miners
  "/assets/miners/miner-level-1.svg",
  "/assets/miners/miner-level-2.svg",
  "/assets/miners/miner-level-3.svg",
  "/assets/miners/miner-level-4.svg",
  "/assets/miners/miner-level-5.svg",
];

/**
 * Preload a single image
 */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn(`Failed to preload: ${src}`);
      resolve(); // Resolve anyway to not block other assets
    };
    img.src = src;
  });
};

/**
 * Preload all assets in parallel
 */
export const preloadAssets = async (): Promise<void> => {
  try {
    await Promise.all(ASSETS_TO_PRELOAD.map(preloadImage));
    console.log("✅ All assets preloaded successfully");
  } catch (error) {
    console.error("Error preloading assets:", error);
  }
};

/**
 * Get progress of asset loading
 */
export const preloadAssetsWithProgress = (
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  const total = ASSETS_TO_PRELOAD.length;
  let loaded = 0;

  const trackProgress = (src: string) => {
    return preloadImage(src).then(() => {
      loaded++;
      if (onProgress) {
        onProgress(loaded, total);
      }
    });
  };

  return Promise.all(ASSETS_TO_PRELOAD.map(trackProgress)).then(() => {
    console.log("✅ All assets preloaded successfully");
  });
};
