// frontend/src/context/ToastContext.jsx - BEAUTIFUL TOAST SYSTEM
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: <CheckCircle className="w-5 h-5" />,
      title: '✓ Success'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-600',
      icon: <AlertCircle className="w-5 h-5" />,
      title: '✗ Error'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: <Info className="w-5 h-5" />,
      title: 'ℹ Info'
    },
    warning: {
      bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
      icon: <AlertCircle className="w-5 h-5" />,
      title: '⚠ Warning'
    }
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`
        ${style.bg} text-white rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md
        transform transition-all duration-300 animate-slide-in-right
        flex items-start space-x-3
      `}
    >
      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm mb-1">{style.title}</p>
        <p className="text-sm opacity-95">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};