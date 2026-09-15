import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { YieldStreamData } from '../../../constants/types';
import { GlowBadge } from '../../../components/ui/GlowBadge';
import { useMicroYieldTicker } from '../hooks/useMicroYieldTicker';
import { CompoundingHorizonSelector, HorizonOption } from './CompoundingHorizonSelector';
import * as Haptics from 'expo-haptics';

interface YieldStreamPanelProps {
  data: YieldStreamData;
  onHarvest?: () => void;
  onDismiss?: () => void;
}

export const YieldStreamPanel = memo(function YieldStreamPanel({
  data,
}: YieldStreamPanelProps) {
  const [selectedHorizon, setSelectedHorizon] = useState<HorizonOption>('1Y');
  const [harvested, setHarvested] = useState(false);

  const { liveAccrued, resetYield } = useMicroYieldTicker(
    data.depositedAmount,
    data.apy,
    data.currentYieldAccrued
  );

  const horizonMultipliers = {
    '1M': 1 / 12,
    '6M': 0.5,
    '1Y': 1,
    '5Y': 5,
  };

  const projectedInterest =
    data.depositedAmount * (data.apy / 100) * horizonMultipliers[selectedHorizon];

  const handleHarvest = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHarvested(true);
    setTimeout(() => {
      setHarvested(false);
      resetYield();
    }, 1500);
  }, [resetYield]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{data.vaultName}</Text>
          <Text style={styles.subtitle}>
            ${data.depositedAmount.toLocaleString()} {data.asset} deposited in {data.protocol}
          </Text>
        </View>
        <GlowBadge
          label={`+${data.apy.toFixed(2)}% APY`}
          variant="emerald"
        />
      </View>

      {/* Live Micro-Yield Ticker Stage */}
      <View style={styles.tickerCard}>
        <View style={styles.tickerHeader}>
          <Text style={styles.tickerLabel}>LIVE ACCRUED YIELD (STREAMING)</Text>
          <View style={styles.pulseDot} />
        </View>
        <Text style={styles.tickerValue}>
          +${liveAccrued.toFixed(6)}{' '}
          <Text style={styles.tickerCurrency}>{data.asset}</Text>
        </Text>
        <Text style={styles.dailyStat}>
          Generating ~${data.dailyYieldUsd.toFixed(2)} / day automatically
        </Text>
      </View>

      {/* Interactive Horizon Compounding Projection */}
      <CompoundingHorizonSelector
        selectedHorizon={selectedHorizon}
        onSelectHorizon={setSelectedHorizon}
        projectedInterest={projectedInterest}
        asset={data.asset}
      />

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={handleHarvest}
          style={[styles.harvestButton, harvested && styles.harvestButtonSuccess]}
        >
          <Text style={styles.harvestText}>
            {harvested ? 'Harvested & Compounding' : 'Harvest & Auto-Compound'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tickerCard: {
    backgroundColor: '#092117',
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 157, 0.3)',
    shadowColor: '#00F29D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    gap: 4,
  },
  tickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    letterSpacing: 0.5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },
  tickerValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  tickerCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dailyStat: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
  },
  harvestButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
  },
  harvestButtonSuccess: {
    backgroundColor: '#059669',
  },
  harvestText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
});
