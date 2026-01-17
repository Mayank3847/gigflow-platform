// frontend/src/components/NotificationToast.jsx - COMPLETE BEAUTIFUL VERSION
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { removeToast } from '../store/slices/notificationSlice';
import { CheckCircle, X, AlertCircle, Briefcase, Sparkles, DollarSign } from 'lucide-react';

const NotificationToast = () => {
  const { notifications } = useSafeSelector();
  const dispatch = useDispatch();

  // Show only recent notifications (last 5 seconds)
  const recentNotifications = notifications.filter((n) => {
    const notifTime = new Date(n.timestamp);
    const now = new Date();
    const diffSeconds = (now - notifTime) / 1000;
    return diffSeconds < 6;
  });

  useEffect(() => {
    if (recentNotifications.length > 0) {
      const latestNotif = recentNotifications[0];
      const timer = setTimeout(() => {
        dispatch(removeToast(latestNotif.id));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [recentNotifications.length, dispatch]);

  if (recentNotifications.length === 0) return null;

  const getIcon = (type) => {
    const iconClass = "w-7 h-7";
    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} />;
      case 'warning':
        return <AlertCircle className={iconClass} />;
      case 'info':
        return <Briefcase className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          iconBg: 'bg-white text-green-600',
          glow: 'shadow-green-500/50'
        };
      case 'warning':
        return {
          gradient: 'from-orange-500 via-amber-500 to-yellow-500',
          iconBg: 'bg-white text-orange-600',
          glow: 'shadow-orange-500/50'
        };
      case 'info':
        return {
          gradient: 'from-blue-500 via-indigo-500 to-purple-500',
          iconBg: 'bg-white text-blue-600',
          glow: 'shadow-blue-500/50'
        };
      default:
        return {
          gradient: 'from-gray-600 via-slate-600 to-zinc-600',
          iconBg: 'bg-white text-gray-600',
          glow: 'shadow-gray-500/50'
        };
    }
  };

  const latestToast = recentNotifications[0];
  const styles = getStyles(latestToast.type);

  return (
    <div className="fixed top-20 right-4 z-[100] animate-toast-slide-in">
      <div
        className={`
          bg-gradient-to-r ${styles.gradient}
          text-white rounded-2xl shadow-2xl ${styles.glow}
          min-w-[360px] max-w-md p-5
          border border-white border-opacity-20
          backdrop-blur-sm
          transform transition-all duration-300 hover:scale-105
        `}
      >
        <div className="flex items-start space-x-4">
          {/* Animated Icon */}
          <div className={`${styles.iconBg} p-3 rounded-xl shadow-lg animate-bounce-gentle flex-shrink-0`}>
            {getIcon(latestToast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="font-bold text-base mb-1 flex items-center space-x-2">
              {latestToast.type === 'success' && <span>🎉 Success!</span>}
              {latestToast.type === 'warning' && <span>⚠️ Notice</span>}
              {latestToast.type === 'info' && <span>📬 New Activity</span>}
            </p>
            
            {/* Message */}
            <p className="text-sm font-medium leading-relaxed opacity-95">
              {latestToast.message}
            </p>

            {/* Metadata */}
            {(latestToast.gigTitle || latestToast.bidAmount) && (
              <div className="mt-3 pt-3 border-t border-white border-opacity-30 flex flex-wrap items-center gap-2 text-xs font-semibold">
                {latestToast.gigTitle && (
                  <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[160px]">
                      {latestToast.gigTitle}
                    </span>
                  </div>
                )}
                {latestToast.bidAmount && (
                  <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>${latestToast.bidAmount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => dispatch(removeToast(latestToast.id))}
            className="hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition flex-shrink-0 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-4 h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full animate-toast-progress shadow-lg"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
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
        
        .animate-toast-slide-in {
          animation: toast-slide-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-toast-progress {
          animation: toast-progress 6s linear;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;