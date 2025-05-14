import React, { createContext, useEffect, useState } from "react";
import * as FileSystem from 'expo-file-system';
import { createRoomIfNotExists } from '@/components/libraryComponents/roomCreator';
import { router } from "expo-router";
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from "@/hooks/useSocket";


// Create the authorisation Context
export const RoomContext = createContext<any>(null);


export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
    const [roomName, setRoomName] = useState<string | null>(null);
    const [jsonData, setJsonData] = useState<object>();
    const { user } = useAuth();
    const { roomScanFiles } = useSocket();

    const roomPath = `${FileSystem.documentDirectory}rooms/${roomName}.json`;


    // PROBLEMS: creates undefined/null, tries to get rooms after clearing
    // Select the correct room when the room name changes.
    useEffect(() => {
        if (roomName) getRoomData(roomName)
    }, [roomName])


    // PROBLEMS: creates undefined/null, tries to get rooms after clearing
    // Update the room files when updated in the socket provider.
    useEffect(() => {

        // Check the roomName is valid
        if (!roomName) return;

        console.log(roomScanFiles)
        const updateData = {
            ...jsonData,
            roomFiles: {
                yaml: roomScanFiles?.yaml,
                png: roomScanFiles?.png,
            }
        }
        updateJsonData(updateData)
    }, [roomScanFiles])


    /**
     * Get the room data from the JSON.
     */
    const getRoomData = async (roomName: string) => {
        if (!roomName) return;
        const roomPath = `${FileSystem.documentDirectory}rooms/${roomName}.json`;


        // Read room file, return if file does not exist
        const fileCheck = await FileSystem.getInfoAsync(roomPath);
        if (!fileCheck.exists) return;


        // Read and parse data from room file
        const data = await FileSystem.readAsStringAsync(roomPath);
        const thisData = JSON.parse(data);


        // If this user doesn't exist under this room, make user entry with arrays
        if (!thisData.users[user.username]) {
            const updateData = {
                ...thisData,
                users: {
                    ...thisData?.users,
                    [user.username]: {
                        roomFavourited: false,
                        furniture: [],
                        layouts: []
                    }
                }
            }

            // Update and set the new data
            await updateJsonData(updateData)
            setJsonData(updateData)
        }

        // Set the read data
        else setJsonData(thisData);
    };


    /**
     * Update the room JSON data.
     * @param dataChange The data that is being added.
     * @param filePath Optional, the file path that needs updating (useful for direct updates)
     */
    const updateJsonData = async (dataChange: any, filePath?: string) => {
        await FileSystem.writeAsStringAsync(filePath ? filePath : roomPath, JSON.stringify(dataChange));
        console.log(`${roomName} JSON updated:`, dataChange);
        setJsonData(dataChange);
    }


    /**
     * Setup a JSON file for the new room.
     * @param typedName The room name the user typed.
     */
    const setupRoomJSON = async (typedName: string) => {

        if (typedName.trim()) {

            //  Create new room if it doesn't already exist
            const result = await createRoomIfNotExists(typedName, user);

            //  Go to the new room created or room selected if name room already exist
            if (result.success) {
                setRoomName(typedName)
                router.replace('/addPages/roomDetails');
            } else {
                alert(result.message);
            }
        }
    }

    return (
        <RoomContext.Provider value={{ roomName, jsonData, setupRoomJSON, setRoomName, updateJsonData, getRoomData }}>
            {children}
        </RoomContext.Provider>
    );
};

export default RoomProvider;
