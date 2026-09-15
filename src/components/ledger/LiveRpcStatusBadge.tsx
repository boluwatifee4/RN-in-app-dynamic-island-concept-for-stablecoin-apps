import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { fetchLiveBaseState, LiveChainState } from '../../services/rpcService';
import { useStableStore } from '../../store/useStableStore';
import * as Haptics from 'expo-haptics';

export function LiveRpcStatusBadge() {
  const [chainState, setChainState] = useState<LiveChainState>({
    blockNumber: 21854200,
    gasPriceGwei: 0.0012,
    baseFeeGwei: 0.001,
    latencyMs: 95,
    lastUpdated: Date.now(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setLiveRpc = useStableStore((state) => state.setLiveRpc);

  const updateRpcState = async () => {
    setIsRefreshing(true);
    const state = await fetchLiveBaseState();
    setChainState(state);
    setLiveRpc(state.blockNumber, state.gasPriceGwei);
    setIsRefreshing(false);
  };

  useEffect(() => {
    updateRpcState();
    const interval = setInterval(updateRpcState, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateRpcState();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleManualRefresh}
      style={styles.container}
    >
      <View style={styles.leftGroup}>
        <Text style={styles.chainLabel}>Base Mainnet</Text>
      </View>

      <View style={styles.rightGroup}>
        <Text style={styles.blockNumber}>
          #{chainState.blockNumber.toLocaleString()}
        </Text>
        <Text style={styles.gas}>
          {chainState.gasPriceGwei.toFixed(4)} Gwei
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockNumber: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: COLORS.cyan,
    fontWeight: '600',
  },
  gas: {
    fontSize: 11,
    color: COLORS.emerald,
    fontWeight: '600',
  },
});
