import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { useStableStore, LedgerItem } from '../../store/useStableStore';
import { NetworkPill } from '../ui/NetworkPill';
import { truncateAddress } from '../../services/rpcService';
import { STABLECOINS } from '../../constants/currencies';
import * as Haptics from 'expo-haptics';

export function ActivityFeed() {
  const ledger = useStableStore((state) => state.ledger);

  const handleCopyHash = (hash?: string) => {
    if (hash) {
      Clipboard.setString(hash);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getTypeIcon = (type: LedgerItem['type']) => {
    switch (type) {
      case 'send': return 'arrow-up-outline';
      case 'receive': return 'arrow-down-outline';
      case 'bridge': return 'swap-horizontal-outline';
      case 'remit': return 'business-outline';
      case 'yield': return 'flash-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>LIVE SETTLEMENT LEDGER</Text>
        <Text style={styles.count}>{ledger.length} On-Chain Events</Text>
      </View>

      <View style={styles.list}>
        {ledger.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => handleCopyHash(item.txHash)}
            style={styles.itemCard}
          >
            <View style={styles.leftCol}>
              <View style={styles.iconCircle}>
                {STABLECOINS[item.currency]?.iconUrl ? (
                  <Image source={{ uri: STABLECOINS[item.currency].iconUrl }} style={styles.txIcon} />
                ) : (
                  <Ionicons name={getTypeIcon(item.type) as any} size={16} color={COLORS.textPrimary} />
                )}
                {item.type === 'receive' && (
                  <View style={styles.actionOverlay}>
                    <Ionicons name="arrow-down" size={8} color={COLORS.emerald} />
                  </View>
                )}
                {item.type === 'send' && (
                  <View style={styles.actionOverlay}>
                    <Ionicons name="arrow-up" size={8} color={COLORS.rose} />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.subRowText} numberOfLines={1}>
                  <Text style={styles.itemSub}>{item.subtitle}</Text>
                  {item.txHash && (
                    <Text style={styles.hashText}>
                      {' • '}{truncateAddress(item.txHash, 6, 4)}
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.rightCol}>
              <Text
                style={[
                  styles.amountText,
                  item.type === 'receive' || item.type === 'yield'
                    ? { color: COLORS.emerald }
                    : { color: COLORS.textPrimary },
                ]}
              >
                {item.type === 'receive' || item.type === 'yield' ? '+' : '-'}
                ${item.amount.toFixed(2)} {item.currency}
              </Text>
              <NetworkPill networkId={item.network.toLowerCase()} size="sm" showDot={false} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.6,
  },
  count: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    position: 'relative',
  },
  txIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  actionOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  itemInfo: {
    gap: 2,
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subRowText: {
    marginTop: 2,
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  hashText: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: COLORS.cyan,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
