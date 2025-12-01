import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Star, Clock, BarChart, User, Send, Loader2, ChevronDown, ChevronUp, PlayCircle, FileText, Paperclip, HelpCircle, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
import { courseApi, CourseResponse, enrollmentApi, courseReviewApi, CourseReviewResponse, CourseCurriculumSection, quizApi, Quiz, QuizQuestion } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [isEnrolledInCourse, setIsEnrolledInCourse] = useState(false);
  const [reviews, setReviews] = useState<CourseReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [curriculum, setCurriculum] = useState<CourseCurriculumSection[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [quizQuestions, setQuizQuestions] = useState<Record<string, QuizQuestion[]>>({});

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await courseApi.getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin khóa học');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setLoadingReviews(true);
        const data = await courseReviewApi.getCourseReviews(id, { limit: 50 });
        setReviews(data.reviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Fetch curriculum when user is enrolled
  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!id || !isEnrolledInCourse) return;

      try {
        setLoadingCurriculum(true);
        const data = await courseApi.getCourseCurriculum(id);
        setCurriculum(data);
        // Expand first section by default
        if (data.length > 0 && data[0]._id) {
          setExpandedSections(new Set([data[0]._id]));
        }
      } catch (err) {
        console.error('Error fetching curriculum:', err);
      } finally {
        setLoadingCurriculum(false);
      }
    };

    fetchCurriculum();
  }, [id, isEnrolledInCourse]);

  // Fetch quizzes when user is enrolled
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!id || !isEnrolledInCourse) return;

      try {
        setLoadingQuizzes(true);
        const data = await quizApi.getQuizzesByCourseId(id);
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [id, isEnrolledInCourse]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!id || !isAuthenticated || !token) {
        setIsEnrolledInCourse(false);
        return;
      }

      try {
        setCheckingEnrollment(true);
        const enrollment = await enrollmentApi.getMyEnrollmentByCourse(id, token);
        setIsEnrolledInCourse(!!enrollment);
      } catch (err) {
        console.error('Error checking enrollment:', err);
        setIsEnrolledInCourse(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [id, isAuthenticated, token]);

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

  if (error || !course) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Không tìm thấy khóa học.'}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!id || !token) return;

    // If course has a price > 0, redirect to checkout page
    if (course && course.price > 0) {
      navigate(`/checkout/${id}`);
      return;
    }

    // Free course - enroll directly
    try {
      setEnrolling(true);
      await enrollmentApi.enrollCourse(id, token);
      setIsEnrolledInCourse(true);
      toast.success(`Đăng ký thành công khóa học "${course?.title}"!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đăng ký khóa học';
      toast.error(errorMessage);
      console.error('Error enrolling course:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !user || !id || !token) return;

    try {
      setSubmittingReview(true);
      const newReview = await courseReviewApi.createReview(
        {
          courseId: id,
          rating,
          comment: reviewText,
        },
        token
      );
      
      // Add new review to the list
      setReviews([newReview, ...reviews]);
      setReviewText('');
      setRating(5);
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi đánh giá';
      toast.error(errorMessage);
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleQuiz = async (quizId: string) => {
    setExpandedQuizzes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
        // Fetch questions if not already loaded
        if (!quizQuestions[quizId]) {
          fetchQuizQuestions(quizId);
        }
      }
      return newSet;
    });
  };

  const fetchQuizQuestions = async (quizId: string) => {
    try {
      const questions = await quizApi.getQuestionsByQuizId(quizId);
      setQuizQuestions(prev => ({
        ...prev,
        [quizId]: questions
      }));
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
      toast.error('Không thể tải câu hỏi');
    }
  };

  const StarRatingDisplay = ({ rating, totalReviews }: { rating: number, totalReviews?: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        ))}
      </div>
      {totalReviews !== undefined && <span className="text-muted-foreground text-sm">({totalReviews} đánh giá)</span>}
    </div>
  );

  return (
    <MainLayout>
      <Toaster richColors />
      <section className="bg-cognita-slate text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold font-display">{course.title}</h1>
              <p className="text-lg text-slate-300">{course.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-400">{course.rating}</span>
                  <StarRatingDisplay rating={course.rating} />
                </div>
                <span>({course.ratingCount} đánh giá)</span>
                <span>{course.studentCount.toLocaleString()} học viên</span>
              </div>
              <p>Được tạo bởi <span className="font-semibold">{course.instructor?.name || 'Unknown'}</span></p>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Thông tin khóa học</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span><strong>Thời lượng:</strong> {course.totalDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-primary" />
                    <span><strong>Cấp độ:</strong> {course.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <span><strong>Số bài giảng:</strong> {course.lectureCount} bài</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {isEnrolledInCourse && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
                  {loadingCurriculum ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Đang tải nội dung...</span>
                    </div>
                  ) : curriculum.length > 0 ? (
                    <div className="space-y-4">
                      {curriculum.map((section) => (
                        <div key={section._id} className="border rounded-lg">
                          <button
                            onClick={() => section._id && toggleSection(section._id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                          >
                            <h3 className="font-semibold text-left">{section.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {section.lectures.length} bài học
                              </span>
                              {section._id && expandedSections.has(section._id) ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </button>
                          {section._id && expandedSections.has(section._id) && (
                            <div className="border-t">
                              {section.lectures.map((lecture) => (
                                <button
                                  key={lecture._id}
                                  onClick={() => navigate(`/courses/${id}/lessons/${lecture._id}`)}
                                  className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors border-b last:border-b-0 cursor-pointer"
                                >
                                  {lecture.type === 'video' && (
                                    <PlayCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                  )}
                                  {lecture.type === 'text' && (
                                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                  )}
                                  {lecture.type === 'attachment' && (
                                    <Paperclip className="w-5 h-5 text-primary flex-shrink-0" />
                                  )}
                                  <div className="flex-1 text-left">
                                    <p className="font-medium">{lecture.title}</p>
                                    <p className="text-sm text-primary">
                                      {lecture.type === 'video' ? 'Xem video' : 
                                       lecture.type === 'text' ? 'Đọc bài học' : 
                                       'Xem tài liệu'}
                                    </p>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {lecture.duration}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có nội dung nào cho khóa học này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Về giảng viên</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={course.instructor?.avatarUrl} />
                    <AvatarFallback>{course.instructor?.name.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{course.instructor?.name || 'Unknown'}</h3>
                    <p className="text-muted-foreground">{course.instructor?.email}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Một nhà giáo dục đầy đam mê với hơn 10 năm kinh nghiệm trong lĩnh vực, tận tâm làm cho việc học trở nên dễ tiếp cận và thú vị cho mọi người.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Đánh giá của học viên</h2>
                {isEnrolledInCourse && (
                  <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border rounded-lg bg-background">
                    <h3 className="text-lg font-semibold mb-2">Để lại đánh giá</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Đánh giá</Label>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-6 h-6 cursor-pointer ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} onClick={() => setRating(i + 1)} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-text">Nhận xét của bạn</Label>
                        <Textarea id="review-text" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Chia sẻ suy nghĩ của bạn về khóa học..." required />
                      </div>
                      <Button type="submit" className="w-full sm:w-auto" disabled={!reviewText.trim() || submittingReview}>
                        {submittingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Gửi đánh giá
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
                <div className="space-y-6">
                  {loadingReviews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review._id} className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                            <p className="font-semibold">{review.userName}</p>
                            <StarRatingDisplay rating={review.rating} />
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có đánh giá nào cho khóa học này.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className="w-full h-auto object-cover" />
                <CardContent className="p-6 space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                  </div>
                  {isEnrolledInCourse ? (
                    <Button size="lg" className="w-full" asChild>
                      <Link to="/dashboard">Đi tới Bảng điều khiển</Link>
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={enrolling || checkingEnrollment}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đăng ký...
                        </>
                      ) : (
                        'Đăng ký ngay'
                      )}
                    </Button>
                  )}
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{course.totalDuration} video theo yêu cầu</span></li>
                    <li className="flex items-center gap-2"><BarChart className="w-4 h-4" /><span>Cấp độ: {course.level}</span></li>
                    <li className="flex items-center gap-2"><User className="w-4 h-4" /><span>Truy cập trọn đời</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default CourseDetailPage;