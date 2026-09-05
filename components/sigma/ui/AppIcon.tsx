import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons, type IconName } from '@/lib/sigma/icons';
import { cn } from '@/lib/sigma/utils';

interface AppIconProps {
  name: IconName;
  className?: string;
  spin?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className, spin }) => (
  <FontAwesomeIcon icon={icons[name]} className={cn('shrink-0', className)} spin={spin} />
);
