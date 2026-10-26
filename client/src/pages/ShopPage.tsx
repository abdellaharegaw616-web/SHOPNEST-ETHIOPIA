import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  PackageSearch,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  ProductQueryParams,
} from '../store/api/productsApi';
import { ProductCard } from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/ProductSkeleton';

export const ShopPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSort = (searchParams.get('sort') as ProductQueryParams['sort']) || 'newest';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlAvailability = (searchParams.get('availability') as ProductQueryParams['availability']) || 'all';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedSort, setSelectedSort] = useState<ProductQueryParams['sort']>(urlSort);
  const [minPrice, setMinPrice] = useState<string>(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(urlMaxPrice);
  const [availability, setAvailability] = useState<ProductQueryParams['availability']>(urlAvailability);
  const [page, setPage] = useState<number>(urlPage > 0 ? urlPage : 1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state when URL search params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSort((searchParams.get('sort') as ProductQueryParams['sort']) || 'newest');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setAvailability((searchParams.get('availability') as ProductQueryParams['availability']) || 'all');
    const p = parseInt(searchParams.get('page') || '1', 10);
    setPage(p > 0 ? p : 1);
  }, [searchParams]);

  // Query categories for filter sidebar
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Query products from API
  const queryParams: ProductQueryParams = {
    page,
    limit: 12,
    search: searchTerm.trim() || undefined,
    category: selectedCategory || undefined,
    sort: selectedSort,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    availability: availability !== 'all' ? availability : undefined,
  };

  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProductsQuery(queryParams);

  const products = productsData?.data?.products || [];
  const total = productsData?.data?.total || 0;
  const totalPages = productsData?.data?.totalPages || 1;

  // Update URL search parameters
  const updateUrlParams = (updates: Record<string, string | null | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== 'newest') {
        nextParams.set(key, val);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams, { replace: true });
  };

  const handleApplyFilters = () => {
    setPage(1);
    updateUrlParams({
      search: searchTerm.trim() || null,
      category: selectedCategory || null,
      sort: selectedSort !== 'newest' ? selectedSort || null : null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      availability: availability !== 'all' ? availability || null : null,
      page: null, // Reset to page 1
    });
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      page: newPage > 1 ? newPage.toString() : null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory || minPrice || maxPrice || (availability && availability !== 'all')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">
            {isAmharic ? 'የኢትዮጵያ የገበያ መድረክ ካታሎግ' : 'Ethiopian Marketplace Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-1">
            {isAmharic
              ? 'ጥራት ያላቸውን እቃዎች በኢትዮጵያ ብር (ETB) ከፈጣን የአዲስ አበባ ትራንስፖርት ጋር ይግዙ'
              : 'Browse our complete inventory denominated in Ethiopian Birr (ETB) with Addis delivery'}
          </p>
        </div>

        {/* Filter controls row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-[#1F2937] dark:text-gray-200 shadow-2xs hover:border-[#F97316]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#F97316]" />
            <span>{isAmharic ? 'ማጣሪያዎች' : 'Filters'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-[#6B7280] dark:text-gray-400 hidden sm:inline">
              {isAmharic ? 'ደርድር:' : 'Sort:'}
            </label>
            <select
              id="sort-select"
              value={selectedSort}
              onChange={(e) => {
                const val = e.target.value as ProductQueryParams['sort'];
                setSelectedSort(val);
                setPage(1);
                updateUrlParams({ sort: val !== 'newest' ? val : null, page: null });
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-[#1F2937] dark:text-gray-200 focus:outline-hidden focus:border-[#F97316] shadow-2xs"
            >
              <option value="newest">{isAmharic ? 'አዳዲሶች' : 'Newest Arrivals'}</option>
              <option value="price_asc">{isAmharic ? 'ዋጋ: ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
              <option value="price_desc">{isAmharic ? 'ዋጋ: ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
              <option value="rating">{isAmharic ? 'ከፍተኛ ደረጃ የተሰጣቸው' : 'Customer Rating'}</option>
              <option value="popularity">{isAmharic ? 'በብዛት የተሸጡ' : 'Most Popular / Best Sellers'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs h-fit sticky top-24 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] dark:border-gray-800">
            <span className="text-sm font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#F97316]" />
              {isAmharic ? 'ምርቶችን አጣራ' : 'Filter Catalog'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {isAmharic ? 'ሁሉንም አጽዳ' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Search Keyword */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
              {isAmharic ? 'በቁልፍ ቃል መፈለጊያ' : 'Keyword Search'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                placeholder={isAmharic ? 'የምርት ስም፣ መግለጫ...' : 'Product name, description, SKU...'}
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    updateUrlParams({ search: null, page: null });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
              {isAmharic ? 'ምድቦች' : 'Categories'}
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                  updateUrlParams({ category: null, page: null });
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] font-bold'
                    : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800'
                }`}
              >
                {isAmharic ? 'ሁሉም ምድቦች' : 'All Categories'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat._id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(1);
                    updateUrlParams({ category: cat.slug, page: null });
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] font-bold'
                      : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
              {isAmharic ? 'ተገኝነት' : 'Availability'}
            </label>
            <div className="space-y-1">
              {[
                { value: 'all', label: isAmharic ? 'ሁሉም እቃዎች' : 'All Items' },
                { value: 'in_stock', label: isAmharic ? 'ያሉ ብቻ' : 'In Stock Only' },
                { value: 'out_of_stock', label: isAmharic ? 'ያለቁ' : 'Out of Stock' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-xs text-[#4B5563] dark:text-gray-300 cursor-pointer hover:text-[#1F2937] dark:hover:text-white p-1"
                >
                  <input
                    type="radio"
                    name="desktopAvailability"
                    value={opt.value}
                    checked={availability === opt.value}
                    onChange={() => {
                      const val = opt.value as ProductQueryParams['availability'];
                      setAvailability(val);
                      setPage(1);
                      updateUrlParams({ availability: val !== 'all' ? val : null, page: null });
                    }}
                    className="text-[#F97316] focus:ring-[#F97316]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200 uppercase tracking-wider">
              {isAmharic ? 'የዋጋ ወሰን (ብር)' : 'Price Range (ETB)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={isAmharic ? 'ዝቅተኛ' : 'Min'}
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
              <input
                type="number"
                placeholder={isAmharic ? 'ከፍተኛ' : 'Max'}
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="w-full py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isAmharic ? 'አጣራ' : 'Apply Filters'}
          </button>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-gray-400">
            <span>
              {isAmharic ? (
                <>ከ<strong className="text-[#1F2937] dark:text-white">{total}</strong> ምርቶች ውስጥ <strong className="text-[#1F2937] dark:text-white">{products.length}</strong> ታይተዋል</>
              ) : (
                <>Showing <strong className="text-[#1F2937] dark:text-white">{products.length}</strong> of <strong className="text-[#1F2937] dark:text-white">{total}</strong> products</>
              )}
            </span>
            {isFetching && (
              <span className="text-[#F97316] font-semibold">
                {isAmharic ? 'ካታሎጉ በመዘመን ላይ...' : 'Updating catalog...'}
              </span>
            )}
          </div>

          {/* Error State */}
          {isError ? (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/40 p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                {isAmharic ? 'ካታሎጉን መጫን አልተቻለም' : 'Unable to Load Catalog'}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mx-auto">
                {isAmharic
                  ? 'ምርቶችን ከሰርቨር በማምጣት ላይ ችግር አጋጥሟል። እባክዎ ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።'
                  : 'We encountered an issue fetching products from the server. Please check your connection and try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'እንደገና ሞክር' : 'Retry'}</span>
              </button>
            </div>
          ) : isLoading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <ProductSkeleton count={6} />
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-12 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
                <PackageSearch className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                {isAmharic ? 'ምንም ምርት አልተገኘም' : 'No Products Found'}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mx-auto">
                {isAmharic
                  ? 'የመረጧቸውን ማጣሪያዎች የሚያሟላ ምንም ዕቃ አልተገኘም። እባክዎ ማጣሪያዎችን ያጽዱ ወይም ይቀይሩ።'
                  : 'No items match your active search, category, or filter criteria. Try adjusting or clearing your filters.'}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] shadow-xs cursor-pointer"
              >
                {isAmharic ? 'ማጣሪያዎችን አጽዳ' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-[#1F2937] dark:text-gray-200 hover:border-[#F97316] disabled:opacity-40 disabled:hover:border-[#E5E7EB] dark:disabled:hover:border-gray-700 cursor-pointer"
              >
                {isAmharic ? 'ወደ ኋላ' : 'Previous'}
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      page === pageNum
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-gray-200 hover:border-[#F97316]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-[#1F2937] dark:text-gray-200 hover:border-[#F97316] disabled:opacity-40 disabled:hover:border-[#E5E7EB] dark:disabled:hover:border-gray-700 cursor-pointer"
              >
                {isAmharic ? 'ቀጣይ' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-sm bg-white dark:bg-[#111827] h-full shadow-2xl p-6 overflow-y-auto space-y-6 z-10 flex flex-col justify-between border-l border-gray-200 dark:border-gray-800">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-gray-800">
                <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? 'ምርቶችን አጣራ' : 'Filter Catalog'}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-[#6B7280] dark:text-gray-400 hover:text-[#1F2937] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Keyword */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200">
                  {isAmharic ? 'መፈለጊያ' : 'Search'}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAmharic ? 'የምርት ስም...' : 'Keywords...'}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200">
                  {isAmharic ? 'ምድብ' : 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-gray-200"
                >
                  <option value="">{isAmharic ? 'ሁሉም ምድቦች' : 'All Categories'}</option>
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200">
                  {isAmharic ? 'ተገኝነት' : 'Availability'}
                </label>
                <select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as ProductQueryParams['availability'])
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-gray-200"
                >
                  <option value="all">{isAmharic ? 'ሁሉም እቃዎች' : 'All Items'}</option>
                  <option value="in_stock">{isAmharic ? 'ያሉ ብቻ' : 'In Stock Only'}</option>
                  <option value="out_of_stock">{isAmharic ? 'ያለቁ' : 'Out of Stock'}</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200">
                  {isAmharic ? 'የዋጋ ወሰን (ብር)' : 'Price Range (ETB)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={isAmharic ? 'ዝቅተኛ' : 'Min'}
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={isAmharic ? 'ከፍተኛ' : 'Max'}
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E5E7EB] dark:border-gray-800">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isAmharic ? 'አጣራ' : 'Apply Filters'}
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:text-[#1F2937] dark:hover:text-white cursor-pointer"
              >
                {isAmharic ? 'ሁሉንም ማጣሪያዎች አጽዳ' : 'Reset All Filters'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
