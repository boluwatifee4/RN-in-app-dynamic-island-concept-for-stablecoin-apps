import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../design-system/tokens/colors';
import { BalanceCard } from '../../components/ledger/BalanceCard';
import { QuickActionGrid } from '../../components/ledger/QuickActionGrid';
import { AssetList } from '../../components/ledger/AssetList';
import { ActivityFeed } from '../../components/ledger/ActivityFeed';
import { LiveRpcStatusBadge } from '../../components/ledger/LiveRpcStatusBadge';
import { GlowBadge } from '../../components/ui/GlowBadge';
import { DepegWarningBanner } from '../../components/ui/DepegWarningBanner';
import { useStableStore } from '../../store/useStableStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const totalUsdBalance = useStableStore((s) => s.totalUsdBalance);

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>AETHER</Text>
          <Text style={styles.handle}>@alex.vault · Non-Custodial MPC</Text>
        </View>
        <GlowBadge label="BASE SETTLEMENT" variant="cyan" />
      </View>

      <DepegWarningBanner />
      <LiveRpcStatusBadge />
      <BalanceCard totalUsd={totalUsdBalance} />
      <QuickActionGrid />
      <AssetList />
      <ActivityFeed />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.2,
  },
  handle: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});
