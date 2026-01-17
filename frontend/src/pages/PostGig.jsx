import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeSelector } from '../hooks/useSafeSelector';
import { useNavigate } from 'react-router-dom';
import { createGig, reset } from '../store/slices/gigSlice';
import { PlusCircle, Loader, DollarSign, FileText, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [hasShownToast, setHasShownToast] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, gigsLoading, gigsError } = useSafeSelector();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      console.log('❌ User not authenticated - redirecting to login');
      alert('Please login to post a gig');
      navigate('/login', { state: { from: '/post-gig' } });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    setHasShownToast(false);
    dispatch(reset());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      errors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 2000) {
      errors.description = 'Description must not exceed 2000 characters';
    }

    if (!formData.budget) {
      errors.budget = 'Budget is required';
    } else if (parseFloat(formData.budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    } else if (parseFloat(formData.budget) > 1000000) {
      errors.budget = 'Budget must not exceed $1,000,000';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({ 
      ...formData, 
      [name]: value 
    });

    if (formErrors[name]) {
      setFormErrors({ 
        ...formErrors, 
        [name]: '' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting gig form:', formData);
    
    setHasShownToast(false);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      warning('Please fix the errors in the form'); // ✅
      return;
    }

    if (!isAuthenticated && !user) {
      console.log('❌ User not authenticated');
      error('Please login to post a gig'); // ✅
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Dispatching createGig action');
      await dispatch(createGig({
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: parseFloat(formData.budget),
      })).unwrap();

      success('Gig posted successfully! Redirecting... 🚀'); // ✅
      setFormData({ title: '', description: '', budget: '' });
      setFormErrors({});
      
      setTimeout(() => {
        navigate('/my-gigs');
        dispatch(reset());
      }, 1000);
    } catch (error) {
      error(err || 'Failed to create gig. Please try again.'); // ✅
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 xs:py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-3 xs:px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 xs:mb-8">
          <div className="flex items-center justify-center mb-3 xs:mb-4">
            <div className="bg-blue-100 p-3 xs:p-4 rounded-full">
              <PlusCircle className="text-blue-600 w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
            </div>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Post a New Gig
          </h1>
          <p className="text-gray-600 text-sm xs:text-base">
            Find the perfect freelancer for your project
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 xs:p-6 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-5 xs:space-y-6">
            
            {/* Title Field */}
            <div>
              <label 
                htmlFor="title" 
                className="flex items-center text-gray-700 font-semibold mb-2 text-xs xs:text-sm sm:text-base"
              >
                <Briefcase className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-blue-600" />
                Gig Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-xs xs:text-sm sm:text-base ${
                  formErrors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="e.g., Build a responsive landing page with React"
                required
                disabled={isSubmitting}
                maxLength={100}
              />
              {formErrors.title && (
                <p className="mt-1 text-xs xs:text-sm text-red-500">
                  {formErrors.title}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label 
                htmlFor="description" 
                className="flex items-center text-gray-700 font-semibold mb-2 text-xs xs:text-sm sm:text-base"
              >
                <FileText className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-blue-600" />
                Project Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all h-32 xs:h-40 sm:h-48 resize-none text-xs xs:text-sm sm:text-base ${
                  formErrors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Describe your project requirements in detail. Include:&#10;• What you need built&#10;• Key features required&#10;• Any specific technologies&#10;• Timeline expectations"
                required
                disabled={isSubmitting}
                maxLength={2000}
              />
              {formErrors.description && (
                <p className="mt-1 text-xs xs:text-sm text-red-500">
                  {formErrors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Budget Field */}
            <div>
              <label 
                htmlFor="budget" 
                className="flex items-center text-gray-700 font-semibold mb-2 text-xs xs:text-sm sm:text-base"
              >
                <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-blue-600" />
                Budget (USD)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm xs:text-base">
                  $
                </span>
               <input
  type="number"
  id="budget"
  name="budget"
  value={formData.budget}
  onChange={handleChange}
  className={`w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2.5 xs:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-xs xs:text-sm sm:text-base ${
    formErrors.budget
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500'
  }`}
  placeholder="500"
  required
  min="1"
  max="1000000"
  step="0.01"
  disabled={isSubmitting}
/>

</div>
{formErrors.budget && (
<p className="mt-1 text-xs xs:text-sm text-red-500">
{formErrors.budget}
</p>
)}
<p className="mt-1 text-xs text-gray-500">
Set your project budget (min: $1, max: $1,000,000)
</p>
</div>
{/* Action Buttons */}
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full xs:w-auto px-6 py-2.5 xs:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm xs:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full xs:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 xs:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-sm xs:text-base disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin w-5 h-5" />
                <span>Posting Gig...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Post Gig</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs xs:text-sm text-blue-800">
          <strong>💡 Tip:</strong> Be as detailed as possible in your description to attract 
          the right freelancers. Include specific requirements, deliverables, and timeline 
          expectations.
        </p>
      </div>
    </div>
  </div>
</div>
  );

};
export default PostGig;