# GitHub Actions Workflows

## Keep Supabase Active

**File:** `keep-supabase-active.yml`

### Purpose

This workflow automatically pings the Supabase database daily to prevent the Free Plan project from being paused due to inactivity.

### How It Works

- **Schedule:** Runs every day at 12:00 UTC (noon)
- **Action:** Makes a simple REST API query to the `regions` table (fetches only 1 row)
- **Result:** Counts as database activity, preventing auto-pausing

### Setup Instructions

#### 1. Add GitHub Secrets

Go to your repository settings and add the following secrets:

**URL:** https://github.com/gregwannell/beachwatch-app/settings/secrets/actions

Add these two secrets:

| Secret Name | Value |
|------------|-------|
| `SUPABASE_URL` | `https://qxazrlwwaxtvbpkigbrl.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key (from `.env.local`) |

**Steps:**
1. Click "New repository secret"
2. Enter the secret name (e.g., `SUPABASE_URL`)
3. Paste the value
4. Click "Add secret"
5. Repeat for `SUPABASE_ANON_KEY`

#### 2. Verify Setup

After adding secrets, you can:

1. **Wait for automatic run:** The workflow will run automatically at the next scheduled time (12:00 UTC daily)
2. **Manual trigger:** Test it immediately:
   - Go to the [Actions tab](https://github.com/gregwannell/beachwatch-app/actions)
   - Click "Keep Supabase Active" workflow
   - Click "Run workflow" button
   - Select the branch (usually `main`)
   - Click "Run workflow"

#### 3. Monitor Status

- Check the [Actions tab](https://github.com/gregwannell/beachwatch-app/actions) to see workflow runs
- Green checkmark ✅ = successful ping
- Red X ❌ = failed (check logs for details)

### Troubleshooting

#### Workflow fails with "Failed to ping Supabase database"

**Possible causes:**
- GitHub secrets not configured correctly
- Supabase project is paused (restore it manually first)
- Network connectivity issues
- RLS policies blocking anonymous access to `regions` table

**Solutions:**
1. Verify secrets are added correctly in GitHub settings
2. Check Supabase dashboard to ensure project is active
3. Verify the `regions` table allows SELECT queries with RLS enabled
4. Check workflow logs for detailed error messages

#### Want to change the ping schedule?

Edit the `cron` expression in `keep-supabase-active.yml`:

```yaml
schedule:
  - cron: '0 12 * * *'  # Current: Daily at 12:00 UTC
```

Examples:
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * *'` - Daily at midnight UTC
- `'0 8,20 * * *'` - Twice daily at 8:00 and 20:00 UTC

**Note:** More frequent runs use more GitHub Actions minutes, but Free tier includes 2,000 minutes/month which is more than sufficient for daily pings.

### Cost

This workflow uses GitHub Actions Free tier:
- **Free tier:** 2,000 minutes/month
- **This workflow:** ~1 minute/day = ~30 minutes/month
- **Remaining:** 1,970 minutes for other workflows

✅ Completely free within GitHub's generous limits!

### Alternative: Upgrade to Pro Plan

If you prefer not to maintain this workaround, consider upgrading your Supabase organization to the Pro Plan ($25/month):
- Projects never get paused
- Higher usage quotas
- Automated backups
- Priority support

Learn more: https://supabase.com/pricing
