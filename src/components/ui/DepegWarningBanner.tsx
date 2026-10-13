import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { DEPEG_THRESHOLDS, getIsHalted } from '../../services/marketService';
import { useStableStore } from '../../store/useStableStore';

function formatAge(lastUpdated: number | null): string | null {
  if (!lastUpdated) return null;
  const mins = Math.max(0, Math.round((Date.now() - lastUpdated) / 60000));
  if (mins < 1) return 'just now';
  return `${mins}m ago`;
}

export function DepegWarningBanner() {
  // Market data is polled app-wide in _layout.tsx (30s) and shared with the
  // send/bridge/fx/yield submission guards via the same store slice.
  const marketData = useStableStore((s) => s.marketData);
  const marketStale = useStableStore((s) => s.marketStale);
  const marketLastUpdated = useStableStore((s) => s.marketLastUpdated);

  if (!marketData) return null;

  // Feed unreachable — same treatment as the RPC badge: never present
  // last-known prices as a verified peg.
  if (marketStale) {
    const age = formatAge(marketLastUpdated);
    return (
      <View style={[styles.banner, styles.bannerWarning]}>
        <Ionicons name="cloud-offline" size={16} color={COLORS.amber} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: COLORS.amber }]}>PEG MONITOR OFFLINE</Text>
          <Text style={styles.bannerBody}>
            Price feed unreachable — peg unverified{age ? ` (last success: ${age})` : ''}
          </Text>
        </View>
      </View>
    );
  }

  const depegged = Object.values(marketData).filter(
    (coin) => Math.abs(coin.pegDeviationPercent) >= DEPEG_THRESHOLDS.warning
  );

  if (depegged.length === 0) return null;

  const worstDeviation = depegged.reduce((worst, coin) =>
    Math.abs(coin.pegDeviationPercent) > Math.abs(worst.pegDeviationPercent) ? coin : worst
  );

  const isCritical = Math.abs(worstDeviation.pegDeviationPercent) >= DEPEG_THRESHOLDS.critical;
  // Submission guards on every screen check USDC only — claim a halt only when USDC is halted
  const usdcHalted = getIsHalted(marketData, 'USDC');

  return (
    <View style={[styles.banner, isCritical ? styles.bannerCritical : styles.bannerWarning]}>
      <Ionicons
        name={usdcHalted ? 'alert-circle' : 'warning'}
        size={16}
        color={isCritical ? COLORS.rose : COLORS.amber}
      />
      <View style={styles.bannerText}>
        <Text style={[styles.bannerTitle, { color: isCritical ? COLORS.rose : COLORS.amber }]}>
          {usdcHalted ? 'DEPEG ALERT' : 'PEG DEVIATION'}
        </Text>
        <Text style={styles.bannerBody}>
          {worstDeviation.symbol} at ${worstDeviation.priceUsd.toFixed(4)} (
          {worstDeviation.pegDeviationPercent > 0 ? '+' : ''}
          {worstDeviation.pegDeviationPercent.toFixed(2)}%)
        </Text>
        {usdcHalted && (
          <Text style={styles.bannerHalt}>
            Transactions temporarily halted for USDC — submissions are disabled until the peg recovers
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
  },
  bannerWarning: {
    backgroundColor: `${COLORS.amber}10`,
    borderColor: `${COLORS.amber}30`,
  },
  bannerCritical: {
    backgroundColor: `${COLORS.rose}10`,
    borderColor: `${COLORS.rose}30`,
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  bannerHalt: {
    fontSize: 11,
    color: COLORS.rose,
    fontWeight: '600',
    marginTop: 4,
  },
});
