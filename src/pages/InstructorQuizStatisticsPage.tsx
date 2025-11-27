import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  BarChart3,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { quizAttemptApi, QuizAttemptResponse, instructorCourseApi, CourseResponse } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Statistics Summary Card
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = 'default'
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) => {
  const variantClasses = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-amber-600',
    destructive: 'text-red-600'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const InstructorQuizStatisticsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizAttemptResponse[]>([]);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('attemptedAt');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const itemsPerPage = 10;

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  const fetchData = async () => {
    if (!courseId || !token) {
      console.log('Missing courseId or token:', { courseId, hasToken: !!token });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching quiz statistics for course:', courseId);
      
      // Fetch attempts and course info in parallel
      const [attemptsData, coursesData] = await Promise.all([
        quizAttemptApi.getAttemptsByCourseId(courseId, token),
        instructorCourseApi.getMyCourses(token, { limit: 100 })
      ]);
      
      console.log('Attempts data received:', attemptsData);
      console.log('Attempts count:', attemptsData.length);
      
      setAttempts(attemptsData);
      
      // Find the course from instructor's courses
      const foundCourse = coursesData.courses.find(c => c._id === courseId);
      setCourse(foundCourse || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê quiz');
      console.error('Error fetching quiz statistics:', err);
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
      fetchData();
    }
  }, [token, courseId]);

  // Calculate statistics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const failedAttempts = totalAttempts - passedAttempts;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) 
    : 0;
  const uniqueStudents = new Set(attempts.map(a => a.userId)).size;

  // Filter and sort attempts
  const filteredAttempts = attempts.filter(attempt => {
    if (filterStatus === 'passed') return attempt.passed;
    if (filterStatus === 'failed') return !attempt.passed;
    return true;
  });

  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    if (sortBy === 'attemptedAt') {
      return new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime();
    }
    if (sortBy === 'score') {
      return b.score - a.score;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAttempts.length / itemsPerPage);
  const paginatedAttempts = sortedAttempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, sortBy]);

  // Export functions
  const formatDateForExport = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportCSV = () => {
    if (attempts.length === 0) return;

    // CSV headers
    const headers = [
      'STT',
      'Tên học viên',
      'Email',
      'Điểm (%)',
      'Câu đúng',
      'Tổng câu hỏi',
      'Trạng thái',
      'Thời gian làm bài'
    ];

    // CSV rows
    const rows = sortedAttempts.map((attempt, index) => [
      index + 1,
      attempt.user?.name || `User ${attempt.userId.slice(-6)}`,
      attempt.user?.email || '',
      attempt.score,
      attempt.correctAnswers,
      attempt.totalQuestions,
      attempt.passed ? 'Đạt' : 'Chưa đạt',
      formatDateForExport(attempt.attemptedAt)
    ]);

    // Add summary row
    rows.push([]);
    rows.push(['THỐNG KÊ TỔNG QUAN']);
    rows.push(['Tổng lượt làm bài', totalAttempts]);
    rows.push(['Số học viên tham gia', uniqueStudents]);
    rows.push(['Số lượt đạt', passedAttempts]);
    rows.push(['Số lượt chưa đạt', failedAttempts]);
    rows.push(['Tỷ lệ đạt (%)', passRate]);
    rows.push(['Điểm trung bình (%)', averageScore]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Add BOM for UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thong-ke-quiz-${course?.title || 'course'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (attempts.length === 0) return;

    // Create HTML table for Excel
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Thống kê Quiz</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #4472C4; color: white; font-weight: bold; }
          .passed { background-color: #C6EFCE; color: #006100; }
          .failed { background-color: #FFC7CE; color: #9C0006; }
          .summary-header { background-color: #FFC000; font-weight: bold; }
          .summary-value { background-color: #FFEB9C; }
        </style>
      </head>
      <body>
        <h2>Thống kê bài tập Quiz - ${course?.title || 'Khóa học'}</h2>
        <p>Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
        
        <h3>Chi tiết lượt làm bài</h3>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên học viên</th>
              <th>Email</th>
              <th>Điểm (%)</th>
              <th>Câu đúng</th>
              <th>Tổng câu hỏi</th>
              <th>Trạng thái</th>
              <th>Thời gian làm bài</th>
            </tr>
          </thead>
          <tbody>
    `;

    sortedAttempts.forEach((attempt, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${attempt.user?.name || `User ${attempt.userId.slice(-6)}`}</td>
          <td>${attempt.user?.email || ''}</td>
          <td>${attempt.score}</td>
          <td>${attempt.correctAnswers}</td>
          <td>${attempt.totalQuestions}</td>
          <td class="${attempt.passed ? 'passed' : 'failed'}">${attempt.passed ? 'Đạt' : 'Chưa đạt'}</td>
          <td>${formatDateForExport(attempt.attemptedAt)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        
        <br/><br/>
        <h3>Thống kê tổng quan</h3>
        <table>
          <tr><td class="summary-header">Tổng lượt làm bài</td><td class="summary-value">${totalAttempts}</td></tr>
          <tr><td class="summary-header">Số học viên tham gia</td><td class="summary-value">${uniqueStudents}</td></tr>
          <tr><td class="summary-header">Số lượt đạt</td><td class="summary-value">${passedAttempts}</td></tr>
          <tr><td class="summary-header">Số lượt chưa đạt</td><td class="summary-value">${failedAttempts}</td></tr>
          <tr><td class="summary-header">Tỷ lệ đạt (%)</td><td class="summary-value">${passRate}%</td></tr>
          <tr><td class="summary-header">Điểm trung bình (%)</td><td class="summary-value">${averageScore}%</td></tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thong-ke-quiz-${course?.title || 'course'}-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải thống kê quiz...</span>
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
            onClick={() => navigate('/instructor/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/courses')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Thống kê bài tập Quiz
            </h1>
            <p className="text-muted-foreground">{course?.title || 'Khóa học'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={attempts.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={attempts.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </Button>
          </div>
          {course?.imageUrl && (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-16 h-12 object-cover rounded hidden sm:block"
            />
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Tổng lượt làm bài"
            value={totalAttempts}
            icon={BarChart3}
            description="Tất cả lượt làm quiz"
          />
          <StatCard
            title="Học viên tham gia"
            value={uniqueStudents}
            icon={Users}
            description="Số học viên đã làm quiz"
          />
          <StatCard
            title="Đã đạt"
            value={passedAttempts}
            icon={CheckCircle2}
            variant="success"
            description={`${passRate}% tỷ lệ đạt`}
          />
          <StatCard
            title="Chưa đạt"
            value={failedAttempts}
            icon={XCircle}
            variant="destructive"
          />
          <StatCard
            title="Điểm trung bình"
            value={`${averageScore}%`}
            icon={TrendingUp}
            variant={averageScore >= 70 ? 'success' : averageScore >= 50 ? 'warning' : 'destructive'}
          />
        </div>

        {/* Pass Rate Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Tỷ lệ đạt tổng quan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={passRate} className="flex-1 h-4" />
              <span className="text-lg font-bold min-w-[60px] text-right">{passRate}%</span>
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{passedAttempts} đạt</span>
              <span>{failedAttempts} chưa đạt</span>
            </div>
          </CardContent>
        </Card>

        {/* Attempts Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Chi tiết lượt làm bài
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="passed">Đã đạt</SelectItem>
                    <SelectItem value="failed">Chưa đạt</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attemptedAt">Thời gian</SelectItem>
                    <SelectItem value="score">Điểm số</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedAttempts.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học viên</TableHead>
                      <TableHead className="text-center">Điểm</TableHead>
                      <TableHead className="text-center">Câu đúng</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAttempts.map((attempt) => (
                      <TableRow key={attempt._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {attempt.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {attempt.user?.name || `User ${attempt.userId.slice(-6)}`}
                              </p>
                              {attempt.user?.email && (
                                <p className="text-xs text-muted-foreground">
                                  {attempt.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${
                            attempt.score >= 70 ? 'text-green-600' : 
                            attempt.score >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {attempt.score}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                            {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(attempt.attemptedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
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
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Chưa có lượt làm bài nào</h3>
                <p className="text-muted-foreground mt-1">
                  {filterStatus !== 'all' 
                    ? 'Không có kết quả phù hợp với bộ lọc'
                    : 'Học viên chưa làm bài quiz nào trong khóa học này'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InstructorQuizStatisticsPage;
