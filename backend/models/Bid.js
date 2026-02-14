const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
    index: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Message must be at least 10 characters']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

// ✅ COMPOUND INDEX - Improves query performance
bidSchema.index({ gigId: 1, freelancerId: 1, status: 1 });

// ✅ PARTIAL UNIQUE INDEX - Only one PENDING bid per freelancer per gig
// This prevents duplicate pending bids but allows re-bidding after rejection!
bidSchema.index(
  { gigId: 1, freelancerId: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_bid'
  }
);

module.exports = mongoose.model('Bid', bidSchema);