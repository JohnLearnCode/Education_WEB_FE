import axios from 'axios';
import type {
  DashboardResponse,
  DashboardStats,
  ChartDataResponse,
  UserStats,
  CourseStats,
  RevenueStats,
  OrderStats
} from '@/types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with auth token
const createAuthAxios = () => {
  // Get token from Zustand persist storage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token || '';
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  }
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export const adminApi = {
  /**
   * Get complete dashboard data
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: DashboardResponse }>('/admin/dashboard');
    return response.data.data;
  },

  /**
   * Get dashboard statistics only
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: DashboardStats }>('/admin/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get chart data
   */
  getChartData: async (): Promise<ChartDataResponse> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: ChartDataResponse }>('/admin/dashboard/charts');
    return response.data.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStats> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: UserStats }>('/admin/stats/users');
    return response.data.data;
  },

  /**
   * Get course statistics
   */
  getCourseStats: async (): Promise<CourseStats> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: CourseStats }>('/admin/stats/courses');
    return response.data.data;
  },

  /**
   * Get revenue statistics
   */
  getRevenueStats: async (): Promise<RevenueStats> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: RevenueStats }>('/admin/stats/revenue');
    return response.data.data;
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStats> => {
    const api = createAuthAxios();
    const response = await api.get<{ data: OrderStats }>('/admin/stats/orders');
    return response.data.data;
  },
};
