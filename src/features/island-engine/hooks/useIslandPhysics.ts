import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export const ISLAND_SPECS = {
  COMPACT_HEIGHT: 44,
  COMPACT_WIDTH: 220,
  COMPACT_RADIUS: 22,

  EXPANDED_HEIGHT: 260,
  EXPANDED_RADIUS: 42,

  SPRING_CONFIG: {
    damping: 18,
    stiffness: 160,
    mass: 0.8,
  },
};

export function useIslandPhysics(
  visible: boolean,
  expandedWidth: number,
  topInset: number,
  onDismiss?: () => void
) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderMounted, setRenderMounted] = useState(visible);
  const isActiveRef = useRef(false);

  const progress = useSharedValue(visible ? 1 : 0);
  const width = useSharedValue(ISLAND_SPECS.COMPACT_WIDTH);
  const height = useSharedValue(ISLAND_SPECS.COMPACT_HEIGHT);
  const borderRadius = useSharedValue(ISLAND_SPECS.COMPACT_RADIUS);

  const clearIdleTimer = useCallback(() => {}, []);

  const collapseTray = useCallback(() => {
    if (isActiveRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
  }, []);

  const expandTray = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isActiveRef.current = true;
    setIsExpanded(true);
  }, []);

  const markIdle = useCallback(() => {
    isActiveRef.current = false;
  }, []);

  useEffect(() => {
    const targetWidth = isExpanded ? expandedWidth : ISLAND_SPECS.COMPACT_WIDTH;
    const targetHeight = isExpanded ? ISLAND_SPECS.EXPANDED_HEIGHT : ISLAND_SPECS.COMPACT_HEIGHT;
    const targetRadius = isExpanded ? ISLAND_SPECS.EXPANDED_RADIUS : ISLAND_SPECS.COMPACT_RADIUS;

    width.value = withSpring(targetWidth, ISLAND_SPECS.SPRING_CONFIG);
    height.value = withSpring(targetHeight, ISLAND_SPECS.SPRING_CONFIG);
    borderRadius.value = withSpring(targetRadius, ISLAND_SPECS.SPRING_CONFIG);
  }, [isExpanded, expandedWidth]);

  const dismiss = useCallback(() => {
    isActiveRef.current = false;
    progress.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(setRenderMounted)(false);
      runOnJS(setIsExpanded)(false);
      if (onDismiss) runOnJS(onDismiss)();
    });
  }, [onDismiss, progress]);

  useEffect(() => {
    if (visible) {
      setRenderMounted(true);
      progress.value = withSpring(1, ISLAND_SPECS.SPRING_CONFIG);
    } else {
      isActiveRef.current = false;
      progress.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(setRenderMounted)(false);
        runOnJS(setIsExpanded)(false);
      });
    }
  }, [visible, progress]);

  const islandContainerStyle = useAnimatedStyle(() => {
    const topOffset = topInset + 11;
    const scale = progress.value;
    const opacity = progress.value;

    return {
      top: topOffset,
      width: width.value,
      height: height.value,
      borderRadius: borderRadius.value,
      opacity,
      transform: [{ scale }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 0.6 : 0, { duration: 200 }),
  }));

  return {
    isExpanded,
    renderMounted,
    expandTray,
    collapseTray,
    dismiss,
    markIdle,
    islandContainerStyle,
    backdropStyle,
  };
}
