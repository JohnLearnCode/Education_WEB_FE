import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  Paperclip, 
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Home,
  BookOpen,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { courseApi, CourseResponse, CourseCurriculumSection, CourseLecture, quizApi, Quiz, QuizQuestion, Answer, enrollmentApi, quizAttemptApi, QuizResultSummary } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import MDEditor from '@uiw/react-md-editor';

const LessonViewPage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [curriculum, setCurriculum] = useState<CourseCurriculumSection[]>([]);
  const [currentLecture, setCurrentLecture] = useState<CourseLecture | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({}); // questionId -> selectedAnswerIds
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const token = useAuthStore(state => state.token);

  // Fetch completed lectures from enrollment
  useEffect(() => {
    const fetchCompletedLectures = async () => {
      if (!courseId || !token) return;

      try {
        const enrollment = await enrollmentApi.getMyEnrollmentByCourse(courseId, token);
        if (enrollment && enrollment.completedLectures) {
          setCompletedLectures(new Set(enrollment.completedLectures));
        }
      } catch (error) {
        console.error('Error fetching completed lectures:', error);
      }
    };

    fetchCompletedLectures();
  }, [courseId, token]);

  // Fetch course and curriculum (only once when courseId changes)
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const courseData = await courseApi.getCourseById(courseId);
        setCourse(courseData);

        // Fetch curriculum
        const curriculumData = await courseApi.getCourseCurriculum(courseId);
        setCurriculum(curriculumData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Update current lecture when lectureId changes (or when curriculum loads)
  useEffect(() => {
    const updateCurrentLecture = () => {
      if (!lectureId || curriculum.length === 0) return;

      let foundLecture: CourseLecture | null = null;
      let foundSectionId: string | null = null;

      for (const section of curriculum) {
        const lecture = section.lectures.find(l => l._id === lectureId);
        if (lecture) {
          foundLecture = lecture;
          foundSectionId = section._id || null;
          break;
        }
      }

      if (foundLecture) {
        setCurrentLecture(foundLecture);
        setCurrentSectionId(foundSectionId);
        // Expand the section containing current lecture
        if (foundSectionId) {
          setExpandedSections(prev => new Set([...prev, foundSectionId]));
        }
      } else {
        setError('Không tìm thấy bài học');
      }
    };

    updateCurrentLecture();
  }, [lectureId, curriculum]);

  // Set first lecture if no lectureId provided
  useEffect(() => {
    if (!lectureId && curriculum.length > 0 && curriculum[0].lectures.length > 0) {
      const firstLecture = curriculum[0].lectures[0];
      setCurrentLecture(firstLecture);
      setCurrentSectionId(curriculum[0]._id || null);
      if (curriculum[0]._id) {
        setExpandedSections(new Set([curriculum[0]._id]));
      }
    }
  }, [lectureId, curriculum]);

  // Fetch quiz for current lecture
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!lectureId) return;

      try {
        setLoadingQuiz(true);
        setQuiz(null);
        setQuizQuestions([]);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizScore(0);

        const quizData = await quizApi.getQuizByLectureId(lectureId);
        
        if (quizData && quizData._id) {
          setQuiz(quizData);
          // Fetch questions for this quiz
          const questions = await quizApi.getQuestionsByQuizId(quizData._id);
          setQuizQuestions(questions);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        // Don't show error if quiz doesn't exist
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [lectureId]);

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

  const handleLectureClick = (lecture: CourseLecture) => {
    navigate(`/courses/${courseId}/lessons/${lecture._id}`);
  };

  const markAsCompleted = async () => {
    if (!currentLecture?._id || !token) return;
    
    try {
      setMarkingComplete(true);
      
      // Call API to mark lecture as completed
      await enrollmentApi.markLectureCompleted(currentLecture._id, token);
      
      // Update local state
      setCompletedLectures(prev => new Set([...prev, currentLecture._id!]));
      
      console.log('Lecture marked as completed:', currentLecture._id);
    } catch (error) {
      console.error('Error marking lecture as completed:', error);
      // Still update local state even if API fails
      setCompletedLectures(prev => new Set([...prev, currentLecture._id!]));
    } finally {
      setMarkingComplete(false);
    }
  };

  const getNextLecture = (): CourseLecture | null => {
    if (!currentLecture || !currentSectionId) return null;

    for (let i = 0; i < curriculum.length; i++) {
      const section = curriculum[i];
      if (section._id === currentSectionId) {
        const currentIndex = section.lectures.findIndex(l => l._id === currentLecture._id);
        
        // Next lecture in same section
        if (currentIndex < section.lectures.length - 1) {
          return section.lectures[currentIndex + 1];
        }
        
        // First lecture of next section
        if (i < curriculum.length - 1 && curriculum[i + 1].lectures.length > 0) {
          return curriculum[i + 1].lectures[0];
        }
      }
    }
    return null;
  };

  const getPreviousLecture = (): CourseLecture | null => {
    if (!currentLecture || !currentSectionId) return null;

    for (let i = 0; i < curriculum.length; i++) {
      const section = curriculum[i];
      if (section._id === currentSectionId) {
        const currentIndex = section.lectures.findIndex(l => l._id === currentLecture._id);
        
        // Previous lecture in same section
        if (currentIndex > 0) {
          return section.lectures[currentIndex - 1];
        }
        
        // Last lecture of previous section
        if (i > 0 && curriculum[i - 1].lectures.length > 0) {
          const prevSection = curriculum[i - 1];
          return prevSection.lectures[prevSection.lectures.length - 1];
        }
      }
    }
    return null;
  };

  const handleNext = () => {
    const nextLecture = getNextLecture();
    if (nextLecture) {
      markAsCompleted();
      handleLectureClick(nextLecture);
    }
  };

  const handlePrevious = () => {
    const prevLecture = getPreviousLecture();
    if (prevLecture) {
      handleLectureClick(prevLecture);
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string, isMultiple: boolean) => {
    if (showResults) return; // Don't allow changes after submission
    
    setSelectedAnswers(prev => {
      const currentSelected = prev[questionId] || [];
      
      if (isMultiple) {
        // Multiple choice - toggle selection
        if (currentSelected.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentSelected.filter(id => id !== answerId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelected, answerId]
          };
        }
      } else {
        // Single choice - replace selection
        return {
          ...prev,
          [questionId]: [answerId]
        };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (quizQuestions.length === 0 || !quiz?._id || !token) return;

    try {
      // Prepare answers for submission
      const answers = quizQuestions.map(question => ({
        questionId: question._id!,
        selectedAnswerIds: selectedAnswers[question._id!] || []
      }));

      console.log('🚀 Submitting quiz:', { quizId: quiz._id, answers });

      // Call quiz attempt API
      const result = await quizAttemptApi.submitQuizAttempt({ quizId: quiz._id, answers }, token);
      
      console.log('📊 Quiz result:', result);
      
      setQuizScore(result.score);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setQuizScore(0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải bài học...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !course || !currentLecture) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Không tìm thấy bài học.'}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>
            Quay lại khóa học
          </Button>
        </div>
      </MainLayout>
    );
  }

  const nextLecture = getNextLecture();
  const prevLecture = getPreviousLecture();

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-lg font-semibold line-clamp-1">{course.title}</h1>
                  <p className="text-sm text-muted-foreground line-clamp-1">{currentLecture.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">
                    <Home className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <Card>
                <CardContent className="p-0">
                  {currentLecture.type === 'video' && currentLecture.videoUrl ? (
                    <div className="aspect-video bg-black">
                      <video
                        key={currentLecture._id}
                        controls
                        className="w-full h-full"
                        onEnded={markAsCompleted}
                      >
                        <source src={currentLecture.videoUrl} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    </div>
                  ) : currentLecture.type === 'text' ? (
                    <div className="p-8 bg-white min-h-[300px]" data-color-mode="light">
                      <h1 className="text-2xl font-bold mb-6">{currentLecture.title}</h1>
                      {currentLecture.textContent ? (
                        <div className="prose max-w-none">
                          <MDEditor.Markdown 
                            source={currentLecture.textContent} 
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Không có nội dung.</p>
                      )}
                    </div>
                  ) : currentLecture.type === 'attachment' ? (
                    (() => {
                      const url = currentLecture.attachmentUrl || '';
                      const isPdf = url.toLowerCase().includes('.pdf');
                      const isWord = url.toLowerCase().includes('.doc');
                      
                      // Extract filename from URL
                      const getFilename = () => {
                        const urlParts = url.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        return filename || `${currentLecture.title}${isPdf ? '.pdf' : isWord ? '.docx' : ''}`;
                      };
                      
                      // Download handler for cross-origin files
                      const handleDownload = async () => {
                        try {
                          const response = await fetch(url);
                          const blob = await response.blob();
                          const blobUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = blobUrl;
                          link.download = getFilename();
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(blobUrl);
                        } catch {
                          window.open(url, '_blank');
                        }
                      };
                      
                      return (
                        <div className="bg-white">
                          <div className="p-4 border-b flex items-center justify-between">
                            <h1 className="text-xl font-bold">{currentLecture.title}</h1>
                            {url && (
                              <Button variant="outline" size="sm" onClick={handleDownload}>
                                <FileText className="w-4 h-4 mr-2" />
                                Tải xuống {isPdf ? 'PDF' : isWord ? 'Word' : ''}
                              </Button>
                            )}
                          </div>
                          {url && (
                            isPdf ? (
                              <iframe
                                src={`${url}#toolbar=1&navpanes=0`}
                                className="w-full h-[600px] border-0"
                                title={currentLecture.title}
                              />
                            ) : isWord ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                className="w-full h-[600px] border-0"
                                title={currentLecture.title}
                              />
                            ) : (
                              <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center bg-muted">
                                <Paperclip className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">Không thể xem trước file này</p>
                                <Button onClick={handleDownload}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Tải xuống tài liệu
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <div className="text-center p-8">
                        <Paperclip className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Tài liệu đính kèm</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lesson Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Only show title for video lessons (text and attachment show title above) */}
                      {currentLecture.type === 'video' && (
                        <h2 className="text-2xl font-bold mb-2">{currentLecture.title}</h2>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Thời gian học ước tính: {currentLecture.duration}
                        </span>
                        {completedLectures.has(currentLecture._id!) && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                    </div>
                    {!completedLectures.has(currentLecture._id!) && (
                      <Button onClick={markAsCompleted} variant="outline" size="sm" disabled={markingComplete}>
                        {markingComplete ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Đánh dấu hoàn thành
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Section */}
              {quiz && quizQuestions.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <HelpCircle className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold">{quiz.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>⏱️ {quiz.timeLimit} phút</span>
                          <span>✅ Điểm đạt: {quiz.passingScore}%</span>
                          <span>📝 {quizQuestions.length} câu hỏi</span>
                        </div>
                      </div>
                    </div>

                    {showResults && (
                      <Alert className={`mb-6 ${quizScore >= quiz.passingScore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-lg">
                                Điểm của bạn: {quizScore}%
                              </p>
                              <p className="text-sm">
                                {quizScore >= quiz.passingScore 
                                  ? '🎉 Chúc mừng! Bạn đã đạt yêu cầu.' 
                                  : '😔 Bạn chưa đạt yêu cầu. Hãy thử lại!'}
                              </p>
                            </div>
                            <Button onClick={handleResetQuiz} variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Làm lại
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-6">
                      {quizQuestions.map((question, qIndex) => {
                        // Use requiredAnswers from backend to determine if multiple selection
                        const isMultipleAnswer = question.requiredAnswers > 1;
                        const questionSelected = selectedAnswers[question._id!] || [];
                        const hasReachedLimit = questionSelected.length >= question.requiredAnswers;
                        
                        return (
                          <div key={question._id} className="border rounded-lg p-4">
                            <div className="flex gap-2 mb-4">
                              <span className="font-semibold text-primary">Câu {qIndex + 1}:</span>
                              <div className="flex-1">
                                <p className="font-medium">{question.questionText}</p>
                                {question.requiredAnswers > 1 ? (
                                  <span className="text-xs text-muted-foreground">
                                    (Chọn {question.requiredAnswers} đáp án - đã chọn {questionSelected.length})
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">(Chọn 1 đáp án)</span>
                                )}
                              </div>
                            </div>
                            {question.imageUrl && (
                              <div className="mb-4 ml-6">
                                <img src={question.imageUrl} alt="Question" className="max-w-md rounded-lg" />
                              </div>
                            )}
                            <div className="space-y-2 ml-6">
                              {question.answers?.map((answer, optIndex) => {
                                const isSelected = questionSelected.includes(answer._id!);
                                // Disable if reached limit and this answer is not selected
                                const isDisabled = showResults || (hasReachedLimit && !isSelected);

                                return (
                                  <button
                                    key={answer._id}
                                    onClick={() => handleAnswerSelect(question._id!, answer._id!, isMultipleAnswer || false)}
                                    disabled={isDisabled}
                                    className={`w-full text-left flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : isDisabled
                                        ? 'bg-muted/50 border-border opacity-50 cursor-not-allowed'
                                        : 'bg-background border-border hover:border-primary/50'
                                    } ${showResults ? 'cursor-default' : isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                  >
                                    <div className={`w-5 h-5 ${isMultipleAnswer ? 'rounded' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 ${
                                      isSelected
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground'
                                    }`}>
                                      {isSelected && (
                                        <div className={`${isMultipleAnswer ? 'w-3 h-3' : 'w-2 h-2'} ${isMultipleAnswer ? 'rounded-sm' : 'rounded-full'} bg-white`} />
                                      )}
                                    </div>
                                    <span className="font-medium text-sm">{String.fromCharCode(65 + optIndex)}.</span>
                                    <span className="flex-1">{answer.text}</span>
                                    {answer.imageUrl && (
                                      <img src={answer.imageUrl} alt="Answer" className="w-16 h-16 object-cover rounded" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!showResults && (
                      <div className="mt-6 flex justify-center">
                        <Button 
                          onClick={handleSubmitQuiz}
                          disabled={quizQuestions.some(q => {
                            const selected = selectedAnswers[q._id!] || [];
                            return selected.length !== q.requiredAnswers;
                          })}
                          size="lg"
                        >
                          Nộp bài
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {loadingQuiz && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Đang tải bài tập...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!prevLecture}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Bài trước
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!nextLecture}
                >
                  Bài tiếp theo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Curriculum Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Nội dung khóa học</h3>
                  <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {curriculum.map((section) => (
                      <div key={section._id} className="border rounded-lg">
                        <button
                          onClick={() => section._id && toggleSection(section._id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors rounded-t-lg"
                        >
                          <h4 className="font-medium text-sm text-left">{section.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {section.lectures.length}
                            </span>
                            {section._id && expandedSections.has(section._id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        {section._id && expandedSections.has(section._id) && (
                          <div className="border-t">
                            {section.lectures.map((lecture) => (
                              <button
                                key={lecture._id}
                                onClick={() => handleLectureClick(lecture)}
                                className={`w-full flex items-center gap-2 p-3 hover:bg-accent/50 transition-colors border-b last:border-b-0 text-left ${
                                  currentLecture._id === lecture._id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {completedLectures.has(lecture._id!) ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : lecture.type === 'video' ? (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                  ) : lecture.type === 'text' ? (
                                    <FileText className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Paperclip className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{lecture.title}</p>
                                  <p className="text-xs text-muted-foreground">{lecture.duration}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LessonViewPage;
