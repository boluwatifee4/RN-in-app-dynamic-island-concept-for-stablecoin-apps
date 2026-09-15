import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ActionItem {
  id: string;
  title: string;
  sub: string;
  iconName: IoniconsName;
  color: string;
  route: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'send',
    title: 'Send',
    sub: 'Instant Transfer',
    iconName: 'paper-plane',
    color: COLORS.emerald,
    route: '/(tabs)/send',
  },
  {
    id: 'bridge',
    title: 'Bridge',
    sub: 'CCTP Rail',
    iconName: 'git-compare',
    color: COLORS.cyan,
    route: '/(tabs)/bridge',
  },
  {
    id: 'remit',
    title: 'FX Remit',
    sub: 'Global Payout',
    iconName: 'swap-horizontal',
    color: COLORS.amber,
    route: '/(tabs)/fx',
  },
  {
    id: 'yield',
    title: 'Yield',
    sub: '5.25% APY',
    iconName: 'trending-up',
    color: '#818CF8',
    route: '/(tabs)/yield',
  },
];

export const QuickActionGrid = memo(function QuickActionGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
      </View>
      <View style={styles.grid}>
        {ACTIONS.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.7}
            onPress={() => router.push(act.route as any)}
            style={styles.actionCard}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${act.color}15` }]}>
              <Ionicons name={act.iconName} size={20} color={act.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{act.title}</Text>
              <Text style={styles.sub}>{act.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceGlassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sub: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

