import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { STABLECOINS } from '../../constants/currencies';
import { NETWORKS } from '../../constants/chains';
import { NetworkPill } from '../ui/NetworkPill';
import { GlowBadge } from '../ui/GlowBadge';

export function AssetList() {
  const assets = Object.values(STABLECOINS);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>STABLE DIGITAL CURRENCIES</Text>
        <Text style={styles.totalValue}>4 Active Assets</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {assets.map((asset) => (
          <View key={asset.symbol} style={styles.assetCard}>
            <View style={styles.cardTop}>
              <View style={styles.symbolGroup}>
                <View style={styles.iconContainer}>
                  {asset.iconUrl ? (
                    <Image source={{ uri: asset.iconUrl }} style={styles.tokenIcon} />
                  ) : (
                    <View style={[styles.iconCircle, { backgroundColor: asset.iconColor }]}>
                      <Text style={styles.iconLetter}>{asset.symbol.charAt(0)}</Text>
                    </View>
                  )}
                  {asset.supportedNetworks.length > 0 && NETWORKS[asset.supportedNetworks[0]]?.iconUrl && (
                    <View style={styles.networkOverlay}>
                      <Image 
                        source={{ uri: NETWORKS[asset.supportedNetworks[0]].iconUrl }} 
                        style={styles.networkIcon} 
                      />
                    </View>
                  )}
                </View>
                <View>
                  <Text style={styles.symbolText}>{asset.symbol}</Text>
                  <Text style={styles.issuerText}>{asset.issuer}</Text>
                </View>
              </View>
              <GlowBadge label={`+${asset.apy}% APY`} variant="emerald" />
            </View>

            <View style={styles.balanceGroup}>
              <Text style={styles.balanceLabel}>Vault Balance</Text>
              <Text style={styles.balanceValue}>
                ${asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.networksRow}>
              {asset.supportedNetworks.slice(0, 3).map((net) => (
                <NetworkPill key={net} networkId={net} size="sm" showDot={false} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  totalValue: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 10,
  },
  assetCard: {
    width: 240,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  networkOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  symbolText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  issuerText: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
  balanceGroup: {
    gap: 2,
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  networksRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
});
