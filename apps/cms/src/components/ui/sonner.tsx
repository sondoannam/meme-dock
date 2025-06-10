import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps, toast } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={5000}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--primary)',
          '--success-text': 'var(--primary-foreground)',
          '--success-border': 'var(--primary)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
          '--error-border': 'var(--destructive)',
          '--warning-bg': 'var(--warning)',
          '--warning-text': 'var(--warning-foreground)',
          '--warning-border': 'var(--warning)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'group font-sans border border-border rounded-md shadow-lg p-4',
          description: 'mt-1 text-sm text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: 'text-foreground/50 hover:text-foreground',
          success: '!bg-primary !text-primary-foreground !border-primary',
          error: '!bg-destructive !text-destructive-foreground !border-destructive',
          info: '!bg-info !text-info-foreground !border-info',
          warning: '!bg-warning !text-warning-foreground !border-warning',
          loading: '!bg-muted !text-muted-foreground !border-muted',
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
