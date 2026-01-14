import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import {
  addNotification,
  setNotifications,
  clearNotifications,
} from '../store/slices/notificationSlice';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

// 🔑 Per-user notification storage
const getStorageKey = (userId) => `notifications_${userId}`;

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ======================================================
  // 🔕 MARK ALL AS READ
  // ======================================================
  const markAllAsRead = useCallback(() => {
    if (!user?._id) return;

    const storageKey = getStorageKey(user._id);
    const existing = JSON.parse(localStorage.getItem(storageKey)) || [];

    const updated = existing.map((n) => ({
      ...n,
      read: true,
    }));

    localStorage.setItem(storageKey, JSON.stringify(updated));
    dispatch(setNotifications(updated));
  }, [user, dispatch]);

  // ======================================================
  // 🧹 CLEAR ON LOGOUT
  // ======================================================
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      console.log('🧹 Clearing notifications + socket on logout');

      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);

      dispatch(clearNotifications());

      if (user?._id) {
        localStorage.removeItem(getStorageKey(user._id));
      }
    }
  }, [isAuthenticated, user, dispatch]);

  // ======================================================
  // 🔌 SOCKET INIT
  // ======================================================
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      console.log('⏳ Waiting for authenticated user before socket init');
      return;
    }

    if (socketRef.current) return; // ⛔ no duplicates

    console.log('🔌 Initializing socket for user:', user._id);

    const storageKey = getStorageKey(user._id);

    // ♻️ Restore notifications
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        dispatch(setNotifications(JSON.parse(saved)));
        console.log('♻️ Notifications restored');
      } catch {
        console.warn('⚠️ Failed to parse stored notifications');
      }
    }

    const socket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5000',
      {
        transports: ['websocket'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join', user._id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    // ======================================================
    // 🔔 CENTRAL NOTIFICATION HANDLER
    // ======================================================
    const handleNotification = (payload, type) => {
      const notification = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        message: payload.message,
        type,
        timestamp: payload.timestamp || new Date().toISOString(),
        gigId: payload.gigId,
        read: false,
      };

      // 1️⃣ Redux
      dispatch(addNotification(notification));

      // 2️⃣ Persist per user
      const existing =
        JSON.parse(localStorage.getItem(storageKey)) || [];

      localStorage.setItem(
        storageKey,
        JSON.stringify([notification, ...existing])
      );

      // 3️⃣ ACK BACK TO SERVER (delivery confirmed)
      socket.emit('notification:ack', {
        notificationId: notification.id,
        userId: user._id,
        type,
      });
    };

    // ======================================================
    // 📡 SOCKET EVENTS
    // ======================================================
    socket.on('newBid', (data) => {
      console.log('📨 newBid');
      handleNotification(data, 'info');
    });

    socket.on('hired', (data) => {
      console.log('🎉 hired');
      handleNotification(data, 'success');
    });

    socket.on('bidRejected', (data) => {
      console.log('⚠️ bidRejected');
      handleNotification(data, 'warning');
    });

    return () => {
      if (socketRef.current) {
        console.log('🔌 Cleaning up socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, isAuthenticated, dispatch]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        markAllAsRead, // 🔕 exposed to UI
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
