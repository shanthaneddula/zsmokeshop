# Vercel KV Setup Guide

## ⚠️ Critical Issue: Settings Not Saving in Production

**Error:** `EROFS: read-only file system` when trying to save admin settings

**Root Cause:** Vercel KV environment variables are not configured in production.

## 🔧 Solution: Set Up Vercel KV Storage

### Step 1: Create a Vercel KV Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Give it a name (e.g., `zsmokeshop-kv`)
6. Select a region close to your users (e.g., `us-east-1`)
7. Click **Create**

### Step 2: Connect KV to Your Project

1. In the KV database page, click **Connect Project**
2. Select your project: `zsmokeshop`
3. Choose the environment(s): **Production**, **Preview**, and **Development**
4. Click **Connect**

This will automatically add the environment variables to your project:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Step 3: Verify Environment Variables

1. Go to your project settings: https://vercel.com/[your-username]/zsmokeshop/settings/environment-variables
2. Verify these variables exist:
   - ✅ `KV_REST_API_URL`
   - ✅ `KV_REST_API_TOKEN`
   - ✅ `KV_REST_API_READ_ONLY_TOKEN` (optional)

### Step 4: Redeploy Your Application

After connecting KV, you need to trigger a new deployment:

**Option A: Via Git (Recommended)**
```bash
git commit --allow-empty -m "Trigger rebuild with KV variables"
git push origin main
```

**Option B: Via Vercel Dashboard**
1. Go to your project's **Deployments** tab
2. Find the latest deployment
3. Click the three dots menu (⋯)
4. Select **Redeploy**

### Step 5: Verify It's Working

After deployment:

1. Check the deployment logs for: `📊 Updating settings in Vercel KV`
2. Try to update settings in the admin panel
3. Logs should show: `📊 Settings updated in KV successfully`

## 🧪 Testing Locally with KV

To test with Vercel KV locally:

1. Copy the KV variables from Vercel dashboard
2. Create/update `.env.local`:
```bash
KV_REST_API_URL=your_actual_url_from_vercel
KV_REST_API_TOKEN=your_actual_token_from_vercel
KV_REST_API_READ_ONLY_TOKEN=your_actual_readonly_token_from_vercel
```

3. Restart your dev server:
```bash
npm run dev
```

## 📊 How It Works

- **Development (local)**: Uses `src/data/admin-config.json` file
- **Production (Vercel)**: Uses Vercel KV (Redis) for persistent storage
- **Automatic Fallback**: If KV is not available locally, uses file system

## 🔍 Troubleshooting

### Error: "Vercel KV is required in production"
- **Cause**: KV environment variables are not set
- **Fix**: Follow steps 1-4 above

### Error: "EROFS: read-only file system"
- **Cause**: Trying to write to local files in production
- **Fix**: Set up Vercel KV (this is the current issue)

### Settings not persisting after deployment
- **Cause**: Each deployment creates a new instance
- **Fix**: Use Vercel KV for persistent storage

## 📚 Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel KV Quickstart](https://vercel.com/docs/storage/vercel-kv/quickstart)
- [Redis Commands Reference](https://redis.io/commands/)

## ✅ Verification Checklist

- [ ] Vercel KV database created
- [ ] KV connected to project
- [ ] Environment variables visible in project settings
- [ ] Application redeployed
- [ ] Settings save successfully
- [ ] Settings persist across deployments
