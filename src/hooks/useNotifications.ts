'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';

export interface NotificationItem {
  id: string;
  _id?: string;
  type: 'task_assigned' | 'leave_update' | 'attendance_alert' | 'performance_review';
  title: string;
  message: string;
  isRead: boolean;
  linkHref: string;
  createdAt: string;
  timestamp?: string;
}

export function useNotifications() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient<{
        status: string;
        unreadCount: number;
        count: number;
        data: NotificationItem[];
      }>('/notifications', { accessToken });

      return {
        unreadCount: res.unreadCount || 0,
        notifications: res.data || [],
      };
    },
    enabled: !!accessToken && isAuthenticated,
    refetchInterval: 10000, // 10s background poll for real-time notifications
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
        accessToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiClient('/notifications/read-all', {
        method: 'PATCH',
        accessToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/notifications/${id}`, {
        method: 'DELETE',
        accessToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data?.notifications || [],
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
  };
}
