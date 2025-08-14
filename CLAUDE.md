# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.6 application called "beachwatch-app" built with TypeScript and React 19. The project uses the App Router architecture and includes shadcn/ui component library integration with Tailwind CSS for styling.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Architecture & Structure

### Core Framework Stack

- **Next.js 15** with App Router (`src/app/` directory)
- **TypeScript** with strict mode enabled
- **React 19** with font optimization using Geist fonts
- **Tailwind CSS v4** for styling with PostCSS

### UI Component System

- **shadcn/ui** configured (see `components.json`)
- Uses "new-york" style with CSS variables
- Components aliased to `@/components`, utils to `@/lib/utils`
- **Lucide React** for icons
- Utility function `cn()` in `src/lib/utils.ts` for className merging

### File Structure

```
src/
├── app/           # Next.js App Router pages and layouts
│   ├── layout.tsx # Root layout with font configuration
│   ├── page.tsx   # Home page
│   └── globals.css # Global Tailwind styles
└── lib/
    └── utils.ts   # Utility functions (cn helper)
```

### Path Aliases

TypeScript configured with `@/*` mapping to `./src/*` for clean imports.

### ESLint Configuration

Uses Next.js recommended ESLint config with TypeScript support (`next/core-web-vitals` and `next/typescript`).
