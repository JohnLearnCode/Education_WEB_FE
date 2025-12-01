import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  courseApi, 
  CourseResponse, 
  orderApi, 
  sepayApi, 
  SepayPaymentMethod 
} from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CheckoutPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SepayPaymentMethod>('BANK_TRANSFER');
  const [checkoutData, setCheckoutData] = useState<{
    url: string;
    fields: Record<string, string | number>;
  } | null>(null);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const token = useAuthStore(state => state.token);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${courseId}` } });
    }
  }, [isAuthenticated, navigate, courseId]);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await courseApi.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Auto-submit form when checkout data is ready
  useEffect(() => {
    if (checkoutData && formRef.current) {
      formRef.current.submit();
    }
  }, [checkoutData]);

  const handlePayment = async () => {
    if (!courseId || !token || !course) return;

    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create order
      const order = await orderApi.createOrder(
        {
          courseIds: [courseId],
          paymentMethod: `sepay_${paymentMethod.toLowerCase()}`,
        },
        token
      );

      // Step 2: Initiate SePay payment
      const paymentData = await sepayApi.initiatePayment(
        order._id,
        paymentMethod,
        token
      );

      // Step 3: Set checkout data to trigger form submission
      setCheckoutData({
        url: paymentData.checkoutUrl,
        fields: paymentData.checkoutFields,
      });

      toast.success('Đang chuyển đến trang thanh toán...');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xử lý thanh toán';
      setError(errorMessage);
      toast.error(errorMessage);
      setProcessing(false);
    }
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

  if (error && !course) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Button>

        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Method Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as SepayPaymentMethod)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="BANK_TRANSFER" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-medium">Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-muted-foreground">
                          Chuyển khoản qua tài khoản ngân hàng nội địa
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="NAPAS_BANK_TRANSFER" id="napas" />
                    <Label htmlFor="napas" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-medium">Thẻ ATM nội địa (Napas)</p>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán qua thẻ ATM/Internet Banking
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Thanh toán được bảo mật bởi SePay</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course && (
                  <>
                    <div className="flex gap-4">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor?.name}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Giá gốc</span>
                        <span>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(course.price)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-primary">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(course.price)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Thanh toán ngay'
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Bằng việc thanh toán, bạn đồng ý với{' '}
                      <a href="#" className="underline">Điều khoản dịch vụ</a>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden form for SePay redirect */}
        {checkoutData && (
          <form
            ref={formRef}
            action={checkoutData.url}
            method="POST"
            style={{ display: 'none' }}
          >
            {Object.entries(checkoutData.fields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={String(value)} />
            ))}
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
