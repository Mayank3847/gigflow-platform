import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBids } from '../store/slices/bidSlice';
import {
  DollarSign,
  Calendar,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const BidHistory = () => {
  const dispatch = useDispatch();
  const { myBids } = useSelector((state) => state.bids);
  const [filter, setFilter] = useState('all'); // all, pending, hired, rejected

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} />;
      case 'hired':
        return <CheckCircle size={18} />;
      case 'rejected':
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const filteredBids =
    filter === 'all'
      ? myBids
      : myBids.filter((bid) => bid.status === filter);

  const stats = {
    total: myBids.length,
    pending: myBids.filter((b) => b.status === 'pending').length,
    hired: myBids.filter((b) => b.status === 'hired').length,
    rejected: myBids.filter((b) => b.status === 'rejected').length,
    successRate:
      myBids.length > 0
        ? (
            (myBids.filter((b) => b.status === 'hired').length /
              myBids.length) *
            100
          ).toFixed(1)
        : 0,
    totalValue: myBids
      .filter((b) => b.status === 'hired')
      .reduce((sum, b) => sum + b.price, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Bid History
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track all your bidding activity and success rate
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Bids', value: stats.total, icon: Briefcase },
            { label: 'Pending', value: stats.pending, icon: Clock },
            { label: 'Hired', value: stats.hired, icon: CheckCircle },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp },
            { label: 'Total Earned', value: `$${stats.totalValue}`, icon: DollarSign }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-xs sm:text-sm">
                  {item.label}
                </span>
                <item.icon size={20} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'hired', 'rejected'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} (
                {stats[type] ?? stats.total})
              </button>
            ))}
          </div>
        </div>

        {/* Bid List */}
        {filteredBids.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-base sm:text-lg">
              {filter === 'all'
                ? "You haven't placed any bids yet"
                : `No ${filter} bids found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <div
                key={bid._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left */}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                      {bid.gigId?.title || 'Gig Deleted'}
                    </h3>

                    {bid.gigId && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {bid.gigId.description}
                      </p>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3">
                      <h4 className="font-semibold text-sm mb-1">
                        Your Proposal:
                      </h4>
                      <p className="text-sm text-gray-600">{bid.message}</p>
                    </div>

                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      Submitted: {formatDate(bid.createdAt)}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="w-full lg:w-52 flex flex-col items-start lg:items-end gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Your Bid</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        ${bid.price}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold ${getStatusColor(
                        bid.status
                      )}`}
                    >
                      {getStatusIcon(bid.status)}
                      <span className="capitalize">{bid.status}</span>
                    </div>

                    {bid.status === 'hired' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center w-full">
                        <p className="text-green-800 font-semibold text-sm">
                          🎉 Congratulations!
                        </p>
                        <p className="text-green-600 text-xs">
                          You won this project
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistory;
