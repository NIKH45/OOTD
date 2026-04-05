// Neutral elegance palette for a premium minimal fashion UI.
export const palette = {
  background: "#F7F5F2",
  surface: "#FFFFFF",
  primary: "#E8E3DC",
  secondary: "#CFC6BB",
  textPrimary: "#2C2C2C",
  textSecondary: "#7A7A7A",
  textMuted: "#9A948D",
  white: "#FFFFFF",
} as const;

// Semantic tokens keep component code intention-focused and consistent.
export const colors = {
  background: palette.background,
  backgroundAlt: palette.primary,
  surface: palette.surface,
  surfaceSoft: "#F2EEE8",

  textPrimary: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,
  textOnDark: palette.white,

  accent: palette.primary,
  accentStrong: palette.secondary,
  primaryButton: palette.textPrimary,
  primaryButtonText: palette.white,

  borderSubtle: "rgba(44, 44, 44, 0.06)",
  borderSoft: "rgba(207, 198, 187, 0.55)",
  shadowColor: "rgba(44, 44, 44, 0.10)",

  success: "#4F786A",
  warning: "#9B7A44",
  danger: "#AD5656",
} as const;

export type ColorToken = keyof typeof colors;
