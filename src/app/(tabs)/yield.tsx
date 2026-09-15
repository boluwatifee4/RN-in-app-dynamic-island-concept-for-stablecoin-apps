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
import { STABLECOINS } from '../../constants/currencies';
import * as Haptics from 'expo-haptics';

const VAULTS = [
  { id: 'aave', name: 'Aave v3', apy: 5.32, protocol: 'Lending Pool', risk: 'Low' },
  { id: 'compound', name: 'Compound v3', apy: 4.87, protocol: 'Comet Prime', risk: 'Low' },
  { id: 'morpho', name: 'Morpho Blue', apy: 6.14, protocol: 'Isolated Vault', risk: 'Medium' },
];

const QUICK_DEPOSITS = [100, 500, 1000];

export default function YieldScreen() {
  const insets = useSafeAreaInsets();
  const startTransaction = useStableStore((s) => s.startTransaction);
  const updateStage = useStableStore((s) => s.updateTransactionStage);
  const completeTransaction = useStableStore((s) => s.completeTransaction);
  const deductBalance = useStableStore((s) => s.deductBalance);
  const usdcBalance = useStableStore((s) => s.usdcBalance);
  const [selectedVault, setSelectedVault] = useState('aave');
  const [depositAmount, setDepositAmount] = useState('');

  const parsedDepositAmount = parseFloat(depositAmount) || 0;
  const insufficientBalance = parsedDepositAmount > usdcBalance;
  const vault = VAULTS.find((v) => v.id === selectedVault)!;
  const deposited = 8450;
  const currentYield = 14.8291;
  const dailyYield = (deposited * vault.apy) / 100 / 365;

  const handleDeposit = () => {
    if (!depositAmount || insufficientBalance) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deductBalance(parsedDepositAmount);
    startTransaction('yield', `$${depositAmount} USDC → ${vault.name}`, `${vault.apy}% APY`);

    setTimeout(() => updateStage('burning', 30), 500);
    setTimeout(() => updateStage('attesting', 60), 1500);
    setTimeout(() => updateStage('minting', 90), 2500);
    setTimeout(() => completeTransaction(), 3200);

    setDepositAmount('');
  };

  const handleMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDepositAmount(usdcBalance.toString());
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
        <Text style={styles.title}>Yield Stream</Text>
        <Text style={styles.subtitle}>Automated passive yields on USDC balances</Text>
      </View>

      {/* Current Position Card */}
      <View style={styles.positionCard}>
        <View style={styles.positionHeader}>
          <Text style={styles.positionLabel}>ACTIVE VAULT BALANCE</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ACCRUING LIVE</Text>
          </View>
        </View>

        <Text style={styles.positionAmount}>
          ${deposited.toLocaleString('en-US', { minimumFractionDigits: 2 })} <Text style={styles.positionSymbol}>USDC</Text>
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Yield Earned</Text>
            <Text style={styles.metricValue}>+${currentYield.toFixed(4)}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Est. Daily</Text>
            <Text style={styles.metricValue}>+${dailyYield.toFixed(2)}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Net APY</Text>
            <Text style={[styles.metricValue, { color: COLORS.emerald }]}>{vault.apy.toFixed(2)}%</Text>
          </View>
        </View>
      </View>

      {/* Select Vault */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardLabel}>SELECT VAULT STRATEGY</Text>
        <View style={styles.vaultList}>
          {VAULTS.map((v) => {
            const isSelected = selectedVault === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.vaultCard, isSelected && styles.vaultCardSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedVault(v.id);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.vaultLeft}>
                  <View style={[styles.vaultIconBox, isSelected && styles.vaultIconBoxSelected]}>
                    <Ionicons
                      name="trending-up"
                      size={18}
                      color={isSelected ? COLORS.emerald : COLORS.textTertiary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.vaultName, isSelected && styles.vaultNameSelected]}>
                      {v.name}
                    </Text>
                    <Text style={styles.vaultProtocol}>{v.protocol} · {v.risk} Risk</Text>
                  </View>
                </View>
                <View style={styles.vaultRight}>
                  <Text style={[styles.apyValue, isSelected && styles.apyValueSelected]}>
                    {v.apy.toFixed(2)}%
                  </Text>
                  <Text style={styles.apyLabel}>APY</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Deposit Amount Card */}
      <View style={styles.swapCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>DEPOSIT AMOUNT</Text>
          <TouchableOpacity onPress={handleMax} activeOpacity={0.7}>
            <Text style={styles.balanceText}>
              Available: <Text style={styles.balanceValue}>{usdcBalance.toLocaleString()} USDC</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            accessibilityLabel="Deposit amount"
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
          {QUICK_DEPOSITS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.quickChip, depositAmount === val.toString() && styles.quickChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDepositAmount(val.toString());
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickChipText, depositAmount === val.toString() && styles.quickChipTextActive]}>
                ${val}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickChip, styles.maxChip, depositAmount === usdcBalance.toString() && styles.quickChipActive]}
            onPress={handleMax}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickChipText, styles.maxChipText]}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gas Fee Disclosure */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gas Cost (Deposit)</Text>
          <Text style={styles.detailValue}>~$0.001</Text>
        </View>
      </View>

      {/* Deposit Button */}
      <TouchableOpacity
        style={[styles.depositButton, (!depositAmount || insufficientBalance) && styles.depositButtonDisabled]}
        onPress={handleDeposit}
        disabled={!depositAmount || insufficientBalance}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={18} color={COLORS.background} />
        <Text style={styles.depositText}>
          {!depositAmount
            ? 'Enter Amount to Supply'
            : insufficientBalance
            ? 'Insufficient Balance'
            : `Supply ${depositAmount} USDC`}
        </Text>
      </TouchableOpacity>

      {/* Vault Security Badges */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={16} color={COLORS.emerald} />
          <Text style={styles.statLabel}>Instant</Text>
          <Text style={styles.statValue}>Withdrawal</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.cyan} />
          <Text style={styles.statLabel}>Audited</Text>
          <Text style={styles.statValue}>OpenZeppelin</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="refresh" size={16} color={COLORS.amber} />
          <Text style={styles.statLabel}>Auto</Text>
          <Text style={styles.statValue}>Compounding</Text>
        </View>
      </View>
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
  positionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: `${COLORS.emerald}30`,
    gap: 12,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${COLORS.emerald}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 0.8,
  },
  positionAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  positionSymbol: {
    fontSize: 18,
    color: COLORS.textTertiary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.surfaceGlassBorder,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Courier',
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  vaultList: {
    gap: 8,
  },
  vaultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
  },
  vaultCardSelected: {
    backgroundColor: `${COLORS.emerald}10`,
    borderColor: COLORS.emerald,
  },
  vaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vaultIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultIconBoxSelected: {
    backgroundColor: `${COLORS.emerald}20`,
  },
  vaultName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  vaultNameSelected: {
    color: COLORS.textPrimary,
  },
  vaultProtocol: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  vaultRight: {
    alignItems: 'flex-end',
  },
  apyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
  },
  apyValueSelected: {
    color: COLORS.emerald,
  },
  apyLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
  },
  swapCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 14,
  },
  detailsCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: `${COLORS.emerald}20`,
    borderColor: COLORS.emerald,
  },
  quickChipText: {
    fontSize: 11,
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
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.emerald,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    marginTop: 4,
  },
  depositButtonDisabled: {
    opacity: 0.35,
  },
  depositText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.background,
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

