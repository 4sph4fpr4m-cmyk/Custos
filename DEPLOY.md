# Custos — Deployment Guide

## What You're Deploying

Custos is a single-page React app with one backend endpoint (an API proxy for Claude). This guide gets you from zero to live on custos.faith using **Vercel** (free tier works fine).

## Prerequisites

- A domain (custos.faith)
- A Vercel account (free at vercel.com)
- An Anthropic API key (from console.anthropic.com)
- Node.js 18+ installed locally
- Git installed

## Directory Structure

```
custos-deploy/
├── public/
│   ├── index.html          ← Landing page + app shell
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← Service worker (offline support)
│   └── icon-512.png        ← App icon (you'll add this)
├── api/
│   └── guidance.js         ← Serverless API proxy for Claude
├── src/
│   └── custos-app.jsx      ← The main app (copy from outputs)
├── package.json
├── vercel.json
└── DEPLOY.md               ← This file
```

## Step-by-Step

### 1. Set Up the Project

```bash
cd custos-deploy
npm install
```

### 2. Copy Your App

Copy `custos-app.jsx` from your Claude outputs into `src/`:

```bash
cp /path/to/custos-app.jsx src/custos-app.jsx
```

### 3. Add Your API Key

Create a `.env` file (never commit this):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Test Locally

```bash
npx vercel dev
```

Open http://localhost:3000. The landing page loads, tap "Enter Custos" to launch the app. Try asking a moral question — it should now work with real API responses.

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

### 6. Add Your Domain

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add `custos.faith`
3. Update your DNS:
   - If using Vercel DNS: point nameservers to Vercel
   - If using external DNS: add a CNAME record pointing to `cname.vercel-dns.com`

### 7. Set Environment Variable in Vercel

In your project dashboard:
1. Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` with your key
3. Redeploy

## PWA Installation

Once deployed with HTTPS (automatic on Vercel), users can:
- **iOS**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → Menu → "Install app"
- **Desktop**: Chrome → Address bar install icon

The app will have its own icon, splash screen, and work offline for cached pages.

## Cost Estimates

- **Vercel hosting**: Free tier covers ~100K requests/month
- **Anthropic API**: ~$0.003-0.015 per guidance request (Sonnet)
  - 1,000 questions/month ≈ $3-15
  - 10,000 questions/month ≈ $30-150
- **Domain**: ~$10-15/year for .faith TLD

## Security Notes

- The API key lives server-side only (in `api/guidance.js`), never exposed to the browser
- User questions are sent to Claude but not stored by Custos
- Add rate limiting if you expect public traffic (see Vercel's rate limit docs)
- Consider adding a simple abuse filter for the input
