import type { TelemetryEvent, EventType } from '../types/telemetry';

export const EVENT_TYPES: EventType[] = ['request', 'error', 'warning', 'metric', 'trace'];

export const SOURCES = [
    'api-gateway',
    'auth-service',
    'payment-service',
    'user-service',
    'notification-service',
    'analytics-service',
    'database-primary',
    'database-replica',
    'cache-redis',
    'message-queue',
    'cdn-edge',
    'logging-service',
];


export const COLORS = {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    accentLight: '#F472B6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#1E293B',
    textLight: '#64748B',
    textLighter: '#94A3B8',
};

/**
 * Generates a realistic distribution of values based on event type
 */
export function generateValue(eventType: EventType): number {
    switch (eventType) {
        case 'request':
            // Latency in ms: mostly 10-200ms, some outliers up to 1000ms
            return Math.random() < 0.9
                ? 10 + Math.random() * 190
                : 200 + Math.random() * 800;

        case 'error':
            // HTTP error codes: 400-599
            return 400 + Math.floor(Math.random() * 200);

        case 'warning':
            // Warning severity: 1-10
            return 1 + Math.floor(Math.random() * 10);

        case 'metric':
            // CPU/Memory percentage: 0-100
            return Math.random() * 100;

        case 'trace':
            // Trace duration in ms: 5-505ms
            return 5 + Math.random() * 500;

        default:
            return Math.random() * 1000;
    }
}

/**
 * Generates a weighted random event type
 * Distribution: 50% requests, 20% metrics, 15% traces, 10% warnings, 5% errors
 */
export function getRandomEventType(): EventType {
    const rand = Math.random();

    if (rand < 0.5) return 'request';      // 50%
    if (rand < 0.7) return 'metric';       // 20%
    if (rand < 0.85) return 'trace';       // 15%
    if (rand < 0.95) return 'warning';     // 10%
    return 'error';                         // 5%
}

/**
 * Generates synthetic telemetry data with realistic patterns
 * 
 * @param count - Number of events to generate (default: 50000)
 * @returns Array of telemetry events sorted by timestamp
 */
export function generateTelemetryData(count: number = 50000): TelemetryEvent[] {
    const events: TelemetryEvent[] = [];
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    console.time('Data Generation');

    for (let i = 0; i < count; i++) {
        // Generate timestamp with daily patterns (more events during "peak hours")
        const randomDay = Math.random();
        const hourBias = Math.sin(randomDay * Math.PI * 2) * 0.3 + 0.5;
        const timestamp = sevenDaysAgo + (Math.random() * hourBias * (now - sevenDaysAgo));

        const eventType = getRandomEventType();
        const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
        const value = generateValue(eventType);

        events.push({
            id: `evt_${i}_${timestamp}`,
            timestamp: Math.floor(timestamp),
            value: Math.round(value * 100) / 100, // Round to 2 decimals
            eventType,
            source,
        });
    }

    // Sort by timestamp for better query performance
    events.sort((a, b) => a.timestamp - b.timestamp);

    console.timeEnd('Data Generation');
    console.log(`Generated ${count} events`);
    console.log(`Time range: ${new Date(events[0].timestamp).toISOString()} to ${new Date(events[events.length - 1].timestamp).toISOString()}`);

    return events;
}

/**
 * Get unique sources from dataset
 */
export function getUniqueSources(events: TelemetryEvent[]): string[] {
    return Array.from(new Set(events.map(e => e.source))).sort();
}

/**
 * Get time range boundaries from dataset
 */
export function getTimeRange(events: TelemetryEvent[]): { min: number; max: number } {
    if (events.length === 0) {
        return { min: Date.now(), max: Date.now() };
    }

    return {
        min: events[0].timestamp,
        max: events[events.length - 1].timestamp,
    };
}

/**
 * Get all available event types
 */
export function getEventTypes(): EventType[] {
    return [...EVENT_TYPES];
}

/**
 * Get all available sources
 */
export function getSources(): string[] {
    return [...SOURCES];
}
