import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import * as Haptics from 'expo-haptics';

interface QuickAmountSelectorProps {
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
  amounts?: number[];
}

export const QuickAmountSelector = memo(function QuickAmountSelector({
  selectedAmount,
  onSelectAmount,
  amounts = [100, 250, 500, 1000],
}: QuickAmountSelectorProps) {
  return (
    <View style={styles.amountSelectorRow}>
      {amounts.map((amt) => {
        const isSelected = selectedAmount === amt;
        return (
          <TouchableOpacity
            key={amt}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectAmount(amt);
            }}
            style={[
              styles.amountChip,
              isSelected && styles.amountChipSelected,
            ]}
          >
            <Text style={[styles.amountChipText, isSelected && styles.amountChipTextSelected]}>
              ${amt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  amountSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  amountChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    alignItems: 'center',
  },
  amountChipSelected: {
    backgroundColor: COLORS.emeraldGlow,
    borderColor: COLORS.emerald,
  },
  amountChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  amountChipTextSelected: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
});
