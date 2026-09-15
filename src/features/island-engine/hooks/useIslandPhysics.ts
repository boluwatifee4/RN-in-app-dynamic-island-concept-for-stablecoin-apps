import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export const ISLAND_SPECS = {
  COMPACT_HEIGHT: 44,
  COMPACT_WIDTH: 220,
  COMPACT_RADIUS: 22,

  EXPANDED_HEIGHT: 260,
  EXPANDED_RADIUS: 42,

  // Apple-like spring physics
  SPRING_SNAPPY: { damping: 18, stiffness: 220, mass: 0.8 },
  SPRING_SMOOTH: { damping: 24, stiffness: 160, mass: 1 },
  SPRING_EXPAND: { damping: 14, stiffness: 240, mass: 0.75 },
  SPRING_COLLAPSE: { damping: 20, stiffness: 280, mass: 0.7 },
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

  const containerOpacity = useSharedValue(visible ? 1 : 0);
  const containerScale = useSharedValue(visible ? 1 : 0);
  
  const width = useSharedValue(ISLAND_SPECS.COMPACT_WIDTH);
  const height = useSharedValue(ISLAND_SPECS.COMPACT_HEIGHT);
  const borderRadius = useSharedValue(ISLAND_SPECS.COMPACT_RADIUS);

  // Staggered contents
  const pillContentOpacity = useSharedValue(visible && !isExpanded ? 1 : 0);
  const expandedContentOpacity = useSharedValue(0);

  const collapseTray = useCallback(() => {
    if (isActiveRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);

    // Fade out expanded content first
    expandedContentOpacity.value = withTiming(0, { duration: 100 });
    
    // Then collapse the container with a delay
    width.value = withDelay(100, withSpring(ISLAND_SPECS.COMPACT_WIDTH, ISLAND_SPECS.SPRING_COLLAPSE));
    height.value = withDelay(100, withSpring(ISLAND_SPECS.COMPACT_HEIGHT, ISLAND_SPECS.SPRING_COLLAPSE));
    borderRadius.value = withDelay(100, withSpring(ISLAND_SPECS.COMPACT_RADIUS, ISLAND_SPECS.SPRING_COLLAPSE));

    // Finally fade pill content back in
    pillContentOpacity.value = withDelay(220, withTiming(1, { duration: 200 }));
  }, [width, height, borderRadius, expandedContentOpacity, pillContentOpacity]);

  const expandTray = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isActiveRef.current = true;
    setIsExpanded(true);

    // Fade out pill
    pillContentOpacity.value = withTiming(0, { duration: 80 });

    // Morph container out immediately
    width.value = withSpring(expandedWidth, ISLAND_SPECS.SPRING_EXPAND);
    height.value = withSpring(ISLAND_SPECS.EXPANDED_HEIGHT, ISLAND_SPECS.SPRING_SMOOTH);
    borderRadius.value = withSpring(ISLAND_SPECS.EXPANDED_RADIUS, ISLAND_SPECS.SPRING_SMOOTH);

    // Fade in expanded content with a delay so it doesn't clip
    expandedContentOpacity.value = withDelay(140, withTiming(1, { duration: 200 }));
  }, [width, height, borderRadius, expandedContentOpacity, pillContentOpacity, expandedWidth]);

  const markIdle = useCallback(() => {
    isActiveRef.current = false;
  }, []);

  const dismiss = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimation(pillContentOpacity);
    cancelAnimation(expandedContentOpacity);

    // Fade out all contents immediately
    pillContentOpacity.value = withTiming(0, { duration: 100 });
    expandedContentOpacity.value = withTiming(0, { duration: 100 });

    // Shrink
    width.value = withSpring(ISLAND_SPECS.COMPACT_HEIGHT, ISLAND_SPECS.SPRING_COLLAPSE);
    height.value = withSpring(ISLAND_SPECS.COMPACT_HEIGHT, ISLAND_SPECS.SPRING_COLLAPSE);
    borderRadius.value = withSpring(ISLAND_SPECS.COMPACT_RADIUS, ISLAND_SPECS.SPRING_COLLAPSE);

    // Fade/scale out whole container
    containerOpacity.value = withDelay(180, withTiming(0, { duration: 200 }));
    containerScale.value = withDelay(180, withTiming(0, { duration: 200 }, () => {
      runOnJS(setRenderMounted)(false);
      runOnJS(setIsExpanded)(false);
      if (onDismiss) runOnJS(onDismiss)();
    }));
  }, [onDismiss, pillContentOpacity, expandedContentOpacity, width, height, borderRadius, containerOpacity, containerScale]);

  useEffect(() => {
    if (visible) {
      setRenderMounted(true);
      containerOpacity.value = withSpring(1, ISLAND_SPECS.SPRING_SNAPPY);
      containerScale.value = withSpring(1, ISLAND_SPECS.SPRING_SNAPPY);
      
      // Reset values if appearing fresh
      if (!isExpanded) {
        width.value = ISLAND_SPECS.COMPACT_WIDTH;
        height.value = ISLAND_SPECS.COMPACT_HEIGHT;
        borderRadius.value = ISLAND_SPECS.COMPACT_RADIUS;
        pillContentOpacity.value = withDelay(140, withTiming(1, { duration: 200 }));
      }
    } else {
      dismiss();
    }
  }, [visible]);

  const islandContainerStyle = useAnimatedStyle(() => {
    // topInset + 11 places it safely below the physical dynamic island.
    // E.g. topInset is ~59 on iPhone 15 Pro, so top is ~70.
    const topOffset = topInset + 11;
    
    return {
      top: topOffset,
      width: width.value,
      height: height.value,
      borderRadius: borderRadius.value,
      opacity: containerOpacity.value,
      transform: [{ scale: containerScale.value }],
    };
  });

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillContentOpacity.value,
  }));

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: expandedContentOpacity.value,
  }));

  return {
    isExpanded,
    renderMounted,
    expandTray,
    collapseTray,
    dismiss,
    markIdle,
    islandContainerStyle,
    pillStyle,
    expandedStyle,
  };
}
