import { useState } from 'react';
import { Button } from '../ui/button';
import { documentApi } from '@/services/document';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface BatchCreateButtonProps<T> {
  /**
   * Array of data items to be created
   */
  items: T[];
  /**
   * The collection ID where documents will be created
   */
  collectionId: string;
  /**
   * Transform function that converts an item to the format expected by the API
   * @default identity function (item => item)
   */
  transformItem?: (item: T) => Record<string, unknown>;
  /**
   * Whether to skip creating documents with duplicate slugs (instead of failing)
   * @default true
   */
  skipDuplicateSlugs?: boolean;
  /**
   * Button text
   * @default "Create Documents"
   */
  buttonText?: string;
  /**
   * Button variant
   * @default "default"
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /**
   * Success message
   * @default "Documents created successfully"
   */
  successMessage?: string
  /**
   * Callback when operation is complete
   */;
  onComplete?: (result: {
    totalSuccessful: number;
    totalFailed: number;
    successful: unknown[];
    failed: { data: Record<string, unknown>; error: string }[];
  }) => void;
}

export function BatchCreateButton<T>({
  items,
  collectionId,
  transformItem = (item) => item as unknown as Record<string, unknown>,
  skipDuplicateSlugs = true,
  buttonText = 'Create Documents',
  variant = 'default',
  successMessage = 'Documents created successfully',
  onComplete,
}: BatchCreateButtonProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    if (items.length === 0) {
      toast.error('No items to create');
      return;
    }

    try {
      setIsLoading(true);

      // Transform items for the API
      const documents = items.map(transformItem);

      // Call API to create documents
      const result = await documentApi.createDocuments(collectionId, documents, skipDuplicateSlugs);

      // Show success message with details
      toast.success(
        `${successMessage}: ${result.totalSuccessful} created, ${result.totalFailed} failed`,
        {
          description:
            result.totalFailed > 0 ? 'Some documents already exist or had errors.' : undefined,
        },
      );

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Failed to create documents:', error);
      toast.error('Failed to create documents', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} variant={variant} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
}
