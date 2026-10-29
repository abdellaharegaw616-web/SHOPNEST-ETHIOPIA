import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export interface ContextProductItem {
  id: string;
  title: string;
  titleAmharic?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  description: string;
  descriptionAmharic?: string;
  rating: number;
  reviewCount: number;
}

export interface GenerateChatOptions {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  contextProducts?: ContextProductItem[];
  language?: 'en' | 'am';
}

export interface AIProviderResponse {
  answer: string;
  recommendedProductIds: string[];
  recommendationReasons: Record<string, string>;
  isMock: boolean;
  providerName: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface IAIProvider {
  readonly name: string;
  readonly isMock: boolean;
  readonly model: string;
  generateShoppingAdvice(options: GenerateChatOptions): Promise<AIProviderResponse>;
}

/**
 * Deterministic Mock AI Provider for local testing and development
 */
export class MockAIProvider implements IAIProvider {
  public readonly name = 'ShopNest-Mock-Engine';
  public readonly isMock = true;
  public readonly model = 'mock-simulated-v1';

  async generateShoppingAdvice(options: GenerateChatOptions): Promise<AIProviderResponse> {
    const { userMessage, contextProducts = [], language = 'en' } = options;
    const isAmharic = language === 'am';

    // If no context products are available
    if (contextProducts.length === 0) {
      const answer = isAmharic
        ? `ይቅርታ፣ በጠየቁት መስፈርት መሰረት በአሁኑ ሰዓት በመደብራችን የተገኘ ምርት የለም። እባክዎ ሌሎች ቃላትን በመጠቀም ይፈልጉ ወይም በጀትዎን ያሻሽሉ። (ማስታወሻ፡ የሙከራ ሞክ ሁነታ)`
        : `We could not find any products in our catalog matching your specific criteria. Please try adjusting your search terms or expanding your budget. (Simulated response - AI mock mode active)`;

      return {
        answer,
        recommendedProductIds: [],
        recommendationReasons: {},
        isMock: true,
        providerName: this.name,
        model: this.model,
      };
    }

    // Select up to 3 best matching products from context
    const selected = contextProducts.slice(0, 3);
    const recommendedProductIds = selected.map((p) => p.id);
    const recommendationReasons: Record<string, string> = {};

    let answer = '';
    const queryLower = userMessage.toLowerCase();

    if (isAmharic) {
      answer = `እንኳን ወደ ሾፕኔስት ኢትዮጵያ በደህና መጡ! ለጠየቁት "${userMessage}" የሚሆኑ ${selected.length} ምርጥ እቃዎችን ከመደብራችን መርጠን አዘጋጅተናል፦\n\n`;
      selected.forEach((prod, idx) => {
        const title = prod.titleAmharic || prod.title;
        const price = prod.discountPrice || prod.price;
        const reason = `በ ${price.toLocaleString()} ብር ተመጣጣኝ ዋጋ ያለው፣ ጥራቱ የተረጋገጠ እና በክምችት (${prod.stock} ፍሬ) የሚገኝ ነው።`;
        recommendationReasons[prod.id] = reason;
        answer += `${idx + 1}. **${title}** — ${price.toLocaleString()} ETB\n   ${reason}\n`;
      });
      answer += `\n(ማስታወሻ፡ ይህ በልማት ሁነታ የተመሰለ የሞክ ምላሽ ነው። የእውነተኛ AI ሞዴል ጥሪ አልተደረገም።)`;
    } else {
      if (queryLower.includes('laptop') || queryLower.includes('student')) {
        answer = `Welcome to ShopNest Ethiopia! Here are the best computing options tailored for your needs under your budget:\n\n`;
      } else if (queryLower.includes('phone')) {
        answer = `Here are the top smartphone choices available right now with genuine Ethiopian warranty and fast Addis delivery:\n\n`;
      } else {
        answer = `Based on your request, here are verified recommendations from ShopNest Ethiopia's genuine catalog:\n\n`;
      }

      selected.forEach((prod, idx) => {
        const price = prod.discountPrice || prod.price;
        const reason = `Great value at ${price.toLocaleString()} ETB with authentic specifications and ${prod.stock} units currently in stock.`;
        recommendationReasons[prod.id] = reason;
        answer += `${idx + 1}. **${prod.title}** — ${price.toLocaleString()} ETB\n   ${reason}\n`;
      });

      answer += `\n(Simulated response — AI mock mode is active for local development without external API charges.)`;
    }

    return {
      answer,
      recommendedProductIds,
      recommendationReasons,
      isMock: true,
      providerName: this.name,
      model: this.model,
      usage: {
        promptTokens: 120,
        completionTokens: 85,
        totalTokens: 205,
      },
    };
  }
}

/**
 * Official Google Gemini REST API Provider
 */
export class GeminiAIProvider implements IAIProvider {
  public readonly name = 'Google-Gemini';
  public readonly isMock = false;
  public readonly model: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash', timeoutMs: number = 15000) {
    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async generateShoppingAdvice(options: GenerateChatOptions): Promise<AIProviderResponse> {
    const { systemPrompt, userMessage, contextProducts = [], language = 'en' } = options;

    const catalogContext = contextProducts.map((p) => ({
      id: p.id,
      title: language === 'am' && p.titleAmharic ? p.titleAmharic : p.title,
      priceETB: p.discountPrice || p.price,
      stock: p.stock,
      category: p.category,
      rating: p.rating,
      description: language === 'am' && p.descriptionAmharic ? p.descriptionAmharic : p.description,
    }));

    const promptText = `
${systemPrompt}

Target Customer Language: ${language === 'am' ? 'Amharic (አማርኛ)' : 'English'}

Verified Available Products from Database (SOURCE OF TRUTH - Recommend ONLY from this list using their exact ID):
${JSON.stringify(catalogContext, null, 2)}

Customer Query: "${userMessage}"

Respond strictly with valid JSON conforming to this schema:
{
  "answer": "Polite, helpful customer response in the requested language explaining the recommendations or limitations",
  "recommendations": [
    {
      "productId": "Exact ID from the verified products list",
      "reason": "Clear explanation of why this product fits the customer's request"
    }
  ]
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS || 1000,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 429) {
        throw new AppError('AI provider rate limit reached. Please try again shortly.', 429);
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[GeminiAIProvider] Error status ${response.status}: ${errorText}`);
        throw new AppError(`AI provider request failed with status ${response.status}`, 502);
      }

      const data = (await response.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new AppError('Empty response received from AI model', 502);
      }

      // Safely parse JSON from model output
      let parsed: { answer: string; recommendations?: Array<{ productId: string; reason: string }> };
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Fallback cleanup if model wraps in markdown fence
        const clean = rawText.replace(/```(?:json)?/g, '').trim();
        parsed = JSON.parse(clean);
      }

      const recommendedProductIds: string[] = [];
      const recommendationReasons: Record<string, string> = {};

      if (Array.isArray(parsed.recommendations)) {
        for (const rec of parsed.recommendations) {
          if (rec.productId && typeof rec.productId === 'string') {
            recommendedProductIds.push(rec.productId);
            if (rec.reason) {
              recommendationReasons[rec.productId] = rec.reason;
            }
          }
        }
      }

      return {
        answer: parsed.answer || 'Here are our recommendations based on your request.',
        recommendedProductIds,
        recommendationReasons,
        isMock: false,
        providerName: this.name,
        model: this.model,
        usage: {
          promptTokens: data?.usageMetadata?.promptTokenCount,
          completionTokens: data?.usageMetadata?.candidatesTokenCount,
          totalTokens: data?.usageMetadata?.totalTokenCount,
        },
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new AppError('AI provider request timed out. Please try again.', 504);
      }
      if (err instanceof AppError) {
        throw err;
      }
      logger.error('[GeminiAIProvider] Unexpected error calling Gemini API:', err);
      throw new AppError('Failed to communicate with AI provider', 502);
    }
  }
}

/**
 * Official OpenAI-Compatible REST API Provider
 */
export class OpenAIAIProvider implements IAIProvider {
  public readonly name = 'OpenAI';
  public readonly isMock = false;
  public readonly model: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, model: string = 'gpt-4o-mini', timeoutMs: number = 15000) {
    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async generateShoppingAdvice(options: GenerateChatOptions): Promise<AIProviderResponse> {
    const { systemPrompt, userMessage, contextProducts = [], language = 'en' } = options;

    const catalogContext = contextProducts.map((p) => ({
      id: p.id,
      title: language === 'am' && p.titleAmharic ? p.titleAmharic : p.title,
      priceETB: p.discountPrice || p.price,
      stock: p.stock,
      category: p.category,
      rating: p.rating,
      description: language === 'am' && p.descriptionAmharic ? p.descriptionAmharic : p.description,
    }));

    const url = 'https://api.openai.com/v1/chat/completions';
    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Target Language: ${language === 'am' ? 'Amharic' : 'English'}\nVerified Products:\n${JSON.stringify(catalogContext, null, 2)}\n\nCustomer Message: "${userMessage}"\n\nOutput pure JSON: {"answer":"...", "recommendations":[{"productId":"...", "reason":"..."}]}`,
      },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          max_tokens: env.AI_MAX_OUTPUT_TOKENS || 1000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 429) {
        throw new AppError('AI provider rate limit reached. Please try again shortly.', 429);
      }

      if (!response.ok) {
        throw new AppError(`OpenAI request failed with status ${response.status}`, 502);
      }

      const data = (await response.json()) as any;
      const rawText = data?.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawText || '{}');

      const recommendedProductIds: string[] = [];
      const recommendationReasons: Record<string, string> = {};

      if (Array.isArray(parsed.recommendations)) {
        for (const rec of parsed.recommendations) {
          if (rec.productId && typeof rec.productId === 'string') {
            recommendedProductIds.push(rec.productId);
            if (rec.reason) {
              recommendationReasons[rec.productId] = rec.reason;
            }
          }
        }
      }

      return {
        answer: parsed.answer || 'Here are our recommendations based on your request.',
        recommendedProductIds,
        recommendationReasons,
        isMock: false,
        providerName: this.name,
        model: this.model,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new AppError('AI provider request timed out. Please try again.', 504);
      }
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to communicate with OpenAI provider', 502);
    }
  }
}

/**
 * AI Provider Factory
 */
export class AIProviderFactory {
  static getProvider(): IAIProvider {
    const isMock = env.AI_MOCK_MODE || !env.AI_API_KEY;

    if (isMock) {
      return new MockAIProvider();
    }

    if (env.AI_PROVIDER === 'gemini') {
      return new GeminiAIProvider(env.AI_API_KEY!, env.AI_MODEL, env.AI_REQUEST_TIMEOUT_MS);
    }

    if (env.AI_PROVIDER === 'openai') {
      return new OpenAIAIProvider(env.AI_API_KEY!, env.AI_MODEL, env.AI_REQUEST_TIMEOUT_MS);
    }

    return new MockAIProvider();
  }
}
