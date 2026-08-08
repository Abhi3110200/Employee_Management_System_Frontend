'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/apiClient';
import { User, Role, UserStatus, DashboardStats } from '../types/auth';

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: 'name' | 'joiningDate' | 'createdAt' | 'salary';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  showDeleted?: boolean;
}

export interface PaginationMeta {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  pageLimit: number;
}

export function useDashboardStats() {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient<{ status: string; stats: DashboardStats }>('/employees/stats', {
        accessToken,
      });
      return res.stats;
    },
    enabled: !!accessToken && isAuthenticated,
  });
}

export function useEmployees(filters: EmployeeFilters = {}) {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();

  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  // Build query string
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.department) queryParams.append('department', filters.department);
  if (filters.role) queryParams.append('role', filters.role);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
  if (filters.page) queryParams.append('page', String(filters.page));
  if (filters.limit) queryParams.append('limit', String(filters.limit));
  if (filters.showDeleted) queryParams.append('showDeleted', 'true');

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  // Get All Employees Query
  const employeesQuery = useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const res = await apiClient<{
        status: string;
        employees: User[];
        pagination: PaginationMeta;
      }>(`/employees${queryString}`, { accessToken });
      return res;
    },
    enabled: !!accessToken && isSuperAdminOrHR,
  });

  // Create Employee Mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployeeData: Partial<User> & { password?: string }) => {
      return apiClient<{ status: string; message: string; employee: User }>('/employees', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(newEmployeeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree'] });
    },
  });

  // Update Employee Mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      return apiClient<{ status: string; message: string; employee: User }>(`/employees/${id}`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree'] });
    },
  });

  // Soft Delete Employee Mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ status: string; message: string }>(`/employees/${id}`, {
        method: 'DELETE',
        accessToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree'] });
    },
  });

  // Restore Employee Mutation
  const restoreEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ status: string; message: string }>(`/employees/${id}/restore`, {
        method: 'PATCH',
        accessToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree'] });
    },
  });

  // CSV Import Bulk Mutation
  const importCSVMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      return apiClient<{ status: string; message: string }>('/employees/import/csv', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ rows }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree'] });
    },
  });

  const exportCSV = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees/export/csv', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('CSV Export error:', err);
    }
  };

  return {
    employees: employeesQuery.data?.employees || [],
    pagination: employeesQuery.data?.pagination || {
      totalResults: 0,
      totalPages: 1,
      currentPage: 1,
      pageLimit: 10,
    },
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    error: employeesQuery.error ? (employeesQuery.error as Error).message : null,
    refetch: employeesQuery.refetch,
    createEmployee: createEmployeeMutation.mutateAsync,
    isCreating: createEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    isUpdating: updateEmployeeMutation.isPending,
    deleteEmployee: deleteEmployeeMutation.mutateAsync,
    isDeleting: deleteEmployeeMutation.isPending,
    restoreEmployee: restoreEmployeeMutation.mutateAsync,
    isRestoring: restoreEmployeeMutation.isPending,
    importCSV: importCSVMutation.mutateAsync,
    isImporting: importCSVMutation.isPending,
    exportCSV,
  };
}
