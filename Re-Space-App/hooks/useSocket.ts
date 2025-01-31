// WebSocket hook for passing connection data across app
import { SocketContext } from '@/app/_layout';
import { useContext } from "react";

export const useSocket = () => {
  const socket = useContext(SocketContext);

  // connection opened
  socket.onopen = () => {
    console.log("WebSocket connection established.");
  };
  
  
  // a message was received
  socket.onmessage = (e: { data: string; }) => {
    try {
      const data = JSON.parse(e.data);
      console.log("Received:", data);
    } catch (err) {
      console.error("Error parsing message:", err);
    };
  };
  
  
  // an error occurred
  socket.onerror = (e: any) => {console.log(e)};
  
  
  // connection closed
  socket.onclose = (e: { code: any; reason: any; }) => {console.log(e.code, e.reason)};
  

  // a message was received
  socket.onmessage = (e: { data: string; }) => {
    try {
      const data = JSON.parse(e.data);
      console.log("Received:", data);
    } catch (err) {
      console.error("Error parsing message:", err);
    };
  };
  
  return socket;
};

