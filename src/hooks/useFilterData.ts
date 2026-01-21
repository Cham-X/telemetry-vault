import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    TelemetryEvent,
    FilterCriteria,
    AggregationType,
    AggregatedResult,
    WorkerMessage,
    WorkerResponse
} from '../types/telemetry';

interface UseFilteredDataProps {
    events: TelemetryEvent[];
    filters: FilterCriteria;
    aggregationType: AggregationType;
    useWorker?: boolean;
}

interface UseFilteredDataReturn {
    filteredEvents: TelemetryEvent[];
    aggregatedResult: AggregatedResult;
    isProcessing: boolean;
}

/**
 * Custom hook for filtering and aggregating telemetry data
 * Can use Web Worker for better performance
 * 
 * @param props - Configuration object
 * @returns Filtered events and aggregated result
 */
export function useFilteredData({
    events,
    filters,
    aggregationType,
    useWorker = true,
}: UseFilteredDataProps): UseFilteredDataReturn {
    const [filteredEvents, setFilteredEvents] = useState<TelemetryEvent[]>([]);
    const [aggregatedResult, setAggregatedResult] = useState<AggregatedResult>({
        value: 0,
        count: 0,
        aggregationType,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [worker, setWorker] = useState<Worker | null>(null);

    // Initialize Web Worker
    useEffect(() => {
        if (!useWorker) return;

        const newWorker = new Worker(
            new URL('../workers/dataProcessor.worker.ts', import.meta.url),
            { type: 'module' }
        );

        setWorker(newWorker);

        return () => {
            newWorker.terminate();
        };
    }, [useWorker]);

    // Process data (with or without worker)
    useEffect(() => {
        if (events.length === 0) return;

        setIsProcessing(true);

        if (useWorker && worker) {
            // Use Web Worker
            const message: WorkerMessage = {
                type: 'FILTER_AND_AGGREGATE',
                payload: {
                    events,
                    filters,
                    aggregationType,
                },
            };

            const handleMessage = (event: MessageEvent<WorkerResponse>) => {
                const { type, payload } = event.data;

                if (type === 'RESULT') {
                    setFilteredEvents(payload.filteredEvents);
                    setAggregatedResult(payload.aggregatedResult);
                    setIsProcessing(false);
                }
            };

            worker.addEventListener('message', handleMessage);
            worker.postMessage(message);

            return () => {
                worker.removeEventListener('message', handleMessage);
            };
        } else {
            // Process on main thread (fallback)
            import('../utils/dataProcessor').then(({ filterEventsOptimized }) => {
                import('../utils/aggregation').then(({ calculateAggregation }) => {
                    const filtered = filterEventsOptimized(events, filters);
                    const aggregated = calculateAggregation(filtered, aggregationType);

                    setFilteredEvents(filtered);
                    setAggregatedResult(aggregated);
                    setIsProcessing(false);
                });
            });
        }
    }, [events, filters, aggregationType, useWorker, worker]);

    return {
        filteredEvents,
        aggregatedResult,
        isProcessing,
    };
}

/**
 * Simpler hook without Web Worker for smaller datasets
 */
export function useFilteredDataSync({
    events,
    filters,
    aggregationType,
}: UseFilteredDataProps): UseFilteredDataReturn {
    const { filteredEvents, aggregatedResult } = useMemo(() => {
        // Import synchronously (will be tree-shaken in production)
        const { filterEventsOptimized } = require('../utils/dataProcessor');
        const { calculateAggregation } = require('../utils/aggregation');

        const filtered = filterEventsOptimized(events, filters);
        const aggregated = calculateAggregation(filtered, aggregationType);

        return {
            filteredEvents: filtered,
            aggregatedResult: aggregated,
        };
    }, [events, filters, aggregationType]);

    return {
        filteredEvents,
        aggregatedResult,
        isProcessing: false,
    };
}