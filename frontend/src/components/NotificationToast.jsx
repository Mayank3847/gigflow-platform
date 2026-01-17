// components/NotificationToast.jsx - BEAUTIFUL ANIMATED TOASTS
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { removeToast } from '../store/slices/notificationSlice';
import { CheckCircle, X, AlertCircle, Briefcase, TrendingUp, DollarSign } from 'lucide-react';

const NotificationToast = () => {
  const { notifications } = useSafeSelector();
  const dispatch = useDispatch();

  // Filter for recent notifications (last 5 seconds)
  const recentNotifications = notifications.filter((n) => {
    const notifTime = new Date(n.timestamp);
    const now = new Date();
    const diffSeconds = (now - notifTime) / 1000;
    return diffSeconds < 5; // Show for 5 seconds
  });

  useEffect(() => {
    if (recentNotifications.length > 0) {
      const latestNotif = recentNotifications[0];
      const timer = setTimeout(() => {
        dispatch(removeToast(latestNotif.id));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [recentNotifications, dispatch]);

  if (recentNotifications.length === 0) return null;

  const getIcon = (type) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} />;
      case 'warning':
        return <AlertCircle className={iconClass} />;
      case 'info':
        return <Briefcase className={iconClass} />;
      default:
        return <TrendingUp className={iconClass} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: 'bg-white text-green-600',
          border: 'border-green-300'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
          icon: 'bg-white text-orange-600',
          border: 'border-orange-300'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: 'bg-white text-blue-600',
          border: 'border-blue-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-600 to-slate-700',
          icon: 'bg-white text-gray-600',
          border: 'border-gray-300'
        };
    }
  };

  // Show only the latest toast
  const latestToast = recentNotifications[0];
  const styles = getStyles(latestToast.type || latestToast.variant || 'success');

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div
        className={`
          ${styles.bg} 
          text-white rounded-xl shadow-2xl 
          min-w-80 max-w-md p-4
          border-2 ${styles.border}
          transform transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-3xl
        `}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`${styles.icon} p-2 rounded-lg flex-shrink-0 shadow-lg`}>
            {getIcon(latestToast.type || latestToast.variant)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight mb-1">
              {latestToast.type === 'success' && '🎉 Success!'}
              {latestToast.type === 'warning' && '⚠️ Notice'}
              {latestToast.type === 'info' && '📬 New Activity'}
            </p>
            <p className="text-sm font-medium leading-relaxed">
              {latestToast.message}
            </p>

            {/* Additional info */}
            {(latestToast.gigTitle || latestToast.bidAmount) && (
              <div className="mt-2 pt-2 border-t border-white border-opacity-30 flex items-center space-x-3 text-xs">
                {latestToast.gigTitle && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {latestToast.gigTitle}
                    </span>
                  </div>
                )}
                {latestToast.bidAmount && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>${latestToast.bidAmount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => dispatch(removeToast(latestToast.id))}
            className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white animate-progress"
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;