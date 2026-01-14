// frontend/src/store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // ➕ ADD single notification
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },

    // ✅ REQUIRED — restore notifications from localStorage
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
    },

    // 🧹 Clear all (used on logout)
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // 🔕 Mark all as read (optional UX)
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
  setNotifications,     // 🔥 THIS FIXES NETLIFY BUILD
  clearNotifications,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
