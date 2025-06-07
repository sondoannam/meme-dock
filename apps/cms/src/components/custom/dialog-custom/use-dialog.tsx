import { useMemo, useState, useCallback } from 'react';

export type DialogInstance = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
};

export const useDialog = (dialog?: DialogInstance): DialogInstance => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((op) => !op), []);

  return useMemo(() => {
    return (
      dialog ?? {
        open,
        close,
        toggle,
        isOpen,
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog, isOpen]);
};
