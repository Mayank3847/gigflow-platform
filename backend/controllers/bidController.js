const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const mongoose = require('mongoose');

// @route   POST /api/bids
// @desc    Create a new bid
// @access  Private
exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    console.log('📝 Creating bid:', { 
      gigId, 
      freelancerId: req.user._id, 
      price,
      messageLength: message?.length 
    });

    // ✅ Validation
    if (!gigId || !message || price === undefined || price === null) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide gigId, message, and price' 
      });
    }

    // ✅ Validate price
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Price must be a positive number' 
      });
    }

    // ✅ Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Message must be at least 10 characters' 
      });
    }

    // ✅ Check if gig exists and is open
    const gig = await Gig.findById(gigId).populate('ownerId', 'name email');
    
    if (!gig) {
      return res.status(404).json({ 
        success: false,
        message: 'Gig not found' 
      });
    }

    console.log('📋 Gig found:', { 
      gigId: gig._id, 
      title: gig.title,
      status: gig.status,
      ownerId: gig.ownerId._id 
    });

    if (gig.status !== 'open') {
      return res.status(400).json({ 
        success: false,
        message: 'This gig is no longer accepting bids' 
      });
    }

    // ✅ Prevent owner from bidding on their own gig
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot bid on your own gig' 
      });
    }

    // ✅ Check for existing PENDING bid
    const existingBid = await Bid.findOne({ 
      gigId, 
      freelancerId: req.user._id,
      status: 'pending'
    });

    if (existingBid) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending bid on this gig. Please wait for the client to respond.' 
      });
    }

    // ✅ Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message: message.trim(),
      price: numPrice
    });

    // ✅ Populate the created bid
    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title budget');

    console.log('✅ Bid created successfully:', bid._id);

    // ✅ Send real-time notification to gig owner
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        message: `${req.user.name} placed a bid of $${numPrice} on your gig "${gig.title}"`,
        gigId: gig._id,
        gigTitle: gig.title,
        bidId: bid._id,
        freelancerName: req.user.name,
        bidAmount: numPrice,
        timestamp: new Date(),
        type: 'new_bid'
      };

      io.to(gig.ownerId._id.toString()).emit('newBid', notificationData);
      console.log('📤 Notification emitted to gig owner:', gig.ownerId._id.toString());
    }

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid: populatedBid
    });

  } catch (error) {
    console.error('❌ Create bid error:', error);

    // ✅ Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending bid on this gig' 
      });
    }

    // ✅ Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }

    // ✅ Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID format' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to create bid. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/bids/:gigId
// @desc    Get all bids for a specific gig
// @access  Private (Gig Owner only)
exports.getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // ✅ Validate gigId
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid gig ID format' 
      });
    }

    // ✅ Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ 
        success: false,
        message: 'Gig not found' 
      });
    }

    // ✅ Only gig owner can see bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view these bids' 
      });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      bids
    });

  } catch (error) {
    console.error('❌ Get bids error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bids',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // ✅ Validate bidId
    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Invalid bid ID format' 
      });
    }

    console.log('💼 Hiring bid:', bidId);

    // ✅ Find the bid with session
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Bid not found' 
      });
    }

    const gig = bid.gigId;

    console.log('📋 Hiring for gig:', gig.title);
    console.log('👤 Hiring freelancer:', bid.freelancerId.name);

    // ✅ Authorization: Only gig owner can hire
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to hire for this gig' 
      });
    }

    // ✅ Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'This gig has already been assigned' 
      });
    }

    // ✅ Check if bid is still pending
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'This bid has already been processed' 
      });
    }

    // ✅ Get all rejected bids to notify them
    const rejectedBids = await Bid.find({
      gigId: gig._id,
      _id: { $ne: bidId },
      status: 'pending'
    }).populate('freelancerId', 'name email').session(session);

    console.log('📋 Found', rejectedBids.length, 'bids to reject');

    // ✅ Atomic operations within transaction
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

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log('✅ Transaction committed successfully');

    // ✅ Send real-time notifications
    const io = req.app.get('io');
    if (io) {
      // Notify hired freelancer
      const hiredFreelancerId = bid.freelancerId._id.toString();
      const hiredNotification = {
        message: `🎉 Congratulations! You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        gigTitle: gig.title,
        clientName: req.user.name,
        timestamp: new Date(),
        type: 'hired'
      };
      
      io.to(hiredFreelancerId).emit('hired', hiredNotification);
      console.log('📤 Hired notification sent to:', hiredFreelancerId);

      // Notify rejected freelancers
      rejectedBids.forEach((rejectedBid) => {
        const rejectedFreelancerId = rejectedBid.freelancerId._id.toString();
        const rejectionNotification = {
          message: `Your bid for "${gig.title}" was not selected. Keep trying!`,
          gigId: gig._id,
          gigTitle: gig.title,
          timestamp: new Date(),
          type: 'rejected'
        };
        
        io.to(rejectedFreelancerId).emit('bidRejected', rejectionNotification);
        console.log('📤 Rejection notification sent to:', rejectedFreelancerId);
      });
    }

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId');

    res.json({
      success: true,
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Hire bid error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to hire freelancer. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    res.json({
      success: true,
      count: bids.length,
      bids
    });

  } catch (error) {
    console.error('❌ Get my bids error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your bids',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};