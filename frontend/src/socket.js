import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; // matches backend PORT

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
