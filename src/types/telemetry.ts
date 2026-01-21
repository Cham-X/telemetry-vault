// src/types/telemetry.ts
export interface TelemetryEvent {
    id: string;
    timestamp: number; // Unix timestamp in milliseconds
    value: number; // Numeric metric (latency, error count, etc.)
    eventType: EventType;
    source: string; // Service name
}

export type EventType =
    | 'request'
    | 'error'
    | 'warning'
    | 'metric'
    | 'trace';

export type AggregationType = 'count' | 'average' | 'p95';

export interface FilterCriteria {
    startTime: number;
    endTime: number;
    eventTypes: EventType[];
    sources: string[];
}

export interface AggregatedResult {
    value: number;
    count: number;
    eventType?: EventType;
    source?: string;
}