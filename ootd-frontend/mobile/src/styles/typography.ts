import { Platform, TextStyle } from "react-native";
import { colors } from "./colors";

// Typography family tokens with platform-safe fallbacks.
const headingFontFamily = Platform.select({
  ios: "Times New Roman",
  android: "serif",
  web: "'Georgia', 'Times New Roman', serif",
  default: "serif",
});

const bodyFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  web: "'Inter', 'Helvetica Neue', sans-serif",
  default: "sans-serif",
});

const baseHeading: TextStyle = {
  fontFamily: headingFontFamily,
  color: colors.textPrimary,
};

const baseBody: TextStyle = {
  fontFamily: bodyFontFamily,
  color: colors.textSecondary,
};

export const typography = {
  display: {
    ...baseHeading,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "600",
    letterSpacing: 0.3,
  } as TextStyle,
  h1: {
    ...baseHeading,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: 0.2,
  } as TextStyle,
  h2: {
    ...baseHeading,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
    letterSpacing: 0.15,
  } as TextStyle,
  h3: {
    ...baseHeading,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: 0.1,
  } as TextStyle,
  bodyLg: {
    ...baseBody,
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "400",
  } as TextStyle,
  bodyMd: {
    ...baseBody,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400",
  } as TextStyle,
  bodySm: {
    ...baseBody,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  } as TextStyle,
  caption: {
    ...baseBody,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    letterSpacing: 0.15,
  } as TextStyle,
  button: {
    ...baseBody,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: 0.15,
  } as TextStyle,
  label: {
    ...baseBody,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.12,
  } as TextStyle,
} as const;

export const fontFamilies = {
  heading: headingFontFamily,
  body: bodyFontFamily,
} as const;
