import React, { useState, useEffect } from "react";
import Modal from "react-native-modal";
import { useTheme } from "@/app/_layout";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import WheelColorPicker from 'react-native-wheel-color-picker';

// Defining types for function
interface ColourPickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    selectedColour: string;
    onSelectedColour: (color: string) => void;
}

export const ColourPickerModal: React.FC<ColourPickerModalProps> = ({ isVisible, onClose, selectedColour, onSelectedColour }) => {

    // dark mode
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    return (
        <Modal isVisible={isVisible} style={uniqueStyles.modal} onBackdropPress={onClose}>
                    <View style={uniqueStyles.modalContent}>
                        <Text style={uniqueStyles.title}>Pick a colour</Text>
                        {/* <ColorPicker onColorSelected={selectedColour => onSelectedColour(selectedColour)}/> */}
                        <WheelColorPicker
                            color={selectedColour}
                            onColorChangeComplete={onSelectedColour}
                        />
                        <TouchableOpacity style={uniqueStyles.closeButton} onPress={onClose}>
                            <Text style={uniqueStyles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        modal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        modalContent: {
            backgroundColor: isDarkMode ? '#000' : '#fff',
            padding: 20,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            minHeight: 300,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
        },
        itemContainer: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
        },
        itemText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
        },
        itemDetails: {
            fontSize: 14,
            color: "gray",
        },
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'red',
            padding: 10,
            alignItems: 'center',
            borderRadius: 5,
        },
        closeText: {
            color: "white",
            fontSize: 16,
        },
    });