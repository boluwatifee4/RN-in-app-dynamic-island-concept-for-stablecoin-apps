import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NETWORKS } from '../../constants/chains';
import { COLORS, RADIUS } from '../../design-system/tokens/colors';

interface NetworkPillProps {
  networkId: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function NetworkPill({
  networkId,
  size = 'md',
  showDot = true,
}: NetworkPillProps) {
  const network = NETWORKS[networkId.toLowerCase()] || NETWORKS.base;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSm ? styles.containerSm : styles.containerMd,
        { borderColor: `${network.color}40`, backgroundColor: `${network.color}15` },
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            isSm ? styles.dotSm : styles.dotMd,
            { backgroundColor: network.color },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          isSm ? styles.textSm : styles.textMd,
          { color: COLORS.textPrimary },
        ]}
      >
        {network.shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 7,
  },
  dot: {
    borderRadius: RADIUS.full,
  },
  dotSm: {
    width: 6,
    height: 6,
  },
  dotMd: {
    width: 8,
    height: 8,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 13,
  },
});
