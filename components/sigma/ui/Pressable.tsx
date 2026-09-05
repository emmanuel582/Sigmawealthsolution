import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/sigma/utils';
import { AppIcon } from './AppIcon';
import type { IconName } from '@/lib/sigma/icons';

type PressableProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'lime' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

const variantClasses: Record<NonNullable<PressableProps['variant']>, string> = {
  primary: 'bg-[#163300] text-[#9fe870] hover:bg-[#1e4200] shadow-[0_8px_24px_rgba(22,51,0,0.18)]',
  secondary: 'bg-white text-[#163300] border border-[#163300]/12 hover:border-[#163300]/25 hover:bg-[#f7f8f6]',
  ghost: 'bg-transparent text-[#163300] hover:bg-[#163300]/5',
  lime: 'bg-[#9fe870] text-[#163300] hover:bg-[#8ad45e] shadow-[0_8px_24px_rgba(159,232,112,0.35)]',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

const sizeClasses: Record<NonNullable<PressableProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-3 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3.5 text-sm rounded-2xl gap-2.5',
};

export const PressableButton = React.forwardRef<HTMLButtonElement, PressableProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
);
PressableButton.displayName = 'PressableButton';

interface IconCircleButtonProps extends Omit<PressableProps, 'children'> {
  icon: IconName;
  label?: string;
  badge?: number;
  iconClassName?: string;
  spin?: boolean;
}

export const IconCircleButton: React.FC<IconCircleButtonProps> = ({
  icon,
  label,
  badge,
  className,
  iconClassName,
  spin,
  ...props
}) => (
  <motion.button
    whileHover={{ y: -2, scale: 1.04 }}
    whileTap={{ y: 0, scale: 0.94 }}
    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
    className={cn('flex flex-col items-center gap-1.5 group', className)}
    {...props}
  >
    <div className="relative">
      <div className="w-12 h-12 rounded-full bg-white text-[#163300] shadow-[0_10px_24px_rgba(0,0,0,0.12)] flex items-center justify-center group-hover:shadow-[0_14px_28px_rgba(159,232,112,0.35)] transition-shadow duration-300">
        <AppIcon name={icon} className={cn('w-[18px] h-[18px]', iconClassName)} spin={spin} />
      </div>
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
        >
          {badge > 9 ? '9+' : badge}
        </motion.span>
      )}
    </div>
    {label && <span className="text-[10px] font-semibold text-[#163300] mt-1">{label}</span>}
  </motion.button>
);

interface SurfaceCardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  className,
  interactive = false,
  children,
  ...props
}) => (
  <motion.div
    whileHover={interactive ? { y: -2, boxShadow: '0 16px 40px rgba(22,51,0,0.08)' } : undefined}
    whileTap={interactive ? { y: 0, scale: 0.995 } : undefined}
    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    className={cn(
      'rounded-2xl bg-white border border-[#163300]/8 shadow-[0_4px_20px_rgba(22,51,0,0.04)]',
      interactive && 'cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

interface IconBadgeProps {
  icon: IconName;
  className?: string;
}

export const IconBadge: React.FC<IconBadgeProps> = ({ icon, className }) => (
  <div className={cn('w-9 h-9 rounded-full bg-[#edefeb] text-[#163300] flex items-center justify-center', className)}>
    <AppIcon name={icon} className="w-4 h-4" />
  </div>
);
