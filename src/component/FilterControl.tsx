import type { EventType, AggregationType } from '../types/telemetry';
import { Badge } from './Badge';

interface FilterControlsProps {
  startDate: string;
  endDate: string;
  selectedEventTypes: EventType[];
  selectedSources: string[];
  aggregationType: AggregationType;
  availableEventTypes: EventType[];
  availableSources: string[];
  aggregatedValue: number;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEventTypeToggle: (type: EventType) => void;
  onSourceToggle: (source: string) => void;
  onAggregationChange: (type: AggregationType) => void;
  onClearFilters: () => void;
}

/**
 * Filter controls component with full keyboard navigation
 */
export function FilterControls({
  startDate,
  endDate,
  selectedEventTypes,
  selectedSources,
  aggregationType,
  availableEventTypes,
  availableSources,
  aggregatedValue,
  onStartDateChange,
  onEndDateChange,
  onEventTypeToggle,
  onSourceToggle,
  onAggregationChange,
  onClearFilters,
}: FilterControlsProps) {
  return (
    <section className="filters-section" aria-labelledby="filters-heading">
      <div className="filters-header">
        <h2 id="filters-heading">Filters & Aggregation</h2>
        <button
          onClick={onClearFilters}
          className="btn-secondary"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>

      {/* Time Range */}
      <div className="filter-group">
        <label className="filter-label" id="time-range-label">
          Time Range
        </label>
        <div className="time-range-inputs" role="group" aria-labelledby="time-range-label">
          <label htmlFor="start-date" className="sr-only">
            Start date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="date-input"
            aria-label="Start date"
          />
          <span aria-hidden="true">to</span>
          <label htmlFor="end-date" className="sr-only">
            End date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="date-input"
            aria-label="End date"
          />
        </div>
      </div>

      {/* Event Types */}
      <fieldset className="filter-group">
        <legend className="filter-label">Event Types</legend>
        <div className="checkbox-group" role="group">
          {availableEventTypes.map((type) => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedEventTypes.includes(type)}
                onChange={() => onEventTypeToggle(type)}
                aria-label={`Filter by ${type} events`}
              />
              <Badge type={type} />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Sources */}
      <fieldset className="filter-group">
        <legend className="filter-label">Sources</legend>
        <div className="checkbox-group" role="group">
          {availableSources.map((source) => (
            <label key={source} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedSources.includes(source)}
                onChange={() => onSourceToggle(source)}
                aria-label={`Filter by ${source} source`}
              />
              <span className="source-tag-small">{source}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Aggregation */}
      <div className="filter-group">
        <label htmlFor="aggregation-select" className="filter-label">
          Aggregation
        </label>
        <select
          id="aggregation-select"
          value={aggregationType}
          onChange={(e) => onAggregationChange(e.target.value as AggregationType)}
          className="select-input"
          aria-label="Select aggregation type"
        >
          <option value="count">Count</option>
          <option value="average">Average</option>
          <option value="p95">P95 (95th Percentile)</option>
        </select>
      </div>

      {/* Aggregated Result */}
      <div className="aggregation-result" role="region" aria-live="polite">
        <span className="agg-label">{aggregationType.toUpperCase()}</span>
        <span className="agg-value" aria-label={`Aggregated ${aggregationType} value`}>
          {aggregatedValue.toFixed(2)}
        </span>
      </div>
    </section>
  );
}