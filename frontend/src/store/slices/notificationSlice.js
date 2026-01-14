// frontend/src/store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // ✅ ALWAYS array
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        read: false,
      });
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    },

    setNotifications: (state, action) => {
      state.notifications = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    removeToast: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAllAsRead,
  setNotifications,
  removeToast,
} = notificationSlice.actions;

export default notificationSlice.reducer;
