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
      state.notifications.unshift({
        ...action.payload,
        id: action.payload.id || Date.now(),
        read: false,
        timestamp: action.payload.timestamp || new Date().toISOString(),
      });
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    markAsRead: (state, action) => {
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