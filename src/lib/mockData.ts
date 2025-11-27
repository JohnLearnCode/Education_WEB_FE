export interface Instructor {
  id: number;
  name: string;
  title: string;
  avatar: string;
}
export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
}
export interface Curriculum {
  id: number;
  title: string;
  lessons: { title: string; duration: string }[];
}
export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
  imageUrl: string;
  instructor: Instructor;
  reviews: Review[];
  curriculum: Curriculum[];
}
export const instructors: Instructor[] = [
  { id: 1, name: 'Dr. Angela Yu', title: 'Lead Instructor', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Maximilian Schwarzmüller', title: 'Web Developer', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Jonas Schmedtmann', title: 'Design Expert', avatar: 'https://i.pravatar.cc/150?img=3' },
];

export const reviews: Review[] = [
  { id: 101, author: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=4', rating: 5, comment: 'This course was fantastic! I learned so much.' },
  { id: 102, author: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=5', rating: 4, comment: 'Great content and well-explained concepts.' },
  { id: 103, author: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=6', rating: 5, comment: 'Highly recommended for beginners.' },
];

export const courses: Course[] = [];