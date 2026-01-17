import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { fetchMyBids, updateBid, reset } from '../store/slices/bidSlice';
import {
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  X,
  Save,
  Loader
} from 'lucide-react';

const MyBids = () => {
  const dispatch = useDispatch();
  
  const { myBids, bidsLoading } = useSafeSelector();
  
  const [editingBid, setEditingBid] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      alert(successMessage);
      setSuccessMessage('');
      setEditingBid(null);
      dispatch(fetchMyBids());
    }

    if (errorMessage) {
      alert(errorMessage);
      setErrorMessage('');
    }
  }, [successMessage, errorMessage, dispatch]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
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

  const handleEditClick = (bid) => {
    setEditingBid(bid._id);
    setEditForm({ price: bid.price, message: bid.message });
  };

  const handleCancelEdit = () => {
    setEditingBid(null);
    setEditForm({ price: '', message: '' });
  };

  const handleUpdateSubmit = async (bidId) => {
    if (!editForm.price || !editForm.message) {
      alert('Please fill in all fields');
      return;
    }

    if (editForm.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    try {
      await dispatch(updateBid({
        bidId,
        price: parseFloat(editForm.price),
        message: editForm.message
      })).unwrap();
      
      setSuccessMessage('Bid updated successfully!');
    } catch (error) {
      setErrorMessage(error || 'Failed to update bid');
    }
  };

  const canEditBid = (bid) => {
    return bid?.gigId?.status === 'open' &&
      (bid?.status === 'pending' || bid?.status === 'rejected');
  };

  if (bidsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center">
          My Bids
        </h1>

        {myBids.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              You haven't placed any bids yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {myBids.map((bid) => {
              if (!bid || !bid._id) {
                console.warn('⚠️ Invalid bid:', bid);
                return null;
              }

              return (
                <div
                  key={bid._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 sm:p-6"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={20} className="text-blue-600" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                          {bid.gigId?.title || 'Gig Deleted'}
                        </h3>
                      </div>

                      {bid.gigId && bid.gigId.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {bid.gigId.description}
                        </p>
                      )}

                      <span
                        className={`inline-block text-xs px-2 py-1 rounded ${
                          bid.gigId?.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Gig: {bid.gigId?.status || 'N/A'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 text-sm font-semibold self-start ${getStatusColor(
                        bid.status
                      )}`}
                    >
                      {getStatusIcon(bid.status)}
                      <span className="capitalize">{bid.status || 'unknown'}</span>
                    </div>
                  </div>

                  {editingBid === bid._id ? (
                    /* EDIT MODE */
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-800">
                          Update Your Bid
                        </h4>
                        <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          New Price ($)
                        </label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          min="1"
                          step="0.01"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Updated Proposal
                        </label>
                        <textarea
                          value={editForm.message}
                          onChange={(e) =>
                            setEditForm({ ...editForm, message: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        onClick={() => handleUpdateSubmit(bid._id)}
                        className="w-full bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-sm mb-1">
                          Your Proposal:
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {bid.message || 'No message'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={16} />
                          {formatDate(bid.createdAt)}
                        </div>

                        <div className="flex items-center gap-1">
                          <DollarSign size={18} className="text-blue-600" />
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            ${bid.price || 0}
                          </span>
                        </div>
                      </div>

                      {canEditBid(bid) && (
                        <button
                          onClick={() => handleEditClick(bid)}
                          className="w-full bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                        >
                          <Edit2 size={18} />
                          Edit Bid
                        </button>
                      )}

                      {bid.status === 'hired' && (
                        <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-center font-semibold">
                          🎉 Congratulations! You won this project
                        </div>
                      )}

                      {bid.status === 'rejected' && bid.gigId?.status === 'open' && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-center">
                          This bid was rejected. You can update and resubmit!
                        </div>
                      )}

                      {bid.status === 'rejected' && bid.gigId?.status !== 'open' && (
                        <div className="bg-gray-100 border border-gray-300 rounded p-3 text-sm text-center">
                          Gig is no longer available
                        </div>
                      )}

                      {!canEditBid(bid) &&
                        bid.status === 'pending' &&
                        bid.gigId?.status !== 'open' && (
                          <div className="bg-gray-100 border border-gray-300 rounded p-3 text-sm text-center">
                            Gig has been closed
                          </div>
                        )}
                    </>
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

export default MyBids;