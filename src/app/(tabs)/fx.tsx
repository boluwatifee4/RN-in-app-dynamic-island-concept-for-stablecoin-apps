import { useState, useEffect } from 'react';
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
import { STABLECOINS, FIAT_REMITTANCE_PAIRS } from '../../constants/currencies';
import * as Haptics from 'expo-haptics';

const FIAT_LIST = Object.values(FIAT_REMITTANCE_PAIRS);

export default function FxScreen() {
  const insets = useSafeAreaInsets();
  const startTransaction = useStableStore((s) => s.startTransaction);
  const updateStage = useStableStore((s) => s.updateTransactionStage);
  const completeTransaction = useStableStore((s) => s.completeTransaction);
  const deductBalance = useStableStore((s) => s.deductBalance);
  const usdcBalance = useStableStore((s) => s.usdcBalance);
  const [sendAmount, setSendAmount] = useState('');
  const [selectedFiatCode, setSelectedFiatCode] = useState<string>('NGN');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [rateTimer, setRateTimer] = useState(30);

  const parsedSend = parseFloat(sendAmount) || 0;
  const insufficientBalance = parsedSend > usdcBalance;
  const fiat = FIAT_REMITTANCE_PAIRS[selectedFiatCode] || FIAT_LIST[0];
  const fiatAmount = parsedSend > 0 ? (parsedSend * fiat.defaultRatePerUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  useEffect(() => {
    if (rateTimer <= 0) return;
    const interval = setInterval(() => setRateTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [rateTimer]);

  const handleSend = () => {
    if (!sendAmount || !recipientName || !accountNumber || insufficientBalance) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deductBalance(parsedSend);
    startTransaction('remittance', `$${sendAmount} USDC → ${fiat.code}`, `To ${recipientName} (${fiat.symbol}${fiatAmount})`);

    setTimeout(() => updateStage('burning', 20), 500);
    setTimeout(() => updateStage('attesting', 50), 1500);
    setTimeout(() => updateStage('minting', 80), 2500);
    setTimeout(() => completeTransaction(), 3500);

    setSendAmount('');
    setRecipientName('');
    setAccountNumber('');
    setRecipientBank('');
    setRateTimer(30);
  };

  const handleMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSendAmount(usdcBalance.toString());
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
        <Text style={styles.title}>Remittance FX</Text>
        <Text style={styles.subtitle}>Send USDC, direct payout to global bank accounts</Text>
      </View>

      {/* You Send Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>YOU SEND</Text>
          <TouchableOpacity onPress={handleMax} activeOpacity={0.7}>
            <Text style={styles.balanceText}>
              Balance: <Text style={styles.balanceValue}>{usdcBalance.toLocaleString()} USDC</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            value={sendAmount}
            onChangeText={setSendAmount}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            accessibilityLabel="Send amount"
          />
          <View style={styles.tokenPill}>
            {STABLECOINS.USDC.iconUrl && (
              <Image source={{ uri: STABLECOINS.USDC.iconUrl }} style={styles.tokenIcon} resizeMode="contain" />
            )}
            <Text style={styles.tokenSymbol}>{STABLECOINS.USDC.symbol}</Text>
          </View>
        </View>
      </View>

      {/* Live Exchange Rate & Timer Pill */}
      <View style={styles.rateCard}>
        <View style={styles.rateLeft}>
          <Ionicons name="trending-up" size={16} color={COLORS.amber} />
          <Text style={styles.rateText}>
            1 USDC = {fiat.defaultRatePerUsd.toLocaleString()} {fiat.code}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.rateRight}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setRateTimer(30);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.timerText, rateTimer <= 10 && styles.timerTextUrgent]}>
            Lock {rateTimer}s
          </Text>
          <Ionicons name="refresh" size={13} color={rateTimer <= 10 ? COLORS.rose : COLORS.amber} />
        </TouchableOpacity>
      </View>

      {/* Recipient Receives Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>RECIPIENT RECEIVES</Text>
          <Text style={styles.guaranteedTag}>Guaranteed Rate</Text>
        </View>

        {/* Currency Selector Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fiatScroll}>
          {FIAT_LIST.map((c) => {
            const isSelected = selectedFiatCode === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.fiatChip, isSelected && styles.fiatChipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFiatCode(c.code);
                  setRateTimer(30);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.flagEmoji}>{c.flag}</Text>
                <Text style={[styles.fiatCode, isSelected && styles.fiatCodeSelected]}>
                  {c.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.payoutRow}>
          <Text style={[styles.payoutAmount, !sendAmount && styles.payoutAmountMuted]}>
            {fiat.symbol} {fiatAmount}
          </Text>
          <View style={styles.fiatBadge}>
            <Text style={styles.flagEmojiSmall}>{fiat.flag}</Text>
            <Text style={styles.fiatBadgeCode}>{fiat.code}</Text>
          </View>
        </View>
      </View>

      {/* Recipient Bank Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardLabel}>BENEFICIARY DETAILS</Text>
        <TextInput
          style={styles.input}
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Beneficiary Full Legal Name"
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          value={recipientBank}
          onChangeText={setRecipientBank}
          placeholder="Bank Name or Mobile Money Provider"
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="Account Number / IBAN / Phone"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
        />
      </View>

      {/* Rail Guarantee Details */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payout Rail</Text>
          <Text style={styles.summaryValue}>Aether Direct Clearing · {fiat.country}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Settlement Speed</Text>
          <Text style={styles.summaryValue}>Instant (~45 seconds)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>FX Spread</Text>
          <Text style={styles.summaryValue}>~0.5-1.5%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network Fee</Text>
          <Text style={styles.summaryValue}>~$0.0008</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Cost</Text>
          <Text style={styles.summaryValue}>${parsedSend > 0 ? parsedSend.toFixed(2) : '0.00'} + fees</Text>
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!sendAmount || !recipientName || !accountNumber || insufficientBalance) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!sendAmount || !recipientName || !accountNumber || insufficientBalance}
        activeOpacity={0.8}
      >
        <Ionicons name="paper-plane" size={18} color={COLORS.background} />
        <Text style={styles.sendText}>
          {!sendAmount
            ? 'Enter Amount'
            : insufficientBalance
            ? 'Insufficient Balance'
            : !recipientName || !accountNumber
            ? 'Enter Beneficiary Details'
            : `Send ${fiat.symbol}${fiatAmount} ${fiat.code}`}
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
  balanceText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  guaranteedTag: {
    fontSize: 11,
    color: COLORS.amber,
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
    padding: 0,
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
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.amber}10`,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: `${COLORS.amber}25`,
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.amber,
    fontFamily: 'Courier',
  },
  rateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.amber,
  },
  timerTextUrgent: {
    color: COLORS.rose,
  },
  fiatScroll: {
    gap: 8,
  },
  fiatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.md,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  fiatChipSelected: {
    backgroundColor: `${COLORS.amber}15`,
    borderColor: COLORS.amber,
  },
  flagEmoji: {
    fontSize: 14,
  },
  fiatCode: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fiatCodeSelected: {
    color: COLORS.amber,
    fontWeight: '700',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  payoutAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  payoutAmountMuted: {
    color: COLORS.textMuted,
  },
  fiatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 6,
  },
  flagEmojiSmall: {
    fontSize: 13,
  },
  fiatBadgeCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailsCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 12,
  },
  input: {
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  summaryCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryFree: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.amber,
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
});

