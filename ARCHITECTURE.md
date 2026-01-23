# Architecture

## System Overview

The Telemetry Dashboard is a client-side React application built with Next.js 16, designed to visualize and filter telemetry events from distributed services. The architecture emphasizes simplicity, performance, and maintainability.

```
┌─────────────────────────────────────────────────────────┐
│                    Telemetry Dashboard                  │
│                   (Next.js + React 19)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Main Dashboard Component                 │  │
│  │              (app/page.tsx)                      │  │
│  │                                                  │  │
│  │  • Filter State Management                      │  │
│  │  • Event Data Loading                           │  │
│  │  • Pagination Logic                             │  │
│  │  • Component Rendering                          │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▲                             │
│           ┌───────────────┼───────────────┐            │
│           │               │               │            │
│           ▼               ▼               ▼            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Filters    │ │    Table     │ │  Pagination  │  │
│  │  (UI Only)   │ │  (UI Only)   │ │  (UI Only)   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│           │               │               │            │
│           └───────────────┼───────────────┘            │
│                           │                            │
│                 ┌─────────▼─────────┐                 │
│                 │  Data Processing  │                 │
│                 │                   │                 │
│                 │  • Filtering      │                 │
│                 │  • Sorting        │                 │
│                 │  • Pagination     │                 │
│                 │  (via useMemo)    │                 │
│                 └─────────┬─────────┘                 │
│                           │                            │
│                 ┌─────────▼─────────┐                 │
│                 │  Event Data       │                 │
│                 │  (In Memory)      │                 │
│                 │  10,000 events    │                 │
│                 └───────────────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Main Component: `app/page.tsx`

The single-page application component that orchestrates all functionality.

#### State Management

```typescript
// Data State
const [events, setEvents] = useState<TelemetryEvent[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Filter State
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
const [selectedSources, setSelectedSources] = useState<string[]>([]);
const [searchQuery, setSearchQuery] = useState('');

// UI State
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(50);
const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
const [isSourceOpen, setIsSourceOpen] = useState(false);
const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
const [isFilteringLoading, setIsFilteringLoading] = useState(false);
```

#### Data Flow

```
User Interaction
       │
       ▼
Update Filter/Search State
       │
       ▼
useMemo: Calculate Filtered Events
       │
       ├─ Apply Date Range Filter
       ├─ Apply Event Type Filter
       ├─ Apply Source Filter
       └─ Apply Search Query
       │
       ▼
useMemo: Calculate Paginated Results
       │
       ├─ Slice Events by Page Size
       └─ Calculate Page Metadata
       │
       ▼
Render Table/Empty State/Loading State
       │
       ▼
User Sees Updated Results
```

#### Component Rendering Structure

```
App (Main Component)
├── Header Section
│   ├── Title & Icon
│   └── Subtitle
│
├── Filters Section
│   ├── Search Bar
│   │   └── IconSearch
│   ├── Event Type Dropdown
│   │   ├── IconFilter
│   │   └── Dropdown Menu
│   ├── Source Dropdown
│   │   ├── IconServer
│   │   └── Dropdown Menu
│   └── Date Range Picker
│       ├── IconCalendar
│       └── Date Input Fields
│
├── Table Section
│   ├── Loading State (if isFilteringLoading)
│   │   ├── IconLoader (spinning)
│   │   └── "Filtering events..." text
│   │
│   ├── Empty State (if no results)
│   │   ├── IconInbox
│   │   └── Helpful Message
│   │
│   └── Data Table (if has results)
│       ├── Table Header
│       │   ├── Event ID
│       │   ├── Type (with Badge & Icon)
│       │   ├── Source
│       │   ├── Value
│       │   └── Timestamp
│       │
│       └── Table Rows (Paginated)
│           ├── Interactive Row
│           │   ├── Hover Effects
│           │   └── Badge with Icon
│           └── ... (more rows)
│
└── Pagination Section
    ├── Item Count Display
    ├── Items Per Page Selector
    └── Page Navigation
        ├── Previous Button
        ├── Page Numbers
        └── Next Button
```

## Data Flow Architecture

### 1. Data Generation Phase (`utils/generateValue.ts`)

**Function: `generateTelemetryData(count: number)`**

```
Component Mount
       │
       ▼
useEffect (once) triggers
       │
       ├─ generateTelemetryData(10000)
       │  │
       │  ├─ Loop 10,000 times
       │  │  ├─ Generate random timestamp (7 days historical data)
       │  │  ├─ Call getRandomEventType() → EventType
       │  │  │  Distribution: 50% request, 20% metric, 15% trace, 10% warning, 5% error
       │  │  ├─ Random source from 12 SOURCES (api-gateway, auth-service, payment-service, etc.)
       │  │  ├─ Call generateValue(eventType) → numeric value
       │  │  │  ├─ request: 10-200ms (90%), 200-1000ms (10% outliers)
       │  │  │  ├─ error: HTTP codes 400-599
       │  │  │  ├─ warning: severity 1-10
       │  │  │  ├─ metric: CPU/Memory 0-100%
       │  │  │  └─ trace: duration 5-505ms
       │  │  └─ Create TelemetryEvent object with id, timestamp, eventType, source, value
       │  │
       │  └─ Sort by timestamp (ascending) for optimized binary search filtering
       │
       ├─ Extract min/max dates for date picker initialization
       ├─ Log generation time and data range to console
       └─ Set isLoading = false
```

**Helper Functions:**
- `getRandomEventType()`: Returns weighted random EventType based on realistic distribution
- `generateValue(eventType)`: Returns realistic value ranges for each event type
- `getUniqueSources(events)`: Extract unique sources from dataset
- `getTimeRange(events)`: Get min/max timestamps

### 2. Filtering Phase (`utils/filterEvents.ts`)

**Function: `filterEventsOptimized(events, filters)`**

```
User Changes Filter
       │
       ▼
useMemo(filteredEvents) recalculates
       │
       ├─ Parse date range (startDate, endDate → timestamps)
       │
       ├─ Binary Search Time Filtering (O(log n) complexity)
       │  ├─ findStartIndex(events, startTime) → first event >= startTime
       │  └─ findEndIndex(events, endTime) → last event <= endTime
       │  └─ Slice timeFiltered = events[startIdx:endIdx]
       │
       ├─ Apply Event Type Filter
       │  └─ If selectedEventTypes.length > 0, filter by eventType
       │
       ├─ Apply Source Filter
       │  └─ If selectedSources.length > 0, filter by source
       │
       └─ Apply Search Filter (on Event ID)
          └─ If searchQuery, filter by partial ID match (case-insensitive)
```

**Key Optimization:** Binary search for time-based filtering reduces time filtering from O(n) to O(log n), crucial for large datasets.

### 3. Aggregation Phase (`utils/calculateCount.ts`)

**Function: `calculateAllAggregations(events)`**

```
Filtered Events
       │
       ├─ calculateCount(events)
       │  └─ return events.length
       │     Result: Total number of filtered events
       │
       ├─ calculateAverage(events)
       │  ├─ sum = reduce(event.value)
       │  └─ return sum / events.length
       │     Result: Mean value across all filtered events
       │
       └─ calculateP95(events)
          ├─ sortedValues = sort(events[].value) ascending
          ├─ index = floor(length * 0.95)
          └─ return sortedValues[index]
             Result: 95th percentile value (performance metric)
```

**Use Cases:**
- **Count**: Total events in filter result
- **Average**: Mean latency, mean error code, mean severity, etc.
- **P95**: Performance SLA metric (95% of requests under X ms)

### 4. Pagination Phase

**Function: `paginateEvents(events, page, itemsPerPage)`**

```
Filtered Events (e.g., 5000 results)
       │
       ├─ startIndex = (page - 1) * itemsPerPage
       ├─ endIndex = startIndex + itemsPerPage
       └─ return events.slice(startIndex, endIndex)
          Example: page=2, itemsPerPage=50 → events[50:100]
       │
       ▼
Render 50 rows in Table
```

### 5. Complete Filter Phase

```
User Changes Filter
       │
       ▼
useMemo(filteredEvents) recalculates
       │  ├─ Check if eventType is in selectedEventTypes
       │  ├─ Check if source is in selectedSources
       │  ├─ Check if search query matches id or source
       │  └─ Include if all checks pass
       │
       └─ Return filtered array
           (maintains original sort by timestamp)
```

### 3. Pagination Phase

```
Filtered Events Ready
       │
       ▼
useMemo(paginatedEvents) calculates
       │
       ├─ startIndex = (currentPage - 1) * pageSize
       ├─ endIndex = currentPage * pageSize
       │
       ├─ paginatedEvents = filteredEvents.slice(startIndex, endIndex)
       │
       ├─ totalPages = Math.ceil(filteredEvents.length / pageSize)
       │
       └─ Return paginatedEvents + metadata
```

### 4. Rendering Phase

```
Display Decision Tree
       │
       ├─ Is isFilteringLoading === true?
       │  └─ Show Loading State
       │     ├─ IconLoader (animated spin)
       │     └─ "Filtering events..." text
       │
       ├─ Is filteredEvents.length === 0?
       │  └─ Show Empty State
       │     ├─ IconInbox
       │     ├─ "No events found"
       │     └─ Helpful context message
       │
       └─ Render Data Table
          ├─ Table Header (static)
          └─ Table Rows (from paginatedEvents)
             └─ For each event:
                ├─ Event ID
                ├─ Badge (type with icon)
                ├─ Source
                ├─ Value (formatted to 2 decimals)
                └─ Timestamp (localized format)
```

## Utility Files Reference

### `/utils/generateValue.ts` - Data Generation
Responsible for creating realistic synthetic telemetry events.

**Exports:**
```typescript
// Constants
EVENT_TYPES: EventType[] = ['request', 'error', 'warning', 'metric', 'trace']
SOURCES: string[] = [12 service names]
COLORS: { primary, secondary, accent, success, etc. }

// Functions
generateValue(eventType: EventType): number
getRandomEventType(): EventType
generateTelemetryData(count?: number): TelemetryEvent[]
getUniqueSources(events: TelemetryEvent[]): string[]
getTimeRange(events: TelemetryEvent[]): { min, max }
getEventTypes(): EventType[]
getSources(): string[]
```

### `/utils/filterEvents.ts` - Data Filtering
Implements optimized filtering with binary search for performance.

**Exports:**
```typescript
// Main functions
filterEvents(events, filters): TelemetryEvent[]
filterEventsOptimized(events, filters): TelemetryEvent[] // Recommended
paginateEvents(events, page, itemsPerPage): TelemetryEvent[]

// Binary search helpers
findStartIndex(events, startTime): number
findEndIndex(events, endTime): number
```

**Performance:** Binary search reduces filtering from O(n) to O(log n) for time ranges.

### `/utils/calculateCount.ts` - Data Aggregation
Calculates statistical metrics on filtered events.

**Exports:**
```typescript
calculateCount(events): number                                    // Total count
calculateAverage(events): number                                  // Mean value
calculateP95(events): number                                      // 95th percentile
calculateAggregation(events, type): AggregatedResult             // Generic aggregator
calculateAllAggregations(events): { count, average, p95 }        // All at once
```

## File Structure

```
telemetry-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard component (1050+ lines)
│   │                         # • State management
│   │                         # • Filter logic
│   │                         # • Pagination
│   │                         # • Component rendering
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + @keyframes spin
│   └── loading.tsx           # Loading fallback component
│
├── components/
│   └── Icons.tsx             # Icon components (68 lines)
│                             # • IconChart, IconCalendar, IconFilter
│                             # • IconServer, IconSearch, IconX
│                             # • IconLoader (animated), IconInbox
│
├── types/
│   └── telemetry.ts          # TypeScript types
│                             # • TelemetryEvent
│                             # • EventType, FilterCriteria
│                             # • AggregationResult
│
├── utils/
│   ├── generateValue.ts      # Data generation (500+ chars)
│   │                         # • generateTelemetryData(count)
│   │                         # • getRandomEventType()
│   │                         # • generateValue(eventType)
│   │                         # • Event constants & COLORS
│   │
│   ├── filterEvents.ts       # Filtering & pagination (135 lines)
│   │                         # • filterEventsOptimized() with binary search
│   │                         # • findStartIndex/findEndIndex
│   │                         # • paginateEvents()
│   │
│   └── calculateCount.ts     # Aggregation & metrics (83 lines)
│                             # • calculateCount()
│                             # • calculateAverage()
│                             # • calculateP95() for performance
│                             # • calculateAllAggregations()
│
├── hooks/
│   └── (future: custom hooks)
│
├── public/
│   └── (assets)
│
├── Documentation/
│   ├── README.md             # Project overview & usage
│   ├── ARCHITECTURE.md       # This file (system design & details)
│   └── ASSUMPTIONS.md        # Design decisions & constraints
│
└── [Config files]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── .gitignore
    └── .prettierignore
```
project-root/
│
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main dashboard (all-in-one component)
│   ├── layout.tsx               # Root layout
│   ├── loading.tsx              # Loading fallback
│   └── globals.css              # Global styles & animations
│
├── components/                  # React components
│   ├── Icons.tsx               # Reusable SVG icon library
│   ├── theme-provider.tsx       # Theme context provider
│   └── ui/                      # shadcn/ui components (optional)
│       ├── button.tsx
│       ├── input.tsx
│       └── ... (other UI components)
│
├── utils/                       # Utility functions
│   └── generateValue.ts         # Data generation & helpers
│
├── types/                       # TypeScript type definitions
│   └── telemetry.ts             # Event types & interfaces
│
├── hooks/                       # React hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
│
├── lib/                         # Library utilities
│   └── utils.ts                 # Common utilities (cn function)
│
├── public/                      # Static assets
│
├── README.md                    # Project overview
├── ASSUMPTIONS.md               # Design assumptions
├── ARCHITECTURE.md              # This file
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.mjs              # Next.js config
└── .gitignore
```

## Technology Stack Details

### Frontend Framework
- **Next.js 16**: Server-side rendering, static generation, API routes
- **React 19**: Component library with hooks
- **TypeScript**: Static typing

### Styling Approach
- **No Tailwind CSS**: Intentional choice for full control
- **Inline CSS-in-JS**: Styles defined in component objects
- **CSS Animations**: Defined in globals.css (spin animation)
- **Design Tokens**: Centralized COLORS object

### State Management
- **React Hooks**: useState for all state
- **useMemo**: Optimized filtering and pagination calculations
- **useEffect**: Side effects (data loading, event listeners)
- **No Redux/Zustand**: Simple enough for hooks

### Performance Optimizations

```typescript
// Memoized filtering to prevent recalculation on every render
const filteredEvents = useMemo(() => {
  return events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const inDateRange = (!startDate || eventDate >= new Date(startDate)) &&
                       (!endDate || eventDate <= new Date(endDate));
    const typeMatch = selectedEventTypes.length === 0 || 
                      selectedEventTypes.includes(event.eventType);
    const sourceMatch = selectedSources.length === 0 || 
                        selectedSources.includes(event.source);
    const searchMatch = !searchQuery || 
                        event.id.includes(searchQuery) || 
                        event.source.includes(searchQuery);
    return inDateRange && typeMatch && sourceMatch && searchMatch;
  });
}, [events, startDate, endDate, selectedEventTypes, selectedSources, searchQuery]);

// Memoized pagination
const paginatedEvents = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return filteredEvents.slice(start, end);
}, [filteredEvents, currentPage, pageSize]);
```

## Interaction Patterns

### Click-Outside Dropdown Handler

```typescript
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only close if click is outside [data-dropdown-trigger] elements
    if (!target.closest('[data-dropdown-trigger]')) {
      setIsEventTypeOpen(false);
      setIsSourceOpen(false);
      setIsDatePickerOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Filter Chaining

Users can combine multiple filters:
- Event Type AND Source AND Date Range AND Search
- Each filter narrows the result set
- All filters are AND operations (not OR)
- Example: "Show request events from api-gateway in the last 3 days containing 'auth' in ID"

## Color System Architecture

```typescript
const COLORS = {
  // Brand Colors (3 primary)
  primary: '#6366F1',      // Indigo - main UI elements
  secondary: '#8B5CF6',    // Purple - secondary actions
  accent: '#EC4899',       // Pink - highlights

  // Functional Color
  success: '#10B981',      // Emerald - positive states

  // Neutral Colors (5 for depth)
  background: '#F8FAFC',   // Slate-50 - page background
  surface: '#FFFFFF',      // White - card/table background
  surfaceAlt: '#F1F5F9',   // Slate-100 - hover/alt states
  border: '#E2E8F0',       // Slate-200 - dividers
  text: '#1E293B',         // Slate-900 - primary text
  textLight: '#64748B',    // Slate-500 - secondary text
};

// Event Type Color Mapping
const badges = {
  request: { bg: '#DDD6FE', text: '#4338CA' },  // Indigo
  error: { bg: '#FEE2E2', text: '#7F1D1D' },    // Red
  warning: { bg: '#FEF3C7', text: '#78350F' },  // Amber
  metric: { bg: '#DBEAFE', text: '#0369A1' },   // Blue
  trace: { bg: '#D1FAE5', text: '#065F46' },    // Emerald
};
```

## Scalability Considerations

### Current Limitations
- **10,000 Events Max**: In-memory storage limits
- **Client-Side Only**: No backend processing
- **Single User**: No multi-user coordination
- **No Persistence**: Data lost on refresh

### Production Scaling Path

```
Current: Client-Side Dashboard
         10,000 events in memory
              │
              ▼
Stage 1:  Add Backend API
         - Event storage (database)
         - Server-side filtering
         - Pagination via offset/limit
              │
              ▼
Stage 2:  Add Real-Time Updates
         - WebSocket connection
         - Server-sent events
         - Live event streaming
              │
              ▼
Stage 3:  Add Analytics
         - Aggregations
         - Time-series data
         - Statistical functions
              │
              ▼
Stage 4:  Add Search Engine
         - Elasticsearch/similar
         - Full-text search
         - Complex queries
              │
              ▼
Stage 5:  Distributed Deployment
         - Load balancing
         - Caching layer
         - Multi-region support
```

## Error Handling Strategy

Current implementation has minimal error handling (assumes data is always valid):
- No try-catch blocks for data generation
- No validation on filter inputs
- No error boundaries

For production, add:
- Error boundary component
- API error handling
- Input validation
- User-facing error messages
- Logging/monitoring integration

## Testing Architecture

Recommended testing structure:

```
tests/
├── unit/
│   ├── generateValue.test.ts
│   ├── utils.test.ts
│   └── types.test.ts
│
├── integration/
│   ├── filtering.test.ts
│   ├── pagination.test.ts
│   └── interaction.test.ts
│
└── e2e/
    ├── filter-flow.test.ts
    ├── pagination-flow.test.ts
    └── dropdown-behavior.test.ts
```

## Security Architecture

**Current State**: No security requirements (synthetic data only)

**Production Considerations**:
- Authentication layer (OAuth/JWT)
- Authorization rules (who can see which events)
- Input sanitization
- CSRF protection
- Rate limiting
- Audit logging
