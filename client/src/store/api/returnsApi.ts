import { apiSlice } from './apiSlice';
import {
  ReturnRequestDTO,
  CreateReturnRequestDTO,
  ModerateReturnDTO,
  ProcessRefundDTO,
} from '@shopnest/shared';

export interface ReturnApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const returnsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReturn: builder.mutation<ReturnApiResponse<ReturnRequestDTO>, CreateReturnRequestDTO>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Returns', 'Order'],
    }),

    getMyReturns: builder.query<ReturnApiResponse<ReturnRequestDTO[]>, void>({
      query: () => '/returns/my-returns',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id, _id }) => ({ type: 'Returns' as const, id: id || _id })),
              { type: 'Returns', id: 'LIST' },
            ]
          : [{ type: 'Returns', id: 'LIST' }],
    }),

    getReturnById: builder.query<ReturnApiResponse<ReturnRequestDTO>, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Returns', id }],
    }),

    getAdminReturns: builder.query<ReturnApiResponse<ReturnRequestDTO[]>, { status?: string } | void>({
      query: (params) => ({
        url: '/returns',
        params: params?.status && params.status !== 'all' ? { status: params.status } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id, _id }) => ({ type: 'Returns' as const, id: id || _id })),
              { type: 'Returns', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Returns', id: 'ADMIN_LIST' }],
    }),

    moderateReturn: builder.mutation<
      ReturnApiResponse<ReturnRequestDTO>,
      { returnId: string } & ModerateReturnDTO
    >({
      query: ({ returnId, ...body }) => ({
        url: `/returns/${returnId}/moderate`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { returnId }) => [
        { type: 'Returns', id: returnId },
        { type: 'Returns', id: 'ADMIN_LIST' },
        { type: 'Returns', id: 'LIST' },
        'Order',
      ],
    }),

    processRefund: builder.mutation<
      ReturnApiResponse<ReturnRequestDTO>,
      { returnId: string } & ProcessRefundDTO
    >({
      query: ({ returnId, ...body }) => ({
        url: `/returns/${returnId}/refund`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { returnId }) => [
        { type: 'Returns', id: returnId },
        { type: 'Returns', id: 'ADMIN_LIST' },
        { type: 'Returns', id: 'LIST' },
        'Order',
      ],
    }),
  }),
});

export const {
  useCreateReturnMutation,
  useGetMyReturnsQuery,
  useGetReturnByIdQuery,
  useGetAdminReturnsQuery,
  useModerateReturnMutation,
  useProcessRefundMutation,
} = returnsApi;
