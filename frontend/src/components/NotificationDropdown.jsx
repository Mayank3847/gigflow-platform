import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, X, CheckCircle, AlertCircle, Briefcase, Trash2 } from 'lucide-react';
import { removeNotification, clearNotifications } from '../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const iconClass = "w-4 h-4 xs:w-5 xs:h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'info':
        return <Briefcase className={`${iconClass} text-blue-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'warning':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.gigId) {
      if (notification.notificationType === 'new_bid') {
        navigate('/my-gigs');
      } else {
        navigate(`/gigs/${notification.gigId}`);
      }
      setIsOpen(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 xs:p-2 hover:bg-blue-700 rounded-lg transition"
      >
        <Bell className="w-5 h-5 xs:w-[22px] xs:h-[22px]" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] xs:text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center font-bold animate-pulse">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-16px)] xxs:w-80 xs:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[70vh] xs:max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 xs:p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 xs:w-5 xs:h-5" />
              <h3 className="font-bold text-sm xs:text-base sm:text-lg">Notifications</h3>
              {notifications.length > 0 && (
                <span className="bg-white text-blue-600 text-[10px] xs:text-xs font-bold px-2 py-0.5 xs:py-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all notifications?')) {
                    dispatch(clearNotifications());
                  }
                }}
                className="hover:bg-blue-800 p-1 xs:p-1.5 rounded transition"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4 xs:w-[18px] xs:h-[18px]" />
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 xs:p-8 text-center">
                <Bell className="mx-auto text-gray-300 w-10 h-10 xs:w-12 xs:h-12 mb-3" />
                <p className="text-gray-500 font-medium text-xs xs:text-sm">No notifications yet</p>
                <p className="text-gray-400 text-[10px] xs:text-xs mt-1">
                  You'll be notified about new bids and hires
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 xs:p-4 border-l-4 cursor-pointer transition ${getNotificationBg(
                      notification.type
                    )}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-2 xs:space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs xs:text-sm text-gray-800 font-medium break-words">
                          {notification.message}
                        </p>
                        {notification.gigTitle && (
                          <p className="text-[10px] xs:text-xs text-gray-600 mt-1 truncate">
                            Gig: {notification.gigTitle}
                          </p>
                        )}
                        <p className="text-[10px] xs:text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeNotification(notification.id));
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                      >
                        <X className="w-3 h-3 xs:w-4 xs:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;