import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type BaseProps<TFieldValues extends FieldValues> = {
  className?: string;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  isLoading?: boolean;
  description?: string | ReactNode;
  isTextArea?: boolean;
};

type InputTextProps<TFieldValues extends FieldValues> = BaseProps<TFieldValues> &
  (
    | (Omit<InputHTMLAttributes<HTMLInputElement>, 'form'> & { isTextArea?: false })
    | (Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'form'> & { isTextArea: true })
  );

export function InputText<TFieldValues extends FieldValues>({
  className,
  control,
  name,
  label,
  isLoading,
  description,
  isTextArea,
  onChange,
  disabled,
  readOnly,
  ...props
}: InputTextProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextArea ? (
              <Textarea
                {...field}
                disabled={isLoading || disabled}
                readOnly={readOnly}
                className={cn(
                  error && 'border-destructive',
                  readOnly && 'cursor-not-allowed opacity-70',
                )}
                onChange={(e) => {
                  field.onChange(e);
                  // Using type assertion with the correct TextareaHTMLAttributes type
                  onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>);
                }}
                {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
              />
            ) : (
              <Input
                {...field}
                disabled={isLoading || disabled}
                readOnly={readOnly}
                className={cn(
                  error && 'border-destructive',
                  readOnly && 'cursor-not-allowed opacity-70',
                )}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e);
                }}
                {...(props as InputHTMLAttributes<HTMLInputElement>)}
              />
            )}
          </FormControl>
          {description && (
            <FormDescription className="text-muted-foreground italic !text-sm">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
