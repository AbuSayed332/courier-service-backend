const Parcel = require('../models/Parcel');
const ParcelStatusHistory = require('../models/ParcelStatusHistory');
const { generateTrackingNumber } = require('../utils/generateTracking');
const mapService = require('../services/map.service');

exports.createParcel = async (req, res) => {
  try {
    const { pickupAddress, deliveryAddress, parcelType, parcelSize, paymentType, amount } = req.body;
    
    // Get coordinates from addresses
    const pickupCoords = await mapService.geocodeAddress(pickupAddress);
    const deliveryCoords = await mapService.geocodeAddress(deliveryAddress);
    
    const parcel = await Parcel.create({
      trackingNumber: generateTrackingNumber(),
      customer: req.user.id,
      pickupAddress,
      pickupCoordinates: pickupCoords,
      deliveryAddress,
      deliveryCoordinates: deliveryCoords,
      parcelType,
      parcelSize,
      paymentType,
      amount: paymentType === 'cod' ? amount : null,
    });
    
    // Record initial status
    await ParcelStatusHistory.create({
      parcel: parcel._id,
      status: 'pending',
      changedBy: req.user.id,
    });
    
    res.status(201).json(parcel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCustomerParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedAgent', 'name phone');
    
    res.json(parcels);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getParcelDetails = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).populate('assignedAgent', 'name phone');
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    res.json(parcel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getParcelTracking = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    const history = await ParcelStatusHistory.find({ parcel: parcel._id })
      .sort({ createdAt: -1 })
      .populate('changedBy', 'name role');
    
    res.json({ parcel, history });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};