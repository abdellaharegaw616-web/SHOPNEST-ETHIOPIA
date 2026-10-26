import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProductItem } from '../../store/api/productsApi';
import { ProductPrice } from './ProductPrice';
import { QuickViewModal } from './QuickViewModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const isWishlisted = wishlistIds.includes(product.id || product._id || '');

  const isAmharic = i18n.language?.startsWith('am');
  const displayTitle = (isAmharic && product.titleAmharic) ? product.titleAmharic : product.title;
  const categoryName = typeof product.category === 'object' && product.category !== null
    ? ((isAmharic && product.category.nameAmharic) ? product.category.nameAmharic : product.category.name)
    : 'Ethiopian Goods';

  const productImage = (product.images && product.images.length > 0 && !imageError)
    ? product.images[0]
    : FALLBACK_IMAGE;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    dispatch(
      addToCart({
        id: product.id || product._id || '',
        productId: product.id || product._id || '',
        title: product.title,
        titleAmharic: product.titleAmharic,
        price: product.price,
        discountPrice: product.discountPrice,
        image: productImage,
        stock: product.stock,
        sku: product.sku,
        quantity: 1,
      })
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product.id || product._id || ''));
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasActualReviews = product.reviewCount > 0 && product.rating > 0;

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${className}`}
      >
        <div>
          {/* Image Container with Consistent Aspect Ratio */}
          <div className="relative aspect-square w-full bg-[#F9FAFB] dark:bg-gray-900 overflow-hidden">
            <Link to={`/product/${product.slug}`} className="block w-full h-full">
              <img
                src={productImage}
                alt={displayTitle}
                loading="lazy"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </Link>

            {/* Availability Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1F2937] dark:bg-gray-800 text-white border border-transparent dark:border-gray-700">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF7ED] dark:bg-orange-950/70 text-[#EA580C] dark:text-orange-400 border border-[#F97316]/30">
                  Low Stock: {product.stock} left
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  In Stock
                </span>
              )}
            </div>

            {/* Action Buttons: Quick View & Wishlist */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                aria-label="Quick view product"
                title="Quick View"
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs shadow-xs border border-[#E5E7EB] dark:border-gray-700 flex items-center justify-center text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#FB923C] hover:bg-white dark:hover:bg-gray-700 transition-all transform active:scale-90 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs shadow-xs border border-[#E5E7EB] dark:border-gray-700 flex items-center justify-center text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#FB923C] hover:bg-white dark:hover:bg-gray-700 transition-all transform active:scale-90 cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isWishlisted ? 'fill-[#F97316] text-[#F97316]' : 'text-[#4B5563] dark:text-gray-300'
                  }`}
                />
              </button>
            </div>
          </div>

        {/* Content Section */}
        <div className="p-4 space-y-2">
          {/* Category Tag */}
          <p className="text-xs font-medium text-[#6B7280] dark:text-gray-400 uppercase tracking-wider line-clamp-1">
            {categoryName}
          </p>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3
              className="text-sm font-semibold text-[#1F2937] dark:text-gray-100 group-hover:text-[#F97316] dark:group-hover:text-[#FB923C] transition-colors line-clamp-2 min-h-[2.5rem]"
              title={displayTitle}
            >
              {displayTitle}
            </h3>
          </Link>

          {/* Ratings: strictly supported by real review data */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-gray-400">
            {hasActualReviews ? (
              <>
                <div className="flex items-center text-[#F97316]">
                  <Star className="w-3.5 h-3.5 fill-[#F97316]" />
                </div>
                <span className="font-semibold text-[#1F2937] dark:text-gray-200">
                  {product.rating.toFixed(1)}
                </span>
                <span>({product.reviewCount})</span>
              </>
            ) : (
              <span className="text-[11px] text-[#9CA3AF] italic">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Price & Action */}
      <div className="p-4 pt-0 space-y-3">
        <ProductPrice
          price={product.price}
          discountPrice={product.discountPrice}
          size="md"
        />

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
            isOutOfStock
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : justAdded
              ? 'bg-[#15803D] text-white'
              : 'bg-[#F97316] hover:bg-[#EA580C] text-white active:scale-[0.98]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </div>

    {/* Quick View Product Modal */}
    <QuickViewModal
      product={product}
      isOpen={quickViewOpen}
      onClose={() => setQuickViewOpen(false)}
    />
  </>
  );
};
