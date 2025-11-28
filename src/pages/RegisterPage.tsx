import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// Danh sách các domain email ảo phổ biến
const disposableEmailDomains = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamail.info', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
  'spam4.me', 'tempinbox.com', 'emailondeck.com', 'mohmal.com'
];

// Schema validation khớp với Backend
const registerSchema = z.object({
  name: z.string()
    .min(1, 'Tên không được để trống')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên không được chứa ký tự đặc biệt hoặc số'),
  email: z.string()
    .min(1, 'Email không được để trống')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(100, 'Email không được quá 100 ký tự')
    .email('Email không hợp lệ')
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return !domain || !disposableEmailDomains.includes(domain);
    }, 'Không được sử dụng email ảo'),
  password: z.string()
    .min(1, 'Mật khẩu không được để trống')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số'),
  dateOfBirth: z.string()
    .min(1, 'Ngày sinh không được để trống')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Ngày sinh không được là ngày trong tương lai')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm nay
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 13;
    }, 'Bạn phải từ 13 tuổi trở lên')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm nay
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age <= 100;
    }, 'Tuổi không được vượt quá 100'),
  phoneNumber: z.string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam 10 số)'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, error: authError } = useAuthStore();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      phoneNumber: '',
    },
    mode: 'onChange', // Validate real-time
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        dateOfBirth: new Date(data.dateOfBirth),
        phoneNumber: data.phoneNumber,
      });

      // Thành công
      toast.success('Đăng ký tài khoản thành công!', {
        description: 'Chào mừng bạn đến với Cognita!',
      });
      
      // Chuyển hướng sang dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.',
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">Tạo tài khoản mới</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin của bạn để đăng ký tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày tháng năm sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                className={errors.dateOfBirth ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0912345678"
                {...register('phoneNumber')}
                className={errors.phoneNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
        </div>
      </div>
    </MainLayout>
  );
}
