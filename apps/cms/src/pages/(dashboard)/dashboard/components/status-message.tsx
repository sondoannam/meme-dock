import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusMessageProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string | null;
}

export const StatusMessage = ({ status, message }: StatusMessageProps) => {
  if (!message) return null;

  // Helper function for status icons
  const getStatusIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'mt-4 p-3 rounded-md flex items-center gap-2',
        status === 'success'
          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          : status === 'error'
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          : '',
      )}
    >
      {getStatusIcon(status)}
      {message}
    </div>
  );
};
