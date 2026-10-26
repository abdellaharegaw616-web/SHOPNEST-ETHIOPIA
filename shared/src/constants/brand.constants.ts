/**
 * Brand Constants for ShopNest Ethiopia
 * "Your Marketplace, Your Way." / "የእርስዎ የገበያ መድረክ"
 */

export const BRAND = {
  name: 'ShopNest Ethiopia',
  shortName: 'ShopNest',
  tagline: 'Your Marketplace, Your Way.',
  amharicTagline: 'የእርስዎ የገበያ መድረክ',
  country: 'Ethiopia',
  currency: 'ETB',
  currencySymbol: 'Br',
  locale: {
    default: 'en',
    supported: ['en', 'am'] as const,
  },
  colors: {
    primary: '#F97316',        // Primary orange
    primaryHover: '#EA580C',   // Hover orange
    primaryLight: '#FFF7ED',   // Light orange surface
    textDark: '#1F2937',       // Main text
    textSecondary: '#6B7280',  // Secondary text
    surfaceWhite: '#FFFFFF',   // Card & surface background
    bgNeutral: '#F9FAFB',      // Page background
    border: '#E5E7EB',         // Border
  },
} as const;

export type SupportedLanguage = (typeof BRAND.locale.supported)[number];
