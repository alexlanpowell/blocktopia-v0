/**
 * Network Monitor - Tracks all Supabase API calls for debugging
 * Used by Admin Dashboard to monitor network activity
 */

export interface NetworkCall {
  id: string;
  method: 'select' | 'insert' | 'update' | 'delete' | 'auth' | 'storage' | 'unknown';
  table: string;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private calls: NetworkCall[] = [];
  private maxCalls = 100;

  private constructor() {}

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Track a network call
   */
  trackCall(
    method: NetworkCall['method'],
    table: string,
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const call: NetworkCall = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      table,
      timestamp: Date.now(),
      duration,
      success,
      error,
      metadata,
    };

    this.calls.unshift(call); // Add to beginning
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(0, this.maxCalls);
    }
  }

  /**
   * Get all tracked calls
   */
  getCalls(): NetworkCall[] {
    return [...this.calls];
  }

  /**
   * Get only failed calls
   */
  getFailedCalls(): NetworkCall[] {
    return this.calls.filter(call => !call.success);
  }

  /**
   * Get calls for a specific table
   */
  getCallsForTable(table: string): NetworkCall[] {
    return this.calls.filter(call => call.table === table);
  }

  /**
   * Get average duration for all calls
   */
  getAverageDuration(): number {
    if (this.calls.length === 0) return 0;
    const total = this.calls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(total / this.calls.length);
  }

  /**
   * Get average duration for successful calls only
   */
  getAverageSuccessDuration(): number {
    const successful = this.calls.filter(call => call.success);
    if (successful.length === 0) return 0;
    const total = successful.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(total / successful.length);
  }

  /**
   * Get success rate (0-100)
   */
  getSuccessRate(): number {
    if (this.calls.length === 0) return 100;
    const successful = this.calls.filter(call => call.success).length;
    return Math.round((successful / this.calls.length) * 100);
  }

  /**
   * Get calls in a time range
   */
  getCallsInRange(startTime: number, endTime: number): NetworkCall[] {
    return this.calls.filter(
      call => call.timestamp >= startTime && call.timestamp <= endTime
    );
  }

  /**
   * Get recent calls (last N calls)
   */
  getRecentCalls(count: number = 50): NetworkCall[] {
    return this.calls.slice(0, count);
  }

  /**
   * Clear call history
   */
  clearHistory(): void {
    this.calls = [];
  }

  /**
   * Get statistics summary
   */
  getStats(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    avgDuration: number;
    avgSuccessDuration: number;
  } {
    const successful = this.calls.filter(call => call.success).length;
    return {
      total: this.calls.length,
      successful,
      failed: this.calls.length - successful,
      successRate: this.getSuccessRate(),
      avgDuration: this.getAverageDuration(),
      avgSuccessDuration: this.getAverageSuccessDuration(),
    };
  }
}

export const networkMonitor = NetworkMonitor.getInstance();
export default NetworkMonitor;

