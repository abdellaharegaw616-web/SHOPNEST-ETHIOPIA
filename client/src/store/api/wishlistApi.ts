import { apiSlice } from './apiSlice';
import { ApiResponse, WishlistDTO } from '@shopnest/shared';

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<ApiResponse<WishlistDTO>, void>({
      query: () => '/v1/wishlist',
      providesTags: ['Cart'],
    }),
    toggleWishlist: builder.mutation<ApiResponse<WishlistDTO>, { productId: string }>({
      query: (body) => ({
        url: '/v1/wishlist/toggle',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    clearServerWishlist: builder.mutation<ApiResponse<WishlistDTO>, void>({
      query: () => ({
        url: '/v1/wishlist',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useClearServerWishlistMutation,
} = wishlistApi;
