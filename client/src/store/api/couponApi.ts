import { apiSlice } from './apiSlice';
import { ApiResponse, ValidateCouponResultDTO, CouponDTO } from '@shopnest/shared';

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  items?: Array<{
    productId?: string;
    product?: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}

export interface CreateCouponRequest {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  eligibleCategories?: string[];
  eligibleProducts?: string[];
  isActive?: boolean;
}

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<ApiResponse<ValidateCouponResultDTO>, ValidateCouponRequest>({
      query: (body) => ({
        url: '/v1/coupons/validate',
        method: 'POST',
        body,
      }),
    }),
    getAdminCoupons: builder.query<ApiResponse<CouponDTO[]>, void>({
      query: () => '/v1/coupons',
      providesTags: ['Cart'],
    }),
    createCoupon: builder.mutation<ApiResponse<CouponDTO>, CreateCouponRequest>({
      query: (body) => ({
        url: '/v1/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    toggleCouponActive: builder.mutation<ApiResponse<CouponDTO>, string>({
      query: (id) => ({
        url: `/v1/coupons/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Cart'],
    }),
    deleteCoupon: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/v1/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useToggleCouponActiveMutation,
  useDeleteCouponMutation,
} = couponApi;
