import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
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

function AppContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ FIX: Do NOT force logout on refresh
  useEffect(() => {
    const isExistingSession = sessionManager.initSession();

    if (isExistingSession) {
      console.log('🔄 Existing session - checking authentication');
      dispatch(getMe());
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      sessionManager.markActive();
      console.log('✅ User authenticated:', user.name);
    } else {
      console.log('❌ No user authenticated');
    }
  }, [user]);

  return (
    <SocketProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <NotificationToast />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/gigs" element={<GigList />} />
            <Route path="/gigs/:id" element={<GigDetail />} />

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
      </ToastProvider>
    </SocketProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
