import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { getMyGigs } from '../store/slices/gigSlice';
import {
  fetchBidsByGig,
  hireBid,
  rejectBid,
  reset,
} from '../store/slices/bidSlice';
import { DollarSign, Calendar, Users, Loader } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MyGigs = () => {
  const dispatch = useDispatch();
  
  const { myGigs, gigsLoading } = useSafeSelector();
  const { bids, bidsLoading } = useSafeSelector();

  const [selectedGig, setSelectedGig] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    dispatch(getMyGigs());
  }, [dispatch]);

  const handleViewBids = (gigId) => {
    setSelectedGig(gigId);
    dispatch(fetchBidsByGig(gigId));
  };

  const handleHire = async (bidId) => {
    try {
      // ✅ Hire the freelancer
      await dispatch(hireBid(bidId)).unwrap();
      success('Freelancer hired successfully! 🎉');
      
      // ✅ CRITICAL FIX: Refresh the gigs list to show updated status
      await dispatch(getMyGigs()).unwrap();
      
      // ✅ Close the modal after successful hire
      setSelectedGig(null);
      
      // ✅ Reset bid state
      dispatch(reset());
      
    } catch (err) {
      error(err?.message || err || 'Failed to hire freelancer');
    }
  };

  const handleReject = async (bidId) => {
    try {
      // ✅ Reject the bid
      await dispatch(rejectBid(bidId)).unwrap();
      success('Bid rejected successfully');
      
      // ✅ CRITICAL FIX: Refresh bids list to show updated status
      if (selectedGig) {
        await dispatch(fetchBidsByGig(selectedGig)).unwrap();
      }
      
    } catch (err) {
      error(err?.message || err || 'Failed to reject bid');
    }
  };

  const handleCloseModal = () => {
    setSelectedGig(null);
    dispatch(reset());
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
            You haven't posted any gigs yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGigs.map((gig) => {
              if (!gig || !gig._id) {
                console.warn('⚠️ Invalid gig:', gig);
                return null;
              }

              return (
                <div
                  key={gig._id}
                  className="bg-white rounded-lg shadow p-5"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold">{gig.title || 'Untitled'}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                      gig.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gig.status === 'open' ? '🟢 Open' : '🔒 Filled'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {gig.description || 'No description'}
                  </p>

                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} /> ${gig.budget || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {gig.createdAt 
                        ? new Date(gig.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>

                  {/* ✅ Only show "View Bids" button if gig is still open */}
                  {gig.status === 'open' ? (
                    <button
                      onClick={() => handleViewBids(gig._id)}
                      className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    >
                      <Users size={18} />
                      View Bids
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-600 py-2 rounded text-center font-semibold">
                      ✅ Position Filled
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BIDS MODAL */}
        {selectedGig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Bids for this Gig</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {bidsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              ) : bids.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No bids yet for this gig.
                </p>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => {
                    if (!bid || !bid._id) {
                      console.warn('⚠️ Invalid bid:', bid);
                      return null;
                    }

                    return (
                      <div
                        key={bid._id}
                        className="border rounded p-4 hover:bg-gray-50 transition"
                      >
                        <p className="font-semibold text-lg mb-1">
                          {bid.freelancerId?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {bid.message || 'No message provided'}
                        </p>
                        <p className="font-bold text-blue-600 mb-3">
                          ${bid.price || 0}
                        </p>

                        <div className="text-xs text-gray-500 mb-3">
                          Status: <span className="font-semibold capitalize">
                            {bid.status || 'unknown'}
                          </span>
                        </div>

                        {/* ✅ Only show Hire/Reject buttons if bid is pending */}
                        {bid.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleHire(bid._id)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex-1"
                            >
                              Hire
                            </button>

                            <button
                              onClick={() => handleReject(bid._id)}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex-1"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {bid.status === 'hired' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800 text-center text-sm">
                            ✓ Hired
                          </div>
                        )}

                        {bid.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 text-red-800 text-center text-sm">
                            ✗ Rejected
                          </div>
                        )}
                      </div>
                    );
                  })}
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
