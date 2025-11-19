import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/CourseCard';
import { courses } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
const DashboardPage = () => {
  const user = useAuthStore(state => state.user);
  const enrolledCoursesMap = useCourseStore(state => state.enrolledCourses);
  const enrolledCourseDetails = Array.from(enrolledCoursesMap.keys())
    .map(id => {
      const course = courses.find(c => c.id === id);
      if (course) {
        return {
          ...course,
          progress: enrolledCoursesMap.get(id)?.progress || 0,
        };
      }
      return null;
    })
    .filter(Boolean);
  const recommendedCourses = courses.filter(c => !enrolledCoursesMap.has(c.id)).slice(0, 2);
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-cognita-slate dark:text-white">My Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Welcome back, {user?.name}! Continue your learning journey.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            {enrolledCourseDetails.length > 0 ? (
              <div className="space-y-6">
                {enrolledCourseDetails.map(course => (
                  course && (
                    <Card key={course.id}>
                      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <img src={course.imageUrl} alt={course.title} className="w-full sm:w-40 h-auto rounded-md object-cover aspect-video sm:aspect-auto" />
                        <div className="flex-grow w-full">
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">By {course.instructor.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={course.progress} className="w-full" />
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-2xl font-semibold text-foreground">No courses yet!</h3>
                <p className="text-muted-foreground mt-2 mb-4">It looks like you haven't enrolled in any courses.</p>
                <Button asChild>
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
            <div className="space-y-4">
              {recommendedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default DashboardPage;