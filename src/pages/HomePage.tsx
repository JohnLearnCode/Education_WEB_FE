import { Link } from 'react-router-dom';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CourseCard from '@/components/CourseCard';
import { reviews } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { courseApi, CourseResponse } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await courseApi.getAllCourses({ page: 1, limit: 3 });
        setFeaturedCourses(response.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải khóa học');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-white dark:bg-cognita-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-cognita-slate dark:text-white leading-tight">
                Mở Khóa Tiềm Năng Của Bạn, Từng Khóa Học Một.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                Khám phá thế giới kiến thức với các khóa học trực tuyến sinh động và hấp dẫn của chúng tôi. Học hỏi từ các chuyên gia trong ngành và tham gia cộng đồng học viên sôi động.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link to="/courses">
                    Khám phá khóa học <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div>
              <img src="https://placehold.co/600x400/4F46E5/FFFFFF?text=Illustration" alt="Learning illustration" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      {/* Featured Courses Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-cognita-slate dark:text-white">Khóa học nổi bật</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Các khóa học được chọn lọc kỹ lưỡng bởi chuyên gia để giúp bạn bắt đầu hành trình học tập.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải khóa học...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Courses Grid */}
          {!loading && !error && featuredCourses.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/courses">Xem tất cả khóa học</Link>
                </Button>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && featuredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có khóa học nào</p>
            </div>
          )}
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="bg-white dark:bg-cognita-slate/50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-cognita-slate dark:text-white">Học viên nói gì về chúng tôi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn học viên hạnh phúc đã thay đổi sự nghiệp của họ với Cognita.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-background">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={review.avatar} alt={review.author} />
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground mb-4 flex-grow">"{review.comment}"</p>
                  <div className="font-semibold text-foreground">{review.author}</div>
                  <StarRating rating={review.rating} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
export default HomePage;