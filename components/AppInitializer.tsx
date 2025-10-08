import {shouldSkipOnboarding} from '@utils/onboardingUtils';
import {Href, router, usePathname} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {SCREENS} from '../config/route';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({children}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only run initialization once and only if we're on the root path
    if (hasInitialized.current || pathname !== '/') {
      return;
    }

    const initializeApp = async () => {
      try {
        hasInitialized.current = true;

        const shouldSkip = await shouldSkipOnboarding();

        if (shouldSkip) {
          // Skip onboarding and go directly to login
          await router.replace(SCREENS.LOGIN as Href);
        }
      } catch (error) {
        // Default to showing onboarding on error - no navigation needed
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [pathname]);

  // Show loading screen while initializing
  if (!isInitialized && pathname === '/') {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <View className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
