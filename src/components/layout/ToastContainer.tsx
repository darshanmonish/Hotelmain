import React from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Toast } from '@/types';

export default function ToastContainer() {
  const { toasts } = useAppContext();

  const getToastInfo = (type: Toast['type']) => {
    switch (type) {
        case 'success': return { icon: <Check size={16} />, className: 'border-emerald-200 dark:border-emerald-800/50 border-l-4 border-l-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
        case 'warning': return { icon: <Trash2 size={16} />, className: 'border-amber-200 dark:border-amber-800/50 border-l-4 border-l-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
        case 'error': return { icon: <X size={16} />, className: 'border-rose-200 dark:border-rose-800/50 border-l-4 border-l-rose-500', iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' };
        default: return { icon: <Check size={16} />, className: 'border-slate-200 dark:border-slate-700', iconBg: 'bg-slate-100 dark:bg-slate-700' };
    }
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 md:px-0">
      {toasts.map((t: Toast) => {
        const { icon, className, iconBg } = getToastInfo(t.type);
        return (
          <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-2xl soft-shadow animate-slide-up pointer-events-auto backdrop-blur-md text-sm font-semibold border bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white ${className}`}>
            <div className={`p-1 rounded-full ${iconBg}`}>{icon}</div>
            <div className="flex-1">{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
