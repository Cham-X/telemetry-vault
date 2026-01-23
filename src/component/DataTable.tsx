import { IconLoader } from "../assets/icons";
import type { TelemetryEvent } from "../types/telemetry";
import { COLORS } from "../utils/dataGenerator";
import Badge from "./Badge";
import { formatDate } from "./DareFormatter";
import EmptyState from "./EmptyState";

interface DataTableProps {
  filteredEvents: TelemetryEvent[];
  PaginatedEvents: TelemetryEvent[];
  searchQuery?: string;
  selectedEventTypes?: string[];
  selectedSources?: string[];
  isFilteringLoading?: boolean;
}

export function DataTable({
  filteredEvents,
  isFilteringLoading,
  PaginatedEvents,
  searchQuery,
  selectedEventTypes,
  selectedSources,
}: DataTableProps) {
  if (isFilteringLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          gap: 16,
        }}
      >
        <div style={{ color: COLORS.primary }}>
          <IconLoader size={32} />
        </div>
        <p
          style={{
            fontSize: 14,
            color: COLORS.textLight,
            fontWeight: 500,
          }}
        >
          Filtering events...
        </p>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        selectedEventTypes={selectedEventTypes}
        selectedSources={selectedSources}
      />
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              background: COLORS.surfaceAlt,
            }}
          >
            <th
              style={{
                padding: "16px 20px",
                textAlign: "left",
                fontWeight: 600,
                color: COLORS.textLight,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Event ID
            </th>
            <th
              style={{
                padding: "16px 20px",
                textAlign: "left",
                fontWeight: 600,
                color: COLORS.textLight,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Type
            </th>
            <th
              style={{
                padding: "16px 20px",
                textAlign: "left",
                fontWeight: 600,
                color: COLORS.textLight,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Source
            </th>
            <th
              style={{
                padding: "16px 20px",
                textAlign: "right",
                fontWeight: 600,
                color: COLORS.textLight,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Value
            </th>
            <th
              style={{
                padding: "16px 20px",
                textAlign: "left",
                fontWeight: 600,
                color: COLORS.textLight,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {PaginatedEvents.map((event) => (
            <tr
              key={event.id}
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                transition: "background 0.2s ease",
                background: COLORS.surface,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.surface;
              }}
            >
              <td
                style={{
                  padding: "16px 20px",
                  color: COLORS.text,
                  fontWeight: 500,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                {event.id}
              </td>
              <td style={{ padding: "16px 20px" }}>
                <Badge type={event.eventType} />
              </td>
              <td
                style={{
                  padding: "16px 20px",
                  color: COLORS.textLight,
                }}
              >
                {event.source}
              </td>
              <td
                style={{
                  padding: "16px 20px",
                  textAlign: "right",
                  color: COLORS.text,
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                {event.value.toFixed(2)}
              </td>
              <td
                style={{
                  padding: "16px 20px",
                  color: COLORS.textLight,
                  fontSize: 12,
                }}
              >
                {formatDate(event.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
