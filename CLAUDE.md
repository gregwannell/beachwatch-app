# CLAUDE.md

Development guide for the Beachwatch UK beach litter tracking application.

## Project Overview

Next.js 15.4.6 application analyzing UK beach litter data with interactive maps, regional statistics, and trend visualizations. Built with TypeScript, React 19, and Supabase backend.

## Quick Start

```bash
npm run dev              # Development server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run gen-types        # Generate Supabase types (requires SUPABASE_PROJECT_ID)
```

## Tech Stack

- **Framework**: Next.js 15.4.6 (App Router), React 19.1.0, TypeScript (strict)
- **Database**: Supabase (PostgreSQL + Auth)
- **Data Fetching**: TanStack Query v5 with SSR hydration
- **Styling**: Tailwind CSS v4, shadcn/ui (New York style)
- **Maps**: React Leaflet with custom UK region boundaries
- **Charts**: Recharts with custom accessibility features
- **UI Libraries**: Radix UI, Framer Motion, Lucide icons

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── explore/              # Main data exploration UI
│   ├── login/                # Authentication
│   ├── api/                  # API routes
│   │   ├── analytics/        # Litter data analytics endpoints
│   │   ├── regions/          # Region hierarchy and boundaries
│   │   ├── materials/        # Material types
│   │   └── sources/          # Litter sources
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Tailwind + CSS variables
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── charts/               # Chart components (donut, bar, trend, etc.)
│   ├── map/                  # Interactive map with UK regions
│   ├── filters/              # Region, year, material filters
│   ├── region-stats/         # Regional statistics panels
│   ├── landing/              # Landing page sections
│   ├── layout/               # Layout components
│   ├── auth/                 # Login/logout components
│   └── providers/            # Context providers
├── lib/
│   ├── supabase/             # Supabase client (browser/server)
│   ├── query-client.ts       # TanStack Query config
│   ├── region-queries.ts     # Region data fetching hooks
│   ├── spatial-operations.ts # GeoJSON utilities
│   ├── map-themes.ts         # Leaflet map themes
│   ├── cache-strategies.ts   # Query cache config
│   └── utils.ts              # cn() and utilities
└── hooks/                    # Custom React hooks (if needed)
```

## Key Features

### Data Architecture
- Hierarchical regions: UK → Countries → Counties → Sub-regions
- Time series data: 1994-2024 with annual aggregations
- Litter categorization: Items, materials, sources
- GeoJSON boundaries for interactive mapping

### UI Components
- **Interactive Map**: Clickable UK regions with choropleth visualization
- **Filter System**: Hierarchical region select, year range, material/source filters
- **Charts**: Trend lines, donut charts, horizontal bars with accessibility
- **Region Stats**: KPIs, insights carousel, engagement metrics
- **Responsive**: Mobile-first with sheet/drawer navigation

### Performance Patterns
- Server-side data fetching with React Query hydration
- Optimistic UI updates for filters
- Boundary data caching (24h) and geometry simplification
- Separate API routes for analytics vs reference data

## Path Aliases

```typescript
@/* → ./src/*
@/components → ./src/components
@/lib → ./src/lib
@/ui → ./src/components/ui
@/hooks → ./src/hooks
```

## Styling System

- **Tailwind v4**: PostCSS plugin with CSS variables
- **Theme**: Light/dark mode via next-themes
- **Colors**: CSS variables for backgrounds, accents, charts (1-5)
- **cn()**: Utility combining clsx + tailwind-merge for className handling

## Database

- **Type Generation**: `npm run gen-types` creates `src/lib/database.types.ts`
- **Schema**: regions, litter_items, materials, sources, years
- **Geometry**: JSONB fields with GeoJSON Polygon/MultiPolygon
- **Queries**: TanStack Query hooks with Supabase RPC functions

## Git Workflow

### Commit Message Format

Use emoji conventional commits:

```
✨ feat: add interactive region map
🐛 fix: resolve filter state synchronization
♻️ refactor: extract map theme logic
📝 docs: update API documentation
🎨 style: improve filter button layout
⚡ perf: optimize boundary geometry queries
✅ test: add region selection tests
🔧 chore: update dependencies
```

### Commit Guidelines

- Each commit focuses on a single logical change or feature
- Write clear, descriptive messages explaining the "why"
- Do not mention "Claude Code" in commit messages
- Keep commits atomic and easy to review

### Common Prefixes

- ✨ `feat:` New features or significant additions
- 🐛 `fix:` Bug fixes
- ♻️ `refactor:` Code restructuring without behavior changes
- 🎨 `style:` UI/UX improvements, formatting
- ⚡ `perf:` Performance improvements
- 📝 `docs:` Documentation updates
- 🔧 `chore:` Maintenance, configs, dependencies

## shadcn/ui Configuration

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

Add new shadcn components: `npx shadcn@latest add <component>`

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=your_project_id  # For type generation
```

## Key Patterns

### Data Fetching
- Use TanStack Query hooks from `src/lib/region-queries.ts`
- Server components prefetch and dehydrate query data
- Client components hydrate from server-rendered data

### Component Organization
- UI components in `components/ui/` (shadcn primitives)
- Feature components in domain folders (charts/, map/, filters/)
- Colocate related components (e.g., region-stats/cards/, region-stats/tabs/)

### State Management
- URL state for filters (searchParams)
- TanStack Query for server state
- React Context for theme and providers only

### Styling
- Use `cn()` utility for conditional classes
- Tailwind utilities over custom CSS
- CSS variables for theme colors
- Dark mode classes: `dark:*`

## Task Master Integration

Task Master development workflow is available. See `.taskmaster/CLAUDE.md` for commands and integration details.

---

**Current Status**: ~136 TypeScript files, fully functional analytics dashboard with maps, charts, and filtering.
