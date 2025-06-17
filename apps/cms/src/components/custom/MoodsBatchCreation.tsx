import { useState } from "react";
import { BatchCreateButton } from "@/components/custom/batch-create-button";
import { BUNCH_OF_MOODS } from "@/constants/moods";
import { MemeMoodFormValues } from "@/validators";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MoodsBatchCreationProps {
  collectionId: string;
  onComplete?: () => void;
}

export function MoodsBatchCreation({ collectionId, onComplete }: MoodsBatchCreationProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState<{
    totalSuccessful: number;
    totalFailed: number;
  } | null>(null);

  const handleComplete = (result: { 
    totalSuccessful: number; 
    totalFailed: number; 
    successful: unknown[]; 
    failed: { data: Record<string, unknown>; error: string }[] 
  }) => {
    setIsCompleted(true);    setStats({
      totalSuccessful: result.totalSuccessful,
      totalFailed: result.totalFailed
    });
    
    // Call the parent's onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  // Function to transform mood item to document format expected by API
  const transformMood = (mood: MemeMoodFormValues) => {
    return {
      ...mood,
      // Add any additional fields needed for the mood document
      // You can add default values for any required fields here
    };
  };

  if (isCompleted) {
    return (
      <Alert className="max-w-md mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Moods Upload Complete</AlertTitle>
        <AlertDescription>
          Successfully created {stats?.totalSuccessful} moods.
          {stats?.totalFailed ? ` Failed to create ${stats.totalFailed} moods (likely already exist).` : ''}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <BatchCreateButton
        items={BUNCH_OF_MOODS}
        collectionId={collectionId}
        transformItem={transformMood}
        skipDuplicateSlugs={true}
        buttonText="Create All Moods"
        variant="default"
        successMessage="Moods created successfully"
        onComplete={handleComplete}
      />
    </div>
  );
}
