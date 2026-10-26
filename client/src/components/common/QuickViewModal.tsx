import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Star,
  ShoppingCart,
  Check,
  Heart,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { ProductItem } from '../../store/api/productsApi';
import { ProductPrice } from './ProductPrice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';

interface QuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);

  if (!isOpen || !product) return null;

  const productId = product.id || product._id || '';
  const isWishlisted = wishlistIds.includes(productId);
  const isAmharic = i18n.language?.startsWith('am');

  const displayTitle = isAmharic && product.titleAmharic ? product.titleAmharic : product.title;
  const displayDescription =
    isAmharic && product.descriptionAmharic ? product.descriptionAmharic : product.description;

  const images = product.images && product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const activeImage = images[selectedImageIndex] || images[0];

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? isAmharic && product.category.nameAmharic
        ? product.category.nameAmharic
        : product.category.name
      : 'Ethiopian Goods';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasActualReviews = product.reviewCount > 0 && product.rating > 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(
      addToCart({
        id: productId,
        productId,
        title: product.title,
        titleAmharic: product.titleAmharic,
        price: product.price,
        discountPrice: product.discountPrice,
        image: activeImage,
        stock: product.stock,
        sku: product.sku,
        quantity,
      })
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xl overflow-hidden z-10 transition-colors">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F3F4F6] dark:bg-gray-800 text-[#4B5563] dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700">
              <img
                src={activeImage}
                alt={displayTitle}
                className="w-full h-full object-cover object-center"
              />

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={() => dispatch(toggleWishlist(productId))}
                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs shadow-xs border border-[#E5E7EB] dark:border-gray-700 flex items-center justify-center text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] transition-transform active:scale-90 cursor-pointer"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#F97316] text-[#F97316]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#F97316]'
                        : 'border-[#E5E7EB] dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider block">
                {categoryName}
              </span>

              <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937] dark:text-white leading-snug">
                {displayTitle}
              </h2>

              {/* Rating & Stock */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280] dark:text-gray-400">
                {hasActualReviews ? (
                  <div className="flex items-center gap-1 text-[#F97316]">
                    <Star className="w-3.5 h-3.5 fill-[#F97316]" />
                    <span className="font-bold text-[#1F2937] dark:text-white">
                      {product.rating.toFixed(1)}
                    </span>
                    <span>({product.reviewCount} reviews)</span>
                  </div>
                ) : (
                  <span className="italic text-[11px] text-[#9CA3AF]">No reviews yet</span>
                )}
                <span>•</span>
                <span
                  className={`font-semibold ${
                    isOutOfStock
                      ? 'text-rose-600 font-bold'
                      : isLowStock
                      ? 'text-amber-600 font-bold'
                      : 'text-emerald-600 dark:text-emerald-400 font-bold'
                  }`}
                >
                  {isOutOfStock
                    ? 'Out of Stock'
                    : isLowStock
                    ? `Only ${product.stock} left`
                    : `In Stock (${product.stock} available)`}
                </span>
              </div>

              {/* Price */}
              <div className="p-3 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30">
                <ProductPrice
                  price={product.price}
                  discountPrice={product.discountPrice}
                  size="lg"
                />
              </div>

              {/* Brief Description */}
              <p className="text-xs text-[#4B5563] dark:text-gray-300 line-clamp-3 leading-relaxed">
                {displayDescription}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2 border-t border-[#F3F4F6] dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937] dark:text-gray-200">
                  Quantity
                </span>
                <div className="flex items-center border border-[#E5E7EB] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-[#4B5563] dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1F2937] dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-1.5 text-[#4B5563] dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : justAdded
                      ? 'bg-emerald-600 text-white'
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

                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-[#1F2937] dark:text-gray-200 hover:border-[#F97316] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Delivery info */}
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#F97316]" />
                  Addis Ababa Delivery
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
                  100% Genuine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
