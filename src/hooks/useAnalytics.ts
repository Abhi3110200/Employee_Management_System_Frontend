'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';

export interface AnalyticsSummary {
  totalEmployees: number;
  averageSalary: number;
  salaryBands: Array<{ label: string; count: number; percentage: number; color: string }>;
  departmentPayMetrics: Array<{
    name: string;
    headcount: number;
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
  }>;
}

export function useAnalytics() {
  const { accessToken, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; data: AnalyticsSummary }>('/analytics/summary', { accessToken });
      return res.data;
    },
    enabled: !!accessToken && isAuthenticated,
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
  };
}
