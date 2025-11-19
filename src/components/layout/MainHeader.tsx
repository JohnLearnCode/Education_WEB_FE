import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const MainHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/dashboard', label: 'Dashboard', auth: true },
  ];
  const filteredNavLinks = navLinks.filter(link => !link.auth || isAuthenticated);
  const NavLinks = ({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) => (
    <nav className={cn("flex items-center space-x-6", className)}>
      {filteredNavLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          onClick={onLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-primary dark:hover:text-primary",
              isActive ? "text-primary" : "",
              "pb-1 border-b-2",
              isActive ? "border-primary" : "border-transparent"
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
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-display text-cognita-slate dark:text-white">Cognita</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
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
                      <BookOpen className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-bold font-display text-cognita-slate dark:text-white">Cognita</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-6">
                    {filteredNavLinks.map((link) => (
                      <NavLink
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "text-xl font-medium text-slate-700 dark:text-slate-200 transition-colors hover:text-primary",
                            isActive ? "text-primary" : ""
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>
                  <div className="mt-auto flex flex-col space-y-2">
                    {isAuthenticated ? (
                      <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Log Out</Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                        </Button>
                        <Button asChild>
                          <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                      </>
                    )}
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