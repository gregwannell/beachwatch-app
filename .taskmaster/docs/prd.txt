# Beachwatch Data Explorer – Functional & Technical Requirements

## 1. Introduction

This document defines the functional, non-functional, and technical requirements for the **Beachwatch Data Explorer**, a public-facing web application that visualises over 30 years of UK beach litter survey data collected by the Marine Conservation Society and its volunteers.

The purpose of this document is to provide a single, comprehensive reference for all stakeholders, including product managers, designers, developers, and data engineers. It consolidates the vision, scope, technical stack, and user expectations to ensure alignment across the delivery team.

---

## 2. Product Overview

The **Beachwatch Data Explorer** is an interactive, map-centric application designed to make environmental litter data accessible to the public. It allows users to explore trends, sources, and materials of litter on UK beaches, as well as see the impact of local cleanup efforts.

### Key Features

- Interactive UK map with selectable geographic regions down to county/unitary authority level.
- Visualisations of top litter items, average litter per 100m, breakdowns by source and material, and historical trends.
- Engagement statistics, such as the number of surveys and volunteers.
- Year-on-year comparisons with percentage change indicators.
- Real-time filtering by region, time period, and litter category.

---

## 3. Goals and Objectives

### Goals

- Increase public awareness of beach litter issues by providing transparent and accessible data.
- Empower individuals and communities to understand and respond to local litter trends.
- Highlight the efforts of volunteers and community groups in litter clean-up activities.

### Objectives

- Develop a performant, responsive, and intuitive public web application with no login requirements.
- Enable detailed exploration of litter data at multiple geographic levels.
- Support consistent annual data updates from CSV datasets.
- Provide export-ready charts and maps in future phases.

---

## 4. Target Audience

- **General public** – Interested in environmental health of UK beaches and cleanup campaign effectiveness.
- **Local community groups & volunteers** – Monitor impact and motivate continued engagement.
- **Educational institutions** – Teachers, students, and researchers using the data for awareness and projects.
- **Policy makers & NGOs** – Inform decision-making with evidence-based environmental insights.

---

## 5. Features and Requirements

### 5.1 Core Features

#### Map-Centric Navigation
- Interactive UK map with zoom, pan, and clickable regions (country, county, unitary authority).
- Region boundaries sourced from ONS Geoportal datasets.

#### Data Display
- Top 5 litter items per region (horizontal bar chart).
- Average litter per 100m.
- Breakdown by litter source (pie chart).
- Breakdown by material composition (pie chart).
- Historical trends (line chart) covering 30 years of data.
- Year-on-year percentage change for all metrics.

#### Filters & Controls
- Region selector (dropdown/search).
- Time period selector (single year or range).
- Category checkboxes for litter type/source filtering.
- Collapsible sidebar for filter controls.

#### Engagement Stats Panel
- Number of surveys.
- Number of volunteers.
- Total surveyed beach length.
- Always visible, updated dynamically when filters change.

#### Data Management
- Annual data refresh from CSV inputs.
- Pre-aggregated metrics stored in PostgreSQL for performance.

#### Future Phase
- Export charts/maps as images or PDFs.

---

## 6. User Stories and Acceptance Criteria

| ID     | User Story | Acceptance Criteria |
|--------|------------|---------------------|
| ST-101 | As a public user, I want to see an interactive map of the UK so that I can select my region of interest. | Map displays all UK regions with boundaries; regions highlight on hover; clicking a region opens its info card. |
| ST-102 | As a public user, I want to view the top 5 litter items for my selected region so I can understand the most common pollutants. | Bar chart displays top 5 items with counts and percentages; data updates when region changes. |
| ST-103 | As a public user, I want to filter data by year or range so I can see historical trends. | Filter control allows selecting single/multiple years; charts update in real-time. |
| ST-104 | As a public user, I want to filter by litter source and material so I can analyse specific waste categories. | Checkboxes for source/material update all visualisations; filters persist until reset. |
| ST-105 | As a public user, I want to see year-on-year percentage changes for metrics so I can quickly identify trends. | Percentage increase/decrease displayed next to each metric with color coding for up/down trends. |
| ST-106 | As a public user, I want to see engagement stats so I can understand the scale of volunteer involvement. | Panel shows number of surveys, volunteers, and total surveyed length; updates when filters change. |
| ST-107 | As a public user, I want to access the application without login so I can immediately explore data. | Application loads publicly without authentication prompts. |
| ST-109 | As a public user, I want tooltips when hovering over map regions so I can preview stats without clicking. | Tooltip shows region name and 2–3 key metrics; disappears when pointer leaves region. |
| ST-110 | As a public user, I want responsive design so I can use the app on my mobile phone. | All UI elements adapt to smaller screens; no horizontal scroll; map and filters usable via touch. |
| ST-111 | As a public user, I want to understand regions with no data so I am not confused by missing charts. | Regions with no survey data are visibly differentiated (e.g., hatched overlay) and show a "no data available" message in the info card. |

---

## 7. Technical Requirements / Stack

### Frontend
- React  
- Next.js (hybrid SSR/CSR)  
- Tailwind CSS  
- Shadcn/UI component library  
- Lucide icons  
- Sonner notifications  
- shadcn/ui charts for visualisation (built on Recharts with enhanced theming and accessibility)  

### Backend
- Next.js API routes  
- Prisma ORM  

### Database
- PostgreSQL (Supabase hosting)  
- Pre-aggregated annual metrics for performance  

### Mapping Library
- Leaflet with react-leaflet (open source, no API key required)  
- UK boundary GeoJSON from ONS Geoportal  

### Deployment
- Frontend + backend on Vercel  
- Supabase for database hosting  

### State Management
- React Query for server state (fetching, caching, sync)  
- Local state for UI interactions (filters, sidebar toggles)  

### Data Flow
1. User interacts with filters or map.  
2. Local filter state updates.  
3. React Query checks cache or fetches fresh data from API.  
4. API queries PostgreSQL via Prisma.  
5. JSON response updates charts, stats, and map.  

---

## 8. Design and User Interface

### Layout
- Map occupies ~70% of desktop width; full width on mobile.
- Engagement stats panel fixed to right side (desktop) or below map (mobile).
- Collapsible left sidebar for filters.
- Floating info card/modal opens when a region is selected.

### Interaction Patterns
- Hover highlights map regions with tooltip preview.
- Click selects region, opening detailed stats.
- Filters update visualisations in real-time.
- Timeline slider for year selection.

### Visual Style
- Light, neutral background.
- Blues and greens for environmental theme.
- Distinct but muted chart colors per category.
- Sans-serif typography (e.g., Inter).
- Rounded corners and soft shadows on cards.

### Accessibility
- High contrast text.
- Keyboard navigation for all interactive elements.
- ARIA roles and labels for assistive technologies.
- Colorblind-safe chart palettes with patterns/labels.
- Mobile-friendly tap targets.

### Responsive Behaviour
- Smooth collapse/expand of sidebar.
- Touch support for map and filters.
- Optimised for mobile performance on low-bandwidth networks.
