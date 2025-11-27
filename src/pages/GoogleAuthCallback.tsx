import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userStr = params.get('user');
        const error = params.get('error');

        if (error) {
          // Handle error
          let errorMessage = 'Đăng nhập Google thất bại';
          
          switch (error) {
            case 'authentication_failed':
              errorMessage = 'Xác thực thất bại. Vui lòng thử lại.';
              break;
            case 'google_auth_failed':
              errorMessage = 'Không thể đăng nhập với Google. Vui lòng thử lại.';
              break;
            case 'server_error':
              errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
              break;
          }

          toast.error(errorMessage);
          navigate('/login');
          return;
        }

        if (!token || !userStr) {
          toast.error('Thiếu thông tin xác thực');
          navigate('/login');
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        // Save to auth store
        setAuth(user, token);

        // Show success message
        toast.success('Đăng nhập Google thành công!', {
          description: `Chào mừng ${user.name}!`,
        });

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);

      } catch (error) {
        console.error('Google auth callback error:', error);
        toast.error('Có lỗi xảy ra khi xử lý đăng nhập');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
