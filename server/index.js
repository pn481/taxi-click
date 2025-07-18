const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const RideRequest = mongoose.model('RideRequest', new mongoose.Schema({
  passengerName: String,
  location: String,
  destination: String,
  status: { type: String, default: 'waiting' }
}));

// Routes
app.post('/api/request', async (req, res) => {
  const ride = await RideRequest.create(req.body);
  io.emit('new-request', ride); // Emit to all drivers
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

console.log('Connecting to MongoDB...');
await
mongoose.connect(process.env.MONGO_URI);
console.log('Connected to MongoDB');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
