import React, { memo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design-system/tokens/colors';
import { useStableStore, type TransactionStatus } from '../../store/useStableStore';
import { useIslandPhysics } from '../../features/island-engine/hooks/useIslandPhysics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EXPANDED_WIDTH = Math.min(SCREEN_WIDTH - 24, 380);

const STAGE_CONFIG: Record<TransactionStatus['stage'], { color: string; icon: string; label: string }> = {
  idle: { color: COLORS.textTertiary, icon: 'ellipse-outline', label: 'Idle' },
  burning: { color: COLORS.rose, icon: 'flame-outline', label: 'Burning' },
  attesting: { color: COLORS.amber, icon: 'document-text-outline', label: 'Attesting' },
  minting: { color: COLORS.cyan, icon: 'sparkles-outline', label: 'Minting' },
  settled: { color: COLORS.emerald, icon: 'checkmark-circle', label: 'Settled' },
  failed: { color: COLORS.rose, icon: 'close-circle-outline', label: 'Failed' },
};

const TYPE_LABELS: Record<TransactionStatus['type'], string> = {
  bridge: 'Cross-Chain Bridge',
  send: 'USDC Transfer',
  remittance: 'Global Remittance',
  yield: 'Yield Deposit',
};

interface StableIslandProps {
  onDismiss?: () => void;
}

export const StableIsland = memo(function StableIsland({ onDismiss }: StableIslandProps) {
  const insets = useSafeAreaInsets();
  const transaction = useStableStore((s) => s.activeTransaction);
  const dismissTransaction = useStableStore((s) => s.dismissTransaction);

  const visible = transaction !== null && transaction.stage !== 'idle';

  const {
    isExpanded,
    renderMounted,
    expandTray,
    collapseTray,
    dismiss,
    markIdle,
    islandContainerStyle,
    backdropStyle,
  } = useIslandPhysics(visible, EXPANDED_WIDTH, insets.top, useCallback(() => {
    dismissTransaction();
    onDismiss?.();
  }, [dismissTransaction, onDismiss]));

  // Auto-expand when transaction starts (only for active stages)
  useEffect(() => {
    if (transaction && transaction.stage !== 'idle') {
      expandTray();
    }
  }, [transaction?.id]);

  // Auto-collapse after settled/failed — give user time to read
  useEffect(() => {
    if (transaction?.stage === 'settled') {
      const timer = setTimeout(() => {
        markIdle();
        collapseTray();
        setTimeout(() => dismissTransaction(), 600);
      }, 4500);
      return () => clearTimeout(timer);
    }
    if (transaction?.stage === 'failed') {
      const timer = setTimeout(() => {
        markIdle();
        collapseTray();
        setTimeout(() => dismissTransaction(), 600);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transaction?.stage]);

  if (!renderMounted || !transaction) return null;

  const stageConfig = STAGE_CONFIG[transaction.stage];
  const typeLabel = TYPE_LABELS[transaction.type];

  // Compact Pill
  const renderPill = () => (
    <View style={styles.pillInner}>
      <View style={[styles.statusDot, { backgroundColor: stageConfig.color }]} />
      <Text style={styles.pillText} numberOfLines={1}>
        {transaction.title}
      </Text>
      <Text style={[styles.pillBadge, { color: stageConfig.color }]}>
        {stageConfig.label}
      </Text>
    </View>
  );

  // Expanded Content
  const renderExpanded = () => (
    <View style={styles.expandedContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: `${stageConfig.color}20` }]}>
            <Ionicons name={stageConfig.icon as any} size={16} color={stageConfig.color} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {typeLabel}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {transaction.subtitle}
            </Text>
          </View>
        </View>
        <Text style={[styles.headerStage, { color: stageConfig.color }]}>
          {stageConfig.label}
        </Text>
      </View>

      {/* Pipeline Progress */}
      <View style={styles.pipeline}>
        {(['burning', 'attesting', 'minting', 'settled'] as const).map((stage, i) => {
          const isPast = isStagePast(transaction.stage, stage);
          const isCurrent = transaction.stage === stage;
          const config = STAGE_CONFIG[stage];

          return (
            <React.Fragment key={stage}>
              <View style={styles.stageContainer}>
                <View
                  style={[
                    styles.stageDot,
                    isCurrent && {
                      borderColor: config.color,
                      backgroundColor: `${config.color}25`,
                      shadowColor: config.color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 5,
                    },
                    isPast && {
                      borderColor: config.color,
                      backgroundColor: config.color,
                    },
                    !isPast && !isCurrent && {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    },
                  ]}
                >
                  {isPast ? (
                    <Ionicons name="checkmark-sharp" size={10} color="#000000" />
                  ) : (
                    <Ionicons
                      name={config.icon as any}
                      size={10}
                      color={isCurrent ? config.color : 'rgba(255, 255, 255, 0.3)'}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    isCurrent && { color: config.color, fontWeight: '700' },
                    isPast && { color: '#FFFFFF', fontWeight: '600' },
                    !isPast && !isCurrent && { color: '#8E8E93' },
                  ]}
                >
                  {config.label}
                </Text>
              </View>
              {i < 3 && (
                <View
                  style={[
                    styles.stageLine,
                    {
                      backgroundColor: isPast ? config.color : 'rgba(255, 255, 255, 0.08)',
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${Math.max(5, transaction.progress)}%`,
              backgroundColor: stageConfig.color,
            },
          ]}
        />
      </View>

      {/* Detail Row */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{transaction.title.split('→')[0]?.trim()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Progress</Text>
          <Text style={[styles.detailValue, { color: stageConfig.color }]}>
            {stageConfig.label} ({Math.round(transaction.progress)}%)
          </Text>
        </View>
      </View>

      {/* TX Hash */}
      {transaction.txHash && (
        <View style={styles.hashRow}>
          <Ionicons name="finger-print-outline" size={12} color="#8E8E93" />
          <Text style={styles.hashText} numberOfLines={1}>
            {transaction.txHash}
          </Text>
        </View>
      )}

      {/* Settled / Failed Banner */}
      {(transaction.stage === 'settled' || transaction.stage === 'failed') && (
        <View style={[styles.statusBanner, transaction.stage === 'settled' ? styles.bannerSuccess : styles.bannerFail]}>
          <Ionicons
            name={transaction.stage === 'settled' ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={transaction.stage === 'settled' ? COLORS.emerald : COLORS.rose}
          />
          <Text style={[styles.statusText, { color: transaction.stage === 'settled' ? COLORS.emerald : COLORS.rose }]}>
            {transaction.stage === 'settled' ? 'Transaction Settled Successfully' : 'Transaction Failed'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      {isExpanded && (
        <TouchableWithoutFeedback onPress={() => { if (!isActive(transaction.stage)) collapseTray(); }}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.island, islandContainerStyle]}>
        {!isExpanded ? (
          <Pressable onPress={expandTray} style={styles.pillPressable}>
            {renderPill()}
          </Pressable>
        ) : (
          <View style={styles.expandedWrapper}>
            <Pressable onPress={() => { if (!isActive(transaction.stage)) collapseTray(); }} style={styles.handleBar}>
              <View style={styles.handlePill} />
            </Pressable>
            {renderExpanded()}
          </View>
        )}
      </Animated.View>
    </>
  );
});

function isStagePast(current: TransactionStatus['stage'], check: TransactionStatus['stage']): boolean {
  const order: TransactionStatus['stage'][] = ['burning', 'attesting', 'minting', 'settled'];
  return order.indexOf(current) > order.indexOf(check);
}

function isActive(stage: TransactionStatus['stage']): boolean {
  return stage === 'burning' || stage === 'attesting' || stage === 'minting';
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 998,
  },
  island: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#090B0E',
    zIndex: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
    overflow: 'hidden',
  },
  pillPressable: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pillBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  expandedWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  handleBar: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  expandedContent: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  headerStage: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stageContainer: {
    alignItems: 'center',
    gap: 4,
  },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  stageLine: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 3,
    marginBottom: 16,
    borderRadius: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailItem: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 9,
    color: '#8E8E93',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Courier',
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  hashText: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#8E8E93',
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  bannerSuccess: {
    backgroundColor: 'rgba(0, 242, 157, 0.1)',
  },
  bannerFail: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
