import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import type { TopCourse } from '@/types/admin';

interface TopCoursesProps {
  courses: TopCourse[];
}

export default function TopCourses({ courses }: TopCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Courses</CardTitle>
        <CardDescription>Best performing courses by student count</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No courses available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.courseId}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.instructorName}</TableCell>
                  <TableCell className="text-right">{course.studentCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${course.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
