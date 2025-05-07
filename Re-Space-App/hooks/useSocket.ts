import { useContext, useCallback } from "react";
import { WebSocketContext } from "@/app/context/webSocketProvider";

export const useSocket = () => {
  const { socket, isConnected, robotData, latencyData, QRCode, roomScanFiles } = useContext(WebSocketContext);

  // SendMessage function
  const sendMessage = useCallback((msgData: Record<string, unknown>) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(msgData));
      console.log("Sent:", msgData);
    } else {
      console.warn("WebSocket not connected!");
    }
  }, [socket, isConnected]);
  

  return { socket, isConnected, robotData, sendMessage, latencyData, QRCode, roomScanFiles };
};

// Code moved to app/context/webSocketProvider

// // WebSocket hook for passing connection data across app
// import { SocketContext } from '@/app/_layout';
// import { useContext } from "react";
// import { updateList } from '@/app/(tabs)/index';
//
// export const useSocket = () => {
//   const socket = useContext(SocketContext);
//
//   // connection opened
//   socket.onopen = () => {
//     console.log("WebSocket connection established.");
//   };
//
//
//   // an error occurred
//   socket.onerror = (e: any) => { console.log(e) };
//
//
//   // connection closed
//   socket.onclose = (e: { code: any; reason: any; }) => { console.log(e.code, e.reason) };
//
//
//   // a message was received
//   socket.onmessage = (e: { data: string; }) => {
//     try {
//       const data = JSON.parse(e.data);
//       console.log("Received:", data);
//
//
//       // send to robotInfo.tsx
//       if (data.type == "status")
//         console.log("status")
//
//
//       // send to index.tsx
//       else if (data.type == "robot_list")
//         updateList(data);
//
//
//       else console.log(data.type);
//
//
//     } catch (err) {
//       console.error("Error parsing message:", err);
//     }
//
//   };
//
//   return socket;
// };
//
//
// // Listen for response from server
// function listenForMessage() {
//   const socket = useContext(SocketContext);
//   return new Promise((resolve, reject) => {
//
//     socket.onmessage = (e: { data: string; }) => {
//       try {
//         const data = JSON.parse(e.data);
//         console.log("Received:", data);
//         resolve(data);
//
//       } catch (err) {
//         console.error("Error parsing message:", err);
//         resolve(null);
//       }
//     };
//   });
// }
//
//
// // send message to server
// export async function sendMessage(response: boolean, data: Record<string, unknown>) {
//   const socket = useContext(SocketContext);
//   if (socket.readyState === WebSocket.OPEN) {
//     console.log("Sending data to server")
//     socket.send(JSON.stringify(data));
//   } else {
//     console.error("WebSocket is not open.");
//   }
//
//
//   // if message requires response, listen for message
//   if (response) {
//     const data = await listenForMessage();
//     return data;
//   }
//
//   return null;
// }
//
// test latency function
// export async function testLatency(data: Record<string, unknown>) {
//   const { sendMessage, robotData, isConnected  } = useSocket();
//   console.log("Testing speed")
//   var start = new Date().getTime();
//   var response = await sendMessage(data);
//
//
//   // if response given, output time
//   if (response !== null) {
//     var timeTaken = new Date().getTime() - start;
//     console.log(`Time taken: ${timeTaken} ms`);
//     return timeTaken;
//   }
//
//   return null;
// }