import { BRAND, SupportedLanguage } from '../constants/brand.constants';

export type BrandConfig = typeof BRAND;
export type { SupportedLanguage };

export interface LocalizationEntry {
  key: string;
  en: string;
  am: string;
}
