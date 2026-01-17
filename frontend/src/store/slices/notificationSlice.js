// frontend/src/store/slices/notificationSlice.js - COMPLETE VERSION
import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      if (!action.payload) {
        console.warn('⚠️ No payload provided to addNotification');
        return;
      }
      
      console.log('📬 Adding notification to Redux state:', action.payload);
      
      const notification = {
        ...action.payload,
        id: action.payload.id || `${Date.now()}_${Math.random()}`,
        read: false,
        timestamp: action.payload.timestamp || new Date().toISOString(),
      };
      
      state.notifications.unshift(notification);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
      
      console.log('✅ Notification added. Total:', state.notifications.length, 'Unread:', state.unreadCount);
    },
    
    removeNotification: (state, action) => {
      console.log('🗑️ Removing notification:', action.payload);
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    
    clearNotifications: (state) => {
      console.log('🧹 Clearing all notifications');
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    markAllAsRead: (state) => {
      console.log('📖 Marking all as read');
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    
    markAsRead: (state, action) => {
      console.log('📖 Marking as read:', action.payload);
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    
    setNotifications: (state, action) => {
      if (!Array.isArray(action.payload)) {
        console.warn('⚠️ setNotifications received non-array:', action.payload);
        state.notifications = [];
        state.unreadCount = 0;
        return;
      }
      console.log('📋 Setting notifications:', action.payload.length);
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    
    removeToast: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAllAsRead,
  markAsRead,
  setNotifications,
  removeToast,
  updateUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;