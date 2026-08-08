import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types/auth';

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, isAuthenticated: false };
  }
  try {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      accessToken: token,
      user,
      isAuthenticated: !!token && !!user,
    };
  } catch (err) {
    return { user: null, accessToken: null, isAuthenticated: false };
  }
};

const stored = getStoredAuth();

const initialState: AuthState = {
  user: stored.user,
  accessToken: stored.accessToken,
  isAuthenticated: stored.isAuthenticated,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      }
    },
    setAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string } | string>
    ) => {
      const newToken = typeof action.payload === 'string' ? action.payload : action.payload.accessToken;
      const newRefresh = typeof action.payload === 'string' ? undefined : action.payload.refreshToken;

      state.accessToken = newToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newToken);
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setAccessToken, setUser, logout, setLoading } =
  authSlice.actions;

export default authSlice.reducer;
