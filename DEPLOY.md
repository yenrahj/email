# Quick Deployment Guide

## Deploy to Vercel in 3 Steps

### Option 1: GitHub + Vercel (Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main

# 2. Go to vercel.com → New Project → Import from GitHub
# 3. Deploy (Vercel auto-detects Vite config)
```

### Option 2: Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# Follow prompts, done!
```

### Option 3: Manual Build + Upload

```bash
# 1. Build
npm install
npm run build

# 2. Upload 'dist' folder to vercel.com
```

## Test Locally First

```bash
npm install
npm run dev
# Opens at localhost:3000
```

## Using the App

1. Upload your CSV (must have: subject, body, opens, clicks, replies)
2. View automatic template detection
3. Compare performance metrics
4. Export report

## CSV Format Example

```csv
subject,body,to,date,opens,clicks,replies
"Your subject","Email body text here...",email@example.com,2024-11-15,1,0,0
```

## Customize Template Detection

Edit `src/EmailAnalyzer.jsx`:

```javascript
// Line ~40 - Add your patterns
const RESEARCH_PATTERN = {
  indicators: [
    /noticed|saw|came across/i,
    // Add more patterns here
  ]
};
```

## Need Help?

- Check `sample-data.csv` for CSV format
- See `README.md` for full documentation
- Console logs show parsing issues

---

**Built for AllCampus Workplace** | Questions? Check README.md
