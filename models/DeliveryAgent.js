const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  currentLocation: {
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
});

// Create geospatial index for currentLocation
deliveryAgentSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);