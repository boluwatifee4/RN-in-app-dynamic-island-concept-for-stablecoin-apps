import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { BlockchainNetwork } from '../../../constants/chains';
import * as Haptics from 'expo-haptics';

interface PaymasterToggleCardProps {
  destNetwork: BlockchainNetwork;
  paymasterActive: boolean;
  onTogglePaymaster: () => void;
}

export const PaymasterToggleCard = memo(function PaymasterToggleCard({
  destNetwork,
  paymasterActive,
  onTogglePaymaster,
}: PaymasterToggleCardProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onTogglePaymaster();
  };

  return (
    <View style={styles.feeCard}>
      <View style={styles.feeInfo}>
        <Text style={styles.feeLabel}>Network Gas Fee</Text>
        <Text style={styles.feeValue}>
          {paymasterActive ? (
            <Text style={{ color: COLORS.emerald }}>$0.00 (Gasless Paymaster)</Text>
          ) : (
            `$${destNetwork.avgFeeUsd.toFixed(4)} USD`
          )}
        </Text>
      </View>

      <Pressable
        onPress={handlePress}
        style={[
          styles.paymasterToggle,
          paymasterActive && styles.paymasterActive,
        ]}
      >
        <Text style={[styles.paymasterText, paymasterActive && { color: '#000' }]}>
          {paymasterActive ? '0-Gas Active' : 'Enable Paymaster'}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  feeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  feeInfo: {
    gap: 2,
  },
  feeLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  paymasterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  paymasterActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  paymasterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
