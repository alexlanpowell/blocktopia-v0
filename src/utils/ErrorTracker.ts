/**
 * Error Tracker - Phase 8
 * Centralized error logging and monitoring
 */

import { enhancedAnalytics } from '../services/analytics/EnhancedAnalyticsService';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  context: string;
  userAction?: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

class ErrorTracker {
  private static instance: ErrorTracker | null = null;
  private errorHistory: ErrorReport[] = [];
  private maxHistorySize = 50;

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.trackError(
          error,
          isFatal ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
          'Global error handler',
          { is_fatal: isFatal }
        );
      });
    }

    // Handle promise rejections
    if (typeof global !== 'undefined') {
      const originalHandler = global.Promise?.prototype?.catch;
      if (originalHandler) {
        global.Promise.prototype.catch = function(onRejected) {
          return originalHandler.call(this, (error: any) => {
            errorTracker.trackError(
              error,
              ErrorSeverity.MEDIUM,
              'Unhandled promise rejection'
            );
            if (onRejected) return onRejected(error);
            throw error;
          });
        };
      }
    }
  }

  /**
   * Track error with context
   */
  trackError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: string = 'Unknown',
    additionalData?: Record<string, any>
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const report: ErrorReport = {
      error: errorObj,
      severity,
      context,
      timestamp: new Date(),
      additionalData,
    };

    // Add to history
    this.errorHistory.push(report);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Log to analytics
    enhancedAnalytics.trackError(errorObj, context);

    // Log to console
    const emoji = this.getSeverityEmoji(severity);
    console.error(`${emoji} [${severity.toUpperCase()}] ${context}:`, errorObj);

    // Send to crash reporting service (Sentry, etc.) in production
    if (!__DEV__ && severity === ErrorSeverity.CRITICAL) {
      this.sendToCrashReporting(report);
    }
  }

  /**
   * Track monetization error
   */
  trackMonetizationError(
    operation: string,
    error: Error,
    metadata?: Record<string, any>
  ): void {
    this.trackError(
      error,
      ErrorSeverity.HIGH,
      `Monetization: ${operation}`,
      {
        operation_type: 'monetization',
        operation_name: operation,
        ...metadata,
      }
    );
  }

  /**
   * Track network error
   */
  trackNetworkError(
    endpoint: string,
    error: Error,
    statusCode?: number
  ): void {
    this.trackError(
      error,
      ErrorSeverity.MEDIUM,
      `Network: ${endpoint}`,
      {
        endpoint,
        status_code: statusCode,
      }
    );
  }

  /**
   * Track validation error
   */
  trackValidationError(
    field: string,
    value: any,
    reason: string
  ): void {
    this.trackError(
      new Error(`Validation failed: ${reason}`),
      ErrorSeverity.LOW,
      `Validation: ${field}`,
      {
        field,
        value,
        reason,
      }
    );
  }

  /**
   * Get error history
   */
  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errorHistory.filter(report => report.severity === severity);
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '⚠️';
      case ErrorSeverity.MEDIUM:
        return '⛔';
      case ErrorSeverity.HIGH:
        return '🚨';
      case ErrorSeverity.CRITICAL:
        return '💥';
      default:
        return '❌';
    }
  }

  /**
   * Send to crash reporting service
   */
  private sendToCrashReporting(report: ErrorReport): void {
    // Integrate with Sentry, Bugsnag, or Firebase Crashlytics
    console.log('📤 Sending error to crash reporting service:', report);
  }

  /**
   * Generate error report for debugging
   */
  generateErrorReport(): string {
    let report = '=== ERROR REPORT ===\n\n';
    
    for (const error of this.errorHistory) {
      report += `[${error.timestamp.toISOString()}] ${error.severity.toUpperCase()}\n`;
      report += `Context: ${error.context}\n`;
      report += `Error: ${error.error.message}\n`;
      if (error.additionalData) {
        report += `Data: ${JSON.stringify(error.additionalData, null, 2)}\n`;
      }
      report += '\n---\n\n';
    }

    return report;
  }
}

export const errorTracker = ErrorTracker.getInstance();
export { ErrorTracker };

