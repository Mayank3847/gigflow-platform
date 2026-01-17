import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';

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
    
    console.log('🍞 Adding toast:', toast);
    setToasts((prev) => [...prev, toast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message) => {
    console.log('✅ Success toast:', message);
    addToast(message, 'success');
  }, [addToast]);
  
  const error = useCallback((message) => {
    console.log('❌ Error toast:', message);
    addToast(message, 'error');
  }, [addToast]);
  
  const info = useCallback((message) => {
    console.log('ℹ️ Info toast:', message);
    addToast(message, 'info');
  }, [addToast]);
  
  const warning = useCallback((message) => {
    console.log('⚠️ Warning toast:', message);
    addToast(message, 'warning');
  }, [addToast]);

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
    <div className="fixed bottom-6 right-6 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const styles = {
    success: {
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: 'bg-white text-green-600',
      title: '✓ Success',
      emoji: '🎉'
    },
    error: {
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: 'bg-white text-red-600',
      title: '✗ Error',
      emoji: '❌'
    },
    info: {
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      icon: <Info className="w-6 h-6" />,
      iconBg: 'bg-white text-blue-600',
      title: 'ℹ Info',
      emoji: '📬'
    },
    warning: {
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: 'bg-white text-orange-600',
      title: '⚠ Warning',
      emoji: '⚠️'
    }
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`
        bg-gradient-to-r ${style.gradient}
        text-white rounded-2xl shadow-2xl p-5 min-w-[360px] max-w-md
        transform transition-all duration-300 animate-slide-up
        border border-white border-opacity-20
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`${style.iconBg} p-3 rounded-xl shadow-lg animate-bounce-gentle`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg mb-1 flex items-center space-x-2">
            <span>{style.emoji}</span>
            <span>{style.title}</span>
          </p>
          <p className="text-sm font-medium leading-relaxed opacity-95">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-toast-progress" />
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-toast-progress {
          animation: toast-progress 5s linear;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};