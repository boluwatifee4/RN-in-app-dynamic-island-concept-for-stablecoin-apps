import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design-system/tokens/colors';
import { useStableStore, type TransactionStatus } from '../../store/useStableStore';
import { useIslandPhysics } from '../../features/island-engine/hooks/useIslandPhysics';
import * as LiveActivity from '../../../modules/stable-island-activity';

const STAGE_CONFIG: Record<TransactionStatus['stage'], { color: string; label: string }> = {
  idle: { color: COLORS.textTertiary, label: 'Idle' },
  burning: { color: COLORS.rose, label: 'Burning' },
  attesting: { color: COLORS.amber, label: 'Attesting' },
  minting: { color: COLORS.cyan, label: 'Minting' },
  settled: { color: COLORS.emerald, label: 'Settled' },
  failed: { color: COLORS.rose, label: 'Failed' },
};

const SHORT_TYPE_LABELS: Record<TransactionStatus['type'], string> = {
  bridge: 'Bridge',
  send: 'Send',
  remittance: 'Remit',
  yield: 'Yield',
};

const TYPE_ICONS: Record<TransactionStatus['type'], string> = {
  bridge: 'swap-horizontal',
  send: 'arrow-up',
  remittance: 'globe',
  yield: 'trending-up',
};

const STAGE_ORDER: TransactionStatus['stage'][] = ['burning', 'attesting', 'minting', 'settled'];

interface StableIslandProps {
  onDismiss?: () => void;
}

export const StableIsland = memo(function StableIsland({ onDismiss }: StableIslandProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const compactWidth = windowWidth >= 430 ? 250 : windowWidth >= 390 ? 240 : 230;
  const expandedWidth = Math.min(windowWidth - 20, 430);

  const transaction = useStableStore((s) => s.activeTransaction);
  const dismissTransaction = useStableStore((s) => s.dismissTransaction);

  const visible = transaction !== null && transaction.stage !== 'idle';

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!transaction || !isActive(transaction.stage)) return;
    const startedAt = transaction.startTime;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [transaction?.id, transaction?.stage]);

  const {
    isExpanded,
    renderMounted,
    expandTray,
    collapseTray,
    markIdle,
    islandContainerStyle,
    pillStyle,
    expandedStyle,
  } = useIslandPhysics(visible, compactWidth, expandedWidth, insets.top, useCallback(() => {
    dismissTransaction();
    onDismiss?.();
  }, [dismissTransaction, onDismiss]));

  // The system status bar paints above every app view — no zIndex can beat it.
  // The real island covers the clock while expanded, so hide the status bar
  // for the expanded phase and restore it once the pill is nearly compact again.
  const [statusBarHidden, setStatusBarHidden] = useState(false);
  useEffect(() => {
    if (isExpanded) {
      setStatusBarHidden(true);
      return;
    }
    const timer = setTimeout(() => setStatusBarHidden(false), 350);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const lastStageRef = useRef<TransactionStatus['stage'] | null>(null);

  // Start Live Activity when transaction starts
  useEffect(() => {
    if (transaction && transaction.stage !== 'idle' && transaction.stage !== lastStageRef.current) {
      if (lastStageRef.current === null) {
        LiveActivity.startActivity(transaction.title, transaction.subtitle, transaction.type);
      }
      lastStageRef.current = transaction.stage;
    }
  }, [transaction?.id, transaction?.stage]);

  // Update Live Activity on stage change
  useEffect(() => {
    if (transaction && transaction.stage !== 'idle') {
      LiveActivity.updateActivity(transaction.stage, transaction.progress);
    }
  }, [transaction?.stage, transaction?.progress]);

  // End Live Activity on settle/fail
  useEffect(() => {
    if (transaction?.stage === 'settled') {
      LiveActivity.endActivity('settled');
      lastStageRef.current = null;
    }
    if (transaction?.stage === 'failed') {
      LiveActivity.endActivity('failed');
      lastStageRef.current = null;
    }
  }, [transaction?.stage]);

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
  const currentStageIdx = STAGE_ORDER.indexOf(transaction.stage);

  // Compact pill — leading indicator + trailing value only; the center is
  // reserved for the physical sensor housing, exactly like the system island.
  const renderPill = () => (
    <View style={styles.pillRow}>
      <Ionicons name={TYPE_ICONS[transaction.type] as any} size={22} color={stageConfig.color} />
      {isActive(transaction.stage) ? (
        <Text style={styles.pillPercent}>{Math.round(transaction.progress)}%</Text>
      ) : (
        <Ionicons
          name={transaction.stage === 'failed' ? 'close-circle' : 'checkmark-circle'}
          size={18}
          color={stageConfig.color}
        />
      )}
    </View>
  );

  // Expanded — ActivityKit-style regions: top band flanks the cutout,
  // everything else sits below it.
  const renderExpanded = () => (
    <>
      <View style={styles.topBand}>
        <View style={styles.topLeading}>
          <View style={[styles.typeChip, { backgroundColor: `${stageConfig.color}26` }]}>
            <Ionicons name={TYPE_ICONS[transaction.type] as any} size={15} color={stageConfig.color} />
          </View>
          <Text style={styles.typeLabel}>{SHORT_TYPE_LABELS[transaction.type]}</Text>
        </View>
        {isActive(transaction.stage) ? (
          <Text style={styles.bigValue}>{Math.round(transaction.progress)}%</Text>
        ) : (
          <Ionicons
            name={transaction.stage === 'failed' ? 'close-circle' : 'checkmark-circle'}
            size={26}
            color={transaction.stage === 'failed' ? COLORS.rose : COLORS.emerald}
          />
        )}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {transaction.subtitle}
        </Text>
      </View>

      <View style={styles.segments}>
        {STAGE_ORDER.map((stage, i) => {
          const config = STAGE_CONFIG[stage];
          const isDone = transaction.stage === 'settled' || currentStageIdx > i;
          const isCurrent = currentStageIdx === i && transaction.stage !== 'settled';
          return (
            <View
              key={stage}
              style={[
                styles.segment,
                {
                  backgroundColor: isDone
                    ? config.color
                    : isCurrent
                      ? `${config.color}4D`
                      : 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerStage, { color: stageConfig.color }]}>
          {stageConfig.label}
        </Text>
        {isActive(transaction.stage) && (
          <Text style={styles.footerTime}>{formatElapsed(elapsed)}</Text>
        )}
      </View>
    </>
  );

  return (
    <>
      <StatusBar
        hidden={statusBarHidden}
        barStyle="light-content"
        showHideTransition="fade"
      />
      <Animated.View style={[styles.island, islandContainerStyle]}>
        <Animated.View
          style={[styles.layer, pillStyle]}
          pointerEvents={isExpanded ? 'none' : 'auto'}
        >
          <Pressable onPress={expandTray} style={styles.pillPressable}>
            {renderPill()}
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[styles.layer, expandedStyle]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <Pressable
            onPress={() => {
              if (!isActive(transaction.stage)) {
                markIdle();
                collapseTray();
              }
            }}
            style={styles.expandedPressable}
          >
            {renderExpanded()}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
});

function isActive(stage: TransactionStatus['stage']): boolean {
  return stage === 'burning' || stage === 'attesting' || stage === 'minting';
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  island: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#000000',
    zIndex: 999,
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pillPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pillPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expandedPressable: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  topBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bigValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
  },
  segments: {
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerStage: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    fontVariant: ['tabular-nums'],
  },
});
