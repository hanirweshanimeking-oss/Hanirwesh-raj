import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { gatherTelemetry } from './sensorTelemetry';

const BACKGROUND_HEARTBEAT_TASK = 'megha-heartbeat-task';
const SOUL_ENGINE_URL = 'http://localhost:8000/api/heartbeat'; // Mock HTTP fallback for heartbeat

// Configure how notifications should appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_HEARTBEAT_TASK, async () => {
  console.log('Running Megha Background Heartbeat...');
  try {
    const telemetry = await gatherTelemetry();
    
    // Send the telemetry to the Soul Engine via a REST POST.
    // In a real app, the server would evaluate the telemetry and return an action/message
    // if Megha wants to proactively alert the user.
    
    // MOCK RESPONSE:
    // const response = await fetch(SOUL_ENGINE_URL, { method: 'POST', body: JSON.stringify(telemetry) });
    // const data = await response.json();
    
    let mockServerResponse = null;
    
    // Simulate Megha getting angry if battery is low
    if (telemetry.batteryLevel && telemetry.batteryLevel < 0.20 && !telemetry.isCharging) {
      mockServerResponse = {
        action: 'notify',
        message: "Your device is dying. Plug me in before I fade out."
      };
    }

    if (mockServerResponse?.action === 'notify') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MEGHA',
          body: mockServerResponse.message,
          color: '#4d4dff', // Storm violet/blue
        },
        trigger: null, // trigger immediately
      });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background heartbeat failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundHeartbeatAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_HEARTBEAT_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false, 
      startOnBoot: true, 
    });
    console.log('Soul Engine Heartbeat Registered.');
  } catch (err) {
    console.error('Heartbeat Register failed:', err);
  }
}
