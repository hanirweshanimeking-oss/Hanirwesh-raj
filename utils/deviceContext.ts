import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

export interface DeviceContext {
  time: string;
  batteryLevel: number | null;
  isCharging: boolean | null;
  location: Location.LocationObject | null;
}

export const getDeviceContext = async (): Promise<DeviceContext> => {
  let batteryLevel = null;
  let isCharging = null;
  let location = null;

  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
    const batteryState = await Battery.getBatteryStateAsync();
    isCharging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;
  } catch (e) {
    console.warn('Could not get battery state', e);
  }

  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const response = await Location.requestForegroundPermissionsAsync();
      status = response.status;
    }
    
    if (status === 'granted') {
      location = await Location.getCurrentPositionAsync({});
    }
  } catch (e) {
    console.warn('Could not get location', e);
  }

  return {
    time: new Date().toISOString(),
    batteryLevel,
    isCharging,
    location,
  };
};
