import { EthiopianPaymentProvider } from '../constants/ethiopia.constants';

export type UserRole = 'customer' | 'admin';

export interface EthiopianAddress {
  fullName: string;
  phone: string;
  region?: string;
  city: string;
  subCity?: string;
  woreda?: string;
  houseNumber?: string;
  landmark?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface NotificationPreferencesDTO {
  telegramEnabled: boolean;
  smsEnabled: boolean;
  telegramChatId?: string;
  orderUpdates: boolean;
  promotions: boolean;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  addresses: EthiopianAddress[];
  isVerified: boolean;
  notificationPreferences?: NotificationPreferencesDTO;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

export interface AuthResponseData {
  user: UserDTO;
  tokens: AuthTokens;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  currency: 'ETB';
  provider: EthiopianPaymentProvider;
  transactionReference: string;
  status: PaymentStatus;
  createdAt: string;
}

export type DiscountType = 'percentage' | 'fixed_amount';

export interface CouponCustomerUsageDTO {
  user: string;
  orderId?: string;
  usedAt: string;
}

export interface CouponDTO {
  id?: string;
  _id?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount?: number;
  perCustomerLimit?: number;
  eligibleCategories?: string[];
  eligibleProducts?: string[];
  customerUsage?: CouponCustomerUsageDTO[];
  isActive?: boolean;
  createdAt?: string;
}

export interface ValidateCouponResultDTO {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  minOrderValue: number;
  maxDiscount?: number;
  perCustomerLimit?: number;
  eligibleSubtotal?: number;
  subtotal: number;
  newTotal: number;
  message: string;
}

export interface WishlistDTO {
  id?: string;
  _id?: string;
  user: string;
  products: CartItemProductDTO[] | string[];
}

export interface CartWarning {
  productId: string;
  type: 'price_changed' | 'out_of_stock' | 'stock_reduced';
  message: string;
  oldPrice?: number;
  newPrice?: number;
  availableStock?: number;
}

export interface CartItemProductDTO {
  id: string;
  _id?: string;
  title: string;
  titleAmharic?: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  sku: string;
}

export interface CartItemDTO {
  id?: string;
  _id?: string;
  product: CartItemProductDTO;
  quantity: number;
  unitPrice: number;
  selectedAttributes?: Record<string, string>;
  lineTotal: number;
}

export interface CartDTO {
  id: string;
  _id?: string;
  items: CartItemDTO[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  warnings?: CartWarning[];
}

export interface OrderItemDTO {
  product: string | CartItemProductDTO;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTrackingDTO {
  status: OrderStatus;
  notes?: string;
  timestamp: string;
}

export interface OrderDTO {
  id: string;
  _id?: string;
  orderNumber: string;
  user?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItemDTO[];
  shippingAddress: EthiopianAddress;
  deliveryInstructions?: string;
  paymentMethod: EthiopianPaymentProvider;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  idempotencyKey?: string;
  trackingHistory: OrderTrackingDTO[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'order_reservation';

export type ReviewModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewDTO {
  id: string;
  _id?: string;
  product: string | { id: string; _id?: string; title: string; slug: string; sku?: string };
  user: string | { id: string; _id?: string; name: string; email?: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewModerationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEligibilityDTO {
  canReview: boolean;
  hasPurchased: boolean;
  existingReview?: ReviewDTO | null;
  message?: string;
}

