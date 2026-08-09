'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';

export interface PerformanceGoal {
  id: string;
  _id?: string;
  employeeId?: string;
  employeeName: string;
  department: string;
  title: string;
  category: 'OKR' | 'Project' | 'Skill' | 'Leadership';
  dueDate: string;
  progress: number;
  status: 'in_progress' | 'completed' | 'behind';
}

export interface EmployeeReview {
  id: string;
  _id?: string;
  employeeId?: string;
  employeeName: string;
  designation: string;
  department: string;
  rating: number;
  quarter: string;
  reviewStatus: 'completed' | 'pending';
  strengths: string;
  growthAreas: string;
  lastUpdated?: string;
}

export function usePerformance() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['performance-goals'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; data: PerformanceGoal[] }>('/performance/goals', { accessToken });
      return res.data.map((g) => ({
        ...g,
        id: g.id || g._id || String(Math.random()),
        dueDate: g.dueDate ? new Date(g.dueDate).toISOString().split('T')[0] : '',
      }));
    },
    enabled: !!accessToken && isAuthenticated,
  });

  const reviewsQuery = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; data: EmployeeReview[] }>('/performance/reviews', { accessToken });
      return res.data.map((r) => ({
        ...r,
        id: r.id || r._id || String(Math.random()),
      }));
    },
    enabled: !!accessToken && isAuthenticated,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Partial<PerformanceGoal>) => {
      return apiClient('/performance/goals', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(goalData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateGoalProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      return apiClient(`/performance/goals/${id}/progress`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ progress }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
    },
  });

  const saveReviewMutation = useMutation({
    mutationFn: async (reviewData: Partial<EmployeeReview>) => {
      return apiClient('/performance/reviews', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    goals: goalsQuery.data || [],
    reviews: reviewsQuery.data || [],
    isLoadingGoals: goalsQuery.isLoading,
    isLoadingReviews: reviewsQuery.isLoading,
    createGoal: createGoalMutation.mutateAsync,
    updateGoalProgress: updateGoalProgressMutation.mutateAsync,
    saveReview: saveReviewMutation.mutateAsync,
  };
}
