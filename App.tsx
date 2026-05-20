import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import ChatScreen from './src/screens/ChatScreen';
import { registerBackgroundHeartbeatAsync } from './src/services/backgroundTask';

const Stack = createNativeStackNavigator();

export default function App() {
  
  useEffect(() => {
    // Request permission for push notifications
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notifications permission not granted.');
      }
    };
    
    requestPermissions();
    registerBackgroundHeartbeatAsync();
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0d14" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
