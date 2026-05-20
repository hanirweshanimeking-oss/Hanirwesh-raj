import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import * as Battery from 'expo-battery';
import { Linking } from 'react-native';

export const toolService = {
  
  async setReminder(title: string, secondsFromNow: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nova Reminder',
          body: title,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsFromNow,
        },
      });
      return `Reminder set for ${secondsFromNow} seconds from now.`;
    } catch (e: any) {
      return `Failed to set reminder: ${e.message}`;
    }
  },

  async getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return 'Location permission denied.';
      }
      const location = await Location.getCurrentPositionAsync({});
      return `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}`;
    } catch (e: any) {
      return `Failed to get location: ${e.message}`;
    }
  },

  async sendMessage(contact: string, text: string) {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([contact], text);
        return `Opened SMS composer to send message to ${contact}.`;
      }
      return 'SMS is not available on this device.';
    } catch (e: any) {
      return `Failed to open SMS: ${e.message}`;
    }
  },

  async getBattery() {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      const isCharging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
      return `Battery is at ${Math.round(level * 100)}%. Charging: ${isCharging ? 'Yes' : 'No'}`;
    } catch (e: any) {
      return `Failed to get battery: ${e.message}`;
    }
  },

  async searchWeb(query: string) {
    // In a real app, this would call the Brave Search API.
    // Mocking for this build.
    return `Simulated search results for "${query}": Found 3 articles about this topic.`;
  },

  async getWeather(locationStr: string) {
     // Mock weather
     return `Simulated weather for ${locationStr}: 72F and sunny.`;
  },

  async openApp(appName: string) {
    try {
      // E.g., 'twitter://' or 'youtube://'
      // This is highly OS specific. We'll attempt a generic URL scheme if provided.
      // If it's just a word like "settings", we can try app-settings.
      if (appName.toLowerCase() === 'settings') {
         await Linking.openSettings();
         return 'Opened Settings.';
      }
      return `I cannot directly open ${appName} without a specific URL scheme.`;
    } catch (e: any) {
       return `Failed to open app: ${e.message}`;
    }
  }
};
