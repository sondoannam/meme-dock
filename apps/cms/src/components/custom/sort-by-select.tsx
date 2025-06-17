import { RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortOption = {
  value: string;
  label: string;
};

interface SortBySelectProps {
  /**
   * Current selected sort option
   */
  value: string;
  
  /**
   * Function to handle sort option change
   */
  onValueChange: (value: string) => void;
  
  /**
   * Available sort options
   */
  options: SortOption[];
  
  /**
   * Additional class names for the select element (optional)
   */
  className?: string;
}

export function SortBySelect({
  value,
  onValueChange,
  options,
  className,
}: SortBySelectProps) {

  // Handle reset button click
  const handleReset = () => {
    onValueChange("");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Sort by:</span>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className={cn("!h-10 w-48", className)}>
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10" 
            onClick={handleReset}
            title="Reset sorting"
          >
            <RefreshCcw className="!h-4 !w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
