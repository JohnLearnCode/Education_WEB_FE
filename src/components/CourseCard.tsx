import { Link } from 'react-router-dom';
import { Star, Users, Book } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseResponse } from '@/lib/api';

interface CourseCardProps {
  course: CourseResponse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format student count
  const formatStudentCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Link to={`/courses/${course._id}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">{course.level}</Badge>
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span>{course.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({course.ratingCount})</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex-grow line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            By {course.instructor?.name || 'Unknown'}
          </p>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{formatStudentCount(course.studentCount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span>{course.lectureCount} bài</span>
          </div>
          <span className="text-lg font-bold text-primary">
            {formatPrice(course.price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;