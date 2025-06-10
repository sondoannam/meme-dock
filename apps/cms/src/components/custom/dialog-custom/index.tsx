import { Modal } from '@/components/ui/modal';
import { DialogInstance, useDialog } from './use-dialog';
import { ConfirmDeleteDialog } from '../confirm-delete-dialog';

interface DialogComponent
  extends React.FC<{
    dialog?: DialogInstance;
    children?: React.ReactNode;
    onClickOutside?: () => void;
    header?: React.ReactNode;
    className?: string;
    isConfirmDelete?: boolean;
    onConfirmDelete?: () => void;
    deleteLoading?: boolean;
    onCloseDelete?: () => void;
    isDisableClickOutside?: boolean;
  }> {
  useDialog: typeof useDialog;
}

export const DialogCustom: DialogComponent = ({
  dialog,
  children,
  header,
  className,
  isConfirmDelete = false,
  onConfirmDelete,
  deleteLoading = false,
  onCloseDelete,
  isDisableClickOutside = false,
}) => {
  const dialogInstance = useDialog(dialog);

  if (isConfirmDelete) {
    return (
      <ConfirmDeleteDialog
        title={header ?? 'Confirm Delete'}
        openDeleteDialog={dialogInstance.isOpen}
        closeDelete={() => {
          onCloseDelete?.();
          dialogInstance?.close();
        }}
        onConfirmDelete={() => {
          onConfirmDelete?.();
        }}
        deleteLoading={deleteLoading}
      >
        {children}
      </ConfirmDeleteDialog>
    );
  }

  return (
    <Modal
      isOpen={dialogInstance.isOpen}
      onClose={() => {
        dialogInstance?.close();
      }}
      header={header}
      className={className}
      disableClickOutside={isDisableClickOutside}
    >
      {children}
    </Modal>
  );
};

// This enables the `Dialog.useDialog()` API
DialogCustom.useDialog = useDialog;
