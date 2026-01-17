// backend/routes/bids.js - COMPLETE WITH NOTIFICATIONS
const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { protect } = require('../middleware/auth');

// @route   POST /api/bids
// @desc    Create a new bid
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { gigId, price, message } = req.body;

    // Validate input
    if (!gigId || !price || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId).populate('ownerId', 'name email');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    // Check if user is trying to bid on their own gig
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    // Check if user already has a pending bid
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
      status: 'pending'
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You already have a pending bid for this gig' });
    }

    // Create new bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      price: parseFloat(price),
      message: message.trim(),
      status: 'pending'
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title description budget status');

    // 🔔 SEND NOTIFICATION TO GIG OWNER
    const io = req.app.get('io');
    if (io) {
      console.log('🔔 Sending newBid notification to gig owner:', gig.ownerId._id.toString());
      
      io.to(gig.ownerId._id.toString()).emit('newBid', {
        message: `${req.user.name} placed a bid of $${price} on your gig "${gig.title}"`,
        gigId: gig._id,
        gigTitle: gig.title,
        bidId: bid._id,
        freelancerName: req.user.name,
        bidAmount: price,
        type: 'info',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json(populatedBid);
  } catch (error) {
    console.error('❌ Create bid error:', error);
    res.status(500).json({ message: error.message || 'Failed to create bid' });
  }
});

// @route   GET /api/bids/:gigId
// @desc    Get all bids for a specific gig (Owner only)
// @access  Private
router.get('/:gigId', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only gig owner can view bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('❌ Get bids error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch bids' });
  }
});

// @route   GET /api/bids/my/bids
// @desc    Get all bids by current user
// @access  Private
router.get('/my/bids', protect, async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId', 'title description budget status ownerId')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('❌ Get my bids error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch your bids' });
  }
});

// @route   PATCH /api/bids/:bidId/hire
// @desc    Hire a freelancer (Owner only)
// @access  Private
router.patch('/:bidId/hire', protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title ownerId status');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the gig owner
    if (bid.gigId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig owner can hire freelancers' });
    }

    // Check if gig is still open
    if (bid.gigId.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting hires' });
    }

    // Update bid status to hired
    bid.status = 'hired';
    await bid.save();

    // Update gig status to assigned
    await Gig.findByIdAndUpdate(bid.gigId._id, { status: 'assigned' });

    // Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: bid.gigId._id,
        _id: { $ne: bid._id },
        status: 'pending'
      },
      { status: 'rejected' }
    );

    // 🔔 SEND HIRED NOTIFICATION TO FREELANCER
    const io = req.app.get('io');
    if (io) {
      console.log('🎉 Sending hired notification to freelancer:', bid.freelancerId._id.toString());
      
      io.to(bid.freelancerId._id.toString()).emit('hired', {
        message: `🎉 Congratulations! You have been hired for "${bid.gigId.title}"`,
        gigId: bid.gigId._id,
        gigTitle: bid.gigId.title,
        bidId: bid._id,
        clientName: req.user.name,
        type: 'success',
        timestamp: new Date().toISOString()
      });

      // 🔔 SEND REJECTION NOTIFICATIONS TO OTHER FREELANCERS
      const rejectedBids = await Bid.find({
        gigId: bid.gigId._id,
        _id: { $ne: bid._id },
        status: 'rejected'
      }).populate('freelancerId', 'name email');

      rejectedBids.forEach((rejectedBid) => {
        console.log('📬 Sending rejection notification to:', rejectedBid.freelancerId._id.toString());
        
        io.to(rejectedBid.freelancerId._id.toString()).emit('bidRejected', {
          message: `Your bid for "${bid.gigId.title}" was not selected. The position has been filled.`,
          gigId: bid.gigId._id,
          gigTitle: bid.gigId.title,
          bidId: rejectedBid._id,
          type: 'warning',
          timestamp: new Date().toISOString()
        });
      });
    }

    res.json({ 
      message: 'Freelancer hired successfully',
      bid 
    });
  } catch (error) {
    console.error('❌ Hire bid error:', error);
    res.status(500).json({ message: error.message || 'Failed to hire freelancer' });
  }
});

// @route   PATCH /api/bids/:bidId/reject
// @desc    Reject a bid (Owner only)
// @access  Private
router.patch('/:bidId/reject', protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title ownerId');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the gig owner
    if (bid.gigId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig owner can reject bids' });
    }

    // Update bid status
    bid.status = 'rejected';
    await bid.save();

    // 🔔 SEND REJECTION NOTIFICATION TO FREELANCER
    const io = req.app.get('io');
    if (io) {
      console.log('📬 Sending rejection notification to:', bid.freelancerId._id.toString());
      
      io.to(bid.freelancerId._id.toString()).emit('bidRejected', {
        message: `Your bid for "${bid.gigId.title}" has been declined by the client.`,
        gigId: bid.gigId._id,
        gigTitle: bid.gigId.title,
        bidId: bid._id,
        type: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      message: 'Bid rejected successfully',
      bid 
    });
  } catch (error) {
    console.error('❌ Reject bid error:', error);
    res.status(500).json({ message: error.message || 'Failed to reject bid' });
  }
});

// @route   PATCH /api/bids/:bidId/update
// @desc    Update a bid (Freelancer only)
// @access  Private
router.patch('/:bidId/update', protect, async (req, res) => {
  try {
    const { price, message } = req.body;

    const bid = await Bid.findById(req.params.bidId)
      .populate('gigId', 'title status ownerId');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the bid owner
    if (bid.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own bids' });
    }

    // Check if bid can be updated
    if (bid.status === 'hired') {
      return res.status(400).json({ message: 'Cannot update a hired bid' });
    }

    if (bid.gigId.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update bid for a closed gig' });
    }

    // Update bid
    bid.price = parseFloat(price);
    bid.message = message.trim();
    bid.status = 'pending'; // Reset to pending if it was rejected
    await bid.save();

    const updatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title description budget status');

    res.json({ 
      message: 'Bid updated successfully',
      bid: updatedBid 
    });
  } catch (error) {
    console.error('❌ Update bid error:', error);
    res.status(500).json({ message: error.message || 'Failed to update bid' });
  }
});

module.exports = router;