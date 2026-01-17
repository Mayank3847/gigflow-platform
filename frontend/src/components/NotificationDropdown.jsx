// components/NotificationDropdown.jsx - BEAUTIFUL CARD UI
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  Trash2,
  DollarSign,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { removeNotification, clearNotifications, markAsRead } from '../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useSafeSelector();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

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
    const iconClass = "w-5 h-5";
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

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:from-green-100 hover:to-emerald-100';
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 hover:from-orange-100 hover:to-amber-100';
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 hover:from-blue-100 hover:to-indigo-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 hover:from-gray-100 hover:to-slate-100';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    dispatch(markAsRead(notification.id));
    
    // Navigate if has gigId
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

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      dispatch(clearNotifications());
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-blue-700 rounded-lg transition-all duration-200"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-blue-100">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                title="Clear all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  You'll be notified about new bids and hires
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      ${getNotificationStyle(notification.type)}
                      rounded-lg p-4 cursor-pointer transition-all duration-200
                      shadow-sm hover:shadow-md
                      ${!notification.read ? 'ring-2 ring-blue-200' : ''}
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Additional info */}
                        <div className="mt-2 flex items-center space-x-3 text-xs text-gray-600">
                          {notification.gigTitle && (
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">
                                {notification.gigTitle}
                              </span>
                            </div>
                          )}
                          {notification.bidAmount && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${notification.bidAmount}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                          </div>
                        </div>

                        {!notification.read && (
                          <div className="mt-2">
                            <span className="inline-flex items-center text-xs font-semibold text-blue-600">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                              New
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeNotification(notification.id));
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-white hover:bg-opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <button
                onClick={() => {
                  if (onMarkAllRead) onMarkAllRead();
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;