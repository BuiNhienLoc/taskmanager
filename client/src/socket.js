import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
export const socket = io("http://127.0.0.1:5000", {
  autoConnect: false,
});