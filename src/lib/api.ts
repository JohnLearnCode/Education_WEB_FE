// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Complaint Types
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintRequest {
  courseId?: string;
  instructorId?: string;
  title: string;
  description: string;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsed.state.token}`,
        };
      }
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  }
  return {
    'Content-Type': 'application/json',
  };
};

// Helper function for authenticated fetch
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isInstructor: boolean;
  isAdmin: boolean;
  phoneNumber?: string;
  dateOfBirth?: Date;
  enrolledCourseIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  isInstructor?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Auth API Service
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Đăng ký thất bại');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok) {
      // Ưu tiên lấy error message từ backend
      const errorMessage = result.error || result.message || 'Email hoặc mật khẩu không đúng';
      throw new Error(errorMessage);
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get user profile
   */
  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<User> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thông tin người dùng');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result: ApiResponse<{ accessToken: string }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể làm mới token');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },
};

// Course Types
export interface InstructorInfo {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CourseResponse {
  _id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId: string;
  price: number;
  level: string;
  rating: number;
  ratingCount: number;
  imageUrl: string;
  slug: string;
  totalDuration: string;
  lectureCount: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
  instructor?: InstructorInfo;
  category?: {
    _id: string;
    name: string;
  };
}

export interface CoursesResponse {
  courses: CourseResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'price' | 'rating' | 'studentCount';
  sortOrder?: 'asc' | 'desc';
}

// Curriculum Types
export interface CourseLecture {
  _id?: string;
  sectionId: string;
  courseId: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCurriculumSection {
  _id?: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  lectures: CourseLecture[];
}

// Course API Service
export const courseApi = {
  /**
   * Get all courses with pagination and filters
   */
  getAllCourses: async (params?: CourseQueryParams): Promise<CoursesResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/courses/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<CoursesResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: string, token?: string): Promise<CourseResponse> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
      headers,
    });

    const result: ApiResponse<CourseResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thông tin khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get course curriculum (sections with lectures)
   */
  getCourseCurriculum: async (id: string): Promise<CourseCurriculumSection[]> => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/curriculum`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<CourseCurriculumSection[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy nội dung khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },
};

// Enrollment Types
export interface EnrollmentResponse {
  _id?: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  lastAccessedAt: Date;
  completedLectures: string[];
  completedAt?: Date;
}

export interface EnrolledCourseWithDetails {
  enrollmentId?: string;
  courseId: string;
  progress: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  completedLectures: string[];
  course: {
    _id?: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    level: string;
    rating: number;
    ratingCount: number;
    studentCount: number;
    totalDuration: string;
    lectureCount: number;
    instructor?: InstructorInfo;
    slug: string;
  };
}

// Enrollment API Service
export const enrollmentApi = {
  /**
   * Enroll in a course
   */
  enrollCourse: async (courseId: string, token: string): Promise<EnrollmentResponse> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId }),
    });

    const result: ApiResponse<EnrollmentResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể đăng ký khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get enrollment by user and course
   */
  getMyEnrollmentByCourse: async (courseId: string, token: string): Promise<EnrollmentResponse | null> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}/my-enrollment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<EnrollmentResponse> = await response.json();

    if (!response.ok) {
      // If not enrolled, return null instead of throwing error
      if (response.status === 404) {
        return null;
      }
      throw new Error(result.message || result.error || 'Không thể lấy thông tin đăng ký');
    }

    return result.data || null;
  },

  /**
   * Get all my enrollments
   */
  getMyEnrollments: async (token: string): Promise<EnrollmentResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<EnrollmentResponse[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách khóa học đã đăng ký');
    }

    return result.data || [];
  },

  /**
   * Get all enrolled courses with details
   */
  getMyEnrolledCoursesWithDetails: async (token: string): Promise<EnrolledCourseWithDetails[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/my-enrolled-courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<EnrolledCourseWithDetails[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách khóa học đã đăng ký');
    }

    return result.data || [];
  },

  /**
   * Mark lecture as completed
   */
  markLectureCompleted: async (lectureId: string, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/complete-lecture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ lectureId }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể đánh dấu hoàn thành bài học');
    }

    return result.data;
  },
};

// Course Review Types
export interface CourseReviewResponse {
  _id?: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseReviewRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface CourseReviewsResponse {
  reviews: CourseReviewResponse[];
  total: number;
  page: number;
  totalPages: number;
}

// Rating Distribution
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// Course Review Stats (per course)
export interface CourseReviewStats {
  courseId: string;
  courseTitle: string;
  courseImage: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  recentReviews: CourseReviewResponse[];
}

// Instructor Review Statistics
export interface InstructorReviewStats {
  totalCourses: number;
  totalReviews: number;
  overallAverageRating: number;
  ratingDistribution: RatingDistribution;
  courseStats: CourseReviewStats[];
  recentReviews: (CourseReviewResponse & { courseTitle: string })[];
}

// Course Review API Service
export const courseReviewApi = {
  /**
   * Create a course review
   */
  createReview: async (data: CreateCourseReviewRequest, token: string): Promise<CourseReviewResponse> => {
    const response = await fetch(`${API_BASE_URL}/course-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseReviewResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo đánh giá');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get reviews for a course
   */
  getCourseReviews: async (courseId: string, params?: { page?: number; limit?: number }): Promise<CourseReviewsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/course-reviews/course/${courseId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<CourseReviewsResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách đánh giá');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId: string, data: { rating?: number; comment?: string }, token: string): Promise<CourseReviewResponse> => {
    const response = await fetch(`${API_BASE_URL}/course-reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseReviewResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật đánh giá');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/course-reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa đánh giá');
    }
  },

  /**
   * Get instructor review statistics
   */
  getInstructorStats: async (token: string): Promise<InstructorReviewStats> => {
    const response = await fetch(`${API_BASE_URL}/course-reviews/instructor/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<InstructorReviewStats> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thống kê đánh giá');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get reviews for a specific course (instructor only)
   */
  getInstructorCourseReviews: async (
    courseId: string,
    token: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ): Promise<CourseReviewStats & { reviews: CourseReviewResponse[]; page: number; totalPages: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/course-reviews/instructor/course/${courseId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<CourseReviewStats & { reviews: CourseReviewResponse[]; page: number; totalPages: number }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy đánh giá khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },
};

// Quiz Types
export interface Quiz {
  _id?: string;
  lectureId: string;
  courseId: string;
  title: string;
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Type Enum
export enum QuizType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank'
}

// Answer interface
export interface Answer {
  _id?: string;
  text: string;
  imageUrl?: string;
  createdAt?: Date;
}

export interface QuizQuestion {
  _id?: string;
  quizId: string;
  questionText: string;
  imageUrl?: string;
  answers: Answer[]; // Populated answers
  correctAnswerIds?: string[]; // Only available for instructor
  requiredAnswers: number; // Số đáp án cần chọn
  type: QuizType;
  createdAt: Date;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

// Quiz API Service
export const quizApi = {
  /**
   * Get quizzes by course ID
   */
  getQuizzesByCourseId: async (courseId: string): Promise<Quiz[]> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/course/${courseId}/quizzes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Quiz[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách quiz');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get quiz by lecture ID
   */
  getQuizByLectureId: async (lectureId: string): Promise<Quiz | null> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/lecture/${lectureId}/quiz`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Quiz | null> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy quiz');
    }

    return result.data || null;
  },

  /**
   * Get questions by quiz ID (for student - without correct answers)
   */
  getQuestionsByQuizId: async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/quiz/${quizId}/questions/student`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<QuizQuestion[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy câu hỏi');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get questions by quiz ID (for instructor - with correct answers)
   */
  getQuestionsByQuizIdForInstructor: async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/quiz/${quizId}/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<QuizQuestion[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy câu hỏi');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Create a new quiz
   */
  createQuiz: async (data: { lectureId: string; courseId: string; title: string; passingScore: number; timeLimit: number }, token: string): Promise<Quiz> => {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Quiz> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo quiz');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a quiz
   */
  updateQuiz: async (quizId: string, data: { title?: string; passingScore?: number; timeLimit?: number }, token: string): Promise<Quiz> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/quiz/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Quiz> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật quiz');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a quiz
   */
  deleteQuiz: async (quizId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/quiz/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa quiz');
    }
  },
};

// Quiz Attempt Types
export interface QuestionAnswer {
  questionId: string;
  selectedAnswerIds: string[];
}

export interface SubmitQuizAttemptRequest {
  quizId: string;
  answers: QuestionAnswer[];
}

export interface QuizResultSummary {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  attemptedAt: Date;
}

// Quiz Attempt Response (for instructor statistics)
export interface QuizAttemptResponse {
  _id: string;
  userId: string;
  courseId: string;
  lectureId: string;
  quizId: string;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  attemptedAt: Date;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

// Quiz Attempt API Service
export const quizAttemptApi = {
  /**
   * Submit quiz attempt
   */
  submitQuizAttempt: async (data: SubmitQuizAttemptRequest, token: string): Promise<QuizResultSummary> => {
    const response = await fetch(`${API_BASE_URL}/quiz-attempts/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<QuizResultSummary> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể nộp bài');
    }

    if (!result.data) {
      throw new Error('Không nhận được kết quả từ server');
    }

    return result.data;
  },

  /**
   * Get all quiz attempts for a course (instructor only)
   */
  getAttemptsByCourseId: async (courseId: string, token: string): Promise<QuizAttemptResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/quiz-attempts/course/${courseId}/all-attempts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<QuizAttemptResponse[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thống kê quiz');
    }

    return result.data || [];
  },
};

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

// Category API Service
export const categoryApi = {
  /**
   * Get all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Category[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách danh mục');
    }

    return result.data || [];
  },
};

// Instructor Course Types
export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  level: string;
  imageUrl?: string;
  totalDuration?: string;
  lectureCount?: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  level?: string;
  imageUrl?: string;
  totalDuration?: string;
  lectureCount?: number;
}

// Instructor Course API Service
export const instructorCourseApi = {
  /**
   * Get instructor's courses
   */
  getMyCourses: async (token: string, params?: CourseQueryParams): Promise<CoursesResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/courses/my/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<CoursesResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Create a new course
   */
  createCourse: async (data: CreateCourseRequest, token: string): Promise<CourseResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a course
   */
  updateCourse: async (courseId: string, data: UpdateCourseRequest, token: string): Promise<CourseResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật khóa học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a course
   */
  deleteCourse: async (courseId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa khóa học');
    }
  },
};

// Upload API Types
export interface UploadResponse {
  url: string;
}

// Upload API Service
export const uploadApi = {
  /**
   * Upload image to Cloudinary
   */
  uploadImage: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<UploadResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải ảnh lên');
    }

    if (!result.data) {
      throw new Error('Không nhận được URL ảnh từ server');
    }

    return result.data.url;
  },

  /**
   * Upload video to Cloudinary (for instructors)
   */
  uploadVideo: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<UploadResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải video lên');
    }

    if (!result.data) {
      throw new Error('Không nhận được URL video từ server');
    }

    return result.data.url;
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<UploadResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải avatar lên');
    }

    if (!result.data) {
      throw new Error('Không nhận được URL avatar từ server');
    }

    return result.data.url;
  },

  /**
   * Upload file (PDF, Word) to Cloudinary
   */
  uploadFile: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<UploadResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải file lên');
    }

    if (!result.data) {
      throw new Error('Không nhận được URL file từ server');
    }

    return result.data.url;
  },
};

// Section Types
export interface CourseSection {
  _id?: string;
  courseId: string;
  title: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSectionRequest {
  courseId: string;
  title: string;
  order: number;
}

export interface UpdateSectionRequest {
  title?: string;
  order?: number;
}

// Section API Service
export const sectionApi = {
  /**
   * Get sections by course ID
   */
  getSectionsByCourseId: async (courseId: string): Promise<CourseSection[]> => {
    const response = await fetch(`${API_BASE_URL}/course-sections/course/${courseId}/sections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<CourseSection[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách chương');
    }

    return result.data || [];
  },

  /**
   * Create a new section
   */
  createSection: async (data: CreateSectionRequest, token: string): Promise<CourseSection> => {
    const response = await fetch(`${API_BASE_URL}/course-sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseSection> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo chương');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a section
   */
  updateSection: async (sectionId: string, data: UpdateSectionRequest, token: string): Promise<CourseSection> => {
    const response = await fetch(`${API_BASE_URL}/course-sections/section/${sectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<CourseSection> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật chương');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a section
   */
  deleteSection: async (sectionId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/course-sections/section/${sectionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa chương');
    }
  },

  /**
   * Get next order number
   */
  getNextOrderNumber: async (courseId: string, token: string): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/course-sections/course/${courseId}/next-order`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<{ nextOrder: number }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thứ tự tiếp theo');
    }

    return result.data?.nextOrder || 1;
  },
};

// Lecture Types
export interface Lecture {
  _id?: string;
  sectionId: string;
  courseId: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLectureRequest {
  sectionId: string;
  courseId: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order: number;
}

export interface UpdateLectureRequest {
  title?: string;
  duration?: string;
  type?: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order?: number;
}

// Lecture API Service
export const lectureApi = {
  /**
   * Get lectures by section ID
   */
  getLecturesBySectionId: async (sectionId: string): Promise<Lecture[]> => {
    const response = await fetch(`${API_BASE_URL}/lectures/section/${sectionId}/lectures`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Lecture[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách bài học');
    }

    return result.data || [];
  },

  /**
   * Get lectures by course ID
   */
  getLecturesByCourseId: async (courseId: string): Promise<Lecture[]> => {
    const response = await fetch(`${API_BASE_URL}/lectures/course/${courseId}/lectures`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<Lecture[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách bài học');
    }

    return result.data || [];
  },

  /**
   * Create a new lecture
   */
  createLecture: async (data: CreateLectureRequest, token: string): Promise<Lecture> => {
    const response = await fetch(`${API_BASE_URL}/lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Lecture> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo bài học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a lecture
   */
  updateLecture: async (lectureId: string, data: UpdateLectureRequest, token: string): Promise<Lecture> => {
    const response = await fetch(`${API_BASE_URL}/lectures/lecture/${lectureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Lecture> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật bài học');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a lecture
   */
  deleteLecture: async (lectureId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/lectures/lecture/${lectureId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa bài học');
    }
  },

  /**
   * Get next order number for a section
   */
  getNextOrderNumber: async (sectionId: string, token: string): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/lectures/section/${sectionId}/next-order`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<{ nextOrder: number }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thứ tự tiếp theo');
    }

    return result.data?.nextOrder || 1;
  },
};

// Create/Update Quiz Request Types
export interface CreateQuizRequest {
  lectureId: string;
  courseId: string;
  title: string;
  passingScore: number;
  timeLimit: number;
}

export interface UpdateQuizRequest {
  title?: string;
  passingScore?: number;
  timeLimit?: number;
}

// Create/Update Quiz Question Request Types
export interface CreateQuizQuestionRequest {
  quizId: string;
  questionText: string;
  imageUrl?: string;
  answers: { text: string; imageUrl?: string }[];
  correctAnswerIndices: number[];
  type: QuizType;
}

export interface UpdateQuizQuestionRequest {
  questionText?: string;
  imageUrl?: string;
  correctAnswerIds?: string[];
  type?: QuizType;
}

// Quiz Question API Service (for instructor)
export const quizQuestionApi = {
  /**
   * Get questions by quiz ID (for instructor - includes correct answers)
   */
  getQuestionsByQuizId: async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/quiz/${quizId}/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<QuizQuestion[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy câu hỏi');
    }

    return result.data || [];
  },

  /**
   * Create a new question
   */
  createQuestion: async (data: CreateQuizQuestionRequest, token: string): Promise<QuizQuestion> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<QuizQuestion> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo câu hỏi');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Update a question
   */
  updateQuestion: async (questionId: string, data: UpdateQuizQuestionRequest, token: string): Promise<QuizQuestion> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/question/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<QuizQuestion> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể cập nhật câu hỏi');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (questionId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/question/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa câu hỏi');
    }
  },

  /**
   * Preview questions from CSV/XLSX file before import
   */
  previewImport: async (file: File, token: string): Promise<{ 
    questions: Array<{
      questionText: string;
      type: string;
      answers: string[];
      correctAnswers: number[];
    }>;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/quiz-questions/preview-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<{ 
      questions: Array<{
        questionText: string;
        type: string;
        answers: string[];
        correctAnswers: number[];
      }>;
      errors: string[];
    }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể đọc file');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Import questions from CSV/XLSX file
   */
  importQuestions: async (quizId: string, file: File, token: string): Promise<{ success: number; failed: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/quiz-questions/quiz/${quizId}/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result: ApiResponse<{ success: number; failed: number; errors: string[] }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể import câu hỏi');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Download import template
   */
  downloadImportTemplate: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/import-template`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Không thể tải template');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_questions_template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Export quiz questions to XLSX file
   */
  exportQuestions: async (quizId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/quiz/${quizId}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || result.error || 'Không thể export câu hỏi');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_questions_${quizId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// Complaint API Service
export const complaintApi = {
  /**
   * Create a new complaint
   */
  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await authFetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Complaint> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo khiếu nại');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get all complaints of current user
   */
  getMyComplaints: async (): Promise<Complaint[]> => {
    const response = await authFetch(`${API_BASE_URL}/complaints`);

    const result: ApiResponse<{ complaints: Complaint[] }> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải danh sách khiếu nại');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data.complaints;
  },

  /**
   * Get complaint by ID
   */
  getById: async (complaintId: string): Promise<Complaint> => {
    const response = await authFetch(`${API_BASE_URL}/complaints/${complaintId}`);

    const result: ApiResponse<Complaint> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tải khiếu nại');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Delete complaint
   */
  delete: async (complaintId: string): Promise<void> => {
    const response = await authFetch(`${API_BASE_URL}/complaints/${complaintId}`, {
      method: 'DELETE',
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể xóa khiếu nại');
    }
  },
};

// ==================== ORDER API ====================

// Order Types
export interface OrderItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string;
}

export interface Order {
  _id: string;
  userId: string;
  courses: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  courseIds: string[];
  paymentMethod: string;
}

// Order API Service
export const orderApi = {
  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderRequest, token: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Order> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể tạo đơn hàng');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string, token: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<Order> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy thông tin đơn hàng');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Get my orders
   */
  getMyOrders: async (token: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<Order[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể lấy danh sách đơn hàng');
    }

    return result.data || [];
  },
};

// ==================== SEPAY PAYMENT API ====================

// SePay Types
export type SepayPaymentMethod = 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';

export interface SepayPaymentResponse {
  checkoutUrl: string;
  checkoutFields: Record<string, string | number>;
  orderId: string;
  orderAmount: number;
}

export interface SepayPaymentStatus {
  status: string;
  message: string;
}

// SePay Payment API Service
export const sepayApi = {
  /**
   * Initiate SePay payment
   */
  initiatePayment: async (
    orderId: string,
    paymentMethod: SepayPaymentMethod,
    token: string
  ): Promise<SepayPaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payment/sepay/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, paymentMethod }),
    });

    const result: ApiResponse<SepayPaymentResponse> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể khởi tạo thanh toán');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },

  /**
   * Verify payment status
   */
  verifyPayment: async (orderId: string, token: string): Promise<SepayPaymentStatus> => {
    const response = await fetch(`${API_BASE_URL}/payment/sepay/verify/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<SepayPaymentStatus> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Không thể kiểm tra trạng thái thanh toán');
    }

    if (!result.data) {
      throw new Error('Không nhận được dữ liệu từ server');
    }

    return result.data;
  },
};

// Export helper functions for use in other API files
export { authFetch, getAuthHeaders };
