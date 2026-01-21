import { useState, useEffect, useMemo } from 'react';
import { useTelemetryData } from './hooks/useTelemetryData';
import { FilterControls } from './component/FilterControl';
import { DataTable } from './component/DataTable';
import { Pagination } from './component/Pagination';
import type { EventType, AggregationType, FilterCriteria } from './types/telemetry';
import { filterEventsOptimized, paginateEvents } from './utils/dataProcessor';
import { calculateAggregation } from './utils/aggregation';
import './App.css';

function App() {
  const {
    events,
    isLoading,
    sources: availableSources,
    eventTypes: availableEventTypes,
    timeRange,
    totalEvents,
  } = useTelemetryData(100000);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aggregationType, setAggregationType] = useState<AggregationType>('count');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    if (!isLoading && events.length > 0) {
      const minDate = new Date(timeRange.min);
      const maxDate = new Date(timeRange.max);
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  }, [isLoading, events.length, timeRange]);

  const filters: FilterCriteria = useMemo(() => {
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;

    return {
      startTime: startTimestamp,
      endTime: endTimestamp,
      eventTypes: selectedEventTypes,
      sources: selectedSources,
    };
  }, [startDate, endDate, selectedEventTypes, selectedSources]);


  const { filteredEvents, aggregatedResult } = useMemo(() => {
    if (events.length === 0) {
      return {
        filteredEvents: [],
        aggregatedResult: { value: 0, count: 0, aggregationType },
      };
    }

    const filtered = filterEventsOptimized(events, filters);
    const aggregated = calculateAggregation(filtered, aggregationType);

    return {
      filteredEvents: filtered,
      aggregatedResult: aggregated,
    };
  }, [events, filters, aggregationType]);

  const paginatedEvents = useMemo(() => {
    return paginateEvents(filteredEvents, currentPage, itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Pagination state
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    return {
      currentPage,
      itemsPerPage,
      totalItems: filteredEvents.length,
      totalPages: totalPages || 1,
    };
  }, [filteredEvents.length, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedEventTypes, selectedSources, itemsPerPage]);

  // Filter handlers
  const toggleEventType = (type: EventType) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const clearFilters = () => {
    setSelectedEventTypes([]);
    setSelectedSources([]);
    if (events.length > 0) {
      const minDate = new Date(timeRange.min);
      const maxDate = new Date(timeRange.max);
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <h1>Telemetry Vault</h1>
        <p>Generating synthetic telemetry data...</p>
        <div className="spinner" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Telemetry Vault</h1>
        <p className="subtitle">Data Exploration Interface</p>
      </header>

      <main className="app-main">
        <FilterControls
          startDate={startDate}
          endDate={endDate}
          selectedEventTypes={selectedEventTypes}
          selectedSources={selectedSources}
          aggregationType={aggregationType}
          availableEventTypes={availableEventTypes}
          availableSources={availableSources}
          aggregatedValue={aggregatedResult.value}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onEventTypeToggle={toggleEventType}
          onSourceToggle={toggleSource}
          onAggregationChange={setAggregationType}
          onClearFilters={clearFilters}
        />

        {/* Results Summary */}
        <section className="results-summary">
          <div className="summary-text" role="status" aria-live="polite">
            Showing <strong>{paginatedEvents.length}</strong> of{' '}
            <strong>{filteredEvents.length.toLocaleString()}</strong> events
            {filteredEvents.length !== totalEvents &&
              ` (filtered from ${totalEvents.toLocaleString()} total)`}
          </div>
        </section>

        {/* Data Table */}
        <section className="table-section">
          <DataTable events={paginatedEvents} />
          <Pagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </section>
      </main>
    </div>
  );
}

export default App;