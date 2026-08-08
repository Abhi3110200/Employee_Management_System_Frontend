'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCredentials, setAccessToken, logout, setLoading } from '../store/authSlice';
import { apiClient } from '../lib/apiClient';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Silent refresh on initial app render if not authenticated
  useEffect(() => {
    async function initAuth() {
      if (!isAuthenticated && accessToken === null) {
        try {
          const res = await apiClient<AuthResponse>('/auth/refresh', {
            method: 'POST',
          });
          if (res.accessToken && res.user) {
            dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
          } else {
            dispatch(setLoading(false));
          }
        } catch (err) {
          dispatch(setLoading(false));
        }
      }
    }
    initAuth();
  }, [dispatch, isAuthenticated, accessToken]);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (data) => {
      if (data.accessToken && data.user) {
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      return apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (data) => {
      if (data.accessToken && data.user) {
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiClient('/auth/logout', {
        method: 'POST',
        accessToken,
      });
    },
    onSettled: () => {
      dispatch(logout());
      queryClient.clear();
    },
  });

  // Get Me Query
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; user: User }>('/auth/me', {
        accessToken,
        onTokenRefreshed: (newToken) => dispatch(setAccessToken(newToken)),
        onAuthFailed: () => dispatch(logout()),
      });
      return res.user;
    },
    enabled: !!accessToken && isAuthenticated,
  });

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? (loginMutation.error as Error).message : null,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error ? (registerMutation.error as Error).message : null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    meQuery,
  };
}
