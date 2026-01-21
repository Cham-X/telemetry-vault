import { useState, useEffect, useMemo } from 'react';
import type { TelemetryEvent, EventType } from '../types/telemetry';
import { generateTelemetryData, getUniqueSources, getTimeRange } from '../utils/dataGenerator';

interface UseTelemetryDataReturn {
    events: TelemetryEvent[];
    isLoading: boolean;
    sources: string[];
    eventTypes: EventType[];
    timeRange: { min: number; max: number };
    totalEvents: number;
}

/**
 * Custom hook to generate and manage telemetry data
 * Generates data once on mount and provides metadata
 */
export function useTelemetryData(
    eventCount: number = 50000
): UseTelemetryDataReturn {
    const [events, setEvents] = useState<TelemetryEvent[]>([]);

    // ✅ Derived state (no useState)
    const isLoading = events.length === 0;

    // ✅ Impure value created once (allowed)
    const [loadingTimeRange] = useState(() => {
        const now = Date.now();
        return { min: now, max: now };
    });

    // ✅ Generate data ONCE (no loading toggles)
    useEffect(() => {
        const timer = setTimeout(() => {
            setEvents(generateTelemetryData(eventCount));
        }, 0);

        return () => clearTimeout(timer);
    }, [eventCount]);

    // ✅ Memoized expensive computation
    const sources = useMemo(() => {
        return isLoading ? [] : getUniqueSources(events);
    }, [events, isLoading]);

    // ✅ Pure conditional (no impure calls)
    const timeRange = isLoading
        ? loadingTimeRange
        : getTimeRange(events);

    // ✅ Static constant (no need for useMemo)
    const eventTypes: EventType[] = [
        'request',
        'error',
        'warning',
        'metric',
        'trace',
    ];

    return {
        events,
        isLoading,
        sources,
        eventTypes,
        timeRange,
        totalEvents: events.length,
    };
}
