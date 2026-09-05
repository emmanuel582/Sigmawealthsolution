import React from 'react';
import { cn } from '@/lib/sigma/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('skeleton', className)} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#edefeb] pb-24">
    <div className="bg-[#163300] h-52 wave-header relative" />
    <div className="max-w-lg mx-auto px-4 -mt-16 space-y-4 animate-fade-slide-up">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  </div>
);

export const AuthSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#edefeb] flex flex-col justify-center px-4">
    <div className="max-w-md mx-auto w-full space-y-6 animate-fade-slide-up">
      <Skeleton className="h-10 w-48 mx-auto rounded-xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  </div>
);
