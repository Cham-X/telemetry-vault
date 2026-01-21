import type { WorkerMessage, WorkerResponse } from '../types/telemetry';
import { filterEventsOptimized } from '../utils/dataProcessor';
import { calculateAggregation } from '../utils/aggregation';

/**
 * Web Worker for processing telemetry data
 * Handles filtering and aggregation off the main thread
 */

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const { type, payload } = event.data;

    if (type === 'FILTER_AND_AGGREGATE') {
        const { events, filters, aggregationType } = payload;

        console.time('Worker: Filter & Aggregate');

        // Filter events
        const filteredEvents = filterEventsOptimized(events, filters);

        // Calculate aggregation
        const aggregatedResult = calculateAggregation(filteredEvents, aggregationType);

        console.timeEnd('Worker: Filter & Aggregate');
        console.log(`Worker: Filtered ${filteredEvents.length} events from ${events.length}`);

        // Send results back to main thread
        const response: WorkerResponse = {
            type: 'RESULT',
            payload: {
                filteredEvents,
                aggregatedResult,
            },
        };

        self.postMessage(response);
    }
});

// Export empty object to satisfy TypeScript module requirements
export { };