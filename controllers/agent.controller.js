const Parcel = require('../models/Parcel');
const ParcelStatusHistory = require('../models/ParcelStatusHistory');
const DeliveryAgent = require('../models/DeliveryAgent');
const mapService = require('../services/map.service');

exports.getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({
      assignedAgent: req.user.id,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] },
    }).sort({ createdAt: 1 });
    
    res.json(parcels);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateParcelStatus = async (req, res) => {
  try {
    const { status, notes, latitude, longitude } = req.body;
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      assignedAgent: req.user.id,
    });
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found or not assigned to you' });
    }
    
    // Validate status transition
    const validTransitions = {
      pending: ['assigned'],
      assigned: ['picked_up'],
      picked_up: ['in_transit'],
      in_transit: ['delivered', 'failed'],
    };
    
    if (!validTransitions[parcel.status]?.includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }
    
    // Update parcel status
    parcel.status = status;
    await parcel.save();
    
    // Record status history
    await ParcelStatusHistory.create({
      parcel: parcel._id,
      status,
      changedBy: req.user.id,
      location: longitude && latitude ? {
        type: 'Point',
        coordinates: [longitude, latitude],
      } : null,
      notes,
    });
    
    // If delivered or failed, clear agent assignment
    if (['delivered', 'failed'].includes(status)) {
      parcel.assignedAgent = null;
      await parcel.save();
    }
    
    res.json(parcel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOptimizedRoute = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      assignedAgent: req.user.id,
    });
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found or not assigned to you' });
    }
    
    // Get agent's current location
    const agent = await DeliveryAgent.findOne({ user: req.user.id });
    if (!agent || !agent.currentLocation) {
      return res.status(400).json({ error: 'Agent location not available' });
    }
    
    const route = await mapService.getOptimizedRoute(
      agent.currentLocation,
      parcel.pickupCoordinates,
      parcel.deliveryCoordinates
    );
    
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAgentLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Please provide coordinates' });
    }
    
    const agent = await DeliveryAgent.findOneAndUpdate(
      { user: req.user.id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
      { new: true, upsert: true }
    );
    
    res.json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};