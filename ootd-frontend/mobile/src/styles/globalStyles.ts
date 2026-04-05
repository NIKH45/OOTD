import { Platform, PressableStateCallbackType, StyleSheet, ViewStyle } from "react-native";
import { colors } from "./colors";
import { interaction, shadows } from "./shadows";
import { layout, radii, spacing } from "./spacing";
import { typography } from "./typography";

// Global reusable style primitives for screens and shared components.
export const globalStyles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  centeredContent: {
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xs,
    ...shadows.soft,
  },
  cardLuxury: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    ...shadows.medium,
  },
  titleText: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  bodyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  mutedText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  inputBase: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    color: colors.textPrimary,
    ...shadows.soft,
  },
  buttonPrimary: {
    backgroundColor: colors.primaryButton,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  buttonPrimaryText: {
    ...typography.button,
    color: colors.primaryButtonText,
  },
  buttonSecondary: {
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

// Use with Pressable style callback for subtle luxury interactions.
export const getInteractivePressableStyle = (
  state: PressableStateCallbackType
): ViewStyle[] => {
  const pressedStyle: ViewStyle = state.pressed
    ? {
        opacity: 0.94,
        transform: [{ scale: interaction.pressScale }],
      }
    : {
        opacity: 1,
        transform: [{ scale: 1 }],
      };

  // `hovered` exists on web and is ignored on native.
  const hoverStyle: ViewStyle =
    Platform.OS === "web" && state.hovered
      ? {
          transform: [{ translateY: interaction.hoverLiftY }],
        }
      : {};

  return [pressedStyle, hoverStyle];
};

export const tokens = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
} as const;
