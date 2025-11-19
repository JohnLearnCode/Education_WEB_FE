import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { courses } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Star, Clock, BarChart, User, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
const CourseDetailPage = () => {
  const { id } = useParams();
  const course = courses.find(c => c.id === parseInt(id || ''));
  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-20">Course not found.</div>
      </MainLayout>
    );
  }
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
  return (
    <MainLayout>
      {/* Course Header */}
      <section className="bg-cognita-slate text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold font-display">{course.title}</h1>
              <p className="text-lg text-slate-300">{course.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-400">{course.rating}</span>
                  <StarRating rating={course.rating} />
                </div>
                <span>({course.reviews.length} reviews)</span>
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <p>Created by <span className="font-semibold">{course.instructor.name}</span></p>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{course.longDescription}</p>
              </CardContent>
            </Card>
            {/* Curriculum */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Curriculum</h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.curriculum.map((module) => (
                    <AccordionItem key={module.id} value={`item-${module.id}`}>
                      <AccordionTrigger className="font-semibold">{module.title}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {module.lessons.map((lesson, index) => (
                            <li key={index} className="flex justify-between items-center text-muted-foreground">
                              <span>{lesson.title}</span>
                              <span className="text-sm">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            {/* Instructor */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About the Instructor</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                    <p className="text-muted-foreground">{course.instructor.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className="w-full h-auto object-cover" />
                <CardContent className="p-6 space-y-4">
                  <div className="text-4xl font-bold text-cognita-orange">${course.price}</div>
                  <Button size="lg" className="w-full bg-cognita-orange hover:bg-cognita-orange/90 text-white">Enroll Now</Button>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{course.duration} on-demand video</span></li>
                    <li className="flex items-center gap-2"><BarChart className="w-4 h-4" /><span>Beginner to Advanced</span></li>
                    <li className="flex items-center gap-2"><User className="w-4 h-4" /><span>Lifetime access</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default CourseDetailPage;