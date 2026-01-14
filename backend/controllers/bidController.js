const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const mongoose = require('mongoose');

// @route   POST /api/bids
// @desc    Create a new bid
// @access  Private
exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    console.log('📝 Creating bid:', { gigId, freelancerId: req.user._id, price });

    // Validation
    if (!gigId || !message || !price) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId).populate('ownerId', 'name email');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    console.log('📋 Gig found:', { gigId: gig._id, ownerId: gig.ownerId._id });

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    // Prevent owner from bidding on their own gig
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    // Check for existing bid
    const existingBid = await Bid.findOne({ 
      gigId, 
      freelancerId: req.user._id 
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this gig' });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title budget');

    console.log('✅ Bid created successfully:', bid._id);

    // Send real-time notification to gig owner
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    const ownerSocketId = connectedUsers.get(gig.ownerId._id.toString());
    console.log('🔔 Attempting to send notification to gig owner:', gig.ownerId._id.toString());
    console.log('📡 Owner socket ID:', ownerSocketId);
    console.log('👥 All connected users:', Array.from(connectedUsers.keys()));

    const notificationData = {
      message: `${req.user.name} placed a bid of $${price} on your gig "${gig.title}"`,
      gigId: gig._id,
      gigTitle: gig.title,
      bidId: bid._id,
      freelancerName: req.user.name,
      bidAmount: price,
      timestamp: new Date(),
      type: 'new_bid'
    };

    // Emit to owner's room
    io.to(gig.ownerId._id.toString()).emit('newBid', notificationData);
    console.log('📤 Notification emitted to room:', gig.ownerId._id.toString());
    console.log('📦 Notification data:', notificationData);

    res.status(201).json(populatedBid);
  } catch (error) {
    console.error('❌ Create bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/bids/:gigId
// @desc    Get all bids for a specific gig
// @access  Private (Gig Owner only)
exports.getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only gig owner can see bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PATCH /api/bids/:bidId/hire
// @desc    Hire a freelancer (mark bid as hired)
// @access  Private (Gig Owner only)
exports.hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    console.log('💼 Hiring bid:', bidId);

    // Find the bid with session
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    console.log('📋 Hiring for gig:', gig.title);
    console.log('👤 Hiring freelancer:', bid.freelancerId.name);

    // Authorization: Only gig owner can hire
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'This gig has already been assigned' });
    }

    // Get all rejected bids to notify them
    const rejectedBids = await Bid.find({
      gigId: gig._id,
      _id: { $ne: bidId },
      status: 'pending'
    }).populate('freelancerId', 'name email').session(session);

    console.log('📋 Found', rejectedBids.length, 'bids to reject');

    // Atomic operations within transaction
    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    await Bid.updateMany(
      { 
        gigId: gig._id, 
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log('✅ Transaction committed successfully');

    // Send real-time notifications
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    console.log('👥 Connected users:', Array.from(connectedUsers.keys()));
    
    // Notify hired freelancer
    const hiredFreelancerId = bid.freelancerId._id.toString();
    console.log('🔔 Sending hired notification to:', hiredFreelancerId);
    
    const hiredNotification = {
      message: `🎉 Congratulations! You have been hired for "${gig.title}"!`,
      gigId: gig._id,
      gigTitle: gig.title,
      timestamp: new Date(),
      type: 'hired'
    };
    
    io.to(hiredFreelancerId).emit('hired', hiredNotification);
    console.log('📤 Hired notification sent');

    // Notify rejected freelancers
    rejectedBids.forEach((rejectedBid) => {
      const rejectedFreelancerId = rejectedBid.freelancerId._id.toString();
      console.log('🔔 Sending rejection notification to:', rejectedFreelancerId);
      
      const rejectionNotification = {
        message: `Your bid for "${gig.title}" was not selected. Keep trying!`,
        gigId: gig._id,
        gigTitle: gig.title,
        timestamp: new Date(),
        type: 'rejected'
      };
      
      io.to(rejectedFreelancerId).emit('bidRejected', rejectionNotification);
      console.log('📤 Rejection notification sent');
    });

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId');

    res.json({
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Hire bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PATCH /api/bids/:bidId/reject
// @desc    Reject a specific bid
// @access  Private (Gig Owner only)
exports.rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    console.log('❌ Rejecting bid:', bidId);

    // Find the bid
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    // Authorization: Only gig owner can reject
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this bid' });
    }

    // Check if bid is still pending
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'This bid has already been processed' });
    }

    // Update bid status to rejected
    bid.status = 'rejected';
    await bid.save();

    console.log('✅ Bid rejected successfully');

    // Send real-time notification to freelancer
    const io = req.app.get('io');
    const rejectionNotification = {
      message: `Your bid for "${gig.title}" has been rejected. You can update and resubmit your bid.`,
      gigId: gig._id,
      gigTitle: gig.title,
      bidId: bid._id,
      timestamp: new Date(),
      type: 'rejected',
      canResubmit: true
    };

    io.to(bid.freelancerId._id.toString()).emit('bidRejected', rejectionNotification);
    console.log('📤 Rejection notification sent to freelancer');

    res.json({
      message: 'Bid rejected successfully',
      bid: bid
    });

  } catch (error) {
    console.error('❌ Reject bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PATCH /api/bids/:bidId/update
// @desc    Update bid price and message
// @access  Private (Freelancer who created the bid)
exports.updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { price, message } = req.body;

    console.log('📝 Updating bid:', bidId);

    // Validation
    if (!price && !message) {
      return res.status(400).json({ message: 'Please provide price or message to update' });
    }

    // Find the bid
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Authorization: Only the freelancer who created the bid can update it
    if (bid.freelancerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    // Check if gig is still open
    if (bid.gigId.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    // Check if bid can be updated (only pending or rejected bids)
    if (bid.status === 'hired') {
      return res.status(400).json({ message: 'Cannot update a hired bid' });
    }

    // Store old values for notification
    const oldPrice = bid.price;

    // Update bid
    if (price) bid.price = price;
    if (message) bid.message = message;
    
    // Reset status to pending if it was rejected
    if (bid.status === 'rejected') {
      bid.status = 'pending';
    }

    await bid.save();

    console.log('✅ Bid updated successfully');

    // Notify gig owner about updated bid
    const io = req.app.get('io');
    const updateNotification = {
      message: `${bid.freelancerId.name} updated their bid from $${oldPrice} to $${price} on "${bid.gigId.title}"`,
      gigId: bid.gigId._id,
      gigTitle: bid.gigId.title,
      bidId: bid._id,
      freelancerName: bid.freelancerId.name,
      oldPrice: oldPrice,
      newPrice: price,
      timestamp: new Date(),
      type: 'bid_updated'
    };

    io.to(bid.gigId.ownerId.toString()).emit('bidUpdated', updateNotification);
    console.log('📤 Bid update notification sent to gig owner');

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title budget');

    res.json({
      message: 'Bid updated successfully',
      bid: updatedBid
    });

  } catch (error) {
    console.error('❌ Update bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/bids/my/bids
// @desc    Get all bids created by logged-in user
// @access  Private
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};