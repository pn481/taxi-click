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


app.use(cors({
  origin: 'https://taxi-click-8pm5y3lik-pn481s-projects.vercel.app'
}));

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

app.get('/', (req, res) => {
  res.send('Taxi@ a click backend is running!');
});

app.get('/api/results', (reg, res) => {
  res.json({ message: 'Results fetched succesfully!' });
});

app.get('/api/v1/projects', (req, res) => {
  res.json({ projects:[] }); // replace with actual data logic
});

app.patch('/api/request/:id', async (req, res) => {
  const ride = await RideRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ride);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
