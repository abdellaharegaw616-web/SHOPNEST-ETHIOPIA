import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RecommendedProductDTO } from '@shopnest/shared';
import { formatETB } from '../../../components/common/ProductPrice';

interface RecommendedProductCardProps {
  product: RecommendedProductDTO;
  onNavigate?: () => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';

export const RecommendedProductCard: React.FC<RecommendedProductCardProps> = ({
  product,
  onNavigate,
}) => {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const isAmharic = i18n.language?.startsWith('am');
  const title = isAmharic && product.titleAmharic ? product.titleAmharic : product.title;
  const image = product.images && product.images.length > 0 && !imageError ? product.images[0] : FALLBACK_IMAGE;

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 text-left">
      <div className="flex gap-3">
        {/* Product Image */}
        <Link
          to={`/product/${product.slug}`}
          onClick={onNavigate}
          className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          aria-label={title}
        >
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-orange-600 text-white text-[9px] font-bold px-1 rounded">
              SALE
            </span>
          )}
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider truncate">
            {product.categoryName}
          </p>

          <Link
            to={`/product/${product.slug}`}
            onClick={onNavigate}
            className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2 leading-tight mt-0.5"
            title={title}
          >
            {title}
          </Link>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
              ETB {formatETB(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                ETB {formatETB(product.price)}
              </span>
            )}
          </div>

          {/* Stock Tag */}
          <div className="flex items-center gap-1 mt-1">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-3 h-3 text-gray-400" />
                {t('aiAssistant.outOfStock', 'Out of Stock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {t('aiAssistant.inStock', 'In Stock')} ({product.stock})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Reason */}
      {product.recommendationReason && (
        <div className="bg-orange-50/80 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-lg p-2 text-[11px] text-orange-900 dark:text-orange-200/90 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <span className="leading-snug">{product.recommendationReason}</span>
        </div>
      )}

      {/* Action Button */}
      <Link
        to={`/product/${product.slug}`}
        onClick={onNavigate}
        className="w-full py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-orange-600 dark:bg-gray-700/80 dark:hover:bg-orange-600 text-gray-700 hover:text-white dark:text-gray-200 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>{t('aiAssistant.viewProduct', 'View Product')}</span>
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
};

