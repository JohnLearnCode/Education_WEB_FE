import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt hệ thống và tùy chọn
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>
                Quản lý thông tin cơ bản của nền tảng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Tên website</Label>
                <Input id="site-name" defaultValue="Cognita Education" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Mô tả</Label>
                <Input 
                  id="site-description" 
                  defaultValue="Nền tảng học trực tuyến hàng đầu" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email liên hệ</Label>
                <Input 
                  id="contact-email" 
                  type="email"
                  defaultValue="contact@cognita.edu" 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép đăng ký mới</Label>
                  <p className="text-sm text-muted-foreground">
                    Người dùng có thể tạo tài khoản mới
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ bảo trì</Label>
                  <p className="text-sm text-muted-foreground">
                    Tạm thời tắt website cho người dùng
                  </p>
                </div>
                <Switch />
              </div>
              <Button>Lưu thay đổi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Email</CardTitle>
              <CardDescription>
                Cấu hình SMTP và template email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input id="smtp-user" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                <Input id="smtp-pass" type="password" />
              </div>
              <Button>Lưu cấu hình</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Thanh toán</CardTitle>
              <CardDescription>
                Cấu hình cổng thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stripe</Label>
                  <p className="text-sm text-muted-foreground">
                    Kích hoạt thanh toán qua Stripe
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Public Key</Label>
                <Input id="stripe-key" placeholder="pk_test_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input id="stripe-secret" type="password" placeholder="sk_test_..." />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>PayPal</Label>
                  <p className="text-sm text-muted-foreground">
                    Kích hoạt thanh toán qua PayPal
                  </p>
                </div>
                <Switch />
              </div>
              <Button>Lưu cấu hình</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Bảo mật</CardTitle>
              <CardDescription>
                Quản lý các tùy chọn bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Xác thực 2 yếu tố (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Yêu cầu 2FA cho tài khoản admin
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Giới hạn đăng nhập thất bại</Label>
                  <p className="text-sm text-muted-foreground">
                    Khóa tài khoản sau 5 lần đăng nhập sai
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Tự động đăng xuất sau 30 phút không hoạt động
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="jwt-secret">JWT Secret Key</Label>
                <Input id="jwt-secret" type="password" />
                <p className="text-xs text-muted-foreground">
                  Thay đổi key này sẽ đăng xuất tất cả người dùng
                </p>
              </div>
              <Button variant="destructive">Đổi JWT Secret</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
