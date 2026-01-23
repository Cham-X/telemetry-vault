# Project Folder Structure

## Visual Directory Tree

```
telemetry-dashboard/
│
├── 📁 app/
│   ├── page.tsx                      # Main dashboard (1050 lines, all functionality)
│   ├── layout.tsx                    # Next.js root layout with metadata
│   ├── loading.tsx                   # Loading fallback for Suspense
│   └── globals.css                   # Tailwind base + spin animation
│
├── 📁 components/
│   └── Icons.tsx                     # 8 Icon components (68 lines)
│                                     # ├─ IconChart (bar chart)
│                                     # ├─ IconCalendar (date picker)
│                                     # ├─ IconFilter (funnel)
│                                     # ├─ IconServer (server)
│                                     # ├─ IconSearch (magnifying glass)
│                                     # ├─ IconX (close/delete)
│                                     # ├─ IconLoader (rotating spinner)
│                                     # └─ IconInbox (empty state)
│
├── 📁 types/
│   └── telemetry.ts                  # Type definitions
│                                     # ├─ TelemetryEvent
│                                     # ├─ EventType ('request'|'error'|...)
│                                     # ├─ AggregationType
│                                     # ├─ AggregatedResult
│                                     # └─ FilterCriteria
│
├── 📁 utils/
│   ├── generateValue.ts              # Data generation (500+ chars)
│   │                                 # Exports:
│   │                                 # ├─ generateTelemetryData(10000)
│   │                                 # ├─ getRandomEventType() 
│   │                                 # ├─ generateValue(eventType)
│   │                                 # ├─ getUniqueSources()
│   │                                 # ├─ getTimeRange()
│   │                                 # ├─ EVENT_TYPES, SOURCES, COLORS
│   │                                 # └─ getEventTypes(), getSources()
│   │
│   ├── filterEvents.ts               # Filtering & pagination (135 lines)
│   │                                 # Exports:
│   │                                 # ├─ filterEventsOptimized() [uses binary search]
│   │                                 # ├─ filterEvents() [naive filtering]
│   │                                 # ├─ findStartIndex() [binary search]
│   │                                 # ├─ findEndIndex() [binary search]
│   │                                 # └─ paginateEvents()
│   │
│   └── calculateCount.ts             # Aggregation & metrics (83 lines)
│                                     # Exports:
│                                     # ├─ calculateCount()
│                                     # ├─ calculateAverage()
│                                     # ├─ calculateP95()
│                                     # ├─ calculateAggregation()
│                                     # └─ calculateAllAggregations()
│
├── 📁 hooks/
│   └── (future: custom React hooks)
│
├── 📁 public/
│   └── (static assets, favicons, etc.)
│
├── 📄 README.md                      # Project overview & getting started
├── 📄 ARCHITECTURE.md                # System design & technical details
├── 📄 ASSUMPTIONS.md                 # Design decisions & constraints
├── 📄 PROJECT_STRUCTURE.md           # This file
│
├── ⚙️ Configuration Files
│   ├── package.json                  # Dependencies & scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.mjs               # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS config
│   ├── .gitignore                    # Git ignore rules
│   ├── .prettierignore               # Prettier ignore rules
│   └── .prettierrc.json              # Prettier formatting rules
│
└── 📁 node_modules/                  # Dependencies (auto-generated)
```

## File Descriptions

### Core Application Files

| File | Purpose | Size | Key Content |
|------|---------|------|------------|
| `app/page.tsx` | Main dashboard | 1050 lines | All UI, state management, filtering logic |
| `app/layout.tsx` | Root layout | ~50 lines | Metadata, fonts, global structure |
| `app/globals.css` | Styles | ~130 lines | Tailwind imports, base styles, animations |
| `app/loading.tsx` | Loading state | 4 lines | Suspense fallback component |

### Components

| File | Purpose | Size | Key Content |
|------|---------|------|------------|
| `components/Icons.tsx` | Icon library | 68 lines | 8 reusable icon components |

### Data & Types

| File | Purpose | Size | Key Content |
|------|---------|------|------------|
| `types/telemetry.ts` | TypeScript types | 18 lines | TelemetryEvent, EventType, filters |

### Utilities

| File | Purpose | Size | Key Content |
|------|---------|------|------------|
| `utils/generateValue.ts` | Data generation | 500+ chars | Realistic event data generation |
| `utils/filterEvents.ts` | Filtering logic | 135 lines | Binary search + pagination |
| `utils/calculateCount.ts` | Aggregations | 83 lines | Count, average, p95 metrics |

### Documentation

| File | Purpose | Content |
|------|---------|---------|
| `README.md` | User guide | Features, setup, usage examples |
| `ARCHITECTURE.md` | Technical design | System diagrams, data flow, algorithms |
| `ASSUMPTIONS.md` | Design decisions | Why certain choices were made |
| `PROJECT_STRUCTURE.md` | This file | Directory tree and file descriptions |

## Key Statistics

- **Total Lines of Code**: ~1,700
- **Main Component**: 1,050 lines (app/page.tsx)
- **Utility Code**: 218 lines (all utils combined)
- **Icon Components**: 68 lines (8 icons)
- **Type Definitions**: 18 lines
- **Event Data**: 10,000 synthetic events generated at startup
- **Performance**: Binary search filtering for O(log n) time complexity

## Technology Stack

```
├── Next.js 16              # React framework
├── React 19                # UI library
├── TypeScript              # Type safety
├── Inline Styles           # Styling (NO Tailwind in implementation)
├── Vanilla JavaScript      # Event handling
└── useEffect/useMemo       # State management
```

## Data Flow

```
User opens app
    ↓
generateTelemetryData(10000) generates events
    ↓
Display in table (default view)
    ↓
User filters/searches
    ↓
filterEventsOptimized() applies filters (binary search)
    ↓
calculateAllAggregations() computes metrics
    ↓
paginateEvents() slices results
    ↓
Render updated table
```

## Performance Optimizations

1. **Binary Search**: O(log n) time complexity for date range filtering
2. **useMemo**: Prevents unnecessary recalculations
3. **Event Delegation**: Dropdown click-outside detection
4. **Lazy Loading**: Icons imported as separate components
5. **Sorted Events**: Data generated and sorted for optimal filtering

## How to Navigate

- **Start with**: `README.md` for overview
- **Understand design**: `ARCHITECTURE.md` for technical details
- **See why decisions**: `ASSUMPTIONS.md` for design rationale
- **View structure**: `PROJECT_STRUCTURE.md` (this file)
