# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.6 application called "beachwatch-app" built with TypeScript and React 19. The project is designed for tracking beach litter data with a PostgreSQL database backend. It uses the App Router architecture and includes a comprehensive shadcn/ui component library integration with Tailwind CSS v4 for styling.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Architecture & Structure

### Core Framework Stack

- **Next.js 15.4.6** with App Router (`src/app/` directory)
- **TypeScript** with strict mode enabled
- **React 19.1.0** with font optimization using Geist fonts
- **Tailwind CSS v4** with PostCSS integration
- **PostgreSQL** database for beach litter data storage

### Dependencies & Libraries

#### Core Dependencies
- **class-variance-authority** (0.7.1) - For component variant management
- **clsx** (2.1.1) - Conditional className utility
- **lucide-react** (0.539.0) - Icon library
- **tailwind-merge** (3.3.1) - Tailwind class merging utility

#### Development Dependencies
- **@tailwindcss/postcss** (v4) - PostCSS integration for Tailwind
- **tw-animate-css** (1.3.6) - CSS animation utilities

### UI Component System

- **shadcn/ui** fully configured with comprehensive setup
- **Style**: "new-york" design system
- **CSS Variables**: Enabled for theming support
- **Base Color**: Neutral palette
- **Icon Library**: Lucide React
- **RSC Support**: React Server Components enabled
- **TypeScript**: Full TSX support

#### shadcn/ui Configuration (components.json)
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
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### Styling System

#### Tailwind CSS v4 Setup
- **PostCSS Integration**: Uses `@tailwindcss/postcss` plugin
- **CSS Variables**: Extensive design token system with light/dark mode support
- **Animation Support**: tw-animate-css for enhanced animations
- **Custom Theme**: Inline theme configuration with comprehensive color palette

#### CSS Variables Architecture
The project uses a sophisticated CSS variables system defined in `src/app/globals.css`:
- **Color System**: Background, foreground, primary, secondary, muted, accent, destructive
- **Component Colors**: Card, popover, sidebar, chart colors (1-5)
- **Interactive States**: Border, input, ring colors
- **Radius System**: sm, md, lg, xl variants
- **Dark Mode**: Complete dark theme with automatic switching

#### Utility Functions
- **cn()** in `src/lib/utils.ts`: Combines clsx and tailwind-merge for optimal className handling
- Enables conditional classes and automatic Tailwind conflict resolution

### File Structure

```
src/
├── app/               # Next.js App Router pages and layouts
│   ├── layout.tsx     # Root layout with Geist font configuration
│   ├── page.tsx       # Home page
│   ├── globals.css    # Tailwind v4 + CSS variables + dark mode
│   └── favicon.ico    # App icon
├── lib/
│   └── utils.ts       # Utility functions (cn helper for className merging)
├── components/        # shadcn/ui components (when added)
│   └── ui/           # Base UI components
└── hooks/            # Custom React hooks (when added)
```

### Database

The project includes PostgreSQL setup for beach litter data tracking, as indicated by recent commits. Database schema and migrations are configured for comprehensive environmental data collection.

### Path Aliases

TypeScript configured with comprehensive path mapping:
- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/lib` → `./src/lib`
- `@/utils` → `./src/lib/utils`
- `@/ui` → `./src/components/ui`
- `@/hooks` → `./src/hooks`

### ESLint Configuration

Uses Next.js recommended ESLint config with TypeScript support (`next/core-web-vitals` and `next/typescript`) via flat config format in `eslint.config.mjs`.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
