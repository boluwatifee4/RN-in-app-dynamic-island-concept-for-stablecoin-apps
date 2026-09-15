import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { GlowBadge } from '../../../components/ui/GlowBadge';
import { RemittanceFXData } from '../../../constants/types';
import { FIAT_REMITTANCE_PAIRS } from '../../../constants/currencies';

interface FlippableCard3DProps {
  data: RemittanceFXData;
  amount: number;
  payoutTotal: string;
  onCardPress: () => void;
  frontAnimatedStyle: any;
  backAnimatedStyle: any;
}

export const FlippableCard3D = memo(function FlippableCard3D({
  data,
  amount,
  payoutTotal,
  onCardPress,
  frontAnimatedStyle,
  backAnimatedStyle,
}: FlippableCard3DProps) {
  const fiatInfo = FIAT_REMITTANCE_PAIRS[data.fiatCurrency] || FIAT_REMITTANCE_PAIRS.NGN;

  return (
    <Pressable onPress={onCardPress} style={styles.cardStage}>
      {/* FRONT: Metallic Cyber Digital Dollar Vault Card */}
      <Animated.View style={[styles.flipCard, frontAnimatedStyle]}>
        <LinearGradient
          colors={['#0B1B3D', '#0A2552', '#004085']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardNetworkTag}>DIGITAL DOLLAR VAULT</Text>
            <Text style={styles.cardChip}>USDC BASE</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardAmountLabel}>Sending Balance</Text>
            <Text style={styles.cardAmountValue}>${amount.toFixed(2)} {data.senderCurrency}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardHolder}>AETHER PROTOCOL</Text>
            <Text style={styles.flipPrompt}>Tap to flip for Bank Payout ➔</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* BACK: Emerald Local Bank Payout Destination Card */}
      <Animated.View style={[styles.flipCard, backAnimatedStyle]}>
        <LinearGradient
          colors={['#051F15', '#0A3B28', '#0D5438']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardNetworkTag}>{fiatInfo.flag} {data.recipientBank.toUpperCase()}</Text>
            <GlowBadge label="INSTANT RAIL" variant="emerald" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardAmountLabel}>Guaranteed Local Payout</Text>
            <Text style={[styles.cardAmountValue, { color: COLORS.emerald }]}>
              {fiatInfo.symbol}{payoutTotal} {data.fiatCurrency}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.bankAccount}>{data.recipientName}</Text>
              <Text style={styles.accountNumber}>{data.accountNumber}</Text>
            </View>
            <Text style={styles.flipPrompt}>Tap to return ➔</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardStage: {
    height: 165,
    width: '100%',
    position: 'relative',
  },
  flipCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 8,
  },
  gradientCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNetworkTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  cardChip: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  cardBody: {
    marginVertical: 4,
  },
  cardAmountLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  cardAmountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  bankAccount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  accountNumber: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: COLORS.textTertiary,
  },
  flipPrompt: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});
