import React, {useEffect} from 'react';
import ReactNativeInactivity from 'react-native-inactivity';
import {BackHandler} from 'react-native';

type Props = {
  children: React.ReactNode;
  isActive?: boolean;
  timeForInactivity?: number;
  onInactive?: () => void;
  restartTimerOnActivityAfterExpiration?: boolean;
  loop?: boolean;
};

/**
 * A fixed wrapper for ReactNativeInactivity that handles BackHandler compatibility issues
 * in newer versions of React Native.
 */
const ReactNativeInactivityFixed = ({
  children,
  isActive = true,
  timeForInactivity = 300000,
  onInactive = () => {},
  restartTimerOnActivityAfterExpiration = true,
  loop = false,
}: Props) => {
  useEffect(() => {
    // Fix for BackHandler.removeEventListener issue
    if (
      typeof BackHandler === 'object' &&
      !('removeEventListener' in BackHandler)
    ) {
      // @ts-ignore - Add the polyfill method expected by the library
      BackHandler.removeEventListener = function (
        eventName: string,
        handler: () => boolean,
      ) {
        console.warn(
          'BackHandler.removeEventListener is deprecated and replaced by the remove() method from addEventListener',
        );
        // No-op implementation that prevents crashing
        return true;
      };
    }
  }, []);

  return (
    <ReactNativeInactivity
      isActive={isActive}
      timeForInactivity={timeForInactivity}
      onInactive={onInactive}
      restartTimerOnActivityAfterExpiration={
        restartTimerOnActivityAfterExpiration
      }
      loop={loop}>
      {children}
    </ReactNativeInactivity>
  );
};

export default ReactNativeInactivityFixed;
