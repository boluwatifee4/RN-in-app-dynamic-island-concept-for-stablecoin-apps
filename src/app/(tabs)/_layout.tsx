import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../design-system/tokens/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { focused: IoniconsName; default: IoniconsName }> = {
  index: { focused: 'wallet', default: 'wallet-outline' },
  send: { focused: 'paper-plane', default: 'paper-plane-outline' },
  bridge: { focused: 'git-compare', default: 'git-compare-outline' },
  fx: { focused: 'swap-horizontal', default: 'swap-horizontal-outline' },
  yield: { focused: 'trending-up', default: 'trending-up-outline' },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? TAB_ICONS.index.focused : TAB_ICONS.index.default}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? TAB_ICONS.send.focused : TAB_ICONS.send.default}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bridge"
        options={{
          title: 'Bridge',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? TAB_ICONS.bridge.focused : TAB_ICONS.bridge.default}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fx"
        options={{
          title: 'FX',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? TAB_ICONS.fx.focused : TAB_ICONS.fx.default}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="yield"
        options={{
          title: 'Yield',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? TAB_ICONS.yield.focused : TAB_ICONS.yield.default}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.surfaceGlassBorder,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
