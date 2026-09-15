import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';

interface GlowBadgeProps {
  label: string;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber';
  icon?: React.ReactNode;
}

export function GlowBadge({
  label,
  variant = 'emerald',
  icon,
}: GlowBadgeProps) {
  const colorMap = {
    emerald: {
      color: COLORS.emerald,
      bg: 'rgba(0, 242, 157, 0.12)',
      border: 'rgba(0, 242, 157, 0.3)',
    },
    cyan: {
      color: COLORS.cyan,
      bg: 'rgba(0, 210, 255, 0.12)',
      border: 'rgba(0, 210, 255, 0.3)',
    },
    violet: {
      color: COLORS.electricViolet,
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.3)',
    },
    amber: {
      color: COLORS.amber,
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
  };

  const scheme = colorMap[variant] || colorMap.emerald;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: scheme.bg, borderColor: scheme.border },
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: scheme.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
