import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api/admin';
import type { UserGrowthChartData } from '@/types/admin';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserGrowthChart() {
  const [data, setData] = useState<UserGrowthChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const chartData = await adminApi.getChartData();
      setData(chartData.userGrowthChart);
    } catch (error) {
      console.error('Failed to fetch user growth chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>New users registration trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="students" stackId="1" stroke="#8884d8" fill="#8884d8" name="Students" />
            <Area type="monotone" dataKey="instructors" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Instructors" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
