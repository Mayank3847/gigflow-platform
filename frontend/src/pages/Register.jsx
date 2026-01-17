import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../store/slices/authSlice';
import { sessionManager } from '../utils/sessionManager';
import { UserPlus, Loader } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, authLoading, authError, isAuthenticated, authMessage } = useSafeSelector();
  const { success, error, warning } = useToast();

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      sessionManager.markActive();
      success(`Account created successfully! Welcome ${user.name} 🎉`); // ✅
      navigate('/gigs');
      dispatch(reset());
    }
  }, [user, isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (authError) {
       error(authMessage || 'Registration failed. Please try again.'); // ✅
      dispatch(reset());
    }
  }, [authError, authMessage, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      warning('Password must be at least 6 characters long.'); // ✅
      return;
    }
    
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 xs:py-8 sm:py-12 px-3 xs:px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8">
        <div className="flex items-center justify-center mb-4 xs:mb-6">
          <UserPlus className="text-blue-600 w-8 h-8 xs:w-10 xs:h-10" />
        </div>
        <h2 className="text-2xl xs:text-3xl font-bold text-center mb-4 xs:mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
              required
              disabled={authLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
              required
              disabled={authLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
              required
              minLength={6}
              disabled={authLoading}
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-2 xs:py-2.5 rounded hover:bg-blue-700 transition disabled:bg-blue-300 flex items-center justify-center space-x-2 text-xs xs:text-sm sm:text-base"
          >
            {authLoading ? (
              <>
                <Loader className="animate-spin w-4 h-4 xs:w-[18px] xs:h-[18px]" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <p className="text-center mt-3 xs:mt-4 text-gray-600 text-xs xs:text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;