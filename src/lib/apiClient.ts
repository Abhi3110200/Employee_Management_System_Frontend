import { store } from '../store/store';
import { setAccessToken, setUser, logout } from '../store/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
  onTokenRefreshed?: (newToken: string) => void;
  onAuthFailed?: () => void;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  options: RequestOptions;
  endpoint: string;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.options.accessToken = token;
      apiClient(prom.endpoint, prom.options).then(prom.resolve).catch(prom.reject);
    }
  });

  failedQueue = [];
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    accessToken: customToken,
    headers = {},
    onTokenRefreshed,
    onAuthFailed,
    ...customConfig
  } = options;

  // Always use provided token OR read current active token directly from Redux store / localStorage
  const state = store.getState();
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const activeToken = customToken !== undefined ? customToken : (state.auth.accessToken || storedToken);

  const config: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      ...headers,
    },
    ...customConfig,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  // Intercept 401 Unauthorized or Expired token responses (excluding login & refresh requests)
  const is401AuthError = response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login');

  if (is401AuthError) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, options, endpoint });
      });
    }

    isRefreshing = true;

    try {
      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      const refreshData = await refreshRes.json().catch(() => ({}));

      if (refreshRes.ok && refreshData.accessToken) {
        const newToken = refreshData.accessToken;
        const newRefresh = refreshData.refreshToken;

        // Automatically update Redux store & localStorage with the new access & refresh tokens
        store.dispatch(setAccessToken({ accessToken: newToken, refreshToken: newRefresh }));
        if (refreshData.user) {
          store.dispatch(setUser(refreshData.user));
        }

        if (onTokenRefreshed) {
          onTokenRefreshed(newToken);
        }

        processQueue(null, newToken);
        isRefreshing = false;

        // Retry original request seamlessly with new access token
        return apiClient<T>(endpoint, {
          ...options,
          accessToken: newToken,
        });
      } else {
        processQueue(new Error('Refresh token expired'), null);
        isRefreshing = false;
        store.dispatch(logout());
        if (onAuthFailed) {
          onAuthFailed();
        }
        throw new Error(refreshData.message || 'Session expired. Please log in again.');
      }
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      store.dispatch(logout());
      if (onAuthFailed) {
        onAuthFailed();
      }
      throw err;
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
