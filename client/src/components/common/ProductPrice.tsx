import React from 'react';

interface ProductPriceProps {
  price: number;
  discountPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const formatETB = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const ProductPrice: React.FC<ProductPriceProps> = ({
  price,
  discountPrice,
  currency = 'ETB',
  size = 'md',
  className = '',
}) => {
  const hasDiscount = discountPrice !== undefined && discountPrice > 0 && discountPrice < price;
  const currentPrice = hasDiscount ? discountPrice : price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-extrabold',
  }[size];

  const strikeSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[size];

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`${sizeClasses} text-[#F97316] tracking-tight`}>
        {currency} {formatETB(currentPrice)}
      </span>

      {hasDiscount && (
        <>
          <span
            className={`${strikeSizeClasses} text-[#9CA3AF] line-through font-normal`}
            aria-label={`Original price ${currency} ${formatETB(price)}`}
          >
            {currency} {formatETB(price)}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#F97316]/20">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
};
