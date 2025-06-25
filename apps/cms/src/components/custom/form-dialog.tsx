import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormDialogProps<TFormValues extends FieldValues> {
  dialog: ReturnType<typeof DialogCustom.useDialog>;
  header: string;
  form: UseFormReturn<TFormValues>;
  onSubmit: (values: TFormValues) => void;
  submitText: string;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

export function FormDialog<TFormValues extends FieldValues>({
  dialog,
  header,
  form,
  onSubmit,
  submitText,
  onClose,
  className,
  children,
}: FormDialogProps<TFormValues>) {
  const handleClose = () => {
    dialog.close();
    onClose?.();
  };

  const { handleSubmit, formState: { isSubmitting } } = form;

  return (
    <DialogCustom dialog={dialog} header={header} className={className} isDisableClickOutside>
      <ScrollArea className="max-h-[70vh] pr-2.5 w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {children}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </DialogCustom>
  );
}
