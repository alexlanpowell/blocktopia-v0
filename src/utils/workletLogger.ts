/**
 * Worklet-Safe Logging Utilities
 * Provides logging functions that work correctly in React Native Reanimated worklets
 * 
 * @module workletLogger
 */

import { runOnJS } from 'react-native-reanimated';

/**
 * Worklet-safe error logger
 * Serializes error objects properly for worklet context
 */
export const logError = (message: string, error?: any) => {
  'worklet';
  const errorString = error 
    ? (error instanceof Error 
        ? `${error.message}\n${error.stack}` 
        : JSON.stringify(error))
    : 'Unknown error';
  
  runOnJS((msg: string, err: string) => {
    console.error(`[Worklet] ${msg}`, err);
  })(message, errorString);
};

/**
 * Worklet-safe warning logger
 */
export const logWarning = (message: string, data?: any) => {
  'worklet';
  const dataString = data ? JSON.stringify(data) : '';
  
  runOnJS((msg: string, data: string) => {
    console.warn(`[Worklet] ${msg}`, data || '');
  })(message, dataString);
};

/**
 * Worklet-safe info logger (only in dev mode)
 */
export const logInfo = (message: string, data?: any) => {
  'worklet';
  if (__DEV__) {
    const dataString = data ? JSON.stringify(data) : '';
    
    runOnJS((msg: string, data: string) => {
      console.log(`[Worklet] ${msg}`, data || '');
    })(message, dataString);
  }
};

/**
 * Worklet-safe debug logger (only in dev mode)
 */
export const logDebug = (message: string, data?: any) => {
  'worklet';
  if (__DEV__) {
    const dataString = data ? JSON.stringify(data) : '';
    
    runOnJS((msg: string, data: string) => {
      console.debug(`[Worklet Debug] ${msg}`, data || '');
    })(message, dataString);
  }
};

