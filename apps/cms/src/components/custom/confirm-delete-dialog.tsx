import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { ReactNode } from 'react';

interface ConfirmDeleteDialogProps {
  title?: string | ReactNode;
  header?: string | ReactNode;
  openDeleteDialog: boolean;
  closeDelete: () => void;
  onConfirmDelete: () => void;
  children?: ReactNode;
  deleteLoading: boolean;
  confirmText?: string;
}
export const ConfirmDeleteDialog = ({
  title = 'Confirm Delete',
  header,
  openDeleteDialog,
  closeDelete,
  onConfirmDelete,
  children,
  deleteLoading,
  confirmText = 'Delete',
}: ConfirmDeleteDialogProps) => {
  return (
    <Modal
      isOpen={openDeleteDialog}
      onClose={closeDelete}
      title={title}
      header={header}
      footer={
        <div className="flex gap-4">
          <Button variant="outline" onClick={closeDelete}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={deleteLoading}
            loading={deleteLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
};
