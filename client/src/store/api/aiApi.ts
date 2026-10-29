import { apiSlice } from './apiSlice';
import {
  ApiResponse,
  ShoppingAssistantRequestDTO,
  ShoppingAssistantResponseDTO,
} from '@shopnest/shared';

export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    askShoppingAssistant: builder.mutation<
      ApiResponse<ShoppingAssistantResponseDTO>,
      ShoppingAssistantRequestDTO
    >({
      query: (payload) => ({
        url: '/v1/ai/shopping-assistant',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useAskShoppingAssistantMutation } = aiApi;

