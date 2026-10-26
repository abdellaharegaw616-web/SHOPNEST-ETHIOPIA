import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearWishlist } from '../store/slices/wishlistSlice';
import { useGetProductsQuery, ProductItem } from '../store/api/productsApi';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);

  const { data: productsData } = useGetProductsQuery({ limit: 50 });
  const allProducts = productsData?.data?.products || [];

  const wishlistedProducts = allProducts.filter((product: ProductItem) =>
    wishlistIds.includes(product.id || product._id || '')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">
            {isAmharic ? 'የምኞት ዝርዝር' : 'My Wishlist'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-0.5">
            {isAmharic
              ? `${wishlistIds.length} የተቀመጡ እቃዎች`
              : `${wishlistIds.length} saved ${wishlistIds.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>

        {wishlistIds.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearWishlist())}
            className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ሁሉንም አጽዳ' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {wishlistIds.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs transition-colors">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
            {isAmharic ? 'የምኞት ዝርዝርዎ ባዶ ነው' : 'Your Wishlist is Empty'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
            {isAmharic
              ? 'የወደዷቸውን ምርቶች በኋላ ላይ በቀላሉ ለማግኘት ወደዚህ ያስቀምጡ!'
              : 'Save items that catch your eye while browsing our Ethiopian catalog so you can find them later!'}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <span>{isAmharic ? 'ምርቶችን ያስሱ' : 'Explore Catalog'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product: ProductItem) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
