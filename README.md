# Telemetry Dashboard

A modern, high-performance telemetry event visualization and analysis dashboard built with Next.js 16 and React 19. Features real-time event filtering, comprehensive data exploration, and a beautiful, responsive UI.

## Overview

The Telemetry Dashboard provides a complete solution for viewing, filtering, and analyzing system telemetry events from multiple distributed services. It handles large datasets (10,000+ events) with smooth performance and provides intuitive filtering, searching, and pagination capabilities.

## Features

### Core Functionality
- **Event Visualization**: Display telemetry events in a responsive, sortable table
- **Advanced Filtering**: Filter by event type, source, date range, and search query
- **Smart Pagination**: Configurable page size (10, 25, 50, 100 items) with automatic page reset
- **Event Types**: Support for 5 event types:
  - `request`: API requests with latency metrics (10-1000ms)
  - `error`: HTTP error codes (400-599)
  - `warning`: Warning severity levels (1-10)
  - `metric`: System metrics like CPU/Memory (0-100%)
  - `trace`: Trace durations (5-505ms)

### User Experience
- **Empty State**: Contextual messaging when no events match filters
- **Loading State**: Visual feedback during data filtering operations
- **Smart Dropdown Closing**: Dropdowns automatically close when clicking outside
- **Icon System**: Professional SVG icons for each event type and UI element
- **Color-Coded Badges**: Event types displayed with distinct color coding and icons
- **Responsive Design**: Mobile-first layout that adapts to all screen sizes

### Data Management
- **Data Generation**: Synthetic telemetry data from 12 distributed services
- **Weighted Distribution**: Realistic event type distribution (50% requests, 20% metrics, 15% traces, 10% warnings, 5% errors)
- **Temporal Distribution**: Events distributed across 7-day window with peak hour patterns
- **Multiple Sources**:
  - api-gateway, auth-service, payment-service, user-service
  - notification-service, analytics-service, database-primary, database-replica
  - cache-redis, message-queue, cdn-edge, logging-service

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Pure inline CSS (no Tailwind)
- **State Management**: React hooks (useState, useMemo, useEffect)
- **Icons**: Custom SVG component library
- **Performance**: Optimized filtering with useMemo, lazy data generation

## Project Structure

```
/
├── app/
│   ├── page.tsx              # Main dashboard component
│   ├── layout.tsx            # Root layout
│   ├── loading.tsx           # Loading fallback
│   └── globals.css           # Global styles and animations
├── components/
│   ├── Icons.tsx             # Icon component library
│   └── ui/                   # shadcn/ui components (not used in main app)
├── utils/
│   └── generateValue.ts      # Data generation and utilities
├── types/
│   └── telemetry.ts          # TypeScript type definitions
└── hooks/                    # Reusable React hooks
```

## Getting Started

### Installation

```bash
# clone and install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:517..](http://localhost:517..) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Usage

### Filtering Events

1. **Event Type Filter**: Select one or more event types (request, error, warning, metric, trace)
2. **Source Filter**: Filter by service source (api-gateway, auth-service, etc.)
3. **Date Range**: Select start and end dates for the time window
4. **Search**: Text search across event IDs and source names
5. **Page Size**: Choose between 10, 25, 50, or 100 items per page

All filters can be combined and update the table in real-time.

### Reading the Table

- **Event ID**: Unique identifier for the event
- **Type**: Event category with color-coded badge and icon
- **Source**: Service that generated the event
- **Value**: Metric value (varies by event type - latency, error code, severity, etc.)
- **Timestamp**: When the event occurred (formatted date and time)

## Color Scheme

The dashboard uses a carefully selected palette of 5 colors:

- **Primary (Indigo)**: `#6366F1` - Main brand color
- **Secondary (Purple)**: `#8B5CF6` - Accent color
- **Accent (Pink)**: `#EC4899` - Highlight color
- **Success (Emerald)**: `#10B981` - Positive states
- **Neutrals**: White, grays (background, surface, borders, text)

## API Reference

### generateTelemetryData(count)

Generates synthetic telemetry events with realistic patterns.

```typescript
const events = generateTelemetryData(10000);
// Returns: TelemetryEvent[]
```

### generateValue(eventType)

Generates a realistic value based on event type.

```typescript
const latency = generateValue('request');  // 10-1000ms
const errorCode = generateValue('error');  // 400-599
```

### Data Types

```typescript
interface TelemetryEvent {
  id: string;           // Unique event identifier
  timestamp: number;    // Unix timestamp in milliseconds
  eventType: EventType; // 'request' | 'error' | 'warning' | 'metric' | 'trace'
  source: string;       // Service name
  value: number;        // Event-specific metric
}

type EventType = 'request' | 'error' | 'warning' | 'metric' | 'trace';
```

## Performance Considerations

- **Data Generation**: ~800ms for 10,000 events (one-time on mount)
- **Filtering**: Uses useMemo for efficient re-computation
- **Pagination**: Constant-time slice operations
- **DOM Updates**: React.memo optimization on table rows
- **Memory**: ~5-10MB for 10,000 events in memory

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Real-time event streaming with WebSocket
- Advanced analytics and aggregations
- Export data to CSV/JSON
- Custom metric calculations
- Persistent filter preferences
- Dark mode support
- Event detail view/modal
- Histogram and timeline visualizations

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Use TypeScript for type safety
2. Keep components focused and composable
3. Maintain the existing code style (inline CSS, no Tailwind)
4. Add proper error handling and loading states
5. Write meaningful commit messages

## License

MIT License - feel free to use this project for any purpose.
