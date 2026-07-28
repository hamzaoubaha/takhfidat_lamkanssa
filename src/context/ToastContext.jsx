import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, ShoppingCart, X } from 'lucide-react';

const ToastContext = createContext();

function ToastItem({ id, message, type, onRemove }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        {type === 'cart' && <ShoppingCart size={18} />}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onRemove(id)} aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
