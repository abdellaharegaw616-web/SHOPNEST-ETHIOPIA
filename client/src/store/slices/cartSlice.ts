import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartWarning } from '@shopnest/shared';

export interface CartItem {
  id: string; // product id or cart item id
  productId: string;
  title: string;
  titleAmharic?: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  stock: number;
  sku: string;
  selectedAttributes?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountPercent: number;
  discountAmount: number;
  deliveryFee: number;
  warnings: CartWarning[];
  guestSessionId: string;
}

const CART_STORAGE_KEY = 'shopnest_cart_items';
const GUEST_ID_KEY = 'shopnest_guest_id';

export const getOrCreateGuestId = (): string => {
  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch {
    return `guest_${Date.now()}`;
  }
};

const loadInitialCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
};

const initialState: CartState = {
  items: loadInitialCart(),
  isOpen: false,
  couponCode: null,
  discountPercent: 0,
  discountAmount: 0,
  deliveryFee: 150,
  warnings: [],
  guestSessionId: getOrCreateGuestId(),
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCart(state.items);
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const { quantity = 1, ...itemData } = action.payload;
      const existing = state.items.find((item) => item.productId === itemData.productId);

      if (existing) {
        const nextQty = existing.quantity + quantity;
        existing.quantity = Math.min(nextQty, existing.stock > 0 ? existing.stock : 99);
      } else {
        state.items.push({
          ...itemData,
          quantity: Math.min(quantity, itemData.stock > 0 ? itemData.stock : 99),
        });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload && item.id !== action.payload
      );
      saveCart(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId || i.id === action.payload.productId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload.productId && i.id !== action.payload.productId
          );
        } else {
          item.quantity = Math.min(action.payload.quantity, item.stock > 0 ? item.stock : 99);
        }
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountPercent = 0;
      state.discountAmount = 0;
      state.warnings = [];
      saveCart([]);
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discountPercent?: number; discountAmount?: number }>) => {
      state.couponCode = action.payload.code;
      if (action.payload.discountPercent !== undefined) {
        state.discountPercent = action.payload.discountPercent;
      }
      if (action.payload.discountAmount !== undefined) {
        state.discountAmount = action.payload.discountAmount;
      }
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountPercent = 0;
      state.discountAmount = 0;
    },
    setStockWarnings: (state, action: PayloadAction<CartWarning[]>) => {
      state.warnings = action.payload;
    },
    clearStockWarnings: (state) => {
      state.warnings = [];
    },
  },
});

export const {
  setCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartOpen,
  toggleCart,
  applyCoupon,
  removeCoupon,
  setStockWarnings,
  clearStockWarnings,
} = cartSlice.actions;

export default cartSlice.reducer;
