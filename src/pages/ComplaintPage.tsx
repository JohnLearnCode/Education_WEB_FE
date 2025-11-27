import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { complaintApi } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ComplaintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get params from URL
  const courseId = searchParams.get('courseId');
  const courseName = searchParams.get('courseName');
  const instructorId = searchParams.get('instructorId');
  const instructorName = searchParams.get('instructorName');
  
  const [type, setType] = useState<'course' | 'instructor'>(
    instructorId ? 'instructor' : 'course'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      
      const data = {
        title: title.trim(),
        description: description.trim(),
        ...(type === 'course' ? { courseId } : { instructorId }),
      };

      await complaintApi.create(data);
      toast.success('Gửi khiếu nại thành công!');
      navigate('/my-complaints');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi khiếu nại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Gửi khiếu nại</CardTitle>
            <CardDescription>
              Vui lòng mô tả chi tiết vấn đề của bạn. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {type === 'course' && courseName && (
                    <span>Khiếu nại về khóa học: <strong>{courseName}</strong></span>
                  )}
                  {type === 'instructor' && instructorName && (
                    <span>Khiếu nại về giảng viên: <strong>{instructorName}</strong></span>
                  )}
                </AlertDescription>
              </Alert>

              {/* Type Selection */}
              <div className="space-y-3">
                <Label>Loại khiếu nại</Label>
                <RadioGroup value={type} onValueChange={(value: any) => setType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="course" id="course" disabled={!courseId} />
                    <Label htmlFor="course" className={!courseId ? 'text-muted-foreground' : ''}>
                      Khiếu nại về khóa học
                      {courseName && <span className="ml-2 text-sm">({courseName})</span>}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instructor" id="instructor" disabled={!instructorId} />
                    <Label htmlFor="instructor" className={!instructorId ? 'text-muted-foreground' : ''}>
                      Khiếu nại về giảng viên
                      {instructorName && <span className="ml-2 text-sm">({instructorName})</span>}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề khiếu nại"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground">
                  {title.length}/200 ký tự
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={8}
                  maxLength={2000}
                />
                <p className="text-sm text-muted-foreground">
                  {description.length}/2000 ký tự
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
