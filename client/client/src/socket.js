import { io } from "socket.io-client";
const socket = io(process.env.REACT_APP_BACKEND_URL || 'https://taxi-click.onrender.com');
export default socket;
