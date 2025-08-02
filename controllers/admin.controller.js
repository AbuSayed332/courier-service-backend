const User = require('../models/User');
const Parcel = require('../models/Parcel');
const DeliveryAgent = require('../models/DeliveryAgent');
const moment = require('moment');

exports.getAllParcels = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }
    
    const parcels = await Parcel.find(filter)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json(parcels);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    
    // Check if agent exists and is actually an agent
    const agent = await User.findOne({
      _id: agentId,
      role: 'agent',
    });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      {
        assignedAgent: agentId,
        status: 'assigned',
      },
      { new: true }
    );
    
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    // Record status change
    await ParcelStatusHistory.create({
      parcel: parcel._id,
      status: 'assigned',
      changedBy: req.user.id,
      notes: `Assigned to agent ${agent.name}`,
    });
    
    res.json(parcel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    // Today's date range
    const startOfToday = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    
    // Count today's bookings
    const todayBookings = await Parcel.countDocuments({
      createdAt: {
        $gte: startOfToday.toDate(),
        $lte: endOfToday.toDate(),
      },
    });
    
    // Count failed deliveries today
    const todayFailed = await Parcel.countDocuments({
      status: 'failed',
      updatedAt: {
        $gte: startOfToday.toDate(),
        $lte: endOfToday.toDate(),
      },
    });
    
    // Sum COD amounts for today's deliveries
    const todayCodResult = await Parcel.aggregate([
      {
        $match: {
          paymentType: 'cod',
          status: 'delivered',
          updatedAt: {
            $gte: startOfToday.toDate(),
            $lte: endOfToday.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    
    const todayCodAmount = todayCodResult.length > 0 ? todayCodResult[0].total : 0;
    
    // Get parcel status distribution
    const statusDistribution = await Parcel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    res.json({
      todayBookings,
      todayFailed,
      todayCodAmount,
      statusDistribution,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};