# 🔧 Troubleshooting Guide

## "Failed to load workout templates" Error

If you see this error after deployment, check the following:

### ⚠️ Important: Same database, but production is broken

If the database is the same for local and production, local works, but production stopped working after the last deploy, the cause is likely:

1. **Vercel environment variables** — They may have been reset or not applied after deploy
2. **Caching** — An old build may be cached
3. **Code changes** — New checks may have exposed an existing issue

### 1. ✅ Environment variables on Vercel (PRIORITY #1)

**This is the most common cause!** After deploy, environment variables may not be applied.

1. Open your project in Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. **Verify that variables exist and are set correctly:**
   - `NEXT_PUBLIC_SUPABASE_URL` — Full URL (e.g. `https://xxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Long JWT token (starts with `eyJ`)

4. **Check Environment:**
   - Ensure variables are set for **Production** (and **Preview** if needed)
   - Variables should be available for all environments or at least Production

5. **Important:** After checking or changing variables:
   - **Redeploy the project** (Redeploy)
   - Vercel may use an old build with cached variables

**How to get the values (if you need to double-check):**
- Open your project in Supabase Dashboard
- Go to **Settings** → **API**
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` (with or without `https://` — code will add it automatically)
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**URL format:**
- URL can include protocol: `https://wvlldvaibndedmerjssj.supabase.co`
- Or without protocol: `wvlldvaibndedmerjssj.supabase.co` (code will add `https://` automatically)
- Both work thanks to automatic normalization

**Quick check:**
- Open browser console on production (F12)
- Check errors:
  - "Missing Supabase environment variables" → Variables not set
  - "Invalid NEXT_PUBLIC_SUPABASE_URL format" → Wrong URL (usually the code will fix it)
  - "Supabase URL missing protocol, automatically added https://" → Normal, code fixed the URL

### 2. ✅ Database migrations

Ensure migrations are applied in Supabase:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run migrations in this order:

**Step 1:** Run `supabase/migrations/0001_init.sql`
```sql
-- Create tables and RLS policies
-- (full 0001_init.sql file)
```

**Step 2:** Run `supabase/migrations/0003_seed_full_body_template.sql`
```sql
-- Seed initial data
-- (full 0003_seed_full_body_template.sql file)
```

**Verify:** After running migrations, check that tables exist:
```sql
SELECT * FROM workout_templates;
-- Should return at least one row "Full Body A"
```

### 3. ✅ Row Level Security (RLS) policies

Ensure RLS policies are configured correctly:

1. In Supabase Dashboard go to **Authentication** → **Policies**
2. Each table should have an "allow all" policy:
   - `workout_templates`
   - `workout_template_exercises`
   - `workouts`
   - `exercises`
   - `sets`

**Or run SQL:**
```sql
-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('workout_templates', 'workout_template_exercises', 'workouts', 'exercises', 'sets');
```

### 4. ✅ Connection check

Verify the app can connect to Supabase:

1. Open browser console (F12)
2. Go to **Network** tab
3. Refresh the page
4. Find requests to Supabase (requests to `*.supabase.co`)
5. Check response status:
   - **200** — OK
   - **401/403** — Authentication/RLS issue
   - **404** — Table not found (migrations not applied)

### 5. 🔍 Detailed diagnostics

If the issue persists, check logs:

**In Vercel:**
1. Open project in Vercel Dashboard
2. Go to **Deployments**
3. Open the latest deployment
4. Check **Function Logs** for errors

**In browser:**
1. Open developer console (F12)
2. Check console errors
3. Improved error handling now shows more specific messages:
   - "Table not found" → Migrations not applied
   - "Permission denied" → RLS policy issue
   - "Connection error" → Network or URL issue
   - "Configuration error" → Environment variables issue

### 6. 🚀 Quick fix

To quickly verify the connection:

1. **Check environment variables:**
   ```bash
   # In Vercel Dashboard verify variables are set
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Check migrations:**
   ```sql
   -- In Supabase SQL Editor run:
   SELECT COUNT(*) FROM workout_templates;
   -- Should return > 0
   ```

3. **Redeploy the project:**
   - In Vercel Dashboard click **Redeploy**

### 7. 🔍 Browser console diagnostics

With the latest code, errors are more informative:

1. Open the site in production
2. Open browser console (F12 → Console)
3. Find errors and check messages:

**"Missing Supabase environment variables"**
→ Environment variables not set on Vercel

**"Invalid NEXT_PUBLIC_SUPABASE_URL format"**
→ Wrong URL format

**"Table not found" or "relation does not exist"**
→ Migrations not applied (unlikely if you use the same DB)

**"Permission denied" or "Row Level Security policy violation"**
→ RLS policy issue

**"Connection error"**
→ Network or URL unreachable

4. Also check the **Network** tab:
   - Find requests to Supabase (to `*.supabase.co`)
   - Check status: 200 = OK, 401/403 = access issue, 404 = table not found

### 8. 📞 Further help

If the issue is not resolved:

1. **Check Vercel logs:**
   - Vercel Dashboard → Deployments → latest deploy → Function Logs
   - Look for Supabase client initialization errors

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs → API Logs
   - Verify that requests are coming from production

3. **Temporary debug option:**
   - Add `NEXT_PUBLIC_DEBUG=true` in Vercel
   - Redeploy
   - Detailed Supabase initialization logs will appear in the browser console

4. Ensure you are using the correct Supabase project
5. Verify RLS policies allow anonymous access

---

## Common errors and solutions

### "Missing Supabase environment variables"
**Solution:** Add environment variables in Vercel and redeploy

### "Table not found" or "relation does not exist"
**Solution:** Apply migrations in Supabase SQL Editor

### "Permission denied" or "Row Level Security policy violation"
**Solution:** Check RLS policies — should be "allow all" for all tables

### "Connection error"
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
