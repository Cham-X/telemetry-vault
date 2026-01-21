import { useTelemetryData } from './hooks/useTelemetryData';
import './App.css';

function App() {
  const { 
    events, 
    isLoading, 
    sources, 
    eventTypes, 
    timeRange, 
    totalEvents 
  } = useTelemetryData(100000);


  if (isLoading) {
    return (
      <div className="loading-container">
        <h1>Telemetry Vault</h1>
        <p>Generating synthetic telemetry data...</p>
        <div className="spinner" />
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
        <section className="data-summary">
          <h2>Data Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Total Events</span>
              <span className="summary-value">{totalEvents.toLocaleString()}</span>
            </div>
            
            <div className="summary-card">
              <span className="summary-label">Time Range</span>
              <span className="summary-value">
                {new Date(timeRange.min).toLocaleDateString()} - {new Date(timeRange.max).toLocaleDateString()}
              </span>
            </div>
            
            <div className="summary-card">
              <span className="summary-label">Sources</span>
              <span className="summary-value">{sources.length}</span>
            </div>
            
            <div className="summary-card">
              <span className="summary-label">Event Types</span>
              <span className="summary-value">{eventTypes.length}</span>
            </div>
          </div>
        </section>

        <section className="data-preview">
          <h2>Sample Events (First 10)</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${event.eventType}`}>
                        {event.eventType}
                      </span>
                    </td>
                    <td>{event.source}</td>
                    <td>{event.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sources-list">
          <h2>Available Sources</h2>
          <div className="sources-grid">
            {sources.map((source) => (
              <span key={source} className="source-tag">
                {source}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;