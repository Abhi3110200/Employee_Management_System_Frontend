'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';

export interface DepartmentInfo {
  id: string;
  _id?: string;
  name: string;
  code: string;
  leadName: string;
  leadTitle: string;
  headcount: number;
  openPositions: number;
  totalBudget: number;
  spentBudget: number;
  color: string;
  projects: string[];
  members?: { name: string; title: string; email: string }[];
}

export function useDepartments() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; data: DepartmentInfo[] }>('/departments', { accessToken });
      return res.data.map((d) => ({
        ...d,
        id: d.id || d._id || String(Math.random()),
      }));
    },
    enabled: !!accessToken && isAuthenticated,
  });

  const createDeptMutation = useMutation({
    mutationFn: async (deptData: Partial<DepartmentInfo>) => {
      return apiClient('/departments', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(deptData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    departments: query.data || [],
    isLoading: query.isLoading,
    createDepartment: createDeptMutation.mutateAsync,
  };
}
