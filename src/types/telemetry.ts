/**
 * Core telemetry event structure
 */
export interface TelemetryEvent {
    id: string;
    timestamp: number; // Unix timestamp in milliseconds
    value: number; // Numeric metric (latency, error count, CPU %, etc.)
    eventType: EventType;
    source: string; // Service/source name
}


/**
 * Available event types
 */
export type EventType =
    | 'request'
    | 'error'
    | 'warning'
    | 'metric'
    | 'trace';

/**
 * Aggregation methods
 */
export type AggregationType = 'count' | 'average' | 'p95';

/**
 * Filter criteria for querying events
 */
export interface FilterCriteria {
    startTime: number;
    endTime: number;
    eventTypes: EventType[];
    sources: string[];
}

/**
 * Result of aggregation calculation
 */
export interface AggregatedResult {
    value: number;
    count: number;
    aggregationType: AggregationType;
}

/**
 * Pagination state
 */
export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

/**
 * Message format for Web Worker communication
 */
export interface WorkerMessage {
    type: 'FILTER_AND_AGGREGATE';
    payload: {
        events: TelemetryEvent[];
        filters: FilterCriteria;
        aggregationType: AggregationType;
    };
}

export interface WorkerResponse {
    type: 'RESULT';
    payload: {
        filteredEvents: TelemetryEvent[];
        aggregatedResult: AggregatedResult;
    };
}