import mongoose from 'mongoose';
import { Product, IProduct, Category } from '../../models';
import { logger } from '../../utils/logger';

export interface ParsedSearchIntent {
  keywords: string[];
  categoryHint?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  language: 'en' | 'am';
}

export interface CatalogSearchResult {
  products: IProduct[];
  relaxedCriteria: string | null;
  totalFound: number;
}

export class ProductSearchService {
  /**
   * Deterministically parses customer message into structured shopping intent
   */
  static parseIntent(message: string, language: 'en' | 'am' = 'en'): ParsedSearchIntent {
    const text = message.toLowerCase();

    // 1. Extract Price Bounds (ETB / Birr / ብር)
    // Examples: "under 40,000 ETB", "below 15000 birr", "less than 20000", "በ15,000 ብር ውስጥ", "ከ40000 ብር በታች"
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    // Remove commas from numbers (e.g. 40,000 -> 40000)
    const normalizedText = text.replace(/(\d+),(\d+)/g, '$1$2');

    const maxPricePatterns = [
      /(?:under|below|less than|up to|max(?:imum)?)\s*(?:etb|birr|ብር)?\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:etb|birr|ብር)?\s*(?:በታች|ውስጥ|ያነሰ)/i,
      /(?:ከ)\s*(\d+(?:\.\d+)?)\s*(?:ብር|etb)?\s*በታች/i,
      /(\d+(?:\.\d+)?)\s*(?:etb|birr|ብር)\s*(?:max|budget|limit)/i,
      /budget\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of maxPricePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0) {
          maxPrice = val;
          break;
        }
      }
    }

    const minPricePatterns = [
      /(?:above|over|more than|at least|min(?:imum)?)\s*(?:etb|birr|ብር)?\s*(\d+(?:\.\d+)?)/i,
      /(?:ከ)\s*(\d+(?:\.\d+)?)\s*(?:ብር|etb)?\s*(?:በላይ)/i,
    ];

    for (const pattern of minPricePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0) {
          minPrice = val;
          break;
        }
      }
    }

    // 2. Extract Category Hints
    let categoryHint: string | undefined;

    if (
      normalizedText.includes('laptop') ||
      normalizedText.includes('computer') ||
      normalizedText.includes('desktop') ||
      normalizedText.includes('monitor') ||
      normalizedText.includes('keyboard') ||
      normalizedText.includes('ኮምፒውተር') ||
      normalizedText.includes('ኮምፒውተሮ') ||
      normalizedText.includes('ላፕቶፕ') ||
      normalizedText.includes('ላፕቶፖ')
    ) {
      categoryHint = 'computers';
    } else if (
      normalizedText.includes('phone') ||
      normalizedText.includes('smartphone') ||
      normalizedText.includes('charger') ||
      normalizedText.includes('powerbank') ||
      normalizedText.includes('power bank') ||
      normalizedText.includes('ስልክ') ||
      normalizedText.includes('ስልኮ') ||
      normalizedText.includes('ሞባይል') ||
      normalizedText.includes('ቻርጀር')
    ) {
      categoryHint = 'phones-accessories';
    } else if (
      normalizedText.includes('tv') ||
      normalizedText.includes('television') ||
      normalizedText.includes('audio') ||
      normalizedText.includes('soundbar') ||
      normalizedText.includes('speaker') ||
      normalizedText.includes('electronics') ||
      normalizedText.includes('ኤሌክትሮኒክስ') ||
      normalizedText.includes('ቴሌቪዥን')
    ) {
      categoryHint = 'electronics';
    } else if (
      normalizedText.includes('fashion') ||
      normalizedText.includes('cloth') ||
      normalizedText.includes('dress') ||
      normalizedText.includes('kemis') ||
      normalizedText.includes('habesha') ||
      normalizedText.includes('tibeb') ||
      normalizedText.includes('shirt') ||
      normalizedText.includes('ልብስ') ||
      normalizedText.includes('ቀሚስ') ||
      normalizedText.includes('ጫማ')
    ) {
      categoryHint = 'fashion';
    } else if (
      normalizedText.includes('kitchen') ||
      normalizedText.includes('jebena') ||
      normalizedText.includes('mitad') ||
      normalizedText.includes('coffee maker') ||
      normalizedText.includes('cookware') ||
      normalizedText.includes('blender') ||
      normalizedText.includes('ወጥ ቤት') ||
      normalizedText.includes('ጀበና') ||
      normalizedText.includes('ምጣድ')
    ) {
      categoryHint = 'home-kitchen';
    } else if (
      normalizedText.includes('coffee') ||
      normalizedText.includes('yirgacheffe') ||
      normalizedText.includes('beans') ||
      normalizedText.includes('ቡና') ||
      normalizedText.includes('ይርጋጨፌ')
    ) {
      categoryHint = 'ethiopian-coffee-spices';
    } else if (
      normalizedText.includes('beauty') ||
      normalizedText.includes('skin') ||
      normalizedText.includes('soap') ||
      normalizedText.includes('oil') ||
      normalizedText.includes('ውበት') ||
      normalizedText.includes('ሳሙና') ||
      normalizedText.includes('ቅባት')
    ) {
      categoryHint = 'beauty-personal-care';
    }

    // 3. Extract Keywords (stopwords filtered)
    const stopWords = new Set([
      'find', 'show', 'me', 'a', 'an', 'the', 'under', 'below', 'above', 'in', 'birr', 'etb',
      'please', 'for', 'with', 'and', 'or', 'of', 'to', 'is', 'are', 'i', 'want', 'need', 'looking',
      'good', 'best', 'suit', 'suitable', 'available', 'cheap', 'which', 'products', 'what', 'can',
      'አሳየኝ', 'ፈልግልኝ', 'ብር', 'ውስጥ', 'ያሉ', 'የሚሆን', 'ለእኔ', 'ከ', 'በታች', 'በላይ', 'ጥሩ', 'እባክህ'
    ]);

    const words = text
      .replace(/[^\w\s\u1200-\u137F]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w) && isNaN(Number(w)));

    return {
      keywords: words,
      categoryHint,
      minPrice,
      maxPrice,
      inStockOnly: true,
      language,
    };
  }

  /**
   * Deterministically searches MongoDB for published products matching criteria
   */
  static async searchCatalog(
    intent: ParsedSearchIntent,
    limit: number = 6
  ): Promise<CatalogSearchResult> {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      logger.warn('[ProductSearchService] Database connection is not ready');
      return { products: [], relaxedCriteria: null, totalFound: 0 };
    }

    // Resolve category ObjectId if category hint is present
    let categoryId: mongoose.Types.ObjectId | undefined;
    if (intent.categoryHint) {
      const cat = await Category.findOne({
        slug: new RegExp(`^${intent.categoryHint}`, 'i'),
        isActive: true,
      });
      if (cat) {
        categoryId = cat._id as mongoose.Types.ObjectId;
      }
    }

    // 1. Strict Query
    const strictFilter: Record<string, unknown> = {
      isPublished: true,
    };

    if (intent.inStockOnly) {
      strictFilter.stock = { $gt: 0 };
    }

    if (categoryId) {
      strictFilter.category = categoryId;
    }

    if (intent.minPrice !== undefined || intent.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (intent.minPrice !== undefined) priceFilter.$gte = intent.minPrice;
      if (intent.maxPrice !== undefined) priceFilter.$lte = intent.maxPrice;
      strictFilter.price = priceFilter;
    }

    // Keyword condition
    if (intent.keywords.length > 0) {
      const keywordRegexes = intent.keywords.map((kw) => new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      strictFilter.$or = [
        { title: { $in: keywordRegexes } },
        { titleAmharic: { $in: keywordRegexes } },
        { description: { $in: keywordRegexes } },
        { descriptionAmharic: { $in: keywordRegexes } },
      ];
    }

    let products = await Product.find(strictFilter)
      .populate('category', 'name nameAmharic slug')
      .sort({ rating: -1, stock: -1, createdAt: -1 })
      .limit(limit);

    if (products.length > 0) {
      return {
        products,
        relaxedCriteria: null,
        totalFound: products.length,
      };
    }

    // 2. Relaxation Stage 1: Relax Price Ceiling if no products were found within price budget
    if (intent.maxPrice !== undefined) {
      const relaxedPriceFilter: Record<string, unknown> = {
        isPublished: true,
        ...(intent.inStockOnly ? { stock: { $gt: 0 } } : {}),
        ...(categoryId ? { category: categoryId } : {}),
      };

      if (intent.keywords.length > 0) {
        const keywordRegexes = intent.keywords.map((kw) => new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
        relaxedPriceFilter.$or = [
          { title: { $in: keywordRegexes } },
          { titleAmharic: { $in: keywordRegexes } },
          { description: { $in: keywordRegexes } },
          { descriptionAmharic: { $in: keywordRegexes } },
        ];
      }

      // Find closest products sorted by price ascending
      products = await Product.find(relaxedPriceFilter)
        .populate('category', 'name nameAmharic slug')
        .sort({ price: 1, rating: -1 })
        .limit(limit);

      if (products.length > 0) {
        const relaxationMsg =
          intent.language === 'am'
            ? `ከ ${intent.maxPrice.toLocaleString()} ብር በታች ምርት ባለመገኘቱ፣ በዋጋ ቅርብ የሆኑ ተለዋጭ ምርቶች ተመርጠዋል።`
            : `No matching items found under ${intent.maxPrice.toLocaleString()} ETB. Relaxed the price ceiling to surface the closest available alternatives.`;

        return {
          products,
          relaxedCriteria: relaxationMsg,
          totalFound: products.length,
        };
      }
    }

    // 3. Relaxation Stage 2: Relax Category or Keyword to category general match
    if (categoryId) {
      products = await Product.find({
        isPublished: true,
        stock: { $gt: 0 },
        category: categoryId,
      })
        .populate('category', 'name nameAmharic slug')
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit);

      if (products.length > 0) {
        const relaxationMsg =
          intent.language === 'am'
            ? `ለተጠቀሰው መስፈርት ትክክለኛ ምርት ባለመገኘቱ፣ በምድቡ ውስጥ ያሉ ታዋቂ ምርቶች ተመርጠዋል።`
            : `Specific query criteria yielded zero direct matches. Showing top recommended products from this category.`;

        return {
          products,
          relaxedCriteria: relaxationMsg,
          totalFound: products.length,
        };
      }
    }

    // 4. Relaxation Stage 3: General top published in-stock items
    products = await Product.find({
      isPublished: true,
      stock: { $gt: 0 },
    })
      .populate('category', 'name nameAmharic slug')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit);

    if (products.length > 0) {
      const relaxationMsg =
        intent.language === 'am'
          ? `የተፈለገው ምርት አልተገኘም። በመደብራችን ያሉ ተወዳጅ አማራጮችን ይመልከቱ።`
          : `We could not find an exact match for your request. Here are popular featured products from our Ethiopian catalog.`;

      return {
        products,
        relaxedCriteria: relaxationMsg,
        totalFound: products.length,
      };
    }

    return {
      products: [],
      relaxedCriteria: null,
      totalFound: 0,
    };
  }

  /**
   * Verifies an array of candidate product IDs strictly against real published DB records
   */
  static async verifyProductIds(candidateIds: string[]): Promise<IProduct[]> {
    if (
      !candidateIds ||
      candidateIds.length === 0 ||
      (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test')
    ) {
      return [];
    }

    const validObjectIds = candidateIds.filter((id) => mongoose.isValidObjectId(id));
    if (validObjectIds.length === 0) {
      return [];
    }

    return Product.find({
      _id: { $in: validObjectIds },
      isPublished: true,
    }).populate('category', 'name nameAmharic slug');
  }
}
