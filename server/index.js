const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ==== Allowed Origins for CORS ====
const allowedOrigins = [
  'https://taxi-click-43fa9.web.app', // Your Firebase hosting
  'https://taxi-click-aje2-gt1v1u76v-pn481s-projects.vercel.app', // Your Vercel deployment
  // Add other domains as needed (e.g., custom domains, localhost for testing)
];

// ==== Express CORS setup (handles REST API) ====
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow requests without origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // allow credentials/cookies if needed
}));
app.use(express.json());

// ==== MongoDB connection ====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ==== Mongoose Model ====
const RideRequest = mongoose.model('RideRequest', new mongoose.Schema({
  passengerName: String,
  location: String,
  destination: String,
  status: { type: String, default: 'waiting' }
}));

// ==== REST API Endpoints ====
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

// ==== Socket.IO Setup (handles real-time communication) ====
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
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

// ==== Start server ====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));