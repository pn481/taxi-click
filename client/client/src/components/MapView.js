import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapView({ driverLocation }) {
  const position = driverLocation
  ? [driverLocation.lat,
    driverLocation.lng]
    : [-26.2041, 28.0473]; // Johannesburg Default

    return (
      <MapContainer center={position}
      zoom={13} style={{ height: "300px",
        width: "100%" }}>
          <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Driver is here.</Popup>
          </Marker>
        </MapContainer>
    );
}

export default MapView;