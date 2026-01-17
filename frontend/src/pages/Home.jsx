import { Link } from 'react-router-dom';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react';

import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';


const Home = () => {
  const socket = useSocket();
  const { success, info } = useToast();
  const { user } = useSafeSelector();

  const testSocketConnection = () => {
    if (socket?.connected) {
      success('Socket is connected! ✅');
      console.log('Socket ID:', socket.socket?.id);
      console.log('User ID:', user?._id);
    } else {
      info('Socket not connected. Try logging in.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Next <span className="text-blue-600">Gig</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with talented freelancers or find your next project.
            GigFlow makes it simple.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/gigs"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  Browse Gigs
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/post-gig"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
                >
                  Post a Gig
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/gigs"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
                >
                  Browse Gigs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Post Gigs</h3>
            <p className="text-gray-600">
              Describe your project and get bids from qualified freelancers
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Find Talent</h3>
            <p className="text-gray-600">
              Review proposals and hire the perfect freelancer for your needs
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Grow Together</h3>
            <p className="text-gray-600">
              Build long-term relationships and grow your business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;