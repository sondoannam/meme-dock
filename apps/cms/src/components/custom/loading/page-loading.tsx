import { Icons } from '@/components/icons';

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = 'Loading application...' }: PageLoadingProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      role="status"
      aria-live="polite"
    >
      <Icons.Spinner
        className="!h-12 !w-12 text-brand-yellow-2 mx-auto mb-4 animate-spin"
        aria-label={message}
      />
      <div className="text-center">
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};
