import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { getAllGigs } from '../store/slices/gigSlice';
import { Link } from 'react-router-dom';
import { Search, DollarSign, Calendar, Filter } from 'lucide-react';

const GigList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);
  const dispatch = useDispatch();
  
  const { gigs, gigsLoading } = useSafeSelector();

  useEffect(() => {
    dispatch(getAllGigs());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getAllGigs({ search: searchTerm }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const filteredGigs = showOnlyOpen 
    ? gigs.filter(gig => gig?.status === 'open')
    : gigs;

  return (
    <div className="min-h-screen bg-gray-50 py-4 xs:py-6 sm:py-8">
      <div className="container mx-auto px-3 xs:px-4">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 xs:mb-6 sm:mb-8 text-center">
          Browse Gigs
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4 xs:mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 xs:left-3 top-2 xs:top-3 text-gray-400 w-4 h-4 xs:w-5 xs:h-5" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 xs:px-6 py-2 rounded hover:bg-blue-700 transition text-xs xs:text-sm sm:text-base"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Toggle */}
        <div className="max-w-2xl mx-auto mb-4 xs:mb-6 sm:mb-8 flex flex-col xs:flex-row items-start xs:items-center justify-between bg-white rounded-lg shadow-sm p-3 xs:p-4 gap-2 xs:gap-0">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-600 w-4 h-4 xs:w-5 xs:h-5" />
            <span className="text-gray-700 font-medium text-xs xs:text-sm sm:text-base">
              Show only open gigs
            </span>
          </div>
          <button
            onClick={() => setShowOnlyOpen(!showOnlyOpen)}
            className={`relative inline-flex h-5 w-9 xs:h-6 xs:w-11 items-center rounded-full transition-colors ${
              showOnlyOpen ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 xs:h-4 xs:w-4 transform rounded-full bg-white transition-transform ${
                showOnlyOpen ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto mb-4 xs:mb-6 text-center text-gray-600 text-xs xs:text-sm">
          Showing {filteredGigs.length} of {gigs.length} gigs
          {showOnlyOpen && gigs.length !== filteredGigs.length && (
            <span className="ml-2">
              ({gigs.length - filteredGigs.length} filled positions hidden)
            </span>
          )}
        </div>

        {/* Loading State */}
        {gigsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredGigs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm xs:text-base sm:text-lg">
                  {showOnlyOpen ? 'No open gigs found' : 'No gigs found'}
                </p>
                {showOnlyOpen && gigs.length > 0 && (
                  <button
                    onClick={() => setShowOnlyOpen(false)}
                    className="mt-4 text-blue-600 hover:underline text-xs xs:text-sm"
                  >
                    Show all gigs including filled positions
                  </button>
                )}
              </div>
            ) : (
              /* Gigs Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
                {filteredGigs.map((gig) => {
                  if (!gig || !gig._id) {
                    console.warn('⚠️ Invalid gig object:', gig);
                    return null;
                  }

                  return (
                    <div
                      key={gig._id}
                      className={`bg-white rounded-lg shadow-md p-4 xs:p-5 sm:p-6 hover:shadow-lg transition ${
                        gig.status === 'assigned'
                          ? 'opacity-75 border-2 border-gray-300'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 flex-1 break-words pr-2">
                          {gig.title || 'Untitled Gig'}
                        </h3>
                        <span
                          className={`px-2 xs:px-3 py-1 rounded-full text-[10px] xs:text-xs font-semibold whitespace-nowrap ${
                            gig.status === 'open'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {gig.status === 'open' ? '🟢 Open' : '🔒 Filled'}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 xs:mb-4 line-clamp-3 text-xs xs:text-sm">
                        {gig.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-xs xs:text-sm text-gray-500 mb-3 xs:mb-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span className="font-semibold text-blue-600">
                            ${gig.budget?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span className="text-[10px] xs:text-xs">
                            {formatDate(gig.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 xs:mb-4 text-xs xs:text-sm text-gray-600">
                        Posted by:{' '}
                        <span className="font-semibold">
                          {gig.ownerId?.name || 'Unknown'}
                        </span>
                      </div>

                      {gig.status === 'open' ? (
                        <Link
                          to={`/gigs/${gig._id}`}
                          className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-xs xs:text-sm"
                        >
                          View Details & Bid
                        </Link>
                      ) : (
                        <div className="w-full text-center bg-gray-200 text-gray-600 py-2 rounded cursor-not-allowed text-xs xs:text-sm">
                          Position Filled
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GigList;