import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { 
  courseApi,
  sectionApi, 
  lectureApi,
  uploadApi,
  CourseResponse,
  CourseSection,
  Lecture,
} from '@/lib/api';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  ArrowLeft,
  GripVertical,
  Video,
  FileText,
  Paperclip,
  ChevronDown,
  Upload,
  X,
  HelpCircle
} from 'lucide-react';

type LectureType = 'video' | 'text' | 'attachment';

interface SectionWithLectures extends CourseSection {
  lectures: Lecture[];
}

const CourseCurriculumPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [sections, setSections] = useState<SectionWithLectures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  // Lecture dialog state
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    duration: '',
    type: 'video' as LectureType,
    videoUrl: '',
    textContent: '',
    attachmentUrl: '',
  });
  // Duration picker state (hours, minutes, seconds)
  const [durationPicker, setDurationPicker] = useState({
    hours: '',
    minutes: '',
    seconds: '',
  });
  const [savingLecture, setSavingLecture] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'section' | 'lecture'>('section');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch course and curriculum
  const fetchData = async () => {
    if (!courseId || !token) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseData = await courseApi.getCourseById(courseId, token);
      setCourse(courseData);

      // Fetch sections
      const sectionsData = await sectionApi.getSectionsByCourseId(courseId);
      
      // Fetch lectures for each section
      const sectionsWithLectures: SectionWithLectures[] = await Promise.all(
        sectionsData.map(async (section) => {
          const lectures = section._id 
            ? await lectureApi.getLecturesBySectionId(section._id)
            : [];
          return { ...section, lectures: lectures.sort((a, b) => a.order - b.order) };
        })
      );

      setSections(sectionsWithLectures.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, token]);

  // Section handlers
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionTitle('');
    setSectionDialogOpen(true);
  };

  const handleEditSection = (section: CourseSection) => {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!token || !courseId || !sectionTitle.trim()) return;

    try {
      setSavingSection(true);
      setError(null);

      if (editingSection && editingSection._id) {
        await sectionApi.updateSection(editingSection._id, { title: sectionTitle.trim() }, token);
      } else {
        const nextOrder = await sectionApi.getNextOrderNumber(courseId, token);
        await sectionApi.createSection({
          courseId,
          title: sectionTitle.trim(),
          order: nextOrder,
        }, token);
      }

      setSectionDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu chương');
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = (section: CourseSection) => {
    if (!section._id) return;
    setDeleteType('section');
    setDeleteId(section._id);
    setDeleteName(section.title);
    setDeleteDialogOpen(true);
  };

  // Parse duration string to hours, minutes, seconds
  const parseDuration = (duration: string): { hours: string; minutes: string; seconds: string } => {
    if (!duration) return { hours: '', minutes: '', seconds: '' };
    
    const parts = duration.split(':').map(p => p.trim());
    if (parts.length === 3) {
      // hh:mm:ss format
      return { hours: parts[0], minutes: parts[1], seconds: parts[2] };
    } else if (parts.length === 2) {
      // mm:ss format
      return { hours: '', minutes: parts[0], seconds: parts[1] };
    } else if (parts.length === 1 && parts[0]) {
      // Just seconds or minutes
      return { hours: '', minutes: '', seconds: parts[0] };
    }
    return { hours: '', minutes: '', seconds: '' };
  };

  // Format duration picker to string
  const formatDurationFromPicker = (picker: { hours: string; minutes: string; seconds: string }): string => {
    const h = parseInt(picker.hours) || 0;
    const m = parseInt(picker.minutes) || 0;
    const s = parseInt(picker.seconds) || 0;
    
    if (h === 0 && m === 0 && s === 0) return '';
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle duration picker change with validation
  const handleDurationChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    // Only allow numbers
    const numValue = value.replace(/\D/g, '');
    
    // Validate limits
    let validValue = numValue;
    if (field === 'hours') {
      const num = parseInt(numValue) || 0;
      if (num > 99) validValue = '99';
    } else {
      const num = parseInt(numValue) || 0;
      if (num > 59) validValue = '59';
    }
    
    const newPicker = { ...durationPicker, [field]: validValue };
    setDurationPicker(newPicker);
    
    // Update lectureForm.duration
    const formattedDuration = formatDurationFromPicker(newPicker);
    setLectureForm(prev => ({ ...prev, duration: formattedDuration }));
  };

  // Lecture handlers
  const handleAddLecture = (sectionId: string) => {
    setEditingLecture(null);
    setCurrentSectionId(sectionId);
    setLectureForm({
      title: '',
      duration: '',
      type: 'video',
      videoUrl: '',
      textContent: '',
      attachmentUrl: '',
    });
    setDurationPicker({ hours: '', minutes: '', seconds: '' });
    setLectureDialogOpen(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setCurrentSectionId(lecture.sectionId);
    setLectureForm({
      title: lecture.title,
      duration: lecture.duration,
      type: lecture.type,
      videoUrl: lecture.videoUrl || '',
      textContent: lecture.textContent || '',
      attachmentUrl: lecture.attachmentUrl || '',
    });
    // Parse existing duration to picker
    setDurationPicker(parseDuration(lecture.duration));
    setLectureDialogOpen(true);
  };

  const handleSaveLecture = async () => {
    if (!token || !courseId || !currentSectionId || !lectureForm.title.trim()) return;

    try {
      setSavingLecture(true);
      setError(null);

      if (editingLecture && editingLecture._id) {
        await lectureApi.updateLecture(editingLecture._id, {
          title: lectureForm.title.trim(),
          duration: lectureForm.duration,
          type: lectureForm.type,
          videoUrl: lectureForm.type === 'video' ? lectureForm.videoUrl : undefined,
          textContent: lectureForm.type === 'text' ? lectureForm.textContent : undefined,
          attachmentUrl: lectureForm.type === 'attachment' ? lectureForm.attachmentUrl : undefined,
        }, token);
      } else {
        const nextOrder = await lectureApi.getNextOrderNumber(currentSectionId, token);
        await lectureApi.createLecture({
          sectionId: currentSectionId,
          courseId,
          title: lectureForm.title.trim(),
          duration: lectureForm.duration || '0:00',
          type: lectureForm.type,
          videoUrl: lectureForm.type === 'video' ? lectureForm.videoUrl : undefined,
          textContent: lectureForm.type === 'text' ? lectureForm.textContent : undefined,
          attachmentUrl: lectureForm.type === 'attachment' ? lectureForm.attachmentUrl : undefined,
          order: nextOrder,
        }, token);
      }

      setLectureDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bài học');
    } finally {
      setSavingLecture(false);
    }
  };

  const handleDeleteLecture = (lecture: Lecture) => {
    if (!lecture._id) return;
    setDeleteType('lecture');
    setDeleteId(lecture._id);
    setDeleteName(lecture.title);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteId) return;

    try {
      setDeleting(true);
      setError(null);

      if (deleteType === 'section') {
        await sectionApi.deleteSection(deleteId, token);
      } else {
        await lectureApi.deleteLecture(deleteId, token);
      }

      setDeleteDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa');
    } finally {
      setDeleting(false);
    }
  };

  // Format duration from seconds to mm:ss or hh:mm:ss
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video duration from file
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Không thể đọc thông tin video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Video upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn file video hợp lệ');
      return;
    }

    try {
      setUploadingVideo(true);
      setError(null);
      
      // Get video duration before upload
      const durationInSeconds = await getVideoDuration(file);
      const formattedDuration = formatDuration(durationInSeconds);
      
      // Upload video
      const url = await uploadApi.uploadVideo(file, token);
      
      // Update form with video URL and duration
      setLectureForm(prev => ({ 
        ...prev, 
        videoUrl: url,
        duration: formattedDuration
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải video lên');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Remove video handler
  const handleRemoveVideo = () => {
    setLectureForm(prev => ({ 
      ...prev, 
      videoUrl: '',
      duration: ''
    }));
  };

  // Attachment upload handler (Word, PDF)
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Chỉ chấp nhận file PDF hoặc Word (.pdf, .doc, .docx)');
      return;
    }

    try {
      setUploadingAttachment(true);
      setError(null);
      
      // Upload file
      const url = await uploadApi.uploadFile(file, token);
      
      // Update form with attachment URL
      setLectureForm(prev => ({ 
        ...prev, 
        attachmentUrl: url
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải file lên');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Remove attachment handler
  const handleRemoveAttachment = () => {
    setLectureForm(prev => ({ 
      ...prev, 
      attachmentUrl: ''
    }));
  };

  const getLectureIcon = (type: LectureType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'attachment':
        return <Paperclip className="w-4 h-4" />;
    }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/courses')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-cognita-slate dark:text-white">
              Quản lý nội dung khóa học
            </h1>
            {course && (
              <p className="text-muted-foreground mt-1">{course.title}</p>
            )}
          </div>
          <Button onClick={handleAddSection} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm chương
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sections List */}
        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Chưa có nội dung</h3>
                  <p className="text-muted-foreground mt-1">
                    Bắt đầu thêm chương và bài học cho khóa học của bạn
                  </p>
                </div>
                <Button onClick={handleAddSection} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm chương đầu tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <Card key={section._id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <div>
                        <CardTitle className="text-base">
                          Chương {sectionIndex + 1}: {section.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.lectures.length} bài học
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddLecture(section._id!)}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm bài
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSection(section)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSection(section)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {section.lectures.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="border rounded-lg divide-y">
                      {section.lectures.map((lecture, lectureIndex) => (
                        <div
                          key={lecture._id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="text-sm text-muted-foreground w-6">
                              {lectureIndex + 1}.
                            </span>
                            <div className="flex items-center gap-2">
                              {getLectureIcon(lecture.type)}
                              <span className="font-medium">{lecture.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {lecture.duration}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs gap-1"
                              asChild
                            >
                              <Link to={`/instructor/courses/${courseId}/lectures/${lecture._id}/quiz`}>
                                <Plus className="w-3 h-3" />
                                Quiz
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditLecture(lecture)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteLecture(lecture)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập tiêu đề cho chương này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Tiêu đề chương</Label>
              <Input
                id="sectionTitle"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="VD: Giới thiệu khóa học"
                disabled={savingSection}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSectionDialogOpen(false)}
              disabled={savingSection}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveSection} disabled={savingSection || !sectionTitle.trim()}>
              {savingSection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lecture Dialog */}
      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingLecture ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin cho bài học
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="lectureTitle">Tiêu đề bài học *</Label>
              <Input
                id="lectureTitle"
                value={lectureForm.title}
                onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="VD: Bài 1 - Giới thiệu"
                disabled={savingLecture}
              />
            </div>

            {/* Duration - readonly for video type, picker for others */}
            <div className="space-y-2">
              <Label>Thời lượng</Label>
              {lectureForm.type === 'video' ? (
                <>
                  <Input
                    value={lectureForm.duration}
                    placeholder="Tự động tính sau khi upload video"
                    disabled
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Thời lượng sẽ được tự động tính toán khi bạn tải video lên
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {/* Hours */}
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={durationPicker.hours}
                          onChange={(e) => handleDurationChange('hours', e.target.value)}
                          placeholder="0"
                          maxLength={2}
                          disabled={savingLecture}
                          className="text-center pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          giờ
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">:</span>
                    {/* Minutes */}
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={durationPicker.minutes}
                          onChange={(e) => handleDurationChange('minutes', e.target.value)}
                          placeholder="0"
                          maxLength={2}
                          disabled={savingLecture}
                          className="text-center pr-10"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          phút
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">:</span>
                    {/* Seconds */}
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={durationPicker.seconds}
                          onChange={(e) => handleDurationChange('seconds', e.target.value)}
                          placeholder="0"
                          maxLength={2}
                          disabled={savingLecture}
                          className="text-center pr-10"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          giây
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Giờ (0-99) : Phút (0-59) : Giây (0-59)
                  </p>
                </>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Loại bài học</Label>
              <Select
                value={lectureForm.type}
                onValueChange={(value: LectureType) => {
                  setLectureForm(prev => ({ ...prev, type: value }));
                  // Reset duration when switching to video type
                  if (value === 'video') {
                    setLectureForm(prev => ({ ...prev, type: value, duration: '' }));
                    setDurationPicker({ hours: '', minutes: '', seconds: '' });
                  }
                }}
                disabled={savingLecture}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Văn bản
                    </div>
                  </SelectItem>
                  <SelectItem value="attachment">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Tài liệu đính kèm
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content based on type */}
            {lectureForm.type === 'video' && (
              <div className="space-y-2">
                <Label>Video</Label>
                <div className="space-y-3">
                  {/* Video Preview */}
                  {lectureForm.videoUrl ? (
                    <div className="relative rounded-lg overflow-hidden border bg-black">
                      <video
                        src={lectureForm.videoUrl}
                        controls
                        className="w-full max-h-[250px] object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemoveVideo}
                        disabled={savingLecture || uploadingVideo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Chưa có video. Tải video lên để bắt đầu.
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="videoUpload"
                        disabled={savingLecture || uploadingVideo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('videoUpload')?.click()}
                        disabled={savingLecture || uploadingVideo}
                        className="gap-2"
                      >
                        {uploadingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Chọn video từ máy
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Change video button when video exists */}
                  {lectureForm.videoUrl && (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="videoUploadChange"
                        disabled={savingLecture || uploadingVideo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('videoUploadChange')?.click()}
                        disabled={savingLecture || uploadingVideo}
                        className="gap-2"
                      >
                        {uploadingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Thay đổi video
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lectureForm.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="textContent">Nội dung văn bản</Label>
                <RichTextEditor
                  value={lectureForm.textContent}
                  onChange={(value) => setLectureForm(prev => ({ ...prev, textContent: value }))}
                  placeholder="Nhập nội dung bài học..."
                  maxLength={100000}
                  disabled={savingLecture}
                />
              </div>
            )}

            {lectureForm.type === 'attachment' && (
              <div className="space-y-2">
                <Label>Tài liệu (PDF, Word)</Label>
                <div className="border-2 border-dashed rounded-lg p-6">
                  {!lectureForm.attachmentUrl ? (
                    <div className="text-center">
                      <Paperclip className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Chọn file PDF hoặc Word để tải lên
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('attachmentUpload')?.click()}
                        disabled={savingLecture || uploadingAttachment}
                      >
                        {uploadingAttachment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Chọn file
                          </>
                        )}
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleAttachmentUpload}
                        className="hidden"
                        id="attachmentUpload"
                        disabled={savingLecture || uploadingAttachment}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Hỗ trợ: PDF, DOC, DOCX (tối đa 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-sm">File đã tải lên</p>
                          <a 
                            href={lectureForm.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate block max-w-[300px]"
                          >
                            {lectureForm.attachmentUrl}
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('attachmentUploadChange')?.click()}
                          disabled={savingLecture || uploadingAttachment}
                        >
                          {uploadingAttachment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Đổi file'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveAttachment}
                          disabled={savingLecture || uploadingAttachment}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleAttachmentUpload}
                          className="hidden"
                          id="attachmentUploadChange"
                          disabled={savingLecture || uploadingAttachment}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLectureDialogOpen(false)}
              disabled={savingLecture || uploadingVideo || uploadingAttachment}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSaveLecture} 
              disabled={savingLecture || uploadingVideo || uploadingAttachment || !lectureForm.title.trim()}
            >
              {savingLecture ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
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
              Xác nhận xóa {deleteType === 'section' ? 'chương' : 'bài học'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{deleteName}"?
              {deleteType === 'section' && ' Tất cả bài học trong chương này cũng sẽ bị xóa.'}
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
    </MainLayout>
  );
};

export default CourseCurriculumPage;
