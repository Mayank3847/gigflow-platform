import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      console.log('❌ No authenticated user — socket not initialized');
      return;
    }

    if (socketRef.current) return; // ⛔ Prevent duplicate sockets

    console.log('🔌 Initializing socket for user:', user._id);

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

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

    socket.on('hired', (data) => {
      dispatch(addNotification({
        id: Date.now(),
        message: data.message,
        type: 'success',
        timestamp: data.timestamp,
        gigId: data.gigId,
      }));
    });

    socket.on('newBid', (data) => {
      dispatch(addNotification({
        id: Date.now(),
        message: data.message,
        type: 'info',
        timestamp: data.timestamp,
        gigId: data.gigId,
      }));
    });

    socket.on('bidRejected', (data) => {
      dispatch(addNotification({
        id: Date.now(),
        message: data.message,
        type: 'warning',
        timestamp: data.timestamp,
        gigId: data.gigId,
      }));
    });

    return () => {
      if (socketRef.current) {
        console.log('🔌 Cleaning up socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
