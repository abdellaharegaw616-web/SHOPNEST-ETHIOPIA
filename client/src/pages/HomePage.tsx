import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Star,
  Heart,
  Trash2,
  Plus,
  Minus,
  Check,
  LayoutGrid,
  List,
  Laptop,
  Smartphone,
  Shirt,
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  Dumbbell,
  SlidersHorizontal,
  Server,
  ShoppingBag,
} from 'lucide-react';
import { BRAND } from '@shopnest/shared';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { formatETB } from '../components/common/ProductPrice';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductItem } from '../store/api/productsApi';

interface ShowcaseProduct {
  id: string;
  title: string;
  titleAmharic?: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  stockCount: number;
}

const POPULAR_PRODUCTS: ShowcaseProduct[] = [
  {
    id: '6adc5054fd4f9b931257c6df',
    title: 'iPhone 15 128GB',
    titleAmharic: 'አይፎን 15 128ጂቢ',
    slug: 'pro-dual-sim-5g-smartphone-256gb',
    category: 'Phones & Accessories',
    brand: 'Apple',
    price: 54999,
    originalPrice: 59999,
    discountBadge: '-6%',
    rating: 4.8,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 8,
  },
  {
    id: '6adc5059fd4f9b931257c6e3',
    title: 'Dell Inspiron 15',
    titleAmharic: 'ዴል ኢንሳይፕሮን 15 ላፕቶፕ',
    slug: 'ultra-slim-14-inch-intel-core-i7-laptop',
    category: 'Computers',
    brand: 'Dell',
    price: 34999,
    discountBadge: 'Best Seller',
    rating: 4.6,
    reviewCount: 8,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 5,
  },
  {
    id: '6adc5052fd4f9b931257c6dc',
    title: 'AirPods Pro (2nd Gen)',
    titleAmharic: 'ኤርፖድስ ፕሮ 2ኛ ትውልድ',
    slug: 'active-noise-cancelling-wireless-headphones',
    category: 'Electronics',
    brand: 'Apple',
    price: 22999,
    rating: 4.7,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 14,
  },
  {
    id: '6adc506bfd4f9b931257c6fa',
    title: 'Samsung Galaxy Watch 6',
    titleAmharic: 'ሳምሰንግ ጋላክሲ ዋች 6',
    slug: 'smart-fitness-tracker-heart-rate-gps',
    category: 'Phones & Accessories',
    brand: 'Samsung',
    price: 18999,
    rating: 4.5,
    reviewCount: 10,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 12,
  },
  {
    id: '6adc505cfd4f9b931257c6e8',
    title: 'Laptop Backpack',
    titleAmharic: 'የላፕቶፕ ጀርባ ቦርሳ',
    slug: 'handcrafted-ethiopian-genuine-leather-backpack',
    category: 'Fashion',
    brand: 'Sony',
    price: 3499,
    originalPrice: 3999,
    discountBadge: '-12%',
    rating: 4.3,
    reviewCount: 7,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 22,
  },
  {
    id: '6adc5069fd4f9b931257c6f9',
    title: 'Nike Air Force 1',
    titleAmharic: 'ናይኪ ኤር ፎርስ 1 ጫማ',
    slug: 'elite-distance-marathon-running-shoes',
    category: 'Fashion',
    brand: 'Nike',
    price: 12999,
    rating: 4.6,
    reviewCount: 14,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 11,
  },
  {
    id: '6adc5061fd4f9b931257c6ee',
    title: 'Non-Stick Cookware Set',
    titleAmharic: 'የማይዝ ድስት እና መጥበሻ ስብስብ',
    slug: 'electric-non-stick-injera-mitad-50cm',
    category: 'Home & Kitchen',
    brand: 'KitchenPro',
    price: 8999,
    rating: 4.4,
    reviewCount: 9,
    image: 'https://images.unsplash.com/photo-1584990347449-a279fa69b2d9?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 6,
  },
  {
    id: '6adc5066fd4f9b931257c6f4',
    title: 'Axe Body Spray (150ml)',
    titleAmharic: 'አክስ የሰውነት ሽቶ (150 ሚሊ)',
    slug: 'long-lasting-oriental-amber-oud-perfume-100ml',
    category: 'Beauty & Personal Care',
    brand: 'Axe',
    price: 1499,
    rating: 4.2,
    reviewCount: 6,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    stockCount: 45,
  },
];

const CATEGORIES_LIST = [
  { name: 'Electronics', nameAmharic: 'ኤሌክትሮኒክስ', count: 12, icon: Laptop, slug: 'electronics' },
  { name: 'Phones & Accessories', nameAmharic: 'ስልኮች እና መለዋወጫዎች', count: 8, icon: Smartphone, slug: 'phones-accessories' },
  { name: 'Computers', nameAmharic: 'ኮምፒውተሮች', count: 6, icon: Laptop, slug: 'computers' },
  { name: 'Fashion', nameAmharic: 'ፋሽን እና አልባሳት', count: 15, icon: Shirt, slug: 'fashion' },
  { name: 'Home & Kitchen', nameAmharic: 'የቤትና የወጥ ቤት እቃዎች', count: 9, icon: UtensilsCrossed, slug: 'home-kitchen' },
  { name: 'Beauty & Personal Care', nameAmharic: 'ውበት እና የግል እንክብካቤ', count: 7, icon: Sparkles, slug: 'beauty-personal-care' },
  { name: 'Books & Stationery', nameAmharic: 'መጽሐፍት እና የጽህፈት መሳሪያዎች', count: 5, icon: BookOpen, slug: 'books-stationery' },
  { name: 'Sports & Outdoor', nameAmharic: 'ስፖርት እና የውጭ እንቅስቃሴዎች', count: 4, icon: Dumbbell, slug: 'sports-outdoor' },
];

export const HomePage: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();

  // Wishlist and Cart Redux state
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);
  const cartItems = useAppSelector((state) => state.cart.items);

  // Active filters and sort state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(55000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('Popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Quick View Modal product state
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  const isAmharic = i18n.language?.startsWith('am');

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return POPULAR_PRODUCTS.filter((prod) => {
      if (selectedCategory && prod.category !== selectedCategory) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brand)) return false;
      if (prod.price > maxPrice) return false;
      if (inStockOnly && !prod.inStock) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0; // Default Popularity
    });
  }, [selectedCategory, selectedBrands, maxPrice, inStockOnly, sortBy]);

  const handleAddToCart = (product: ShowcaseProduct) => {
    dispatch(
      addToCart({
        id: product.id,
        productId: product.id,
        title: product.title,
        titleAmharic: product.titleAmharic,
        price: product.price,
        discountPrice: product.originalPrice ? product.price : undefined,
        image: product.image,
        stock: product.stockCount,
        sku: 'SKU-' + product.id.toUpperCase(),
        quantity: 1,
      })
    );
    setAddedItemNotice(product.id);
    setTimeout(() => setAddedItemNotice(null), 1600);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    setMaxPrice(55000);
    setInStockOnly(false);
    setSortBy('Popularity');
  };

  // Cart widget values
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartDeliveryFee = cartSubtotal >= 5000 || cartSubtotal === 0 ? 0 : 1000;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. Hero Section (Image 1 Split Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Main Hero Card (~70%) */}
          <div className="lg:col-span-8 bg-[#FFF6ED] dark:bg-[#131B2A] rounded-3xl p-7 sm:p-10 border border-[#FDE3C8] dark:border-gray-800 shadow-2xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-md text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] border border-[#F97316]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>ShopNest Ethiopia &nbsp;•&nbsp; {BRAND.tagline}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1F2937] dark:text-white leading-[1.12] tracking-tight">
                Better Products<br />
                <span className="text-[#1F2937] dark:text-white">Bigger Dreams</span>
              </h1>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-gray-300 font-medium">
                Shop the latest products at the best prices.
              </p>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-gray-300 font-medium">
                የተሻሉ ምርቶች በምርጥ ዋጋ!
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Right Tech Showcase Image */}
            <div className="relative w-full md:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
                  alt="Modern desk setup with laptop, headphones, apple watch, and smartphone"
                  className="w-full h-56 sm:h-64 object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Promo Banner Card (~30%) */}
          <div className="lg:col-span-4 bg-[#FFF6ED] dark:bg-[#131B2A] rounded-3xl p-7 border border-[#FDE3C8] dark:border-gray-800 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#1F2937] dark:text-white">
                Up to 50% Off
              </h2>
              <p className="text-xs text-[#4B5563] dark:text-gray-400 font-semibold">
                on Selected Items
              </p>
              <div className="pt-2">
                <Link
                  to="/shop?discount=50"
                  className="inline-block px-4 py-1.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Promo Discount Visual Badge (No human photo) */}
            <div className="relative my-3 flex justify-end">
              <div className="w-36 h-36 rounded-2xl bg-[#FFF7ED] dark:bg-[#1E293B] border border-[#FDBA74]/40 dark:border-gray-700 flex flex-col items-center justify-center text-center p-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-xs mb-2">
                  <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-[#F97316] tracking-tight">SPECIAL OFFER</span>
                <span className="text-[10px] text-[#4B5563] dark:text-gray-300 font-semibold">50% Discount</span>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
              <span className="w-2 h-2 rounded-full bg-[#D1D5DB] dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Horizontal Category Bar (Image 1 Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 text-center">
            {CATEGORIES_LIST.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat.name);
                  }}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all group cursor-pointer ${
                    isSelected ? 'bg-[#FFF7ED] dark:bg-orange-950/40' : 'hover:bg-[#F9FAFB] dark:hover:bg-gray-800'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-[#F9FAFB] dark:bg-gray-800 text-[#4B5563] dark:text-gray-300 border border-[#E5E7EB] dark:border-gray-700 group-hover:border-[#F97316] group-hover:text-[#F97316]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold leading-tight line-clamp-1 ${
                      isSelected
                        ? 'text-[#F97316] font-bold'
                        : 'text-[#1F2937] dark:text-gray-200 group-hover:text-[#F97316]'
                    }`}
                  >
                    {isAmharic ? cat.nameAmharic : cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Marketplace Section (3 Columns matching Image 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Filters Sidebar (Left, ~250px) */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] dark:border-gray-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F97316]" />
                <h3 className="font-bold text-sm text-[#1F2937] dark:text-white">Filters</h3>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                Category
              </h4>
              <div className="space-y-2 text-xs">
                {CATEGORIES_LIST.slice(0, 5).map((cat) => (
                  <label
                    key={cat.slug}
                    className="flex items-center justify-between text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="categoryFilter"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="rounded-xs text-[#F97316] focus:ring-[#F97316]"
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-[#9CA3AF] text-[11px]">({cat.count})</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-[11px] font-bold text-[#F97316] hover:underline block pt-1"
                >
                  + All Categories
                </button>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2.5 pt-3 border-t border-[#F3F4F6] dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                  Price Range (ETB)
                </h4>
                <span className="text-xs font-bold text-[#F97316]">
                  Up to {formatETB(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="55000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#9CA3AF] font-medium">
                <span>0</span>
                <span>50,000+</span>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2.5 pt-3 border-t border-[#F3F4F6] dark:border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                Availability
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between text-[#4B5563] dark:text-gray-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-[#F97316] focus:ring-[#F97316]"
                    />
                    <span>In Stock</span>
                  </div>
                  <span className="text-[#9CA3AF] text-[11px]">(32)</span>
                </label>
                <label className="flex items-center justify-between text-[#4B5563] dark:text-gray-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled
                      className="rounded text-gray-300"
                    />
                    <span>Out of Stock</span>
                  </div>
                  <span className="text-[#9CA3AF] text-[11px]">(5)</span>
                </label>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5 pt-3 border-t border-[#F3F4F6] dark:border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-white">
                Brand
              </h4>
              <div className="space-y-2 text-xs">
                {['Samsung', 'Apple', 'Dell', 'HP', 'Sony'].map((brand, idx) => {
                  const counts = [7, 5, 4, 3, 2];
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center justify-between text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand)}
                          className="rounded text-[#F97316] focus:ring-[#F97316]"
                        />
                        <span>{brand}</span>
                      </div>
                      <span className="text-[#9CA3AF] text-[11px]">({counts[idx]})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Center Main Feed ("Popular Products", 4x2 Grid) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Header with Sort and Grid/List switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                  Popular Products
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  Discover our most loved products
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#6B7280] dark:text-gray-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#1F2937] dark:text-gray-200 focus:outline-hidden focus:border-[#F97316]"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Rating">Rating</option>
                  </select>
                </div>

                <div className="flex items-center border border-[#E5E7EB] dark:border-gray-700 rounded-lg p-0.5 bg-[#F9FAFB] dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-700 text-[#F97316] shadow-2xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 text-[#F97316] shadow-2xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid (4 cols on desktop or 2 on mobile) */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'
                  : 'space-y-3'
              }
            >
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const justAdded = addedItemNotice === product.id;

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Thumbnail Container */}
                      <div className="relative aspect-square w-full bg-[#F9FAFB] dark:bg-gray-900 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 z-10">
                          {product.discountBadge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F97316] text-white shadow-xs">
                              {product.discountBadge}
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => dispatch(toggleWishlist(product.id))}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-2xs flex items-center justify-center text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] transition-all cursor-pointer"
                          aria-label="Wishlist toggle"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? 'fill-[#F97316] text-[#F97316]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className="p-3 space-y-1.5 text-left">
                        <Link
                          to={`/product/${product.slug}`}
                          className="font-bold text-xs sm:text-sm text-[#1F2937] dark:text-gray-100 hover:text-[#F97316] line-clamp-1"
                          title={product.title}
                        >
                          {product.title}
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-gray-400">
                          <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
                          <span className="font-bold text-[#1F2937] dark:text-gray-200">
                            {product.rating}
                          </span>
                          <span>({product.reviewCount})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="text-xs sm:text-sm font-extrabold text-[#F97316]">
                            {formatETB(product.price)} ETB
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-[#9CA3AF] line-through">
                              {formatETB(product.originalPrice)} ETB
                            </span>
                          )}
                        </div>

                        {/* In Stock Badge */}
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          justAdded
                            ? 'bg-[#15803D] text-white'
                            : 'bg-[#F97316] hover:bg-[#EA580C] text-white active:scale-95'
                        }`}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Add to Cart</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Right Sidebar ("Your Cart" + Trust Badges) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Widget: "Your Cart" Live Floating Widget */}
            <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] dark:border-gray-800">
                <h3 className="font-extrabold text-sm text-[#1F2937] dark:text-white">
                  Your Cart
                </h3>
                <span className="text-xs font-semibold text-[#6B7280] dark:text-gray-400">
                  {cartItems.length} items
                </span>
              </div>

              {/* Cart Items List */}
              {cartItems.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] dark:border-gray-800/80 last:border-none"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1F2937] dark:text-gray-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-bold text-[#F97316]">
                          {formatETB(item.price)} ETB
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId || item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              )
                            }
                            className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs hover:bg-gray-200"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-[#1F2937] dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId || item.id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs hover:bg-gray-200"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.productId || item.id))}
                        className="text-[#9CA3AF] hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Demo items matching Image 1 when cart is empty */
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] dark:border-gray-800">
                    <img
                      src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80"
                      alt="iPhone 15 128GB"
                      className="w-12 h-12 object-cover rounded-xl bg-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1F2937] dark:text-gray-200 truncate">
                        iPhone 15 128GB
                      </p>
                      <p className="text-[11px] font-bold text-[#F97316]">54,999 ETB</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold">
                          Qty: 1
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] dark:border-gray-800">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"
                      alt="Samsung Galaxy Watch 6"
                      className="w-12 h-12 object-cover rounded-xl bg-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1F2937] dark:text-gray-200 truncate">
                        Samsung Galaxy Watch 6
                      </p>
                      <p className="text-[11px] font-bold text-[#F97316]">18,999 ETB</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold">
                          Qty: 1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Calculations */}
              <div className="pt-2 border-t border-[#F3F4F6] dark:border-gray-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F2937] dark:text-gray-200">
                    {formatETB(cartItems.length > 0 ? cartSubtotal : 73998)} ETB
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[#1F2937] dark:text-gray-200">
                    {formatETB(cartItems.length > 0 ? cartDeliveryFee : 1000)} ETB
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#1F2937] dark:text-white pt-1 border-t border-[#F3F4F6] dark:border-gray-800">
                  <span>Total</span>
                  <span className="text-[#F97316]">
                    {formatETB(cartItems.length > 0 ? cartTotal : 74998)} ETB
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                to="/checkout"
                className="w-full py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Bottom Widget: Trust Badges Card */}
            <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Free Delivery</h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">On orders over 5,000 ETB</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Secure Payment</h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">100% secure checkout</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">7 Days Return</h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">Easy return policy</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Customer Support</h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">+251 911 123 456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Features Bar (Footer Pre-bar matching Image 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-[#F97316]" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
                  Quality Products
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                  Top brands, great prices
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
                  Fast Delivery
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                  Across Ethiopia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
                  Secure Shopping
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                  Your data is safe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white">
                  ታማኝ አገልግሎት
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                  የቀንና የሌሊት ድጋፍ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Production Architecture & Redux RTK Status Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl p-5 shadow-xs text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3F4F6] dark:border-gray-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-white">
              <Server className="w-4 h-4 text-[#F97316]" />
              <span>Enterprise System Architecture & Live Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              All Systems Operational
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-[#1F2937] dark:text-gray-200">Frontend Stack</p>
              <p className="text-[#6B7280] dark:text-gray-400 text-[11px] mt-0.5">React 18 + Vite + Tailwind CSS</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-[#1F2937] dark:text-gray-200">Redux RTK Store</p>
              <p className="text-[#6B7280] dark:text-gray-400 text-[11px] mt-0.5">RTK Query + Cache Invalidation</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-[#1F2937] dark:text-gray-200">Backend API Gateway</p>
              <p className="text-[#6B7280] dark:text-gray-400 text-[11px] mt-0.5">Express + Node + TypeScript</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-[#1F2937] dark:text-gray-200">MongoDB Atlas</p>
              <p className="text-[#6B7280] dark:text-gray-400 text-[11px] mt-0.5">Cluster Shard + Mongoose ODM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal if opened */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};
