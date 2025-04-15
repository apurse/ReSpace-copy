import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import ControllerButton from "@/components/settingsComponents/controllerButton";
import DropDownPicker from "react-native-dropdown-picker";
import { useSocket } from "@/hooks/useSocket";
import { Robot } from "@/components/models/Robot";

const { width, height } = Dimensions.get('window');

export default function Controller() {
    const { theme } = useTheme();
    const { robotData } = useSocket();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);

    // State for dropdown
    const [selectedRobot, setSelectedRobot] = useState(
        robotData.length > 0 ? robotData[0].robot_id : ""
    );
    const [open, setOpen] = useState(false); // Open/close dropdown
    const [robotList, setRobotList] = useState<{ label: string; value: string }[]>([]);

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

    return (
        <View style={defaultStyles.body}>

            {/* Page Title */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Account Settings</Text>
            </View>

        </View>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        dropdownContainer: {
            width: "95%",
            alignSelf: "center",
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
            zIndex: 100, // Ensures dropdown appears on top
        },
        controller: {
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            marginHorizontal: "auto",
            alignItems: 'center',
        },
        button: {
            borderRadius: 20,
            width: width * 0.2,
            height: width * 0.2,
            marginBottom: 10,
            marginLeft: 10,
        },
    });
