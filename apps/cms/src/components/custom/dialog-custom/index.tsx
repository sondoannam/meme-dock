import { Modal } from '@/components/ui/modal';
import { DialogInstance, useDialog } from './use-dialog';
import ConfirmDeleteDialog from '../confirm-delete-dialog';

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
}) => {
  const dialogInstance = useDialog(dialog);

  if (isConfirmDelete) {
    return (
      <ConfirmDeleteDialog
        title={header ?? 'Xác nhận xóa'}
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
    >
      <div>{children}</div>
    </Modal>
  );
};

// This enables the `Dialog.useDialog()` API
DialogCustom.useDialog = useDialog;
