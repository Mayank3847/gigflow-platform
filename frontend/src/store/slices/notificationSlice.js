import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [], // Stored notifications (for bell dropdown)
    toasts: [], // Temporary toast notifications
  },
  reducers: {
    addNotification: (state, action) => {
      // Add to stored notifications
      state.notifications.unshift(action.payload);
      // Also add to toasts for temporary display
      state.toasts.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      // Remove from stored notifications
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
    removeToast: (state, action) => {
      // Remove from toasts only
      state.toasts = state.toasts.filter(
        (notif) => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { 
  addNotification, 
  removeNotification, 
  removeToast,
  clearNotifications,
  clearToasts 
} = notificationSlice.actions;

export default notificationSlice.reducer;