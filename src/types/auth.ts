export type Role = 'super_admin' | 'hr_manager' | 'employee';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  _id?: string;
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  position?: string;
  salary?: number;
  joiningDate?: string;
  status?: UserStatus;
  role: Role;
  manager?: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    position?: string;
    designation?: string;
  } | null;
  profileImage?: string;
  address?: string;
  createdAt?: string;
}

export interface HierarchyNode {
  id: string;
  _id?: string;
  employeeId?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  designation?: string;
  position?: string;
  profileImage?: string;
  status?: UserStatus;
  directReportsCount: number;
  directReports?: HierarchyNode[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  accessToken?: string;
  user?: User;
}
