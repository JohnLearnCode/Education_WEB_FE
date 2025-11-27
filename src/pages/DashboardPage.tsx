import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { enrollmentApi, EnrolledCourseWithDetails, courseApi } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await enrollmentApi.getMyEnrolledCoursesWithDetails(token);
        setEnrolledCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học');
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendedCourses = async () => {
      try {
        const { courses: allCourses } = await courseApi.getAllCourses({ limit: 4 });
        setRecommendedCourses(allCourses.slice(0, 2));
      } catch (err) {
        console.error('Error fetching recommended courses:', err);
      }
    };

    fetchEnrolledCourses();
    fetchRecommendedCourses();
  }, [token]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải khóa học...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-cognita-slate dark:text-white">Bảng điều khiển của tôi</h1>
          <p className="text-lg text-muted-foreground mt-2">Chào mừng trở lại, {user?.name}! Tiếp tục hành trình học tập của bạn.</p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Khóa học của tôi</h2>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-6">
                {enrolledCourses.map(enrolledCourse => (
                  <Card key={enrolledCourse.courseId}>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link to={`/courses/${enrolledCourse.courseId}`} className="w-full sm:w-40">
                        <img 
                          src={enrolledCourse.course.imageUrl} 
                          alt={enrolledCourse.course.title} 
                          className="w-full h-auto rounded-md object-cover aspect-video sm:aspect-auto hover:opacity-80 transition-opacity" 
                        />
                      </Link>
                      <div className="flex-grow w-full">
                        <Link to={`/courses/${enrolledCourse.courseId}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors">{enrolledCourse.course.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">
                          Bởi {enrolledCourse.course.instructor?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <Progress value={enrolledCourse.progress} className="w-full" />
                          <span className="text-sm font-medium">{enrolledCourse.progress}%</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/complaint?courseId=${enrolledCourse.courseId}&courseName=${encodeURIComponent(enrolledCourse.course.title)}&instructorId=${enrolledCourse.course.instructor?._id || ''}&instructorName=${encodeURIComponent(enrolledCourse.course.instructor?.name || '')}`)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Khiếu nại
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-2xl font-semibold text-foreground">Chưa có khóa học nào!</h3>
                <p className="text-muted-foreground mt-2 mb-4">Có vẻ như bạn chưa đăng ký khóa học nào.</p>
                <Button asChild>
                  <Link to="/courses">Khám phá khóa học</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Đề xuất cho bạn</h2>
            <div className="space-y-4">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map(course => (
                  <Link key={course._id} to={`/courses/${course._id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-32 object-cover rounded-md mb-2" 
                        />
                        <h3 className="font-semibold text-sm">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.instructor?.name || 'Unknown'}
                        </p>
                        <p className="text-sm font-bold text-primary mt-2">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Đang tải...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;