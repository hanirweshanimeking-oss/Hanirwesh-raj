import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

export interface TelemetryPayload {
  timestamp: string;
  batteryLevel: number | null;
  isCharging: boolean | null;
  location: Location.LocationObject | null;
  networkType: Network.NetworkStateType | null;
  isConnected: boolean | null;
}

export const gatherTelemetry = async (): Promise<TelemetryPayload> => {
  let batteryLevel = null;
  let isCharging = null;
  let location = null;
  let networkType = null;
  let isConnected = null;

  // 1. Battery
  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
    const batteryState = await Battery.getBatteryStateAsync();
    isCharging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;
  } catch (e) {
    console.warn('Telemetry Error: Could not get battery state', e);
  }

  // 2. Location
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
    console.warn('Telemetry Error: Could not get location', e);
  }

  // 3. Network
  try {
    const networkState = await Network.getNetworkStateAsync();
    networkType = networkState.type ?? null;
    isConnected = networkState.isConnected ?? null;
  } catch (e) {
    console.warn('Telemetry Error: Could not get network state', e);
  }

  return {
    timestamp: new Date().toISOString(),
    batteryLevel,
    isCharging,
    location,
    networkType,
    isConnected,
  };
};
