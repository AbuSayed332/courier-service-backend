const mongoose = require('mongoose');

const parcelStatusHistorySchema = new mongoose.Schema({
  parcel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcel',
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
parcelStatusHistorySchema.index({ parcel: 1 });
parcelStatusHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ParcelStatusHistory', parcelStatusHistorySchema);