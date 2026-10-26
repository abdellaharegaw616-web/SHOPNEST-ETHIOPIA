import { apiSlice } from './apiSlice';
import { ApiResponse, HealthCheckData } from '@shopnest/shared';

export const healthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<ApiResponse<HealthCheckData>, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),
  }),
});

export const { useGetHealthQuery, useLazyGetHealthQuery } = healthApi;
