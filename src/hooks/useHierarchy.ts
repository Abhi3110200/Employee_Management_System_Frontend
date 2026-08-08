'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';
import { HierarchyNode, User } from '../types/auth';

export function useHierarchyTree() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['hierarchy-tree'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; tree: HierarchyNode[] }>('/hierarchy/tree', {
        accessToken,
      });
      return res.tree;
    },
    enabled: !!accessToken && isAuthenticated,
  });
}

export function useDirectReports(managerId: string | null) {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['direct-reports', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      const res = await apiClient<{ status: string; results: number; directReports: User[] }>(
        `/hierarchy/direct-reports/${managerId}`,
        { accessToken }
      );
      return res.directReports;
    },
    enabled: !!accessToken && isAuthenticated && !!managerId,
  });
}
