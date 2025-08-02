const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Track connected agents
const connectedAgents = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Agent sends their ID when connecting
  socket.on('register-agent', (agentId) => {
    connectedAgents.set(agentId, socket.id);
    console.log(`Agent ${agentId} connected`);
  });
  
  // Handle location updates from agents
  socket.on('location-update', async (data) => {
    const { agentId, parcelId, lat, lng } = data;
    
    try {
      // Update agent's location in DB
      await DeliveryAgent.findOneAndUpdate(
        { user: agentId },
        {
          currentLocation: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        }
      );
      
      // Notify customers tracking this parcel
      io.to(`tracking_${parcelId}`).emit('location-update', { lat, lng });
    } catch (error) {
      console.error('Location update error:', error);
    }
  });
  
  // Customer joins tracking room
  socket.on('join-tracking', (parcelId) => {
    socket.join(`tracking_${parcelId}`);
    console.log(`Customer joined tracking room for parcel ${parcelId}`);
  });
  
  socket.on('disconnect', () => {
    // Remove agent from connected agents
    for (const [agentId, socketId] of connectedAgents.entries()) {
      if (socketId === socket.id) {
        connectedAgents.delete(agentId);
        console.log(`Agent ${agentId} disconnected`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});