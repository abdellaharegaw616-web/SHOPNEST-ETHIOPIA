import { apiSlice } from './apiSlice';
import { ApiResponse, EthiopianAddress, EthiopianPaymentProvider } from '@shopnest/shared';

export interface OrderItem {
  product: {
    _id: string;
    id: string;
    title: string;
    titleAmharic?: string;
    images?: string[];
    slug?: string;
    sku?: string;
  };
  title?: string;
  sku?: string;
  price?: number;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
  totalPrice?: number;
}

export interface OrderRecord {
  id: string;
  _id?: string;
  orderNumber: string;
  user?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  discount?: number;
  couponCode?: string;
  totalAmount?: number;
  total?: number;
  currency?: 'ETB';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: EthiopianPaymentProvider;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: EthiopianAddress;
  deliveryInstructions?: string;
  idempotencyKey?: string;
  trackingHistory?: {
    status: string;
    notes?: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface CreateOrderPayload {
  shippingAddress: EthiopianAddress;
  paymentMethod: EthiopianPaymentProvider;
  couponCode?: string;
  deliveryInstructions?: string;
  notes?: string;
  idempotencyKey?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  saveAddressToProfile?: boolean;
  items?: { productId: string; quantity: number }[];
}

export interface SimulatePaymentPayload {
  paymentId?: string;
  orderId?: string;
  action: 'success' | 'failure';
  failureReason?: string;
}

export interface PaymentRecord {
  id: string;
  _id?: string;
  order: string;
  user?: string;
  amount: number;
  currency: 'ETB';
  provider: EthiopianPaymentProvider;
  transactionReference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMetadata?: Record<string, any>;
  createdAt: string;
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrders: builder.query<ApiResponse<OrderRecord[]>, void>({
      query: () => '/v1/orders',
      providesTags: ['Order'],
    }),

    getOrderById: builder.query<ApiResponse<OrderRecord>, string>({
      query: (id) => `/v1/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<ApiResponse<OrderRecord>, CreateOrderPayload>({
      query: (payload) => ({
        url: '/v1/orders',
        method: 'POST',
        headers: payload.idempotencyKey
          ? { 'Idempotency-Key': payload.idempotencyKey }
          : undefined,
        body: payload,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    getPaymentByOrderId: builder.query<ApiResponse<PaymentRecord>, string>({
      query: (orderId) => `/v1/payments/order/${orderId}`,
      providesTags: (_res, _err, orderId) => [{ type: 'Order', id: `payment-${orderId}` }],
    }),

    simulatePayment: builder.mutation<
      ApiResponse<{ payment: PaymentRecord; order: OrderRecord }>,
      SimulatePaymentPayload
    >({
      query: (payload) => ({
        url: '/v1/payments/simulate',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Order'],
    }),

    cancelOrder: builder.mutation<
      ApiResponse<OrderRecord>,
      { orderId: string; reason?: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/v1/orders/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useGetPaymentByOrderIdQuery,
  useSimulatePaymentMutation,
  useCancelOrderMutation,
} = ordersApi;

