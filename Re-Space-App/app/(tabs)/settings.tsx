import { StyleSheet, ScrollView, Text, View } from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';
import { defaultStyles } from '../../components/defaultStyles';

const SettingsPage = () => {
    return (


        <ScrollView contentContainerStyle={defaultStyles.body}>
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Settings</Text>
            </View>
            <Text style={defaultStyles.sectionTitle}>Task Settings</Text>

            <SliderSetting label="Movement Speed" min={1} max={3} />
            <ToggleSetting label="Stop when humans present" />
            <ActionButton
                label="Re-map room"
                onPress={() => alert("Mapping...")}
            />

            <Text style={defaultStyles.sectionTitle}>Notification Preferences</Text>

            <ToggleSetting label="Completed Tasks" />
            <ToggleSetting label="Collisions" />
            <ToggleSetting label="Battery Levels" />
            <SliderSetting label="Battery Notification Threshold" min={1} max={25} />

            <Text style={defaultStyles.sectionTitle}>Analytics and Reporting</Text>
            <ActionButton
                label="Task History Logs"
                onPress={() => alert("Todo...")}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
});

export default SettingsPage;
