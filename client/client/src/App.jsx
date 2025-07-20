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
  const [passengerLocation, setPassengerLocation] = useState(null); // New

  useEffect(() => {
    fetchRequests();

    socket.on('driver-location-update', loc => {
      console.log('Driver is moving:', loc);
      setDriverLocation(loc);
    });

    socket.on('pickup-requested', ({ passengerLocation, destination }) => {
      console.log('New pickup request:', passengerLocation, destination);
    });

    // Send driver's location periodically
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
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests', err);
    }
  };
  
  const acceptRequest = async (id) => {
  await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/request/${id}`, { status: 'accepted' });
  fetchRequests();
  };


  const requestPickup = () => {
    if (!passengerLocation || !destination) {
      alert('Please select your location on the map and enter your destination.');
      return;
    }

    socket.emit('pickup-request', { passengerLocation, destination });
    setRequestStatus('Requested');
  };

  return (
    <div className="p-6">
      <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white text-center text-2xl font-bold">
        TaxiGo Load+
      </h1>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h2 className="font-semibold mb-2">Passenger Request</h2>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />

          <button
            onClick={requestPickup}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition"
          >
            {requestStatus}
          </button>

          <MapView
            driverLocation={driverLocation}
            onPassengerLocationChange={setPassengerLocation}
          />

          {passengerLocation && (
            <p className="mt-2 text-gray-700">
              Passenger Location: Lat {passengerLocation.lat.toFixed(5)}, Lng {passengerLocation.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Driver View</h2>
          {requests.map(req => (
            <div key={req._id} className="border-b py-2">
              <p><strong>From:</strong> {req.location}</p>
              <p><strong>To:</strong> {req.destination}</p>
              <button
                className="mt-1 bg-green-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => acceptRequest(req._id)}
              >
                Accept
              </button>
              <button
                onClick={() => setRequestStatus('Navigating')}
                className="bg-indigo-500 text-white px-3 py-1 rounded mr-2"
              >
                {requestStatus === 'Requested' ? 'Start Navigation' : 'Navigating'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
