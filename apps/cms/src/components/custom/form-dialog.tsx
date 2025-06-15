import { ReactNode } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { DialogCustom } from "@/components/custom/dialog-custom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

interface FormDialogProps<TFormValues extends FieldValues> {
  /**
   * The dialog instance from DialogCustom.useDialog()
   */
  dialog: ReturnType<typeof DialogCustom.useDialog>;
  
  /**
   * Dialog header text
   */
  header: string;
  
  /**
   * The form hook from react-hook-form
   */
  form: UseFormReturn<TFormValues>;
  
  /**
   * Function to handle form submission
   */
  onSubmit: (values: TFormValues) => void;
  
  /**
   * Text for the submit button
   */
  submitText: string;
  
  /**
   * Function to call when dialog closes (usually to reset form)
   */
  onClose?: () => void;
  
  /**
   * Additional className for the dialog
   */
  className?: string;
  
  /**
   * Form fields to display
   */
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

  return (
    <DialogCustom dialog={dialog} header={header} className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {children}
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit">{submitText}</Button>
          </div>
        </form>
      </Form>
    </DialogCustom>
  );
}
