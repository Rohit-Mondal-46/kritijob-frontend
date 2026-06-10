import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
};

// Errors/warnings linger longer so users can actually read them.
const DURATIONS = {
    error: 6000,
    warning: 5000,
    success: 3000,
    info: 3500,
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    // Tracks recently shown "message|type" keys to suppress duplicates that
    // fire near-simultaneously (e.g. an interceptor + a component catch block).
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
        setTimeout(() => removeToast(id), DURATIONS[type] || 3500);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
                        <i className={ICONS[toast.type] || ICONS.info}></i>
                        <span>{toast.message}</span>
                        <button
                            type="button"
                            className="toast-close"
                            aria-label="Dismiss notification"
                            onClick={() => removeToast(toast.id)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
