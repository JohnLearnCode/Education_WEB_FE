import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
const MainHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/dashboard', label: 'Dashboard' },
  ];
  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center space-x-6", className)}>
      {navLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              "text-base font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-cognita-orange dark:hover:text-cognita-orange",
              isActive ? "text-cognita-orange" : "",
              "pb-1 border-b-2",
              isActive ? "border-cognita-orange" : "border-transparent"
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-cognita-orange" />
            <span className="text-2xl font-bold font-display text-cognita-slate dark:text-white">Cognita</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button className="bg-cognita-orange hover:bg-cognita-orange/90 text-white" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-3/4">
                <div className="flex flex-col h-full p-4">
                  <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <BookOpen className="h-8 w-8 text-cognita-orange" />
                      <span className="text-2xl font-bold font-display text-cognita-slate dark:text-white">Cognita</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-6">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "text-xl font-medium text-slate-700 dark:text-slate-200 transition-colors hover:text-cognita-orange",
                            isActive ? "text-cognita-orange" : ""
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>
                  <div className="mt-auto flex flex-col space-y-2">
                     <Button variant="outline" asChild>
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                     </Button>
                     <Button className="bg-cognita-orange hover:bg-cognita-orange/90 text-white" asChild>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                     </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
export default MainHeader;