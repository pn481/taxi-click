const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors({
  origin: 'https://taxi-click-43fa9.web.app'
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
  res.json(ride);
});

// Simple test routes
app.get('/', (req, res) => {
  res.send('Taxi@ a click backend is running!');
});

app.get('/api/results', (req, res) => {
  res.json({ message: 'Results fetched successfully!' });
});

app.get('/api/v1/projects', (req, res) => {
  res.json({ projects: [] });
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "https://taxi-click-43fa9.web.app",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('driver-location', (data) => {
    console.log('Driver location received:', data);
    io.emit('driver-location-update', data);
  });

  socket.on('pickup-request', ({ passengerLocation, destination }) => {
    console.log('Pickup Request:', passengerLocation, destination);
    io.emit('pickup-requested', { passengerLocation, destination });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
