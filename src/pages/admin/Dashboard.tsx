import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin';
import type { DashboardResponse } from '@/types/admin';
import StatsCard from '@/components/admin/StatsCard';
import RevenueChart from '@/components/admin/RevenueChart';
import UserGrowthChart from '@/components/admin/UserGrowthChart';
import RecentOrders from '@/components/admin/RecentOrders';
import RecentUsers from '@/components/admin/RecentUsers';
import TopCourses from '@/components/admin/TopCourses';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || 'Failed to load dashboard'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { stats } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <StatsCard
          title="Total Users"
          value={stats.users.totalUsers.toLocaleString()}
          description={`${stats.users.newUsersThisMonth} new this month`}
          icon={Users}
          trend={stats.users.userGrowthRate}
        />

        {/* Total Courses */}
        <StatsCard
          title="Total Courses"
          value={stats.courses.totalCourses.toLocaleString()}
          description={`${stats.courses.newCoursesThisMonth} new this month`}
          icon={BookOpen}
        />

        {/* Total Revenue */}
        <StatsCard
          title="Total Revenue"
          value={`$${stats.revenue.totalRevenue.toLocaleString()}`}
          description={`$${stats.revenue.revenueThisMonth.toLocaleString()} this month`}
          icon={DollarSign}
          trend={stats.revenue.revenueGrowthRate}
        />

        {/* Total Orders */}
        <StatsCard
          title="Total Orders"
          value={stats.orders.totalOrders.toLocaleString()}
          description={`${stats.orders.conversionRate}% conversion rate`}
          icon={ShoppingCart}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.totalInstructors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Content creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.pendingOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.orders.completedOrders.toLocaleString()} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart />
        <UserGrowthChart />
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentOrders orders={dashboardData.recentOrders} />
        <RecentUsers users={dashboardData.recentUsers} />
      </div>

      {/* Top Courses */}
      <TopCourses courses={dashboardData.topCourses} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
