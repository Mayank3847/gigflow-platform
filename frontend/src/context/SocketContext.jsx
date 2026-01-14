import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      console.log('🔌 Initializing socket connection for user:', user._id);
      
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        newSocket.emit('join', user._id);
        console.log('📡 Joined room:', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnected(false);
      });

      // Listen for hired notifications
      newSocket.on('hired', (data) => {
        console.log('🎉 HIRED notification received:', data);
        dispatch(addNotification({
          id: Date.now(),
          message: data.message,
          type: 'success',
          timestamp: data.timestamp,
          gigTitle: data.gigTitle,
          gigId: data.gigId,
          notificationType: 'hired'
        }));
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 You Got Hired!', {
            body: data.message,
            icon: '/vite.svg'
          });
        }
      });

      // Listen for new bid notifications (for gig owners)
      newSocket.on('newBid', (data) => {
        console.log('💼 NEW BID notification received:', data);
        dispatch(addNotification({
          id: Date.now(),
          message: data.message,
          type: 'info',
          timestamp: data.timestamp,
          gigTitle: data.gigTitle,
          gigId: data.gigId,
          bidId: data.bidId,
          notificationType: 'new_bid'
        }));

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💼 New Bid Received!', {
            body: data.message,
            icon: '/vite.svg'
          });
        }
      });

      // Listen for bid rejected notifications - IMPORTANT!
      newSocket.on('bidRejected', (data) => {
        console.log('⚠️ BID REJECTED notification received:', data);
        dispatch(addNotification({
          id: Date.now(),
          message: data.message,
          type: 'warning',
          timestamp: data.timestamp,
          gigTitle: data.gigTitle,
          gigId: data.gigId,
          bidId: data.bidId,
          notificationType: 'rejected',
          canResubmit: data.canResubmit
        }));

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bid Rejected', {
            body: data.message,
            icon: '/vite.svg'
          });
        }
      });

      // Listen for bid updated notifications (for gig owners)
      newSocket.on('bidUpdated', (data) => {
        console.log('📝 BID UPDATED notification received:', data);
        dispatch(addNotification({
          id: Date.now(),
          message: data.message,
          type: 'info',
          timestamp: data.timestamp,
          gigTitle: data.gigTitle,
          gigId: data.gigId,
          bidId: data.bidId,
          notificationType: 'bid_updated'
        }));
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Closing socket connection');
        newSocket.close();
      };
    } else {
      console.log('❌ No user, socket not initialized');
    }
  }, [user, dispatch]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};