const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
    index: true  // Regular index for faster queries
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // Regular index for faster queries
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
    index: true  // Index for faster status queries
  }
}, {
  timestamps: true
});

// ✅ COMPOUND INDEX - Improves query performance
// This makes queries faster but allows multiple bids from same freelancer
bidSchema.index({ gigId: 1, freelancerId: 1, status: 1 });

// ✅ PARTIAL UNIQUE INDEX - Only one PENDING bid per freelancer per gig
// This prevents duplicate pending bids but allows re-bidding after rejection!
// The magic is in "partialFilterExpression" - index only applies to pending bids
bidSchema.index(
  { gigId: 1, freelancerId: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_bid'  // Named for easy identification
  }
);

// Virtual for bid age
bidSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / 1000 / 60); // age in minutes
});

// Method to check if bid can be updated
bidSchema.methods.canBeUpdated = function() {
  return this.status === 'pending';
};

// Static method to find pending bid for a specific freelancer on a gig
bidSchema.statics.findPendingBid = function(gigId, freelancerId) {
  return this.findOne({ gigId, freelancerId, status: 'pending' });
};

// Static method to count bids for a gig
bidSchema.statics.countBidsForGig = function(gigId) {
  return this.countDocuments({ gigId });
};

// Pre-save hook to validate
bidSchema.pre('save', function(next) {
  // Ensure message is not empty after trimming
  if (!this.message || this.message.trim().length < 10) {
    next(new Error('Message must be at least 10 characters'));
  }
  
  // Ensure price is positive
  if (this.price <= 0) {
    next(new Error('Price must be greater than 0'));
  }
  
  next();
});

module.exports = mongoose.model('Bid', bidSchema);