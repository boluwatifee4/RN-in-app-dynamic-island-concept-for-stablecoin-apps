import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { NETWORKS } from '../../../constants/chains';
import * as Haptics from 'expo-haptics';

interface ChainSelectorGridProps {
  selectedChain: string;
  onSelectChain: (chainKey: string) => void;
}

const AVAILABLE_CHAINS = ['solana', 'arbitrum', 'polygon', 'ethereum'] as const;

export const ChainSelectorGrid = memo(function ChainSelectorGrid({
  selectedChain,
  onSelectChain,
}: ChainSelectorGridProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Destination Chain</Text>
      <View style={styles.chainRow}>
        {AVAILABLE_CHAINS.map((chainKey) => {
          const isSelected = selectedChain === chainKey;
          const net = NETWORKS[chainKey];
          return (
            <TouchableOpacity
              key={chainKey}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectChain(chainKey);
              }}
              style={[
                styles.chainButton,
                isSelected && {
                  borderColor: net.color,
                  backgroundColor: `${net.color}25`,
                },
              ]}
            >
              <View style={[styles.chainDot, { backgroundColor: net.color }]} />
              <Text
                style={[
                  styles.chainButtonText,
                  isSelected && { color: COLORS.textPrimary, fontWeight: '700' },
                ]}
              >
                {net.shortName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chainRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 6,
  },
  chainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chainButtonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
