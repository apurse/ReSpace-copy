import { useContext } from "react";
import { RoomContext } from "@/app/context/roomProvider";

export const useRoom = () => {
  const { roomName, jsonData, setupRoomJSON, setRoomName, updateJsonData, getRoomData } = useContext(RoomContext);

  return { roomName, jsonData, setupRoomJSON, setRoomName, updateJsonData, getRoomData };
};