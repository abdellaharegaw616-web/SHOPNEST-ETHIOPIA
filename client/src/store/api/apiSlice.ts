import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clientEnv } from '../../config/env';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: clientEnv.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('shopnest_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      const guestId = localStorage.getItem('shopnest_guest_id');
      if (guestId) {
        headers.set('x-guest-session-id', guestId);
      }
      return headers;
    },
  }),
  tagTypes: ['Health', 'User', 'Product', 'Category', 'Cart', 'Order', 'Wishlist', 'Review', 'Notification', 'Returns'],
  endpoints: () => ({}),
});
