import { Platform, ViewStyle } from "react-native";
import { colors } from "./colors";

const createShadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number
): ViewStyle => {
  if (Platform.OS === "android") {
    return {
      elevation,
      shadowColor: colors.shadowColor,
    };
  }

  // iOS + web share soft shadow properties through React Native style props.
  return {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur,
  };
};

// Soft depth scale for minimal luxury UI cards/surfaces.
export const shadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  soft: createShadow(2, 6, 0.07, 1),
  medium: createShadow(4, 12, 0.1, 2),
  lifted: createShadow(8, 18, 0.12, 4),
} as const;

// Interaction tokens for subtle state feedback.
export const interaction = {
  pressScale: 0.985,
  hoverLiftY: -1,
} as const;
