import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/CourseCard';
import { courses } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const DashboardPage = () => {
  const enrolledCourses = courses.slice(0, 2).map(course => ({
    ...course,
    progress: Math.floor(Math.random() * 100),
  }));
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-cognita-slate dark:text-white">My Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Welcome back! Continue your learning journey.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            <div className="space-y-6">
              {enrolledCourses.map(course => (
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
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
            <div className="space-y-4">
              <CourseCard course={courses[2]} />
              <CourseCard course={courses[3]} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default DashboardPage;