import { WithSpringConfig } from 'react-native-reanimated';

export const SPRING_PRESETS: Record<string, WithSpringConfig> = {
  islandExpand: {
    damping: 18,
    stiffness: 140,
    mass: 0.9,
  },
  cardFlip: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
  snappy: {
    damping: 22,
    stiffness: 220,
    mass: 0.6,
  },
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
};
