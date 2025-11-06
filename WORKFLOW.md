# Git Workflow Guide

## Branch Structure

- `main` - Production branch (deploys to production Vercel)
- `develop` - Development branch (deploys to preview/staging Vercel)
- `feature/*` - Feature branches (deploys to preview Vercel)

## Daily Development Workflow

### Starting a New Feature

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/my-new-feature

# Work on your feature...
# Make commits following the emoji commit convention from CLAUDE.md
git add .
git commit -m "✨ feat: add new feature"

# Push feature branch
git push -u origin feature/my-new-feature
```

### Creating a Pull Request

1. **Push your feature branch** to GitHub
2. **Open PR on GitHub**: `feature/my-new-feature` → `develop`
3. **Review the Vercel preview deployment** (auto-generated in PR)
4. **Test thoroughly** on the preview URL
5. **Merge PR** into `develop` when ready
6. **Delete feature branch** after merge (GitHub can do this automatically)

### Deploying to Production

When `develop` is stable and ready for production:

```bash
# Option A: Create a release PR
git checkout develop
git pull origin develop
# Open PR on GitHub: develop → main

# Option B: Direct merge (if you have permissions)
git checkout main
git pull origin main
git merge develop
git push origin main
```

**Important:** Always test on the `develop` preview deployment before merging to `main`!

### Hotfixes (Urgent Production Fixes)

For critical bugs in production:

```bash
# Branch from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Fix the bug
git add .
git commit -m "🐛 fix: resolve critical bug"

# Push and create PR to main
git push -u origin hotfix/critical-bug-fix
# Create PR: hotfix/critical-bug-fix → main

# After merging to main, also merge to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## Vercel Deployments

- **Production**: `main` branch
  - URL: Your production domain
  - Requires PR and approval
  - Only deploy stable, tested code

- **Preview/Staging**: `develop` branch
  - URL: `beachwatch-app-git-develop-*.vercel.app`
  - Test features before production
  - More relaxed deployment rules

- **Feature Previews**: `feature/*` branches
  - URL: `beachwatch-app-git-feature-name-*.vercel.app`
  - Automatic preview for each feature
  - Great for sharing work-in-progress

## Branch Protection Summary

### `main` (Production)
- ✅ Require PR with approvals
- ✅ Require status checks (Vercel, tests)
- ✅ Require conversation resolution
- ❌ No direct pushes
- ❌ No force pushes

### `develop` (Staging)
- ✅ Require status checks
- ⚠️ Optional: Require PR (can allow direct pushes for quick fixes)
- ✅ Default branch for new PRs

## Best Practices

1. **Always work in feature branches** - Never commit directly to `develop` or `main`
2. **Test on preview deployments** - Use Vercel preview URLs before merging
3. **Keep `develop` stable** - Don't merge broken features to `develop`
4. **Small, frequent PRs** - Easier to review and less risky
5. **Follow commit conventions** - Use emoji prefixes from CLAUDE.md
6. **Clean up branches** - Delete feature branches after merging
7. **Sync regularly** - Pull `develop` often to avoid conflicts

## Common Commands

```bash
# Switch branches
git checkout develop
git checkout main

# Update current branch
git pull origin develop

# See all branches
git branch -a

# Delete local feature branch
git branch -d feature/my-feature

# Delete remote feature branch
git push origin --delete feature/my-feature

# See what's different between branches
git diff develop main
git log develop..main
```

## Troubleshooting

### Merge Conflicts
```bash
# When pulling or merging causes conflicts
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "🔀 merge: resolve conflicts"
git push
```

### Reset Feature Branch to Match Develop
```bash
git checkout feature/my-feature
git fetch origin
git reset --hard origin/develop
# Warning: This discards all changes in the feature branch!
```

### Undo Last Commit (Not Pushed)
```bash
git reset --soft HEAD~1  # Keeps changes
# or
git reset --hard HEAD~1  # Discards changes
```

## Questions?

- Check CLAUDE.md for commit message conventions
- Check GitHub PR checks for deployment status
- Review Vercel dashboard for deployment logs
