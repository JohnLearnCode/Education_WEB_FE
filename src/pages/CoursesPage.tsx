import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { courseApi, CourseResponse } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CoursesPage = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const levels = [
    { value: 'all', label: 'Tất cả cấp độ', color: 'bg-gray-400' },
    { value: 'beginner', label: 'Beginner (Cơ bản)', color: 'bg-green-500' },
    { value: 'intermediate', label: 'Intermediate (Trung cấp)', color: 'bg-yellow-500' },
    { value: 'advanced', label: 'Advanced (Nâng cao)', color: 'bg-red-500' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page,
          limit,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (level !== 'all') params.level = level;
        
        const response = await courseApi.getAllCourses(params);
        setCourses(response.courses);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, searchTerm, level]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-cognita-slate dark:text-white">
            Khóa học của chúng tôi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Duyệt qua danh mục khóa học phong phú được thiết kế để giúp bạn thành thạo các kỹ năng mới.
          </p>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              Tìm thấy <strong>{total}</strong> khóa học
            </p>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-lg border p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select 
              value={level} 
              onValueChange={(value) => {
                setLevel(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Lọc theo cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Tất cả cấp độ
                  </span>
                </SelectItem>
                <SelectItem value="beginner">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Beginner (Cơ bản)
                  </span>
                </SelectItem>
                <SelectItem value="intermediate">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Intermediate (Trung cấp)
                  </span>
                </SelectItem>
                <SelectItem value="advanced">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Advanced (Nâng cao)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || level !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
              {searchTerm && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>"{searchTerm}"</span>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="ml-1 hover:text-primary/80"
                  >
                    ×
                  </button>
                </div>
              )}
              {level !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <span>Cấp độ: {levels.find(l => l.value === level)?.label || level}</span>
                  <button
                    onClick={() => {
                      setLevel('all');
                      setPage(1);
                    }}
                    className="ml-1 hover:text-primary/80"
                  >
                    ×
                  </button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setLevel('all');
                  setPage(1);
                }}
                className="text-xs"
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
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
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-foreground">Không tìm thấy khóa học</h3>
            <p className="text-muted-foreground mt-2">
              Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CoursesPage;