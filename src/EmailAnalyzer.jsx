import React, { useState, useMemo } from 'react';
import { Upload, TrendingUp, Mail, Target, BarChart3, FileText, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EmailAnalyzer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Template patterns
  const RESEARCH_PATTERN = {
    name: 'Research-Based Outreach',
    indicators: [
      /noticed|saw|came across|found|read about/i,
      /wondering|curious|interested to know/i,
      /was able to|achieved|accomplished|saw results/i,
      /would you|are you|have you considered/i
    ],
    structure: ['greeting', 'observation', 'question', 'social_proof', 'cta']
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
    
    return rows;
  };

  // Analyze email template
  const analyzeTemplate = (emailBody) => {
    if (!emailBody) return { type: 'Unknown', score: 0 };
    
    const body = emailBody.toLowerCase();
    const lines = emailBody.split('\n').filter(l => l.trim());
    
    // Check for research-based pattern
    const researchMatches = RESEARCH_PATTERN.indicators.filter(pattern => 
      pattern.test(body)
    ).length;
    
    if (researchMatches >= 3) {
      return { type: 'Research-Based Outreach', score: researchMatches };
    }
    
    // Check for other common patterns
    if (body.includes('quick question') || body.includes('reaching out')) {
      return { type: 'Direct Question', score: 1 };
    }
    
    if (body.includes('partnership') || body.includes('collaborate')) {
      return { type: 'Partnership Pitch', score: 1 };
    }
    
    if (body.includes('free') || body.includes('demo') || body.includes('trial')) {
      return { type: 'Product Demo Offer', score: 1 };
    }
    
    if (lines.length <= 5) {
      return { type: 'Short & Direct', score: 1 };
    }
    
    if (lines.length >= 15) {
      return { type: 'Long-Form Narrative', score: 1 };
    }
    
    return { type: 'Standard Outreach', score: 0 };
  };

  // Calculate email metrics
  const calculateMetrics = (email) => {
    const opens = parseInt(email.opens || email.Opens || email.opened || 0);
    const clicks = parseInt(email.clicks || email.Clicks || email.clicked || 0);
    const replies = parseInt(email.replies || email.Replies || email.replied || 0);
    
    return {
      opened: opens > 0,
      clicked: clicks > 0,
      replied: replies > 0,
      opens,
      clicks,
      replies
    };
  };

  // Analyze subject line
  const analyzeSubject = (subject) => {
    if (!subject) return { length: 0, hasQuestion: false, hasPersonalization: false };
    
    return {
      length: subject.length,
      hasQuestion: subject.includes('?'),
      hasPersonalization: /\{|\[|first|name/i.test(subject),
      hasNumbers: /\d/.test(subject),
      hasEmoji: /[\u{1F600}-\u{1F64F}]/u.test(subject)
    };
  };

  // Main analysis function
  const analyzeEmails = (emails) => {
    const templateGroups = {};
    const subjectAnalysis = {
      withQuestion: { opens: 0, total: 0 },
      withoutQuestion: { opens: 0, total: 0 },
      shortSubject: { opens: 0, total: 0 },
      longSubject: { opens: 0, total: 0 }
    };

    emails.forEach(email => {
      const bodyField = email.body || email.Body || email['Email Body'] || email.content || '';
      const subjectField = email.subject || email.Subject || email['Subject Line'] || '';
      
      const template = analyzeTemplate(bodyField);
      const metrics = calculateMetrics(email);
      const subject = analyzeSubject(subjectField);
      
      // Group by template
      if (!templateGroups[template.type]) {
        templateGroups[template.type] = {
          name: template.type,
          count: 0,
          opens: 0,
          clicks: 0,
          replies: 0,
          totalOpens: 0,
          totalClicks: 0,
          totalReplies: 0,
          avgLength: 0,
          totalLength: 0,
          emails: []
        };
      }
      
      const group = templateGroups[template.type];
      group.count++;
      group.totalLength += bodyField.length;
      group.avgLength = Math.round(group.totalLength / group.count);
      
      if (metrics.opened) group.opens++;
      if (metrics.clicked) group.clicks++;
      if (metrics.replied) group.replies++;
      
      group.totalOpens += metrics.opens;
      group.totalClicks += metrics.clicks;
      group.totalReplies += metrics.replies;
      
      group.emails.push({
        subject: subjectField,
        body: bodyField,
        metrics,
        sentDate: email.date || email.Date || email['Sent Date'] || '',
        recipient: email.to || email.To || email.recipient || ''
      });
      
      // Subject analysis
      if (subject.hasQuestion) {
        subjectAnalysis.withQuestion.total++;
        if (metrics.opened) subjectAnalysis.withQuestion.opens++;
      } else {
        subjectAnalysis.withoutQuestion.total++;
        if (metrics.opened) subjectAnalysis.withoutQuestion.opens++;
      }
      
      if (subject.length < 40) {
        subjectAnalysis.shortSubject.total++;
        if (metrics.opened) subjectAnalysis.shortSubject.opens++;
      } else {
        subjectAnalysis.longSubject.total++;
        if (metrics.opened) subjectAnalysis.longSubject.opens++;
      }
    });

    // Calculate rates
    Object.values(templateGroups).forEach(group => {
      group.openRate = group.count > 0 ? ((group.opens / group.count) * 100).toFixed(1) : 0;
      group.clickRate = group.count > 0 ? ((group.clicks / group.count) * 100).toFixed(1) : 0;
      group.replyRate = group.count > 0 ? ((group.replies / group.count) * 100).toFixed(1) : 0;
    });

    // Overall metrics
    const overall = {
      totalEmails: emails.length,
      totalOpens: emails.filter(e => calculateMetrics(e).opened).length,
      totalClicks: emails.filter(e => calculateMetrics(e).clicked).length,
      totalReplies: emails.filter(e => calculateMetrics(e).replied).length
    };
    
    overall.openRate = ((overall.totalOpens / overall.totalEmails) * 100).toFixed(1);
    overall.clickRate = ((overall.totalClicks / overall.totalEmails) * 100).toFixed(1);
    overall.replyRate = ((overall.totalReplies / overall.totalEmails) * 100).toFixed(1);

    return {
      templateGroups: Object.values(templateGroups).sort((a, b) => b.count - a.count),
      overall,
      subjectAnalysis
    };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSV(text);
        setData(parsed);
        
        const results = analyzeEmails(parsed);
        setAnalysis(results);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const exportReport = () => {
    if (!analysis) return;
    
    const report = {
      generatedAt: new Date().toISOString(),
      overall: analysis.overall,
      templates: analysis.templateGroups.map(g => ({
        name: g.name,
        count: g.count,
        openRate: g.openRate,
        clickRate: g.clickRate,
        replyRate: g.replyRate,
        avgLength: g.avgLength
      })),
      subjectAnalysis: analysis.subjectAnalysis
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-analysis-${Date.now()}.json`;
    a.click();
  };

  const performanceData = useMemo(() => {
    if (!analysis) return [];
    return analysis.templateGroups.map(group => ({
      name: group.name.length > 20 ? group.name.substring(0, 20) + '...' : group.name,
      'Open Rate': parseFloat(group.openRate),
      'Click Rate': parseFloat(group.clickRate),
      'Reply Rate': parseFloat(group.replyRate),
      Count: group.count
    }));
  }, [analysis]);

  const volumeData = useMemo(() => {
    if (!analysis) return [];
    return analysis.templateGroups.map(group => ({
      name: group.name.length > 20 ? group.name.substring(0, 20) + '...' : group.name,
      value: group.count
    }));
  }, [analysis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Email Campaign Analyzer</h1>
          </div>
          <p className="text-blue-200 text-lg">
            Upload your email campaign data to identify templates and analyze performance
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-2xl">
            <div className="max-w-md mx-auto">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                <div className="flex flex-col items-center justify-center pt-7">
                  <Upload className="w-16 h-16 text-blue-400 mb-4" />
                  <p className="text-xl font-semibold text-white mb-2">
                    Upload CSV File
                  </p>
                  <p className="text-sm text-blue-200">
                    Include: recipient, subject, body, opens, clicks, replies
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <p className="text-blue-200 mt-2">Processing emails...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setData([]);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                ← Upload New File
              </button>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <h3 className="text-white/70 text-sm font-medium">Total Emails</h3>
                </div>
                <p className="text-3xl font-bold text-white">{analysis.overall.totalEmails}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h3 className="text-white/70 text-sm font-medium">Open Rate</h3>
                </div>
                <p className="text-3xl font-bold text-white">{analysis.overall.openRate}%</p>
                <p className="text-sm text-white/60 mt-1">{analysis.overall.totalOpens} opens</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h3 className="text-white/70 text-sm font-medium">Click Rate</h3>
                </div>
                <p className="text-3xl font-bold text-white">{analysis.overall.clickRate}%</p>
                <p className="text-sm text-white/60 mt-1">{analysis.overall.totalClicks} clicks</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                  <h3 className="text-white/70 text-sm font-medium">Reply Rate</h3>
                </div>
                <p className="text-3xl font-bold text-white">{analysis.overall.replyRate}%</p>
                <p className="text-sm text-white/60 mt-1">{analysis.overall.totalReplies} replies</p>
              </div>
            </div>

            {/* Performance Comparison Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Template Performance Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Open Rate" fill="#3b82f6" />
                  <Bar dataKey="Click Rate" fill="#8b5cf6" />
                  <Bar dataKey="Reply Rate" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Email Volume by Template</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={volumeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Line Analysis */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Subject Line Insights</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">With Question Mark</span>
                      <span className="text-blue-400 font-bold">
                        {analysis.subjectAnalysis.withQuestion.total > 0 
                          ? ((analysis.subjectAnalysis.withQuestion.opens / analysis.subjectAnalysis.withQuestion.total) * 100).toFixed(1)
                          : 0}% open rate
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {analysis.subjectAnalysis.withQuestion.total} emails
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Without Question Mark</span>
                      <span className="text-blue-400 font-bold">
                        {analysis.subjectAnalysis.withoutQuestion.total > 0 
                          ? ((analysis.subjectAnalysis.withoutQuestion.opens / analysis.subjectAnalysis.withoutQuestion.total) * 100).toFixed(1)
                          : 0}% open rate
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {analysis.subjectAnalysis.withoutQuestion.total} emails
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Short Subjects (&lt;40 chars)</span>
                      <span className="text-blue-400 font-bold">
                        {analysis.subjectAnalysis.shortSubject.total > 0 
                          ? ((analysis.subjectAnalysis.shortSubject.opens / analysis.subjectAnalysis.shortSubject.total) * 100).toFixed(1)
                          : 0}% open rate
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {analysis.subjectAnalysis.shortSubject.total} emails
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Long Subjects (40+ chars)</span>
                      <span className="text-blue-400 font-bold">
                        {analysis.subjectAnalysis.longSubject.total > 0 
                          ? ((analysis.subjectAnalysis.longSubject.opens / analysis.subjectAnalysis.longSubject.total) * 100).toFixed(1)
                          : 0}% open rate
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {analysis.subjectAnalysis.longSubject.total} emails
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Template Breakdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Template Details & Insights
              </h2>
              
              <div className="space-y-6">
                {analysis.templateGroups.map((group, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                        <p className="text-white/60">
                          {group.count} emails • Avg length: {group.avgLength} characters
                        </p>
                      </div>
                      {group.name === 'Research-Based Outreach' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                          New Style
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <p className="text-blue-300 text-sm mb-1">Open Rate</p>
                        <p className="text-2xl font-bold text-white">{group.openRate}%</p>
                        <p className="text-white/60 text-xs mt-1">
                          {group.opens} / {group.count}
                        </p>
                      </div>
                      
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-purple-300 text-sm mb-1">Click Rate</p>
                        <p className="text-2xl font-bold text-white">{group.clickRate}%</p>
                        <p className="text-white/60 text-xs mt-1">
                          {group.clicks} / {group.count}
                        </p>
                      </div>
                      
                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <p className="text-green-300 text-sm mb-1">Reply Rate</p>
                        <p className="text-2xl font-bold text-white">{group.replyRate}%</p>
                        <p className="text-white/60 text-xs mt-1">
                          {group.replies} / {group.count}
                        </p>
                      </div>
                    </div>

                    {/* Performance vs Overall */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/60 text-sm mb-2">Performance vs. Overall Average:</p>
                      <div className="flex gap-4 text-sm">
                        <span className={`${parseFloat(group.openRate) > parseFloat(analysis.overall.openRate) ? 'text-green-400' : 'text-red-400'}`}>
                          Opens: {parseFloat(group.openRate) > parseFloat(analysis.overall.openRate) ? '+' : ''}{(parseFloat(group.openRate) - parseFloat(analysis.overall.openRate)).toFixed(1)}%
                        </span>
                        <span className={`${parseFloat(group.clickRate) > parseFloat(analysis.overall.clickRate) ? 'text-green-400' : 'text-red-400'}`}>
                          Clicks: {parseFloat(group.clickRate) > parseFloat(analysis.overall.clickRate) ? '+' : ''}{(parseFloat(group.clickRate) - parseFloat(analysis.overall.clickRate)).toFixed(1)}%
                        </span>
                        <span className={`${parseFloat(group.replyRate) > parseFloat(analysis.overall.replyRate) ? 'text-green-400' : 'text-red-400'}`}>
                          Replies: {parseFloat(group.replyRate) > parseFloat(analysis.overall.replyRate) ? '+' : ''}{(parseFloat(group.replyRate) - parseFloat(analysis.overall.replyRate)).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Key Insights</h2>
              <div className="space-y-4 text-white">
                {analysis.templateGroups[0] && (
                  <p className="text-lg">
                    <strong>Top Performing Template:</strong> {analysis.templateGroups[0].name} with {analysis.templateGroups[0].openRate}% open rate
                  </p>
                )}
                
                {analysis.templateGroups.find(g => g.name === 'Research-Based Outreach') && (
                  <div className="bg-white/5 rounded-lg p-4 mt-4">
                    <p className="text-lg font-semibold mb-2">🎯 Your New Research-Based Approach:</p>
                    {(() => {
                      const research = analysis.templateGroups.find(g => g.name === 'Research-Based Outreach');
                      const overall = analysis.overall;
                      return (
                        <>
                          <p>• Sent {research.count} emails with this style</p>
                          <p>• Open rate: {research.openRate}% ({parseFloat(research.openRate) > parseFloat(overall.openRate) ? 'above' : 'below'} average by {Math.abs(parseFloat(research.openRate) - parseFloat(overall.openRate)).toFixed(1)}%)</p>
                          <p>• Reply rate: {research.replyRate}% ({parseFloat(research.replyRate) > parseFloat(overall.replyRate) ? 'above' : 'below'} average by {Math.abs(parseFloat(research.replyRate) - parseFloat(overall.replyRate)).toFixed(1)}%)</p>
                        </>
                      );
                    })()}
                  </div>
                )}
                
                <p>
                  <strong>Subject Line Impact:</strong> Questions in subject lines show{' '}
                  {analysis.subjectAnalysis.withQuestion.total > 0 && analysis.subjectAnalysis.withoutQuestion.total > 0
                    ? ((analysis.subjectAnalysis.withQuestion.opens / analysis.subjectAnalysis.withQuestion.total) * 100 > 
                       (analysis.subjectAnalysis.withoutQuestion.opens / analysis.subjectAnalysis.withoutQuestion.total) * 100
                        ? 'higher' : 'lower')
                    : 'similar'}{' '}
                  engagement than statements
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAnalyzer;
