# ProfitPad Deployment Guide

## 📋 Project Overview
ProfitPad is a full-stack inventory and sales management platform built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Replit OIDC
- **Admin Account**: mequeamaddox@gmail.com

## 🚀 Replit Reserved VM Deployment ($20/month)

### Step 1: Deploy on Replit
1. Click the **Deploy** button in your Replit workspace
2. Select **Reserved VM Deployment**
3. Choose configuration:
   - **0.5 vCPU / 2GB RAM** ($20/month - recommended)
   - Build command: `npm run build`
   - Run command: `npm start`

### Step 2: Custom Domain Setup (Google Workspace Domain)

**In Replit Deployment Dashboard:**
1. Go to **Domains** tab in your deployment
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `profitpad.yourdomain.com`)
4. Replit will provide:
   - **A Record**: pointing to their server IP
   - **TXT Record**: for domain verification

**In Google Domains/Workspace DNS:**
1. Go to Google Domains DNS management
2. Add the **A Record**:
   - Name: `profitpad` (or `@` for root domain)
   - Type: A
   - Value: [IP provided by Replit]
3. Add the **TXT Record**:
   - Name: [as provided by Replit]
   - Type: TXT
   - Value: [verification string from Replit]

**Important Notes:**
- DNS changes take up to 48 hours to propagate
- Don't use Cloudflare proxy (causes SSL issues)
- Remove any conflicting A records for the same domain

## 💾 Environment Variables Needed
Set these in your Replit deployment:
- `DATABASE_URL` (already configured)
- `SESSION_SECRET` (already configured)
- `STRIPE_SECRET_KEY` (add later when ready for payments)
- `VITE_STRIPE_PUBLIC_KEY` (add later when ready for payments)

## 🏠 Self-Hosting Alternative

If you prefer to host elsewhere, you have all the code. Requirements:
- Node.js 18+
- PostgreSQL database
- SSL certificate for HTTPS
- Domain DNS configuration

**Popular hosting options:**
- DigitalOcean ($12-24/month)
- AWS EC2 ($15-30/month)
- Google Cloud Run ($10-25/month)
- Linode ($10-20/month)

## 📁 File Structure
```
profitpad/
├── client/src/           # React frontend
├── server/              # Express backend
├── shared/              # Shared TypeScript types
├── components.json      # UI component config
├── package.json         # Dependencies
├── vite.config.ts       # Build configuration
└── drizzle.config.ts    # Database configuration
```

## 🔐 Admin Account
Your account (mequeamaddox@gmail.com) is set as admin and bypasses all subscription checks.

## 💳 Payment Integration (Later)
When ready to add Stripe:
1. Get API keys from Stripe dashboard
2. Add to environment variables
3. Billing page will automatically enable real payments

## 📞 Support
For deployment issues, contact Replit support or reference their deployment documentation.