import { useSelector } from 'react-redux';

/**
 * Safe selector hook that provides fallback values
 */
export const useSafeSelector = () => {
  // Auth selectors
  const user = useSelector((state) => state.auth?.user || null);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
  const authLoading = useSelector((state) => state.auth?.isLoading || false);
  const authError = useSelector((state) => state.auth?.isError || false);
  const authMessage = useSelector((state) => state.auth?.message || '');

  // Gigs selectors with safe defaults
  const gigs = useSelector((state) => {
    const gigsArray = state.gigs?.gigs;
    if (!Array.isArray(gigsArray)) {
      console.warn('⚠️ gigs.gigs is not an array, returning []');
      return [];
    }
    return gigsArray;
  });

  const myGigs = useSelector((state) => {
    const myGigsArray = state.gigs?.myGigs;
    if (!Array.isArray(myGigsArray)) {
      console.warn('⚠️ gigs.myGigs is not an array, returning []');
      return [];
    }
    return myGigsArray;
  });

  const currentGig = useSelector((state) => state.gigs?.currentGig || null);
  const gigsLoading = useSelector((state) => state.gigs?.isLoading || false);
  const gigsError = useSelector((state) => state.gigs?.isError || false);

  // Bids selectors with safe defaults
  const bids = useSelector((state) => {
    const bidsArray = state.bids?.bids;
    if (!Array.isArray(bidsArray)) {
      console.warn('⚠️ bids.bids is not an array, returning []');
      return [];
    }
    return bidsArray;
  });

  const myBids = useSelector((state) => {
    const myBidsArray = state.bids?.myBids;
    if (!Array.isArray(myBidsArray)) {
      console.warn('⚠️ bids.myBids is not an array, returning []');
      return [];
    }
    return myBidsArray;
  });

  const bidsLoading = useSelector((state) => state.bids?.isLoading || false);
  const bidsError = useSelector((state) => state.bids?.isError || false);

  // Notifications selectors
  const notifications = useSelector((state) => {
    const notifArray = state.notifications?.notifications;
    if (!Array.isArray(notifArray)) {
      console.warn('⚠️ notifications.notifications is not an array, returning []');
      return [];
    }
    return notifArray;
  });

  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);

  return {
    // Auth
    user,
    isAuthenticated,
    authLoading,
    authError,
    authMessage,
    
    // Gigs
    gigs,
    myGigs,
    currentGig,
    gigsLoading,
    gigsError,
    
    // Bids
    bids,
    myBids,
    bidsLoading,
    bidsError,
    
    // Notifications
    notifications,
    unreadCount,
  };
};