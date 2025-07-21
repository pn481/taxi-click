import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import MapView from './components/MapView';
import 'leaflet/dist/leaflet.css';
import socket from './socket';

// Remove duplicate socket declaration!
const NOTIFICATION_TIMEOUT = 3500;

function Notification({ message, onClose }) {
  if (!message) return null;
  setTimeout(onClose, NOTIFICATION_TIMEOUT);
  return (
    <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg transition animate-bounce">
      {message}
    </div>
  );
}

export default function App() {
  const [destination, setDestination] = useState('');
  const [requests, setRequests] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [requestStatus, setRequestStatus] = useState('Request Pickup');
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchRequests();

    socket.on('driver-location-update', loc => {
      setDriverLocation(loc);
    });

    socket.on('pickup-requested', ({ passengerLocation, destination }) => {
      setNotification('New pickup request received!');
    });

    socket.on('request-status-update', ({ status }) => {
      setNotification(`Request status changed: ${status}`);
    });

    // Periodically send driver's location if available
    const geoInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          socket.emit('driver-location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        });
      }
    }, 5000);

    return () => clearInterval(geoInterval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/requests`);
      setRequests(res.data);
    } catch (err) {
      setNotification('Error fetching requests');
    }
  };

  const acceptRequest = async (id) => {
    await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/request/${id}`, { status: 'accepted' });
    setRequestStatus('Accepted');
    setNotification('Request accepted!');
    fetchRequests();
    socket.emit('request-status-update', { status: 'accepted', id });
  };

  const requestPickup = () => {
    if (!passengerLocation || !destination) {
      setNotification('Please select your location and enter your destination.');
      return;
    }
    socket.emit('pickup-request', { passengerLocation, destination });
    setRequestStatus('Requested');
    setNotification('Pickup requested!');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-yellow-200">
      <Notification message={notification} onClose={() => setNotification('')} />

      <aside className="w-1/5 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 text-white p-6 flex flex-col items-center shadow-xl">
        <img
          src="/logo192.png"
          alt="Taxi Logo"
          className="w-24 mb-4 animate-pulse"
        />
        <h1 className="text-3xl font-extrabold mb-3 tracking-wide transition-all duration-500 hover:text-yellow-300 hover:scale-105 cursor-pointer">
          Taxi@ a Click
        </h1>
        <p className="text-xs">South Africa's Real-time Taxi App</p>
      </aside>

      <main className="flex-1 px-12 py-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 hover:text-orange-600 hover:underline cursor-pointer">
              Passenger Panel
            </h2>
            <input
              className="border border-gray-300 rounded-lg p-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter destination"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
            <button
              onClick={requestPickup}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 mb-4 w-full"
            >
              Request Pickup
            </button>
            <MapView
              driverLocation={driverLocation}
              passengerLocation={passengerLocation}
              onPassengerLocationChange={setPassengerLocation}
            />
            {passengerLocation && (
              <p className="mt-2 text-gray-700 bg-white bg-opacity-80 p-2 rounded shadow">
                <span className="font-semibold">Passenger Location:</span>
                {' '}
                Lat {passengerLocation.lat.toFixed(5)}, Lng {passengerLocation.lng.toFixed(5)}
              </p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 hover:text-green-600 hover:underline cursor-pointer">
              Driver View
            </h2>
            {requests.length === 0 && (
              <p className="text-gray-600 italic">No pending ride requests.</p>
            )}
            {requests.map(req => (
              <div
                key={req._id}
                className="border rounded-lg shadow p-4 bg-white mb-5 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <p>
                  <strong>From:</strong> {req.location}
                </p>
                <p>
                  <strong>To:</strong> {req.destination}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                    onClick={() => acceptRequest(req._id)}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setRequestStatus('Navigating')}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white px-3 py-1 rounded transition"
                  >
                    {requestStatus === 'Requested' ? 'Start Navigation' : 'Navigating'}
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
