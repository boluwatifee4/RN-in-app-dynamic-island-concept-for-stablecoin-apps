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

const QUICK_AMOUNTS = [25, 50, 100, 500];

function validateRecipient(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Required' };
  if (trimmed.startsWith('0x')) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      return { valid: false, error: 'Invalid Ethereum address (must be 0x + 40 hex chars)' };
    }
    return { valid: true };
  }
  if (trimmed.endsWith('.eth') || trimmed.endsWith('.sol')) {
    return { valid: true };
  }
  if (trimmed.startsWith('@')) {
    return { valid: true };
  }
  return { valid: false, error: 'Use 0x address, ENS (.eth), or @handle' };
}

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const startTransaction = useStableStore((s) => s.startTransaction);
  const updateStage = useStableStore((s) => s.updateTransactionStage);
  const completeTransaction = useStableStore((s) => s.completeTransaction);
  const deductBalance = useStableStore((s) => s.deductBalance);
  const usdcBalance = useStableStore((s) => s.usdcBalance);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedChain, setSelectedChain] = useState<'base' | 'solana' | 'arbitrum' | 'polygon' | 'ethereum'>('base');

  const selectedChainData = CHAINS.find((c) => c.id === selectedChain) || CHAINS[0];
  const parsedAmount = parseFloat(amount) || 0;
  const insufficientBalance = parsedAmount > usdcBalance;
  const networkFee = NETWORKS[selectedChain]?.avgFeeUsd ?? 0.001;

  const handleSend = () => {
    if (!amount || !recipient || insufficientBalance) return;
    const validation = validateRecipient(recipient);
    if (!validation.valid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    deductBalance(parsedAmount);
    startTransaction('send', `$${amount} USDC → ${selectedChainData.name}`, `To ${recipient}`);

    setTimeout(() => updateStage('burning', 25), 500);
    setTimeout(() => updateStage('attesting', 50), 1500);
    setTimeout(() => updateStage('minting', 75), 2500);
    setTimeout(() => completeTransaction(), 3500);

    setAmount('');
    setRecipient('');
  };

  const handleQuickAmount = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(val.toString());
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
        <Text style={styles.title}>Send USDC</Text>
        <Text style={styles.subtitle}>Direct, instant settlement cross-chain</Text>
      </View>

      {/* Main Send Amount Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>YOU SEND</Text>
          <TouchableOpacity onPress={handleMax} activeOpacity={0.7} style={styles.balanceContainer}>
            <Text style={styles.balanceText}>
              Available: <Text style={styles.balanceValue}>{usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</Text>
            </Text>
          </TouchableOpacity>
        </View>

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
              <Image
                source={{ uri: STABLECOINS.USDC.iconUrl }}
                style={styles.tokenIcon}
                resizeMode="contain"
              />
            )}
            <Text style={styles.tokenSymbol}>{STABLECOINS.USDC.symbol}</Text>
          </View>
        </View>

        {/* Quick Amount Pills */}
        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.quickChip,
                amount === val.toString() && styles.quickChipActive,
              ]}
              onPress={() => handleQuickAmount(val)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickChipText,
                  amount === val.toString() && styles.quickChipTextActive,
                ]}
              >
                ${val}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.quickChip,
              styles.maxChip,
              amount === usdcBalance.toString() && styles.quickChipActive,
            ]}
            onPress={handleMax}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickChipText, styles.maxChipText]}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipient Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardLabel}>RECIPIENT</Text>
        <View style={styles.recipientRow}>
          <Ionicons name="person-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.recipientInput}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="0x address, ENS (.eth), or @handle"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Recipient address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {recipient.length > 0 ? (
            <TouchableOpacity onPress={() => setRecipient('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.scanBtn}
              accessibilityLabel="Scan QR code"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="scan" size={18} color={COLORS.emerald} />
            </TouchableOpacity>
          )}
        </View>
        {recipient.length > 0 && !validateRecipient(recipient).valid && (
          <View style={styles.validationRow}>
            <Ionicons name="alert-circle" size={12} color={COLORS.rose} />
            <Text style={styles.validationText}>{validateRecipient(recipient).error}</Text>
          </View>
        )}
        {recipient.length > 0 && validateRecipient(recipient).valid && (
          <View style={styles.validationRow}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.emerald} />
            <Text style={[styles.validationText, { color: COLORS.emerald }]}>Valid address</Text>
          </View>
        )}
      </View>

      {/* Destination Network Card */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>DESTINATION NETWORK</Text>
          <View style={styles.paymasterTag}>
            <Ionicons name="flash" size={12} color={COLORS.emerald} />
            <Text style={styles.paymasterText}>Gasless Sponsored</Text>
          </View>
        </View>

        <View style={styles.chainGrid}>
          {CHAINS.map((chain) => {
            const isSelected = selectedChain === chain.id;
            return (
              <TouchableOpacity
                key={chain.id}
                style={[
                  styles.chainChip,
                  isSelected && styles.chainChipSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedChain(chain.id);
                }}
                activeOpacity={0.7}
              >
                {chain.icon ? (
                  <Image source={{ uri: chain.icon }} style={styles.chainIcon} resizeMode="contain" />
                ) : (
                  <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                )}
                <Text
                  style={[
                    styles.chainName,
                    isSelected && styles.chainNameSelected,
                  ]}
                >
                  {chain.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Execution Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Fee</Text>
          <Text style={styles.detailFree}>$0.00 (Zero Gas)</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated Time</Text>
          <Text style={styles.detailValue}>~2.4 seconds</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Protocol</Text>
          <Text style={styles.detailValue}>Circle CCTP · S-I Mesh</Text>
        </View>
      </View>

      {/* Network Fee Disclosure */}
      {parsedAmount > 0 && (
        <View style={styles.feeDisclosure}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Network Fee</Text>
            <Text style={styles.feeValue}>~${networkFee.toFixed(4)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Cost</Text>
            <Text style={styles.feeValue}>${(parsedAmount + networkFee).toFixed(2)} USDC</Text>
          </View>
          {insufficientBalance && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={14} color={COLORS.rose} />
              <Text style={styles.warningText}>
                Insufficient balance. You have {usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, (!amount || !recipient || insufficientBalance) && styles.sendButtonDisabled]}
        accessibilityLabel="Send USDC"
        accessibilityRole="button"
        onPress={handleSend}
        disabled={!amount || !recipient || insufficientBalance}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-up-circle" size={20} color={COLORS.background} />
        <Text style={styles.sendText}>
          {!amount ? 'Enter Amount' : !recipient ? 'Enter Recipient' : insufficientBalance ? 'Insufficient Balance' : `Send ${amount} USDC`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 14,
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
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 12,
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
  balanceContainer: {
    paddingVertical: 2,
  },
  balanceText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
    padding: 0,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 8,
  },
  tokenIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  tokenSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  quickChipActive: {
    backgroundColor: `${COLORS.emerald}20`,
    borderColor: COLORS.emerald,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickChipTextActive: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
  maxChip: {
    backgroundColor: `${COLORS.emerald}15`,
    borderColor: `${COLORS.emerald}30`,
  },
  maxChipText: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  recipientInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  scanBtn: {
    padding: 4,
  },
  paymasterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.emerald}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  paymasterText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  chainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  chainChipSelected: {
    backgroundColor: `${COLORS.emerald}15`,
    borderColor: COLORS.emerald,
  },
  chainIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  chainDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chainName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chainNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: '700',
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
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.emerald,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    marginTop: 4,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.background,
  },
  feeDisclosure: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  feeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.rose}15`,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.rose,
    flex: 1,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  validationText: {
    fontSize: 11,
    color: COLORS.rose,
  },
});

