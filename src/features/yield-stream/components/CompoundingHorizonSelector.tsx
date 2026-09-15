import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import * as Haptics from 'expo-haptics';

export type HorizonOption = '1M' | '6M' | '1Y' | '5Y';

interface CompoundingHorizonSelectorProps {
  selectedHorizon: HorizonOption;
  onSelectHorizon: (horizon: HorizonOption) => void;
  projectedInterest: number;
  asset: string;
}

const HORIZONS: HorizonOption[] = ['1M', '6M', '1Y', '5Y'];

export const CompoundingHorizonSelector = memo(function CompoundingHorizonSelector({
  selectedHorizon,
  onSelectHorizon,
  projectedInterest,
  asset,
}: CompoundingHorizonSelectorProps) {
  return (
    <View style={styles.projectionCard}>
      <View style={styles.projectionHeader}>
        <Text style={styles.projectionTitle}>Projected Growth</Text>
        <Text style={styles.projectionValue}>
          +${projectedInterest.toFixed(2)} {asset}
        </Text>
      </View>

      <View style={styles.horizonRow}>
        {HORIZONS.map((h) => {
          const isSelected = selectedHorizon === h;
          return (
            <TouchableOpacity
              key={h}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectHorizon(h);
              }}
              style={[
                styles.horizonButton,
                isSelected && styles.horizonButtonActive,
              ]}
            >
              <Text style={[styles.horizonText, isSelected && styles.horizonTextActive]}>
                {h}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  projectionCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 10,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  horizonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  horizonButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  horizonButtonActive: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emerald,
  },
  horizonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  horizonTextActive: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
});
