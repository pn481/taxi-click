const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS setup - allow localhost and web app for dev and prod
app.use(cors({
  origin: [
    'https://taxi-click-43fa9.web.app',
    'http://localhost:3000',
    'https://taxi-click.vercel.app'
  ]
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose Model
const RideRequest = mongoose.model('RideRequest', new mongoose.Schema({
  passengerName: String,
  location: String,
  destination: String,
  status: { type: String, default: 'waiting' }
}));

// REST API Endpoints
app.post('/api/request', async (req, res) => {
  const ride = await RideRequest.create(req.body);
  io.emit('new-request', ride);
  res.json(ride);
});

app.get('/api/requests', async (req, res) => {
  const rides = await RideRequest.find({ status: 'waiting' });
  res.json(rides);
});

app.patch('/api/request/:id', async (req, res) => {
  const ride = await RideRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit('request-status-update', { id: ride._id, status: ride.status });
  res.json(ride);
});

// Simple test routes
app.get('/', (req, res) => {
  res.send('Taxi@ a click backend is running!');
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://taxi-click-43fa9.web.app",
      "http://localhost:3000",
      "https://taxi-click.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('driver-location', (data) => {
    io.emit('driver-location-update', data);
  });

  socket.on('pickup-request', ({ passengerLocation, destination }) => {
    io.emit('pickup-requested', { passengerLocation, destination });
  });

  socket.on('request-status-update', ({ status, id }) => {
    io.emit('request-status-update', { status, id });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
