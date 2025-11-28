const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Portfolio title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  images: [{
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    caption: {
      type: String,
      maxlength: [255, 'Caption cannot be more than 255 characters']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ isPublic: 1 });

// Virtual for getting user info
portfolioSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema); 