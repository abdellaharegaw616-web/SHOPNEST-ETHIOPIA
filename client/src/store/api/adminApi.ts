import { apiSlice } from './apiSlice';
import { ApiResponse, OrderStatus } from '@shopnest/shared';
import { OrderRecord } from './ordersApi';

export interface DashboardStats {
  totalRevenueETB: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: {
    _id: string;
    title: string;
    sku: string;
    stock: number;
    price: number;
  }[];
}

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface InventoryLogRecord {
  _id: string;
  product: {
    _id: string;
    title: string;
    sku: string;
  };
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/v1/admin/stats',
      providesTags: ['Order', 'Product', 'User'],
    }),

    getAdminOrders: builder.query<
      ApiResponse<{ orders: OrderRecord[]; total: number; page: number; totalPages: number }>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.status) queryParams.set('status', params.status);
        const qStr = queryParams.toString();
        return `/v1/admin/orders${qStr ? `?${qStr}` : ''}`;
      },
      providesTags: ['Order'],
    }),

    getAdminUsers: builder.query<
      ApiResponse<{ users: AdminUserRecord[]; total: number; page: number; totalPages: number }>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        const qStr = queryParams.toString();
        return `/v1/admin/users${qStr ? `?${qStr}` : ''}`;
      },
      providesTags: ['User'],
    }),

    getAdminInventory: builder.query<ApiResponse<InventoryLogRecord[]>, void>({
      query: () => '/v1/admin/inventory',
      providesTags: ['Product'],
    }),

    updateOrderStatusByAdmin: builder.mutation<
      ApiResponse<OrderRecord>,
      { orderId: string; status: OrderStatus; notes?: string }
    >({
      query: ({ orderId, status, notes }) => ({
        url: `/v1/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: ['Order'],
    }),

    createProductAdmin: builder.mutation<ApiResponse<any>, any>({
      query: (productData) => ({
        url: '/v1/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProductAdmin: builder.mutation<ApiResponse<any>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/v1/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProductAdmin: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/v1/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    getAdminReviews: builder.query<ApiResponse<any[]>, void>({
      query: () => '/v1/reviews',
      providesTags: ['Review'],
    }),

    deleteReviewAdmin: builder.mutation<ApiResponse<any>, string>({
      query: (reviewId) => ({
        url: `/v1/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminOrdersQuery,
  useGetAdminUsersQuery,
  useGetAdminInventoryQuery,
  useUpdateOrderStatusByAdminMutation,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
  useDeleteProductAdminMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewAdminMutation,
} = adminApi;
