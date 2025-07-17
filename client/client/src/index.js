import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { io } from 'socket.io-client';
import App from './App';
import reportWebVitals from './reportWebVitals';


io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('driver-location', (data) => {
    // Broadcast to all passengers
    io.emit('driver-location-update', data);
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
