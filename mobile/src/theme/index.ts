/**
 * Centralized design tokens for the app.
 *
 * Import `colors` / `spacing` instead of scattering hex literals.
 * When you add dark mode, create a second palette and switch here.
 */

export const colors = {
  /** Brand / interactive elements */
  primary: "#2563EB",
  primaryLight: "#DBEAFE",

  /** Backgrounds */
  background: "#F9FAFB",
  surface: "#FFFFFF",

  /** Text hierarchy */
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textPlaceholder: "#9CA3AF",

  /** Borders & dividers */
  border: "#D1D5DB",
  divider: "#E5E7EB",

  /** Semantic */
  destructive: "#DC2626",
  success: "#16A34A",
  warning: "#D97706",

  /** Misc */
  white: "#FFFFFF",
  black: "#000000",
  shadow: "#000000",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/**
 * Typography tokens — use these in new screens instead of raw fontSize/fontWeight values.
 * Example: { fontSize: typography.size["2xl"], fontWeight: typography.weight.bold }
 */
export const typography = {
  /** Size scale */
  size: {
    xs: 11,
    sm: 13,
    base: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 34,
  },
  /** Weight scale (React Native string literals) */
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  /** Line-height multipliers */
  leading: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;
