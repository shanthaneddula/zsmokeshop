# Phone Number Display Fix

## Problem
Phone numbers were reverting to old values `(512) 766-3707` or showing as unformatted numbers like `5127663707` instead of the correct `(512) 227-9820`.

## Root Causes

1. **Cached Data in Redis**: Old phone numbers were cached in Redis Cloud storage
2. **Admin Settings Not Loading**: The admin settings page had hardcoded default values and wasn't loading saved settings on mount
3. **Hardcoded Values**: Components like `help-and-reviews.tsx` had hardcoded phone numbers

## Fixes Applied

### 1. Updated `admin-config.json`
Changed phone numbers from E.164 format to display format:
```json
"businessPhone": "(512) 227-9820"  // Was: "+15122279888"
"locations": [
  {
    "phone": "(512) 227-9820"  // Was: "+15122279888"
  }
]
```

### 2. Fixed Admin Settings Page Loading
Added `useEffect` to load settings from API on mount:
```typescript
// src/app/admin/settings/settings-client.tsx
useEffect(() => {
  const loadSettings = async () => {
    const response = await fetch('/api/admin/settings');
    if (response.ok) {
      const result = await response.json();
      setSettings(result.data);
    }
  };
  loadSettings();
}, []);
```

### 3. Made Help & Reviews Dynamic
Changed from hardcoded to dynamic values from settings:
```typescript
// src/components/sections/help-and-reviews.tsx
<p>{getActiveLocations()[0]?.phone || businessPhone}</p>
```

## How to Clear Redis Cache and Apply Fix

### Option 1: Update via Admin Dashboard (Recommended)

1. **Login to Admin**
   - Go to http://localhost:3000/admin
   - Login with your credentials

2. **Go to Settings**
   - Click "Settings" in the sidebar
   - Click "Store Info" tab

3. **Update Phone Numbers**
   - Business Phone: `(512) 227-9820`
   - Location 1 Phone: `(512) 227-9820`
   - Location 2 Phone: `(661) 371-1413` (or your actual number)

4. **Save**
   - Click "Save Settings"
   - This will update Redis with correct values

### Option 2: Clear Redis Cache Manually

Run this Node.js script to clear Redis cache:

```javascript
// clear-redis-cache.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

redis.del('business-settings')
  .then(() => {
    console.log('✅ Redis cache cleared!');
    console.log('📋 Settings will reload from admin-config.json');
    redis.quit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    redis.quit();
  });
```

Run it:
```bash
node clear-redis-cache.js
```

### Option 3: Restart and It Will Auto-Fix

1. **Restart your dev server**
   ```bash
   npm run dev
   ```

2. **The settings service will:**
   - Try to load from Redis
   - If settings exist but are wrong, they'll show the old values
   - You need to update via admin OR clear Redis cache

3. **Go to admin settings** and save once to sync Redis

## Verification Steps

### 1. Check Homepage
- Visit http://localhost:3000
- Scroll to "Visit Our Store & See Reviews"
- Verify phone numbers show: `(512) 227-9820` for Location 1

### 2. Check Admin Settings
- Login to http://localhost:3000/admin
- Go to Settings > Store Info
- Verify phone numbers are correct
- Update if needed and save

### 3. Check Locations Page
- Visit http://localhost:3000/locations
- Verify phone numbers are displayed correctly

### 4. Check Console Logs
Look for these logs when loading pages:
```
📊 Business Settings API Response: {...}
📊 Retrieved settings from Redis
```

## Phone Number Format Rules

The system supports multiple formats and auto-formats them:

**Input Formats Accepted:**
- `(512) 227-9820` ✅ (preferred - displays as-is)
- `5122279820` → converts to `(512) 227-9820`
- `+15122279820` → converts to `(512) 227-9820`
- `512-227-9820` → converts to `(512) 227-9820`

**Best Practice:**
Always save phone numbers in the display format: `(XXX) XXX-XXXX`

## Storage Priority

The system checks storage in this order:
1. **Redis Cloud** (if REDIS_URL is set) ← Your production setup
2. **Vercel KV** (if KV_REST_API_URL is set)
3. **Local File** (admin-config.json) ← Development fallback

## Files Modified

1. ✅ `/src/app/admin/settings/settings-client.tsx` - Added useEffect to load settings
2. ✅ `/src/components/sections/help-and-reviews.tsx` - Made phone numbers dynamic
3. ✅ `/src/data/admin-config.json` - Updated phone number format
4. ✅ `/src/lib/settings-service.ts` - Already had correct defaults

## Future Prevention

To prevent this issue:
1. ✅ Admin settings page now loads saved values on mount
2. ✅ Components use dynamic values from settings
3. ✅ Phone formatter handles multiple input formats
4. ✅ Settings persist across Redis, KV, and local file

## Quick Fix Commands

```bash
# 1. Clear Redis cache (if using Redis)
# Create this file first: clear-redis-cache.js
node clear-redis-cache.js

# 2. Restart dev server
npm run dev

# 3. Update settings via admin UI
# Go to http://localhost:3000/admin/settings
# Update phone numbers and save
```

## Testing

After applying the fix:

```bash
# 1. Start dev server
npm run dev

# 2. Check homepage
open http://localhost:3000

# 3. Check admin settings
open http://localhost:3000/admin/settings

# 4. Verify phone numbers are correct
```

All phone numbers should now display as `(512) 227-9820` consistently! ✅
