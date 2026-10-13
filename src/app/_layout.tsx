import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../design-system/tokens/colors';
import { StableIsland } from '../components/island/StableIsland';
import { useStableStore } from '../store/useStableStore';

export default function RootLayout() {
  // Single app-wide poller (30s): peg prices feed the depeg banner and the
  // submission guards; FX rates feed the remittance screen and balance converter.
  useEffect(() => {
    const refresh = () => {
      useStableStore.getState().refreshMarketData();
      useStableStore.getState().refreshFxRates();
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>

        {/* Dynamic Island Overlay — renders above all screens */}
        <StableIsland />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
