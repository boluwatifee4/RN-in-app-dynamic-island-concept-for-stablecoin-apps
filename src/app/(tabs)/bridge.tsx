import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';
import { useStableStore } from '../../store/useStableStore';
import { NETWORKS } from '../../constants/chains';
import { STABLECOINS } from '../../constants/currencies';
import * as Haptics from 'expo-haptics';

const CHAINS = [
  { id: 'base', name: 'Base', icon: NETWORKS.base?.iconUrl, color: COLORS.baseBlue },
  { id: 'solana', name: 'Solana', icon: NETWORKS.solana?.iconUrl, color: COLORS.solanaPurple },
  { id: 'arbitrum', name: 'Arbitrum', icon: NETWORKS.arbitrum?.iconUrl, color: COLORS.arbitrumBlue },
  { id: 'polygon', name: 'Polygon', icon: NETWORKS.polygon?.iconUrl, color: COLORS.polygonPurple },
  { id: 'ethereum', name: 'Ethereum', icon: NETWORKS.ethereum?.iconUrl, color: COLORS.ethereumGray },
] as const;

type ChainId = (typeof CHAINS)[number]['id'];

const QUICK_AMOUNTS = [50, 250, 1000];

export default function BridgeScreen() {
  const insets = useSafeAreaInsets();
  const startTransaction = useStableStore((s) => s.startTransaction);
  const updateStage = useStableStore((s) => s.updateTransactionStage);
  const completeTransaction = useStableStore((s) => s.completeTransaction);
  const deductBalance = useStableStore((s) => s.deductBalance);
  const usdcBalance = useStableStore((s) => s.usdcBalance);
  const [sourceChain, setSourceChain] = useState<ChainId>('base');
  const [destChain, setDestChain] = useState<ChainId>('solana');
  const [amount, setAmount] = useState('');
  const [gasless, setGasless] = useState(true);

  const parsedAmount = parseFloat(amount) || 0;
  const insufficientBalance = parsedAmount > usdcBalance;
  const sourceData = CHAINS.find((c) => c.id === sourceChain) || CHAINS[0];
  const destData = CHAINS.find((c) => c.id === destChain) || CHAINS[1];

  const handleBridge = () => {
    if (!amount || insufficientBalance) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deductBalance(parsedAmount);
    startTransaction('bridge', `$${amount} USDC`, `${sourceData.name} → ${destData.name}`);

    setTimeout(() => updateStage('burning', 20), 500);
    setTimeout(() => updateStage('attesting', 50), 1800);
    setTimeout(() => updateStage('minting', 80), 3000);
    setTimeout(() => completeTransaction(), 4000);

    setAmount('');
  };

  const handleSwapChains = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tmp = sourceChain;
    setSourceChain(destChain);
    setDestChain(tmp);
  };

  const handleMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(usdcBalance.toString());
  };

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bridge USDC</Text>
        <Text style={styles.subtitle}>Native burn & mint via Circle CCTP</Text>
      </View>

      {/* From Network Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>FROM NETWORK</Text>
          <TouchableOpacity onPress={handleMax} activeOpacity={0.7}>
            <Text style={styles.balanceText}>
              Balance: <Text style={styles.balanceValue}>{usdcBalance.toLocaleString()} USDC</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Chain Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chainScroll}>
          {CHAINS.map((chain) => {
            const isSelected = sourceChain === chain.id;
            return (
              <TouchableOpacity
                key={`src-${chain.id}`}
                style={[styles.chainChip, isSelected && styles.chainChipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (destChain === chain.id) setDestChain(sourceChain);
                  setSourceChain(chain.id);
                }}
                activeOpacity={0.7}
              >
                {chain.icon ? (
                  <Image source={{ uri: chain.icon }} style={styles.chainIcon} resizeMode="contain" />
                ) : (
                  <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                )}
                <Text style={[styles.chainName, isSelected && styles.chainNameSelected]}>
                  {chain.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            accessibilityLabel="Amount"
          />
          <View style={styles.tokenPill}>
            {STABLECOINS.USDC.iconUrl && (
              <Image source={{ uri: STABLECOINS.USDC.iconUrl }} style={styles.tokenIcon} resizeMode="contain" />
            )}
            <Text style={styles.tokenSymbol}>{STABLECOINS.USDC.symbol}</Text>
          </View>
        </View>

        {/* Quick amounts */}
        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.quickChip, amount === val.toString() && styles.quickChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAmount(val.toString());
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickChipText, amount === val.toString() && styles.quickChipTextActive]}>
                ${val}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickChip, styles.maxChip, amount === usdcBalance.toString() && styles.quickChipActive]}
            onPress={handleMax}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickChipText, styles.maxChipText]}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Swap Direction Divider */}
      <View style={styles.swapDividerRow}>
        <View style={styles.swapDividerLine} />
        <TouchableOpacity
          style={styles.swapIconButton}
          onPress={handleSwapChains}
          activeOpacity={0.8}
          accessibilityLabel="Swap networks"
        >
          <Ionicons name="swap-vertical" size={18} color={COLORS.cyan} />
        </TouchableOpacity>
        <View style={styles.swapDividerLine} />
      </View>

      {/* To Network Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>TO NETWORK</Text>
          <Text style={styles.networkTag}>Native USDC Delivery</Text>
        </View>

        {/* Destination Chain Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chainScroll}>
          {CHAINS.map((chain) => {
            const isSelected = destChain === chain.id;
            return (
              <TouchableOpacity
                key={`dst-${chain.id}`}
                style={[styles.chainChip, isSelected && styles.chainChipSelectedCyan]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (sourceChain === chain.id) setSourceChain(destChain);
                  setDestChain(chain.id);
                }}
                activeOpacity={0.7}
              >
                {chain.icon ? (
                  <Image source={{ uri: chain.icon }} style={styles.chainIcon} resizeMode="contain" />
                ) : (
                  <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                )}
                <Text style={[styles.chainName, isSelected && styles.chainNameSelectedCyan]}>
                  {chain.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.outputRow}>
          <Text style={[styles.amountOutput, !amount && styles.amountOutputMuted]}>
            {amount ? `${amount} USDC` : '0.00 USDC'}
          </Text>
          <View style={styles.tokenPill}>
            {STABLECOINS.USDC.iconUrl && (
              <Image source={{ uri: STABLECOINS.USDC.iconUrl }} style={styles.tokenIcon} resizeMode="contain" />
            )}
            <Text style={styles.tokenSymbol}>{STABLECOINS.USDC.symbol}</Text>
          </View>
        </View>
      </View>

      {/* Gasless Paymaster Card */}
      <TouchableOpacity
        style={styles.toggleCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setGasless(!gasless);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.toggleLeft}>
          <View style={styles.flashIconBox}>
            <Ionicons name="flash" size={18} color={COLORS.cyan} />
          </View>
          <View>
            <Text style={styles.toggleTitle}>Gasless Bridge</Text>
            <Text style={styles.toggleSub}>Circle CCTP Attestation Relay</Text>
          </View>
        </View>
        <View style={[styles.toggleTrack, gasless && styles.toggleTrackOn]}>
          <View style={[styles.toggleThumb, gasless && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>

      {/* Route & Fee Breakdown */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bridge Protocol</Text>
          <Text style={styles.detailValue}>Circle CCTP v1</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Est. Settlement</Text>
          <Text style={styles.detailValue}>~12 seconds</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Fee (Source Chain)</Text>
          <Text style={styles.detailFree}>{gasless ? '$0.00 (Sponsored)' : '~$0.001'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bridge Fee</Text>
          <Text style={styles.detailFree}>{gasless ? '$0.00 (Sponsored)' : '~$0.001'}</Text>
        </View>
      </View>

      {/* Bridge Button */}
      <TouchableOpacity
        style={[styles.bridgeButton, (!amount || insufficientBalance) && styles.bridgeButtonDisabled]}
        onPress={handleBridge}
        disabled={!amount || insufficientBalance}
        activeOpacity={0.8}
      >
        <Ionicons name="git-compare" size={20} color={COLORS.background} />
        <Text style={styles.bridgeText}>
          {!amount
            ? 'Enter Amount to Bridge'
            : insufficientBalance
            ? 'Insufficient Balance'
            : `Bridge ${amount} USDC`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  swapCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  networkTag: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chainScroll: {
    gap: 8,
  },
  chainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: RADIUS.md,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  chainChipSelected: {
    backgroundColor: `${COLORS.emerald}15`,
    borderColor: COLORS.emerald,
  },
  chainChipSelectedCyan: {
    backgroundColor: `${COLORS.cyan}15`,
    borderColor: COLORS.cyan,
  },
  chainIcon: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chainName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chainNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  chainNameSelectedCyan: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
    padding: 0,
  },
  outputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  amountOutput: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  amountOutputMuted: {
    color: COLORS.textMuted,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 7,
  },
  tokenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  quickChipActive: {
    backgroundColor: `${COLORS.cyan}20`,
    borderColor: COLORS.cyan,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickChipTextActive: {
    color: COLORS.cyan,
    fontWeight: '700',
  },
  maxChip: {
    backgroundColor: `${COLORS.cyan}15`,
    borderColor: `${COLORS.cyan}30`,
  },
  maxChipText: {
    color: COLORS.cyan,
    fontWeight: '700',
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
    zIndex: 10,
  },
  swapDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceGlassBorder,
  },
  swapIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.cyan}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceSubtle,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: `${COLORS.cyan}40`,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.textTertiary,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.cyan,
  },
  detailsCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailFree: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  bridgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    marginTop: 4,
  },
  bridgeButtonDisabled: {
    opacity: 0.35,
  },
  bridgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.background,
  },
});

