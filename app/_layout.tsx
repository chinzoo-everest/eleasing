import AppInitializer from '@components/AppInitializer';
import InactivityWrapper from '@components/inActiveChecker';
import ToastConfig from '@components/ToastConfig';
import {GlobalProvider} from '@context/GlobalContext';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../assets/global.css';

// Add the logger configuration before the layout component
configureReanimatedLogger({
  level: ReanimatedLogLevel.error, // This will only show errors, not warnings
  strict: false, // This disables strict mode
});

export default function RootLayout() {
  return (
    <GlobalProvider>
      <AppInitializer>
        <InactivityWrapper>
          <StatusBar translucent style="light" />
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="(tabs)" options={{gestureEnabled: false}} />
          </Stack>
          <Toast config={ToastConfig} />
        </InactivityWrapper>
      </AppInitializer>
    </GlobalProvider>
  );
}
