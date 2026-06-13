// Bridges the React ToastContext to non-React modules (the axios interceptor)
// so client-validation errors (400/422) can surface as a toast.
let toastFn = null;

export const registerToast = (fn) => {
  toastFn = fn;
};

export const notify = (message, type = 'info') => {
  if (typeof toastFn === 'function') {
    toastFn(message, type);
  }
};
