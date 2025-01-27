// WebSocket hook for passing connection data across app
import { SocketContext } from '@/app/_layout';
import { useContext } from "react";

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};