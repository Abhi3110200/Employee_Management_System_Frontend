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

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken: customToken, onTokenRefreshed, onAuthFailed, headers = {}, ...customConfig } = options;

  // Always use provided token OR read current active token directly from Redux store
  const state = store.getState();
  const activeToken = customToken !== undefined ? customToken : state.auth.accessToken;

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

  // Intercept expired access token (401 + TOKEN_EXPIRED)
  if (response.status === 401 && data.code === 'TOKEN_EXPIRED' && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, options, endpoint });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const refreshData = await refreshRes.json();

      if (refreshRes.ok && refreshData.accessToken) {
        const newToken = refreshData.accessToken;

        // Automatically update Redux store with the new access token and user info
        store.dispatch(setAccessToken(newToken));
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
