# Vercel Deployment Checklist - Beta Release

This checklist guides you through deploying the beachwatch-app to Vercel for beta testing.

---

## Phase 1: Repository Cleanup

### Remove Development Folders from Git

- [ ] **Remove `.taskmaster/` and `.docs/` from git tracking**
  ```bash
  git rm -r --cached .taskmaster/
  git rm -r --cached .docs/
  ```

- [ ] **Commit the changes**
  ```bash
  git commit -m "chore: remove development folders from version control"
  ```

- [ ] **Push to GitHub**
  ```bash
  git push origin master
  ```

- [ ] **Verify removal**
  - Check GitHub repository - folders should no longer appear in file browser
  - Verify `.gitignore` contains both folders (lines 28-29)

---

## Phase 2: Environment Variables Configuration

### Required Variables (App won't work without these)

- [ ] **`NEXT_PUBLIC_SUPABASE_URL`**
  - Value: `https://qxazrlwwaxtvbpkigbrl.supabase.co`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Purpose: Supabase project URL for client and server

- [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  - Value: Get from your `.env.local` file or Supabase Dashboard → Settings → API → anon/public key
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Purpose: Public API key for Supabase client connections
  - Security: Safe to expose (public key with RLS protection)

### Optional but Recommended Variables

- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** (Optional)
  - Value: Get from Supabase Dashboard → Settings → API → service_role key (secret)
  - Environments: ✅ Production, ✅ Preview, ⬜ Development
  - Purpose: Server-side operations that bypass RLS policies
  - Security: ⚠️ **NEVER commit to git** - Keep this secret!
  - Note: App has fallback to anon key if not provided

- [ ] **`SUPABASE_PROJECT_ID`**
  - Value: `qxazrlwwaxtvbpkigbrl`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Purpose: Internal tracking/logging

### How to Get Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `qxazrlwwaxtvbpkigbrl`
3. Navigate to **Settings** → **API**
4. Copy the required keys:
   - **URL**: Under "Project URL"
   - **anon/public key**: Under "Project API keys" → anon/public
   - **service_role key**: Under "Project API keys" → service_role (click to reveal)

---

## Phase 3: Pre-Deployment Verification

### Local Testing

- [ ] **Test production build locally**
  ```bash
  npm run build
  npm run start
  ```
  - Navigate to `http://localhost:3000`
  - Verify app loads without errors

- [ ] **Run linting**
  ```bash
  npm run lint
  ```
  - Fix any errors before deploying

- [ ] **Test Supabase connection**
  - Open browser console (F12)
  - Navigate to explore page or any page using Supabase
  - Verify no connection errors
  - Check that data loads correctly

- [ ] **Verify environment variables**
  ```bash
  # Check .env.local has all required variables
  cat .env.local
  ```

### TypeScript & Code Quality

- [ ] **Type checking passes**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **No console errors in development**
  - Run `npm run dev`
  - Open browser console
  - Navigate through key pages
  - Fix any errors/warnings

---

## Phase 4: Vercel Deployment

### Initial Setup

- [ ] **Connect GitHub repository to Vercel**
  1. Go to [vercel.com](https://vercel.com)
  2. Click "Add New..." → "Project"
  3. Import your GitHub repository: `beachwatch-app`
  4. Select the repository

- [ ] **Configure build settings**
  - Framework Preset: **Next.js** (should auto-detect)
  - Root Directory: `./` (leave as default)
  - Build Command: `npm run build` (default)
  - Output Directory: `.next` (default)
  - Install Command: `npm install` (default)
  - Node.js Version: **20.x** or higher

### Environment Variables in Vercel

- [ ] **Add environment variables in Vercel Dashboard**
  1. In your Vercel project → **Settings** → **Environment Variables**
  2. Add each variable:

  **Required:**
  ```
  NEXT_PUBLIC_SUPABASE_URL = https://qxazrlwwaxtvbpkigbrl.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
  ```

  **Optional but Recommended:**
  ```
  SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
  SUPABASE_PROJECT_ID = qxazrlwwaxtvbpkigbrl
  ```

  3. For each variable, select environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (for NEXT_PUBLIC_* variables)

### Deploy

- [ ] **Trigger first deployment**
  - Click "Deploy" button
  - Wait for build to complete (usually 1-3 minutes)
  - Monitor build logs for errors

- [ ] **Verify deployment success**
  - Check deployment status shows "Ready"
  - Note the deployment URL (e.g., `beachwatch-app.vercel.app`)

### Domain Configuration (Optional)

- [ ] **Add custom domain (if desired)**
  1. Go to project **Settings** → **Domains**
  2. Add your custom domain
  3. Follow DNS configuration instructions
  4. Wait for SSL certificate provisioning

---

## Phase 5: Post-Deployment Testing

### Functional Testing

- [ ] **Visit deployed URL**
  - Open `https://[your-app].vercel.app`
  - Verify homepage loads correctly

- [ ] **Test key pages**
  - [ ] Homepage (`/`)
  - [ ] Explore page (`/explore`)
  - [ ] Any other critical pages

- [ ] **Test Supabase connection in production**
  - Open browser console (F12)
  - Navigate to explore page
  - Verify data loads from Supabase
  - Check for any API errors in console

- [ ] **Test on different devices**
  - [ ] Desktop browser
  - [ ] Mobile browser (responsive design)
  - [ ] Tablet (if applicable)

### Performance Verification

- [ ] **Check Core Web Vitals**
  - Use [PageSpeed Insights](https://pagespeed.web.dev/)
  - Paste your Vercel URL
  - Verify acceptable scores:
    - LCP (Largest Contentful Paint): < 2.5s
    - FID (First Input Delay): < 100ms
    - CLS (Cumulative Layout Shift): < 0.1

- [ ] **Test loading speed**
  - First load should be reasonably fast
  - Subsequent navigations should be instant (Next.js prefetching)

### Error Monitoring

- [ ] **Check Vercel deployment logs**
  - Go to project → **Deployments** → Select latest → **Function Logs**
  - Look for any runtime errors

- [ ] **Check browser console**
  - Navigate through app
  - Verify no console errors or warnings

---

## Phase 6: Beta Release Preparation

### Access & Sharing

- [ ] **Prepare beta testing URL**
  - Production URL: `https://[your-app].vercel.app`
  - Or custom domain if configured

- [ ] **Create beta tester list**
  - Document who will test
  - Prepare instructions for testers

- [ ] **Set up feedback collection**
  - [ ] Create feedback form (Google Forms, Typeform, etc.)
  - [ ] Add feedback link to app (optional)
  - [ ] Prepare bug report template

### Monitoring Setup

- [ ] **Enable Vercel Analytics (Optional)**
  1. Go to project → **Analytics**
  2. Enable Web Analytics
  3. Monitor visitor data

- [ ] **Set up error tracking (Optional but Recommended)**
  - Consider integrating:
    - [Sentry](https://sentry.io) for error tracking
    - [LogRocket](https://logrocket.com) for session replay
    - Or Vercel's built-in monitoring

### Database Considerations

- [ ] **Review Supabase RLS policies**
  - Ensure Row Level Security policies are properly configured
  - Test that users can only access appropriate data
  - Verify anonymous access works as expected

- [ ] **Check Supabase usage limits**
  - Review your Supabase plan limits
  - Monitor usage during beta
  - Upgrade plan if needed before launch

### Documentation

- [ ] **Prepare beta release notes**
  - Document known issues
  - List features available in beta
  - Set expectations for testers

- [ ] **Create user guide (if needed)**
  - How to use the app
  - What to test
  - How to report bugs

---

## Phase 7: Go Live Checklist

### Final Verifications

- [ ] **All environment variables are set correctly**
- [ ] **Build succeeds without warnings**
- [ ] **All tests pass** (if you have automated tests)
- [ ] **No sensitive data in codebase**
- [ ] **`.taskmaster/` and `.docs/` removed from git**
- [ ] **`.gitignore` is properly configured**

### Launch

- [ ] **Share beta URL with testers**
- [ ] **Monitor initial traffic and errors**
- [ ] **Be available for quick fixes**

### Post-Launch Monitoring (First 24-48 Hours)

- [ ] **Check Vercel deployment logs daily**
- [ ] **Monitor Supabase usage/errors**
- [ ] **Collect and triage beta feedback**
- [ ] **Address critical bugs immediately**

---

## Troubleshooting

### Common Issues

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Test `npm run build` locally first

**Environment variables not working:**
- Ensure variable names are exact (case-sensitive)
- NEXT_PUBLIC_* variables must be set at build time
- Redeploy after adding/changing variables

**Supabase connection errors:**
- Verify URL and keys are correct
- Check Supabase project is active
- Review RLS policies

**404 errors on page refresh:**
- Vercel should handle this automatically with Next.js
- Check `vercel.json` if you have custom routing

---

## Rollback Plan

If you need to rollback:

1. Go to Vercel Dashboard → **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**
4. Instant rollback complete

---

## Security Reminders

- ✅ **Never commit `.env*` files** (already in `.gitignore`)
- ✅ **Never commit `SUPABASE_SERVICE_ROLE_KEY`**
- ✅ **NEXT_PUBLIC_* variables are safe to expose** (they're in client bundle)
- ⚠️ **Review Supabase RLS policies before going live**
- ⚠️ **Monitor for unusual database activity**

---

## Post-Beta Next Steps

After successful beta testing:

- [ ] Collect and analyze feedback
- [ ] Fix identified bugs
- [ ] Optimize performance based on real usage
- [ ] Plan for production launch
- [ ] Set up production monitoring
- [ ] Configure custom domain (if not done in beta)
- [ ] Plan scaling strategy

---

## Quick Reference

### Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Run linter
npm run lint

# Remove folders from git
git rm -r --cached .taskmaster/ .docs/
```

### Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Next.js Deployment Docs: https://nextjs.org/docs/deployment
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

---

**Last Updated:** 2025-10-06
**Status:** Ready for Beta Deployment ✅
