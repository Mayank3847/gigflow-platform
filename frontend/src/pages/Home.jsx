import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, Users, Zap, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-8 xs:py-12 sm:py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4 xs:mb-6">
            <Briefcase className="text-blue-600 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20" />
          </div>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 xs:mb-6 px-2">
            Welcome to <span className="text-blue-600">GigFlow</span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 mb-6 xs:mb-8 sm:mb-10 px-4">
            The ultimate marketplace connecting talented freelancers with exciting projects. 
            Post gigs, place bids, and build something amazing together.
          </p>

          <div className="flex flex-col xs:flex-row items-center justify-center space-y-3 xs:space-y-0 xs:space-x-3 sm:space-x-4 px-4">
            {user ? (
              <>
                <Link
                  to="/gigs"
                  className="w-full xs:w-auto bg-blue-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg hover:bg-blue-700 transition text-sm xs:text-base sm:text-lg font-semibold text-center"
                >
                  Browse Gigs
                </Link>
                <Link
                  to="/post-gig"
                  className="w-full xs:w-auto bg-white text-blue-600 px-6 xs:px-8 py-3 xs:py-4 rounded-lg hover:bg-gray-50 transition text-sm xs:text-base sm:text-lg font-semibold border-2 border-blue-600 text-center"
                >
                  Post a Gig
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full xs:w-auto bg-blue-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg hover:bg-blue-700 transition text-sm xs:text-base sm:text-lg font-semibold text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="w-full xs:w-auto bg-white text-blue-600 px-6 xs:px-8 py-3 xs:py-4 rounded-lg hover:bg-gray-50 transition text-sm xs:text-base sm:text-lg font-semibold border-2 border-blue-600 text-center"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-8 xs:py-12 sm:py-16">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center mb-8 xs:mb-12 px-2">
          Why Choose GigFlow?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
          <div className="bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center mb-3 xs:mb-4">
              <Users className="text-blue-600 w-10 h-10 xs:w-12 xs:h-12" />
            </div>
            <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-3">Flexible Roles</h3>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
              Be a client or a freelancer. Post jobs or bid on projects. The choice is yours!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center mb-3 xs:mb-4">
              <Zap className="text-blue-600 w-10 h-10 xs:w-12 xs:h-12" />
            </div>
            <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-3">Real-time Updates</h3>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
              Get instant notifications when you're hired. Stay connected with Socket.io integration.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center mb-3 xs:mb-4">
              <Shield className="text-blue-600 w-10 h-10 xs:w-12 xs:h-12" />
            </div>
            <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-3">Secure & Reliable</h3>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
              Built with JWT authentication and transaction-safe hiring logic to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;