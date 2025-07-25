import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

function MapView({ driverLocation, onPassengerLocationChange }) {
  const [passengerLocation, setPassengerLocation] = useState(null);

  const handleMapClick = () => {
    return useMapEvents({
      click(e) {
        setPassengerLocation(e.latlng);
        if (onPassengerLocationChange) {
          onPassengerLocationChange(e.latlng);
        }
      }
    });
  };

  const centerPosition = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [-26.2041, 28.0473]; // Johannesburg default

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]}>
          <Popup>Driver is here</Popup>
        </Marker>
      )}

      {passengerLocation && (
        <Marker position={[passengerLocation.lat, passengerLocation.lng]}>
          <Popup>Passenger Location</Popup>
        </Marker>
      )}

      {handleMapClick()}
    </MapContainer>
  );
}

export default MapView;
