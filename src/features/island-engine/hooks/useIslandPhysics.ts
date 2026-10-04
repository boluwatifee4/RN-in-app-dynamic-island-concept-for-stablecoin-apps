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
import { ISLAND_SPRINGS } from '../../../design-system/tokens/motion';

export const ISLAND_SPECS = {
  // Matches the hardware cutout: 37pt capsule, radius = height / 2.
  COMPACT_HEIGHT: 37,
  COMPACT_RADIUS: 18.5,

  EXPANDED_HEIGHT: 160,
  EXPANDED_RADIUS: 42,

  // Distance from the physical screen top to the hardware cutout top
  // (≈11pt when topInset is 59, ≈14pt when topInset is 62).
  CUTOUT_TOP_INSET: 48,
  MIN_TOP_OFFSET: 8,
};

export function useIslandPhysics(
  visible: boolean,
  compactWidth: number,
  expandedWidth: number,
  topInset: number,
  onDismiss?: () => void
) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderMounted, setRenderMounted] = useState(visible);
  const isActiveRef = useRef(false);

  const containerOpacity = useSharedValue(visible ? 1 : 0);
  const containerScale = useSharedValue(visible ? 1 : 0);

  const width = useSharedValue(compactWidth);
  const height = useSharedValue(ISLAND_SPECS.COMPACT_HEIGHT);
  const borderRadius = useSharedValue(ISLAND_SPECS.COMPACT_RADIUS);

  // Crossfaded content — both trees stay mounted so fades actually play.
  const pillContentOpacity = useSharedValue(visible ? 1 : 0);
  const expandedContentOpacity = useSharedValue(0);

  const collapseTray = useCallback(() => {
    if (isActiveRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);

    // Expanded content out immediately, shape morphs right away too.
    expandedContentOpacity.value = withTiming(0, { duration: 90 });

    width.value = withSpring(compactWidth, ISLAND_SPRINGS.morph);
    height.value = withSpring(ISLAND_SPECS.COMPACT_HEIGHT, ISLAND_SPRINGS.morph);
    borderRadius.value = withSpring(ISLAND_SPECS.COMPACT_RADIUS, ISLAND_SPRINGS.morph);

    // Compact content fades in once the capsule is nearly reformed.
    pillContentOpacity.value = withDelay(140, withTiming(1, { duration: 160 }));
  }, [compactWidth, width, height, borderRadius, expandedContentOpacity, pillContentOpacity]);

  const expandTray = useCallback(() => {
    if (isActiveRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isActiveRef.current = true;
    setIsExpanded(true);

    // Compact content out, shape morphs in lockstep (one spring for all axes).
    pillContentOpacity.value = withTiming(0, { duration: 90 });

    width.value = withSpring(expandedWidth, ISLAND_SPRINGS.morph);
    height.value = withSpring(ISLAND_SPECS.EXPANDED_HEIGHT, ISLAND_SPRINGS.morph);
    borderRadius.value = withSpring(ISLAND_SPECS.EXPANDED_RADIUS, ISLAND_SPRINGS.morph);

    // Expanded content fades in as the shape nears full size.
    expandedContentOpacity.value = withDelay(130, withTiming(1, { duration: 170 }));
  }, [expandedWidth, width, height, borderRadius, expandedContentOpacity, pillContentOpacity]);

  const markIdle = useCallback(() => {
    isActiveRef.current = false;
  }, []);

  const dismiss = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimation(pillContentOpacity);
    cancelAnimation(expandedContentOpacity);

    pillContentOpacity.value = withTiming(0, { duration: 100 });
    expandedContentOpacity.value = withTiming(0, { duration: 100 });

    // Snap back to a true capsule (width -> compact WIDTH) before fading out.
    width.value = withSpring(compactWidth, ISLAND_SPRINGS.morph);
    height.value = withSpring(ISLAND_SPECS.COMPACT_HEIGHT, ISLAND_SPRINGS.morph);
    borderRadius.value = withSpring(ISLAND_SPECS.COMPACT_RADIUS, ISLAND_SPRINGS.morph);

    containerOpacity.value = withDelay(180, withTiming(0, { duration: 200 }));
    containerScale.value = withDelay(180, withTiming(0, { duration: 200 }, () => {
      runOnJS(setRenderMounted)(false);
      runOnJS(setIsExpanded)(false);
      if (onDismiss) runOnJS(onDismiss)();
    }));
  }, [onDismiss, compactWidth, pillContentOpacity, expandedContentOpacity, width, height, borderRadius, containerOpacity, containerScale]);

  useEffect(() => {
    if (visible) {
      setRenderMounted(true);
      containerOpacity.value = withSpring(1, ISLAND_SPRINGS.snappy);
      containerScale.value = withSpring(1, ISLAND_SPRINGS.snappy);

      if (!isExpanded) {
        width.value = compactWidth;
        height.value = ISLAND_SPECS.COMPACT_HEIGHT;
        borderRadius.value = ISLAND_SPECS.COMPACT_RADIUS;
        pillContentOpacity.value = withDelay(140, withTiming(1, { duration: 160 }));
      }
    } else {
      dismiss();
    }
  }, [visible]);

  // Keep the resting capsule in sync if the window size changes.
  useEffect(() => {
    if (!isExpanded && !isActiveRef.current) {
      width.value = compactWidth;
    }
  }, [compactWidth]);

  const islandContainerStyle = useAnimatedStyle(() => {
    // Sit flush inside the safe area, right where the hardware cutout lives.
    const topOffset = Math.max(
      topInset - ISLAND_SPECS.CUTOUT_TOP_INSET,
      ISLAND_SPECS.MIN_TOP_OFFSET
    );

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
