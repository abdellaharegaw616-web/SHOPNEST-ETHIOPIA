import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    nameAmharic: z.string().optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().url().optional().or(z.string()),
    parentCategory: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Product title is required'),
    titleAmharic: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    descriptionAmharic: z.string().optional(),
    price: z.number().positive('Price must be greater than 0'),
    discountPrice: z.number().positive().optional(),
    category: z.string().min(1, 'Category ID is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
    sku: z.string().min(3, 'SKU is required'),
    images: z.array(z.string()).default([]),
    attributes: z.record(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120, 'Title cannot exceed 120 characters').optional(),
    comment: z.string().min(3, 'Review comment must be at least 3 characters').max(2000, 'Comment cannot exceed 2000 characters'),
    images: z.array(z.string()).max(3, 'Maximum 3 photos allowed').optional().default([]),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(120, 'Title cannot exceed 120 characters').optional(),
    comment: z.string().min(3, 'Review comment must be at least 3 characters').max(2000, 'Comment cannot exceed 2000 characters').optional(),
    images: z.array(z.string()).max(3, 'Maximum 3 photos allowed').optional(),
  }),
});

export const moderateReviewSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    rejectionReason: z.string().optional(),
  }),
});

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
    selectedAttributes: z.record(z.string()).optional(),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    guestSessionId: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
          selectedAttributes: z.record(z.string()).optional(),
        })
      )
      .optional(),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
});

export const toggleWishlistSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z
    .object({
      id: z.string().min(1, 'Product ID is required'),
    })
    .optional(),
  body: z.object({
    title: z.string().min(2, 'Product title is required').optional(),
    titleAmharic: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    descriptionAmharic: z.string().optional(),
    price: z.number().positive('Price must be greater than 0').optional(),
    discountPrice: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
    sku: z.string().min(3).optional(),
    images: z.array(z.string()).optional(),
    attributes: z.record(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});


