import { useState, useCallback } from 'react';
import { Clipboard } from 'react-native';
import { CrossChainBridgeData } from '../../../constants/types';
import { NETWORKS } from '../../../constants/chains';
import * as Haptics from 'expo-haptics';

export function useBridgeState(initialData: CrossChainBridgeData) {
  const [selectedDest, setSelectedDest] = useState(initialData.destinationChain);
  const [paymasterActive, setPaymasterActive] = useState(initialData.gasless);
  const [copied, setCopied] = useState(false);

  const sourceNetwork = NETWORKS[initialData.sourceChain] || NETWORKS.base;
  const destNetwork = NETWORKS[selectedDest] || NETWORKS.solana;

  const togglePaymaster = useCallback(() => {
    setPaymasterActive((prev) => !prev);
  }, []);

  const copyTxHash = useCallback(() => {
    if (initialData.txHash) {
      Clipboard.setString(initialData.txHash);
      setCopied(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [initialData.txHash]);

  const selectDestinationChain = useCallback((chainKey: string) => {
    setSelectedDest(chainKey as CrossChainBridgeData['destinationChain']);
  }, []);

  return {
    selectedDest,
    setSelectedDest: selectDestinationChain,
    paymasterActive,
    togglePaymaster,
    copied,
    copyTxHash,
    sourceNetwork,
    destNetwork,
  };
}
