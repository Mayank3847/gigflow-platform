import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { sessionManager } from '../utils/sessionManager';
import { Briefcase, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionManager.clearSession();
    dispatch(logout());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

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
          <Link 
            to="/" 
            className="flex items-center space-x-1 xs:space-x-2 hover:opacity-90 transition"
          >
            <div className="bg-white p-1 xs:p-1.5 rounded-lg">
              <Briefcase size={18} className="text-blue-600 xs:w-6 xs:h-6" />
            </div>
            <span className="text-base xs:text-xl sm:text-2xl font-bold hidden xxs:block">GigFlow</span>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <>
              {/* Desktop Menu - Hidden on small screens */}
              <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
                <NavLink to="/gigs">Browse Gigs</NavLink>
                <NavLink to="/my-bids">My Bids</NavLink>
                <NavLink to="/my-gigs">My Gigs</NavLink>
                <NavLink to="/bid-history">History</NavLink>
              </div>

              {/* Desktop Right Side - Adjusted for medium screens */}
              <div className="hidden xl:flex items-center space-x-2 2xl:space-x-4">
                <Link
                  to="/post-gig"
                  className="bg-white text-blue-600 px-3 2xl:px-5 py-2 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md hover:shadow-lg text-xs 2xl:text-sm"
                >
                  + Post Gig
                </Link>

                <NotificationDropdown />

                <div className="flex items-center space-x-2 2xl:space-x-3 bg-blue-700 px-2 2xl:px-4 py-2 rounded-lg">
                  <div className="bg-blue-500 p-1 2xl:p-1.5 rounded-full">
                    <User size={14} className="2xl:w-[18px] 2xl:h-[18px]" />
                  </div>
                  <span className="font-medium text-xs 2xl:text-sm max-w-[100px] truncate">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 2xl:space-x-2 bg-red-500 hover:bg-red-600 px-2 2xl:px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  <LogOut size={14} className="2xl:w-[18px] 2xl:h-[18px]" />
                  <span className="text-xs 2xl:text-sm">Logout</span>
                </button>
              </div>

              {/* Tablet/Mobile Right Side */}
              <div className="xl:hidden flex items-center space-x-2 xs:space-x-3">
                <NotificationDropdown />
                
                <button
                  className="p-1.5 xs:p-2 hover:bg-blue-700 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={20} className="xs:w-6 xs:h-6" /> : <Menu size={20} className="xs:w-6 xs:h-6" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Not Logged In - Desktop */}
              <div className="hidden md:flex items-center space-x-2 xs:space-x-4">
                <Link 
                  to="/gigs" 
                  className="text-blue-100 hover:text-white transition text-xs xs:text-sm sm:text-base"
                >
                  Browse Gigs
                </Link>
                <Link
                  to="/login"
                  className="text-blue-100 hover:text-white transition px-2 xs:px-4 py-2 text-xs xs:text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-3 xs:px-6 py-2 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md text-xs xs:text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </div>

              {/* Not Logged In - Mobile */}
              <button
                className="md:hidden p-1.5 xs:p-2 hover:bg-blue-700 rounded-lg transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} className="xs:w-6 xs:h-6" /> : <Menu size={20} className="xs:w-6 xs:h-6" />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 xs:py-4 space-y-2 border-t border-blue-500">
            {user ? (
              <>
                <div className="bg-blue-700 px-3 xs:px-4 py-2 xs:py-3 rounded-lg mb-3">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="xs:w-5 xs:h-5" />
                    <span className="font-medium text-xs xs:text-sm sm:text-base">{user.name}</span>
                  </div>
                </div>
                <Link
                  to="/gigs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm sm:text-base ${
                    isActive('/gigs') ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  Browse Gigs
                </Link>
                <Link
                  to="/my-bids"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm sm:text-base ${
                    isActive('/my-bids') ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  My Bids
                </Link>
                <Link
                  to="/my-gigs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm sm:text-base ${
                    isActive('/my-gigs') ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  My Posted Gigs
                </Link>
                <Link
                  to="/bid-history"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm sm:text-base ${
                    isActive('/bid-history') ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  Bid History
                </Link>
                <Link
                  to="/post-gig"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-white text-blue-600 px-3 xs:px-4 py-2 rounded-lg hover:bg-blue-50 transition font-semibold text-center text-xs xs:text-sm sm:text-base"
                >
                  + Post a Gig
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 px-3 xs:px-4 py-2 rounded-lg transition mt-4 text-xs xs:text-sm sm:text-base"
                >
                  <LogOut size={16} className="xs:w-[18px] xs:h-[18px]" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/gigs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 xs:px-4 py-2 rounded-lg hover:bg-blue-700 text-xs xs:text-sm sm:text-base"
                >
                  Browse Gigs
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 xs:px-4 py-2 rounded-lg hover:bg-blue-700 text-xs xs:text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-white text-blue-600 px-3 xs:px-4 py-2 rounded-lg hover:bg-blue-50 transition font-semibold text-center text-xs xs:text-sm sm:text-base"
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