import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { clientEnv } from '../../config/env';
import { setCredentials, logout } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: clientEnv.VITE_API_BASE_URL,
  credentials: 'include',
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
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const urlStr = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint =
      urlStr.includes('/auth/login') ||
      urlStr.includes('/auth/register') ||
      urlStr.includes('/auth/refresh') ||
      urlStr.includes('/auth/logout');

    if (!isAuthEndpoint) {
      const refreshToken = localStorage.getItem('shopnest_refresh_token');

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = (async () => {
            try {
              const refreshResult = await rawBaseQuery(
                {
                  url: '/v1/auth/refresh',
                  method: 'POST',
                  body: { refreshToken },
                },
                api,
                extraOptions
              );

              if (refreshResult.data) {
                const resData = (refreshResult.data as any)?.data;
                const newAccessToken = resData?.tokens?.accessToken;
                const newRefreshToken = resData?.tokens?.refreshToken || refreshToken;
                const user = resData?.user;

                if (newAccessToken && user) {
                  api.dispatch(
                    setCredentials({
                      user,
                      token: newAccessToken,
                      refreshToken: newRefreshToken,
                    })
                  );
                  return true;
                }
              }

              // Refresh failed or returned invalid data
              api.dispatch(logout());
              return false;
            } catch {
              api.dispatch(logout());
              return false;
            } finally {
              isRefreshing = false;
              refreshPromise = null;
            }
          })();
        }

        const success = await refreshPromise;
        if (success) {
          // Retry original request with newly acquired token
          result = await rawBaseQuery(args, api, extraOptions);
        }
      } else {
        // No refresh token available, session is expired
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Health', 'User', 'Product', 'Category', 'Cart', 'Order', 'Wishlist', 'Review', 'Notification', 'Returns'],
  endpoints: () => ({}),
});
