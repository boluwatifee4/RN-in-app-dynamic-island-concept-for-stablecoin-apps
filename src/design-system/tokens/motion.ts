import { WithSpringConfig } from 'react-native-reanimated';

// Island springs — single source of truth for the Dynamic Island morph.
// Damping ratio ζ = damping / (2·√(stiffness·mass)).
export const ISLAND_SPRINGS = {
  // ζ ≈ 0.75 → ~3% overshoot, first peak ≈ 0.23s, settles ≈ 0.45s.
  // Drives width/height/radius together so the capsule deforms in lockstep.
  morph: { damping: 28, stiffness: 350, mass: 1 },
  // ζ ≈ 0.72 → subtle bounce for appear/dismiss scale + opacity.
  snappy: { damping: 22, stiffness: 260, mass: 0.9 },
} as const satisfies Record<string, WithSpringConfig>;

export const SPRING_PRESETS: Record<string, WithSpringConfig> = {
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
