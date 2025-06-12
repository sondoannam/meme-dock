import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = 'Loading application...' }: PageLoadingProps) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
