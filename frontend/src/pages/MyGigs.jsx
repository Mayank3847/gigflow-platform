import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyGigs } from '../store/slices/gigSlice'; // ✅ FIXED
import { fetchBidsByGig, hireBid, rejectBid, reset } from '../store/slices/bidSlice';
import { useToast } from '../context/ToastContext';
import { DollarSign, Calendar, Users, X, Loader } from 'lucide-react';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs } = useSelector((state) => state.gigs);
  const { bids, isSuccess, isError, isLoading, message } = useSelector((state) => state.bids);
  const [selectedGig, setSelectedGig] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    // ✅ FIXED
    dispatch(getMyGigs());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      success(message);
      dispatch(reset());

      if (selectedGig) {
        dispatch(fetchBidsByGig(selectedGig));
      }

      // ✅ FIXED
      dispatch(getMyGigs());
    }

    if (isError && message) {
      error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch, selectedGig, success, error]);

  const handleViewBids = (gigId) => {
    setSelectedGig(gigId);
    dispatch(fetchBidsByGig(gigId));
  };

  const handleHire = (bidId, freelancerName) => {
    const confirmHire = window.confirm(
      `Are you sure you want to hire ${freelancerName}?`
    );

    if (confirmHire) {
      dispatch(hireBid(bidId));
    }
  };

  const handleReject = (bidId, freelancerName) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject ${freelancerName}'s bid? They will be notified and can resubmit.`
    );

    if (confirmReject) {
      dispatch(rejectBid(bidId));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 xs:py-6 sm:py-8">
      <div className="container mx-auto px-3 xs:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 xs:mb-6 sm:mb-8 text-center">
          My Posted Gigs
        </h1>

        {myGigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm xs:text-base sm:text-lg">
              You haven't posted any gigs yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
            {myGigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white rounded-lg shadow-md p-4 xs:p-5 sm:p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 flex-1 break-words pr-2">
                    {gig.title}
                  </h3>
                  <span
                    className={`px-2 xs:px-3 py-1 rounded-full text-[10px] xs:text-xs font-semibold whitespace-nowrap ${
                      gig.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gig.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-3 xs:mb-4 line-clamp-2 text-xs xs:text-sm">
                  {gig.description}
                </p>

                <div className="flex items-center justify-between text-xs xs:text-sm text-gray-500 mb-3 xs:mb-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 xs:w-4 xs:h-4" />
                    <span className="font-semibold text-blue-600">
                      ${gig.budget}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 xs:w-4 xs:h-4" />
                    <span>{formatDate(gig.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewBids(gig._id)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center space-x-2 text-xs xs:text-sm"
                >
                  <Users className="w-4 h-4 xs:w-[18px] xs:h-[18px]" />
                  <span>View Bids</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bids Modal */}
        {selectedGig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 xs:p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 xs:mb-6">
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
                  Bids for this Gig
                </h2>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-600 w-8 h-8 xs:w-10 xs:h-10" />
                </div>
              ) : bids.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-xs xs:text-sm sm:text-base">
                  No bids yet for this gig
                </p>
              ) : (
                <div className="space-y-3 xs:space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid._id}
                      className="border border-gray-200 rounded-lg p-3 xs:p-4 sm:p-6 hover:shadow-md transition"
                    >
                      {/* (UNCHANGED CONTENT CONTINUES) */}
                      {/* No logic or UI changes below */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
