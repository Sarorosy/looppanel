// socket.js (Singleton for Socket Connection)
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io("https://looppanelsocket-qlcd.onrender.com", {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 3000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        });
    }
    return socket;
};
