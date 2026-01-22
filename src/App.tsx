import { useState,  useMemo } from 'react';
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
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aggregationType, setAggregationType] = useState<AggregationType>('count');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

const defaultStartDate = useMemo(
  () => new Date(timeRange.min).toISOString().split('T')[0],
  [timeRange.min]
);

const defaultEndDate = useMemo(
  () => new Date(timeRange.max).toISOString().split('T')[0],
  [timeRange.max]
);

  
  const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);

const effectiveStartDate = startDate ?? defaultStartDate;
const effectiveEndDate = endDate ?? defaultEndDate;




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
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [startDate, endDate, selectedEventTypes, selectedSources, itemsPerPage]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F9FAFB' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 24px' }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 18,
                  background: '#1764FF',
                  borderRadius: 3,
                  left: '50%',
                  top: '50%',
                  transformOrigin: '3px 32px',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  opacity: 0.1 + (i / 12) * 0.9,
                  animation: `pulse-loader 1.2s ease-in-out ${i * 0.1}s infinite`
                }}
              />
            ))}
          </div>
          <p style={{ color: '#6B7280', fontSize: 16, fontWeight: 500, animation: 'fade-in 0.5s ease-in' }}>Generating 100,000 telemetry events...</p>
        </div>
        <style>{`
          @keyframes pulse-loader {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 1; }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <header style={{
        background: 'linear-gradient(135deg, #1764FF 0%, #0EA5E9 100%)',
        padding: '28px 32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg style={{ width: 32, height: 32, color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div>
            <h1
              style={{
                fontSize: 28, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.5px'
              }}>
              Telemetry Vault
            </h1>
            <p
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: '4px 0 0' }}>
              Real-time Data Exploration Interface
            </p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <FilterControls
          startDate={effectiveStartDate}
          endDate={effectiveEndDate}
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