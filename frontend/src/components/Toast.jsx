import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          icon: <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6" />,
          progress: 'bg-green-300'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: <XCircle className="w-5 h-5 xs:w-6 xs:h-6" />,
          progress: 'bg-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          icon: <AlertCircle className="w-5 h-5 xs:w-6 xs:h-6" />,
          progress: 'bg-orange-300'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: <Info className="w-5 h-5 xs:w-6 xs:h-6" />,
          progress: 'bg-blue-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: <Info className="w-5 h-5 xs:w-6 xs:h-6" />,
          progress: 'bg-gray-300'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-16 xs:top-20 right-2 xs:right-4 z-[9999] animate-slide-in-right max-w-[calc(100vw-16px)] xs:max-w-md">
      <div className={`${styles.bg} text-white px-3 xs:px-4 sm:px-6 py-3 xs:py-4 rounded-xl shadow-2xl w-full`}>
        <div className="flex items-start space-x-2 xs:space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs xs:text-sm leading-relaxed break-words">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition"
          >
            <X className="w-4 h-4 xs:w-[18px] xs:h-[18px]" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 xs:mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${styles.progress} animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;