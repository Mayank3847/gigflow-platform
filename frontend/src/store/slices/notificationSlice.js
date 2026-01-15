// src/redux/slices/notificationSlice.js - FINAL FIXED VERSION
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // ✅ ALWAYS array - CRITICAL
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add a new notification
     */
    addNotification: (state, action) => {
      // ✅ DEFENSIVE: Ensure we have valid payload
      if (!action.payload) {
        console.warn('⚠️ No payload provided to addNotification');
        return;
      }

      state.notifications.unshift({
        ...action.payload,
        id: action.payload.id || Date.now(),
        read: false,
        timestamp: action.payload.timestamp || new Date().toISOString(),
      });
      
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },

    /**
     * Remove a specific notification
     */
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
      state.unreadCount = 0;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },

    /**
     * Set notifications from external source (e.g., socket)
     */
    setNotifications: (state, action) => {
      // ✅ DEFENSIVE: Ensure payload is array
      if (!Array.isArray(action.payload)) {
        console.warn('⚠️ setNotifications received non-array:', action.payload);
        state.notifications = [];
        state.unreadCount = 0;
        return;
      }
      
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },

    /**
     * Remove toast notification (alias for removeNotification)
     */
    removeToast: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },

    /**
     * Update unread count
     */
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