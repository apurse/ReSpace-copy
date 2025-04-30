import * as FileSystem from 'expo-file-system';

const roomsPath = `${FileSystem.documentDirectory}rooms/`;

//  Set rules to name a room
export const settingRoomName = (roomName: string): string => {
  return roomName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\- ]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

//  Check if room file exist
export const doesRoomExist = async (roomName: string): Promise<boolean> => {
  const fileName = settingRoomName(roomName);
  const fileJson = `${roomsPath}${fileName}.json`;
  const info = await FileSystem.getInfoAsync(fileJson);
  return info.exists;
};

//  Create room file
export const createRoomIfNotExists = async (
  roomName: string
): Promise<{
  success: boolean;
  message: string;
  alreadyExists?: boolean;
  roomData?: any;
}> => {
  const fileName = settingRoomName(roomName);
  const fileJson = `${roomsPath}${fileName}.json`;

  try {
    const dirInfo = await FileSystem.getInfoAsync(roomsPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(roomsPath, { intermediates: true });
    }

    const fileExists = await doesRoomExist(roomName);
    if (fileExists) {
      console.log(`Room already exists: ${fileJson}`); // Show file path to check if it exists

      const existingData = await FileSystem.readAsStringAsync(fileJson);
      return {
        success: true,
        message: 'Room already exists',
        alreadyExists: true,
        roomData: JSON.parse(existingData),
      };
    }

    const roomData = {
      furniture: [],
      layouts: []
    };

    await FileSystem.writeAsStringAsync(fileJson, JSON.stringify(roomData));
    console.log(`Room created at: ${fileJson}`);  // Show file path to check if it was created
    return {
      success: true,
      message: 'Room created successfully',
      alreadyExists: false,
      roomData
    };
  } catch (error) {
    console.error('Error creating room:', error);
    return { success: false, message: 'An error occurred while creating the room' };
  }
};
