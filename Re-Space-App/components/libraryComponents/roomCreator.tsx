import * as FileSystem from 'expo-file-system';

const roomsPath = `${FileSystem.documentDirectory}rooms/`;


/**
 * Validate original input.
 * Trim input, check for invalid characters, check valid length (16 char max).
 */
export const isValidRoomName = (roomName: string): boolean => {
  const trimmed = roomName.trim();
  const invalidChars = /[^a-z0-9_\- ]/i;
  const maxLength = 16;
  return (
    trimmed.length > 0 &&
    trimmed.length <= maxLength &&
    !invalidChars.test(trimmed)
  );
};

/**
 * Check if room file exists
 */
export const doesRoomExist = async (roomName: string): Promise<boolean> => {
  const fileJson = `${roomsPath}${roomName}.json`;
  const info = await FileSystem.getInfoAsync(fileJson);
  return info.exists;
};

/**
 * Create room file if it doesn't exist
 */
export const createRoomIfNotExists = async (
  roomName: string,
  user: any
): Promise<{
  success: boolean;
  message: string;
  alreadyExists?: boolean;
  roomData?: any;
}> => {

  //  Check if the input is valid
  if (!isValidRoomName(roomName)) {
    return {
      success: false,
      message:
        'Room name contains invalid characters or it is over 16 characters. Only letters, numbers, spaces, underscores, and dashes are allowed.',
    };
  }

  //  Check there is a name for the room
  if (!roomName) {
    return {
      success: false,
      message: 'Room name is invalid. Please choose a different name.',
    };
  }

  //  Room file path
  const fileJson = `${roomsPath}${roomName}.json`;

  try {

    //  Check if directory exist, if not, create one
    const dirInfo = await FileSystem.getInfoAsync(roomsPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(roomsPath, { intermediates: true });
    }

    //  Check if room already exist, if so, parse room data to be shown
    const fileExists = await doesRoomExist(roomName);
    if (fileExists) {
      console.log(`Room already exists: ${fileJson}`);

      const existingData = await FileSystem.readAsStringAsync(fileJson);
      return {
        success: true,
        message: 'Room already exists',
        alreadyExists: true,
        roomData: JSON.parse(existingData),
      };
    }

    //  Room's Json file
    const roomData = {
      roomFiles: {
        yaml: "",
        data: "",
        posegraph: "",
        pmg: "",
        roomScan: "",
      },
      [user.username]: {
        furniture: [],
        layouts: []
      }
    };

    //  Create json file
    await FileSystem.writeAsStringAsync(fileJson, JSON.stringify(roomData));
    console.log(`Room created at: ${fileJson}`);
    console.log("backend", roomData)
    return {
      success: true,
      message: 'Room created successfully',
      alreadyExists: false,
      roomData,
    };
  } catch (error) {
    console.error('Error creating room:', error);
    return {
      success: false,
      message: 'An error occurred while creating the room',
    };
  }
};
