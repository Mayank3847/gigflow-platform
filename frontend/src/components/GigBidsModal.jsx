import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { fetchBidsByGig, hireBid, rejectBid } from '../store/slices/bidSlice';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

const GigBidsModal = ({ gigId, onClose }) => {
  const dispatch = useDispatch();
  const { bids, bidsLoading } = useSafeSelector();

  useEffect(() => {
    if (gigId) {
      dispatch(fetchBidsByGig(gigId));
    }
  }, [gigId, dispatch]);

  const handleHire = async (bidId, freelancerName) => {
    const confirmHire = window.confirm(
      `Hire ${freelancerName}? This will reject all other bids.`
    );
    if (!confirmHire) return;

    try {
      await dispatch(hireBid(bidId)).unwrap();
      alert('Freelancer hired successfully!');
      onClose();
    } catch (error) {
      alert(error || 'Failed to hire freelancer');
    }
  };

  const handleReject = async (bidId, freelancerName) => {
    const confirmReject = window.confirm(
      `Reject ${freelancerName}'s bid? They can resubmit.`
    );
    if (!confirmReject) return;

    try {
      await dispatch(rejectBid(bidId)).unwrap();
      alert('Bid rejected successfully!');
    } catch (error) {
      alert(error || 'Failed to reject bid');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bids for this Gig</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Loading */}
        {bidsLoading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        )}

        {/* Empty */}
        {!bidsLoading && bids.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No bids yet for this gig.
          </p>
        )}

        {/* Bids */}
        {!bidsLoading && bids.length > 0 && (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {bid.freelancerId?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bid.freelancerId?.email || 'No email'}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      bid.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : bid.status === 'hired'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bid.status}
                  </span>
                </div>

                <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                  {bid.message}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    ${bid.price}
                  </span>

                  {/* Owner Actions */}
                  {bid.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleHire(bid._id, bid.freelancerId?.name || 'Freelancer')
                        }
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        <CheckCircle size={16} />
                        Hire
                      </button>

                      <button
                        onClick={() =>
                          handleReject(bid._id, bid.freelancerId?.name || 'Freelancer')
                        }
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}

                  {bid.status === 'hired' && (
                    <span className="text-green-700 font-semibold">
                      🎉 Hired
                    </span>
                  )}

                  {bid.status === 'rejected' && (
                    <span className="text-red-600 font-semibold">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigBidsModal;