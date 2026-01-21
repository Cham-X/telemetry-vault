import { useState, useEffect, useMemo } from 'react';
import type { TelemetryEvent, EventType } from '../types/telemetry';
import {
    generateTelemetryData,
    getUniqueSources,
    getTimeRange,
    getEventTypes
} from '../utils/dataGenerator';

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
 * 
 * @param eventCount - Number of events to generate
 * @returns Telemetry data and metadata
 */
export function useTelemetryData(eventCount: number = 50000): UseTelemetryDataReturn {
    const [events, setEvents] = useState<TelemetryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate data on mount
    useEffect(() => {
        console.log('Initializing telemetry data...');
        setIsLoading(true);

        // Use setTimeout to avoid blocking initial render
        const timer = setTimeout(() => {
            const generatedEvents = generateTelemetryData(eventCount);
            setEvents(generatedEvents);
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [eventCount]);

    // Memoize expensive computations
    const sources = useMemo(() => {
        return isLoading ? [] : getUniqueSources(events);
    }, [events, isLoading]);

    const timeRange = useMemo(() => {
        return isLoading ? { min: Date.now(), max: Date.now() } : getTimeRange(events);
    }, [events, isLoading]);

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