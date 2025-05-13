import { Tabs } from 'expo-router';
import { Dimensions } from 'react-native';
import { TabBarIonicons, TabBarMaterial } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: height * 0.07, // need to fix
        },
        tabBarLabelStyle: {
          fontSize: height * 0.018, // need to fix
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIonicons name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roomsManager"
        options={{ 
          title: 'Rooms',
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterial name={focused ? 'door-open' : 'door'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="controller"
        options={{
          title: 'Controller',
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterial name={focused ? 'gamepad' : 'gamepad-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIonicons name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
