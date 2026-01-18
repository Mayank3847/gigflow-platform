// frontend/src/components/NotificationDropdown.jsx - FIXED WITH PERSISTENCE
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
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  removeNotification, 
  clearNotifications, 
  markAsRead,
  markAllAsRead,
  setNotifications 
} from '../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, user } = useSafeSelector();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ✅ Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // ✅ Helper to get storage key
  const getStorageKey = () => `notifications_${user?._id}`;

  // ✅ Helper to sync Redux state to localStorage
  const syncToLocalStorage = (updatedNotifications) => {
    if (!user?._id) return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedNotifications));
      console.log('💾 Notifications synced to localStorage');
    } catch (error) {
      console.error('❌ Failed to sync to localStorage:', error);
    }
  };

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

  const getNotificationStyle = (type, isUnread) => {
    const baseStyle = "rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1";
    const unreadRing = isUnread ? "ring-2 ring-blue-400 ring-offset-2" : "";
    
    switch (type) {
      case 'success':
        return `${baseStyle} ${unreadRing} bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 hover:from-green-100 hover:via-emerald-100 hover:to-teal-100`;
      case 'warning':
        return `${baseStyle} ${unreadRing} bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-l-4 border-orange-500 hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100`;
      case 'info':
        return `${baseStyle} ${unreadRing} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100`;
      default:
        return `${baseStyle} ${unreadRing} bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border-l-4 border-gray-400 hover:from-gray-100 hover:via-slate-100 hover:to-zinc-100`;
    }
  };

  const handleNotificationClick = (notification) => {
    // ✅ Mark as read in Redux
    dispatch(markAsRead(notification.id));
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    syncToLocalStorage(updatedNotifications);
    
    // ✅ Navigate if gig exists
    if (notification.gigId) {
      navigate(`/gigs/${notification.gigId}`);
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
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      dispatch(clearNotifications());
      
      // ✅ Clear from localStorage
      if (user?._id) {
        localStorage.removeItem(getStorageKey());
        console.log('🧹 All notifications cleared from storage');
      }
    }
  };

  const handleMarkAllRead = () => {
    // ✅ Mark all as read in Redux
    dispatch(markAllAsRead());
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    syncToLocalStorage(updatedNotifications);
    
    // ✅ Call socket context callback if provided
    if (onMarkAllRead) {
      onMarkAllRead();
    }
    
    console.log('✅ All notifications marked as read');
  };

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    
    // ✅ Remove from Redux
    dispatch(removeNotification(notificationId));
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    syncToLocalStorage(updatedNotifications);
    
    console.log('🗑️ Notification removed:', notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button with Pulsing Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-blue-700 rounded-lg transition-all duration-200 group"
      >
        <Bell className={`w-6 h-6 transition-transform ${unreadCount > 0 ? 'animate-wiggle' : ''} group-hover:scale-110`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse shadow-lg ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Beautiful Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[36rem] overflow-hidden flex flex-col animate-slideIn">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2.5 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-blue-100 font-medium">
                      {unreadCount} new {unreadCount === 1 ? 'update' : 'updates'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition backdrop-blur-sm"
                    title="Clear all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 p-3 bg-gradient-to-b from-gray-50 to-white">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Bell className="text-gray-400 w-10 h-10" />
                </div>
                <p className="text-gray-600 font-semibold text-lg mb-2">All caught up!</p>
                <p className="text-gray-400 text-sm">
                  No new notifications right now
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={getNotificationStyle(notification.type, !notification.read)}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-lg shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Message */}
                        <p className="text-sm text-gray-800 font-semibold leading-tight mb-2">
                          {notification.message}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          {notification.gigTitle && (
                            <div className="flex items-center space-x-1 bg-white bg-opacity-60 px-2 py-1 rounded-lg">
                              <Briefcase className="w-3 h-3" />
                              <span className="truncate max-w-[150px] font-medium">
                                {notification.gigTitle}
                              </span>
                            </div>
                          )}
                          {notification.bidAmount && (
                            <div className="flex items-center space-x-1 bg-white bg-opacity-60 px-2 py-1 rounded-lg">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-semibold">${notification.bidAmount}</span>
                            </div>
                          )}
                          {notification.freelancerName && (
                            <div className="flex items-center space-x-1 bg-white bg-opacity-60 px-2 py-1 rounded-lg">
                              <span className="font-medium">{notification.freelancerName}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                          </div>
                        </div>

                        {/* Unread Badge */}
                        {!notification.read && (
                          <div className="mt-2">
                            <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                              NEW
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-white hover:bg-opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-gray-50 to-blue-50">
              <button
                onClick={handleMarkAllRead}
                className="w-full text-center text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold py-2.5 px-4 rounded-xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                ✓ Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;