import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { FieldValues, FieldPath, Control } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'form' | 'type'>;

interface InputPasswordProps<TFieldValues extends FieldValues> {
  className?: string;
  control?: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  isLoading?: boolean;
  description?: string | ReactNode;
  disablePasswordEye?: boolean;
}

export const InputPassword = <TFieldValues extends FieldValues>({
  className,
  control,
  name,
  label,
  isLoading,
  description,
  disabled,
  onChange,
  disablePasswordEye,
  ...props
}: InputPasswordProps<TFieldValues> & InputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className='relative'>
              <Input
                {...field}
                type={showPassword ? 'text' : 'password'}
                disabled={isLoading || disabled}
                className={cn(error && 'border-destructive')}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e);
                }}
                {...props}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2'
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disablePasswordEye || disabled}
              >
                {showPassword && !disablePasswordEye ? (
                  <Eye className='h-5 w-5' />
                ) : (
                  <EyeOff className='h-5 w-5' />
                )}
                <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
