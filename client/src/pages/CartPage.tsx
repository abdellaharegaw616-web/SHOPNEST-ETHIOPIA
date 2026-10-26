import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  Truck,
  CheckCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  CartItem,
  setStockWarnings,
  clearStockWarnings,
} from '../store/slices/cartSlice';
import { formatETB } from '../components/common/ProductPrice';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';
import { useGetCartQuery } from '../store/api/cartApi';
import { useValidateCouponMutation } from '../store/api/couponApi';

export const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAmharic = i18n.language?.startsWith('am');

  const { items, couponCode, discountPercent, discountAmount: storedDiscountAmount, warnings } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const [validateCouponMutation, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  // Revalidate cart with backend prices and stock
  const { data: serverCartData } = useGetCartQuery(
    couponCode ? { couponCode } : undefined,
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (serverCartData?.data?.warnings && serverCartData.data.warnings.length > 0) {
      dispatch(setStockWarnings(serverCartData.data.warnings));
    }
  }, [serverCartData, dispatch]);

  const subtotal = items.reduce((sum: number, item: CartItem) => {
    const activePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + activePrice * item.quantity;
  }, 0);

  // Delivery fee rules: Free over threshold (2,500 ETB), standard 150 ETB in Addis Ababa
  const freeThreshold = ETHIOPIA_CONSTANTS.delivery.freeDeliveryThreshold;
  const standardFee = ETHIOPIA_CONSTANTS.delivery.addisAbabaStandardFee;
  const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : standardFee;
  const discountAmount = storedDiscountAmount > 0
    ? storedDiscountAmount
    : discountPercent > 0
    ? (subtotal * discountPercent) / 100
    : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const progressToFreeDelivery = Math.min(100, (subtotal / freeThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await validateCouponMutation({ code, subtotal }).unwrap();
      if (res.success && res.data) {
        dispatch(
          applyCoupon({
            code: res.data.code,
            discountPercent: res.data.discountType === 'percentage' ? res.data.discountValue : 0,
            discountAmount: res.data.discountAmount,
          })
        );
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError(
        err.data?.message || err.message || 'Invalid or expired coupon code. Check requirements.'
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-10 space-y-6 shadow-xs transition-colors">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center ring-8 ring-[#FFF7ED]/50 dark:ring-orange-950/30">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#1F2937] dark:text-white">
              {t('cart.emptyCart') || 'Your Cart is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
              {t('cart.emptyCartSubtitle') || 'Explore authentic Ethiopian specialties and top tech brands ready for delivery across Ethiopia.'}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold shadow-md transition-all"
          >
            <span>{t('cart.startShopping') || 'Start Shopping'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Stock or Price Change Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Cart Notice: Price or Stock Availability Updates</span>
            </div>
            <button
              onClick={() => dispatch(clearStockWarnings())}
              className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline font-medium"
            >
              Dismiss
            </button>
          </div>
          <ul className="text-xs space-y-1 pl-6 list-disc text-amber-800 dark:text-amber-300">
            {warnings.map((w, idx) => (
              <li key={idx}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Free Delivery Incentive Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-4 sm:p-5 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-2.5">
          <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-white">
            <Truck className="w-4 h-4 text-[#F97316]" />
            {remainingForFreeDelivery === 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                You have qualified for FREE Door-to-Door Delivery in Addis Ababa!
              </span>
            ) : (
              <span>
                Add <strong className="text-[#F97316]">ETB {formatETB(remainingForFreeDelivery)}</strong> more for <strong>FREE Door-to-Door Delivery</strong> in Addis Ababa!
              </span>
            )}
          </div>
          <span className="font-semibold text-[#6B7280] dark:text-gray-400">
            Threshold: ETB {formatETB(freeThreshold)}
          </span>
        </div>
        <div className="w-full bg-[#F3F4F6] dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              remainingForFreeDelivery === 0 ? 'bg-emerald-500' : 'bg-[#F97316]'
            }`}
            style={{ width: `${progressToFreeDelivery}%` }}
          />
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">
            {t('cart.title') || 'Shopping Cart'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-0.5">
            {items.length} {items.length === 1 ? 'item' : 'items'} ready for Ethiopian checkout
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item: CartItem) => {
            const activePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
            const displayTitle = isAmharic && item.titleAmharic ? item.titleAmharic : item.title;
            const lineTotal = activePrice * item.quantity;
            const isAtStockLimit = item.stock > 0 && item.quantity >= item.stock;

            return (
              <div
                key={item.productId}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-2xs hover:border-[#F97316]/40 transition-colors"
              >
                {/* Image and Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80'}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.sku?.toLowerCase() || item.productId}`}
                      className="text-sm font-bold text-[#1F2937] dark:text-white hover:text-[#F97316] line-clamp-1 transition-colors"
                    >
                      {displayTitle}
                    </Link>
                    <p className="text-xs text-[#6B7280] dark:text-gray-400">SKU: {item.sku}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F97316]">
                        ETB {formatETB(activePrice)}
                      </span>
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="text-[11px] text-[#9CA3AF] line-through">
                          ETB {formatETB(item.price)}
                        </span>
                      )}
                    </div>
                    {item.stock > 0 && item.stock <= 5 && (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full inline-block">
                        Only {item.stock} left in stock!
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper, Line Total, and Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F3F4F6] dark:border-gray-800">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#E5E7EB] dark:border-gray-700 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 shadow-2xs">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      className="p-2 text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-[#1F2937] dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={isAtStockLimit}
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="p-2 text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5.5rem]">
                    <span className="text-xs text-[#6B7280] dark:text-gray-400 block sm:hidden">Total:</span>
                    <span className="text-sm font-extrabold text-[#1F2937] dark:text-white">
                      ETB {formatETB(lineTotal)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="p-2 text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title={t('cart.removeItem') || 'Remove Item'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 flex items-center justify-between text-xs shadow-2xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#1F2937] dark:text-white">Shopping as Guest</span>
                <p className="text-[#6B7280] dark:text-gray-400">Your cart is preserved in this browser. Log in to sync across your smartphone and laptop.</p>
              </div>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] font-bold hover:bg-[#F97316] hover:text-white transition-all shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 space-y-5 shadow-2xs transition-colors">
            <h2 className="text-base font-bold text-[#1F2937] dark:text-white border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
                <span>{t('cart.subtotal') || 'Subtotal'}</span>
                <span className="font-semibold text-[#1F2937] dark:text-white">ETB {formatETB(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <span>{t('cart.deliveryFee') || 'Estimated Delivery'}</span>
                  <span className="text-[10px] text-[#9CA3AF] dark:text-gray-400">(Addis Ababa)</span>
                </div>
                <span className="font-semibold text-[#1F2937] dark:text-white">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `ETB ${formatETB(deliveryFee)}`
                  )}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-[#EA580C] bg-[#FFF7ED] dark:bg-orange-950/40 p-2 rounded-xl border border-[#F97316]/20 dark:border-orange-500/30">
                  <span>Discount ({couponCode} -{discountPercent}%)</span>
                  <span className="font-extrabold">-ETB {formatETB(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-[#F3F4F6] dark:border-gray-800 pt-3 flex items-center justify-between text-base">
                <span className="font-bold text-[#1F2937] dark:text-white">{t('cart.total') || 'Estimated Total'}</span>
                <span className="font-black text-[#F97316]">
                  ETB {formatETB(total)}
                </span>
              </div>
            </div>

            {/* Coupon Entry */}
            <div className="pt-2 border-t border-[#F3F4F6] dark:border-gray-800 space-y-2">
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/30 text-xs">
                  <div className="flex items-center gap-1.5 text-[#EA580C] font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Applied: {couponCode} (-{discountPercent}%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeCoupon())}
                    className="text-xs text-[#6B7280] dark:text-gray-400 hover:text-rose-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white uppercase focus:outline-hidden focus:border-[#F97316]"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingCoupon}
                      className="px-4 py-2 rounded-xl bg-[#1F2937] dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
                    >
                      {isValidatingCoupon ? 'Validating...' : t('cart.apply') || 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                  <p className="text-[10px] text-[#9CA3AF] dark:text-gray-400">
                    Available codes: <strong className="text-[#F97316]">WELCOME10</strong> (10% off), <strong className="text-[#F97316]">ADDIS20</strong> (20% off)
                  </p>
                </form>
              )}
            </div>

            {/* Proceed to Checkout Action */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t('cart.checkout') || 'Proceed to Secure Checkout'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Ethiopian Trust Badges */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 text-xs text-[#6B7280] dark:text-gray-400 space-y-2.5 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 text-[#1F2937] dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span>ShopNest Ethiopia Guarantee</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#4B5563] dark:text-gray-300">
              <li>✓ Authentic local and international goods with receipt</li>
              <li>✓ Telebirr, CBE Birr, Chapa, & Cash on Delivery supported</li>
              <li>✓ Full order re-verification to protect against price shocks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
