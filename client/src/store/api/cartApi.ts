import { apiSlice } from './apiSlice';
import { ApiResponse, CartDTO } from '@shopnest/shared';

export interface AddToCartPayload {
  productId: string;
  quantity?: number;
  selectedAttributes?: Record<string, string>;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

export interface MergeCartPayload {
  guestSessionId?: string;
  items?: {
    productId: string;
    quantity: number;
    selectedAttributes?: Record<string, string>;
  }[];
}

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<CartDTO>, { couponCode?: string; city?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.couponCode) queryParams.set('couponCode', params.couponCode);
        if (params?.city) queryParams.set('city', params.city);
        const qStr = queryParams.toString();
        return `/v1/cart${qStr ? `?${qStr}` : ''}`;
      },
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<ApiResponse<CartDTO>, AddToCartPayload>({
      query: (payload) => ({
        url: '/v1/cart/items',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<ApiResponse<CartDTO>, UpdateCartItemPayload>({
      query: ({ itemId, quantity }) => ({
        url: `/v1/cart/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation<ApiResponse<CartDTO>, string>({
      query: (itemId) => ({
        url: `/v1/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    mergeCart: builder.mutation<ApiResponse<CartDTO>, MergeCartPayload>({
      query: (payload) => ({
        url: '/v1/cart/merge',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/v1/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useMergeCartMutation,
  useClearCartMutation,
} = cartApi;
