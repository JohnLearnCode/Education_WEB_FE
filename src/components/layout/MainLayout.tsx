import React from 'react';
import MainHeader from './MainHeader';
import MainFooter from './MainFooter';
interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cognita-neutral dark:bg-cognita-slate">
      <MainHeader />
      <main className="flex-grow">
        {children}
      </main>
      <MainFooter />
    </div>
  );
};
export default MainLayout;