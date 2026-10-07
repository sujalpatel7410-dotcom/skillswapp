import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
    info: <Info className="w-4 h-4 shrink-0" />,
};

const COLORS: Record<ToastType, { bg: string; text: string; border: string }> = {
    success: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-800 dark:text-emerald-200',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    error: {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-800 dark:text-rose-200',
        border: 'border-rose-200 dark:border-rose-800',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-800',
    },
};

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
    return (
        <div
            className="fixed bottom-24 md:bottom-6 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none"
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map(toast => {
                const colors = COLORS[toast.type];
                return (
                    <div
                        key={toast.id}
                        role="alert"
                        className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
              border text-xs font-medium leading-relaxed
              ${colors.bg} ${colors.text} ${colors.border}
              transition-all animate-in slide-in-from-bottom-2
            `}
                    >
                        {ICONS[toast.type]}
                        <span className="flex-1">{toast.message}</span>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="ml-1 opacity-50 hover:opacity-100 transition-opacity shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

interface ToastContextType {
    success: (msg: string, duration?: number) => void;
    error: (msg: string, duration?: number) => void;
    info: (msg: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts(prev => [...prev, { id, type, message, duration }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
    }, [dismiss]);

    const success = useCallback((msg: string, duration?: number) => addToast('success', msg, duration), [addToast]);
    const error = useCallback((msg: string, duration?: number) => addToast('error', msg, duration), [addToast]);
    const info = useCallback((msg: string, duration?: number) => addToast('info', msg, duration), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <Toast toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
