import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { createBid, reset } from '../store/slices/bidSlice';
import axios from 'axios';
import { DollarSign, Calendar, User, ArrowLeft, Loader } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { success, error, warning } = useToast();

  const { user } = useSafeSelector();
  const { bidsLoading, bidsError } = useSafeSelector();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidData, setBidData] = useState({ message: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gigs/${id}`
        );
        
        const gigData = response.data?.gig || response.data || null;
        setGig(gigData);
      } catch (err) {
        console.error('❌ Error fetching gig:', err);
        error('Failed to load gig details');
        setGig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
    dispatch(reset());
  }, [id, dispatch, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bidData.message.trim() || !bidData.price) {
      warning('Please fill in all fields');
      return;
    }

    if (parseFloat(bidData.price) <= 0) {
      warning('Price must be greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      await dispatch(createBid({ 
        gigId: id, 
        price: parseFloat(bidData.price),
        message: bidData.message.trim()
      })).unwrap();
      
      success('Bid submitted successfully! 🎉');
      setBidData({ message: '', price: '' });
      dispatch(reset());
    } catch (bidError) {
      // ✅ FIX: Changed 'err' to 'bidError' to avoid confusion
      console.error('❌ Bid submission error:', bidError);
      error(bidError?.message || bidError || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Gig not found</p>
          <button
            onClick={() => navigate('/gigs')}
            className="text-blue-600 hover:underline"
          >
            Back to All Gigs
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && gig.ownerId && 
                  (gig.ownerId._id === user._id || gig.ownerId === user._id);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">{gig.title || 'Untitled Gig'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap self-start ${
                gig.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {gig.status === 'open' ? '🟢 Open' : '🔒 Filled'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              <DollarSign className="text-blue-600" size={20} />
              <span className="font-semibold">${gig.budget || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              <span>{gig.ownerId?.name || 'Unknown'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              <span>
                {gig.createdAt 
                  ? new Date(gig.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {gig.description || 'No description provided'}
            </p>
          </div>

          {!isOwner && gig.status === 'open' && user && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Submit Your Bid</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your price"
                    value={bidData.price}
                    onChange={(e) =>
                      setBidData({ ...bidData, price: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Proposal
                  </label>
                  <textarea
                    placeholder="Describe why you're the best fit for this project..."
                    value={bidData.message}
                    onChange={(e) =>
                      setBidData({ ...bidData, message: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin w-5 h-5" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit Bid'
                  )}
                </button>
              </form>
            </div>
          )}

          {!user && gig.status === 'open' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800 mb-4">
                Please log in to submit a bid for this gig
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </div>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-800">
              <p className="font-semibold mb-2">This is your gig</p>
              <p>Manage bids from <strong>My Posted Gigs</strong> page.</p>
            </div>
          )}

          {gig.status === 'assigned' && !isOwner && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-gray-700 text-center">
              <p className="font-semibold">This gig has already been assigned to a freelancer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;