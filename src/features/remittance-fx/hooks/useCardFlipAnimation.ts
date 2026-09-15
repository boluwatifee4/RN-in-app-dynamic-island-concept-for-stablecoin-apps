import { useState, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SPRING_PRESETS } from '../../../design-system/tokens/motion';
import * as Haptics from 'expo-haptics';

export function useCardFlipAnimation() {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipValue = useSharedValue(0);

  const toggleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFlipped((prev) => {
      const nextState = !prev;
      flipValue.value = withSpring(nextState ? 180 : 0, SPRING_PRESETS.cardFlip);
      return nextState;
    });
  }, [flipValue]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipValue.value, [0, 180], [0, 180]);
    const opacity = interpolate(flipValue.value, [89, 90], [1, 0]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      opacity,
      zIndex: opacity > 0 ? 2 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipValue.value, [0, 180], [180, 360]);
    const opacity = interpolate(flipValue.value, [89, 90], [0, 1]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      opacity,
      zIndex: opacity > 0 ? 2 : 1,
    };
  });

  return {
    isFlipped,
    toggleFlip,
    frontAnimatedStyle,
    backAnimatedStyle,
  };
}
