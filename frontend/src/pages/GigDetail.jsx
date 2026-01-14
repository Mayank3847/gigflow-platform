import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBid, reset } from '../store/slices/bidSlice';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { DollarSign, Calendar, User, ArrowLeft, Loader } from 'lucide-react';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.bids);
  const { success, error, warning } = useToast();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidData, setBidData] = useState({
    message: '',
    price: '',
  });
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gig:', error);
        setLoading(false);
      }
    };

    fetchGig();
    setHasShownToast(false);
    dispatch(reset());
  }, [id, dispatch]);

  useEffect(() => {
    if (isSuccess && !hasShownToast) {
      success('Bid submitted successfully!');
      setBidData({ message: '', price: '' });
      setHasShownToast(true);
      dispatch(reset());
    }

    if (isError && !hasShownToast) {
      error(message || 'Failed to submit bid');
      setHasShownToast(true);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, hasShownToast, dispatch, success, error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setHasShownToast(false);
    
    if (!bidData.message.trim() || !bidData.price) {
      warning('Please fill in all fields');
      return;
    }

    if (bidData.price <= 0) {
      warning('Price must be greater than 0');
      return;
    }

    dispatch(createBid({ gigId: id, ...bidData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm xs:text-base">Gig not found</p>
      </div>
    );
  }

  const isOwner = user && gig.ownerId._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-4 xs:py-6 sm:py-8">
      <div className="container mx-auto px-3 xs:px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 xs:mb-6 text-xs xs:text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8">
          <div className="flex flex-col xs:flex-row items-start justify-between mb-4 xs:mb-6 gap-3">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 break-words pr-2">
              {gig.title}
            </h1>
            <span
              className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-semibold whitespace-nowrap ${
                gig.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {gig.status === 'open' ? '🟢 Open' : '🔒 Filled'}
            </span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 xs:gap-4 mb-4 xs:mb-6 pb-4 xs:pb-6 border-b">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-blue-600 w-5 h-5 xs:w-6 xs:h-6" />
              <div>
                <p className="text-xs xs:text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-base xs:text-lg">${gig.budget}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <User className="text-blue-600 w-5 h-5 xs:w-6 xs:h-6" />
              <div>
                <p className="text-xs xs:text-sm text-gray-500">Posted by</p>
                <p className="font-semibold text-sm xs:text-base break-words">{gig.ownerId.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 xs:col-span-2 sm:col-span-1">
              <Calendar className="text-blue-600 w-5 h-5 xs:w-6 xs:h-6" />
              <div>
                <p className="text-xs xs:text-sm text-gray-500">Posted on</p>
                <p className="font-semibold text-sm xs:text-base">
                  {new Date(gig.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 xs:mb-8">
            <h2 className="text-lg xs:text-xl font-bold mb-2 xs:mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap text-xs xs:text-sm sm:text-base break-words">
              {gig.description}
            </p>
          </div>

          {!isOwner && gig.status === 'open' && (
            <div className="bg-gray-50 rounded-lg p-4 xs:p-6">
              <h2 className="text-lg xs:text-xl font-bold mb-3 xs:mb-4">Submit Your Bid</h2>
              <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1 xs:mb-2 font-medium text-xs xs:text-sm sm:text-base">
                    Your Price ($)
                  </label>
                  <input
                    type="number"
                    value={bidData.price}
                    onChange={(e) =>
                      setBidData({ ...bidData, price: e.target.value })
                    }
                    className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter your price"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 xs:mb-2 font-medium text-xs xs:text-sm sm:text-base">
                    Your Proposal
                  </label>
                  <textarea
                    value={bidData.message}
                    onChange={(e) =>
                      setBidData({ ...bidData, message: e.target.value })
                    }
                    className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 xs:h-32 text-xs xs:text-sm sm:text-base"
                    required
                    placeholder="Explain why you're the best fit for this gig..."
                    disabled={isLoading}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 xs:py-3 rounded hover:bg-blue-700 transition font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-xs xs:text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Submitting Bid...</span>
                    </>
                  ) : (
                    <span>Submit Bid</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 xs:p-4">
              <p className="text-blue-800 text-xs xs:text-sm sm:text-base">
                This is your gig. View bids from the "My Posted Gigs" page.
              </p>
            </div>
          )}

          {gig.status === 'assigned' && !isOwner && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 xs:p-4">
              <p className="text-gray-700 text-xs xs:text-sm sm:text-base">
                This gig has been assigned and is no longer accepting bids.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;