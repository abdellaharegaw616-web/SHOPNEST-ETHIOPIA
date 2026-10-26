import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  Printer,
  RotateCcw,
  Upload,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useGetOrderByIdQuery } from '../store/api/ordersApi';
import { useCreateReturnMutation, useGetMyReturnsQuery } from '../store/api/returnsApi';
import { useAppSelector } from '../store/hooks';
import { formatETB } from '../components/common/ProductPrice';
import { ReturnReason } from '@shopnest/shared';

export const TrackOrderPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('order') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeOrderNumber, setActiveOrderNumber] = useState(initialQuery);

  const { data: orderResponse, isLoading, isError, isFetching } = useGetOrderByIdQuery(
    activeOrderNumber,
    { skip: !activeOrderNumber }
  );

  const order = orderResponse?.data;

  // Returns & Refunds State
  const { data: userReturnsData } = useGetMyReturnsQuery(undefined, { skip: !isAuthenticated });
  const [createReturn, { isLoading: isSubmittingReturn }] = useCreateReturnMutation();

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState<ReturnReason>('damaged_item');
  const [returnNote, setReturnNote] = useState('');
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [returnError, setReturnError] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  // Find if a return already exists for this order
  const existingReturn = userReturnsData?.data?.find((ret: any) => {
    const retOrderId = typeof ret.order === 'object' ? ret.order?._id || ret.order?.id : ret.order;
    const currentOrderId = order?._id || order?.id;
    return retOrderId === currentOrderId || ret.orderNumber === order?.orderNumber;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setActiveOrderNumber(trimmed);
      setSearchParams({ order: trimmed });
    }
  };

  const handleQuickLookup = (orderNum: string) => {
    setSearchQuery(orderNum);
    setActiveOrderNumber(orderNum);
    setSearchParams({ order: orderNum });
  };

  // Status index for timeline
  const getStatusIndex = (status?: string) => {
    switch (status) {
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0; // pending
    }
  };

  const currentStep = getStatusIndex(order?.orderStatus);

  const steps = [
    {
      titleEn: 'Order Confirmed',
      titleAm: 'ትዕዛዝ ተረጋግጧል',
      descEn: 'Order received & logged in system',
      descAm: 'ትዕዛዙ ተመዝግቧል',
      icon: Clock,
    },
    {
      titleEn: 'Processing & Packed',
      titleAm: 'በዝግጅት እና ማሸግ ላይ',
      descEn: 'Items assembled at Addis hub',
      descAm: 'በአዲስ አበባ ማዕከል ተዘጋጅቷል',
      icon: Package,
    },
    {
      titleEn: 'Out for Delivery',
      titleAm: 'በትራንስፖርት ላይ',
      descEn: 'Dispatched with local courier',
      descAm: 'ከአድራሽ ጋር ወጥቷል',
      icon: Truck,
    },
    {
      titleEn: 'Delivered',
      titleAm: 'በደህና ደርሷል',
      descEn: 'Handed over at customer address',
      descAm: 'ለደንበኛ ተረክቧል',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] border border-[#F97316]/20">
          <Truck className="w-3.5 h-3.5" />
          <span>{isAmharic ? 'የቀጥታ ትዕዛዝ መከታተያ' : 'Live Order Tracking'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1F2937] dark:text-white tracking-tight">
          {isAmharic ? 'ትዕዛዝዎን ይከታተሉ' : 'Track Your Order'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-lg mx-auto">
          {isAmharic
            ? 'የትዕዛዝ ቁጥርዎን (ለምሳሌ SNE-DEMO-001) በማስገባት የእቃዎን ወቅታዊ ሁኔታ በቀጥታ ይመልከቱ።'
            : 'Enter your ShopNest order number (e.g. SNE-DEMO-001) to see live dispatch status, delivery hub notes, and courier progress.'}
        </p>
      </div>

      {/* Order Search Box */}
      <div className="max-w-xl mx-auto bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAmharic ? 'የትዕዛዝ ቁጥር ያስገቡ (ለምሳሌ SNE-DEMO-001)...' : 'Enter Order Number (e.g. SNE-DEMO-001)...'}
              className="w-full pl-9 pr-3 py-3 rounded-2xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs sm:text-sm text-[#1F2937] dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-[#F97316]"
            />
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isFetching ? (isAmharic ? 'በመፈለግ ላይ...' : 'Searching...') : (isAmharic ? 'ፈልግ' : 'Track Order')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Click Buttons */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6B7280] dark:text-gray-400 font-medium">
            {isAmharic ? 'የሙከራ ትዕዛዞች:' : 'Quick Demo Orders:'}
          </span>
          <button
            type="button"
            onClick={() => handleQuickLookup('SNE-DEMO-001')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            SNE-DEMO-001 ({isAmharic ? 'የደረሰ' : 'Delivered'})
          </button>
          <button
            type="button"
            onClick={() => handleQuickLookup('SNE-DEMO-002')}
            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
          >
            SNE-DEMO-002 ({isAmharic ? 'በትራንስፖርት ላይ' : 'In Transit'})
          </button>
        </div>
      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-[#E5E7EB] dark:border-gray-800 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] mx-auto" />
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            {isAmharic ? 'የትዕዛዝ መረጃ በመጫን ላይ...' : 'Fetching live order dispatch details...'}
          </p>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-rose-200 dark:border-rose-900/40 text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
            {isAmharic ? 'ትዕዛዙ አልተገኘም' : 'Order Not Found'}
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            {isAmharic
              ? `የትዕዛዝ ቁጥር "${activeOrderNumber}" በስርዓታችን ውስጥ አልተገኘም። እባክዎ ቁጥሩን በትክክል መጻፉን ያረጋግጡ።`
              : `Could not find an order matching "${activeOrderNumber}". Please verify your order number and try again.`}
          </p>
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Summary Header Banner */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F6] dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280] dark:text-gray-400 font-semibold">
                    {isAmharic ? 'የትዕዛዝ ቁጥር' : 'Order Number'}:
                  </span>
                  <span className="font-black text-lg text-[#F97316] font-mono">
                    {order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-[#1F2937] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ደረሰኝ አትም' : 'Print Invoice'}</span>
                </button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div
                      key={idx}
                      className={`relative p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-[#FFF7ED] dark:bg-orange-950/20 border-[#F97316]/40'
                          : 'bg-[#F9FAFB] dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-[#F97316] text-white shadow-xs'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1F2937] dark:text-white">
                            {isAmharic ? step.titleAm : step.titleEn}
                          </p>
                          <p className="text-[10px] text-[#6B7280] dark:text-gray-400">
                            {isAmharic ? step.descAm : step.descEn}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-[#F97316] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                          {isAmharic ? 'ወቅታዊ ሁኔታ' : 'Current'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination & Payment Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <p className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F97316]" />
                  <span>{isAmharic ? 'የማድረሻ አድራሻ' : 'Delivery Destination'}</span>
                </p>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <p className="font-semibold text-[#1F2937] dark:text-white">
                    {order.customerName || order.shippingAddress?.fullName || 'Valued Customer'}
                  </p>
                  <p>
                    {order.shippingAddress?.city || 'Addis Ababa'}, {order.shippingAddress?.subCity || 'Bole'}
                    {order.shippingAddress?.woreda ? `, Woreda ${order.shippingAddress.woreda}` : ''}
                  </p>
                  {order.shippingAddress?.landmark && (
                    <p className="text-[#F97316] font-medium">
                      {isAmharic ? 'መለያ ምልክት:' : 'Landmark:'} {order.shippingAddress.landmark}
                    </p>
                  )}
                  <p>{order.customerPhone || order.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <p className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#F97316]" />
                  <span>{isAmharic ? 'የክፍያ ሁኔታ' : 'Payment Details'}</span>
                </p>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>{isAmharic ? 'የክፍያ ዘዴ:' : 'Method:'}</span>
                    <span className="font-bold uppercase text-[#F97316]">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAmharic ? 'የክፍያ ሁኔታ:' : 'Payment Status:'}</span>
                    <span
                      className={`font-bold capitalize ${
                        order.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 font-bold text-sm text-[#1F2937] dark:text-white">
                    <span>{isAmharic ? 'አጠቃላይ ድምር:' : 'Total Amount:'}</span>
                    <span>{formatETB(order.totalAmount || order.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#1F2937] dark:text-white uppercase tracking-wider">
                {isAmharic ? 'የታዘዙ እቃዎች' : 'Order Line Items'} ({order.items.length})
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 bg-white dark:bg-[#111827] flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.title || item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#1F2937] dark:text-white line-clamp-1">
                          {isAmharic && item.product?.titleAmharic
                            ? item.product.titleAmharic
                            : item.title || item.product?.title}
                        </p>
                        <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                          Qty: {item.quantity} × {formatETB(item.price || item.unitPrice || 0)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1F2937] dark:text-white shrink-0">
                      {formatETB(item.subtotal || (item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RETURNS & REFUNDS SECTION (Available for Delivered Orders) */}
            {order.orderStatus === 'delivered' && (
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-[#FFF7ED]/50 dark:bg-orange-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1F2937] dark:text-white">
                      <RotateCcw className="w-4 h-4 text-[#F97316]" />
                      <span>{isAmharic ? 'የእቃ መመለስ እና ተመላሽ ጥያቄ' : 'ShopNest 7-Day Returns & Refunds'}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-gray-400">
                      {isAmharic
                        ? 'እቃው ከተረከቡበት ቀን ጀምሮ በ7 ቀናት ውስጥ የተበላሸ ወይም የተሳሳተ እቃ መመለስ እና ገንዘብ ማስመለስ ይችላሉ።'
                        : 'Eligible orders can be returned within 7 days of delivery under Ethiopian consumer protection guidelines.'}
                    </p>
                  </div>

                  {existingReturn ? (
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                          existingReturn.status === 'refunded'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                            : existingReturn.status === 'approved'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300'
                            : existingReturn.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300'
                        }`}
                      >
                        {existingReturn.status === 'refunded' && '💸 Refunded'}
                        {existingReturn.status === 'approved' && '✅ Return Approved'}
                        {existingReturn.status === 'rejected' && '❌ Return Declined'}
                        {existingReturn.status === 'pending' && '⏳ Review in Progress'}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'የመመለሻ ጥያቄ ያቅርቡ' : 'Request Return / Refund'}</span>
                    </button>
                  )}
                </div>

                {existingReturn && (
                  <div className="pt-2 border-t border-orange-200/60 dark:border-orange-900/40 text-xs text-[#4B5563] dark:text-gray-300 space-y-1">
                    <p>
                      <strong>Reason:</strong>{' '}
                      <span className="capitalize">{existingReturn.reason.replace(/_/g, ' ')}</span>
                      {existingReturn.customerNote && ` — "${existingReturn.customerNote}"`}
                    </p>
                    {existingReturn.status === 'refunded' && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Refund confirmed: ETB {formatETB(existingReturn.refundAmount || order.totalAmount || 0)} via{' '}
                        {existingReturn.refundMethod?.toUpperCase()} (Ref: {existingReturn.refundReference})
                      </p>
                    )}
                    {existingReturn.status === 'rejected' && existingReturn.rejectionReason && (
                      <p className="text-rose-600 dark:text-rose-400">
                        Admin Note: {existingReturn.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Return Request Modal */}
            {showReturnModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-[#F97316]" />
                      <h3 className="font-bold text-sm sm:text-base text-[#1F2937] dark:text-white">
                        {isAmharic ? 'የእቃ መመለስ ጥያቄ ማቅረቢያ' : 'Submit Return / Refund Request'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReturnModal(false);
                        setReturnError('');
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {returnError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                      {returnError}
                    </div>
                  )}

                  {returnSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                      {returnSuccessMsg}
                    </div>
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setReturnError('');
                      setReturnSuccessMsg('');

                      if (!isAuthenticated) {
                        setReturnError('Please sign in to your ShopNest account to submit a return request.');
                        return;
                      }

                      try {
                        await createReturn({
                          orderId: order._id || order.id,
                          reason: returnReason,
                          customerNote: returnNote.trim() || undefined,
                          images: returnPhotos,
                        }).unwrap();

                        setReturnSuccessMsg('Your return request has been submitted successfully for admin review.');
                        setTimeout(() => {
                          setShowReturnModal(false);
                          setReturnSuccessMsg('');
                          setReturnNote('');
                          setReturnPhotos([]);
                        }, 2500);
                      } catch (err: any) {
                        setReturnError(err.data?.message || err.message || 'Failed to submit return request.');
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="font-semibold text-[#1F2937] dark:text-gray-200 block mb-1">
                        {isAmharic ? 'የመመለሻ ምክንያት *' : 'Reason for Return *'}
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1F2937] dark:text-white"
                      >
                        <option value="damaged_item">
                          {isAmharic ? 'እቃው ተጎድቶ/ተሰብሮ ደርሷል' : 'Damaged / Broken in transit'}
                        </option>
                        <option value="wrong_item">
                          {isAmharic ? 'የተሳሳተ እቃ ቀረበልኝ' : 'Wrong item delivered'}
                        </option>
                        <option value="defective">
                          {isAmharic ? 'እቃው አይሰራም / ጉድለት አለበት' : 'Defective / Malfunctioning'}
                        </option>
                        <option value="quality_issue">
                          {isAmharic ? 'የጥራት ችግር' : 'Product quality issue'}
                        </option>
                        <option value="size_not_fitting">
                          {isAmharic ? 'መጠኑ አልተስማማም' : 'Size / Specification mismatch'}
                        </option>
                        <option value="other">{isAmharic ? 'ሌላ ምክንያት' : 'Other reason'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#1F2937] dark:text-gray-200 block mb-1">
                        {isAmharic ? 'ተጨማሪ ማብራሪያ' : 'Customer Notes & Issue Details'}
                      </label>
                      <textarea
                        rows={3}
                        value={returnNote}
                        onChange={(e) => setReturnNote(e.target.value)}
                        placeholder="Describe the issue with the item, package condition, or refund expectations..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1F2937] dark:text-white"
                      />
                    </div>

                    {/* Supporting Photo Uploader (Max 3) */}
                    <div>
                      <label className="font-semibold text-[#1F2937] dark:text-gray-200 block mb-1">
                        {isAmharic ? 'የእቃው ፎቶዎች (ቢበዛ 3)' : 'Supporting Photos (Max 3, up to 5MB each)'}
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {returnPhotos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
                            <img src={photo} alt="Return Evidence" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReturnPhotos(returnPhotos.filter((_, i) => i !== pIdx))}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {returnPhotos.length < 3 && (
                          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#F97316] flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-[#F97316] transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-[9px] mt-0.5">Add</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  alert('Photo exceeds maximum 5MB size limit.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setReturnPhotos([...returnPhotos, reader.result]);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Refunds are paid directly through your original Ethiopian payment method (Telebirr / CBE Birr / Chapa) once the returned item is received and inspected.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReturn}
                        className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
