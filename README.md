# Email Campaign Analyzer

A powerful web application for analyzing email campaign performance by automatically detecting templates and comparing their effectiveness.

## Features

- **Automatic Template Detection**: Identifies different email styles/templates from your campaign data
- **Research-Based Template Recognition**: Specifically detects your new research-based outreach approach
- **Performance Analytics**: Compare open rates, click rates, and reply rates across templates
- **Subject Line Analysis**: Insights on subject line characteristics and their impact
- **Interactive Visualizations**: Charts and graphs for easy data interpretation
- **Client-Side Processing**: All data processing happens in your browser - no data uploaded to servers
- **Export Functionality**: Download analysis reports as JSON

## Template Detection

The analyzer automatically identifies several email template types:

1. **Research-Based Outreach** (Your new style)
   - Pattern: Personalized observation → Relevant question → Social proof → CTA
   - Identifies emails with research mentions, curiosity-based questions, and success stories

2. **Direct Question** - Quick, straightforward asks
3. **Partnership Pitch** - Collaboration-focused messaging
4. **Product Demo Offer** - Free trials and demos
5. **Short & Direct** - Concise messages (≤5 lines)
6. **Long-Form Narrative** - Detailed explanations (15+ lines)
7. **Standard Outreach** - Traditional cold email format

## CSV Format Requirements

Your CSV file should include these columns (column names are flexible):

### Required Fields:
- **Email Body**: `body`, `Body`, `Email Body`, or `content`
- **Subject Line**: `subject`, `Subject`, or `Subject Line`
- **Opens**: `opens`, `Opens`, or `opened`
- **Clicks**: `clicks`, `Clicks`, or `clicked`
- **Replies**: `replies`, `Replies`, or `replied`

### Optional Fields:
- **Recipient**: `to`, `To`, or `recipient`
- **Date**: `date`, `Date`, or `Sent Date`

### Example CSV Structure:
```csv
subject,body,to,date,opens,clicks,replies
"Quick question about your CNA program","Hi Sarah,

Noticed your hospital recently expanded the CNA program by 30%...

Wondering if you're seeing retention challenges with new hires?

Mercy Health was able to increase retention by 45% through our RN pathway program...

Would you be open to a brief call?

-Jack",sarah@hospital.com,2024-11-15,1,1,0
```

## Installation & Deployment

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd email-campaign-analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Run locally**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Deploy to Vercel

#### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

Follow the prompts to link your project and deploy.

#### Option 2: GitHub Integration

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

Vercel will automatically detect the Vite configuration and deploy your app.

#### Option 3: Vercel Dashboard Upload

1. **Build the project**
```bash
npm run build
```

2. **Upload to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Drag and drop the `dist` folder

### Configuration

No environment variables required - the app runs entirely client-side.

## Usage

1. **Upload Your CSV**
   - Click the upload area or drag & drop your CSV file
   - The file is processed entirely in your browser (secure & private)

2. **Review Overall Metrics**
   - Total emails, overall open/click/reply rates
   - Baseline performance metrics

3. **Analyze Template Performance**
   - Bar charts comparing performance across templates
   - Pie chart showing email volume distribution
   - Detailed breakdowns for each template type

4. **Check Your New Research-Based Approach**
   - Look for the "New Style" badge
   - Compare its performance vs. overall averages
   - See specific improvement metrics

5. **Subject Line Insights**
   - Question marks vs. statements
   - Short vs. long subject lines
   - Performance comparison

6. **Export Results**
   - Click "Export Report" to download a JSON file
   - Use for further analysis or record-keeping

## Technical Details

### Built With
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled required
- Recommended: Latest browser versions

### Data Privacy
- All processing happens client-side
- No data sent to external servers
- CSV files never leave your computer
- Safe for sensitive campaign data

## Customization

### Adding New Template Patterns

Edit `src/EmailAnalyzer.jsx` and modify the `analyzeTemplate` function:

```javascript
// Add your custom pattern
if (body.includes('your-keyword') && body.includes('another-keyword')) {
  return { type: 'Your Custom Template', score: 1 };
}
```

### Adjusting Research-Based Pattern

Modify the `RESEARCH_PATTERN` object in `src/EmailAnalyzer.jsx`:

```javascript
const RESEARCH_PATTERN = {
  name: 'Research-Based Outreach',
  indicators: [
    /your-custom-pattern/i,
    // Add more regex patterns
  ],
  structure: ['greeting', 'observation', 'question', 'social_proof', 'cta']
};
```

### Styling

Modify colors and theme in `src/EmailAnalyzer.jsx`:

```javascript
const COLORS = ['#3b82f6', '#10b981', ...]; // Chart colors
```

Or update Tailwind classes throughout the component.

## Troubleshooting

### CSV Not Parsing
- Ensure CSV is properly formatted with headers
- Check for proper quote escaping in email bodies
- Verify column names match expected formats

### Templates Not Detected
- Increase the minimum match threshold (currently 3 indicators)
- Add more pattern variations to `RESEARCH_PATTERN.indicators`
- Check email body formatting (whitespace, line breaks)

### Performance Issues
- Large CSV files (10k+ rows) may take time to process
- Consider batch processing or filtering data
- Close other browser tabs if experiencing slowdown

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Future Enhancements

Potential improvements for v2:

- [ ] Sentiment analysis of email body
- [ ] A/B test significance testing
- [ ] Time-series performance tracking
- [ ] Multi-file comparison
- [ ] Custom template training
- [ ] HubSpot direct integration
- [ ] Email preview modal
- [ ] Advanced filtering options
- [ ] PDF report generation
- [ ] Machine learning template clustering

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review CSV format requirements
3. Verify browser console for errors
4. Test with a smaller sample CSV first

## License

MIT License - feel free to modify and use for your needs.

---

Built for AllCampus Workplace email campaign optimization.
