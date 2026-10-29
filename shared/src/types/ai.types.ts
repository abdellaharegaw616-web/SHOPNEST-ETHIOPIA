import { SupportedLanguage } from '../constants/brand.constants';

export interface RecommendedProductDTO {
  id: string;
  title: string;
  titleAmharic?: string;
  slug: string;
  price: number;
  discountPrice?: number;
  currency: 'ETB';
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  categorySlug?: string;
  recommendationReason: string;
}

export interface ShoppingAssistantRequestDTO {
  message: string;
  language?: SupportedLanguage;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ShoppingAssistantResponseDTO {
  answer: string;
  language: SupportedLanguage;
  isMock: boolean;
  provider: string;
  products: RecommendedProductDTO[];
  explanation?: string;
  relaxedCriteria?: string | null;
  suggestedFollowUps?: string[];
}

