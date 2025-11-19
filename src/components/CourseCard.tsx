import { Link } from 'react-router-dom';
import { Star, Users, Book } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/lib/mockData';
interface CourseCardProps {
  course: Course;
}
const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link to={`/courses/${course.id}`} className="block group">
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
            <Badge variant="secondary">{course.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span>{course.rating}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex-grow">{course.title}</h3>
          <p className="text-sm text-muted-foreground">By {course.instructor.name}</p>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{`${(course.students / 1000).toFixed(1)}k`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span>{course.lessons} Lessons</span>
          </div>
          <span className="text-lg font-bold text-primary">${course.price}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};
export default CourseCard;