import type { TelemetryEvent, FilterCriteria } from '../types/telemetry';

/**
 * Filter events based on criteria
 * Optimized for performance with early returns
 * 
 * @param events - All telemetry events
 * @param filters - Filter criteria
 * @returns Filtered array of events
 */
export function filterEvents(
    events: TelemetryEvent[],
    filters: FilterCriteria
): TelemetryEvent[] {
    const { startTime, endTime, eventTypes, sources } = filters;

    // If no filters are applied, return all events
    const hasEventTypeFilter = eventTypes.length > 0;
    const hasSourceFilter = sources.length > 0;

    if (!hasEventTypeFilter && !hasSourceFilter && startTime === 0 && endTime === Infinity) {
        return events;
    }

    return events.filter(event => {
        // Time range filter
        if (event.timestamp < startTime || event.timestamp > endTime) {
            return false;
        }

        // Event type filter
        if (hasEventTypeFilter && !eventTypes.includes(event.eventType)) {
            return false;
        }

        // Source filter
        if (hasSourceFilter && !sources.includes(event.source)) {
            return false;
        }

        return true;
    });
}

/**
 * Binary search to find the start index for time-based filtering
 * Assumes events are sorted by timestamp
 */
export function findStartIndex(
    events: TelemetryEvent[],
    startTime: number
): number {
    let left = 0;
    let right = events.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (events[mid].timestamp < startTime) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return left;
}

/**
 * Binary search to find the end index for time-based filtering
 * Assumes events are sorted by timestamp
 */
export function findEndIndex(
    events: TelemetryEvent[],
    endTime: number
): number {
    let left = 0;
    let right = events.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (events[mid].timestamp <= endTime) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return right;
}

/**
 * Optimized filtering using binary search for time range
 * Much faster for large datasets when time filtering is the primary filter
 */
export function filterEventsOptimized(
    events: TelemetryEvent[],
    filters: FilterCriteria
): TelemetryEvent[] {
    const { startTime, endTime, eventTypes, sources } = filters;

    // Use binary search for time-based filtering
    const startIdx = findStartIndex(events, startTime);
    const endIdx = findEndIndex(events, endTime);

    // Get time-filtered subset
    const timeFiltered = events.slice(startIdx, endIdx + 1);

    // Apply remaining filters
    const hasEventTypeFilter = eventTypes.length > 0;
    const hasSourceFilter = sources.length > 0;

    if (!hasEventTypeFilter && !hasSourceFilter) {
        return timeFiltered;
    }

    return timeFiltered.filter(event => {
        if (hasEventTypeFilter && !eventTypes.includes(event.eventType)) {
            return false;
        }
        if (hasSourceFilter && !sources.includes(event.source)) {
            return false;
        }
        return true;
    });
}

/**
 * Paginate filtered events
 */
export function paginateEvents(
    events: TelemetryEvent[],
    page: number,
    itemsPerPage: number
): TelemetryEvent[] {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return events.slice(startIndex, endIndex);
}