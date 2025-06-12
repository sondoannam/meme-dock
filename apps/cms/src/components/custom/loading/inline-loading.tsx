import { Icons } from '@/components/icons';

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InlineLoading = ({ size = 'md', className = '' }: InlineLoadingProps) => {
  const sizeClasses = {
    sm: '!h-4 !w-4',
    md: '!h-5 !w-5',
    lg: '!h-6 !w-6',
  };

  return <Icons.Spinner className={`${sizeClasses[size]} animate-spin ${className}`} />;
};
