import React, { FunctionComponentElement } from 'react';
import {Text, TouchableOpacity, StyleSheet } from 'react-native';

const ActionButton = ({ label, onPress, style, textS, icon }: { label?: string; onPress: () => void; style?: object; textS?: object, icon?: FunctionComponentElement<{}>; } ) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            {icon}
            <Text style={[styles.buttonText, textS]}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ActionButton;
