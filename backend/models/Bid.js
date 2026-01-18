// backend/models/Bid.js - FIXED VERSION
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: [true, 'Gig ID is required'],
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'hired', 'rejected'],
      message: 'Status must be pending, hired, or rejected'
    },
    default: 'pending',
  },
}, {
  timestamps: true,
});

// ✅ FIXED: Conditional unique index - only prevent duplicate PENDING bids
// Allows users to resubmit after rejection
bidSchema.index(
  { gigId: 1, freelancerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_bid_per_gig'
  }
);

// Additional indexes for query performance
bidSchema.index({ gigId: 1, status: 1 });
bidSchema.index({ freelancerId: 1, createdAt: -1 });
bidSchema.index({ status: 1, createdAt: -1 });

// ✅ Virtual for populated gig title (useful for queries)
bidSchema.virtual('gigTitle', {
  ref: 'Gig',
  localField: 'gigId',
  foreignField: '_id',
  justOne: true,
});

// ✅ Ensure virtuals are included in JSON
bidSchema.set('toJSON', { virtuals: true });
bidSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bid', bidSchema);