import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: number;
}

export default function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center text-xs font-medium',
                isPositiveTrend && 'text-green-600',
                isNegativeTrend && 'text-red-600'
              )}
            >
              {isPositiveTrend && <TrendingUp className="h-3 w-3 mr-1" />}
              {isNegativeTrend && <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
