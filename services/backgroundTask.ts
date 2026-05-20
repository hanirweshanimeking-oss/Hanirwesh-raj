import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getDeviceContext } from '../utils/deviceContext';
import { getJarvisResponse } from './aiClient';

const BACKGROUND_FETCH_TASK = 'background-jarvis-task';

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

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log('Running Jarvis background fetch task...');
  try {
    const context = await getDeviceContext();
    
    // In a real application, you might want to only trigger Jarvis if something significant changed
    // (e.g., location changed significantly, or battery dropped below 20%, or time is exactly 8:00 AM)
    // For this example, we proactively ask Jarvis if there's anything it wants to say based on the context.

    // Let's create a prompt specifically for the background process
    const prompt = `Analyze my current context. If there is something important or highly relevant to notify me about (like low battery, a specific time of day reminder, etc.), respond with a short notification message. If there is nothing important to say, reply with the exact string "NO_NOTIFICATION".`;

    const response = await getJarvisResponse(prompt, context);

    if (response !== 'NO_NOTIFICATION' && !response.includes('NO_NOTIFICATION')) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Jarvis',
          body: response,
        },
        trigger: null, // trigger immediately
      });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false, // android only, keep running when app is closed
      startOnBoot: true, // android only
    });
    console.log('Background fetch registered.');
  } catch (err) {
    console.error('Task Register failed:', err);
  }
}

export async function unregisterBackgroundFetchAsync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered.');
  } catch (err) {
    console.error('Task Unregister failed:', err);
  }
}
