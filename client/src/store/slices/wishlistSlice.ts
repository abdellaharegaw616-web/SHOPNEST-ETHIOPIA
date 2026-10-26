import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  productIds: string[];
}

const WISHLIST_STORAGE_KEY = 'shopnest_wishlist_ids';

const loadInitialWishlist = (): string[] => {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to parse wishlist from localStorage:', e);
    return [];
  }
};

const saveWishlist = (ids: string[]) => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save wishlist to localStorage:', e);
  }
};

const initialState: WishlistState = {
  productIds: loadInitialWishlist(),
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter((item) => item !== id);
      } else {
        state.productIds.push(id);
      }
      saveWishlist(state.productIds);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((item) => item !== action.payload);
      saveWishlist(state.productIds);
    },
    clearWishlist: (state) => {
      state.productIds = [];
      saveWishlist([]);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
