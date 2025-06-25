import { InputText } from '@/components/custom/form-field/input-text';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface InputWithTranslationProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  appear: boolean;
  translateFn: () => void;
  isTranslating: boolean;
  tooltipContent: string;
}

const InputWithTranslationMemo = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  appear,
  translateFn,
  isTranslating,
  tooltipContent,
}: InputWithTranslationProps<TFieldValues>) => {
  return (
    <InputText
      name={name}
      label={label}
      placeholder={placeholder}
      control={control}
      suffixPosition="outside"
      suffix={
        appear ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="!h-full w-full transition-colors hover:bg-slate-100 hover:text-primary"
                  onClick={translateFn}
                  disabled={isTranslating || !appear}
                >
                  {isTranslating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isTranslating ? 'Translating...' : tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : undefined
      }
    />
  );
};

export const InputWithTranslation = memo(
  InputWithTranslationMemo,
) as typeof InputWithTranslationMemo;
