import { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

export type SelectOption = {
  id?: string;
  icon?: ReactNode;
  value: string;
  label: string;
};

interface BasicSelectProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
  enableReset?: boolean;
}

export const BasicSelect = ({
  value,
  defaultValue,
  placeholder = 'Select ...',
  options,
  onValueChange,
  className,
  enableReset,
}: BasicSelectProps) => {
  const handleReset = () => {
    onValueChange('');
  };

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn('!h-10', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id ?? option.value} value={option.value}>
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {enableReset && value && (
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
  );
};
