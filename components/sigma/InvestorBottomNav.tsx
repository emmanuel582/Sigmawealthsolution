import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/sigma/utils';
import { AppIcon } from './ui/AppIcon';
import type { IconName } from '@/lib/sigma/icons';

export type InvestorTab = 'home' | 'history' | 'me' | 'notifications' | 'profile';

interface InvestorBottomNavProps {
  activeTab: InvestorTab;
  onTabChange: (tab: InvestorTab) => void;
  notificationCount?: number;
}

const tabs: { id: InvestorTab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'me', label: 'Me', icon: 'wallet' },
  { id: 'notifications', label: 'Alerts', icon: 'bell' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export const InvestorBottomNav: React.FC<InvestorBottomNavProps> = ({
  activeTab,
  onTabChange,
  notificationCount = 0,
}) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#163300]/10 shadow-[0_-8px_32px_rgba(22,51,0,0.08)]">
    <div className="max-w-5xl mx-auto flex items-center justify-around px-2 py-1.5">
      {tabs.map(({ id, label, icon }) => {
        const isActive = activeTab === id;
        const showBadge = id === 'notifications' && notificationCount > 0;
        return (
          <motion.button
            key={id}
            onClick={() => onTabChange(id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[48px] press-ring',
              isActive ? 'text-[#163300]' : 'text-[#163300]/45 hover:text-[#163300]/75'
            )}
          >
            <div className="relative">
              <motion.div
                layout
                className={cn(
                  'p-1.5 rounded-xl transition-colors duration-300',
                  isActive ? 'bg-[#9fe870] shadow-[0_6px_18px_rgba(159,232,112,0.45)]' : 'bg-transparent'
                )}
              >
                <AppIcon name={icon} className={cn('w-[16px] h-[16px]', isActive && 'scale-110')} />
              </motion.div>
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            <span className={cn('text-[9px] font-semibold transition-all', isActive && 'font-bold text-[#163300]')}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </nav>
);
