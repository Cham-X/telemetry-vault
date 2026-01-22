import { useState, useMemo, useEffect } from 'react';
import {IconBarChart, IconCalendar, IconChart, IconClock, IconFilter, IconSearch, IconServer, IconX,} from '../src/assets/icons/index' 
import Badge from './component/Badge';
import { COLORS, EVENT_TYPES, SOURCES } from './utils/dataGenerator';
import type { TelemetryEvent } from './types/telemetry';



const generateTelemetryData = (count: number): TelemetryEvent[] => {
  const events: TelemetryEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    events.push({
      id: `EVT-${String(i + 1).padStart(10, '0')}`,
      timestamp: now - Math.random() * 30 * 24 * 60 * 60 * 1000,
      eventType: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      value: Math.random() * 1000,
    });
  }
  return events.sort((a, b) => a.timestamp - b.timestamp);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};


export default function App() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aggregationType, setAggregationType] = useState<'count' | 'average' | 'p95'>('count');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // Dropdown states
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const generatedEvents = generateTelemetryData(100000);
      setEvents(generatedEvents);
      if (generatedEvents.length > 0) {
        const minDate = new Date(generatedEvents[0].timestamp);
        const maxDate = new Date(generatedEvents[generatedEvents.length - 1].timestamp);
        setStartDate(minDate.toISOString().split('T')[0]);
        setEndDate(maxDate.toISOString().split('T')[0]);
      }
      setIsLoading(false);
    }, 800);
  }, []);

  const { filteredEvents, aggregatedValue } = useMemo(() => {
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
    
    let filtered = events.filter(event => {
      const matchesTime = event.timestamp >= startTimestamp && event.timestamp <= endTimestamp;
      const matchesType = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType);
      const matchesSource = selectedSources.length === 0 || selectedSources.includes(event.source);
      const matchesSearch = !searchQuery || 
        event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTime && matchesType && matchesSource && matchesSearch;
    });

    let aggValue = 0;
    if (filtered.length > 0) {
      if (aggregationType === 'count') {
        aggValue = filtered.length;
      } else if (aggregationType === 'average') {
        aggValue = filtered.reduce((sum, e) => sum + e.value, 0) / filtered.length;
      } else if (aggregationType === 'p95') {
        const sorted = [...filtered].sort((a, b) => a.value - b.value);
        const index = Math.floor(sorted.length * 0.95);
        aggValue = sorted[index]?.value || 0;
      }
    }

    return { filteredEvents: filtered, aggregatedValue: aggValue };
  }, [events, startDate, endDate, selectedEventTypes, selectedSources, aggregationType, searchQuery]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedEventTypes, selectedSources, pageSize, searchQuery]);

  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const clearFilters = () => {
    setSelectedEventTypes([]);
    setSelectedSources([]);
    setSearchQuery('');
    if (events.length > 0) {
      const minDate = new Date(events[0].timestamp);
      const maxDate = new Date(events[events.length - 1].timestamp);
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: COLORS.background }}>
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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            margin: '0 auto 24px',
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
            borderRadius: '12px',
            animation: 'spin 3s linear infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <IconBarChart />
          </div>
          <p style={{ color: COLORS.textLight, fontSize: 16, fontWeight: 500, margin: 0, animation: 'bounce 1.5s ease-in-out infinite' }}>Loading telemetry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
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
      <header style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        padding: '32px 32px',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <IconBarChart />
          </div>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'white',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              Telemetry Vault
            </h1>
            <p style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '6px 0 0',
            }}>
              Real-time Data Explorer & Analytics
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 32px' }}>
        {/* Aggregation Card */}
        <div style={{
          background: COLORS.surface,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${COLORS.border}`,
          animation: 'slideUp 0.4s ease-out',
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Aggregation Type Selector */}
            <div style={{ flex: '1 1 240px', minWidth: 240 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.textLight,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                <span style={{ color: COLORS.primary }}>
                  <IconChart />
                </span>
                Aggregation Type
              </label>
              <select
                value={aggregationType}
                onChange={(e) => setAggregationType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: 14,
                  background: COLORS.surface,
                  color: COLORS.text,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="count">Count (Total Events)</option>
                <option value="average">Average (Mean Value)</option>
                <option value="p95">P95 (95th Percentile)</option>
              </select>
            </div>

            {/* Result Card */}
            <div style={{
              flex: '1 1 240px',
              minWidth: 240,
              background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
              borderRadius: '10px',
              padding: '20px',
              border: `2px solid ${COLORS.primary}`,
              animation: 'scaleIn 0.5s ease-out 0.1s backwards',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {aggregationType}
                </span>
                <span style={{ color: COLORS.primary }}>
                  <IconChart />
                </span>
              </div>
              <div style={{
                fontSize: 36,
                fontWeight: 700,
                color: COLORS.text,
                letterSpacing: '-1px',
              }}>
                {aggregatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div style={{
                fontSize: 12,
                color: COLORS.textLight,
                marginTop: '8px',
              }}>
                {selectedEventTypes.length > 0 || selectedSources.length > 0 ? 'Filtered' : 'All'} events
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div style={{
          background: COLORS.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          animation: 'slideUp 0.5s ease-out 0.05s backwards',
        }}>
          {/* Filters Bar */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceAlt,
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 220 }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.textLighter,
                }}>
                  <IconSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search ID or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: 14,
                    background: COLORS.surface,
                    color: COLORS.text,
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Date Range */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  style={{
                    padding: '11px 16px',
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    background: COLORS.surface,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 260,
                    color: COLORS.text,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.background = COLORS.surfaceAlt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.background = COLORS.surface;
                  }}
                >
                  <span style={{ color: COLORS.primary }}>
                    <IconCalendar />
                  </span>
                  <span>
                    {startDate && endDate ? `${formatDateShort(startDate)} — ${formatDateShort(endDate)}` : 'Select dates'}
                  </span>
                </button>
                {isDatePickerOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 40,
                        animation: 'fadeIn 0.2s ease',
                      }}
                      onClick={() => setIsDatePickerOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '10px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                      zIndex: 50,
                      minWidth: 320,
                      animation: 'slideUp 0.2s ease',
                      padding: '16px',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: '16px',
                      }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight, textTransform: 'uppercase' }}>From</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              marginTop: '6px',
                              border: `1.5px solid ${COLORS.border}`,
                              borderRadius: '6px',
                              fontSize: 14,
                              color: COLORS.text,
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight, textTransform: 'uppercase' }}>To</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              marginTop: '6px',
                              border: `1.5px solid ${COLORS.border}`,
                              borderRadius: '6px',
                              fontSize: 14,
                              color: COLORS.text,
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        style={{
                          width: '100%',
                          padding: '11px',
                          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Apply Range
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Event Type Filter */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
                  style={{
                    padding: '11px 16px',
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    background: COLORS.surface,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: COLORS.text,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.background = COLORS.surfaceAlt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.background = COLORS.surface;
                  }}
                >
                  <span style={{ color: COLORS.primary }}>
                    <IconFilter />
                  </span>
                  <span>Event Type {selectedEventTypes.length > 0 && `(${selectedEventTypes.length})`}</span>
                </button>
                {isEventTypeOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 40,
                        animation: 'fadeIn 0.2s ease',
                      }}
                      onClick={() => setIsEventTypeOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                      padding: '8px',
                      zIndex: 50,
                      minWidth: 220,
                      animation: 'slideUp 0.2s ease',
                    }}>
                      {EVENT_TYPES.map(type => (
                        <label
                          key={type}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = COLORS.surfaceAlt}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEventTypes.includes(type)}
                            onChange={() => toggleEventType(type)}
                            style={{
                              width: 18,
                              height: 18,
                              cursor: 'pointer',
                              accentColor: COLORS.primary,
                            }}
                          />
                          <Badge type={type} />
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Source Filter */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsSourceOpen(!isSourceOpen)}
                  style={{
                    padding: '11px 16px',
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    background: COLORS.surface,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: COLORS.text,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.background = COLORS.surfaceAlt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.background = COLORS.surface;
                  }}
                >
                  <span style={{ color: COLORS.primary }}>
                    <IconServer />
                  </span>
                  <span>Source {selectedSources.length > 0 && `(${selectedSources.length})`}</span>
                </button>
                {isSourceOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 40,
                        animation: 'fadeIn 0.2s ease',
                      }}
                      onClick={() => setIsSourceOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                      padding: '8px',
                      zIndex: 50,
                      minWidth: 240,
                      maxHeight: 320,
                      overflowY: 'auto',
                      animation: 'slideUp 0.2s ease',
                    }}>
                      {SOURCES.map(source => (
                        <label
                          key={source}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            fontSize: 14,
                            color: COLORS.text,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = COLORS.surfaceAlt}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(source)}
                            onChange={() => toggleSource(source)}
                            style={{
                              width: 18,
                              height: 18,
                              cursor: 'pointer',
                              accentColor: COLORS.primary,
                            }}
                          />
                          <span>{source}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Clear Filters */}
              {(selectedEventTypes.length > 0 || selectedSources.length > 0 || searchQuery) && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '11px 18px',
                    background: COLORS.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    animation: 'fadeIn 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <IconX />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceAlt,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            color: COLORS.textLight,
          }}>
            <span style={{ color: COLORS.primary }}>
              <IconClock />
            </span>
            <p style={{ margin: 0 }}>
              Showing <strong style={{ color: COLORS.text, fontWeight: 600 }}>{paginatedEvents.length}</strong> of{' '}
              <strong style={{ color: COLORS.text, fontWeight: 600 }}>{filteredEvents.length.toLocaleString()}</strong> events
              {filteredEvents.length !== events.length && (
                <span> (filtered from {events.length.toLocaleString()} total)</span>
              )}
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead style={{ background: COLORS.surfaceAlt }}>
                <tr>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{ color: COLORS.primary }}>
                      <IconClock />
                    </span>
                    Timestamp
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>
                    Event Type
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>
                    Source
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>
                    Value
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>
                    ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((event, idx) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      background: idx % 2 === 0 ? COLORS.surface : COLORS.surfaceAlt,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `rgba(99, 102, 241, 0.05)`}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? COLORS.surface : COLORS.surfaceAlt}
                  >
                    <td style={{ padding: '16px', fontSize: 14, color: COLORS.text }}>
                      {formatDate(event.timestamp)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Badge type={event.eventType} />
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: COLORS.text }}>
                      {event.source}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: 14,
                      color: COLORS.primary,
                      fontFamily: 'monospace',
                      fontWeight: 500,
                    }}>
                      {event.value}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: 12,
                      color: COLORS.textLight,
                      fontFamily: 'monospace',
                    }}>
                      {event.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            background: COLORS.surfaceAlt,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
              color: COLORS.text,
            }}>
              <span style={{ color: COLORS.primary }}>
                <IconBarChart />
              </span>
              Page {currentPage} of {totalPages}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {generatePageNumbers().map((page, idx) => (
                <div key={idx}>
                  {page === '...' ? (
                    <span style={{
                      padding: '10px 14px',
                      color: COLORS.textLight,
                      fontWeight: 500,
                    }}>
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(page as number)}
                      disabled={page === currentPage}
                      style={{
                        padding: '10px 14px',
                        border: page === currentPage ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                        borderRadius: '6px',
                        background: page === currentPage ? `rgba(99, 102, 241, 0.1)` : COLORS.surface,
                        color: page === currentPage ? COLORS.primary : COLORS.text,
                        fontSize: 14,
                        fontWeight: page === currentPage ? 600 : 500,
                        cursor: page === currentPage ? 'default' : 'pointer',
                        minWidth: 44,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.background = COLORS.surfaceAlt;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.background = COLORS.surface;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 14, color: COLORS.textLight, fontWeight: 500 }}>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  padding: '10px 14px',
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 500,
                  background: COLORS.surface,
                  color: COLORS.text,
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
