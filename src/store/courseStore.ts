import { create } from 'zustand';
import { Course, Review, courses as initialCourses } from '@/lib/mockData';
interface CourseState {
  enrolledCourses: Map<number, { progress: number }>;
  reviews: Map<number, Review[]>;
  enrollCourse: (courseId: number) => void;
  addReview: (courseId: number, review: Omit<Review, 'id'>) => void;
  isEnrolled: (courseId: number) => boolean;
}
// Initialize reviews from mock data
const initialReviews = new Map<number, Review[]>();
initialCourses.forEach(course => {
  initialReviews.set(course.id, course.reviews);
});
export const useCourseStore = create<CourseState>((set, get) => ({
  enrolledCourses: new Map(),
  reviews: initialReviews,
  enrollCourse: (courseId) => {
    set((state) => {
      const newEnrolledCourses = new Map(state.enrolledCourses);
      if (!newEnrolledCourses.has(courseId)) {
        newEnrolledCourses.set(courseId, { progress: Math.floor(Math.random() * 15) + 5 }); // Start with some progress
      }
      return { enrolledCourses: newEnrolledCourses };
    });
  },
  addReview: (courseId, reviewData) => {
    set((state) => {
      const newReviews = new Map(state.reviews);
      const courseReviews = newReviews.get(courseId) || [];
      const newReview: Review = {
        ...reviewData,
        id: Date.now(), // Simple unique ID
      };
      newReviews.set(courseId, [newReview, ...courseReviews]);
      return { reviews: newReviews };
    });
  },
  isEnrolled: (courseId) => {
    return get().enrolledCourses.has(courseId);
  },
}));