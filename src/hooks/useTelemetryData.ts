import { useState, useEffect, useMemo } from 'react';
import type { TelemetryEvent, EventType } from '../types/telemetry';
import {
    generateTelemetryData,
    getUniqueSources,
    getTimeRange,
    getEventTypes,
} from '../utils/dataGenerator';

interface UseTelemetryDataReturn {
    events: TelemetryEvent[];
    isLoading: boolean;
    sources: string[];
    eventTypes: EventType[];
    timeRange: { min: number; max: number };
    totalEvents: number;
}

export function useTelemetryData(
    eventCount: number = 50000
): UseTelemetryDataReturn {
    const [events, setEvents] = useState<TelemetryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [now] = useState(() => Date.now());

    useEffect(() => {
        const timer = setTimeout(() => {
            const generatedEvents = generateTelemetryData(eventCount);
            setEvents(generatedEvents);
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [eventCount]);

    const sources = useMemo(() => {
        return isLoading ? [] : getUniqueSources(events);
    }, [events, isLoading]);

    const loadingTimeRange = useMemo(
        () => ({ min: now, max: now }),
        [now]
    );

    const timeRange = isLoading
        ? loadingTimeRange
        : getTimeRange(events);

    const eventTypes: EventType[] = useMemo(() => {
        return getEventTypes();
    }, []);

    return {
        events,
        isLoading,
        sources,
        eventTypes,
        timeRange,
        totalEvents: events.length,
    };
}
