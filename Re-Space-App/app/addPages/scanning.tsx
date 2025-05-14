import { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, Image, ImageBackground, ScrollView } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import ControllerButton from "@/components/settingsComponents/controllerButton";
import DropDownPicker from "react-native-dropdown-picker";
import { useSocket } from "@/hooks/useSocket";
import { Robot } from "@/components/models/Robot";
import { useRoom } from "@/hooks/useRoom";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Controller() {

    // Hooks and colours
    const { theme } = useTheme();
    const { robotData, roomScanFiles, scanningMap, sendMessage } = useSocket();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const { roomName, updateJsonData, jsonData } = useRoom()

    // Robot settings
    const [selectedRobot, setSelectedRobot] = useState(robotData.length > 0 ? robotData[0].robot_id : "");
    const [robotList, setRobotList] = useState<{ label: string; value: string }[]>([]);

    // Appearance settings
    const [dropDownVisible, setDropDownVisible] = useState(false);
    const [startPressed, setStartPressed] = useState(false);
    const [savePressed, setSavePressed] = useState(false);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const [previousImage, setPreviousImage] = useState<string>("")
    const [newImage, setNewImage] = useState<string>("")


    // Update the robot list on robotData change
    useEffect(() => {
        const updatedRobotList = robotData.map((robot: Robot) => ({
            label: robot.robot_id,
            value: robot.robot_id,
        }));

        setRobotList(updatedRobotList);

        // Auto select the first robot if none are selected
        if (updatedRobotList.length > 0 && !selectedRobot) {
            setSelectedRobot(updatedRobotList[0].value);
        }
    }, [robotData]);


    // Set the new scan as the new image
    useEffect(() => {
        setNewImage(scanningMap)
    }, [scanningMap])


    /**
     * Scanning-unique buttons, start the robot and save the layout
     */
    const scanningFunctions = (title: string) => {
        if (title == "Start") {
            console.log("start pressed")
            setStartPressed(true)
            sendMessage({ type: "set_mode", config: "remap", target: selectedRobot });
        }

        if (title == "Save") {
            console.log("save pressed")
            setSavePressed(true)
            sendMessage({ type: "get_map", target: selectedRobot });
        }
    }


    return (
        <View style={defaultStyles.body}>

            {/* Dropdown Box */}
            <View style={uniqueStyles.dropdownContainer}>
                <Text style={uniqueStyles.label}>Select Robot:</Text>
                <DropDownPicker
                    open={dropDownVisible}
                    value={selectedRobot}
                    items={robotList}
                    setOpen={setDropDownVisible}
                    setValue={setSelectedRobot}
                    setItems={setRobotList}
                    placeholder="Select a Robot"
                    style={uniqueStyles.picker}
                    dropDownContainerStyle={uniqueStyles.dropDownContainer}
                />
            </View>


            {/* Map */}
            <View style={uniqueStyles.mapContainer}>

                {/* Display the previous image while rendering new image */}
                <ImageBackground
                    source={{ uri: (`data:image/png;base64,${previousImage}`) }}
                    resizeMode="contain"
                    >
                    <Image
                        style={uniqueStyles.imageBody}
                        source={{ uri: (`data:image/png;base64,${newImage}`) }}
                        resizeMode="contain"
                        onLoad={() => setPreviousImage(newImage)} />
                </ImageBackground>
            </View>


            {/* Controller Buttons */}
            <View style={uniqueStyles.controller}>
                <View>
                    {!startPressed ?
                        <ControllerButton text="Start" buttonStyle={{ backgroundColor: '#2E7D32', color: 'white' }} targetRobot={selectedRobot} onPress={() => scanningFunctions("Start")} />
                        :
                        <ControllerButton text="Running!" />
                    }
                    <ControllerButton iconName={"rotate-left"} message='left' targetRobot={selectedRobot} />
                    {!savePressed ?
                        <ControllerButton text="Save" buttonStyle={{ backgroundColor: '#00838F' }} targetRobot={selectedRobot} onPress={() => scanningFunctions("Save")} />
                        :
                        <ControllerButton text="Saved!" />
                    }
                </View>
                <View>
                    <ControllerButton iconName={"chevron-up"} message='forward' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"stop"} message='stop' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"chevron-down"} message='backward' targetRobot={selectedRobot}></ControllerButton>
                </View>
                <View>
                    <ControllerButton iconName={"rotate-right"} message='right' targetRobot={selectedRobot}></ControllerButton>
                </View>
            </View>
        </View >
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        dropdownContainer: {
            width: "95%",
            alignSelf: "center",
            top: -20,
        },
        label: {
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 5,
            color: isDarkMode ? "#fff" : "#000",
        },
        picker: {
            backgroundColor: "#f0f0f0",
            borderRadius: 5,
            paddingHorizontal: 10,
            zIndex: 100,
        },
        dropDownContainer: {
            backgroundColor: "#fff",
            borderColor: "#ccc",
            zIndex: 100,
        },
        controller: {
            top: 10,
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        imageBody: {
            width: '100%',
            height: '100%',
        },
        mapContainer: {
            width: '100%',
            height: 300,
            backgroundColor: 'grey'
        }
    });
