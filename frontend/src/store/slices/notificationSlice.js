// frontend/src/store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // bell + toasts share same store
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // 🔔 Add notification / toast
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        read: false,
      });
    },

    // ♻️ Restore persisted notifications
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
    },

    // ❌ Remove ONE notification (dropdown X button)
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // ❌ Remove toast (used by NotificationToast auto-dismiss)
    removeToast: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // 🔕 Mark all as read
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    },

    // 🧹 Clear all (logout)
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  addNotification,
  setNotifications,
  removeNotification,
  removeToast,          // ✅ THIS FIXES CURRENT BUILD
  clearNotifications,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
