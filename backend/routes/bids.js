const express = require('express');
const router = express.Router();
const { 
  createBid, 
  getBidsByGig, 
  hireBid, 
  getMyBids,
  rejectBid,    // Make sure this is here
  updateBid     // Make sure this is here
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBid);
router.get('/my/bids', protect, getMyBids);
router.get('/:gigId', protect, getBidsByGig);
router.patch('/:bidId/hire', protect, hireBid);
router.patch('/:bidId/reject', protect, rejectBid);     // Make sure this line exists
router.patch('/:bidId/update', protect, updateBid);     // Make sure this line exists

module.exports = router;