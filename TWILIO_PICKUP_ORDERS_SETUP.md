# Twilio SMS Pickup Orders Setup Guide

This guide will walk you through setting up Twilio SMS notifications for the Z SMOKE SHOP pickup order system.

## Overview

The pickup order system allows customers to:
- Place orders for pickup
- Select replacement preferences for each item
- Receive SMS updates on order status
- Respond to replacement suggestions via SMS
- Track the 1-hour pickup window

## Step 1: Create Twilio Account

### Trial Account (FREE - Recommended for Testing)

1. **Sign up for Twilio**
   - Go to https://www.twilio.com/try-twilio
   - Create a free account (no credit card required)
   - You'll receive **$15.50 in free trial credit**

2. **Verify your personal phone number**
   - Twilio will send you an SMS verification code
   - This is your first verified number

3. **Get a Twilio phone number**
   - After signup, Twilio will assign you a free phone number
   - This is the number that will send SMS to customers
   - Format: +1XXXXXXXXXX (e.g., +15125551234)

### Trial Account Limitations

- **Only verified numbers can receive SMS** - You must manually verify each test number in Twilio console
- **"Trial" message included** - SMS will say "Sent from a Twilio trial account"
- **Trial credit lasts forever** - $15.50 = ~2,000 SMS messages
- **Perfect for development** - Test the complete flow before upgrading

### Verifying Test Phone Numbers (Trial Only)

1. Go to Twilio Console: https://console.twilio.com/
2. Navigate to **Phone Numbers** > **Verified Caller IDs**
3. Click **+ Add a new number**
4. Enter phone number (e.g., +15125551234)
5. Twilio sends SMS code to that number
6. Enter the code to verify
7. **Repeat for 5-10 test numbers** (employees, friends, family)

Now these numbers can receive SMS from your app!

## Step 2: Get Twilio Credentials

1. **Go to Twilio Console**: https://console.twilio.com/
2. **Account Info section** shows:
   - **Account SID** (e.g., `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (click "Show" to reveal)
3. **Copy these values** - you'll need them for .env.local

## Step 3: Configure Environment Variables

1. **Copy env.template to .env.local**:
   ```bash
   cp env.template .env.local
   ```

2. **Add your Twilio credentials**:
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+15125551234
   
   # Store Phone Numbers (your phone for testing)
   STORE_PHONE_WILLIAM_CANNON=+15125555555
   STORE_PHONE_CAMERON_RD=+15125556666
   ```

3. **Never commit .env.local** - it's already in .gitignore

## Step 4: Configure Twilio Webhook (for SMS Replies)

To receive SMS replies from customers (e.g., "YES" to approve replacements):

1. **Go to Twilio Console** > **Phone Numbers** > **Manage** > **Active Numbers**
2. **Click your phone number**
3. **Scroll to "Messaging Configuration"**
4. **Set "A MESSAGE COMES IN" webhook**:
   - **Webhook URL**: `https://YOUR_DOMAIN.vercel.app/api/webhooks/twilio-sms`
   - **HTTP Method**: `POST`
5. **Click Save**

For local testing with webhooks:
1. Install ngrok: `brew install ngrok` (Mac) or download from https://ngrok.com
2. Run your dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set webhook to: `https://abc123.ngrok.io/api/webhooks/twilio-sms`
6. Test SMS replies!

## Step 5: Test the System

### Test Flow 1: Order Placement

1. **Create test products** in admin dashboard
2. **Add to cart** and go to checkout
3. **Fill in customer info**:
   - Name: Your name
   - Phone: **Verified number** (from Twilio console)
   - Select replacement preferences
4. **Place order**
5. **Check phones**:
   - Customer phone should receive: "Order ZS-XXXXXX received..."
   - Store phone should receive: "NEW ORDER ZS-XXXXXX..."

### Test Flow 2: Order Ready

1. **Log into admin dashboard**: `/admin/orders`
2. **Find the pending order**
3. **Click "Mark Ready"**
4. **Customer receives**: "Order ZS-XXXXXX is READY for pickup..."
5. **1-hour countdown starts**

### Test Flow 3: Replacement Suggestion

1. **Go to order detail page** in admin
2. **Click "Suggest Replacement"** for an item
3. **Select replacement product**
4. **Customer receives**: "Blue Razz Ice is out of stock. Can we substitute with Strawberry..."
5. **Customer replies**: "YES" or "NO"
6. **Order automatically updates**

## Step 6: Upgrade to Production (When Ready)

When you're ready to go live with real customers:

### Upgrade Twilio Account

1. **Add payment method** in Twilio Console
2. **Add $20-50** to your account
3. **Upgrade from trial**:
   - Remove "trial" message
   - Send to ANY phone number (no verification needed)
   - Same low rates: $0.0079/SMS

### Production Costs

```
Estimated costs for 100 orders/month:
- 100 orders × 4 SMS each = 400 SMS
- 400 × $0.0079 = $3.16
- Phone number rental: $1.15/month
- Total: ~$4.31/month
```

### Alternative: AWS SNS (Cheaper Long-term)

After testing with Twilio, you can migrate to AWS SNS:
- First 100 SMS/month: **FREE**
- After that: $0.00645/SMS
- 100 orders/month: ~$1.94/month total
- See AWS SNS setup guide (to be created)

## SMS Flow Examples

### Customer Order Confirmation
```
Z SMOKE SHOP: Order ZS-001234 received! We'll prepare 
your items and text you when ready for pickup (est. 3:30 PM). 
Must pick up within 1 hour. 719 W William Cannon Dr #105
```

### Store Notification
```
NEW ORDER ZS-001234: John Smith - 5 item(s) - $45.99. 
Check admin dashboard to confirm.
```

### Order Ready
```
Z SMOKE SHOP: Order ZS-001234 is READY for pickup! 
Please arrive by 4:30 PM (within 1 hour). 
719 W William Cannon Dr #105. Reply HELP if you need assistance.
```

### Replacement Suggestion
```
Z SMOKE SHOP Order ZS-001234: "Blue Razz Ice Vape" is out of stock. 
Can we substitute with "Strawberry Watermelon Vape"? 
Reply YES to approve or NO to remove from order.
```

### Customer Approval (Reply)
```
Customer: YES

Response: Great! We've updated your order ZS-001234 with 
Strawberry Watermelon Vape. You'll receive a text when ready for pickup.
```

## Troubleshooting

### SMS Not Sending

1. **Check Twilio credentials** in .env.local
2. **Check trial account** - is number verified?
3. **Check Twilio console logs**: https://console.twilio.com/monitor/logs/messages
4. **Check server logs** for errors

### SMS Not Receiving (Webhook)

1. **Check webhook URL** is correct in Twilio console
2. **For local testing**, use ngrok
3. **Check webhook logs** in Twilio console
4. **Verify /api/webhooks/twilio-sms** route is working

### Phone Number Format Errors

- Always use E.164 format: `+1XXXXXXXXXX`
- System auto-formats 10-digit numbers to +1
- Example: `5125551234` → `+15125551234`

## Next Steps

1. ✅ Set up Twilio account and get credentials
2. ✅ Configure .env.local with Twilio settings
3. ✅ Test order placement with verified numbers
4. ⬜ Build admin orders dashboard
5. ⬜ Build checkout page
6. ⬜ Test complete order flow
7. ⬜ Upgrade to production when ready

## API Endpoints Created

- `POST /api/orders/create` - Place new order
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/[id]` - Get order by ID
- `POST /api/orders/[id]/update-status` - Update order status
- `POST /api/orders/[id]/suggest-replacement` - Suggest replacement
- `POST /api/webhooks/twilio-sms` - Handle incoming SMS

## Support

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Twilio Support**: https://support.twilio.com
- **Trial Credit**: Lasts forever, no expiration
- **SMS Pricing**: https://www.twilio.com/sms/pricing/us

---

**Ready to continue?** Let me know when you've set up Twilio and I'll help you build the checkout page and admin dashboard!
