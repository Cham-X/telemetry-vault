import type { TelemetryEvent, AggregationType, AggregatedResult } from '../types/telemetry';

/**
 * Calculate count aggregation
 */
export function calculateCount(events: TelemetryEvent[]): number {
    return events.length;
}

/**
 * Calculate average of event values
 */
export function calculateAverage(events: TelemetryEvent[]): number {
    if (events.length === 0) return 0;

    const sum = events.reduce((acc, event) => acc + event.value, 0);
    return sum / events.length;
}

/**
 * Calculate 95th percentile of event values
 */
export function calculateP95(events: TelemetryEvent[]): number {
    if (events.length === 0) return 0;

    // Sort by value
    const sortedValues = events.map(e => e.value).sort((a, b) => a - b);

    // Calculate 95th percentile index
    const index = Math.floor(sortedValues.length * 0.95);

    return sortedValues[index] || 0;
}

/**
 * Calculate aggregation based on type
 * 
 * @param events - Array of telemetry events
 * @param aggregationType - Type of aggregation to perform
 * @returns Aggregated result with value and count
 */
export function calculateAggregation(
    events: TelemetryEvent[],
    aggregationType: AggregationType
): AggregatedResult {
    let value = 0;

    switch (aggregationType) {
        case 'count':
            value = calculateCount(events);
            break;
        case 'average':
            value = calculateAverage(events);
            break;
        case 'p95':
            value = calculateP95(events);
            break;
        default:
            value = 0;
    }

    return {
        value,
        count: events.length,
        aggregationType,
    };
}

/**
 * Calculate multiple aggregations at once
 */
export function calculateAllAggregations(events: TelemetryEvent[]): {
    count: number;
    average: number;
    p95: number;
} {
    return {
        count: calculateCount(events),
        average: calculateAverage(events),
        p95: calculateP95(events),
    };
}