import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import MapView from './components/MapView';

const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

function App() {
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [requests, setRequests] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    fetchRequests();

    socket.on('new-request', (data) => setRequests(prev => [...prev, data]));
    socket.on('driver-location-update', loc => setDriverLocation(loc));

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">TaxiGo Load+</h1>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


const mapContainerStyle = { width: '100%', height: '300px' };
const center = { lat: -26.2041, lng: 28.0473 }; // Example: Johannesburg

<LoadScript googleMapsApiKey={process.env.REACT_APP_MAPS_KEY}>
  <GoogleMap
    mapContainerStyle={mapContainerStyle}
    center={center}
    zoom={12}
  >
    <Marker position={center} />
  </GoogleMap>
</LoadScript>


export default App;
