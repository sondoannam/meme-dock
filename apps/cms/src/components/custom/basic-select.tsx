import { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SelectOption = {
  id?: string;
  icon?: ReactNode;
  value: string;
  label: string;
};

interface BasicSelectProps {
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
}

export const BasicSelect = ({
  defaultValue,
  placeholder = 'Chọn',
  options,
  onValueChange,
  className,
}: BasicSelectProps) => {
  return (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className={cn('max-w-[200px] h-10', className)}>
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
  );
};