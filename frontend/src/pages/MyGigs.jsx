import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyGigs } from '../store/slices/gigSlice';
import {
  fetchBidsByGig,
  hireBid,
  rejectBid,
  reset,
} from '../store/slices/bidSlice';
import { useToast } from '../context/ToastContext';
import { DollarSign, Calendar, Users, Loader } from 'lucide-react';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs, isLoading: gigsLoading } = useSelector((state) => state.gigs);
  const { bids, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.bids
  );

  const [selectedGig, setSelectedGig] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    dispatch(getMyGigs());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      success(message);
      dispatch(reset());

      if (selectedGig) {
        dispatch(fetchBidsByGig(selectedGig));
      }
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

  if (gigsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          My Posted Gigs
        </h1>

        {myGigs.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven’t posted any gigs yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white rounded-lg shadow p-5"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">{gig.title}</h3>
                  <span className="text-sm text-gray-500">{gig.status}</span>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2">
                  {gig.description}
                </p>

                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} /> ${gig.budget}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(gig.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleViewBids(gig._id)}
                  className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  View Bids
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ BIDS MODAL */}
        {selectedGig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Bids</h2>
                <button onClick={() => setSelectedGig(null)}>×</button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              ) : bids.length === 0 ? (
                <p className="text-center text-gray-500">
                  No bids yet for this gig.
                </p>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid._id}
                      className="border rounded p-4"
                    >
                      <p className="font-semibold">{bid.freelancerId.name}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        {bid.message}
                      </p>
                      <p className="font-bold mb-3">${bid.price}</p>

                      {/* ✅ OWNER-ONLY ACTIONS */}
                      {bid.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              dispatch(hireBid(bid._id))
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Hire
                          </button>

                          <button
                            onClick={() =>
                              dispatch(rejectBid(bid._id))
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
