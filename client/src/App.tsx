import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import {
  ShippingPolicyPage,
  ReturnsPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/PoliciesPages';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#F9FAFB] dark:bg-[#0B0F19] text-[#1F2937] dark:text-gray-100 pb-16 md:pb-0 transition-colors duration-200">
          <AnnouncementBar />
          <Header />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
                {/* Core Storefront Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/categories/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />

                {/* Shopping & Checkout Routes */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Order Tracking */}
                <Route path="/track-order" element={<TrackOrderPage />} />

                {/* Authentication & User Account Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders" element={<OrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />

                {/* Informational & Support Routes */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />

                {/* Customer Policies & Compliance */}
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Administrative Portal */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
