import ReactDOM from 'react-dom/client';
import './index.css';
import { io } from 'socket.io-client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

export const useSocket = () => {
  const socketRef = useRef();
  
  useEffect(() => {
    socketRef.current =
    io(process.env.REACT_APP_BACKEND_URL);
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  return socketRef.current;
};

const socket =
io('https://taxi-click.onrender.com/',
   {
    transports: ["websocket"],
    secure: true,
    reconnection: true,
    rejectUnauthorized: false
   });
socket.on('connect', () => {
  console.log('Connected to server via Socket.IO:', socket.id);
});
fetch(`$
  {process.env.React_APP_BACKEND_URL}/api/results`)
const root = ReactDOM.createRoot(document.getElementById('root'));
fetch(`$
  {process.env.REACT_APP_BACKEND_URL}/api/v1/prpjects`);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
