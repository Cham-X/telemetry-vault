import type { TelemetryEvent } from '../types/telemetry';
import { Badge } from './Badge';

interface DataTableProps {
  events: TelemetryEvent[];
  isLoading?: boolean;
}

/**
 * Data table component with semantic HTML and accessibility features
 */
export function DataTable({ events, isLoading = false }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="table-loading" role="status" aria-live="polite">
        <p>Loading data...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="table-empty" role="status">
        <p>No events match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="table-container" role="region" aria-label="Telemetry events table">
      <table>
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            <th scope="col">Event Type</th>
            <th scope="col">Source</th>
            <th scope="col">Value</th>
            <th scope="col">ID</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td data-label="Timestamp">
                {new Date(event.timestamp).toLocaleString()}
              </td>
              <td data-label="Event Type">
                <Badge type={event.eventType} />
              </td>
              <td data-label="Source">{event.source}</td>
              <td data-label="Value">{event.value.toFixed(2)}</td>
              <td data-label="ID" className="id-cell">
                {event.id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}