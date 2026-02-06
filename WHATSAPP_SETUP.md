# 📱 FREE WhatsApp Business API Setup Guide

## ✅ Why WhatsApp for OTP?
- **100% FREE** for 1,000 conversations/month
- Verifies **real phone numbers** (invalid numbers won't receive messages)
- **90%+ delivery rate** in India
- **Instant delivery** (faster than SMS)
- Users already have WhatsApp installed
- Professional and trusted platform

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Meta Business Account
1. Go to https://business.facebook.com/
2. Click **"Create Account"**
3. Enter your business name: `Mr. Smoothy`
4. Fill in basic business details

### Step 2: Create WhatsApp Business App
1. Go to https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Business"** as app type
4. App Name: `Mr Smoothy OTP`
5. Click **"Create App"**

### Step 3: Add WhatsApp Product
1. In your app dashboard, find **WhatsApp** in the products list
2. Click **"Set Up"**
3. Select your Meta Business Account
4. You'll see the **WhatsApp Business API** setup page

### Step 4: Get Phone Number
You have 2 options:

#### Option A: Use Test Number (Immediate - FREE)
- Meta provides a **free test number** immediately
- You can send messages to **5 pre-registered test numbers**
- Perfect for testing before going live

#### Option B: Add Your Own Number (Recommended for Production)
1. Click **"Add Phone Number"**
2. Enter your business phone number
3. Verify via SMS code
4. **Note:** This number will be used only for WhatsApp Business API
5. **Cost:** Still FREE for 1,000 conversations/month!

### Step 5: Get API Credentials

#### Get Phone Number ID:
1. In WhatsApp setup page, go to **"API Setup"** tab
2. Copy the **"Phone number ID"** (looks like: 123456789012345)

#### Get Access Token:
1. In same page, find **"Access Token"** section
2. Click **"Generate Token"**
3. Select permissions: `whatsapp_business_messaging`
4. Copy the **temporary token** (24 hours validity)

#### Get Permanent Token (Important!):
1. Go to **Settings** → **Basic** in your app
2. Copy your **App ID** and **App Secret**
3. Create a permanent token using System User:
   - Go to **Business Settings** → **System Users**
   - Create new system user: `MrSmoothyBot`
   - Assign assets: Your WhatsApp Business Account
   - Generate token with `whatsapp_business_messaging` permission
   - **Save this token** - it won't expire!

### Step 6: Add Credentials to Vercel

Run these commands in your server directory:

```powershell
cd server
vercel env add WHATSAPP_PHONE_NUMBER_ID
# Paste your Phone Number ID

vercel env add WHATSAPP_ACCESS_TOKEN
# Paste your permanent access token
```

When prompted:
- Select **all environments** (Production, Preview, Development)
- Confirm each one

### Step 7: Deploy & Test

```powershell
# Deploy server
vercel --prod

# Test WhatsApp OTP
# Go to: https://mrsmoothy-frontend.vercel.app/auth
# Enter phone number and request OTP
# You should receive OTP on WhatsApp!
```

---

## 📋 Test Number Setup (for testing before going live)

1. In WhatsApp API dashboard, go to **"API Setup"**
2. Scroll to **"Send and receive messages"** section
3. Find **"To"** field with phone numbers
4. Click **"Manage phone number list"**
5. Add up to 5 phone numbers for testing (including yours)
6. These numbers will receive test messages

---

## 🎯 Message Template (Optional - for production at scale)

For sending more than 1,000 messages/month, you need approved templates:

1. Go to **"Message Templates"** in WhatsApp dashboard
2. Click **"Create Template"**
3. Template details:
   - **Name:** `otp_verification`
   - **Category:** Authentication
   - **Language:** English
   - **Content:**
     ```
     Hello {{1}},
     
     Your Mr. Smoothy verification code is:
     
     {{2}}
     
     This code will expire in 10 minutes.
     Don't share this code with anyone.
     ```
4. Submit for approval (takes 1-2 hours)

**Note:** For now, we're using **simple text messages** which work immediately without template approval!

---

## 💰 Pricing (Very Generous FREE Tier)

- **First 1,000 conversations:** FREE every month
- **After 1,000:** $0.0042 per message (₹0.35)
- **Monthly reset:** Free tier resets every month

**Example costs:**
- 100 customers/day = 3,000/month = First 1,000 free, then ₹700/month
- 50 customers/day = 1,500/month = First 1,000 free, then ₹175/month
- 30 customers/day = 900/month = **100% FREE** 🎉

---

## 🔧 Troubleshooting

### "Access token is invalid"
- Generate a new permanent token from System User
- Make sure you selected the correct permissions
- Update token in Vercel env variables

### "Phone number not registered"
- For test mode, add phone number to test recipient list
- For production, any valid WhatsApp number will work

### "Template not found"
- We're using simple text messages, no template needed
- If you want templates, submit for approval first

### "Message failed to send"
- Check if phone number has WhatsApp installed
- Verify phone number format: 919876543210 (no spaces, no +)
- Check your message quota (1,000 free/month)

---

## 🎬 Current Implementation

Your app now sends OTP in this priority:

1. **WhatsApp** (FREE, verifies real numbers) ✅
2. **SMS Service** (if WhatsApp fails)
3. **Display on screen** (if all services fail)

**Benefits:**
- ✅ FREE phone number verification
- ✅ Instant delivery
- ✅ Professional and trusted
- ✅ Works globally
- ✅ 90%+ delivery rate in India

---

## 📞 Support

Meta WhatsApp Business API:
- Documentation: https://developers.facebook.com/docs/whatsapp
- Support: https://business.facebook.com/business/help

Issues? Check:
1. Phone Number ID is correct
2. Access Token is valid and permanent
3. Environment variables are set in Vercel
4. Phone number format: 919876543210

---

## ✨ Next Steps

1. **Create Meta account** (2 min)
2. **Create WhatsApp app** (5 min)
3. **Get credentials** (5 min)
4. **Add to Vercel** (2 min)
5. **Test OTP** (1 min)

Total time: **~15 minutes** ⏱️

After setup, your customers will receive OTP via WhatsApp for **FREE** with real phone verification! 🎉
