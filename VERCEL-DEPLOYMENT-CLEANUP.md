# Vercel Deployment Cleanup Checklist

**Prepared:** October 5, 2025
**Purpose:** Beta deployment preparation - Clean codebase for initial Vercel deployment

---

## 🔴 CRITICAL - Must Remove (Security & Credentials)

### 1. Database Credentials in Script Files
**Location:** `scripts/import/import-data.bat`
**Issue:** Contains hardcoded Supabase database password and connection details
**Action:** ✅ Already gitignored, but verify it's not committed
```bash
# Verify not in git
git ls-files | grep import-data.bat
```
**Status:** Should return nothing (already in .gitignore)

### 2. MCP Configuration with Access Token
**Location:** `.mcp.json`
**Issue:** Contains Supabase access token (`sbp_aaeb5b5a9c91cf6daac6722c479a64e4502c0ffd`)
**Action:** ✅ Verify this file is gitignored
```bash
# Check if in git
git ls-files | grep .mcp.json
```
**Recommendation:** Keep locally but ensure never committed

### 3. Environment Variables File
**Location:** `.env.local`
**Issue:** Contains Supabase URL and anon key (public anon key is OK, but still best practice)
**Action:** ✅ Already gitignored - verified safe
**Note:** Vercel will use its own environment variables

---

## 🟡 HIGH PRIORITY - Should Remove (Development/Test Code)

### 1. Test Database Page
**Location:** `src/app/test-db/page.tsx`
**Purpose:** Database connection testing page
**Issue:** Exposes internal DB structure and connection testing to production
**Action:** DELETE entire directory
```bash
rm -rf src/app/test-db
```
**Rationale:** This creates a public route at `/test-db` that shows database structure

### 2. Chart Test Component
**Location:** `src/components/charts/chart-test.tsx`
**Purpose:** Manual chart testing component
**Issue:** Not used in production, adds unnecessary bundle size
**Action:** DELETE file
```bash
rm src/components/charts/chart-test.tsx
```
**Rationale:** 134 lines of test code not used in production

### 3. Geometry Validation Test File
**Location:** `src/lib/__tests__/geometry-validation-test.ts`
**Purpose:** Development testing for geometry validation
**Issue:** Not a proper unit test, contains console.log statements
**Action:** DELETE entire `__tests__` directory
```bash
rm -rf src/lib/__tests__
```
**Rationale:** 44 console.log statements, manual test code

---

## 🟢 MEDIUM PRIORITY - Clean Up (Debug & Development)

### 1. Console.log Statements
**Issue:** Multiple debug console.log statements throughout codebase
**Locations:**
- `src/app/explore/page.tsx` (2 instances - map debugging)
- `src/components/charts/interactive-pie-chart.tsx` (2 instances - click debugging)
- `src/components/providers/supabase-query-provider.tsx` (3 instances - subscription debugging)
- `src/lib/cache-strategies.ts` (6 instances - cache optimization logging)

**Action:** Remove or comment out debug logs
**Priority:** Medium - won't break functionality but unprofessional in production

**Recommended approach:**
```typescript
// Replace console.log with conditional logging
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log(...)
```

### 2. Console.error/console.warn in API Routes
**Location:** All API route files
**Issue:** Server-side logging via console.error
**Status:** ✅ KEEP THESE - Important for Vercel logs/debugging
**Note:** These are appropriate for production error tracking

---

## 🔵 LOW PRIORITY - Optional Improvements

### 1. Development Documentation
**Locations:**
- `.docs/` directory (design guide, PRD, database design)
- `database/` directory (schema, README, ERD)
- `.taskmaster/` directory (task management)
- `.claude/` directory (Claude Code configuration)

**Action:** ✅ KEEP - Already gitignored where needed
**Rationale:** Useful for future development, doesn't affect production build

### 2. README.md
**Location:** Root `README.md`
**Issue:** Generic Next.js boilerplate
**Action:** OPTIONAL - Update with project-specific info
**Priority:** Low - doesn't affect deployment

### 3. TypeScript Build Info
**Location:** `tsconfig.tsbuildinfo`
**Action:** ✅ Already gitignored
**Status:** Safe - won't deploy to Vercel

---

## ✅ VERIFIED SAFE - Already Protected

1. **`.gitignore`** - Properly configured:
   - ✅ `.env*` files ignored
   - ✅ `node_modules/` ignored
   - ✅ `.next/` build directory ignored
   - ✅ `*.log` files ignored
   - ✅ Database credentials (`.load`, `import-data.bat`) ignored

2. **Build Files** - Automatically excluded:
   - `.next/` directory (development builds)
   - `node_modules/` (not deployed)

3. **Environment Variables** - Proper handling:
   - Local: `.env.local` (gitignored)
   - Production: Set in Vercel dashboard

---

## 📋 Cleanup Action Plan

### IMMEDIATE (Before Deployment)
```bash
# 1. Remove test database page
rm -rf src/app/test-db

# 2. Remove chart test component
rm src/components/charts/chart-test.tsx

# 3. Remove test directory
rm -rf src/lib/__tests__

# 4. Verify credentials not in git
git ls-files | grep -E "(\.env|import-data\.bat|\.mcp\.json)"
# Should return nothing

# 5. Check git status
git status
```

### RECOMMENDED (Clean Debug Logs)
- Review and remove/conditionally wrap console.log statements in:
  - `src/app/explore/page.tsx`
  - `src/components/charts/interactive-pie-chart.tsx`
  - `src/components/providers/supabase-query-provider.tsx`
  - `src/lib/cache-strategies.ts`

### OPTIONAL (Polish)
- Update README.md with project description
- Add deployment documentation

---

## 🚀 Vercel Configuration Checklist

### Environment Variables to Set in Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://qxazrlwwaxtvbpkigbrl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_PROJECT_ID=qxazrlwwaxtvbpkigbrl
```

### Build Configuration
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (automatic)
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### Vercel.json (Optional)
Not required - Next.js has automatic configuration

---

## 🔍 Post-Deployment Verification

After deploying, test these routes are NOT accessible:
- ❌ `/test-db` - Should return 404 (after removal)

Verify these routes ARE working:
- ✅ `/` - Hero/landing page
- ✅ `/login` - Login page
- ✅ `/explore` - Main data explorer (requires auth)

---

## 📊 Cleanup Summary

| Category | Files | Action | Impact |
|----------|-------|--------|--------|
| Security | `.env.local`, `.mcp.json`, `import-data.bat` | Verify gitignored | ✅ Protected |
| Test Pages | `src/app/test-db/` | DELETE | Removes exposed DB test route |
| Test Components | `chart-test.tsx`, `__tests__/` | DELETE | Reduces bundle size ~150 lines |
| Debug Logs | 13 console.log statements | Clean up | Professional appearance |
| Documentation | `.docs/`, `database/`, `.claude/` | KEEP | Useful for development |

**Total Estimated Impact:** ~15 files/statements to clean

---

## ⚠️ Important Notes

1. **Supabase Anon Key**: The anon key in `.env.local` is meant to be public-facing, but still keep it in env vars for best practice
2. **MCP Server**: `.mcp.json` is for local Claude Code development only - won't affect deployment
3. **Database Scripts**: Keep `scripts/import/` for your records, but they're gitignored
4. **Console Errors**: Keep `console.error` in API routes - these are useful for Vercel logs

---

## ✨ Ready for Deployment

After completing the IMMEDIATE actions above, your codebase will be:
- ✅ Free of exposed test routes
- ✅ Free of unnecessary test code
- ✅ Credentials properly protected
- ✅ Ready for beta testing on Vercel

**Estimated cleanup time:** 5-10 minutes
