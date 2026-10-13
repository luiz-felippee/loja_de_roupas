import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X, PackageCheck, ArrowRight, Bell } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const isOrderUpdate = toast.type === 'order_update';
        const isSuccess = toast.type === 'success';
        const isAlert = toast.type === 'alert' || toast.type === 'error';

        if (isOrderUpdate) {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-[#131724]/98 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-250 ring-1 ring-amber-400/30"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                  <PackageCheck className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-400" />
                      Status do Pedido Atualizado
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    {toast.title}
                  </h4>

                  {toast.description && (
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {toast.description}
                    </p>
                  )}

                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <span>{toast.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors shrink-0"
                  aria-label="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#18201a]/95 border-emerald-500/30 text-emerald-200'
                : isAlert
                ? 'bg-[#291417]/95 border-rose-500/30 text-rose-200'
                : 'bg-[#1a1d26]/95 border-amber-500/30 text-zinc-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isAlert && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isAlert && <Info className="w-5 h-5 text-amber-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight leading-snug">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed truncate">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-200 p-0.5 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
