# Assumptions

This document outlines the key assumptions made during the development of the Telemetry Dashboard.

## Data Generation & Simulation

### Event Generation
- **Synthetic Data Only**: The dashboard generates synthetic telemetry data. In production, this would be replaced with real event streams from actual services.
- **No Real Services**: The 12 "services" (api-gateway, auth-service, etc.) are simulated and exist only for demonstration purposes.
- **Fixed Data Size**: 10,000 events are generated on component mount. This is sufficient for UI demonstration but would need streaming for real-world scenarios.

### Temporal Assumptions
- **7-Day Window**: Events are distributed across the past 7 days, assuming a typical weekly analysis period.
- **Peak Hour Bias**: Event distribution includes a sinusoidal bias to simulate realistic peak hours, assuming higher activity during business hours.
- **Fixed Timestamps**: Events are pre-generated with fixed timestamps and won't update unless the component remounts.

## Event Type Value Ranges

### Realistic Value Distributions
- **request**: Latency values (10-1000ms)
  - Assumption: 90% of requests complete in 10-200ms, 10% are slower (200-1000ms)
- **error**: HTTP error codes (400-599)
  - Assumption: Errors are distributed across 4xx and 5xx status codes
- **warning**: Severity levels (1-10)
  - Assumption: Warnings have numeric severity from low (1) to high (10)
- **metric**: Percentages (0-100%)
  - Assumption: Metrics represent resource utilization (CPU, memory, etc.)
- **trace**: Duration in milliseconds (5-505ms)
  - Assumption: Traces represent request tracing durations

### Event Type Probability Distribution
- **50% Requests**: Most common event type (normal operation)
- **20% Metrics**: Regular performance metrics
- **15% Traces**: Distributed tracing events
- **10% Warnings**: Less common alertable events
- **5% Errors**: Rarest events (hopefully!)

This distribution assumes a healthy system with low error rates.

## UI/UX Assumptions

### User Interaction
- **Desktop-First**: While responsive, the UI is optimized for desktop viewing of detailed telemetry data.
- **Single Tab**: Assumes users are working in a single browser tab (no cross-tab state sync).
- **Click-to-Close Dropdowns**: Assumes users prefer clicking outside to close filters rather than explicit close buttons.
- **No Favorites**: Users don't have saved filter presets or shortcuts.

### Data Presentation
- **Table View Only**: Assumes table format is preferred over charts for detailed data exploration.
- **10,000 Event Limit**: Assumes the UI won't need to handle datasets larger than 10,000 events efficiently.
- **No Real-Time Updates**: Assumes events don't change after initial load (no WebSocket or polling).
- **No User Preferences**: Filter states reset on page reload; no localStorage persistence.

### Performance
- **User Has Good Hardware**: Assumes modern browser with sufficient RAM for 10,000 objects in memory.
- **Adequate Network**: Assumes no extreme bandwidth constraints for initial data load.
- **Single User**: Assumes single-user experience; no concurrent access or locking concerns.

## System Assumptions

### Services
- **12 Named Services**: Assumes exactly 12 backend services as defined in constants.
- **No Service Hierarchy**: All services are treated as equals; no parent-child relationships.
- **No Service Availability Changes**: Service availability is not modeled; all services are always "up."
- **No Service Dependencies**: Services are independent; no cascading failure scenarios.

### Event Sources
- **Consistent Naming**: Event sources use kebab-case (api-gateway, auth-service) as a naming convention.
- **Static Service List**: The list of services doesn't change; no dynamic service discovery.
- **No Service Metadata**: Only service names are tracked; no additional service metadata (region, version, tier).

## Implementation Assumptions

### Technology Stack
- **Client-Side Only**: The entire application runs in the browser; no backend API required.
- **No Database**: No persistent storage; data exists only in memory during session.
- **Modern Browser**: Assumes ES2020+ JavaScript support and modern CSS capabilities.
- **TypeScript Strict Mode**: Assumes strict type checking throughout.

### Code Organization
- **No External Libraries**: Uses only React and Next.js built-ins (no third-party UI libraries except Icons).
- **Inline Styles**: Assumes inline CSS-in-JS is acceptable instead of external stylesheets.
- **No State Management Library**: Assumes React hooks are sufficient; no Redux, Zustand, etc.
- **No API Layer**: All data operations are synchronous; no async API calls.

### Styling
- **No Tailwind CSS**: Project intentionally avoids Tailwind; uses pure inline styles.
- **Color Constants**: All colors are defined as hex values in a centralized COLORS object.
- **No Media Query Tool**: Responsive design achieved through flexbox and mobile-first thinking.

## Security & Privacy

### Data Handling
- **No Real User Data**: All telemetry is synthetic; no actual user information exists.
- **No Authentication**: No user login or permission system required.
- **No Data Persistence**: No logs saved; data is ephemeral within the session.
- **No External Calls**: No data leaves the browser; no telemetry about users.

### Input Validation
- **Trusted Input**: Assumes all filter inputs are from trusted sources (no XSS concerns).
- **No SQL Injection**: Client-side filtering only; no database queries.
- **No CSRF Protection**: Single-page app with no state-changing requests.

## Browser & Environment

### Supported Browsers
- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Mobile**: iOS Safari and Chrome on Android
- Assumes modern browser features (Intl API, ES modules, etc.)

### Environment Variables
- **No Environment Setup**: Application works without any environment variables.
- **No API Keys**: No external service integrations requiring keys.
- **Development & Production**: Same codebase for both; no environment-specific config needed.

## Limitations & Trade-offs

### Known Limitations
1. **No Real-Time Updates**: Data is static after initial load
2. **No Persistence**: Filters and pagination state reset on refresh
3. **No Export**: Can't download or export filtered results
4. **No Advanced Analytics**: Only basic filtering; no aggregations or statistics
5. **Single Language**: Only English; no i18n support
6. **No Accessibility Features**: Limited ARIA labels and keyboard navigation

### Design Trade-offs
1. **Performance vs Feature Richness**: Chose performance by limiting features
2. **Simplicity vs Customization**: No complex configuration; sensible defaults only
3. **Client-Side vs Server-Side**: All processing client-side for instant feedback
4. **Speed vs Accuracy**: Generated data prioritizes realistic distribution over precision

## Future Migration Assumptions

When migrating to production:
- Real event data will replace `generateTelemetryData()`
- API endpoints will replace client-side filtering
- Database will replace in-memory storage
- Authentication layer will be added
- WebSocket for real-time updates will be implemented
- State management library will be introduced
- External logging/monitoring will be integrated
