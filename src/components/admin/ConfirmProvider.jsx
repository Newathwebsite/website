import { createContext, useContext, useRef, useState } from 'react';

// Shared confirm-dialog + undo-toast for the admin panel. Replaces native
// window.confirm() with a styled modal, and gives every delete action a
// few seconds to undo before the change is truly gone.
const UiContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const confirm = (opts) => new Promise((resolve) => setDialog({ ...opts, resolve }));
  const closeDialog = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const notifyUndo = (message, onUndo) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, onUndo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  };

  const undo = () => {
    toast?.onUndo?.();
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };

  return (
    <UiContext.Provider value={{ confirm, notifyUndo }}>
      {children}
      {dialog && (
        <div className="a-modal-overlay" onClick={() => closeDialog(false)}>
          <div className="a-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title || 'Are you sure?'}</h3>
            {dialog.message && <p>{dialog.message}</p>}
            <div className="a-modal-actions">
              <button type="button" className="a-btn a-btn-ghost" onClick={() => closeDialog(false)}>Cancel</button>
              <button
                type="button"
                className={`a-btn ${dialog.danger ? 'a-btn-danger-solid' : 'a-btn-primary'}`}
                onClick={() => closeDialog(true)}
              >
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="a-toast">
          <span>{toast.message}</span>
          {toast.onUndo && <button type="button" className="a-toast-undo" onClick={undo}>Undo</button>}
        </div>
      )}
    </UiContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export function useUndoToast() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUndoToast must be used within ConfirmProvider');
  return ctx.notifyUndo;
}
