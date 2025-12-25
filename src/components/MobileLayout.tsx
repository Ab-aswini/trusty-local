import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${showNav ? 'pb-20' : ''}`}>
      {children}
      {showNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
