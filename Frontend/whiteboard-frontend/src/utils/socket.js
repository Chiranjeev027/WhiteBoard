// src/utils/socket.js
import { io } from "socket.io-client";

export const createNewSocket = () => {
  return io(process.env.REACT_APP_BACKEND_URL, { // Ensure port matches backend
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
};