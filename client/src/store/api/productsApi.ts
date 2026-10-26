import { apiSlice } from './apiSlice';
import { ApiResponse } from '@shopnest/shared';

export interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  nameAmharic?: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  _id?: string;
  title: string;
  titleAmharic?: string;
  slug: string;
  description: string;
  descriptionAmharic?: string;
  price: number;
  discountPrice?: number;
  category: CategoryItem | string;
  stock: number;
  sku: string;
  images: string[];
  attributes?: Record<string, string>;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  _id?: string;
  user: {
    _id?: string;
    id?: string;
    name: string;
  };
  product: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductsResponseData {
  products: ProductItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'all' | 'in_stock' | 'out_of_stock';
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => '/v1/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getProducts: builder.query<ApiResponse<ProductsResponseData>, ProductQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.category) queryParams.set('category', params.category);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.minPrice !== undefined) queryParams.set('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) queryParams.set('maxPrice', params.maxPrice.toString());
        if (params?.availability && params.availability !== 'all') {
          queryParams.set('availability', params.availability);
        }
        if (params?.sort) queryParams.set('sort', params.sort);

        const queryString = queryParams.toString();
        return `/v1/products${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductBySlug: builder.query<ApiResponse<ProductItem>, string>({
      query: (slug) => `/v1/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),

    getRelatedProducts: builder.query<ApiResponse<ProductItem[]>, { slug: string; limit?: number }>({
      query: ({ slug, limit = 4 }) => `/v1/products/${slug}/related?limit=${limit}`,
      providesTags: (_result, _error, { slug }) => [{ type: 'Product', id: `RELATED_${slug}` }],
    }),

    getFeaturedProducts: builder.query<ApiResponse<ProductsResponseData>, { limit?: number } | void>({
      query: (arg) => `/v1/products?limit=${arg?.limit || 8}`,
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    getNewArrivals: builder.query<ApiResponse<ProductsResponseData>, { limit?: number } | void>({
      query: (arg) => `/v1/products?sort=newest&limit=${arg?.limit || 8}`,
      providesTags: [{ type: 'Product', id: 'NEW_ARRIVALS' }],
    }),

    getBestSellers: builder.query<ApiResponse<ProductsResponseData>, { limit?: number } | void>({
      query: (arg) => `/v1/products?sort=popularity&limit=${arg?.limit || 8}`,
      providesTags: [{ type: 'Product', id: 'BEST_SELLERS' }],
    }),

    getProductReviews: builder.query<ApiResponse<ReviewItem[]>, string>({
      query: (productIdOrSlug) => `/v1/reviews/product/${productIdOrSlug}`,
      providesTags: (_res, _err, id) => [{ type: 'Review', id }],
    }),

    createReview: builder.mutation<ApiResponse<ReviewItem>, CreateReviewPayload>({
      query: (payload) => ({
        url: '/v1/reviews',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Review', id: arg.productId },
        { type: 'Product', id: arg.productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetBestSellersQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
} = productsApi;
