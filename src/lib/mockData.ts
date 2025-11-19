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
export const courses: Course[] = [
  {
    id: 1,
    title: 'The Complete 2024 Web Development Bootcamp',
    category: 'Web Development',
    description: 'Become a Full-Stack Web Developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB and more!',
    longDescription: 'This is the only course you need to learn to code and become a full-stack web developer. With over 55 hours of content, this course is a comprehensive and engaging journey into the world of web development. You will build 16 projects and learn the latest technologies.',
    price: 84.99,
    rating: 4.8,
    students: 288_000,
    lessons: 628,
    duration: '65.5 hours',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    instructor: instructors[0],
    reviews: [
      { id: 201, author: 'Sarah L.', avatar: 'https://i.pravatar.cc/150?img=8', rating: 5, comment: 'Absolutely the best web dev course out there. Comprehensive and easy to follow.' },
      { id: 202, author: 'Mike P.', avatar: 'https://i.pravatar.cc/150?img=9', rating: 4, comment: 'A bit fast-paced at times, but overall a great learning experience.' },
    ],
    curriculum: [
      { id: 1, title: 'Module 1: Introduction to Web Development', lessons: [{ title: 'How the Internet Works', duration: '15min' }, { title: 'HTML Basics', duration: '45min' }] },
      { id: 2, title: 'Module 2: Intermediate CSS', lessons: [{ title: 'Flexbox', duration: '1hr' }, { title: 'CSS Grid', duration: '1.5hr' }] },
    ],
  },
  {
    id: 2,
    title: 'React - The Complete Guide (incl Hooks, React Router, Redux)',
    category: 'Frontend',
    description: 'Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Router, Next.js, Best Practices and way more!',
    longDescription: 'A deep dive into React, one of the most popular JavaScript libraries for building user interfaces. This course covers everything from the fundamentals to advanced topics, ensuring you become a confident React developer.',
    price: 99.99,
    rating: 4.7,
    students: 175_000,
    lessons: 540,
    duration: '48.5 hours',
    imageUrl: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1901&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    instructor: instructors[1],
    reviews: reviews,
    curriculum: [
      { id: 1, title: 'Module 1: Getting Started with React', lessons: [{ title: 'What is React?', duration: '20min' }, { title: 'Setting up the environment', duration: '30min' }] },
      { id: 2, title: 'Module 2: Components & State', lessons: [{ title: 'Functional Components', duration: '1hr' }, { title: 'State and Props', duration: '1.5hr' }] },
    ],
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Digital Sketching: Beginner to Advanced',
    category: 'Design',
    description: 'Learn the #1 most important skill for a digital artist. A comprehensive guide to digital sketching on any software.',
    longDescription: 'Unlock your creative potential with this comprehensive guide to digital sketching. Whether you are a complete beginner or have some experience, this course will take you through the tools, techniques, and principles to create stunning digital art.',
    price: 49.99,
    rating: 4.9,
    students: 92_000,
    lessons: 88,
    duration: '11.5 hours',
    imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    instructor: instructors[2],
    reviews: [
      { id: 301, author: 'Emily R.', avatar: 'https://i.pravatar.cc/150?img=10', rating: 5, comment: 'This course unlocked my creativity! The instructor is amazing.' },
    ],
    curriculum: [
      { id: 1, title: 'Module 1: Sketching Fundamentals', lessons: [{ title: 'Lines and Shapes', duration: '45min' }, { title: 'Perspective Basics', duration: '1hr' }] },
      { id: 2, title: 'Module 2: Character Design', lessons: [{ title: 'Anatomy and Proportions', duration: '2hr' }, { title: 'Expressive Poses', duration: '1.5hr' }] },
    ],
  },
  {
    id: 4,
    title: 'Advanced CSS and Sass: Flexbox, Grid, Animations and More!',
    category: 'Web Development',
    description: 'The most advanced and modern CSS course on the internet: master flexbox, CSS Grid, responsive design, and so much more.',
    longDescription: 'Take your CSS skills to the next level. This course covers modern CSS features like Flexbox, Grid, and animations, along with the powerful preprocessor Sass. You will build beautiful, responsive layouts for real-world projects.',
    price: 69.99,
    rating: 4.8,
    students: 120_000,
    lessons: 220,
    duration: '28 hours',
    imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421b432b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    instructor: instructors[2],
    reviews: [
      { id: 401, author: 'David Chen', avatar: 'https://i.pravatar.cc/150?img=11', rating: 5, comment: 'Finally, a CSS course that covers everything. My layouts have never looked better.' },
      { id: 402, author: 'Jessica P.', avatar: 'https://i.pravatar.cc/150?img=12', rating: 5, comment: 'The projects are so practical and fun to build.' },
    ],
    curriculum: [
      { id: 1, title: 'Module 1: Sass/SCSS', lessons: [{ title: 'Variables and Nesting', duration: '1hr' }, { title: 'Mixins and Functions', duration: '1.5hr' }] },
      { id: 2, title: 'Module 2: Advanced Layouts', lessons: [{ title: 'Deep Dive into Flexbox', duration: '2hr' }, { title: 'Mastering CSS Grid', duration: '3hr' }] },
    ],
  },
];