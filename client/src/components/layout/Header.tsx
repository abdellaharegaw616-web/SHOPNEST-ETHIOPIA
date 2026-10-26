import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { BRAND } from '@shopnest/shared';
import { useAppSelector } from '../../store/hooks';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { formatETB } from '../common/ProductPrice';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Live search query
  const { data: liveSearchResults, isFetching: isSearching } = useGetProductsQuery(
    { search: searchQuery.trim(), limit: 5 },
    { skip: searchQuery.trim().length < 2 }
  );
  const searchSuggestions = liveSearchResults?.data?.products || [];

  // Redux state
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const wishlistCount = useAppSelector((state) => state.wishlist.productIds.length);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const mainNavLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/shop', label: t('nav.shop') },
    { path: '/categories', label: t('nav.categories') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const categoryQuickLinks = [
    { slug: 'electronics', label: isAmharic ? 'ኤሌክትሮኒክስ' : 'Electronics' },
    { slug: 'phones-accessories', label: isAmharic ? 'ስልኮች እና መለዋወጫዎች' : 'Phones & Accessories' },
    { slug: 'computers', label: isAmharic ? 'ኮምፒውተሮች' : 'Computers' },
    { slug: 'fashion', label: isAmharic ? 'አልባሳት' : 'Fashion' },
    { slug: 'home-kitchen', label: isAmharic ? 'የቤት እና የወጥ ቤት' : 'Home & Kitchen' },
    { slug: 'beauty-personal-care', label: isAmharic ? 'የውበት እና የንፅህና' : 'Beauty & Personal Care' },
    { slug: 'groceries-essentials', label: isAmharic ? 'ልዩ የኢትዮጵያ ቡና' : 'Ethiopian Specialty Coffee' },
    { slug: 'books-stationery', label: isAmharic ? 'መጽሐፍት' : 'Books & Stationery' },
    { slug: 'sports-outdoors', label: isAmharic ? 'ስፖርት እና የውጪ እንቅስቃሴ' : 'Sports & Outdoors' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-200">
      {/* Main Header Bar */}
      <div className="w-full bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-gray-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Brand Logo & Name */}
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-[#1F2937] dark:text-white leading-none group-hover:text-[#F97316] dark:group-hover:text-[#FB923C] transition-colors">
                    ShopNest
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#6B7280] dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    {isAmharic ? 'ኢትዮጵያ' : 'Ethiopia'}
                  </span>
                  <span className="sr-only">ShopNest Ethiopia — {BRAND.tagline}</span>
                </div>
              </Link>
            </div>

            {/* Center: Search Bar (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full pl-5 pr-14 py-2.5 rounded-full bg-white dark:bg-gray-900 border border-[#D1D5DB] dark:border-gray-700 text-sm text-[#1F2937] dark:text-gray-100 placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-700 shadow-xl py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-[#F3F4F6] dark:border-gray-800">
                    <span>{isAmharic ? 'የፍለጋ ጥቆማዎች' : 'Live Product Suggestions'}</span>
                    {isSearching && <span className="text-[10px] text-[#F97316]">Searching...</span>}
                  </div>
                  {searchSuggestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#6B7280] dark:text-gray-400">
                      {isSearching ? 'Finding products...' : `No products matching "${searchQuery}"`}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F3F4F6] dark:divide-gray-800">
                      {searchSuggestions.map((prod) => (
                        <Link
                          key={prod.id || prod._id}
                          to={`/product/${prod.slug}`}
                          onClick={() => {
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[#FFF7ED] dark:hover:bg-gray-800/80 transition-colors"
                        >
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1F2937] dark:text-white truncate">
                              {isAmharic && prod.titleAmharic ? prod.titleAmharic : prod.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="font-extrabold text-[#F97316]">
                                ETB {formatETB(prod.discountPrice || prod.price)}
                              </span>
                              {prod.category && (
                                <span className="text-[#9CA3AF] text-[10px] uppercase">
                                  • {typeof prod.category === 'object' ? (prod.category as any).name : prod.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2.5 text-xs font-bold text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        {isAmharic ? `ሁሉንም "${searchQuery}" ውጤቶች ይመልከቱ →` : `View all results for "${searchQuery}" →`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Icons: Language, My Account, Wishlist, Cart, Dark Mode */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* My Account Dropdown / Link */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F2937] dark:bg-gray-800 text-white text-xs font-bold transition-colors hover:bg-black"
                      title="ShopNest Admin Operations"
                    >
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="flex items-center gap-2 py-1.5 px-2 rounded-xl text-[#1F2937] dark:text-gray-200 hover:text-[#F97316] dark:hover:text-[#FB923C] hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    title={user?.name || 'Account'}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-semibold text-xs overflow-hidden shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="hidden xl:inline text-xs font-bold">
                      {user?.name?.split(' ')[0] || t('nav.account')}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#6B7280] hidden xl:inline" />
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 hover:border-[#F97316] text-xs font-bold text-[#1F2937] dark:text-white hover:text-[#F97316] transition-colors shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#F97316] stroke-[2.2]" />
                  <span>{t('nav.login')}</span>
                </Link>
              )}

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative flex items-center gap-1.5 py-1.5 px-2 text-[#1F2937] dark:text-gray-200 hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 text-[#4B5563] dark:text-gray-300 stroke-[2]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-semibold">{t('nav.wishlist')}</span>
              </Link>

              {/* Live Shopping Cart */}
              <Link
                to="/cart"
                className="relative flex items-center gap-1.5 py-1.5 px-2 text-[#1F2937] dark:text-gray-200 hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors"
                aria-label={`Cart with ${totalCartCount} items`}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-[#4B5563] dark:text-gray-300 stroke-[2]" />
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                </div>
                <span className="hidden lg:inline text-xs font-semibold">{t('nav.cart')}</span>
              </Link>

              {/* Dark / Light Mode Toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* 3. Secondary Sub-Navigation Row (Desktop matching Image 1) */}
          <div className="hidden lg:flex items-center justify-between border-t border-[#F3F4F6] dark:border-gray-800 py-2.5 text-sm">
            <div className="flex items-center gap-8">
              {/* Categories Dropdown button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#1F2937] dark:text-white font-bold text-xs hover:text-[#F97316] transition-colors cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-[#1F2937] dark:text-white" />
                  <span>{isAmharic ? 'ሁሉም ምድቦች' : 'All Categories'}</span>
                </button>

                {/* Dropdown Menu */}
                {categoryDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-[#E5E7EB] dark:border-gray-700 py-2 z-50"
                    onMouseLeave={() => setCategoryDropdownOpen(false)}
                  >
                    {categoryQuickLinks.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/categories/${cat.slug}`}
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] hover:bg-[#FFF7ED] dark:hover:bg-gray-800 transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#F3F4F6] dark:border-gray-800 mt-1 pt-1">
                      <Link
                        to="/categories"
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="block px-4 py-1.5 text-xs font-bold text-[#F97316] hover:underline"
                      >
                        {isAmharic ? 'ሁሉንም ምድቦች ያስሱ →' : 'Browse All Categories →'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Center Nav Links */}
              <nav className="flex items-center gap-7">
                {mainNavLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isActive
                          ? 'text-[#F97316]'
                          : 'text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#FB923C]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Support & Delivery Utility Info */}
            <div className="flex items-center gap-5 text-xs font-medium text-[#64748B] dark:text-gray-400">
              <span className="hidden xl:inline">
                {isAmharic ? (
                  <>🚚 ከ<strong className="text-[#1F2937] dark:text-white font-bold">5,000 ብር</strong> በላይ ነፃ ማድረሻ</>
                ) : (
                  <>🚚 Free delivery on orders over <strong className="text-[#1F2937] dark:text-white font-bold">5,000 ETB</strong></>
                )}
              </span>
              <Link
                to="/track-order"
                className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors font-semibold"
              >
                {isAmharic ? 'ትዕዛዝ መከታተያ' : 'Track Order'}
              </Link>
              <Link
                to="/contact"
                className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors font-semibold"
              >
                {isAmharic ? 'የደንበኞች አገልግሎት' : 'Customer Support'}
              </Link>
            </div>
          </div>

        {/* Mobile Search Bar (under header row) */}
        <div className="md:hidden pb-3 pt-1 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#F97316]"
            />
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#F97316] text-white text-[11px] font-medium"
            >
              {isAmharic ? 'ፈልግ' : 'Search'}
            </button>
          </form>

          {/* Mobile Live Suggestions Dropdown */}
          {searchFocused && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-gray-700 shadow-xl py-1 z-50 overflow-hidden">
              {searchSuggestions.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#6B7280] dark:text-gray-400">
                  {isSearching ? 'Finding products...' : `No products found`}
                </div>
              ) : (
                <div className="divide-y divide-[#F3F4F6] dark:divide-gray-800">
                  {searchSuggestions.map((prod) => (
                    <Link
                      key={prod.id || prod._id}
                      to={`/product/${prod.slug}`}
                      onClick={() => {
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-2.5 p-2 hover:bg-[#FFF7ED] dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}
                        alt={prod.title}
                        className="w-8 h-8 rounded-md object-cover bg-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[#1F2937] dark:text-white truncate">
                          {isAmharic && prod.titleAmharic ? prod.titleAmharic : prod.title}
                        </p>
                        <p className="text-[10px] font-bold text-[#F97316]">
                          ETB {formatETB(prod.discountPrice || prod.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-[#111827] h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 transition-colors">
            <div className="p-5 space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1F2937] dark:text-white text-base">{BRAND.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] dark:text-gray-400 hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher in Mobile */}
              <div className="flex items-center justify-between bg-[#F9FAFB] dark:bg-gray-800 p-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700">
                <span className="text-xs font-medium text-[#4B5563] dark:text-gray-300">Language / ቋንቋ:</span>
                <LanguageSelector />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                <p className="text-[11px] font-bold text-[#9CA3AF] dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {isAmharic ? 'ዋና ምናሌ' : 'Menu'}
                </p>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-white hover:bg-[#FFF7ED] dark:hover:bg-gray-800 hover:text-[#F97316] transition-colors"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Category Links in Mobile */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#9CA3AF] dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {isAmharic ? 'ዋና ዋና ምድቦች' : 'Top Categories'}
                </p>
                {categoryQuickLinks.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/categories/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] hover:bg-[#F9FAFB] dark:hover:bg-gray-800"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer Account / Auth */}
            <div className="p-5 border-t border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 border border-[#F97316] flex items-center justify-center text-[#F97316] font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#1F2937] dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#6B7280] dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C]"
                  >
                    {isAmharic ? 'መለያዬ እና ትዕዛዞች' : 'Manage Account & Orders'}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-[#1F2937] dark:text-white hover:border-[#F97316]"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C]"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
