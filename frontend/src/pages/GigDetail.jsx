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
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.bids
  );

  const { success, error, warning } = useToast();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidData, setBidData] = useState({ message: '', price: '' });
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gigs/${id}`
        );
        setGig(response.data);
      } catch (err) {
        console.error('❌ Error fetching gig:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
    dispatch(reset());
    setHasShownToast(false);
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
        <Loader className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Gig not found</p>
      </div>
    );
  }

  // ✅ ROLE CHECK (FIX)
  const isOwner = user && gig.ownerId?._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{gig.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                gig.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {gig.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 border-b pb-4">
            <div className="flex gap-2">
              <DollarSign className="text-blue-600" />
              <span>${gig.budget}</span>
            </div>

            <div className="flex gap-2">
              <User className="text-blue-600" />
              <span>{gig.ownerId.name}</span>
            </div>

            <div className="flex gap-2">
              <Calendar className="text-blue-600" />
              <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <p className="mb-6 text-gray-700 whitespace-pre-wrap">
            {gig.description}
          </p>

          {/* ✅ NON-OWNER BID FORM */}
          {!isOwner && gig.status === 'open' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-bold mb-3">Submit Your Bid</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="number"
                  placeholder="Your price"
                  value={bidData.price}
                  onChange={(e) =>
                    setBidData({ ...bidData, price: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  disabled={isLoading}
                />

                <textarea
                  placeholder="Your proposal"
                  value={bidData.message}
                  onChange={(e) =>
                    setBidData({ ...bidData, message: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded h-28"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded flex justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Bid'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ✅ OWNER MESSAGE */}
          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
              This is your gig. Manage bids from <b>My Posted Gigs</b>.
            </div>
          )}

          {gig.status === 'assigned' && !isOwner && (
            <div className="bg-gray-100 border rounded p-4 text-gray-700">
              This gig has already been assigned.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
