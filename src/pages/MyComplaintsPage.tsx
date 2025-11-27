import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, GraduationCap, Loader2, Trash2 } from 'lucide-react';
import { complaintApi, Complaint } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintApi.getMyComplaints();
      setComplaints(data);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!confirm('Bạn có chắc muốn xóa khiếu nại này?')) return;

    try {
      await complaintApi.delete(complaintId);
      toast.success('Đã xóa khiếu nại');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa khiếu nại');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
      resolved: { label: 'Đã giải quyết', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'course') {
      return (
        <Badge variant="outline" className="bg-purple-50">
          <BookOpen className="h-3 w-3 mr-1" />
          Khóa học
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-50">
        <GraduationCap className="h-3 w-3 mr-1" />
        Giảng viên
      </Badge>
    );
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Khiếu nại của tôi</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Quản lý và theo dõi các khiếu nại của bạn
          </p>
        </div>

        {complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có khiếu nại nào</h3>
              <p className="text-muted-foreground mb-4">
                Bạn chưa gửi khiếu nại nào. Nếu gặp vấn đề, hãy gửi khiếu nại từ khóa học của bạn.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Về Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(complaint.type)}
                        {getStatusBadge(complaint.status)}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{complaint.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {complaint.type === 'course' ? '📚' : '👨‍🏫'}{' '}
                          {complaint.courseName || complaint.instructorName}
                        </span>
                        <span>
                          🕒 {format(new Date(complaint.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      </div>
                      {complaint.adminResponse && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Phản hồi từ Admin:
                          </p>
                          <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setIsDetailOpen(true);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {complaint.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(complaint._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết khiếu nại</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về khiếu nại của bạn
              </DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <p className="text-sm mt-1">{selectedComplaint.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Loại</label>
                    <div className="mt-1">{getTypeBadge(selectedComplaint.type)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Đối tượng khiếu nại</label>
                  <p className="text-sm mt-1">
                    {selectedComplaint.courseName || selectedComplaint.instructorName}
                  </p>
                </div>
                {selectedComplaint.adminResponse && (
                  <div>
                    <label className="text-sm font-medium">Phản hồi của Admin</label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">
                        {selectedComplaint.adminResponse}
                      </p>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Tạo lúc: {format(new Date(selectedComplaint.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
