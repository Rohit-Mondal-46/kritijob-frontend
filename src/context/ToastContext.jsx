import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
};

// How long each toast type stays on screen (ms). Errors/warnings linger longer.
const DURATIONS = {
    error: 6000,
    warning: 5000,
    success: 3500,
    info: 3500,
};

// Each toast owns its own dismiss timer, tied to its mount/unmount lifecycle.
// This is more robust than a setTimeout fired at creation time.
const ToastItem = ({ toast, onDismiss }) => {
    useEffect(() => {
        const duration = DURATIONS[toast.type] || 3500;
        const timer = setTimeout(() => onDismiss(toast.id), duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.type, onDismiss]);

    return (
        <div className={`toast toast-${toast.type}`} role="alert">
            <i className={ICONS[toast.type] || ICONS.info}></i>
            <span>{toast.message}</span>
            <button
                type="button"
                className="toast-close"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
            >
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    // Tracks recently shown "type|message" keys to suppress duplicate toasts
    // fired in quick succession.
    const recentRef = useRef(new Map());

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info') => {
        if (!message) return;
        const text = typeof message === 'string' ? message : String(message);
        const key = `${type}|${text}`;
        const now = Date.now();

        // De-duplicate identical toasts shown within a 1.5s window.
        const lastShown = recentRef.current.get(key);
        if (lastShown && now - lastShown < 1500) return;
        recentRef.current.set(key, now);

        const id = `${now}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts(prev => [...prev, { id, message: text, type }]);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
