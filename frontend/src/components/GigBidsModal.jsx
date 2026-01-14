import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { hireBid, rejectBid } from '../store/slices/bidSlice';

const GigBidsModal = ({ gigId, onClose }) => {
  const dispatch = useDispatch();

  const { bids, isLoading } = useSelector((state) => state.bids);

  const handleHire = (bidId, freelancerName) => {
    const confirmHire = window.confirm(
      `Hire ${freelancerName}? This will reject all other bids.`
    );
    if (!confirmHire) return;

    // ✅ OPTIMISTIC UI
    dispatch(hireBid(bidId));
  };

  const handleReject = (bidId, freelancerName) => {
    const confirmReject = window.confirm(
      `Reject ${freelancerName}'s bid? They can resubmit.`
    );
    if (!confirmReject) return;

    // ✅ OPTIMISTIC UI
    dispatch(rejectBid(bidId));
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
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && bids.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No bids yet for this gig.
          </p>
        )}

        {/* Bids */}
        {!isLoading && bids.length > 0 && (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {bid.freelancerId.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bid.freelancerId.email}
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

                  {/* ✅ OWNER ACTIONS */}
                  {bid.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleHire(bid._id, bid.freelancerId.name)
                        }
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        <CheckCircle size={16} />
                        Hire
                      </button>

                      <button
                        onClick={() =>
                          handleReject(bid._id, bid.freelancerId.name)
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
