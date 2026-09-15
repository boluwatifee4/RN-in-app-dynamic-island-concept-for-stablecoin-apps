import React, { useState, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { FIAT_REMITTANCE_PAIRS } from '../../../constants/currencies';
import { RemittanceFXData } from '../../../constants/types';
import { GlowBadge } from '../../../components/ui/GlowBadge';
import { useCardFlipAnimation } from '../hooks/useCardFlipAnimation';
import { useRateLockTimer } from '../hooks/useRateLockTimer';
import { FlippableCard3D } from './FlippableCard3D';
import { QuickAmountSelector } from './QuickAmountSelector';

interface RemittanceFXPanelProps {
  data: RemittanceFXData;
  onConfirmPayout?: () => void;
  onDismiss?: () => void;
}

export const RemittanceFXPanel = memo(function RemittanceFXPanel({
  data,
}: RemittanceFXPanelProps) {
  const [amount, setAmount] = useState(data.senderAmount);
  const secondsRemaining = useRateLockTimer(data.rateLockedSeconds || 30);

  const {
    toggleFlip,
    frontAnimatedStyle,
    backAnimatedStyle,
  } = useCardFlipAnimation();

  const fiatInfo = FIAT_REMITTANCE_PAIRS[data.fiatCurrency] || FIAT_REMITTANCE_PAIRS.NGN;
  const payoutTotal = (amount * data.exchangeRate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Global FX Remittance</Text>
          <Text style={styles.subtitle}>
            1 {data.senderCurrency} = {fiatInfo.symbol}{data.exchangeRate.toFixed(2)} {data.fiatCurrency}
          </Text>
        </View>
        <GlowBadge
          label={`Lock: ${secondsRemaining}s`}
          variant="amber"
        />
      </View>

      {/* 3D Flippable Card Stage */}
      <FlippableCard3D
        data={data}
        amount={amount}
        payoutTotal={payoutTotal}
        onCardPress={toggleFlip}
        frontAnimatedStyle={frontAnimatedStyle}
        backAnimatedStyle={backAnimatedStyle}
      />

      {/* Quick Amount Selector */}
      <QuickAmountSelector
        selectedAmount={amount}
        onSelectAmount={setAmount}
      />

      {/* Rail Guarantee info */}
      <View style={styles.guaranteeRow}>
        <Text style={styles.guaranteeLabel}>Settlement Speed:</Text>
        <Text style={styles.guaranteeValue}>{data.payoutSpeed} (Direct API)</Text>
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
  guaranteeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  guaranteeLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  guaranteeValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
