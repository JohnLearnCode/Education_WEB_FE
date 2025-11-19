import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CourseCard from '@/components/CourseCard';
import { courses, reviews } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const HomePage = () => {
  const featuredCourses = courses.slice(0, 3);
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
      {/* Hero Section */}
      <section className="bg-white dark:bg-cognita-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-cognita-slate dark:text-white leading-tight">
                Unlock Your Potential, One Course at a Time.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                Discover a world of knowledge with our illustrative and engaging online courses. Learn from industry experts and join a vibrant community of learners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="bg-cognita-orange hover:bg-cognita-orange/90 text-white" asChild>
                  <Link to="/courses">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
            <div>
              <img src="https://placehold.co/600x400/F97316/FFFFFF?text=Illustration" alt="Learning illustration" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      {/* Featured Courses Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-cognita-slate dark:text-white">Featured Courses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked courses by our experts to help you get started on your learning journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="bg-white dark:bg-cognita-slate/50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-cognita-slate dark:text-white">What Our Students Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of happy learners who transformed their careers with Cognita.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-background">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={review.avatar} alt={review.author} />
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground mb-4 flex-grow">"{review.comment}"</p>
                  <div className="font-semibold text-foreground">{review.author}</div>
                  <StarRating rating={review.rating} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
export default HomePage;