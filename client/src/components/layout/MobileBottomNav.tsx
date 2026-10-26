import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';

export const MobileBottomNav: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const location = useLocation();
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = useAppSelector((state) => state.wishlist.productIds.length);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const navItems = [
    {
      label: isAmharic ? 'ዋና ገጽ' : 'Home',
      icon: Home,
      path: '/',
      badge: 0,
    },
    {
      label: isAmharic ? 'ፈልግ' : 'Search',
      icon: Search,
      path: '/shop',
      badge: 0,
    },
    {
      label: isAmharic ? 'ጋሪ' : 'Cart',
      icon: ShoppingBag,
      path: '/cart',
      badge: totalCartCount,
    },
    {
      label: isAmharic ? 'ምኞት' : 'Saved',
      icon: Heart,
      path: '/wishlist',
      badge: wishlistCount,
    },
    {
      label: isAuthenticated
        ? (isAmharic ? 'መለያዬ' : 'Account')
        : (isAmharic ? 'ግባ' : 'Sign In'),
      icon: User,
      path: isAuthenticated ? '/account' : '/login',
      badge: 0,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-gray-800 shadow-lg px-2 py-1.5 transition-colors duration-200"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#F97316] font-bold'
                  : 'text-[#6B7280] dark:text-gray-400 hover:text-[#1F2937] dark:hover:text-gray-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
