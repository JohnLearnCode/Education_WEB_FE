import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin } from 'lucide-react';
const MainFooter = () => {
  const socialLinks = [
    { icon: Github, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
  ];
  const footerLinks = {
    Platform: [
      { label: 'Courses', href: '/courses' },
      { label: 'About Us', href: '#' },
      { label: 'Instructors', href: '#' },
    ],
    Company: [
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  };
  return (
    <footer className="bg-white dark:bg-cognita-slate border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-cognita-orange" />
              <span className="text-2xl font-bold font-display text-cognita-slate dark:text-white">Cognita</span>
            </Link>
            <p className="text-muted-foreground text-base">
              Unlock your potential with our engaging and interactive online courses.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href} className="text-muted-foreground hover:text-cognita-orange transition-colors">
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div></div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">{title}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-muted-foreground hover:text-cognita-orange transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cognita. All rights reserved. Built with ❤️ at Cloudflare.</p>
        </div>
      </div>
    </footer>
  );
};
export default MainFooter;