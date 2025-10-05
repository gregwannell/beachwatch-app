# Future Refactoring Tasks

**Created:** October 5, 2025
**Purpose:** Document technical debt and improvements needed after beta deployment

---

## 🔴 CRITICAL - Type Safety Issues

### 1. Supabase Conditional Select Types

**Problem:**
API routes use conditional select statements that create complex TypeScript inference issues. The type system cannot properly infer which fields are present based on runtime conditions.

**Current Workaround:**
- TypeScript strict mode disabled (`"strict": false` in tsconfig.json)
- Build errors ignored (`ignoreBuildErrors: true` in next.config.ts)
- Using `select('*')` instead of conditional selects in some routes

**Affected Files:**
- `src/app/api/regions/route.ts`
- `src/app/api/regions/[id]/route.ts`
- `src/app/api/regions/hierarchy/route.ts`
- All analytics API routes

**Proper Solution:**

#### Option 1: Type Guards with Explicit Types
```typescript
// Define explicit return types
type RegionWithGeometry = Tables<'regions'> & { geometry: GeoJSON }
type RegionWithoutGeometry = Omit<Tables<'regions'>, 'geometry'>

// Use type guards
function hasGeometry(region: unknown): region is RegionWithGeometry {
  return typeof region === 'object' && region !== null && 'geometry' in region
}

// Apply in routes
const { data: region } = includeGeometry
  ? await supabase.from('regions').select('*').eq('id', regionId).single()
  : await supabase.from('regions').select('id, name, parent_id, type, code, has_data').eq('id', regionId).single()

if (includeGeometry && hasGeometry(region)) {
  // TypeScript now knows geometry exists
  const isValid = validateRegionGeometry(region.geometry)
}
```

#### Option 2: Separate Query Functions
```typescript
async function fetchRegionWithGeometry(id: number) {
  return supabase
    .from('regions')
    .select('*')
    .eq('id', id)
    .single()
}

async function fetchRegionWithoutGeometry(id: number) {
  return supabase
    .from('regions')
    .select('id, name, parent_id, type, code, has_data, created_at, updated_at')
    .eq('id', id)
    .single()
}

// Then use appropriate function
const { data: region } = includeGeometry
  ? await fetchRegionWithGeometry(regionId)
  : await fetchRegionWithoutGeometry(regionId)
```

#### Option 3: Use Supabase Generated Types with Generics
```typescript
import type { Database } from '@/lib/database.types'

type RegionRow = Database['public']['Tables']['regions']['Row']

// Define specific query result types
type RegionWithGeometry = Pick<RegionRow, 'id' | 'name' | 'geometry' | 'parent_id' | 'type'>
type RegionBasic = Pick<RegionRow, 'id' | 'name' | 'parent_id' | 'type'>

// Use explicit casting after validation
const { data } = await supabase.from('regions').select('*').eq('id', regionId).single()
const region = data as RegionWithGeometry | RegionBasic
```

**Estimated Effort:** 4-6 hours
**Priority:** High (affects code maintainability and type safety)

---

## 🟡 HIGH PRIORITY - ESLint & Code Quality

### 2. Unused Variables and Imports

**Problem:**
Multiple files have unused imports and variables that were downgraded to warnings.

**Affected Files:**
- `src/app/api/analytics/materials/route.ts` - unused `Tables` import
- `src/app/api/analytics/sources/route.ts` - unused `Tables` import
- `src/app/api/regions/route.ts` - unused `Tables` import
- `src/app/api/regions/[id]/route.ts` - unused `Tables` import
- `src/components/auth/login-form.tsx` - unused `error` variable
- `src/components/charts/donut-pie-chart.tsx` - unused `description` prop
- `src/components/charts/interactive-pie-chart.tsx` - unused `height` prop
- `src/components/charts/litter-trend-chart.tsx` - unused `_yearOverYearChange` prop
- `src/components/landing/hero-section.tsx` - unused icon imports
- `src/components/layout/main-layout.tsx` - unused `Waves` and `regionData`
- `src/components/region-stats/region-stats-content.tsx` - unused imports
- `src/components/region-stats/year-over-year-badge.tsx` - unused `Arrow` import
- `src/hooks/use-region-info.ts` - unused `regionId` variable
- `src/hooks/use-region-queries.ts` - unused `useMutation` and `Tables`

**Solution:**
1. Remove unused imports completely
2. Remove or use unused variables
3. Consider if props marked as unused should be removed from interfaces

**Estimated Effort:** 1-2 hours
**Priority:** Medium (code cleanliness)

### 3. Explicit Any Types

**Problem:**
Multiple uses of `any` type that reduce type safety.

**Affected Files:**
- `src/app/api/analytics/sources/route.ts:188` - Explicit any in transformation
- `src/app/api/regions/[id]/route.ts:64, 68` - Geometry modification
- `src/components/charts/litter-trend-chart.tsx:130` - Chart props
- `src/lib/analytics-validation.ts:139` - Data validation

**Solution:**
Define proper types for each use case instead of using `any`.

**Example:**
```typescript
// Instead of
const response: any = { ... }

// Use
type ApiResponse = {
  region: RegionData
  boundaryData?: BoundaryData
  children?: RegionData[]
}
const response: ApiResponse = { ... }
```

**Estimated Effort:** 2-3 hours
**Priority:** Medium (type safety)

---

## 🟢 MEDIUM PRIORITY - Best Practices

### 4. React Hooks Dependencies

**Problem:**
Missing dependencies in useEffect hooks.

**Affected Files:**
- `src/components/map/uk-map.tsx:194` - Missing `zoomToRegion` dependency
- `src/components/providers/supabase-query-provider.tsx:164` - Ref dependency issue

**Solution:**
1. Add missing dependencies to dependency arrays
2. Use `useCallback` where appropriate to stabilize function references
3. Consider if effects need to be split

**Estimated Effort:** 1 hour
**Priority:** Low (works correctly but violates React rules)

### 5. Next.js Image Optimization

**Problem:**
Using `<img>` tag instead of Next.js `<Image>` component.

**Affected Files:**
- `src/components/layout/main-layout.tsx:35` - MCS logo

**Solution:**
Replace `<img>` with Next.js `<Image>` component for automatic optimization.

```typescript
import Image from 'next/image'

// Replace
<img src="/MCS_logo_Stacked_Ink.png" alt="..." className="h-8" />

// With
<Image
  src="/MCS_logo_Stacked_Ink.png"
  alt="Marine Conservation Society"
  width={120}
  height={32}
  className="h-8"
/>
```

**Estimated Effort:** 30 minutes
**Priority:** Low (performance optimization)

---

## 🔵 LOW PRIORITY - Performance Optimizations

### 6. Large Image Assets

**Problem:**
Large PNG images in public folder affecting initial page load.

**Files:**
- `public/Littered Beach Full Scene.png` (5.4MB)
- `public/Littered Beach Foreground M 2500.png` (3.2MB)
- `public/Landscape_Animated_Logo_Reveal 2.mp4` (1.7MB)

**Solution:**
1. Convert PNGs to WebP format (90% size reduction)
2. Consider lazy loading for below-the-fold images
3. Generate multiple sizes for responsive images

**Commands:**
```bash
# Convert to WebP
npx @squoosh/cli --webp auto public/Littered*.png

# Or use sharp
npm install sharp
node -e "require('sharp')('input.png').webp({quality: 80}).toFile('output.webp')"
```

**Estimated Effort:** 1 hour
**Priority:** Low (user experience improvement)

### 7. Remove Unused Default Files

**Problem:**
Next.js default SVG files still in public folder.

**Files to Remove:**
- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`

**Solution:**
```bash
rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

**Estimated Effort:** 5 minutes
**Priority:** Very Low (minimal impact)

---

## 📋 Refactoring Checklist

### Phase 1: Type Safety (4-6 hours)
- [ ] Refactor API routes to use explicit types
- [ ] Implement type guards for conditional selects
- [ ] Re-enable TypeScript strict mode
- [ ] Remove `ignoreBuildErrors` from next.config.ts
- [ ] Test all API endpoints with proper types

### Phase 2: Code Quality (2-4 hours)
- [ ] Remove all unused imports and variables
- [ ] Replace `any` types with proper types
- [ ] Fix React hooks dependencies
- [ ] Re-enable strict ESLint rules
- [ ] Run full lint check and fix remaining issues

### Phase 3: Performance (1-2 hours)
- [ ] Optimize large images to WebP
- [ ] Replace `<img>` with Next.js `<Image>`
- [ ] Remove unused default files
- [ ] Test page load performance

### Phase 4: Testing
- [ ] Run full build with strict checks enabled
- [ ] Test all API routes
- [ ] Verify type safety across application
- [ ] Performance testing with optimized images

---

## 🚀 Deployment Impact

**Current State:**
- ✅ Builds successfully on Vercel
- ✅ All features work correctly at runtime
- ⚠️ Type safety temporarily disabled
- ⚠️ Some code quality issues masked

**After Refactoring:**
- ✅ Full TypeScript type safety
- ✅ Strict ESLint compliance
- ✅ Better performance
- ✅ Improved maintainability
- ✅ Easier to onboard new developers

---

## 💡 Recommendations

1. **Schedule refactoring after beta feedback**
   - Current code works correctly
   - Type issues don't affect runtime behavior
   - Better to gather user feedback first

2. **Prioritize type safety first**
   - Enables better IDE support
   - Catches bugs earlier
   - Critical for team development

3. **Create tests before refactoring**
   - Ensures refactoring doesn't break functionality
   - Validates API contracts
   - Regression testing

4. **Consider automated tools**
   - Use TypeScript's `--noUncheckedIndexedAccess`
   - Consider stricter ESLint rules
   - Set up pre-commit hooks for quality checks

---

## 📊 Estimated Total Effort

| Phase | Time | Priority |
|-------|------|----------|
| Type Safety | 4-6 hours | High |
| Code Quality | 2-4 hours | Medium |
| Performance | 1-2 hours | Low |
| Testing | 2-3 hours | High |
| **Total** | **9-15 hours** | - |

**Recommended Timeline:** 2-3 development days after beta launch

---

## ✅ Success Criteria

Refactoring is complete when:
- [ ] `npm run build` succeeds with no errors or warnings
- [ ] `tsconfig.json` has `"strict": true`
- [ ] `next.config.ts` has no `ignoreBuildErrors` or `ignoreDuringBuilds`
- [ ] ESLint shows 0 errors and 0 warnings
- [ ] All API routes have proper TypeScript types
- [ ] All tests pass
- [ ] Lighthouse score improves by at least 5 points
