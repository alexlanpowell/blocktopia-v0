/**
 * Device Info - Gather system and app information
 * Used by Admin Dashboard to display device details
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface DeviceInfo {
  platform: string;
  osVersion: string;
  appVersion: string;
  sdkVersion: string;
  buildType: 'development' | 'preview' | 'production';
  newArchEnabled: boolean;
  deviceModel?: string;
  deviceName?: string;
  jsEngine: string;
  bundleId?: string;
  projectId?: string;
}

/**
 * Get device and app information
 */
export function getDeviceInfo(): DeviceInfo {
  const expoConfig = Constants.expoConfig;
  const buildType = __DEV__ 
    ? 'development' 
    : Constants.executionEnvironment === 'storeClient'
    ? 'production'
    : 'preview';

  return {
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: expoConfig?.version || 'unknown',
    sdkVersion: Constants.expoConfig?.sdkVersion || 'unknown',
    buildType,
    newArchEnabled: expoConfig?.newArchEnabled === true,
    deviceModel: Platform.select({
      ios: Constants.deviceName,
      android: undefined,
      default: undefined,
    }),
    deviceName: Constants.deviceName,
    jsEngine: expoConfig?.jsEngine || 'unknown',
    bundleId: Platform.select({
      ios: expoConfig?.ios?.bundleIdentifier,
      android: expoConfig?.android?.package,
      default: undefined,
    }),
    projectId: expoConfig?.extra?.eas?.projectId,
  };
}

/**
 * Format device info as readable string
 */
export function formatDeviceInfo(info: DeviceInfo): string {
  return `
Platform: ${info.platform} ${info.osVersion}
App Version: ${info.appVersion}
SDK Version: ${info.sdkVersion}
Build Type: ${info.buildType}
New Architecture: ${info.newArchEnabled ? 'Enabled' : 'Disabled'}
JS Engine: ${info.jsEngine}
${info.deviceModel ? `Device: ${info.deviceModel}` : ''}
${info.bundleId ? `Bundle ID: ${info.bundleId}` : ''}
${info.projectId ? `Project ID: ${info.projectId}` : ''}
`.trim();
}

