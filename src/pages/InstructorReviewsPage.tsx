import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { courseReviewApi, InstructorReviewStats } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Star Rating Display Component
const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Rating Distribution Bar
const RatingBar = ({ 
  stars, 
  count, 
  total 
}: { 
  stars: number; 
  count: number; 
  total: number;
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-12">
        <span className="text-sm font-medium">{stars}</span>
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      </div>
      <Progress value={percentage} className="flex-1 h-2" />
      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
    </div>
  );
};

const InstructorReviewsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InstructorReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (!isAuthenticated || !user?.isInstructor) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await courseReviewApi.getInstructorStats(token);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thống kê đánh giá');
        console.error('Error fetching review stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user, token, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải thống kê...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (!stats) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertDescription>Không có dữ liệu thống kê.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Thống kê đánh giá</h1>
            <p className="text-muted-foreground">Xem tổng quan đánh giá từ học viên</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
                  <p className="text-2xl font-bold">{stats.overallAverageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khóa học</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá 5 sao</p>
                  <p className="text-2xl font-bold">{stats.ratingDistribution[5]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Phân bố đánh giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-bold">{stats.overallAverageRating.toFixed(1)}</p>
                  <StarRating rating={stats.overallAverageRating} size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalReviews} đánh giá
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <RatingBar
                    key={stars}
                    stars={stars}
                    count={stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution]}
                    total={stats.totalReviews}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Đánh giá gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentReviews.map((review) => (
                    <div key={review._id} className="flex gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">{review.courseTitle}</p>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có đánh giá nào.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Per Course Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Đánh giá theo khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.courseStats.length > 0 ? (
              <div className="space-y-4">
                {stats.courseStats.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/instructor/courses/${course.courseId}/reviews`)}
                  >
                    <img
                      src={course.courseImage || '/placeholder-course.jpg'}
                      alt={course.courseTitle}
                      className="w-20 h-14 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {course.totalReviews} đánh giá
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="text-center">
                          <p className="text-xs text-muted-foreground">{star}★</p>
                          <p className="text-sm font-medium">
                            {course.ratingDistribution[star as keyof typeof course.ratingDistribution]}
                          </p>
                        </div>
                      ))}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có khóa học nào được đánh giá.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InstructorReviewsPage;
