import { create } from 'zustand';
import { Review } from '@/lib/mockData';

interface CourseState {
  enrolledCourses: Map<string, { progress: number }>;
  reviews: Map<string, Review[]>;
  enrollCourse: (courseId: string) => void;
  addReview: (courseId: string, review: Omit<Review, 'id'>) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  enrolledCourses: new Map(),
  reviews: new Map(),
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