import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import HomePage from '@/pages/HomePage'
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import LessonViewPage from '@/pages/LessonViewPage';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import GoogleAuthCallback from '@/pages/GoogleAuthCallback';
import InstructorCoursesPage from '@/pages/InstructorCoursesPage';
import CourseCurriculumPage from '@/pages/CourseCurriculumPage';
import LectureQuizPage from '@/pages/LectureQuizPage';
import InstructorReviewsPage from '@/pages/InstructorReviewsPage';
import InstructorCourseReviewsPage from '@/pages/InstructorCourseReviewsPage';
import InstructorQuizStatisticsPage from '@/pages/InstructorQuizStatisticsPage';
import ComplaintPage from '@/pages/ComplaintPage';
import MyComplaintsPage from '@/pages/MyComplaintsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import UsersManagement from '@/pages/admin/UsersManagement';
import CoursesManagement from '@/pages/admin/CoursesManagement';
import OrdersManagement from '@/pages/admin/OrdersManagement';
import Reports from '@/pages/admin/Reports';
import Settings from '@/pages/admin/Settings';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/courses",
    element: <CoursesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/courses/:id",
    element: <CourseDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/courses/:courseId/lessons/:lectureId",
    element: (
      <ProtectedRoute>
        <LessonViewPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/signup",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallback />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/courses",
    element: (
      <ProtectedRoute>
        <InstructorCoursesPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/courses/:courseId/curriculum",
    element: (
      <ProtectedRoute>
        <CourseCurriculumPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/courses/:courseId/lectures/:lectureId/quiz",
    element: (
      <ProtectedRoute>
        <LectureQuizPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/reviews",
    element: (
      <ProtectedRoute>
        <InstructorReviewsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/courses/:courseId/reviews",
    element: (
      <ProtectedRoute>
        <InstructorCourseReviewsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/instructor/courses/:courseId/quiz-statistics",
    element: (
      <ProtectedRoute>
        <InstructorQuizStatisticsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/complaint",
    element: (
      <ProtectedRoute>
        <ComplaintPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/my-complaints",
    element: (
      <ProtectedRoute>
        <MyComplaintsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UsersManagement />,
      },
      {
        path: "courses",
        element: <CoursesManagement />,
      },
      {
        path: "orders",
        element: <OrdersManagement />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)