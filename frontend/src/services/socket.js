// Socket.IO client - real-time connection to backend WebSocket server
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create single socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

// Connect to socket server
export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

// Disconnect from socket server
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;
