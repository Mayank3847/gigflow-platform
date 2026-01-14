import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig, reset } from '../store/slices/gigSlice';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Loader } from 'lucide-react';

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [hasShownToast, setHasShownToast] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.gigs);
  const { success, error, warning } = useToast();

  useEffect(() => {
    setHasShownToast(false);
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && !hasShownToast) {
      success('Gig posted successfully! Redirecting...');
      setHasShownToast(true);
      setTimeout(() => {
        navigate('/my-gigs');
        dispatch(reset());
      }, 1000);
    }

    if (isError && !hasShownToast) {
      error(message || 'Failed to create gig. Please try again.');
      setHasShownToast(true);
      dispatch(reset());
    }
  }, [isSuccess, isError, message, hasShownToast, navigate, dispatch, success, error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setHasShownToast(false);
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.budget) {
      warning('Please fill in all fields.');
      return;
    }

    if (formData.budget <= 0) {
      warning('Budget must be greater than 0.');
      return;
    }

    dispatch(createGig(formData));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 xs:py-6 sm:py-8">
      <div className="container mx-auto px-3 xs:px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-4 xs:p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4 xs:mb-6">
            <PlusCircle className="text-blue-600 w-8 h-8 xs:w-10 xs:h-10" />
          </div>
          <h1 className="text-2xl xs:text-3xl font-bold text-center mb-6 xs:mb-8">Post a New Gig</h1>

          <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
                Gig Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
                placeholder="e.g., Build a landing page"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 xs:h-40 text-xs xs:text-sm sm:text-base"
                placeholder="Describe your project requirements..."
                required
                disabled={isLoading}
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 xs:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
                placeholder="e.g., 500"
                required
                min="1"
                step="0.01"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 xs:py-3 rounded hover:bg-blue-700 transition font-semibold text-base xs:text-lg disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  <span>Posting Gig...</span>
                </>
              ) : (
                <span>Post Gig</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostGig;