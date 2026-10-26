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
} from 'lucide-react';
import { useGetOrderByIdQuery } from '../store/api/ordersApi';
import { formatETB } from '../components/common/ProductPrice';

export const TrackOrderPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('order') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeOrderNumber, setActiveOrderNumber] = useState(initialQuery);

  const { data: orderResponse, isLoading, isError, isFetching } = useGetOrderByIdQuery(
    activeOrderNumber,
    { skip: !activeOrderNumber }
  );

  const order = orderResponse?.data;

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
          </div>
        </div>
      ) : null}
    </div>
  );
};
