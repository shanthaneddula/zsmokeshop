# 💬 Tawk.to Setup Instructions for Z Smoke Shop

## ✅ Step 1: Dashboard Configuration

1. **Login to your Tawk.to Dashboard**: https://dashboard.tawk.to/
2. **Go to Administration → Chat Widget**
3. **Configure the following settings:**

### 🎨 Appearance Settings

**Widget Appearance:**
- **Widget Color**: `#000000` (Black)
- **Widget Position**: Bottom Right
- **Widget Shape**: Rectangle (not rounded)
- **Widget Size**: Medium
- **Widget Button Text**: "CHAT WITH US" (uppercase)

**CRITICAL: Override Default Colors**
- **Primary Color**: `#000000` (Black) - This overrides the green!
- **Secondary Color**: `#333333` (Dark Gray)
- **Text Color**: `#FFFFFF` (White)
- **Background Color**: `#FFFFFF` (White)

**Chat Window:**
- **Header Color**: `#000000` (Black)
- **Header Text Color**: `#FFFFFF` (White)
- **Chat Background**: `#FFFFFF` (White)
- **Message Bubble Style**: Square (not rounded)

### 📝 Text & Messages

**Welcome Message:**
```
👋 Welcome to Z Smoke Shop!

How can we help you today?
• Product availability
• Store locations
• General questions

We're here to help! 🛍️
```

**Offline Message:**
```
🕒 We're currently offline

Leave us a message and we'll get back to you as soon as possible!

Store Hours:
📍 Location 1: [Your hours]
📍 Location 2: [Your hours]
```

**Agent Display Name**: `Z Smoke Shop Support`

### 🎨 Custom CSS (IMPORTANT!)

**Go to Administration → Chat Widget → Appearance → Custom CSS**

**Copy and paste this CSS code:**

```css
/* Adidas-Inspired Chat Styling */

.tawk-header {
  background: #000000 !important;
  color: #FFFFFF !important;
  font-family: 'Arial', sans-serif !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 2px !important;
  border-bottom: 2px solid #000000 !important;
  padding: 16px !important;
}

.tawk-header .tawk-header-text {
  font-size: 14px !important;
  font-weight: 700 !important;
}

.tawk-chatbox {
  border-radius: 0 !important;
  font-family: 'Arial', sans-serif !important;
  border: 2px solid #000000 !important;
}

.tawk-chat-panel {
  background: #FFFFFF !important;
}

.tawk-message-container {
  padding: 8px 16px !important;
}

.tawk-message.tawk-message-visitor {
  background: #000000 !important;
  color: #FFFFFF !important;
  border-radius: 0 !important;
  border: 1px solid #000000 !important;
  font-weight: 500 !important;
  margin: 8px 0 !important;
}

.tawk-message.tawk-message-agent {
  background: #F5F5F5 !important;
  color: #000000 !important;
  border-radius: 0 !important;
  border: 1px solid #E0E0E0 !important;
  font-weight: 500 !important;
  margin: 8px 0 !important;
}

.tawk-textarea {
  border-radius: 0 !important;
  border: 2px solid #000000 !important;
  font-family: 'Arial', sans-serif !important;
  padding: 12px !important;
  font-size: 14px !important;
}

.tawk-textarea:focus {
  border-color: #000000 !important;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
}

.tawk-button-large {
  background: #000000 !important;
  color: #FFFFFF !important;
  border: 2px solid #000000 !important;
  border-radius: 0 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  padding: 12px 24px !important;
  transition: all 0.3s ease !important;
}

.tawk-button-large:hover {
  background: #333333 !important;
  border-color: #333333 !important;
}

.tawk-name {
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  color: #000000 !important;
}

.tawk-chat-panel-container {
  border-radius: 0 !important;
}

/* Widget Button Styling */
.tawk-min-container {
  background: #000000 !important;
  border: 2px solid #000000 !important;
  border-radius: 0 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.tawk-min-container:hover {
  background: #333333 !important;
  border-color: #333333 !important;
}

.tawk-text-regular {
  color: #FFFFFF !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}
```

## 📱 Step 2: Mobile App Setup

1. **Download Tawk.to Mobile App**:
   - iOS: App Store → "Tawk.to Live Chat"
   - Android: Google Play → "Tawk.to Live Chat"

2. **Login with your dashboard credentials**

3. **Enable Push Notifications** for instant customer alerts

4. **Set your availability status** (Online/Away/Offline)

## 🔧 Step 3: Testing

1. **Visit your website** (after deployment)
2. **Look for the black chat button** in bottom-right corner
3. **Send a test message** from your website
4. **Check your mobile app** for the notification
5. **Reply from the mobile app** to test two-way communication

## 🎯 Step 4: Customization Options

### **Business Hours**
- Go to **Administration → Business Hours**
- Set your store operating hours
- Configure auto-responses for offline hours

### **Departments** (Optional)
- **Sales**: Product inquiries, availability
- **Support**: General questions, complaints
- **Store Info**: Hours, locations, directions

### **Quick Responses** (Recommended)
Set up quick replies for common questions:

```
• "Yes, that item is in stock! Would you like me to hold it for you?"
• "We have 2 locations: [Address 1] and [Address 2]"
• "Our store hours are: Mon-Sat 10AM-9PM, Sun 12PM-6PM"
• "You can visit us in person or call us at [phone number]"
• "We carry all major brands including Puffco, Diamond Glass, and more!"
```

## 🚀 Step 5: Go Live!

1. **Save all settings** in the dashboard
2. **Deploy your website** with the Tawk.to integration
3. **Test the chat** from different devices
4. **Train your staff** on using the mobile app
5. **Monitor chat analytics** in the dashboard

## 📊 Analytics & Reports

**Track important metrics:**
- Number of chats per day
- Response time
- Customer satisfaction ratings
- Most common questions
- Peak chat hours

## 🔒 Security & Privacy

**Tawk.to automatically handles:**
- ✅ GDPR compliance
- ✅ Data encryption
- ✅ Secure message storage
- ✅ Privacy controls

## 🆘 Support

**If you need help:**
- Tawk.to Knowledge Base: https://help.tawk.to/
- Contact Tawk.to Support via their own chat widget
- Check the mobile app for tutorials

---

**🎉 Your Adidas-inspired live chat is now ready!**

Customers will see a sleek black chat button that matches your website's design, and you'll get instant notifications on your phone when they need help with product availability or store information.
