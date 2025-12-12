# Technical Architecture & Customization Guide

## System Overview

This application is a client-side React application that processes CSV data to identify email templates and analyze their performance. All processing happens in the browser - no backend required.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                       │
│                                                       │
│  ┌──────────────┐      ┌────────────────────┐      │
│  │ CSV Upload   │ ───> │  CSV Parser        │      │
│  │ Component    │      │  (parseCSV)        │      │
│  └──────────────┘      └────────────────────┘      │
│                                 │                    │
│                                 ▼                    │
│                        ┌────────────────────┐       │
│                        │ Template Analyzer  │       │
│                        │ (analyzeTemplate)  │       │
│                        └────────────────────┘       │
│                                 │                    │
│                                 ▼                    │
│                        ┌────────────────────┐       │
│                        │ Metrics Calculator │       │
│                        │ (calculateMetrics) │       │
│                        └────────────────────┘       │
│                                 │                    │
│                                 ▼                    │
│                        ┌────────────────────┐       │
│                        │  Data Aggregation  │       │
│                        │  (analyzeEmails)   │       │
│                        └────────────────────┘       │
│                                 │                    │
│                                 ▼                    │
│                        ┌────────────────────┐       │
│                        │   Visualization    │       │
│                        │ (Recharts + UI)    │       │
│                        └────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Key Components

### 1. CSV Parser (`parseCSV`)
**Location**: Lines 40-64 in `EmailAnalyzer.jsx`

Handles CSV parsing with proper quote escaping:
- Splits on commas outside quotes
- Handles multi-line fields
- Flexible header matching

**To Modify**: Add additional column name variations
```javascript
const bodyField = email.body || email.Body || email['Email Body'] || 
                  email.content || email.message; // Add 'message' variant
```

### 2. Template Analyzer (`analyzeTemplate`)
**Location**: Lines 67-108 in `EmailAnalyzer.jsx`

Identifies email templates using pattern matching:
- Research-Based: 3+ matching indicators
- Other templates: Keyword and structure-based

**To Add New Template**:
```javascript
// Add after line 82
if (body.includes('schedule') && body.includes('demo')) {
  return { type: 'Demo Scheduler', score: 1 };
}
```

**To Modify Research Pattern**:
```javascript
// Lines 19-27
const RESEARCH_PATTERN = {
  name: 'Research-Based Outreach',
  indicators: [
    /noticed|saw|came across|found/i,
    /wondering|curious|interested to know/i,
    /was able to|achieved|accomplished/i,
    /would you|are you/i,
    /your custom pattern/i // Add new pattern
  ],
  structure: ['greeting', 'observation', 'question', 'social_proof', 'cta']
};
```

### 3. Metrics Calculator (`calculateMetrics`)
**Location**: Lines 111-122 in `EmailAnalyzer.jsx`

Extracts engagement metrics with flexible column naming:
```javascript
const opens = parseInt(email.opens || email.Opens || email.opened || 0);
```

**To Add New Metric**:
```javascript
const bounces = parseInt(email.bounces || email.Bounces || 0);
return {
  opened: opens > 0,
  clicked: clicks > 0,
  replied: replies > 0,
  bounced: bounces > 0, // Add new metric
  opens, clicks, replies, bounces
};
```

### 4. Subject Line Analyzer (`analyzeSubject`)
**Location**: Lines 125-135 in `EmailAnalyzer.jsx`

Analyzes subject line characteristics:
- Length
- Question marks
- Personalization tokens
- Numbers
- Emojis

**To Add Analysis**:
```javascript
return {
  length: subject.length,
  hasQuestion: subject.includes('?'),
  hasPersonalization: /\{|\[|first|name/i.test(subject),
  hasNumbers: /\d/.test(subject),
  hasEmoji: /[\u{1F600}-\u{1F64F}]/u.test(subject),
  hasUrgency: /urgent|asap|immediately|today/i.test(subject), // New
  wordCount: subject.split(' ').length // New
};
```

### 5. Main Analysis Engine (`analyzeEmails`)
**Location**: Lines 138-228 in `EmailAnalyzer.jsx`

Aggregates all data:
- Groups emails by template
- Calculates performance rates
- Generates subject line insights
- Computes overall metrics

**Data Structure**:
```javascript
templateGroups[templateType] = {
  name: string,
  count: number,
  opens: number,
  clicks: number,
  replies: number,
  totalOpens: number,
  totalClicks: number,
  totalReplies: number,
  avgLength: number,
  totalLength: number,
  emails: Array<{subject, body, metrics, sentDate, recipient}>
}
```

## Customization Examples

### Add Sentiment Analysis

Install sentiment library:
```bash
npm install sentiment
```

Modify `analyzeTemplate`:
```javascript
import Sentiment from 'sentiment';
const sentiment = new Sentiment();

const analyzeTemplate = (emailBody) => {
  const result = sentiment.analyze(emailBody);
  const sentimentScore = result.score;
  
  // Rest of function...
  return { 
    type: 'Your Template', 
    score: 1,
    sentiment: sentimentScore // Add sentiment
  };
};
```

### Add Time-Based Analysis

Modify `analyzeEmails` to group by date:
```javascript
emails.forEach(email => {
  const date = new Date(email.date || email.Date);
  const week = getWeekNumber(date); // Helper function
  
  if (!weeklyMetrics[week]) {
    weeklyMetrics[week] = { opens: 0, count: 0 };
  }
  weeklyMetrics[week].count++;
  if (metrics.opened) weeklyMetrics[week].opens++;
});
```

### Add Machine Learning Clustering

Install clustering library:
```bash
npm install ml-kmeans
```

```javascript
import kmeans from 'ml-kmeans';

// Convert emails to feature vectors
const features = emails.map(email => [
  email.body.length,
  (email.body.match(/\?/g) || []).length,
  sentiment.analyze(email.body).score
]);

// Cluster
const result = kmeans(features, 5);
// Use result.clusters to group emails
```

### Add Custom Visualizations

```javascript
// Add new chart component
<ResponsiveContainer width="100%" height={300}>
  <ScatterChart data={scatterData}>
    <XAxis dataKey="length" />
    <YAxis dataKey="openRate" />
    <Scatter name="Emails" data={scatterData} fill="#8884d8" />
  </ScatterChart>
</ResponsiveContainer>
```

## Performance Optimization

### For Large Datasets (10k+ emails)

1. **Batch Processing**:
```javascript
const BATCH_SIZE = 1000;
const batches = [];
for (let i = 0; i < emails.length; i += BATCH_SIZE) {
  batches.push(emails.slice(i, i + BATCH_SIZE));
}

// Process batches with progress indicator
```

2. **Web Workers** (for heavy computation):
```javascript
// Create worker file: src/analyzer.worker.js
self.onmessage = (e) => {
  const results = analyzeEmails(e.data);
  self.postMessage(results);
};

// In main component:
const worker = new Worker('analyzer.worker.js');
worker.postMessage(emailData);
worker.onmessage = (e) => setAnalysis(e.data);
```

3. **Memoization**:
```javascript
import { useMemo } from 'react';

const processedData = useMemo(() => {
  return expensiveProcessing(data);
}, [data]); // Only recompute when data changes
```

## Data Flow

```
CSV Upload → Parse CSV → For Each Email:
                           ↓
              1. Identify Template (pattern matching)
                           ↓
              2. Extract Metrics (opens, clicks, replies)
                           ↓
              3. Analyze Subject (length, style)
                           ↓
              4. Group by Template Type
                           ↓
          Aggregate Metrics by Group
                           ↓
          Calculate Rates & Comparisons
                           ↓
          Render Visualizations
```

## State Management

```javascript
const [data, setData] = useState([]);           // Raw CSV data
const [loading, setLoading] = useState(false);  // Loading state
const [analysis, setAnalysis] = useState(null); // Processed results
```

Analysis structure:
```javascript
{
  templateGroups: [
    {
      name: "Template Name",
      count: 100,
      openRate: "45.5",
      clickRate: "12.3",
      replyRate: "3.4",
      avgLength: 450,
      emails: [...]
    }
  ],
  overall: {
    totalEmails: 500,
    totalOpens: 250,
    openRate: "50.0",
    // ...
  },
  subjectAnalysis: {
    withQuestion: { opens: 50, total: 100 },
    // ...
  }
}
```

## Testing

### Unit Test Example
```javascript
describe('analyzeTemplate', () => {
  it('identifies research-based emails', () => {
    const email = `
      Hi John,
      Noticed your recent expansion...
      Wondering if you're seeing challenges?
      ABC Corp was able to achieve 40%...
      Would you be open to a call?
    `;
    const result = analyzeTemplate(email);
    expect(result.type).toBe('Research-Based Outreach');
    expect(result.score).toBeGreaterThanOrEqual(3);
  });
});
```

### Integration Test
```javascript
describe('Email Analysis Pipeline', () => {
  it('processes CSV end-to-end', () => {
    const csv = `subject,body,opens,clicks,replies
"Test","Body text",1,0,0`;
    
    const parsed = parseCSV(csv);
    const results = analyzeEmails(parsed);
    
    expect(results.overall.totalEmails).toBe(1);
    expect(results.templateGroups.length).toBeGreaterThan(0);
  });
});
```

## Deployment Checklist

- [ ] Test locally with sample data
- [ ] Verify all dependencies in package.json
- [ ] Check .gitignore includes node_modules, .env
- [ ] Build succeeds: `npm run build`
- [ ] Preview build: `npm run preview`
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Verify environment (Vercel auto-detects Vite)
- [ ] Test deployed version
- [ ] Monitor performance in Vercel dashboard

## File Structure

```
email-campaign-analyzer/
├── src/
│   ├── EmailAnalyzer.jsx    # Main component (500+ lines)
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind directives
├── public/                  # Static assets (none yet)
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vercel.json              # Vercel deployment config
├── .gitignore              # Git ignore rules
├── README.md               # User documentation
├── DEPLOY.md               # Quick deployment guide
├── ARCHITECTURE.md         # This file
└── sample-data.csv         # Test data
```

## Common Issues & Solutions

### Issue: CSV Not Parsing
**Solution**: Check quote escaping in parseCSV function. Verify line 46-56.

### Issue: Templates Not Detected
**Solution**: Lower threshold from 3 to 2 matches, or add more pattern variations.

### Issue: Performance Slow
**Solution**: Implement batch processing or web workers for datasets >5k.

### Issue: Build Fails
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Styling Not Applied
**Solution**: Verify Tailwind config includes correct content paths.

## Future Architecture Considerations

1. **Backend Integration**: Add Node.js backend for HubSpot API integration
2. **Database**: Store historical analysis for trend tracking
3. **Real-time**: WebSocket connection for live campaign monitoring
4. **ML Model**: Train custom model for template classification
5. **Export**: Add PDF/Excel export beyond JSON

## Contributing

When extending the application:
1. Follow existing code style
2. Add comments for complex logic
3. Update this documentation
4. Test with various CSV formats
5. Consider performance impact

---

**Questions?** Refer to README.md for user-facing docs, or check inline comments in EmailAnalyzer.jsx
