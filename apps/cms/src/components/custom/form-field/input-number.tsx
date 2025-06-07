import { InputHTMLAttributes } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type InputNumberProps<TFieldValues extends FieldValues> = {
  className?: string;
  control?: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  isLoading?: boolean;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'form' | 'type' | 'min' | 'max' | 'step'>;

export function InputNumber<TFieldValues extends FieldValues>({
  className,
  control,
  name,
  label,
  isLoading,
  description,
  onChange,
  disabled,
  min,
  max,
  step,
  ...props
}: InputNumberProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              min={min}
              max={max}
              step={step}
              disabled={isLoading || disabled}
              className={cn('appearance-none', error && 'border-destructive')}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                const value = e.target.value && !isNaN(parsed) ? parsed : null;
                field.onChange(value);
                onChange?.(e);
              }}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
