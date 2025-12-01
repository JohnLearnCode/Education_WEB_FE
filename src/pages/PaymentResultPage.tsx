import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { sepayApi, orderApi, Order } from '@/lib/api';

type PaymentStatus = 'success' | 'error' | 'cancel' | 'loading' | 'verifying';

interface PaymentResultPageProps {
  status: 'success' | 'error' | 'cancel';
}

const PaymentResultPage: React.FC<PaymentResultPageProps> = ({ status: initialStatus }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  
  const [status, setStatus] = useState<PaymentStatus>(initialStatus === 'success' ? 'verifying' : initialStatus);
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string>('');
  
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Verify payment status on success page
  useEffect(() => {
    const verifyPayment = async () => {
      if (initialStatus !== 'success' || !orderId || !token) {
        setStatus(initialStatus);
        return;
      }

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify payment status
        const paymentStatus = await sepayApi.verifyPayment(orderId, token);
        
        if (paymentStatus.status === 'completed') {
          setStatus('success');
          setMessage('Thanh toán thành công! Bạn đã được đăng ký vào khóa học.');
          
          // Fetch order details
          try {
            const orderData = await orderApi.getOrderById(orderId, token);
            setOrder(orderData);
          } catch (err) {
            console.error('Error fetching order:', err);
          }
        } else if (paymentStatus.status === 'pending') {
          setStatus('verifying');
          setMessage('Đang xử lý thanh toán. Vui lòng đợi trong giây lát...');
          
          // Retry after 3 seconds
          setTimeout(verifyPayment, 3000);
        } else {
          setStatus('error');
          setMessage(paymentStatus.message || 'Thanh toán không thành công');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('error');
        setMessage('Không thể xác minh trạng thái thanh toán');
      }
    };

    verifyPayment();
  }, [initialStatus, orderId, token]);

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-20 h-20 text-green-500" />,
          title: 'Thanh toán thành công!',
          description: message || 'Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: <XCircle className="w-20 h-20 text-red-500" />,
          title: 'Thanh toán thất bại',
          description: message || 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'cancel':
        return {
          icon: <AlertCircle className="w-20 h-20 text-yellow-500" />,
          title: 'Thanh toán đã bị hủy',
          description: 'Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'verifying':
      case 'loading':
      default:
        return {
          icon: <Loader2 className="w-20 h-20 text-primary animate-spin" />,
          title: 'Đang xác minh thanh toán...',
          description: 'Vui lòng đợi trong giây lát.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              {config.icon}
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{config.title}</h1>
            <p className="text-muted-foreground mb-8">{config.description}</p>

            {/* Order Details */}
            {order && status === 'success' && (
              <div className="bg-white rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold mb-3">Chi tiết đơn hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-mono">{order._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="font-semibold text-primary">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalAmount)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-muted-foreground mb-1">Khóa học:</p>
                    {order.courses.map((course) => (
                      <p key={course.courseId} className="font-medium">
                        • {course.title}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'success' && (
                <>
                  <Button asChild size="lg">
                    <Link to="/dashboard">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Bắt đầu học ngay
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link to="/courses">
                      Khám phá thêm khóa học
                    </Link>
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  {orderId && (
                    <Button 
                      size="lg"
                      onClick={() => navigate(`/checkout/${order?.courses[0]?.courseId || ''}`)}
                    >
                      Thử lại
                    </Button>
                  )}
                  <Button variant="outline" asChild size="lg">
                    <Link to="/courses">
                      <Home className="w-4 h-4 mr-2" />
                      Về trang khóa học
                    </Link>
                  </Button>
                </>
              )}

              {status === 'cancel' && (
                <>
                  <Button 
                    size="lg"
                    onClick={() => navigate(-1)}
                  >
                    Quay lại thanh toán
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link to="/courses">
                      <Home className="w-4 h-4 mr-2" />
                      Về trang khóa học
                    </Link>
                  </Button>
                </>
              )}

              {(status === 'verifying' || status === 'loading') && (
                <Button variant="outline" asChild size="lg">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Về trang chủ
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Cần hỗ trợ?{' '}
            <Link to="/complaint" className="text-primary hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentResultPage;
