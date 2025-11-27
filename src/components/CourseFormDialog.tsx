import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { 
  instructorCourseApi, 
  categoryApi,
  uploadApi,
  CourseResponse, 
  CreateCourseRequest,
  UpdateCourseRequest,
  Category 
} from '@/lib/api';
import { Loader2, Upload, X, ImageIcon, XCircle } from 'lucide-react';

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseResponse | null;
  onSuccess: () => void;
}

// Zod schema for course form validation
const courseFormSchema = z.object({
  title: z.string()
    .min(1, 'Tên khóa học không được để trống')
    .min(5, 'Tên khóa học phải có ít nhất 5 ký tự')
    .max(200, 'Tên khóa học không được vượt quá 200 ký tự'),
  description: z.string()
    .min(1, 'Mô tả không được để trống')
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(5000, 'Mô tả không được vượt quá 5000 ký tự'),
  price: z.string()
    .min(1, 'Giá không được để trống')
    .refine((val) => !isNaN(Number(val)), 'Giá phải là số')
    .refine((val) => Number(val) >= 0, 'Giá không được âm')
    .refine((val) => Number(val) <= 100000000, 'Giá không được vượt quá 100,000,000 VNĐ'),
  categoryId: z.string()
    .min(1, 'Vui lòng chọn danh mục'),
  level: z.string()
    .min(1, 'Vui lòng chọn cấp độ'),
  imageUrl: z.string().optional(),
  totalDuration: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return !isNaN(Number(val));
    }, 'Thời lượng phải là số (giờ)')
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return Number(val) >= 0;
    }, 'Thời lượng không được âm')
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return Number(val) <= 1000;
    }, 'Thời lượng không được vượt quá 1000 giờ'),
  lectureCount: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return !isNaN(Number(val));
    }, 'Số bài học phải là số')
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return Number.isInteger(Number(val));
    }, 'Số bài học phải là số nguyên')
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return Number(val) >= 0;
    }, 'Số bài học không được âm')
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return Number(val) <= 500;
    }, 'Số bài học không được vượt quá 500'),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const COURSE_LEVELS = [
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
];

const CourseFormDialog = ({ open, onOpenChange, course, onSuccess }: CourseFormDialogProps) => {
  const token = useAuthStore(state => state.token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      categoryId: '',
      level: 'beginner',
      imageUrl: '',
      totalDuration: '',
      lectureCount: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = form;

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when dialog opens/closes or course changes
  useEffect(() => {
    if (open) {
      if (course) {
        reset({
          title: course.title,
          description: course.description,
          price: course.price.toString(),
          categoryId: course.categoryId,
          level: course.level,
          imageUrl: course.imageUrl || '',
          totalDuration: course.totalDuration?.replace(/[^0-9.]/g, '') || '',
          lectureCount: course.lectureCount?.toString() || '',
        });
        setImagePreview(course.imageUrl || null);
        setImageUrl(course.imageUrl || '');
      } else {
        reset({
          title: '',
          description: '',
          price: '',
          categoryId: '',
          level: 'beginner',
          imageUrl: '',
          totalDuration: '',
          lectureCount: '',
        });
        setImagePreview(null);
        setImageUrl('');
      }
      setSubmitError(null);
    }
  }, [open, course, reset]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Vui lòng chọn file ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    if (!token) {
      setSubmitError('Bạn cần đăng nhập để tải ảnh lên');
      return;
    }

    try {
      setUploading(true);
      setSubmitError(null);

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);

      // Upload to Cloudinary
      const uploadedUrl = await uploadApi.uploadImage(file, token);
      
      // Update form data with Cloudinary URL
      setImageUrl(uploadedUrl);
      setValue('imageUrl', uploadedUrl);
      setImagePreview(uploadedUrl);

      // Clean up local preview URL
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể tải ảnh lên');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setValue('imageUrl', '');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    if (!token) {
      setSubmitError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      setLoading(true);
      setSubmitError(null);

      const courseData: CreateCourseRequest | UpdateCourseRequest = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        categoryId: data.categoryId,
        level: data.level,
        imageUrl: imageUrl || undefined,
        totalDuration: data.totalDuration ? `${data.totalDuration} giờ` : undefined,
        lectureCount: data.lectureCount ? parseInt(data.lectureCount) : undefined,
      };

      if (course) {
        await instructorCourseApi.updateCourse(course._id, courseData, token);
      } else {
        await instructorCourseApi.createCourse(courseData as CreateCourseRequest, token);
      }

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!course;
  const isDisabled = loading || uploading;

  // Helper component for error message
  const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
        <XCircle className="w-3 h-3 flex-shrink-0" /> {message}
      </p>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Cập nhật thông tin khóa học của bạn' 
              : 'Điền thông tin để tạo khóa học mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tên khóa học <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
              disabled={isDisabled}
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            <FieldError message={errors.title?.message} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả chi tiết về nội dung, mục tiêu và đối tượng của khóa học..."
              rows={4}
              disabled={isDisabled}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            <FieldError message={errors.description?.message} />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                {...register('price')}
                placeholder="VD: 500000"
                disabled={isDisabled}
                className={errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <FieldError message={errors.price?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục <span className="text-red-500">*</span></Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled || loadingCategories}
                  >
                    <SelectTrigger className={errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.categoryId?.message} />
            </div>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Cấp độ <span className="text-red-500">*</span></Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className={errors.level ? 'border-red-500 focus:ring-red-500' : ''}>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.level?.message} />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Hình ảnh khóa học</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isDisabled}
            />
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tải lên...</span>
                    </div>
                  </div>
                )}
                {!uploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div
                onClick={() => !isDisabled && fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-muted rounded-full">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Nhấp để chọn ảnh</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Option to change image */}
            {imagePreview && !uploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full gap-2"
              >
                <Upload className="w-4 h-4" />
                Thay đổi ảnh
              </Button>
            )}
          </div>

          {/* Duration and Lecture Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalDuration">Thời lượng (giờ)</Label>
              <Input
                id="totalDuration"
                {...register('totalDuration')}
                placeholder="VD: 10"
                disabled={isDisabled}
                className={errors.totalDuration ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <FieldError message={errors.totalDuration?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lectureCount">Số bài học</Label>
              <Input
                id="lectureCount"
                {...register('lectureCount')}
                placeholder="VD: 50"
                disabled={isDisabled}
                className={errors.lectureCount ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <FieldError message={errors.lectureCount?.message} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDisabled}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isDisabled}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                isEditing ? 'Cập nhật' : 'Tạo khóa học'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
