# Quick Start: Test Orders with Email Notifications

## 🚀 Get Started in 3 Minutes

### 1. Get Resend API Key (2 minutes)

1. Go to **https://resend.com** and sign up (free, no credit card)
2. Verify your email
3. Go to https://resend.com/api-keys
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

### 2. Add to Environment (30 seconds)

Create `.env.local` in your project root:

```bash
# Resend Email
RESEND_API_KEY=re_paste_your_key_here
RESEND_FROM_EMAIL=orders@zsmokeshop.com

# Store emails (optional - for store notifications)
STORE_EMAIL_WILLIAM_CANNON=your-email@example.com
STORE_EMAIL_CAMERON_RD=your-email@example.com

# Twilio (optional - keep for future SMS use)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

### 3. Test It! (30 seconds)

```bash
# Restart your dev server
npm run dev
```

Then:
1. Go to http://localhost:3000/shop
2. Add items to cart
3. Go to checkout
4. **Select "Email Notifications"** (default)
5. Enter your email address
6. Complete the order
7. **Check your inbox!** 📧

## ✅ What You Get

### Customer Experience
- 📧 Beautiful order confirmation email
- 📧 "Order ready" notification email
- 📧 Professional HTML templates
- 📧 Complete order details

### Store Experience
- 📧 New order notification
- 📧 Customer contact info
- 📧 Order items and total
- Same admin dashboard

## 🎯 Key Features

### Email vs SMS Choice
On checkout page, customers can choose:

**📧 Email Notifications (Default)**
- ✅ Works immediately - no verification needed
- ✅ Beautiful HTML emails
- ✅ 100 free emails/day
- ✅ Perfect for testing

**📱 SMS Text Messages**
- Requires Twilio setup (when you're ready)
- Same workflow, different delivery

### What Changed

1. **Checkout Page:** Added notification method selector
2. **Order Types:** Added `notificationMethod` and `customerEmail` fields
3. **API:** Routes to Resend or Twilio based on customer choice
4. **Twilio Kept:** All existing SMS code remains for future use

## 📊 Free Tier Limits

- **100 emails per day** (Resend free)
- **3,000 emails per month** (Resend free)
- More than enough for testing!

Upgrade later if needed:
- $20/month = 50,000 emails
- $80/month = 1,000,000 emails

## 🐛 Troubleshooting

**Emails not arriving?**
1. Check spam/junk folder
2. Verify `RESEND_API_KEY` in `.env.local`
3. Restart dev server
4. Check https://resend.com/logs for delivery status

**"Resend API key missing" error?**
- Make sure `.env.local` exists in project root
- Restart `npm run dev` after adding the key

**Want to test with real domain?**
- See `RESEND_EMAIL_SETUP.md` for domain verification
- Or use default `onboarding@resend.dev` for testing

## 📚 Full Documentation

- **Complete Setup:** `RESEND_EMAIL_SETUP.md`
- **Twilio Setup:** `TWILIO_PICKUP_ORDERS_SETUP.md` (for SMS later)
- **Order System:** `PICKUP_ORDER_SYSTEM_SUMMARY.md`

## 🎉 You're Ready!

You can now test the complete order flow without waiting for Twilio verification. Customers get professional email notifications instantly!

**Next Steps:**
1. Get Resend API key
2. Add to `.env.local`
3. Test an order
4. Deploy to production when ready
5. Add Twilio later for SMS option (optional)
