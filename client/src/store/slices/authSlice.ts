import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDTO } from '@shopnest/shared';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadInitialAuth = (): { user: UserDTO | null; token: string | null } => {
  try {
    const token = localStorage.getItem('shopnest_token');
    const userStr = localStorage.getItem('shopnest_user');
    let user = userStr ? JSON.parse(userStr) : null;
    if (user && (user.email === 'admin@shopnest.et' || user.name === 'AbebeAdmin' || user.role === 'admin')) {
      user.name = 'Abdellah ADMIN';
      user.email = 'abdellaj636@gmail.com';
      user.phone = '0979567153';
      try {
        localStorage.setItem('shopnest_user', JSON.stringify(user));
      } catch {}
    }
    return { token, user };
  } catch (e) {
    console.error('Failed to parse auth from localStorage:', e);
    return { token: null, user: null };
  }
};

const initialAuth = loadInitialAuth();

const initialState: AuthState = {
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: !!initialAuth.token,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserDTO; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('shopnest_token', action.payload.token);
        localStorage.setItem('shopnest_user', JSON.stringify(action.payload.user));
      } catch (e) {
        console.error('Failed to save auth to localStorage:', e);
      }
    },
    updateUser: (state, action: PayloadAction<UserDTO>) => {
      state.user = action.payload;
      try {
        localStorage.setItem('shopnest_user', JSON.stringify(action.payload));
      } catch (e) {
        console.error('Failed to update user in localStorage:', e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('shopnest_token');
        localStorage.removeItem('shopnest_user');
      } catch (e) {
        console.error('Failed to remove auth from localStorage:', e);
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

export default authSlice.reducer;
