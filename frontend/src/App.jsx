import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from './hooks/useSafeSelector';
import { getMe } from './store/slices/authSlice';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext'; // ✅ Add this

import { sessionManager } from './utils/sessionManager';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import GigList from './pages/GigList';
import GigDetail from './pages/GigDetail';
import PostGig from './pages/PostGig';
import MyGigs from './pages/MyGigs';
import MyBids from './pages/MyBids';
import BidHistory from './pages/BidHistory';

function App() {
  const dispatch = useDispatch();
  const { user, authLoading } = useSafeSelector();

  useEffect(() => {
    const token = sessionManager.getToken();
    const hasSession = sessionManager.isSessionActive();

    console.log('🔄 App mounted - checking session...');
    console.log('Has token:', !!token);
    console.log('Session active:', hasSession);

    if (hasSession && token && !user) {
      console.log('♻️ Restoring user session...');
      dispatch(getMe()).catch((error) => {
        console.error('❌ Failed to restore session:', error);
      });
    } else if (!hasSession) {
      console.log('ℹ️ No active session found');
    } else if (user) {
      console.log('✅ User already authenticated:', user.name);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      sessionManager.markActive();
      console.log('✅ User authenticated:', user.name || user.email);
    } else {
      console.log('ℹ️ No user authenticated');
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
        <ToastProvider> {/* ✅ Add this wrapper */}

    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <NotificationToast />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gigs" element={<GigList />} />
          <Route path="/gigs/:id" element={<GigDetail />} />

          {/* Protected Routes */}
          <Route
            path="/post-gig"
            element={
              <PrivateRoute>
                <PostGig />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-gigs"
            element={
              <PrivateRoute>
                <MyGigs />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-bids"
            element={
              <PrivateRoute>
                <MyBids />
              </PrivateRoute>
            }
          />

          <Route
            path="/bid-history"
            element={
              <PrivateRoute>
                <BidHistory />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </SocketProvider>
    </ToastProvider>
  );
}

export default App;