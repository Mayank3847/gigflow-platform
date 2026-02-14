import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { logout } from '../store/slices/authSlice';
import { sessionManager } from '../utils/sessionManager';
import { Briefcase, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, isAuthenticated } = useSafeSelector(); // ✅ REMOVED notifications and unreadCount
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionManager.clearSession();
    dispatch(logout());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-2 xxs:px-3 xs:px-4 py-2 rounded-lg transition-all duration-200 text-xs xs:text-sm sm:text-base ${
        isActive(to)
          ? 'bg-blue-700 text-white font-semibold'
          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 xxs:px-3 xs:px-4">
        <div className="flex items-center justify-between h-14 xs:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2">
            <div className="bg-white p-1 xs:p-1.5 rounded-lg">
              <Briefcase size={18} className="text-blue-600 xs:w-6 xs:h-6" />
            </div>
            <span className="text-base xs:text-xl sm:text-2xl font-bold hidden xxs:block">
              GigFlow
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
                <NavLink to="/gigs">Browse Gigs</NavLink>
                <NavLink to="/my-bids">My Bids</NavLink>
                <NavLink to="/my-gigs">My Gigs</NavLink>
                <NavLink to="/bid-history">History</NavLink>
              </div>

              {/* Desktop Right */}
              <div className="hidden xl:flex items-center space-x-2 2xl:space-x-4">
                <Link
                  to="/post-gig"
                  className="bg-white text-blue-600 px-3 2xl:px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition"
                >
                  + Post Gig
                </Link>

                {/* ✅ FIXED: Notification Dropdown - Only pass onMarkAllRead */}
                <NotificationDropdown onMarkAllRead={socket?.markAllAsRead} />

                <div className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg">
                  <User size={14} />
                  <span className="text-xs truncate max-w-[100px]">
                    {user?.name || user?.email || 'User'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                >
                  <LogOut size={14} />
                  <span className="text-xs">Logout</span>
                </button>
              </div>

              {/* Mobile Right */}
              <div className="xl:hidden flex items-center space-x-2">
                {/* ✅ FIXED: Notification Dropdown - Only pass onMarkAllRead */}
                <NotificationDropdown onMarkAllRead={socket?.markAllAsRead} />
                <button
                  className="p-2 hover:bg-blue-700 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Not Logged In */}
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  to="/gigs"
                  className="hover:text-gray-200 transition"
                >
                  Browse Gigs
                </Link>
                <Link 
                  to="/login"
                  className="hover:text-gray-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Sign Up
                </Link>
              </div>
              <button
                className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 space-y-2 border-t border-blue-500">
            {isAuthenticated ? (
              <>
                <div className="block py-2 text-sm font-semibold border-b border-blue-500 mb-2">
                  Welcome, {user?.name || 'User'}
                </div>
                <NavLink to="/gigs" onClick={() => setMobileMenuOpen(false)}>
                  Browse Gigs
                </NavLink>
                <NavLink to="/my-bids" onClick={() => setMobileMenuOpen(false)}>
                  My Bids
                </NavLink>
                <NavLink to="/my-gigs" onClick={() => setMobileMenuOpen(false)}>
                  My Gigs
                </NavLink>
                <NavLink
                  to="/bid-history"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </NavLink>
                <Link
                  to="/post-gig"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-white text-blue-600 py-2 rounded-lg mt-2 text-center font-semibold hover:bg-gray-100 transition"
                >
                  + Post a Gig
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 py-2 rounded-lg mt-2 hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/gigs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-4 hover:bg-blue-700 rounded"
                >
                  Browse Gigs
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-4 hover:bg-blue-700 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-white text-blue-600 py-2 rounded-lg mt-2 text-center font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
