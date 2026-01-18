// frontend/src/context/SocketContext.jsx - COMPLETE FIXED VERSION WITH PERSISTENCE
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import {
  addNotification,
  setNotifications,
  clearNotifications,
  markAllAsRead as markAllAsReadAction,
} from '../store/slices/notificationSlice';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

const getStorageKey = (userId) => `notifications_${userId}`;

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useSafeSelector();
  const dispatch = useDispatch();

  // ✅ Mark all as read with localStorage sync
  const markAllAsRead = useCallback(() => {
    if (!user?._id) return;
    
    console.log('📖 Marking all notifications as read...');
    
    const storageKey = getStorageKey(user._id);
    const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
    const updated = existing.map((n) => ({ ...n, read: true }));
    
    // ✅ Sync to localStorage first
    localStorage.setItem(storageKey, JSON.stringify(updated));
    console.log('💾 Marked all as read in localStorage');
    
    // ✅ Update Redux
    dispatch(markAllAsReadAction());
    dispatch(setNotifications(updated));
    
    console.log('✅ All notifications marked as read');
  }, [user, dispatch]);

  // ✅ Clear notifications on logout
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

  // ✅ Initialize socket and restore notifications
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      console.log('⏳ Waiting for authenticated user before socket init');
      return;
    }

    if (socketRef.current) {
      console.log('⚠️ Socket already exists, skipping');
      return;
    }

    console.log('🔌 Initializing socket for user:', user._id);
    const storageKey = getStorageKey(user._id);

    // ✅ Restore notifications from localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch(setNotifications(parsed));
        console.log('♻️ Restored', parsed.length, 'notifications from storage');
        
        const unreadCount = parsed.filter(n => !n.read).length;
        console.log('📊 Unread notifications:', unreadCount);
      } catch (error) {
        console.warn('⚠️ Failed to parse stored notifications:', error);
        localStorage.removeItem(storageKey);
      }
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to:', API_URL);

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join', user._id);
      console.log('📡 Joined room:', user._id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnected(false);
    });

    // ✅ Central notification handler with localStorage persistence
    const handleNotification = (payload, type) => {
      console.log('🔔 NOTIFICATION RECEIVED:', type, payload);

      const notification = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        message: payload.message,
        type: type,
        timestamp: payload.timestamp || new Date().toISOString(),
        gigId: payload.gigId,
        gigTitle: payload.gigTitle,
        bidAmount: payload.bidAmount,
        freelancerName: payload.freelancerName,
        clientName: payload.clientName,
        read: false,
      };

      console.log('📬 Adding notification to Redux:', notification);

      // ✅ Add to Redux
      dispatch(addNotification(notification));

      // ✅ Persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
        const updated = [notification, ...existing].slice(0, 50); // Keep last 50
        localStorage.setItem(storageKey, JSON.stringify(updated));
        console.log('💾 Notification saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save notification to localStorage:', error);
      }

      // ✅ Send acknowledgment to backend
      socket.emit('notification:ack', {
        notificationId: notification.id,
        userId: user._id,
        type,
      });
    };

    // ✅ Listen to ALL notification events
    socket.on('newBid', (data) => {
      console.log('📨 newBid event received:', data);
      handleNotification(data, 'info');
    });

    socket.on('hired', (data) => {
      console.log('🎉 hired event received:', data);
      handleNotification(data, 'success');
    });

    socket.on('bidRejected', (data) => {
      console.log('⚠️ bidRejected event received:', data);
      handleNotification(data, 'warning');
    });

    // ✅ Generic notification handler
    socket.on('notification', (data) => {
      console.log('📬 Generic notification received:', data);
      handleNotification(data, data.type || 'info');
    });

    // ✅ Cleanup on unmount
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
        markAllAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};