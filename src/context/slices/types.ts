import type { ToastMessage } from '../../types';

/** Assinatura do addToast do StoreContext, usada pelos hooks de fatia. */
export type AddToast = (
  title: string,
  description?: string,
  type?: ToastMessage['type'],
  action?: { label: string; onClick: () => void },
  duration?: number
) => void;
