import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with auth token
const createAuthAxios = () => {
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

// ============================================
// USERS MANAGEMENT
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isInstructor: boolean;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
}

export const usersApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<UsersResponse> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  getById: async (userId: string): Promise<User> => {
    const api = createAuthAxios();
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  updateRole: async (userId: string, roleData: { isInstructor?: boolean; isAdmin?: boolean }): Promise<User> => {
    const api = createAuthAxios();
    const response = await api.patch(`/admin/users/${userId}/role`, roleData);
    return response.data.data;
  },

  toggleStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const api = createAuthAxios();
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data.data;
  },

  delete: async (userId: string): Promise<void> => {
    const api = createAuthAxios();
    await api.delete(`/admin/users/${userId}`);
  },

  getStats: async (): Promise<UsersStats> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },
};

// ============================================
// COURSES MANAGEMENT
// ============================================

export interface Course {
  _id: string;
  title: string;
  instructorName: string;
  categoryName: string;
  price: number;
  studentCount: number;
  status: 'published' | 'draft' | 'pending';
  createdAt: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CoursesStats {
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  totalStudents: number;
}

export const coursesApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<CoursesResponse> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/courses', { params });
    return response.data.data;
  },

  getById: async (courseId: string): Promise<Course> => {
    const api = createAuthAxios();
    const response = await api.get(`/admin/courses/${courseId}`);
    return response.data.data;
  },

  updateStatus: async (courseId: string, status: string): Promise<Course> => {
    const api = createAuthAxios();
    const response = await api.patch(`/admin/courses/${courseId}/status`, { status });
    return response.data.data;
  },

  delete: async (courseId: string): Promise<void> => {
    const api = createAuthAxios();
    await api.delete(`/admin/courses/${courseId}`);
  },

  getStats: async (): Promise<CoursesStats> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/courses/stats');
    return response.data.data;
  },
};

// ============================================
// ORDERS MANAGEMENT
// ============================================

export interface Order {
  _id: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'failed';
  courseCount: number;
  createdAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrdersStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
}

export const ordersApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<OrdersResponse> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/orders', { params });
    return response.data.data;
  },

  getById: async (orderId: string): Promise<Order> => {
    const api = createAuthAxios();
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data.data;
  },

  updateStatus: async (orderId: string, status: string): Promise<Order> => {
    const api = createAuthAxios();
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  getStats: async (): Promise<OrdersStats> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/orders/stats');
    return response.data.data;
  },
};

// ============================================
// COMPLAINTS MANAGEMENT
// ============================================

export interface Complaint {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId?: string;
  courseName?: string;
  instructorId?: string;
  instructorName?: string;
  type: 'course' | 'instructor';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ComplaintsStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byCourse: number;
  byInstructor: number;
}

export const complaintsApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<ComplaintsResponse> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/complaints', { params });
    return response.data.data;
  },

  getById: async (complaintId: string): Promise<Complaint> => {
    const api = createAuthAxios();
    const response = await api.get(`/admin/complaints/${complaintId}`);
    return response.data.data;
  },

  update: async (
    complaintId: string,
    data: { status?: string; adminResponse?: string }
  ): Promise<Complaint> => {
    const api = createAuthAxios();
    const response = await api.patch(`/admin/complaints/${complaintId}`, data);
    return response.data.data;
  },

  delete: async (complaintId: string): Promise<void> => {
    const api = createAuthAxios();
    await api.delete(`/admin/complaints/${complaintId}`);
  },

  getStats: async (): Promise<ComplaintsStats> => {
    const api = createAuthAxios();
    const response = await api.get('/admin/complaints/stats');
    return response.data.data;
  },
};
