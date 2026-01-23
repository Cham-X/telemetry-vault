import { useState, useMemo, useEffect } from "react";
import {
  generateTelemetryData,
  COLORS,
  EVENT_TYPES,
  SOURCES,
} from "./utils/dataGenerator";
import type { TelemetryEvent, EventType } from "./types/telemetry";
import {
  IconChart,
  IconCalendar,
  IconFilter,
  IconServer,
  IconSearch,
  IconX,
  IconBarChart,
  IconChevronDown,
} from "./assets/icons/index";
import { DataTable } from "./component/DataTable";
import { Pagination } from "./component/Pagination";

export default function App() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aggregationType, setAggregationType] = useState<
    "count" | "average" | "p95"
  >("count");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Dropdown states
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter loading state
  const [isFilteringLoading] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-trigger]")) {
        setIsEventTypeOpen(false);
        setIsSourceOpen(false);
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const generatedEvents = generateTelemetryData(10000);
      setEvents(generatedEvents);
      if (generatedEvents.length > 0) {
        const minDate = new Date(generatedEvents[0].timestamp);
        const maxDate = new Date(
          generatedEvents[generatedEvents.length - 1].timestamp,
        );
        setStartDate(minDate.toISOString().split("T")[0]);
        setEndDate(maxDate.toISOString().split("T")[0]);
      }
      setIsLoading(false);
    }, 800);
  }, []);

  const { filteredEvents, aggregatedValue } = useMemo(() => {
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate
      ? new Date(endDate).getTime() + 86400000
      : Infinity;

    let filtered = events.filter((event) => {
      const matchesTime =
        event.timestamp >= startTimestamp && event.timestamp <= endTimestamp;
      const matchesType =
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(event.eventType);
      const matchesSource =
        selectedSources.length === 0 || selectedSources.includes(event.source);
      const matchesSearch =
        !searchQuery ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTime && matchesType && matchesSource && matchesSearch;
    });

    let aggValue = 0;
    if (filtered.length > 0) {
      if (aggregationType === "count") {
        aggValue = filtered.length;
      } else if (aggregationType === "average") {
        aggValue =
          filtered.reduce((sum, e) => sum + e.value, 0) / filtered.length;
      } else if (aggregationType === "p95") {
        const sorted = [...filtered].sort((a, b) => a.value - b.value);
        const index = Math.floor(sorted.length * 0.95);
        aggValue = sorted[index]?.value || 0;
      }
    }

    return { filteredEvents: filtered, aggregatedValue: aggValue };
  }, [
    events,
    startDate,
    endDate,
    selectedEventTypes,
    selectedSources,
    aggregationType,
    searchQuery,
  ]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    startDate,
    endDate,
    selectedEventTypes,
    selectedSources,
    pageSize,
    searchQuery,
  ]);

  const toggleEventType = (type: EventType) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  };

  const clearFilters = () => {
    setSelectedEventTypes([]);
    setSelectedSources([]);
    setSearchQuery("");
    if (events.length > 0) {
      const minDate = new Date(events[0].timestamp);
      const maxDate = new Date(events[events.length - 1].timestamp);
      setStartDate(minDate.toISOString().split("T")[0]);
      setEndDate(maxDate.toISOString().split("T")[0]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: COLORS.background,
        }}
      >
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bounce {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 24px",
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              borderRadius: "12px",
              animation: "spin 3s linear infinite",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <IconBarChart />
          </div>
          <p
            style={{
              color: COLORS.textLight,
              fontSize: 16,
              fontWeight: 500,
              margin: 0,
              animation: "bounce 1.5s ease-in-out infinite",
            }}
          >
            Loading telemetry data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background }}>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input:focus, select:focus {
          outline: none;
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          padding: "32px 32px",
          boxShadow: "0 10px 30px rgba(99, 102, 241, 0.15)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <IconBarChart />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Telemetry Vault
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.85)",
                margin: "6px 0 0",
              }}
            >
              Real-time Data Explorer & Analytics
            </p>
          </div>
        </div>
      </header>

      <main
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px" }}
      >
        {/* Aggregation Card */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            border: `1px solid ${COLORS.border}`,
            animation: "slideUp 0.4s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            {/* Aggregation Type Selector */}
            <div style={{ flex: "1 1 240px", minWidth: 240 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.textLight,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <span style={{ color: COLORS.primary }}>
                  <IconChart />
                </span>
                Aggregation Type
              </label>
              <select
                value={aggregationType}
                onChange={(e) => setAggregationType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  fontSize: 14,
                  background: COLORS.surface,
                  color: COLORS.text,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontWeight: 500,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="count">Count (Total Events)</option>
                <option value="average">Average (Mean Value)</option>
                <option value="p95">P95 (95th Percentile)</option>
              </select>
            </div>

            {/* Result Card */}
            <div
              style={{
                flex: "1 1 240px",
                minWidth: 240,
                background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
                borderRadius: "10px",
                padding: "20px",
                border: `2px solid ${COLORS.primary}`,
                animation: "scaleIn 0.5s ease-out 0.1s backwards",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.primary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {aggregationType}
                </span>
                <span style={{ color: COLORS.primary }}>
                  <IconChart />
                </span>
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.text,
                  letterSpacing: "-1px",
                }}
              >
                {aggregatedValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textLight,
                  marginTop: "8px",
                }}
              >
                {selectedEventTypes.length > 0 || selectedSources.length > 0
                  ? "Filtered"
                  : "All"}{" "}
                events
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            animation: "slideUp 0.5s ease-out 0.05s backwards",
          }}
        >
          {/* Filters Bar */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${COLORS.border}`,
              background: COLORS.surfaceAlt,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Search */}
              <div
                style={{
                  position: "relative",
                  flex: "1 1 220px",
                  minWidth: 220,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: COLORS.textLighter,
                  }}
                >
                  <IconSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search ID or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 42px",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    fontSize: 14,
                    background: COLORS.surface,
                    color: COLORS.text,
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Date Range */}
              <div style={{ position: "relative" }} data-dropdown-trigger>
                <button
                  data-dropdown-trigger
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  style={{
                    padding: "11px 16px",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    background: COLORS.surface,
                    color: COLORS.text,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.backgroundColor = COLORS.surface;
                  }}
                >
                  <IconCalendar />
                  <span>
                    {startDate && endDate
                      ? `${startDate} - ${endDate}`
                      : "Select dates"}
                  </span>
                  <span style={{ color: COLORS.textLight }}>
                    <IconChevronDown />
                  </span>
                </button>

                {/* Date Picker Dropdown */}
                {isDatePickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 8,
                      background: COLORS.surface,
                      borderRadius: "8px",
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      padding: 16,
                      zIndex: 1000,
                      minWidth: 300,
                      animation: "slideUp 0.2s ease-out",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: COLORS.textLight,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: `1.5px solid ${COLORS.border}`,
                            borderRadius: "6px",
                            fontSize: 13,
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: COLORS.textLight,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: `1.5px solid ${COLORS.border}`,
                            borderRadius: "6px",
                            fontSize: 13,
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        style={{
                          padding: "10px 16px",
                          background: COLORS.primary,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = COLORS.primaryDark;
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = COLORS.primary;
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Apply Dates
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Type Filter */}
              <div style={{ position: "relative" }} data-dropdown-trigger>
                <button
                  data-dropdown-trigger
                  onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
                  style={{
                    padding: "11px 16px",
                    border: `1.5px solid ${selectedEventTypes.length > 0 ? COLORS.primary : COLORS.border}`,
                    borderRadius: "8px",
                    background: COLORS.surface,
                    color: COLORS.text,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.surface;
                  }}
                >
                  <IconFilter />
                  <span>
                    Event Types{" "}
                    {selectedEventTypes.length > 0 &&
                      `(${selectedEventTypes.length})`}
                  </span>
                </button>

                {/* Event Type Dropdown */}
                {isEventTypeOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 8,
                      background: COLORS.surface,
                      borderRadius: "8px",
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      padding: 12,
                      zIndex: 1000,
                      minWidth: 200,
                      animation: "slideUp 0.2s ease-out",
                    }}
                  >
                    {EVENT_TYPES.map((type: any) => (
                      <label
                        key={type}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          transition: "background 0.15s ease",
                          backgroundColor: selectedEventTypes.includes(type)
                            ? `rgba(99, 102, 241, 0.1)`
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedEventTypes.includes(type)) {
                            e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            selectedEventTypes.includes(type)
                              ? `rgba(99, 102, 241, 0.1)`
                              : "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEventTypes.includes(type)}
                          onChange={() => toggleEventType(type)}
                          style={{
                            cursor: "pointer",
                            accentColor: COLORS.primary,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: COLORS.text,
                          }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Filter */}
              <div style={{ position: "relative" }} data-dropdown-trigger>
                <button
                  data-dropdown-trigger
                  onClick={() => setIsSourceOpen(!isSourceOpen)}
                  style={{
                    padding: "11px 16px",
                    border: `1.5px solid ${selectedSources.length > 0 ? COLORS.primary : COLORS.border}`,
                    borderRadius: "8px",
                    background: COLORS.surface,
                    color: COLORS.text,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.surface;
                  }}
                >
                  <IconServer />
                  <span>
                    Sources{" "}
                    {selectedSources.length > 0 &&
                      `(${selectedSources.length})`}
                  </span>
                </button>

                {/* Source Dropdown */}
                {isSourceOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 8,
                      background: COLORS.surface,
                      borderRadius: "8px",
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      padding: 12,
                      zIndex: 1000,
                      minWidth: 220,
                      maxHeight: "300px",
                      overflowY: "auto",
                      animation: "slideUp 0.2s ease-out",
                    }}
                  >
                    {SOURCES.map((source: any) => (
                      <label
                        key={source}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          transition: "background 0.15s ease",
                          backgroundColor: selectedSources.includes(source)
                            ? `rgba(99, 102, 241, 0.1)`
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedSources.includes(source)) {
                            e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            selectedSources.includes(source)
                              ? `rgba(99, 102, 241, 0.1)`
                              : "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source)}
                          onChange={() => toggleSource(source)}
                          style={{
                            cursor: "pointer",
                            accentColor: COLORS.primary,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: COLORS.text,
                          }}
                        >
                          {source}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(selectedEventTypes.length > 0 ||
                selectedSources.length > 0 ||
                searchQuery) && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "11px 16px",
                    background: "transparent",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.text,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.error;
                    e.currentTarget.style.color = COLORS.error;
                    e.currentTarget.style.backgroundColor = `rgba(239, 68, 68, 0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.color = COLORS.text;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <IconX />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div style={{ position: "relative", minHeight: "300px" }}>
            <DataTable
              filteredEvents={filteredEvents}
              isFilteringLoading={isFilteringLoading}
              PaginatedEvents={paginatedEvents}
              searchQuery={searchQuery}
              selectedEventTypes={selectedEventTypes}
              selectedSources={selectedSources}
            />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            filteredEvents={filteredEvents}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>
    </div>
  );
}
