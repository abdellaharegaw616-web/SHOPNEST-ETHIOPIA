import { z } from 'zod';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export const ethiopianAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
    .pipe(
      z
        .string()
        .regex(
          ETHIOPIA_CONSTANTS.phoneRegex,
          'Invalid Ethiopian phone number. Format: +2519..., 09..., +2517..., or 07...'
        )
    ),
  region: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  subCity: z.string().optional(),
  woreda: z.string().optional(),
  houseNumber: z.string().optional(),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const addAddressSchema = z.object({
  body: ethiopianAddressSchema,
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email address format (e.g. name@example.com)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z
      .string()
      .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
      .pipe(
        z
          .string()
          .regex(
            ETHIOPIA_CONSTANTS.phoneRegex,
            'Invalid Ethiopian phone format. Must start with 09..., +2519..., 07..., or +2517... followed by 8 digits (e.g., 0911234567 or +251911234567)'
          )
      ),
    address: ethiopianAddressSchema.optional(),
  }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().optional(),
      emailOrPhone: z.string().optional(),
      password: z.string().min(1, 'Password is required'),
    })
    .refine((data) => Boolean((data.email && data.email.trim()) || (data.emailOrPhone && data.emailOrPhone.trim())), {
      message: 'Email or phone number is required',
      path: ['emailOrPhone'],
    }),
});


export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z
      .string()
      .regex(ETHIOPIA_CONSTANTS.phoneRegex, 'Invalid Ethiopian phone format')
      .optional(),
    avatar: z.string().optional(),
  }),
});
