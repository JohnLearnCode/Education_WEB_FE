import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertCircle, MessageSquare, GraduationCap, BookOpen, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { complaintsApi, type Complaint, type ComplaintsStats } from '@/lib/api/adminManagement';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Reports() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('');

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsData, statsData] = await Promise.all([
        complaintsApi.getAll({
          page,
          limit: 10,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
        }),
        complaintsApi.getStats(),
      ]);
      setComplaints(complaintsData.complaints);
      setTotalPages(complaintsData.pagination.totalPages);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch complaints:', error);
      toast.error(error.message || 'Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSearch = () => {
    setPage(1);
    fetchComplaints();
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
        <Badge className="bg-purple-100 text-purple-800">
          <BookOpen className="h-3 w-3 mr-1" />
          Khóa học
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-800">
        <GraduationCap className="h-3 w-3 mr-1" />
        Giảng viên
      </Badge>
    );
  };

  const handleViewDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailOpen(true);
  };

  const handleRespond = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || '');
    setResponseStatus(complaint.status);
    setIsResponseOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedComplaint) return;

    try {
      await complaintsApi.update(selectedComplaint._id, {
        status: responseStatus,
        adminResponse: responseText,
      });
      toast.success('Đã cập nhật khiếu nại');
      setIsResponseOpen(false);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật khiếu nại');
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!confirm('Bạn có chắc muốn xóa khiếu nại này?')) return;

    try {
      await complaintsApi.delete(complaintId);
      toast.success('Đã xóa khiếu nại');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa khiếu nại');
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      await complaintsApi.update(complaintId, { status: newStatus });
      toast.success('Đã cập nhật trạng thái');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Khiếu nại</h1>
          <p className="text-muted-foreground">
            Xem và xử lý các khiếu nại từ học viên
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khiếu nại</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pending || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.inProgress || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.resolved || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khiếu nại</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc khiếu nại theo trạng thái và loại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Tìm kiếm theo tiêu đề, mô tả, tên người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="course">Khóa học</SelectItem>
                <SelectItem value="instructor">Giảng viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Người gửi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Không có khiếu nại nào
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {complaint.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {complaint.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(complaint.type)}</TableCell>
                      <TableCell>
                        {complaint.courseName || complaint.instructorName || '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => handleStatusChange(complaint._id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="resolved">Đã xử lý</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetail(complaint)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRespond(complaint)}>
                              Phản hồi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(complaint._id)}
                              className="text-red-600"
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết khiếu nại</DialogTitle>
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
                  <label className="text-sm font-medium">Người gửi</label>
                  <p className="text-sm mt-1">{selectedComplaint.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedComplaint.userEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại</label>
                  <div className="mt-1">{getTypeBadge(selectedComplaint.type)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Đối tượng khiếu nại</label>
                <p className="text-sm mt-1">
                  {selectedComplaint.courseName || selectedComplaint.instructorName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
              </div>
              {selectedComplaint.adminResponse && (
                <div>
                  <label className="text-sm font-medium">Phản hồi của Admin</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedComplaint.adminResponse}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Phản hồi bởi {selectedComplaint.adminName} -{' '}
                    {selectedComplaint.respondedAt &&
                      format(new Date(selectedComplaint.respondedAt), 'dd/MM/yyyy HH:mm', {
                        locale: vi,
                      })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phản hồi khiếu nại</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và phản hồi cho khiếu nại
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={responseStatus} onValueChange={setResponseStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Phản hồi</label>
              <Textarea
                className="mt-1"
                rows={6}
                placeholder="Nhập phản hồi của bạn..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitResponse}>Gửi phản hồi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
