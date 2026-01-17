import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { removeToast } from '../store/slices/notificationSlice';
import { CheckCircle, X, AlertCircle, Briefcase } from 'lucide-react';

const NotificationToast = () => {
  const { notifications } = useSafeSelector();
  const dispatch = useDispatch();

  // Filter for toast-type notifications
  const toasts = notifications.filter((n) => n.type === 'toast' || n.showAsToast);

  useEffect(() => {
    if (toasts.length > 0) {
      const latestToast = toasts[0];
      const timer = setTimeout(() => {
        dispatch(removeToast(latestToast.id));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'info':
        return <Briefcase size={24} />;
      default:
        return <CheckCircle size={24} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  // Show only the latest toast
  const latestToast = toasts[0];

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`${getColor(
          latestToast.type || latestToast.variant || 'success'
        )} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 min-w-80 max-w-md animate-slide-in`}
      >
        {getIcon(latestToast.type || latestToast.variant || 'success')}
        <p className="flex-1 font-medium">{latestToast.message}</p>
        <button
          onClick={() => dispatch(removeToast(latestToast.id))}
          className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;