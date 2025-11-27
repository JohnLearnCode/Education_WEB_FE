import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { 
  quizApi,
  quizQuestionApi,
  lectureApi,
  Quiz,
  QuizQuestion,
  Lecture,
  QuizType,
} from '@/lib/api';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Clock,
  Target,
  Save,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface AnswerInput {
  text: string;
  isCorrect: boolean;
}

const LectureQuizPage = () => {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz form state
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 70,
    timeLimit: 10,
  });
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Question form state
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    type: QuizType.MULTIPLE_CHOICE as QuizType,
    answers: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ] as AnswerInput[],
  });
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [previewData, setPreviewData] = useState<{
    questions: Array<{
      questionText: string;
      type: string;
      answers: string[];
      correctAnswers: number[];
    }>;
    errors: string[];
  } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'quiz' | 'question'>('question');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    if (!lectureId || !courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch lecture info
      const lectureData = await lectureApi.getLecturesByCourseId(courseId);
      const currentLecture = lectureData.find(l => l._id === lectureId);
      setLecture(currentLecture || null);

      // Fetch quiz for this lecture
      const quizData = await quizApi.getQuizByLectureId(lectureId);
      setQuiz(quizData);

      // If quiz exists, fetch questions
      if (quizData && quizData._id) {
        const questionsData = await quizApi.getQuestionsByQuizIdForInstructor(quizData._id);
        setQuestions(questionsData);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lectureId, courseId]);

  // Quiz handlers
  const handleCreateQuiz = () => {
    setQuizForm({
      title: `Quiz - ${lecture?.title || 'Bài học'}`,
      passingScore: 70,
      timeLimit: 10,
    });
    setQuizDialogOpen(true);
  };

  const handleEditQuiz = () => {
    if (!quiz) return;
    setQuizForm({
      title: quiz.title,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
    });
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!token || !courseId || !lectureId) return;

    try {
      setSavingQuiz(true);
      setError(null);

      if (quiz && quiz._id) {
        // Update existing quiz
        await quizApi.updateQuiz(quiz._id, {
          title: quizForm.title,
          passingScore: quizForm.passingScore,
          timeLimit: quizForm.timeLimit,
        }, token);
      } else {
        // Create new quiz
        await quizApi.createQuiz({
          lectureId,
          courseId,
          title: quizForm.title,
          passingScore: quizForm.passingScore,
          timeLimit: quizForm.timeLimit,
        }, token);
      }

      setQuizDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = () => {
    if (!quiz?._id) return;
    setDeleteType('quiz');
    setDeleteId(quiz._id);
    setDeleteDialogOpen(true);
  };

  // Question handlers
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionText: '',
      type: QuizType.MULTIPLE_CHOICE,
      answers: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    });
    setQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      type: question.type,
      answers: question.answers.map(a => ({
        text: a.text,
        isCorrect: question.correctAnswerIds?.includes(a._id || '') || false,
      })),
    });
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!token || !quiz?._id) return;

    // Validate
    if (!questionForm.questionText.trim()) {
      setError('Vui lòng nhập câu hỏi');
      return;
    }

    const validAnswers = questionForm.answers.filter(a => a.text.trim());
    if (validAnswers.length < 2) {
      setError('Cần ít nhất 2 đáp án');
      return;
    }

    const correctAnswers = questionForm.answers.filter(a => a.isCorrect && a.text.trim());
    if (correctAnswers.length === 0) {
      setError('Cần chọn ít nhất 1 đáp án đúng');
      return;
    }

    try {
      setSavingQuestion(true);
      setError(null);

      // Get indices of correct answers (only from valid answers)
      const correctIndices: number[] = [];
      questionForm.answers.forEach((a, idx) => {
        if (a.isCorrect && a.text.trim()) {
          correctIndices.push(idx);
        }
      });

      await quizQuestionApi.createQuestion({
        quizId: quiz._id,
        questionText: questionForm.questionText.trim(),
        answers: questionForm.answers
          .filter(a => a.text.trim())
          .map(a => ({ text: a.text.trim() })),
        correctAnswerIndices: correctIndices,
        type: questionForm.type,
      }, token);

      setQuestionDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu câu hỏi');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = (question: QuizQuestion) => {
    if (!question._id) return;
    setDeleteType('question');
    setDeleteId(question._id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteId) return;

    try {
      setDeleting(true);
      setError(null);

      if (deleteType === 'quiz') {
        await quizApi.deleteQuiz(deleteId, token);
      } else {
        await quizQuestionApi.deleteQuestion(deleteId, token);
      }

      setDeleteDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa');
    } finally {
      setDeleting(false);
    }
  };

  // Answer handlers
  const handleAnswerChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.map((a, i) => 
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  };

  const addAnswer = () => {
    if (questionForm.answers.length >= 6) return;
    setQuestionForm(prev => ({
      ...prev,
      answers: [...prev.answers, { text: '', isCorrect: false }],
    }));
  };

  const removeAnswer = (index: number) => {
    if (questionForm.answers.length <= 2) return;
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  if (!user?.isInstructor) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertDescription>
              Bạn cần có quyền instructor để truy cập trang này.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/instructor/courses/${courseId}/curriculum`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-cognita-slate dark:text-white">
              Quản lý Quiz
            </h1>
            {lecture && (
              <p className="text-muted-foreground mt-1">{lecture.title}</p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quiz Section */}
        {!quiz ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Chưa có Quiz</h3>
                  <p className="text-muted-foreground mt-1">
                    Tạo quiz để kiểm tra kiến thức học viên sau bài học
                  </p>
                </div>
                <Button onClick={handleCreateQuiz} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quiz Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Điểm đạt: {quiz.passingScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Thời gian: {quiz.timeLimit} phút
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        {questions.length} câu hỏi
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditQuiz}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDeleteQuiz}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Questions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
                  <div className="flex gap-2">
                    {questions.length > 0 && (
                      <Button 
                        onClick={async () => {
                          if (!token || !quiz?._id) return;
                          try {
                            await quizQuestionApi.exportQuestions(quiz._id, token);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Không thể export câu hỏi');
                          }
                        }} 
                        size="sm" 
                        variant="outline"
                        className="gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        // Reset state trước khi mở dialog
                        setImportFile(null);
                        setImportResult(null);
                        setImportStep('upload');
                        setPreviewData(null);
                        setIsDragOver(false);
                        setImportDialogOpen(true);
                      }} 
                      size="sm" 
                      variant="outline"
                      className="gap-1"
                    >
                      <Upload className="w-4 h-4" />
                      Import
                    </Button>
                    <Button onClick={handleAddQuestion} size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Thêm câu hỏi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có câu hỏi nào. Thêm câu hỏi để hoàn thiện quiz.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div 
                        key={question._id} 
                        className="border rounded-lg p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Câu {index + 1}</Badge>
                              <Badge variant="secondary">
                                {question.type === QuizType.MULTIPLE_CHOICE ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}
                              </Badge>
                            </div>
                            <p className="font-medium">{question.questionText}</p>
                            <div className="mt-3 space-y-1">
                              {question.answers.map((answer, aIdx) => (
                                <div 
                                  key={answer._id || aIdx}
                                  className={`flex items-center gap-2 text-sm ${
                                    question.correctAnswerIds?.includes(answer._id || '') 
                                      ? 'text-green-600 font-medium' 
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {question.correctAnswerIds?.includes(answer._id || '') ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border inline-block" />
                                  )}
                                  {answer.text}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
            </DialogTitle>
            <DialogDescription>
              Thiết lập thông tin cơ bản cho quiz
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Tiêu đề Quiz</Label>
              <Input
                id="quizTitle"
                value={quizForm.title}
                onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="VD: Quiz kiểm tra bài 1"
                disabled={savingQuiz}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={0}
                  max={100}
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm(prev => ({ 
                    ...prev, 
                    passingScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  }))}
                  disabled={savingQuiz}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm(prev => ({ 
                    ...prev, 
                    timeLimit: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  disabled={savingQuiz}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuizDialogOpen(false)}
              disabled={savingQuiz}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveQuiz} disabled={savingQuiz || !quizForm.title.trim()}>
              {savingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập nội dung câu hỏi và các đáp án
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="questionText">Câu hỏi *</Label>
              <Textarea
                id="questionText"
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                placeholder="Nhập nội dung câu hỏi..."
                rows={3}
                disabled={savingQuestion}
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label>Loại câu hỏi</Label>
              <Select
                value={questionForm.type}
                onValueChange={(value: QuizType) => 
                  setQuestionForm(prev => ({ ...prev, type: value }))
                }
                disabled={savingQuestion}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuizType.MULTIPLE_CHOICE}>Trắc nghiệm</SelectItem>
                  <SelectItem value={QuizType.FILL_BLANK}>Điền vào chỗ trống</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Answers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Đáp án (chọn đáp án đúng)</Label>
                {questionForm.answers.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAnswer}
                    disabled={savingQuestion}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                )}
              </div>
              {questionForm.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox
                    checked={answer.isCorrect}
                    onCheckedChange={(checked) => 
                      handleAnswerChange(index, 'isCorrect', checked as boolean)
                    }
                    disabled={savingQuestion}
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder={`Đáp án ${index + 1}`}
                    disabled={savingQuestion}
                    className="flex-1"
                  />
                  {questionForm.answers.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnswer(index)}
                      disabled={savingQuestion}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Tick vào checkbox để đánh dấu đáp án đúng. Có thể chọn nhiều đáp án đúng.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuestionDialogOpen(false)}
              disabled={savingQuestion}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSaveQuestion} 
              disabled={savingQuestion || !questionForm.questionText.trim()}
            >
              {savingQuestion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận xóa {deleteType === 'quiz' ? 'Quiz' : 'câu hỏi'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'quiz' 
                ? 'Bạn có chắc chắn muốn xóa quiz này? Tất cả câu hỏi trong quiz cũng sẽ bị xóa.'
                : 'Bạn có chắc chắn muốn xóa câu hỏi này?'
              }
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        // Reset state khi mở hoặc đóng dialog
        setImportFile(null);
        setImportResult(null);
        setImportStep('upload');
        setPreviewData(null);
        setIsDragOver(false);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import câu hỏi từ file
            </DialogTitle>
            <DialogDescription>
              {importStep === 'upload' && 'Bước 1: Chọn file CSV hoặc XLSX chứa danh sách câu hỏi'}
              {importStep === 'preview' && 'Bước 2: Xem trước và xác nhận dữ liệu'}
              {importStep === 'result' && 'Bước 3: Kết quả import'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Step 1: Upload */}
            {importStep === 'upload' && (
              <>
                {/* Template download */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Tải file mẫu để xem định dạng</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quizQuestionApi.downloadImportTemplate()}
                  >
                    Tải xuống
                  </Button>
                </div>

                {/* Drag & Drop File input */}
                <div className="space-y-2">
                  <Label>Chọn file</Label>
                  <div
                    className={`
                      relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      transition-all duration-200 ease-in-out
                      ${isDragOver 
                        ? 'border-primary bg-primary/5 scale-[1.02]' 
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                      }
                      ${importFile ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
                    `}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                        setImportFile(file);
                      }
                    }}
                    onClick={() => document.getElementById('importFileInput')?.click()}
                  >
                    <input
                      id="importFileInput"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setImportFile(file || null);
                      }}
                    />
                    {importFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-10 h-10 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">{importFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImportFile(null);
                          }}
                        >
                          Chọn file khác
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className={`w-10 h-10 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="font-medium">
                            {isDragOver ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Hỗ trợ CSV, XLSX (tối đa 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Format guide */}
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">Định dạng file:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><strong>questionText</strong>: Nội dung câu hỏi</li>
                    <li><strong>type</strong>: MULTIPLE_CHOICE hoặc FILL_BLANK</li>
                    <li><strong>answer1-6</strong>: Các đáp án (ít nhất 2)</li>
                    <li><strong>correctAnswers</strong>: Số thứ tự đáp án đúng (VD: 1 hoặc 1,3)</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 2: Preview */}
            {importStep === 'preview' && previewData && (
              <>
                {/* Summary */}
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{previewData.questions.length}</p>
                    <p className="text-xs text-muted-foreground">Câu hỏi hợp lệ</p>
                  </div>
                  {previewData.errors.length > 0 && (
                    <div className="flex-1 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{previewData.errors.length}</p>
                      <p className="text-xs text-muted-foreground">Lỗi</p>
                    </div>
                  )}
                </div>

                {/* Errors */}
                {previewData.errors.length > 0 && (
                  <div className="max-h-24 overflow-y-auto text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {previewData.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                    {previewData.errors.length > 5 && (
                      <div className="text-muted-foreground mt-1">
                        ... và {previewData.errors.length - 5} lỗi khác
                      </div>
                    )}
                  </div>
                )}

                {/* Questions preview */}
                <div className="space-y-2">
                  <Label>Xem trước câu hỏi ({previewData.questions.length})</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {previewData.questions.map((q, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Câu {idx + 1}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-2">{q.questionText}</p>
                            <div className="mt-2 space-y-1">
                              {q.answers.map((ans, aIdx) => (
                                <div 
                                  key={aIdx}
                                  className={`flex items-center gap-1 text-xs ${
                                    q.correctAnswers.includes(aIdx + 1) 
                                      ? 'text-green-600 font-medium' 
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {q.correctAnswers.includes(aIdx + 1) ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <span className="w-3 h-3 rounded-full border inline-block" />
                                  )}
                                  {ans}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Result */}
            {importStep === 'result' && importResult && (
              <div className="space-y-4">
                <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">
                      Thành công: {importResult.success} câu hỏi
                      {importResult.failed > 0 && `, Thất bại: ${importResult.failed}`}
                    </div>
                  </AlertDescription>
                </Alert>
                {importResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {importResult.errors.slice(0, 10).map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="text-muted-foreground mt-1">
                        ... và {importResult.errors.length - 10} lỗi khác
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            {importStep === 'upload' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={async () => {
                    if (!token || !importFile) return;
                    
                    try {
                      setPreviewing(true);
                      setError(null);
                      const result = await quizQuestionApi.previewImport(importFile, token);
                      setPreviewData(result);
                      setImportStep('preview');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Không thể đọc file');
                    } finally {
                      setPreviewing(false);
                    }
                  }}
                  disabled={previewing || !importFile}
                >
                  {previewing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang đọc file...
                    </>
                  ) : (
                    'Tiếp tục'
                  )}
                </Button>
              </>
            )}

            {importStep === 'preview' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportStep('upload');
                    setPreviewData(null);
                  }}
                  disabled={importing}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={async () => {
                    if (!token || !quiz?._id || !importFile) return;
                    
                    try {
                      setImporting(true);
                      setError(null);
                      const result = await quizQuestionApi.importQuestions(quiz._id, importFile, token);
                      setImportResult(result);
                      setImportStep('result');
                      if (result.success > 0) {
                        await fetchData();
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Không thể import câu hỏi');
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={importing || !previewData?.questions.length}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang import...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import {previewData?.questions.length} câu hỏi
                    </>
                  )}
                </Button>
              </>
            )}

            {importStep === 'result' && (
              <Button onClick={() => setImportDialogOpen(false)}>
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LectureQuizPage;
