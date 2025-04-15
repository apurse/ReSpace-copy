import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import { useAuth } from "@/hooks/useAuth";
import ActionButton from '@/components/settingsComponents/actionButton';


const { width, height } = Dimensions.get('window');

export default function Controller() {
    const { theme } = useTheme();
    const { loggedIn, user, setUser, db } = useAuth();

    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);

    return (
        <View style={defaultStyles.body}>

            {/* Page Title */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Account Settings</Text>
            </View>
            
            <ActionButton
                label="Delete account"
                style={uniqueStyles.button}
                // textS={uniqueStyles.buttonText}
                onPress={async () => {
                    if (!db) {
                        alert("DB not working")
                        return null;
                    }
                    try {
                        
                        // Add the new username and password into the db
                        let sqlDelete = `DELETE FROM users WHERE username = ?`;
                        await db.runAsync(
                            sqlDelete,
                            [user.username]
                        )
                        setUser(false);
                        alert("User successfully deleted!")

                    } catch (error) {
                        alert("Failed to delete user!")
                        console.log(error);
                    }
                }}
            />
        </View>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        button: {
            borderRadius: 20,
            width: width * 0.2,
            height: width * 0.2,
            marginBottom: 10,
            marginLeft: 10,
        },
    });
