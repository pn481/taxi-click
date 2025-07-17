import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function MapView({ driverLocation }) {
  const center = driverLocation || { lat: -26.2041, lng: 28.0473 }; // Default: Johannesburg
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '300px' }}
        center={center}
        zoom={14}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MapView;
