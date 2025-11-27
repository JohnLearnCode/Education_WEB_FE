import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Star, 
  MessageSquare, 
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { courseReviewApi, CourseReviewStats, CourseReviewResponse } from '@/lib/api';
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

interface CourseReviewData extends CourseReviewStats {
  reviews: CourseReviewResponse[];
  page: number;
  totalPages: number;
}

const InstructorCourseReviewsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CourseReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  const fetchReviews = async (page: number = 1) => {
    if (!courseId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const result = await courseReviewApi.getInstructorCourseReviews(
        courseId,
        token,
        { page, limit: 10, sortBy, sortOrder }
      );
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đánh giá');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.isInstructor) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.isInstructor && token && courseId) {
      fetchReviews(1);
    }
  }, [token, courseId, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      fetchReviews(newPage);
    }
  };

  if (loading && !data) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải đánh giá...</span>
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
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/instructor/reviews')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertDescription>Không có dữ liệu.</AlertDescription>
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/reviews')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Đánh giá khóa học</h1>
            <p className="text-muted-foreground">{data.courseTitle}</p>
          </div>
          <img
            src={data.courseImage || '/placeholder-course.jpg'}
            alt={data.courseTitle}
            className="w-16 h-12 object-cover rounded hidden sm:block"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Tổng quan đánh giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-5xl font-bold">{data.averageRating.toFixed(1)}</p>
                <StarRating rating={data.averageRating} size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  {data.totalReviews} đánh giá
                </p>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <RatingBar
                    key={stars}
                    stars={stars}
                    count={data.ratingDistribution[stars as keyof typeof data.ratingDistribution]}
                    total={data.totalReviews}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Danh sách đánh giá
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Thời gian</SelectItem>
                      <SelectItem value="rating">Đánh giá</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Thứ tự" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Mới nhất</SelectItem>
                      <SelectItem value="asc">Cũ nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : data.reviews.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {data.reviews.map((review) => (
                      <div key={review._id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.userName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <StarRating rating={review.rating} />
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Trang {currentPage} / {data.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có đánh giá nào cho khóa học này.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default InstructorCourseReviewsPage;
