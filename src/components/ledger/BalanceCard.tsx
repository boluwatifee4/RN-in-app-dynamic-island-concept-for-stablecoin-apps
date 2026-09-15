import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { FIAT_REMITTANCE_PAIRS } from '../../constants/currencies';
import { getCachedRate } from '../../services/fxService';
import { GlowBadge } from '../ui/GlowBadge';
import * as Haptics from 'expo-haptics';

interface BalanceCardProps {
  totalUsd: number;
}

export function BalanceCard({ totalUsd }: BalanceCardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'NGN' | 'EUR' | 'KES' | 'BRL'>('USD');

  const currencies = ['USD', 'NGN', 'EUR', 'KES', 'BRL'] as const;

  const currentRate = selectedCurrency === 'USD' ? 1 : getCachedRate(selectedCurrency);
  const convertedTotal = (totalUsd * currentRate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencySymbol =
    selectedCurrency === 'USD'
      ? '$'
      : FIAT_REMITTANCE_PAIRS[selectedCurrency]?.symbol || '';

  const handleCurrencyChange = (curr: typeof selectedCurrency) => {
    Haptics.selectionAsync();
    setSelectedCurrency(curr);
  };

  return (
    <View style={styles.container}>
      {/* Top Tag Row */}
      <View style={styles.topRow}>
        <View style={styles.statusGroup}>
          <Text style={styles.label}>TOTAL DIGITAL DOLLARS</Text>
          <GlowBadge label="MPC VAULT" variant="emerald" />
        </View>

        {/* Currency Switcher Chips */}
        <View style={styles.currencySwitch}>
          {currencies.map((curr) => {
            const isSelected = selectedCurrency === curr;
            return (
              <TouchableOpacity
                key={curr}
                activeOpacity={0.7}
                onPress={() => handleCurrencyChange(curr)}
                style={[
                  styles.currencyChip,
                  isSelected && styles.currencyChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.currencyChipText,
                    isSelected && styles.currencyChipTextSelected,
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Big Balance */}
      <View style={styles.amountContainer}>
        <Text style={styles.symbol}>{currencySymbol}</Text>
        <Text style={styles.amount}>{convertedTotal}</Text>
        <Text style={styles.currencyCode}>{selectedCurrency}</Text>
      </View>

      {/* Footer Metrics */}
      <View style={styles.footerRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Peg Health</Text>
          <Text style={[styles.metricValue, { color: COLORS.emerald }]}>
            1.0000 USD (100% Backed)
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Live APY</Text>
          <Text style={[styles.metricValue, { color: COLORS.cyan }]}>
            +5.32% Auto-Compounding
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.xl,
    padding: 24,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  currencySwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    padding: 2,
  },
  currencyChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  currencyChipSelected: {
    backgroundColor: COLORS.surfaceElevated,
  },
  currencyChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textTertiary,
  },
  currencyChipTextSelected: {
    color: COLORS.emerald,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  symbol: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceGlassBorder,
    paddingTop: 12,
  },
  metric: {
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
