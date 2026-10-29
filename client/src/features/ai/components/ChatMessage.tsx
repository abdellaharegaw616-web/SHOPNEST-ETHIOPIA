import React from 'react';
import { Bot, User, RotateCcw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RecommendedProductDTO } from '@shopnest/shared';
import { RecommendedProductCard } from './RecommendedProductCard';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: RecommendedProductDTO[];
  isMock?: boolean;
  isError?: boolean;
  canRetry?: boolean;
  relaxedCriteria?: string | null;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRetry?: () => void;
  onProductClick?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
  onProductClick,
}) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  // Basic markdown-like formatting for bold text and paragraph lines
  const renderFormattedContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Split bold chunks (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="min-h-[1.2rem] leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-gray-900 dark:text-gray-100">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-2.5 my-3.5 transition-opacity duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-orange-600 text-white'
            : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xs'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm ${
            isUser
              ? 'bg-orange-600 text-white rounded-tr-xs shadow-xs'
              : message.isError
              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-tl-xs'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-tl-xs shadow-xs'
          }`}
        >
          {/* Mock Mode or Security Badge */}
          {!isUser && message.isMock && (
            <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <ShieldCheck className="w-3 h-3" />
              <span>{t('aiAssistant.mockBadge', 'Dev Simulation Mode')}</span>
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-1">{renderFormattedContent(message.content)}</div>

          {/* Relaxed Criteria Note */}
          {message.relaxedCriteria && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px] text-amber-600 dark:text-amber-400 italic">
              ℹ️ {message.relaxedCriteria}
            </div>
          )}

          {/* Error & Retry */}
          {message.isError && message.canRetry && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('aiAssistant.retry', 'Retry')}</span>
            </button>
          )}
        </div>

        {/* Recommended Products Grid */}
        {!isUser && message.products && message.products.length > 0 && (
          <div className="mt-3 w-full space-y-2.5">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('aiAssistant.whyRecommended', 'Recommended Products')}:
            </p>
            <div className="grid grid-cols-1 gap-2.5 w-full">
              {message.products.map((product) => (
                <RecommendedProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onProductClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
