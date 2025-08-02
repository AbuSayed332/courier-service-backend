const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  pickupCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  parcelType: {
    type: String,
    required: true,
  },
  parcelSize: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
  },
  paymentType: {
    type: String,
    enum: ['cod', 'prepaid'],
    required: true,
  },
  amount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
    default: 'pending',
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
parcelSchema.index({ customer: 1 });
parcelSchema.index({ assignedAgent: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ pickupCoordinates: '2dsphere' });
parcelSchema.index({ deliveryCoordinates: '2dsphere' });

module.exports = mongoose.model('Parcel', parcelSchema);