import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import MapView from './components/MapView';
import 'leaflet/dist/leaflet.css';

const socket = io(process.env.REACT_APP_BACKEND_URL || 'https://taxi-click.onrender.com');

export default function App() {
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [requests, setRequests] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [requestStatus, setRequestStatus] = useState('Request Pickup');

  useEffect(() => {
    fetchRequests();
    socket.on('driver-location-update', (driverLocation) => {
      console.log('Driver is moving:', driverLocation);
      // Update marker on Leaflet map
    });
    socket.on('new-request', (data) => setRequests(prev => [...prev, data]));
    socket.on('driver-location-update', loc => setDriverLocation(loc));
    socket.on('pickup-requested', ({ passengerLocation, destination }) => {
       console.log('New pickup request:', passengerLocation, destination);
      })
    
    // Driver sends location every 5s
    const geoInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        socket.emit('driver-location', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }, 5000);

    return () => clearInterval(geoInterval);
  }, []);

  const fetchRequests = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/requests`);
    setRequests(res.data);
  };

  const submitRequest = async () => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/request`, {
      passengerName: 'Promise',
      location,
      destination
    });
    setLocation('');
    setDestination('');
  };
  const acceptRequest = async (id) => {
    await axios.patch(`https://taxi-click.onrender.com/api/request/${id}`, { status: 'accepted' });
    fetchRequests();
  };
  const requestPickup = () => {
    const passengerLocation = { lat: -26.2, lng: 28.04 };
    socket.emit('pickup-request', { passengerLocation, destination });
    setRequestStatus('Requested');
  };
  navigator.geolocation.watchPosition((Position) => {
    const driverLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    socket.emit('driver-location', driverLocation);
  })
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Taxi@ a click</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h2 className="font-semibold mb-2">Passenger Request</h2>
          <input className="border p-2 w-full mb-2" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <input className="border p-2 w-full mb-2" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submitRequest}>Request Pickup</button>
          <MapView driverLocation={driverLocation} />
        </div>

        <div>
          <h2 className="font-semibold mb-2">Driver View</h2>
          {requests.map(req => (
            <div key={req._id} className="border-b py-2">
              <p><strong>From:</strong> {req.location}</p>
              <p><strong>To:</strong> {req.destination}</p>
              <button className="mt-1 bg-green-500 text-white px-3 py-1 rounded" onClick={() => acceptRequest(req._id)}>Accept</button>
              <button onClick={() => setRequestStatus('navigating')}>{requestStatus == 'Requested' ? 'Start Navigation' : 'Navigating'}</button>
              <button onClick={requestPickup}>{requestStatus}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



