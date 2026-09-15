import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { GlowBadge } from '../../../components/ui/GlowBadge';
import { CrossChainBridgeData } from '../../../constants/types';
import { truncateAddress } from '../../../services/rpcService';
import { useBridgeState } from '../hooks/useBridgeState';
import { BridgePipelineProgress } from './BridgePipelineProgress';
import { ChainSelectorGrid } from './ChainSelectorGrid';
import { PaymasterToggleCard } from './PaymasterToggleCard';

interface CrossChainBridgePanelProps {
  data: CrossChainBridgeData;
  onSpeedUp?: () => void;
  onDismiss?: () => void;
}

export const CrossChainBridgePanel = memo(function CrossChainBridgePanel({
  data,
}: CrossChainBridgePanelProps) {
  const {
    selectedDest,
    setSelectedDest,
    paymasterActive,
    togglePaymaster,
    copied,
    copyTxHash,
    sourceNetwork,
    destNetwork,
  } = useBridgeState(data);

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Cross-Chain CCTP Relay</Text>
          <Text style={styles.subtitle}>
            Bridge {data.amount} {data.tokenSymbol} via {data.routeProtocol}
          </Text>
        </View>
        <GlowBadge
          label={data.stage === 'settled' ? 'Settled' : 'Relaying'}
          variant={data.stage === 'settled' ? 'emerald' : 'cyan'}
        />
      </View>

      {/* Visual Pipeline */}
      <BridgePipelineProgress
        sourceNetwork={sourceNetwork}
        destNetwork={destNetwork}
        stage={data.stage}
        onChainSpeed={data.onChainSpeed}
      />

      {/* Destination Selector */}
      <ChainSelectorGrid
        selectedChain={selectedDest}
        onSelectChain={setSelectedDest}
      />

      {/* Gas Breakdown & Paymaster */}
      <PaymasterToggleCard
        destNetwork={destNetwork}
        paymasterActive={paymasterActive}
        onTogglePaymaster={togglePaymaster}
      />

      {/* On-Chain Hash Lens */}
      {data.txHash && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={copyTxHash}
          style={styles.txRow}
        >
          <Text style={styles.txLabel}>CCTP Packet Hash:</Text>
          <Text style={styles.txHash}>{truncateAddress(data.txHash, 8, 6)}</Text>
          <Text style={styles.copyBadge}>{copied ? 'Copied' : 'Copy'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    gap: 16,
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
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  txLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  txHash: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: COLORS.cyan,
  },
  copyBadge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
