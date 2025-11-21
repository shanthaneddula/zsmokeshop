# Resend Email Notification Setup Guide

## Overview

The pickup order system now supports **both Email and SMS notifications**, giving customers the choice of how they want to receive order updates. Resend is the recommended option for immediate testing and production use.

## Why Resend?

✅ **Instant Testing** - No phone verification required  
✅ **100 emails/day FREE** - Perfect for testing and small stores  
✅ **Beautiful Email Templates** - Professional HTML emails with order details  
✅ **5-Minute Setup** - Single API key and you're ready  
✅ **No Verification Delays** - Unlike Twilio, works immediately

## Step 1: Create Resend Account (FREE)

1. **Sign up at https://resend.com**
   - Click "Get Started" or "Sign Up"
   - Sign up with GitHub or email
   - **No credit card required**

2. **Verify your email address**
   - Check your inbox for verification email
   - Click the verification link

3. **Get your API key**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Name it: `Z SMOKE SHOP Production` (or `Development`)
   - Copy the API key (starts with `re_`)
   - **Save this key** - you won't see it again!

## Step 2: Configure Environment Variables

1. **Copy the template:**
   ```bash
   cp env.template .env.local
   ```

2. **Edit `.env.local` and add:**
   ```bash
   # Resend Email Service
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=orders@yourdomain.com
   
   # Store Emails
   STORE_EMAIL_WILLIAM_CANNON=williamcannon@zsmokeshop.com
   STORE_EMAIL_CAMERON_RD=cameron@zsmokeshop.com
   ```

## Step 3: Verify Domain (Production Only)

### For Testing (Using Resend's Default Domain)
- You can send to **any email address** immediately
- Emails will come from `onboarding@resend.dev`
- Perfect for testing!

### For Production (Your Own Domain)
1. **Add your domain in Resend:**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `zsmokeshop.com`)

2. **Add DNS records:**
   - Resend will show you DNS records to add
   - Add these to your domain provider (GoDaddy, Namecheap, etc.)
   - Wait for DNS propagation (5-30 minutes)

3. **Verify domain:**
   - Click "Verify" in Resend dashboard
   - Once verified, update `RESEND_FROM_EMAIL` to use your domain:
     ```bash
     RESEND_FROM_EMAIL=orders@zsmokeshop.com
     ```

## Step 4: Test the Email Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Go to checkout:**
   - Add items to cart
   - Go to `/checkout`

3. **Select Email notification:**
   - Choose "Email Notifications" (selected by default)
   - Enter your email address
   - Fill in other required fields

4. **Place the order:**
   - Submit the form
   - Check your email inbox!

## Email Templates Included

### 1. Order Confirmation Email (to Customer)
- ✅ Order number and details
- ✅ Estimated ready time
- ✅ Pickup location with map
- ✅ Item list with prices
- ✅ Total amount
- ✅ 1-hour pickup deadline warning

### 2. Order Ready Email (to Customer)
- ✅ Notification that order is ready
- ✅ Pickup deadline with countdown
- ✅ Store location and phone
- ✅ Pickup instructions

### 3. Store Notification Email (to Store)
- ✅ New order alert
- ✅ Customer contact info
- ✅ Item details and quantities
- ✅ Order total
- ✅ Link to admin dashboard

### 4. Order Cancelled Email (to Customer)
- ✅ Cancellation confirmation
- ✅ Reason (if provided)
- ✅ Contact information

## Resend Free Tier Limits

- **100 emails per day** - Perfect for testing and small volume
- **3,000 emails per month** on free plan
- **No credit card required** for free tier
- Upgrade to paid plan if you need more:
  - $20/month for 50,000 emails
  - $80/month for 1,000,000 emails

## How It Works with Your Order System

### Customer Chooses Notification Method

On checkout page, customer selects:
- **📧 Email Notifications** (Recommended) - Uses Resend
- **📱 SMS Text Messages** - Uses Twilio (when configured)

### Email Workflow

1. **Customer places order** → Resend sends confirmation email
2. **Store marks ready** → Resend sends "ready for pickup" email
3. **Order cancelled** → Resend sends cancellation email
4. **Store receives notification** → Resend sends order details to store email

### SMS Workflow (Twilio)

If customer selects SMS:
- Uses existing Twilio service
- Requires phone verification
- Follows same workflow as before

## Troubleshooting

### "Resend API key missing" Error
- Make sure `RESEND_API_KEY` is set in `.env.local`
- Restart your dev server after adding the key
- Verify the key starts with `re_`

### Emails Not Arriving
1. **Check spam folder** - Resend emails might be filtered
2. **Verify API key** - Make sure it's correct
3. **Check Resend logs** - Go to https://resend.com/logs
4. **Test email format** - Make sure email address is valid

### "Failed to send email" Error
- Check console for detailed error message
- Verify you have internet connection
- Check Resend status: https://resend.com/status
- Make sure you haven't exceeded free tier limits

## Production Deployment

### Vercel Deployment

1. **Add environment variables in Vercel:**
   - Go to Vercel project settings
   - Navigate to "Environment Variables"
   - Add:
     ```
     RESEND_API_KEY=re_your_production_key
     RESEND_FROM_EMAIL=orders@zsmokeshop.com
     STORE_EMAIL_WILLIAM_CANNON=williamcannon@zsmokeshop.com
     STORE_EMAIL_CAMERON_RD=cameron@zsmokeshop.com
     ```

2. **Redeploy:**
   ```bash
   vercel --prod
   ```

3. **Test in production:**
   - Place a test order
   - Check email delivery
   - Monitor Resend logs

## Cost Comparison

### Resend (Email)
- **Free:** 100/day (3,000/month)
- **$20/month:** 50,000 emails
- **$80/month:** 1,000,000 emails

### Twilio (SMS)
- **Trial:** $15.50 credit (~2,000 SMS)
- **Paid:** $0.0079 per SMS
- **100 SMS/day = $23.70/month**

**Recommendation:** Start with Resend email for testing and production. Add Twilio SMS later if customers request it.

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend API Reference:** https://resend.com/docs/api-reference
- **Resend Support:** support@resend.com

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to `.env.local`
3. ✅ Test email flow in development
4. ✅ Deploy to production
5. ⏰ (Optional) Set up custom domain
6. ⏰ (Optional) Configure Twilio for SMS option

---

**You're all set!** Customers can now choose email notifications and test the complete order flow immediately. 🎉
