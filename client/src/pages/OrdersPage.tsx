import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useGetUserOrdersQuery, useCancelOrderMutation, OrderRecord } from '../store/api/ordersApi';
import { formatETB } from '../components/common/ProductPrice';

export const OrdersPage: React.FC = () => {
  const { data: ordersResponse, isLoading } = useGetUserOrdersQuery();
  const [cancelOrderMutation, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const orders = ordersResponse?.data || [];

  const handleToggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleOpenCancelModal = (order: OrderRecord) => {
    setCancellingOrder(order);
    setCancelReason('');
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setCancelError('');
    try {
      const orderId = cancellingOrder.id || cancellingOrder._id || '';
      await cancelOrderMutation({ orderId, reason: cancelReason || 'Customer requested cancellation' }).unwrap();
      setCancelSuccessMsg(`Order #${cancellingOrder.orderNumber} was cancelled and inventory has been restored.`);
      setCancellingOrder(null);
      setTimeout(() => setCancelSuccessMsg(''), 5000);
    } catch (err: any) {
      setCancelError(err.data?.message || err.message || 'Failed to cancel order. Please contact support.');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Truck className="w-3 h-3" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF7ED] dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400 border border-[#F97316]/30">
            <Clock className="w-3 h-3" />
            <span>Pending Confirmation</span>
          </span>
        );
    }
  };

  const getStepActive = (currentStatus: string, stepName: string) => {
    const sequence = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = sequence.indexOf(currentStatus);
    const stepIdx = sequence.indexOf(stepName);
    if (currentStatus === 'cancelled') return false;
    return currentIdx >= stepIdx;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="p-2 rounded-xl border border-[#E5E7EB] dark:border-gray-700 hover:border-[#F97316] text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] dark:text-white">Order History</h1>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">
              Track live delivery progress and review past orders across Ethiopia
            </p>
          </div>
        </div>
      </div>

      {cancelSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-40 bg-white dark:bg-gray-800 rounded-2xl border border-[#E5E7EB] dark:border-gray-700 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs transition-colors">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#1F2937] dark:text-white">No Orders Found</h2>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            You have not placed any orders with this account yet.
          </p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order.id || order._id || '';
            const isExpanded = expandedOrderId === orderId;
            const status = order.orderStatus || order.status || 'pending';
            const isCancellable = status === 'pending' || status === 'processing';

            return (
              <div
                key={orderId}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-5 sm:p-6 space-y-4 shadow-2xs transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] dark:border-gray-800 pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-[#1F2937] dark:text-white">
                        Order #{order.orderNumber}
                      </span>
                      {getStatusBadge(status)}
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-[#6B7280] dark:text-gray-400 block">Total</span>
                      <span className="text-base font-bold text-[#F97316]">
                        ETB {formatETB(order.totalAmount ?? order.total ?? 0)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleExpand(orderId)}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 text-[#6B7280] dark:text-gray-300"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Steps */}
                {status !== 'cancelled' ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 text-center text-[11px] font-semibold">
                      <div className={`space-y-1 ${getStepActive(status, 'pending') ? 'text-[#F97316]' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${getStepActive(status, 'pending') ? 'bg-[#F97316] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                          1
                        </div>
                        <span>Placed</span>
                      </div>
                      <div className={`space-y-1 ${getStepActive(status, 'processing') ? 'text-[#F97316]' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${getStepActive(status, 'processing') ? 'bg-[#F97316] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                          2
                        </div>
                        <span>Processing</span>
                      </div>
                      <div className={`space-y-1 ${getStepActive(status, 'shipped') ? 'text-[#F97316]' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${getStepActive(status, 'shipped') ? 'bg-[#F97316] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                          3
                        </div>
                        <span>Dispatched</span>
                      </div>
                      <div className={`space-y-1 ${getStepActive(status, 'delivered') ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${getStepActive(status, 'delivered') ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                          4
                        </div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>This order has been cancelled. Any reserved stock was returned to catalog.</span>
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-[#1F2937] dark:text-white font-medium">
                        {item.quantity}x {item.title || item.product?.title || 'Product Item'}
                      </span>
                      <span className="text-[#4B5563] dark:text-gray-300 font-semibold">
                        ETB {formatETB(item.subtotal ?? item.totalPrice ?? (item.price ? item.price * item.quantity : 0))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-[#F3F4F6] dark:border-gray-800 pt-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F9FAFB] dark:bg-gray-850 p-4 rounded-xl">
                      <div className="space-y-1">
                        <span className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                          Delivery Address
                        </span>
                        <p className="text-[#4B5563] dark:text-gray-300">{order.shippingAddress?.fullName}</p>
                        <p className="text-[#4B5563] dark:text-gray-300">{order.shippingAddress?.phone}</p>
                        <p className="text-[#4B5563] dark:text-gray-300">
                          {order.shippingAddress?.subCity}, {order.shippingAddress?.city}
                          {order.shippingAddress?.woreda && ` (Woreda ${order.shippingAddress.woreda})`}
                        </p>
                        {order.shippingAddress?.landmark && (
                          <p className="text-[#6B7280] dark:text-gray-400 italic">Near: {order.shippingAddress.landmark}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-[#1F2937] dark:text-white">Payment & Billing</span>
                        <p className="text-[#4B5563] dark:text-gray-300">
                          Method: <strong className="uppercase">{order.paymentMethod.replace(/_/g, ' ')}</strong>
                        </p>
                        <p className="text-[#4B5563] dark:text-gray-300">
                          Status: <strong className="capitalize text-emerald-600">{order.paymentStatus}</strong>
                        </p>
                        <p className="text-[#4B5563] dark:text-gray-300">
                          Delivery Fee: ETB {formatETB(order.deliveryFee ?? 0)}
                        </p>
                        {order.discountAmount ? (
                          <p className="text-emerald-600">Discount: -ETB {formatETB(order.discountAmount)}</p>
                        ) : null}
                      </div>
                    </div>

                    {/* Timeline Log */}
                    {order.trackingHistory && order.trackingHistory.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-[#1F2937] dark:text-white">Fulfillment Audit Timeline</span>
                        <div className="space-y-1.5 border-l-2 border-[#F97316]/40 pl-3 ml-2">
                          {order.trackingHistory.map((step, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1F2937] dark:text-white uppercase text-[10px]">
                                  {step.status}
                                </span>
                                <span className="text-[#9CA3AF] text-[10px]">
                                  {new Date(step.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {step.notes && <p className="text-[#6B7280] dark:text-gray-400 text-[11px]">{step.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Footer & Actions */}
                <div className="border-t border-[#F3F4F6] dark:border-gray-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B7280] dark:text-gray-400 gap-2">
                  <div>
                    Payment: <strong className="text-[#1F2937] dark:text-white uppercase">{order.paymentMethod.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/track-order?order=${order.orderNumber}`}
                      className="inline-flex items-center gap-1 text-[#F97316] hover:underline font-bold"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track Live
                    </Link>
                    {isCancellable && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                    <span className="text-[#1F2937] dark:text-white">
                      {order.shippingAddress?.subCity}, {order.shippingAddress?.city}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] dark:border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-[#1F2937] dark:text-white">
                Cancel Order #{cancellingOrder.orderNumber}
              </h3>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-gray-300">
              Are you sure you want to cancel this order? Reserved stock will be automatically released back to our marketplace catalog.
            </p>

            {cancelError && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200">
                {cancelError}
              </p>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#1F2937] dark:text-gray-200">Cancellation Reason (Optional)</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Ordered by mistake, found alternative, changed delivery address..."
                className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-gray-700 text-xs font-bold text-[#4B5563] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
