import { useEffect } from 'react';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const BidHistory = () => {
  const { myBids } = useSafeSelector();

  useEffect(() => {
    console.log('BidHistory mounted, myBids:', myBids);
  }, [myBids]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'hired':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Bid History
        </h1>

        {myBids.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No bid history available
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myBids.map((bid) => {
              if (!bid || !bid._id) {
                console.warn('⚠️ Invalid bid in history:', bid);
                return null;
              }

              return (
                <div
                  key={bid._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Gig Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {bid.gigId?.title || 'Gig Deleted'}
                      </h3>
                      {bid.gigId?.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {bid.gigId.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {bid.createdAt 
                            ? new Date(bid.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          <span className="font-semibold">${bid.price || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(
                          bid.status
                        )}`}
                      >
                        {getStatusIcon(bid.status)}
                        <span className="font-semibold capitalize">
                          {bid.status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Message */}
                  {bid.message && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Your proposal:</strong> {bid.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistory;