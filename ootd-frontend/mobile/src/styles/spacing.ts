// 8px spacing system for consistent rhythm across all screens.
const unit = 8;

export const spacing = {
  none: 0,
  xxs: unit * 1, // 8
  xs: unit * 2, // 16
  sm: unit * 3, // 24
  md: unit * 4, // 32
  lg: unit * 5, // 40
  xl: unit * 6, // 48
  xxl: unit * 7, // 56
  xxxl: unit * 8, // 64
} as const;

// Radius system keeps soft-corner consistency across components.
export const radii = {
  sm: 12,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const layout = {
  maxContentWidth: 760,
  maxFormWidth: 560,
} as const;
