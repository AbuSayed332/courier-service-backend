const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const parcelRoutes = require('./routes/parcel.routes');
const agentRoutes = require('./routes/agent.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;