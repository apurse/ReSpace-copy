import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Modal from "react-native-modal";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@/app/_layout";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from "@/hooks/useAuth";



// Defining types for furniture items
export interface FurnitureItem {
    furnitureID: string;
    name: string;
    model: string;
    height: number;
    width: number;
    length: number;
    quantity: number;
    selectedColour: string;
}

// Defining types for function
interface FurnitureModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectFurniture: (item: FurnitureItem) => void;
}

const FurnitureModal: React.FC<FurnitureModalProps> = ({ isVisible, onClose, onSelectFurniture }) => {
    const [furnitureData, setFurnitureData] = useState<FurnitureItem[]>([]);

    // dark mode
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const { roomName, jsonData } = useRoom();
    const { user } = useAuth();

    useEffect(() => {
        if (isVisible) {
            setFurnitureData(jsonData[user.username].furniture);
        }
    }, [isVisible]);

    return (
        <Modal isVisible={isVisible} style={uniqueStyles.modal} onBackdropPress={onClose}>
            <View style={uniqueStyles.modalContent}>
                <Text style={uniqueStyles.title}>Select Furniture</Text>
                <FlatList
                    data={furnitureData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                onSelectFurniture(item);
                                onClose();
                            }}
                        >
                            <View style={uniqueStyles.itemContainer}>
                                <Text style={uniqueStyles.itemText}>{item.name} ({item.model})</Text>
                                <Text style={uniqueStyles.itemDetails}>
                                    Size: {item.width}w x {item.length}l x {item.height}h, Colour: {item.selectedColour}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={uniqueStyles.closeButton} onPress={onClose}>
                    <Text style={uniqueStyles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

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
            // gap: 100,
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
            marginTop: 20,
            backgroundColor: "red",
            padding: 10,
            alignItems: "center",
            borderRadius: 5,
        },
        closeText: {
            color: "white",
            fontSize: 16,
        },
    });

export default FurnitureModal;
