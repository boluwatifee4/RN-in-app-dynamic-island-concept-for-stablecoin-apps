import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../../design-system/tokens/colors';
import { NETWORKS, BlockchainNetwork } from '../../../constants/chains';
import { NetworkPill } from '../../../components/ui/NetworkPill';

interface BridgePipelineProgressProps {
  sourceNetwork: BlockchainNetwork;
  destNetwork: BlockchainNetwork;
  stage: 'burn' | 'attestation' | 'mint' | 'settled';
  onChainSpeed: string;
}

export const BridgePipelineProgress = memo(function BridgePipelineProgress({
  sourceNetwork,
  destNetwork,
  stage,
  onChainSpeed,
}: BridgePipelineProgressProps) {
  const isSettled = stage === 'settled';

  return (
    <View style={styles.pipelineCard}>
      <View style={styles.node}>
        <NetworkPill networkId={sourceNetwork.id} size="sm" />
        <Text style={styles.nodeLabel}>Source (Burn)</Text>
      </View>

      <View style={styles.bridgeArrowContainer}>
        <View style={styles.bridgeTrack}>
          <View style={[styles.bridgeProgress, { width: isSettled ? '100%' : '65%' }]} />
        </View>
        <Text style={styles.speedLabel}>~{onChainSpeed} finality</Text>
      </View>

      <View style={styles.node}>
        <NetworkPill networkId={destNetwork.id} size="sm" />
        <Text style={styles.nodeLabel}>Target (Mint)</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pipelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  node: {
    alignItems: 'center',
    gap: 6,
  },
  nodeLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  bridgeArrowContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  bridgeTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  bridgeProgress: {
    height: '100%',
    backgroundColor: COLORS.cyan,
  },
  speedLabel: {
    fontSize: 10,
    color: COLORS.cyan,
    fontWeight: '600',
    marginTop: 4,
  },
});
