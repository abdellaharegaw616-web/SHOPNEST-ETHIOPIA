import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  ArrowRight,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Truck,
  User as UserIcon,
  Check,
  Sparkles,
  Tag,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart, applyCoupon, removeCoupon, CartItem } from '../store/slices/cartSlice';
import {
  useCreateOrderMutation,
  useSimulatePaymentMutation,
  OrderRecord,
} from '../store/api/ordersApi';
import { useValidateCouponMutation } from '../store/api/couponApi';
import { formatETB } from '../components/common/ProductPrice';
import { ETHIOPIA_CONSTANTS, EthiopianPaymentProvider } from '@shopnest/shared';

export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { items, couponCode, discountPercent, discountAmount: storedDiscountAmount } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Coupon state within Checkout
  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [checkoutCouponError, setCheckoutCouponError] = useState('');
  const [validateCouponMutation, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  // Generate a unique idempotency key for this checkout form session
  const [idempotencyKey] = useState<string>(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Contact Info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+251 9');

  // Address Selection for Authenticated Users
  const [selectedSavedAddressIndex, setSelectedSavedAddressIndex] = useState<number | 'new'>(
    user?.addresses && user.addresses.length > 0 ? 0 : 'new'
  );

  // Address Fields
  const [region, setRegion] = useState('Addis Ababa');
  const [city, setCity] = useState('Addis Ababa');
  const [subCity, setSubCity] = useState('Bole');
  const [woreda, setWoreda] = useState('03');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);

  // Populate from saved address if selected
  useEffect(() => {
    if (selectedSavedAddressIndex !== 'new' && user?.addresses && user.addresses[selectedSavedAddressIndex]) {
      const addr = user.addresses[selectedSavedAddressIndex];
      setCustomerName(addr.fullName || user.name);
      setCustomerPhone(addr.phone || user.phone);
      if (addr.region) setRegion(addr.region);
      setCity(addr.city || 'Addis Ababa');
      if (addr.subCity) setSubCity(addr.subCity);
      if (addr.woreda) setWoreda(addr.woreda);
      if (addr.houseNumber) setHouseNumber(addr.houseNumber);
      if (addr.landmark) setLandmark(addr.landmark);
      if (addr.instructions) setDeliveryInstructions(addr.instructions);
    }
  }, [selectedSavedAddressIndex, user]);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<EthiopianPaymentProvider>('telebirr');

  // Terms Acceptance
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Local & Backend Validation Errors
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Order & Payment State
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
  const [simulatePayment, { isLoading: isSimulating }] = useSimulatePaymentMutation();
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  // Validate Ethiopian phone number
  const validatePhone = (num: string): boolean => {
    const cleaned = num.replace(/\s+/g, '');
    return ETHIOPIA_CONSTANTS.phoneRegex.test(cleaned);
  };

  // Real-time phone check
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    if (val.trim() && !validatePhone(val)) {
      setPhoneError('Invalid Ethiopian phone format (+2519... / 09... / +2517... / 07...)');
    } else {
      setPhoneError('');
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum: number, item: CartItem) => {
      const activePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
      return sum + activePrice * item.quantity;
    }, 0);
  }, [items]);

  const isAddis = city.toLowerCase().includes('addis');
  const standardFee = isAddis
    ? ETHIOPIA_CONSTANTS.delivery.addisAbabaStandardFee
    : ETHIOPIA_CONSTANTS.delivery.regionalStandardFee;

  const deliveryFee =
    subtotal >= ETHIOPIA_CONSTANTS.delivery.freeDeliveryThreshold || subtotal === 0
      ? 0
      : standardFee;

  const discountAmount = storedDiscountAmount > 0
    ? storedDiscountAmount
    : discountPercent > 0
    ? (subtotal * discountPercent) / 100
    : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCheckoutCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutCouponError('');
    const code = checkoutCouponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await validateCouponMutation({
        code,
        subtotal,
        items: items.map((item: CartItem) => ({
          product: item.productId,
          price: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price,
          quantity: item.quantity,
        })),
      }).unwrap();
      if (res.success && res.data) {
        dispatch(
          applyCoupon({
            code: res.data.code,
            discountPercent: res.data.discountType === 'percentage' ? res.data.discountValue : 0,
            discountAmount: res.data.discountAmount,
          })
        );
        setCheckoutCouponInput('');
      } else {
        setCheckoutCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCheckoutCouponError(
        err.data?.message || err.message || 'Invalid or expired coupon code. Check requirements.'
      );
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPhoneError('');

    if (!customerName.trim()) {
      setErrorMessage('Full recipient name is required.');
      return;
    }

    if (!validatePhone(customerPhone)) {
      setPhoneError('Please provide a valid Ethiopian phone number (+251 9... / 09... / +251 7... / 07...)');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms of Service & Consumer Protection policy.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Cannot create an order with an empty cart.');
      return;
    }

    try {
      const payload = {
        shippingAddress: {
          fullName: customerName.trim(),
          phone: customerPhone.replace(/\s+/g, ''),
          region,
          city,
          subCity: isAddis ? subCity : undefined,
          woreda: woreda || undefined,
          houseNumber: houseNumber || undefined,
          landmark: landmark || undefined,
          instructions: deliveryInstructions || undefined,
        },
        paymentMethod,
        couponCode: couponCode || undefined,
        deliveryInstructions: deliveryInstructions || undefined,
        idempotencyKey,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.replace(/\s+/g, ''),
        saveAddressToProfile: isAuthenticated ? saveAddressToProfile : undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      const response = await createOrder(payload).unwrap();
      if (response.success && response.data) {
        setCreatedOrder(response.data);
        dispatch(clearCart());
      } else {
        setErrorMessage(response.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      const validationDetails = Array.isArray(err.data?.errors)
        ? err.data.errors.map((e: any) => `${e.message}`).join(', ')
        : null;
      const backendMsg =
        validationDetails ||
        err.data?.message ||
        err.data?.error ||
        err.error ||
        err.message;

      if (err.status === 409) {
        setErrorMessage('Stock conflict: One of your items has sold out or has limited quantity. Please review your cart.');
      } else if (backendMsg && !backendMsg.toLowerCase().includes('failed to fetch')) {
        setErrorMessage(backendMsg);
      } else {
        setErrorMessage('Unable to connect to the ShopNest checkout service. Please verify your connection or try again.');
      }
    }
  };

  // Simulate Payment Handler
  const handleSimulatePayment = async (action: 'success' | 'failure') => {
    if (!createdOrder) return;
    setSimulationNotice(null);

    try {
      const res = await simulatePayment({
        orderId: createdOrder.id || (createdOrder as any)._id,
        action,
        failureReason: action === 'failure' ? 'Simulation: Customer cancelled transaction or insufficient wallet balance' : undefined,
      }).unwrap();

      if (res.success && res.data) {
        setCreatedOrder(res.data.order);
        setSimulationNotice(
          action === 'success'
            ? '✅ Payment marked as COMPLETED. Order moved to PROCESSING status!'
            : '❌ Payment marked as FAILED. Customer can retry payment.'
        );
      }
    } catch (err: any) {
      console.error('Simulation error:', err);
      setSimulationNotice('Failed to execute simulation: ' + (err.data?.message || err.message));
    }
  };

  // ORDER CONFIRMATION SCREEN (With simulated payment environment)
  if (createdOrder) {
    const isPaid = createdOrder.paymentStatus === 'completed';
    const isFailed = createdOrder.paymentStatus === 'failed';
    const isCod = createdOrder.paymentMethod === 'cash_on_delivery';

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
            Order Reference Successfully Generated
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">
            Your official ShopNest Ethiopia order reference number is{' '}
            <strong className="text-[#1F2937] dark:text-white text-base">{createdOrder.orderNumber}</strong>
          </p>
        </div>

        {/* Status Tracker Card (Separation of Order and Payment Status) */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F3F4F6] dark:border-gray-800 gap-3">
            <div>
              <span className="text-xs text-[#6B7280] dark:text-gray-400">Order Placed At</span>
              <p className="text-xs font-bold text-[#1F2937] dark:text-white">
                {new Date(createdOrder.createdAt).toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })} (Addis Ababa)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Order Status Badge */}
              <div className="text-right">
                <span className="text-[10px] text-[#6B7280] dark:text-gray-400 block uppercase tracking-wider">Order Status</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                    createdOrder.orderStatus === 'processing'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                      : createdOrder.orderStatus === 'shipped'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                      : createdOrder.orderStatus === 'delivered'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {createdOrder.orderStatus}
                </span>
              </div>

              {/* Payment Status Badge */}
              <div className="text-right">
                <span className="text-[10px] text-[#6B7280] dark:text-gray-400 block uppercase tracking-wider">Payment Status</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                    isPaid
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : isFailed
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {createdOrder.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Critical Business Rule Banner */}
          <div className="p-3.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800/60 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#4B5563] dark:text-gray-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>
              <strong>Backend Verification:</strong> All line items, delivery rules, and discounts were computed securely by the ShopNest server backend.
            </span>
          </div>

          {/* SIMULATED PAYMENT ENVIRONMENT (Clearly Labeled Sandbox) */}
          <div className="rounded-2xl border-2 border-dashed border-[#F97316]/50 bg-[#FFF7ED] dark:bg-orange-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-orange-400">
                <Sparkles className="w-4 h-4" />
                <span>⚠️ Simulated Payment Environment (Development Sandbox)</span>
              </div>
              <span className="text-[10px] bg-[#EA580C] text-white px-2 py-0.5 rounded-full font-bold">
                SANDBOX
              </span>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-gray-300">
              In production, the customer is redirected to the provider's payment gateway (Telebirr App, CBE Birr USSD, or Chapa Portal).
              <strong> Strict Business Rule:</strong> An order is NEVER marked as paid simply because a user visits this page.
              Use the development controls below to simulate real-world payment callbacks:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isPaid || isSimulating}
                onClick={() => handleSimulatePayment('success')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                type="button"
                disabled={isPaid || isSimulating}
                onClick={() => handleSimulatePayment('failure')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Simulate Payment Failure</span>
              </button>

              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-gray-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing simulation...</span>
                </div>
              )}
            </div>

            {simulationNotice && (
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-[#1F2937] dark:text-white">
                {simulationNotice}
              </div>
            )}
          </div>

          {/* Order Summary & Destination Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-4 bg-[#F9FAFB] dark:bg-gray-800/60">
              <span className="font-bold text-[#1F2937] dark:text-white block">Delivery Destination</span>
              <p className="text-[#4B5563] dark:text-gray-300">
                <strong>{createdOrder.shippingAddress.fullName}</strong> ({createdOrder.shippingAddress.phone})
              </p>
              <p className="text-[#4B5563] dark:text-gray-300">
                {createdOrder.shippingAddress.city}
                {createdOrder.shippingAddress.subCity && `, ${createdOrder.shippingAddress.subCity} Sub-City`}
              </p>
              {createdOrder.shippingAddress.landmark && (
                <p className="text-[#4B5563] dark:text-gray-300">Landmark: {createdOrder.shippingAddress.landmark}</p>
              )}
              {createdOrder.deliveryInstructions && (
                <p className="text-[#6B7280] dark:text-gray-400 italic">Instructions: {createdOrder.deliveryInstructions}</p>
              )}
            </div>

            <div className="space-y-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl p-4 bg-[#F9FAFB] dark:bg-gray-800/60">
              <span className="font-bold text-[#1F2937] dark:text-white block">Financial Summary</span>
              <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#1F2937] dark:text-white">ETB {formatETB(createdOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                <span>Delivery:</span>
                <span className="font-semibold text-[#1F2937] dark:text-white">
                  {createdOrder.deliveryFee === 0 ? 'FREE' : `ETB ${formatETB(createdOrder.deliveryFee)}`}
                </span>
              </div>
              {(createdOrder.discountAmount || createdOrder.discount) ? (
                <div className="flex justify-between text-[#EA580C] dark:text-orange-400">
                  <span>Discount:</span>
                  <span className="font-bold">
                    -ETB {formatETB(createdOrder.discountAmount || createdOrder.discount || 0)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-extrabold text-[#1F2937] dark:text-white border-t border-[#E5E7EB] dark:border-gray-750 pt-1">
                <span>Total:</span>
                <span className="text-[#F97316]">
                  ETB {formatETB(createdOrder.totalAmount || createdOrder.total || 0)}
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-gray-400 pt-1">
                Payment Method: <strong className="uppercase">{createdOrder.paymentMethod.replace(/_/g, ' ')}</strong>
                {isCod && <span className="text-amber-700 dark:text-amber-400 block font-semibold">(Pay upon physical delivery)</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-[#F3F4F6] dark:border-gray-800">
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              Continue Shopping
            </Link>
            {isAuthenticated && (
              <Link
                to="/account/orders"
                className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-750 text-[#1F2937] dark:text-gray-200 text-xs sm:text-sm font-semibold hover:border-[#F97316] transition-colors"
              >
                View Order History
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-[#6B7280]">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1F2937]">Your Cart is Empty</h2>
        <p className="text-xs text-[#6B7280]">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] transition-colors"
        >
          Explore ShopNest Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] dark:border-gray-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white tracking-tight">
          Secure Ethiopian Checkout
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-0.5">
          Guaranteed door-to-door delivery with Telebirr, CBE Birr, Chapa, or Cash on Delivery
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Form: Contact, Destination, Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Customer Contact Information */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-white text-sm border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
              <UserIcon className="w-4 h-4 text-[#F97316]" />
              <span>Step 1: Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full pl-3 pr-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Email (Optional for Receipt)</label>
                <div className="relative">
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@shopnest.et"
                    className="w-full pl-3 pr-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200 flex items-center justify-between">
                  <span>Ethiopian Phone *</span>
                  {customerPhone && validatePhone(customerPhone) && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+251 911 234567"
                  className={`w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border text-xs text-[#1F2937] dark:text-white focus:outline-hidden ${
                    phoneError ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'border-[#E5E7EB] dark:border-gray-700 focus:border-[#F97316]'
                  }`}
                />
                {phoneError && <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{phoneError}</p>}
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Destination */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-white text-sm">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                <span>Step 2: Ethiopian Delivery Destination</span>
              </div>
              <span className="text-xs text-[#6B7280] dark:text-gray-400">
                {isAddis ? 'Addis Ababa Door-to-Door' : 'Regional Express Delivery'}
              </span>
            </div>

            {/* Saved Addresses for Authenticated Users */}
            {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-[#F3F4F6] dark:border-gray-800">
                <label className="text-xs font-bold text-[#1F2937] dark:text-gray-200 block">Choose a Saved Address:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {user.addresses.map((addr, idx) => (
                    <label
                      key={idx}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedSavedAddressIndex === idx
                          ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                          : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedSavedAddressIndex === idx}
                        onChange={() => setSelectedSavedAddressIndex(idx)}
                        className="sr-only"
                      />
                      <div className="font-bold text-[#1F2937] dark:text-white flex items-center justify-between">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-[#4B5563] dark:text-gray-300 px-1.5 py-0.5 rounded-sm">Default</span>
                        )}
                      </div>
                      <p className="text-[#6B7280] dark:text-gray-400 text-[11px] truncate">
                        {addr.city}, {addr.subCity || addr.region}
                      </p>
                      <p className="text-[#9CA3AF] text-[10px]">{addr.phone}</p>
                    </label>
                  ))}

                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center ${
                      selectedSavedAddressIndex === 'new'
                        ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                        : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedSavedAddressIndex === 'new'}
                      onChange={() => setSelectedSavedAddressIndex('new')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-[#F97316]">+ Enter New Address</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Region</label>
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    if (e.target.value === 'Addis Ababa') {
                      setCity('Addis Ababa');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                >
                  {ETHIOPIA_CONSTANTS.regions.map((reg: string) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Addis Ababa or Hawassa"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                />
              </div>

              {isAddis ? (
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-200">Addis Ababa Sub-City *</label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                  >
                    {ETHIOPIA_CONSTANTS.addisAbabaSubCities.map((sc: string) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-200">Locality / Zone</label>
                  <input
                    type="text"
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    placeholder="e.g. Piazza / Tabor / Kebele 04"
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Woreda / Kebele</label>
                <input
                  type="text"
                  value={woreda}
                  onChange={(e) => setWoreda(e.target.value)}
                  placeholder="e.g. Woreda 03"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">House / Building Number</label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. Building 4B, Apt 201"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Prominent Landmark *</label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Edna Mall / Next to Commercial Bank..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#1F2937] dark:text-gray-200">Special Delivery Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call before arrival, leave with security guard at compound gate..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white"
                />
              </div>

              {isAuthenticated && selectedSavedAddressIndex === 'new' && (
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="w-4 h-4 text-[#F97316] rounded-sm focus:ring-[#F97316]"
                  />
                  <label htmlFor="saveAddress" className="text-xs text-[#4B5563] dark:text-gray-300 cursor-pointer">
                    Save this address to my ShopNest account for future orders
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Payment Method Selection */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-white text-sm border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
              <CreditCard className="w-4 h-4 text-[#F97316]" />
              <span>Step 3: Select Ethiopian Payment Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'telebirr'
                    ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                    : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="telebirr"
                  checked={paymentMethod === 'telebirr'}
                  onChange={() => setPaymentMethod('telebirr')}
                  className="mt-0.5 text-[#F97316] focus:ring-[#F97316]"
                />
                <div>
                  <span className="font-bold text-[#1F2937] dark:text-white block">Telebirr (ቴሌብር)</span>
                  <span className="text-[#6B7280] dark:text-gray-400 text-[11px]">Instant Ethio Telecom mobile wallet payment</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cbe_birr'
                    ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                    : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cbe_birr"
                  checked={paymentMethod === 'cbe_birr'}
                  onChange={() => setPaymentMethod('cbe_birr')}
                  className="mt-0.5 text-[#F97316] focus:ring-[#F97316]"
                />
                <div>
                  <span className="font-bold text-[#1F2937] dark:text-white block">CBE Birr (ሲቢኢ ብር)</span>
                  <span className="text-[#6B7280] dark:text-gray-400 text-[11px]">Commercial Bank of Ethiopia direct payment</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'chapa'
                    ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                    : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="chapa"
                  checked={paymentMethod === 'chapa'}
                  onChange={() => setPaymentMethod('chapa')}
                  className="mt-0.5 text-[#F97316] focus:ring-[#F97316]"
                />
                <div>
                  <span className="font-bold text-[#1F2937] dark:text-white block">Chapa (ቻፓ)</span>
                  <span className="text-[#6B7280] dark:text-gray-400 text-[11px]">Visa, Mastercard, & local Ethiopian bank integration</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-orange-950/40'
                    : 'border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="mt-0.5 text-[#F97316] focus:ring-[#F97316]"
                />
                <div>
                  <span className="font-bold text-[#1F2937] dark:text-white block">Cash on Delivery (በደረሰ ጊዜ ክፍያ)</span>
                  <span className="text-[#6B7280] dark:text-gray-400 text-[11px]">Pay upon physical parcel inspection in Addis</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 space-y-4 shadow-2xs transition-colors">
            <h2 className="text-base font-bold text-[#1F2937] dark:text-white border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Line items mini-preview */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item: CartItem) => {
                const itemPrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
                return (
                  <div key={item.productId} className="flex items-center gap-3 text-xs">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 truncate">
                      <span className="font-semibold text-[#1F2937] dark:text-white block truncate">
                        {item.quantity}x {item.title}
                      </span>
                      <span className="text-[10px] text-[#6B7280] dark:text-gray-400">
                        ETB {formatETB(itemPrice)} each
                      </span>
                    </div>
                    <span className="font-bold text-[#1F2937] dark:text-white shrink-0">
                      ETB {formatETB(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 border-t border-[#F3F4F6] dark:border-gray-800 pt-3 text-xs">
              <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1F2937] dark:text-white">ETB {formatETB(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#6B7280] dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span>Delivery</span>
                  <span className="text-[10px] text-[#9CA3AF] dark:text-gray-400">
                    ({isAddis ? 'Addis Ababa' : 'Regional'})
                  </span>
                </div>
                <span className="font-semibold text-[#1F2937] dark:text-white">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `ETB ${formatETB(deliveryFee)}`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#EA580C] bg-[#FFF7ED] dark:bg-orange-950/40 p-2.5 rounded-xl border border-[#F97316]/20 dark:border-orange-500/30">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>
                      Coupon ({couponCode}
                      {discountPercent > 0 ? ` -${discountPercent}%` : ''})
                    </span>
                  </div>
                  <span className="font-extrabold">-ETB {formatETB(discountAmount)}</span>
                </div>
              )}

              {/* Coupon input / badge in checkout */}
              <div className="pt-1">
                {couponCode ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#EA580C] font-semibold">
                      <Tag className="w-3 h-3" />
                      <span>{couponCode} applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(removeCoupon())}
                      className="text-[11px] text-[#6B7280] dark:text-gray-400 hover:text-rose-600 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. WELCOME10)"
                        value={checkoutCouponInput}
                        onChange={(e) => setCheckoutCouponInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white uppercase focus:outline-hidden focus:border-[#F97316]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCheckoutCoupon}
                        disabled={isValidatingCoupon}
                        className="px-3 py-1.5 rounded-lg bg-[#1F2937] dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isValidatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {checkoutCouponError && (
                      <p className="text-[10px] text-rose-600 font-medium">{checkoutCouponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-base font-black text-[#1F2937] dark:text-white border-t border-[#F3F4F6] dark:border-gray-800 pt-2">
                <span>Final Total to Pay</span>
                <span className="text-[#F97316]">ETB {formatETB(estimatedTotal)}</span>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="pt-2 border-t border-[#F3F4F6] dark:border-gray-800">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#4B5563] dark:text-gray-300">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 text-[#F97316] rounded-sm focus:ring-[#F97316]"
                />
                <span>
                  I accept the <Link to="/faq" className="text-[#F97316] underline">Terms of Service</Link> and Ethiopian Consumer Protection electronic commerce regulations.
                </span>
              </label>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying & Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ethiopian Guarantee Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 text-xs text-[#6B7280] dark:text-gray-400 space-y-2 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 text-[#1F2937] dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span>Duplicate Request & Stock Conflict Safe</span>
            </div>
            <p className="text-[11px] text-[#4B5563] dark:text-gray-300">
              Your order is protected by idempotency keys and backend inventory reservations to prevent accidental double submissions or overselling.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
