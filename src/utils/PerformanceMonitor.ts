/**
 * Performance Monitor - Phase 7
 * Track app performance metrics, render times, memory usage
 */

import { enhancedAnalytics } from '../services/analytics/EnhancedAnalyticsService';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private maxHistorySize = 100;

  // Performance thresholds (ms)
  private readonly THRESHOLDS = {
    RENDER: 16, // 60fps = 16ms per frame
    API_CALL: 1000,
    ANIMATION: 300,
    INTERACTION: 100,
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring performance
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    this.activeMetrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measuring performance
   */
  endMeasure(name: string): number | null {
    const metric = this.activeMetrics.get(name);
    if (!metric) {
      console.warn(`Performance metric not found: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Move to completed
    this.completedMetrics.push(metric);
    if (this.completedMetrics.length > this.maxHistorySize) {
      this.completedMetrics.shift();
    }

    this.activeMetrics.delete(name);

    // Log to analytics
    enhancedAnalytics.trackPerformance(name, duration, 'ms');

    // Warn if over threshold
    const threshold = this.getThreshold(name);
    if (duration > threshold) {
      console.warn(`⚠️ Performance: ${name} took ${duration}ms (threshold: ${threshold}ms)`);
    } else {
      console.log(`✅ Performance: ${name} completed in ${duration}ms`);
    }

    return duration;
  }

  /**
   * Measure async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasure(name, metadata);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure sync function
   */
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMeasure(name, metadata);
    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Get threshold for metric type
   */
  private getThreshold(name: string): number {
    if (name.includes('render') || name.includes('frame')) {
      return this.THRESHOLDS.RENDER;
    }
    if (name.includes('api') || name.includes('network')) {
      return this.THRESHOLDS.API_CALL;
    }
    if (name.includes('animation')) {
      return this.THRESHOLDS.ANIMATION;
    }
    if (name.includes('interaction') || name.includes('tap')) {
      return this.THRESHOLDS.INTERACTION;
    }
    return 1000; // Default 1 second
  }

  /**
   * Get average duration for metric
   */
  getAverageDuration(metricName: string): number {
    const metrics = this.completedMetrics.filter(m => m.name === metricName);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  /**
   * Get slowest metrics
   */
  getSlowestMetrics(count: number = 10): PerformanceMetric[] {
    return [...this.completedMetrics]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, count);
  }

  /**
   * Get performance summary
   */
  getSummary(): string {
    const totalMetrics = this.completedMetrics.length;
    const avgDuration = totalMetrics > 0
      ? this.completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMetrics
      : 0;

    const slowest = this.getSlowestMetrics(5);

    let summary = '=== PERFORMANCE SUMMARY ===\n\n';
    summary += `Total Measurements: ${totalMetrics}\n`;
    summary += `Average Duration: ${avgDuration.toFixed(2)}ms\n\n`;
    summary += 'Slowest Operations:\n';
    
    for (const metric of slowest) {
      summary += `  ${metric.name}: ${metric.duration}ms\n`;
    }

    return summary;
  }

  /**
   * Clear metrics history
   */
  clearHistory(): void {
    this.completedMetrics = [];
    this.activeMetrics.clear();
  }

  /**
   * Check if measurement is active
   */
  isActive(name: string): boolean {
    return this.activeMetrics.has(name);
  }

  /**
   * Get all completed metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export { PerformanceMonitor };

