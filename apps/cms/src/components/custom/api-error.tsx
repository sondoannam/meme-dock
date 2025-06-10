import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiErrorProps {
  error: string;
  onRetry?: () => void;
}

export function ApiError({ error, onRetry }: ApiErrorProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>API Access Error</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>

        {onRetry && (
          <CardFooter>
            <Button variant="outline" onClick={onRetry} className="w-full">
              Retry
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
