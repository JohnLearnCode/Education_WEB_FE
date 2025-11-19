import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { courses } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Star, Clock, BarChart, User, Send } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === parseInt(id || ''));
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const isEnrolled = useCourseStore(state => state.isEnrolled(course?.id ?? -1));
  const enrollCourse = useCourseStore(state => state.enrollCourse);
  const addReview = useCourseStore(state => state.addReview);
  const courseReviews = useCourseStore(state => state.reviews.get(course?.id ?? -1) || []);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-20">Course not found.</div>
      </MainLayout>
    );
  }
  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      enrollCourse(course.id);
      toast.success(`Successfully enrolled in "${course.title}"!`);
    }
  };
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !user) return;
    addReview(course.id, {
      author: user.name,
      avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      rating,
      comment: reviewText,
    });
    setReviewText('');
    setRating(5);
    toast.success("Thank you for your review!");
  };
  const StarRatingDisplay = ({ rating, totalReviews }: { rating: number, totalReviews?: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        ))}
      </div>
      {totalReviews !== undefined && <span className="text-muted-foreground text-sm">({totalReviews} reviews)</span>}
    </div>
  );
  return (
    <MainLayout>
      <Toaster richColors />
      <section className="bg-cognita-slate text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold font-display">{course.title}</h1>
              <p className="text-lg text-slate-300">{course.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-400">{course.rating}</span>
                  <StarRatingDisplay rating={course.rating} />
                </div>
                <span>({courseReviews.length} reviews)</span>
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <p>Created by <span className="font-semibold">{course.instructor.name}</span></p>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{course.longDescription}</p>
              </CardContent>
            </Card>
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
                    <p className="mt-2 text-sm text-muted-foreground">A passionate educator with over 10 years of experience in the field, dedicated to making learning accessible and enjoyable for everyone.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                {isEnrolled && (
                  <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border rounded-lg bg-background">
                    <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-6 h-6 cursor-pointer ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} onClick={() => setRating(i + 1)} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-text">Your review</Label>
                        <Textarea id="review-text" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts about the course..." required />
                      </div>
                      <Button type="submit" className="w-full sm:w-auto" disabled={!reviewText.trim()}>
                        <Send className="mr-2 h-4 w-4" /> Submit Review
                      </Button>
                    </div>
                  </form>
                )}
                <div className="space-y-6">
                  {courseReviews.map(review => (
                    <div key={review.id} className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                          <p className="font-semibold">{review.author}</p>
                          <StarRatingDisplay rating={review.rating} />
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className="w-full h-auto object-cover" />
                <CardContent className="p-6 space-y-4">
                  <div className="text-4xl font-bold text-cognita-orange">${course.price}</div>
                  {isEnrolled ? (
                    <Button size="lg" className="w-full" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full bg-cognita-orange hover:bg-cognita-orange/90 text-white" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                  )}
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