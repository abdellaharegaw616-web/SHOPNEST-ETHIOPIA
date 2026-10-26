import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  CreditCard,
  MessageSquare,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  ReviewItem,
} from '../store/api/productsApi';
import { ProductPrice } from '../components/common/ProductPrice';
import { ProductCard } from '../components/common/ProductCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const { data: productResponse, isLoading, isError } = useGetProductBySlugQuery(slug || '', {
    skip: !slug,
  });

  const product = productResponse?.data;
  const productId = product?.id || product?._id || '';

  // Related products query
  const { data: relatedData } = useGetRelatedProductsQuery(
    { slug: slug || '', limit: 4 },
    { skip: !slug }
  );
  const relatedProducts = relatedData?.data || [];

  // Product reviews query
  const { data: reviewsData, refetch: refetchReviews } = useGetProductReviewsQuery(
    productId || slug || '',
    { skip: !slug }
  );
  const reviews = reviewsData?.data || [];

  // Create review mutation
  const [createReviewMutation, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const isWishlisted = product ? wishlistIds.includes(productId) : false;
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-[#E5E7EB] rounded-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-[#E5E7EB] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-[#E5E7EB] rounded-sm w-3/4" />
            <div className="h-6 bg-[#E5E7EB] rounded-sm w-1/4" />
            <div className="h-24 bg-[#E5E7EB] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Product Not Found</h2>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          The product you requested might have been retired or is currently unavailable.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const activeImage = images[selectedImageIndex] || images[0];

  const displayTitle = isAmharic && product.titleAmharic ? product.titleAmharic : product.title;
  const displayDescription =
    isAmharic && product.descriptionAmharic ? product.descriptionAmharic : product.description;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? (isAmharic && product.category.nameAmharic ? product.category.nameAmharic : product.category.name)
      : 'Ethiopian Goods';

  const categorySlug =
    typeof product.category === 'object' && product.category !== null
      ? product.category.slug
      : '';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasActualReviews = product.reviewCount > 0 && product.rating > 0;

  // Quantity change with strict boundary enforcement
  const handleQuantityChange = (newQty: number) => {
    setQuantityError('');
    if (newQty < 1) {
      setQuantity(1);
    } else if (newQty > product.stock) {
      setQuantity(product.stock);
      setQuantityError(`Cannot exceed available stock (${product.stock} items).`);
    } else {
      setQuantity(newQty);
    }
  };

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
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!newComment.trim() || newComment.trim().length < 3) {
      setReviewError('Review comment must be at least 3 characters.');
      return;
    }

    try {
      await createReviewMutation({
        productId,
        rating: newRating,
        comment: newComment.trim(),
      }).unwrap();

      setReviewSuccess(true);
      setNewComment('');
      refetchReviews();
    } catch (err: any) {
      setReviewError(
        err?.data?.message || 'Failed to submit review. You may have already reviewed this item.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-gray-400">
        <Link to="/" className="hover:text-[#F97316]">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#F97316]">
          Shop
        </Link>
        {categorySlug && (
          <>
            <span>/</span>
            <Link to={`/categories/${categorySlug}`} className="hover:text-[#F97316]">
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#1F2937] dark:text-white font-semibold truncate max-w-xs">
          {displayTitle}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 shadow-xs">
            <img
              src={activeImage}
              alt={displayTitle}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#F97316] shadow-2xs'
                      : 'border-[#E5E7EB] dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {categorySlug ? (
                <Link
                  to={`/categories/${categorySlug}`}
                  className="text-xs font-bold text-[#F97316] uppercase tracking-wider hover:underline"
                >
                  {categoryName}
                </Link>
              ) : (
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
                  {categoryName}
                </span>
              )}

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => dispatch(toggleWishlist(productId))}
                className="p-2 rounded-xl border border-[#E5E7EB] dark:border-gray-700 hover:border-[#F97316] text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] transition-colors"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#F97316] text-[#F97316]' : ''
                  }`}
                />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white tracking-tight leading-snug">
              {displayTitle}
            </h1>

            {/* Ratings & SKU & Stock Label */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-gray-400 pt-1">
              {hasActualReviews ? (
                <div className="flex items-center gap-1 text-[#F97316]">
                  <Star className="w-4 h-4 fill-[#F97316]" />
                  <span className="font-bold text-[#1F2937] dark:text-white">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-[#6B7280] dark:text-gray-400">
                    ({product.reviewCount} customer {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-[#9CA3AF] italic">No reviews yet</span>
              )}

              <span>•</span>
              <span>SKU: {product.sku}</span>
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
                  ? 'Currently Out of Stock'
                  : isLowStock
                  ? `Only ${product.stock} left in stock`
                  : `In Stock (${product.stock} available)`}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30">
            <ProductPrice
              price={product.price}
              discountPrice={product.discountPrice}
              size="xl"
            />
            <p className="text-[11px] text-[#6B7280] dark:text-gray-400 mt-1">
              All prices denominated strictly in Ethiopian Birr (ETB). Includes local VAT.
            </p>
          </div>

          {/* Quantity Controls & Purchase Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E5E7EB] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-gray-700 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  disabled={isOutOfStock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                  className="w-14 text-center py-1 text-sm font-bold text-[#1F2937] dark:text-white bg-transparent border-0 focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-gray-700 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {quantityError && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">{quantityError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isOutOfStock
                    ? 'bg-[#E5E7EB] dark:bg-gray-800 text-[#9CA3AF] cursor-not-allowed'
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
                    <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-[#1F2937] dark:bg-orange-600 hover:bg-black dark:hover:bg-orange-700 text-white flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4 text-[#F97316] dark:text-white" />
                <span>Buy Now with Telebirr / CBE</span>
              </button>
            </div>
          </div>

          {/* Delivery & Customer Assurance Information */}
          <div className="border-t border-[#E5E7EB] dark:border-gray-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-[#4B5563] dark:text-gray-300">
              <Truck className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>Fast Addis Ababa Door Delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#4B5563] dark:text-gray-300">
              <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>100% Genuine Certified</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#4B5563] dark:text-gray-300">
              <RotateCcw className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>7-Day Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 sm:p-8 space-y-6 shadow-2xs transition-colors">
        <h2 className="text-lg font-bold text-[#1F2937] dark:text-white border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
          Product Description & Specifications
        </h2>

        <div className="prose text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed max-w-none">
          <p>{displayDescription}</p>
        </div>

        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800/60 border border-[#E5E7EB]/60 dark:border-gray-700/60"
                >
                  <span className="font-medium text-[#6B7280] dark:text-gray-400 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-white">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 sm:p-8 space-y-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] dark:border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#F97316]" />
              <h2 className="text-lg font-bold text-[#1F2937] dark:text-white">Customer Reviews</h2>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
              Verified feedback from Ethiopian shoppers who purchased this item
            </p>
          </div>

          {hasActualReviews && (
            <div className="flex items-center gap-2">
              <div className="flex text-[#F97316]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-[#F97316] text-[#F97316]'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-[#1F2937] dark:text-white">
                {product.rating.toFixed(1)} / 5.0
              </span>
              <span className="text-xs text-[#6B7280] dark:text-gray-400">
                ({product.reviewCount} total)
              </span>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-[#4B5563] dark:text-gray-300 font-medium">
              No customer reviews yet for this product.
            </p>
            <p className="text-xs text-[#9CA3AF] dark:text-gray-500">
              Be the first to share your thoughts on this item!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev: ReviewItem) => (
              <div
                key={rev.id || rev._id}
                className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-gray-800/60 border border-[#E5E7EB] dark:border-gray-750 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1F2937] dark:text-white">{rev.user?.name || 'Verified Buyer'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-semibold">
                        <Check className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[#9CA3AF] dark:text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex text-[#F97316]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < rev.rating ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[#4B5563] dark:text-gray-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write a Review Form */}
        <div className="border-t border-[#F3F4F6] dark:border-gray-800 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Write a Review</h3>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-xl text-xs">
              {reviewSuccess && (
                <p className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  Thank you! Your review has been recorded.
                </p>
              )}
              {reviewError && (
                <p className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                  {reviewError}
                </p>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Rating Score</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-[#F97316] hover:scale-110 transition-transform"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Your Review *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience regarding product quality, delivery, and authenticity..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-750 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#6B7280] dark:text-gray-300">
              Please{' '}
              <Link to="/login" className="font-bold text-[#F97316] hover:underline">
                Sign In
              </Link>{' '}
              to write a verified customer review.
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">
                Related Products
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-gray-400">
                More items from the {categoryName} collection
              </p>
            </div>
            {categorySlug && (
              <Link
                to={`/categories/${categorySlug}`}
                className="text-xs font-bold text-[#F97316] hover:underline"
              >
                View Category Catalog →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id || relProduct._id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
