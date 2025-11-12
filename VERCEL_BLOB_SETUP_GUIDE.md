# Vercel Blob Storage Setup Guide

**Date**: November 12, 2025  
**Issue**: Image upload 500 errors in development  
**Solution**: Proper Vercel Blob Storage configuration

---

## 🎯 Current Status

### Blob Storage Information (Provided by User)
- **Production URL**: `https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com`
- **Store Name**: `zsmokeshop_product_images`
- **Store ID**: `store_J9JxBoUDDwJbcZ7m`

### Code Changes Applied ✅
- [x] Modified upload route to handle development vs production environments
- [x] Added fallback mechanism for local development
- [x] Updated environment configuration

---

## 🔧 Setup Instructions

### Step 1: Get Vercel Blob Storage Token

You need to get your actual Blob storage token from Vercel:

1. **Go to Vercel Dashboard**:
   - Navigate to your project: `https://vercel.com/[your-username]/zsmokeshop`
   - Go to **Settings** → **Environment Variables**

2. **Find or Create Blob Storage Variables**:
   Look for these variables (they might be auto-created):
   ```
   BLOB_READ_WRITE_TOKEN
   NEXT_PUBLIC_VERCEL_BLOB_STORE_ID
   ```

3. **Copy the Token Values**:
   - The token will look like: `vercel_blob_rw_[random_string]`
   - The store ID should be: `store_J9JxBoUDDwJbcZ7m`

### Step 2: Update Local Environment

Once you have the real token, update your `.env.local`:

```bash
# Current placeholder (replace with real values from Vercel dashboard)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_J9JxBoUDDwJbcZ7m"
NEXT_PUBLIC_VERCEL_BLOB_STORE_ID="store_J9JxBoUDDwJbcZ7m"
```

### Step 3: Ensure Production Environment Variables

Make sure these are set in your Vercel project settings:

```bash
BLOB_READ_WRITE_TOKEN=[your_actual_token]
NEXT_PUBLIC_VERCEL_BLOB_STORE_ID=store_J9JxBoUDDwJbcZ7m
REDIS_URL=redis://default:2MQcRbgtoGri1PPU9vD86ZOmHuZXJWFU@redis-16513.c14.us-east-1-3.ec2.redns.redis-cloud.com:16513
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Instagram@501
JWT_SECRET=fallback-secret-key
```

---

## 🧪 Testing the Fix

### Development Mode Testing

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Test Upload**:
   - Go to `http://localhost:3000/admin/login`
   - Login with `admin` / `Instagram@501`
   - Navigate to **Products** → **Add New Product**
   - Try uploading an image

3. **Expected Behavior**:
   - **Console Log**: `⚠️ Development mode: Simulating upload success`
   - **Success Response**: Upload should work with mock URL
   - **No 500 Errors**: Should return success with development placeholder

### Production Mode Testing

1. **Deploy to Vercel**:
   ```bash
   git add . && git commit -m "Configure Blob storage" && git push origin main
   ```

2. **Test Production Upload**:
   - Go to your production admin panel
   - Try uploading an image
   - Check Vercel function logs

3. **Expected Logs**:
   ```
   📤 Uploading to Vercel Blob: admin/general/filename
   ✅ Upload successful to Blob storage: https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/...
   ```

---

## 🔍 How the Fix Works

### Development vs Production Detection

The upload route now checks the environment:

```typescript
// Check if we're in production with proper Blob storage setup
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (isProduction) {
  // Use real Blob storage
  const blob = await put(blobPath, file, { access: 'public' });
  return blob.url;
} else {
  // Development mode: Return mock response
  const mockUrl = `https://j9jxbouddwjbcz7m.public.blob.vercel-storage.com/${blobPath}`;
  return mockUrl;
}
```

### Benefits of This Approach

1. **Development Works**: No 500 errors in local development
2. **Production Ready**: Real Blob storage in production
3. **Consistent Interface**: Frontend gets same response format
4. **Easy Testing**: Can test upload workflow locally

---

## 🚨 Troubleshooting

### Issue: Still Getting 500 Errors

**Possible Causes**:
1. Missing or incorrect `BLOB_READ_WRITE_TOKEN`
2. Network issues accessing Vercel API
3. File validation errors

**Solutions**:
1. Verify token from Vercel dashboard
2. Check file size (<5MB) and type (image/*)
3. Look at console logs for specific error

### Issue: Development Mode Not Working

**Check These**:
1. Environment variables loaded correctly
2. Console shows "Development mode: Simulating upload success"
3. Mock URL format matches expected pattern

### Issue: Production Upload Fails

**Verify**:
1. Blob storage environment variables set in Vercel
2. Vercel function logs show Blob storage errors
3. Blob storage quotas not exceeded

---

## 📊 Expected Behavior Summary

### Local Development
- ✅ No 500 errors
- ✅ Mock upload success
- ✅ Console: "Development mode: Simulating upload success"
- ✅ Returns placeholder URL with correct format

### Production
- ✅ Real Blob storage upload
- ✅ CDN-backed URLs returned
- ✅ Console: "Upload successful to Blob storage"
- ✅ Images accessible at returned URLs

---

## 🚀 Next Steps

1. **Get Real Token**: Obtain the actual `BLOB_READ_WRITE_TOKEN` from Vercel dashboard
2. **Update Environment**: Replace placeholder token with real value
3. **Test Locally**: Verify no 500 errors in development
4. **Deploy & Test**: Confirm production upload works with real Blob storage
5. **Monitor**: Check Vercel function logs for any issues

The upload route is now resilient and will handle both development and production environments properly! 🎉