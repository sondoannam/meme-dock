import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TagsInput } from '@/components/ui/input-tags';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface InputTagsCustomProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  maxItems?: number;
  minItems?: number;
}

export const InputTagsCustom = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled = false,
  className,
  maxItems,
  minItems,
}: InputTagsCustomProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Convert string values to array if needed
        const value = field.value ? (Array.isArray(field.value) ? field.value : [field.value]) : [];

        return (
          <FormItem className={cn('w-full', className)}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <TagsInput
                value={value}
                onValueChange={(newValue) => field.onChange(newValue)}
                placeholder={placeholder || 'Enter values and press Enter...'}
                maxItems={maxItems}
                minItems={minItems}
                className={cn(
                  'border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
