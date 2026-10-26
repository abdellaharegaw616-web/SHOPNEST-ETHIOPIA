import { apiSlice } from './apiSlice';
import { ApiResponse, AuthResponseData, UserDTO, EthiopianAddress } from '@shopnest/shared';

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: '/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart', 'Order'],
    }),

    register: builder.mutation<ApiResponse<AuthResponseData>, RegisterRequest>({
      query: (userData) => ({
        url: '/v1/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logoutUser: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/v1/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Cart', 'Wishlist', 'Order'],
    }),

    getCurrentUser: builder.query<ApiResponse<UserDTO>, void>({
      query: () => '/v1/auth/me',
      providesTags: ['User'],
    }),

    saveAddress: builder.mutation<ApiResponse<UserDTO>, EthiopianAddress>({
      query: (address) => ({
        url: '/v1/auth/addresses',
        method: 'POST',
        body: address,
      }),
      invalidatesTags: ['User'],
    }),

    updateProfile: builder.mutation<ApiResponse<UserDTO>, { name?: string; phone?: string; avatar?: string }>({
      query: (data) => ({
        url: '/v1/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutUserMutation,
  useGetCurrentUserQuery,
  useSaveAddressMutation,
  useUpdateProfileMutation,
} = authApi;
