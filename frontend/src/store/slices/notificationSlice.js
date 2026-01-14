// frontend/src/store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // ➕ Add one notification
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        read: false,
      });
    },

    // ♻️ Restore notifications (used by SocketContext)
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
    },

    // ❌ Remove single notification (used by NotificationDropdown)
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // 🧹 Clear all notifications (logout / clear-all)
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // 🔕 Mark all as read
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    },
  },
});

export const {
  addNotification,
  setNotifications,
  removeNotification,   // 🔥 THIS FIXES CURRENT BUILD
  clearNotifications,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
