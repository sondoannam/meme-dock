import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import {
  Control,
  ControllerRenderProps,
  FieldError,
  FieldPath,
  FieldValues,
  Path,
} from 'react-hook-form';
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

type AddonPosition = 'outside' | 'inside';

type BaseProps<TFieldValues extends FieldValues> = {
  className?: string;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  isLoading?: boolean;
  description?: string | ReactNode;
  isTextArea?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  prefixPosition?: AddonPosition;
  suffixPosition?: AddonPosition;
  addonWidth?: number;
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
  prefix,
  suffix,
  prefixPosition = 'outside',
  suffixPosition = 'outside',
  addonWidth,
  ...props
}: InputTextProps<TFieldValues>) {
  // Using a more specific type for the field parameter that includes the onChange method
  const renderInput = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues> & (string | undefined)>,
    error: FieldError | undefined,
  ) => {
    // If we have inside position addons, we need a wrapper
    const needsInputWrapper =
      (prefix && prefixPosition === 'inside') || (suffix && suffixPosition === 'inside');

    const inputElement = isTextArea ? (
      <Textarea
        {...field}
        disabled={isLoading || disabled}
        readOnly={readOnly}
        className={cn(
          error && 'border-destructive',
          readOnly && 'cursor-not-allowed opacity-70',
          prefix && prefixPosition === 'inside' && 'pl-10',
          suffix && suffixPosition === 'inside' && 'pr-10',
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
          prefix && prefixPosition === 'inside' && 'pl-10',
          suffix && suffixPosition === 'inside' && 'pr-10',
        )}
        onChange={(e) => {
          field.onChange(e);
          onChange?.(e);
        }}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
    );

    if (needsInputWrapper) {
      return (
        <div className="relative">
          {prefix && prefixPosition === 'inside' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {prefix}
            </div>
          )}
          {inputElement}
          {suffix && suffixPosition === 'inside' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return inputElement;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-2">
            {prefix && prefixPosition === 'outside' && (
              <div className={cn('!w-10', addonWidth && `!w-[${addonWidth}px]`)}>{prefix}</div>
            )}

            <FormControl className="flex-1">{renderInput(field, error)}</FormControl>

            {suffix && suffixPosition === 'outside' && (
              <div className={cn('!w-10', addonWidth && `!w-[${addonWidth}px]`)}>{suffix}</div>
            )}
          </div>
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
