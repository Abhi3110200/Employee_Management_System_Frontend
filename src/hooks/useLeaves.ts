'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';

export interface LeaveRequest {
  id: string;
  _id?: string;
  employeeId?: string;
  employeeName: string;
  department: string;
  type: 'casual' | 'sick' | 'paid' | 'remote';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate?: string;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt?: string;
}

export function useLeaves(filters: { status?: string; type?: string; search?: string } = {}) {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
  if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
  if (filters.search) queryParams.append('search', filters.search);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const query = useQuery({
    queryKey: ['leave-requests', filters],
    queryFn: async () => {
      const res = await apiClient<{
        status: string;
        count: number;
        data: LeaveRequest[];
      }>(`/leaves${queryString}`, { accessToken });

      return res.data.map((item) => {
        const start = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
        const end = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '';
        return {
          ...item,
          id: item.id || item._id || String(Math.random()),
          startDate: start,
          endDate: end,
        };
      });
    },
    enabled: !!accessToken && isAuthenticated,
  });

  const applyLeaveMutation = useMutation({
    mutationFn: async (payload: {
      type: 'casual' | 'sick' | 'paid' | 'remote';
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      return apiClient<LeaveRequest>('/leaves', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateLeaveStatusMutation = useMutation({
    mutationFn: async ({ id, status, reviewComment }: { id: string; status: 'approved' | 'rejected'; reviewComment?: string }) => {
      return apiClient(`/leaves/${id}/status`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ status, reviewComment }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    leaveRequests: query.data || [],
    isLoading: query.isLoading,
    applyLeave: applyLeaveMutation.mutateAsync,
    isApplying: applyLeaveMutation.isPending,
    updateLeaveStatus: updateLeaveStatusMutation.mutateAsync,
    isUpdatingStatus: updateLeaveStatusMutation.isPending,
  };
}
