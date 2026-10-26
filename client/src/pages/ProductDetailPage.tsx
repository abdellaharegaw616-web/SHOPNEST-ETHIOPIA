import React, { useState, useRef } from 'react';
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
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Send,
  AlertCircle,
  Camera,
  UploadCloud,
  X,
  Edit2,
  Trash2,
  Maximize2,
} from 'lucide-react';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useCheckReviewEligibilityQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
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

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Eligibility query
  const { data: eligibilityData, refetch: refetchEligibility } = useCheckReviewEligibilityQuery(
    productId,
    { skip: !isAuthenticated || !productId }
  );
  const eligibility = eligibilityData?.data;

  // Review mutations
  const [createReviewMutation, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [updateReviewMutation, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();
  const [deleteReviewMutation, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const isWishlisted = product ? wishlistIds.includes(productId) : false;

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 3) {
      setPhotoError('You can attach a maximum of 3 product photos.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only image files (PNG, JPG, WEBP) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Each image must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReviewImages((prev) => (prev.length < 3 ? [...prev, reader.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEditReview = (rev: ReviewItem) => {
    setEditingReviewId(rev.id || rev._id || '');
    setNewRating(rev.rating);
    setReviewTitle(rev.title || '');
    setNewComment(rev.comment);
    setReviewImages(rev.images || []);
    setReviewError('');
    setReviewSuccess(false);
    reviewFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setNewRating(5);
    setReviewTitle('');
    setNewComment('');
    setReviewImages([]);
    setReviewError('');
  };

  const handleDeleteOwnReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await deleteReviewMutation({ id: reviewId, productId }).unwrap();
      refetchReviews();
      refetchEligibility();
      if (editingReviewId === reviewId) handleCancelEditReview();
    } catch (err: any) {
      setReviewError(err?.data?.message || 'Failed to delete review');
    }
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
      if (editingReviewId) {
        await updateReviewMutation({
          id: editingReviewId,
          productId,
          rating: newRating,
          title: reviewTitle.trim() || undefined,
          comment: newComment.trim(),
          images: reviewImages,
        }).unwrap();
        setReviewSuccess(true);
        handleCancelEditReview();
      } else {
        await createReviewMutation({
          productId,
          rating: newRating,
          title: reviewTitle.trim() || undefined,
          comment: newComment.trim(),
          images: reviewImages,
        }).unwrap();
        setReviewSuccess(true);
        setNewComment('');
        setReviewTitle('');
        setReviewImages([]);
      }
      refetchReviews();
      refetchEligibility();
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
              Verified buyers will share product photos and impressions here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev: ReviewItem) => {
              const isOwner = user && (user.id === rev.user?.id || (user as any)._id === rev.user?._id || user.id === rev.user?._id);
              return (
                <div
                  key={rev.id || rev._id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F9FAFB] dark:bg-gray-800/60 border border-[#E5E7EB] dark:border-gray-750 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FFF7ED] text-[#F97316] font-bold flex items-center justify-center text-xs">
                        {(rev.user?.name || 'V').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-[#1F2937] dark:text-white">
                        {rev.user?.name || 'Verified Buyer'}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Purchase (የተረጋገጠ ግዢ)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[#9CA3AF] dark:text-gray-400 text-[11px]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditReview(rev)}
                            className="p-1 rounded-md text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/40 inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="Edit Review"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOwnReview(rev.id || rev._id || '')}
                            disabled={isDeletingReview}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                    {rev.title && (
                      <span className="font-bold text-[#1F2937] dark:text-white">
                        {rev.title}
                      </span>
                    )}
                  </div>

                  <p className="text-[#4B5563] dark:text-gray-300 leading-relaxed text-xs">
                    {rev.comment}
                  </p>

                  {/* Customer Attached Photos with click-to-enlarge */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-[#6B7280] dark:text-gray-400 block mb-1.5 uppercase tracking-wider">
                        Customer Photos ({rev.images.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-gray-700 bg-black/5 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                          >
                            <img
                              src={imgUrl}
                              alt={`Review attachment ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Write / Edit a Verified Review Form */}
        <div ref={reviewFormRef} className="border-t border-[#F3F4F6] dark:border-gray-800 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#F97316]" />
              <span>{editingReviewId ? 'Edit Your Review / አስተያየቱን ያሻሽሉ' : 'Verified Photo Review / የተረጋገጠ የደንበኛ አስተያየት'}</span>
            </h3>
            {editingReviewId && (
              <button
                type="button"
                onClick={handleCancelEditReview}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#6B7280] dark:text-gray-300">
              Please{' '}
              <Link to="/login" className="font-bold text-[#F97316] hover:underline">
                Sign In
              </Link>{' '}
              to write a verified customer photo review.
            </div>
          ) : !eligibility?.hasPurchased && user?.role !== 'admin' ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Verified Buyer Policy / የተረጋገጠ ግዢ ፖሊሲ</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Only customers who have ordered and received this product can write a review. Once your order is processed or delivered, you will be invited to leave a 1–5 star rating and attach photos of the item!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl text-xs">
              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your verified photo review has been recorded.</span>
                </div>
              )}
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* 1-5 Star Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200 block">Rating Score *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-[#F97316] hover:scale-115 transition-transform"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#F97316] ml-2">
                    {newRating === 5 ? '5.0 — Excellent (በጣም ጥሩ)' : `${newRating}.0 / 5.0`}
                  </span>
                </div>
              </div>

              {/* Review Headline / Title */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200 block">
                  Headline / Title (አጭር ርዕስ)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Beautiful fabric, fast delivery in Addis Ababa!"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-750 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200 block">
                  Detailed Feedback * (ዝርዝር አስተያየት)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience regarding item authenticity, sizing, quality, and door-to-door delivery..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-750 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                />
              </div>

              {/* Photo Uploads Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-200 block">
                    Attach Product Photos (ፎቶ ያያይዙ - Max 3)
                  </label>
                  <span className="text-[11px] text-[#6B7280]">
                    {reviewImages.length}/3 photos
                  </span>
                </div>

                {photoError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    {photoError}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {/* Thumbnails of already attached photos */}
                  {reviewImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-gray-700 bg-gray-100 group"
                    >
                      <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  {reviewImages.length < 3 && (
                    <>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-gray-700 hover:border-[#F97316] text-[#6B7280] hover:text-[#F97316] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Upload photo"
                      >
                        <UploadCloud className="w-5 h-5" />
                        <span className="text-[9px] font-bold">+ Photo</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingReview || isUpdatingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmittingReview || isUpdatingReview
                      ? 'Saving...'
                      : editingReviewId
                      ? 'Update Review'
                      : 'Post Verified Review'}
                  </span>
                </button>
                {editingReviewId && (
                  <button
                    type="button"
                    onClick={handleCancelEditReview}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Lightbox Photo Preview Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-3xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImage}
                alt="Enlarged review photo"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
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
