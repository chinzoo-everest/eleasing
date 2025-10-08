import {useCallback, useEffect, useRef} from 'react';
import {
  restoreBrightness as restoreBrightnessUtil,
  setBrightnessForLiveness,
} from '../shared/utils/brightnessUtils';

interface UseBrightnessControlReturn {
  setMaxBrightness: () => Promise<void>;
  restoreBrightness: () => Promise<void>;
}

export const useBrightnessControl = (): UseBrightnessControlReturn => {
  const originalBrightness = useRef<number | null>(null);

  const setMaxBrightness = useCallback(async (): Promise<void> => {
    try {
      // Use the utility function to handle permissions and set brightness
      const storedBrightness = await setBrightnessForLiveness();
      originalBrightness.current = storedBrightness;
    } catch (error) {
      console.error('Error setting max brightness:', error);
    }
  }, []);

  const restoreBrightness = useCallback(async (): Promise<void> => {
    try {
      // Use the utility function to restore brightness
      await restoreBrightnessUtil(originalBrightness.current);
    } catch (error) {
      console.error('Error restoring brightness:', error);
    }
  }, []);

  // Cleanup function to restore brightness when component unmounts
  useEffect(() => {
    return () => {
      restoreBrightness();
    };
  }, [restoreBrightness]);

  return {
    setMaxBrightness,
    restoreBrightness,
  };
};
