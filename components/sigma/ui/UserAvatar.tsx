import React from 'react';
import { cn, getInitials } from '@/lib/sigma/utils';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  size = 'md',
  className,
}) => (
  <div
    className={cn(
      'rounded-full bg-[#9fe870] text-[#163300] font-bold flex items-center justify-center shrink-0 ring-2 ring-[#163300]/10',
      sizeMap[size],
      className
    )}
    title={name || email || 'User'}
  >
    {getInitials(name, email)}
  </div>
);
