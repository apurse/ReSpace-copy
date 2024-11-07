import {StyleSheet, ScrollView, Text} from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';

const SettingsPage = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.mainTitle}>Settings</Text>
            <Text style={styles.sectionTitle}>Task Settings</Text>

            <SliderSetting label="Movement Speed" min={1} max={3} />
            <ToggleSetting label="Stop when humans present" />
            <ActionButton
                label="Re-map room"
                onPress={() => alert("Mapping...")}
            />

            <Text style={styles.sectionTitle}>Notification Preferences</Text>

            <ToggleSetting label="Completed Tasks" />
            <ToggleSetting label="Collisions"/>
            <ToggleSetting label="Battery Levels" />
            <SliderSetting label="Battery Notification Threshold" min={1} max={25} />

            <Text style={styles.sectionTitle}>Analytics and Reporting</Text>
            <ActionButton
                label="Task History Logs"
                onPress={() => alert("Todo...")}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginVertical: 20,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 10,
        color: '#333',
    }
});

export default SettingsPage;
