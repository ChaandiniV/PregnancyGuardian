# Deployment Guide - Pregnancy Health Assessment App

Your app is now configured for deployment on multiple free hosting platforms. Choose one of the options below:

## Option 1: Netlify (Recommended for beginners)

1. **Sign up** at [netlify.com](https://netlify.com) (free account)
2. **Connect your GitHub account** and import this repository
3. **Build settings** are already configured in `netlify.toml`
4. **Environment variables needed:**
   - `OPENAI_API_KEY` (if using AI features)
5. **Deploy** - Your app will be live at `https://your-app-name.netlify.app`

## Option 2: Vercel

1. **Sign up** at [vercel.com](https://vercel.com) (free account)
2. **Import your GitHub repository**
3. **Build settings** are configured in `vercel.json`
4. **Add environment variables** in Vercel dashboard
5. **Deploy** - Live at `https://your-app-name.vercel.app`

## Option 3: Railway

1. **Sign up** at [railway.app](https://railway.app) (free $5 credit monthly)
2. **Deploy from GitHub** - settings in `railway.json`
3. **Add environment variables** in Railway dashboard
4. **Deploy** - Live at `https://your-app-name-production.up.railway.app`

## Option 4: Render

1. **Sign up** at [render.com](https://render.com) (free tier available)
2. **Create new Web Service** from GitHub
3. **Build settings** are in `render.yaml`
4. **Add environment variables** in Render dashboard
5. **Deploy** - Live at `https://your-app-name.onrender.com`

## Option 5: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Sign up**: `fly auth signup`
3. **Deploy**: `fly launch` (Dockerfile is ready)
4. **Add secrets**: `fly secrets set OPENAI_API_KEY=your_key`

## Required Environment Variables

For any platform, you'll need to set:

```
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
```

## Quick Start (Netlify - Easiest)

1. Push this code to a GitHub repository
2. Go to netlify.com and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Add your OpenAI API key in Site Settings → Environment Variables
7. Deploy!

Your app will be live in 2-3 minutes with a public URL you can share anywhere.

## Need Help?

- All platforms offer free tiers perfect for your app
- Netlify and Vercel are the easiest for beginners
- Railway and Render offer more backend features
- Choose based on your comfort level with the platform

Your pregnancy health assessment app is production-ready and will work on any of these platforms!