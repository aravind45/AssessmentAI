# Analytics Setup Guide

## 🚀 Google Analytics 4 Integration

This guide will help you set up Google Analytics 4 (GA4) for your AssessmentAI platform to track user behavior, assessment performance, and AI usage.

## 📊 What We Track

### User Authentication
- User registrations
- User logins/logouts
- Authentication errors

### Assessment Activity
- Assessment starts and completions
- Assessment abandonment rates
- Time spent on assessments
- Question-by-question progress
- Score distributions

### AI Help Usage
- AI hint requests
- AI explanation requests
- AI response quality metrics
- Feature adoption rates

### User Engagement
- Page views and navigation
- Time spent on different pages
- File uploads and downloads
- Dashboard usage

### Performance Metrics
- Page load times
- Error tracking
- User flow analysis

## 🔧 Setup Instructions

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Create an account name (e.g., "AssessmentAI")
4. Choose your data sharing settings
5. Create a property:
   - Property name: "AssessmentAI Platform"
   - Reporting time zone: Your timezone
   - Currency: Your preferred currency
6. Choose "Web" as your platform
7. Enter your website URL
8. Copy your **Measurement ID** (format: G-XXXXXXXXXX)

### Step 2: Configure Environment Variables

1. **Local Development:**
   - Copy `.env.example` to `.env`
   - Add your Measurement ID:
     ```
     VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```

2. **Vercel Production:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name**: `VITE_GA_MEASUREMENT_ID`
     - **Value**: `G-XXXXXXXXXX`
     - **Environment**: Production, Preview, Development

### Step 3: Verify Installation

1. Deploy your changes to Vercel
2. Visit your live site
3. Open browser developer tools → Network tab
4. Look for requests to `googletagmanager.com`
5. In Google Analytics, go to Reports → Realtime to see live data

## 📈 Key Metrics to Monitor

### User Acquisition
- **New vs Returning Users**: Track user retention
- **Traffic Sources**: See how users find your platform
- **Geographic Distribution**: Understand your user base

### User Engagement
- **Session Duration**: How long users stay
- **Pages per Session**: User exploration depth
- **Bounce Rate**: Single-page visits

### Assessment Performance
- **Assessment Completion Rate**: % of started assessments completed
- **Average Assessment Time**: Time spent per assessment
- **Question Difficulty Analysis**: Which questions cause abandonment
- **Score Distribution**: Performance patterns

### AI Feature Adoption
- **AI Help Usage Rate**: % of users using AI features
- **Hint vs Explanation Preference**: Feature usage patterns
- **AI Request Success Rate**: Technical performance

### Conversion Funnel
1. **Homepage Visit** → Registration
2. **Registration** → First Assessment Creation
3. **Assessment Creation** → Question Upload
4. **Question Upload** → Assessment Completion

## 🎯 Custom Events We Track

### Authentication Events
```javascript
// User registration
gtag('event', 'sign_up', {
  method: 'email'
})

// User login
gtag('event', 'login', {
  method: 'email'
})
```

### Assessment Events
```javascript
// Assessment started
gtag('event', 'assessment_started', {
  assessment_id: 'rag-assessment',
  assessment_name: 'RAG Assessment'
})

// Assessment completed
gtag('event', 'assessment_completed', {
  assessment_id: 'rag-assessment',
  score_percentage: 85,
  time_spent_seconds: 1200,
  question_count: 20
})
```

### AI Usage Events
```javascript
// AI hint requested
gtag('event', 'ai_hint_requested', {
  assessment_id: 'rag-assessment',
  question_number: 5,
  question_type: 'multiple-choice'
})
```

## 📊 Recommended Dashboard Setup

### 1. User Overview Dashboard
- Active users (daily/weekly/monthly)
- New user acquisition
- User retention rates
- Geographic distribution

### 2. Assessment Performance Dashboard
- Total assessments created
- Total assessments taken
- Completion rates by assessment type
- Average scores and time spent

### 3. AI Feature Dashboard
- AI help usage rates
- Most requested question types for AI help
- AI response success rates
- Feature adoption over time

### 4. Technical Performance Dashboard
- Page load times
- Error rates
- API response times
- User flow drop-off points

## 🔍 Advanced Analytics Setup

### Custom Dimensions (Optional)
Set up custom dimensions in GA4 for deeper insights:

1. **User Type**: Free vs Premium (for future)
2. **Assessment Category**: Subject matter classification
3. **Question Difficulty**: Easy/Medium/Hard
4. **AI Model Used**: Track different AI models

### Goals and Conversions
Set up conversion goals:

1. **User Registration**: New account creation
2. **First Assessment**: User creates their first assessment
3. **Assessment Completion**: User completes an assessment
4. **AI Feature Usage**: User tries AI help

### Audience Segments
Create user segments:

1. **Active Creators**: Users who create assessments
2. **Active Takers**: Users who primarily take assessments
3. **AI Power Users**: Heavy AI feature users
4. **At-Risk Users**: Users showing abandonment patterns

## 🚨 Privacy and Compliance

### GDPR Compliance
- Analytics data is anonymized
- No personally identifiable information is tracked
- Users can opt-out of analytics tracking

### Data Retention
- Set appropriate data retention periods in GA4
- Regularly review and clean up old data
- Follow local privacy regulations

## 🛠️ Troubleshooting

### Analytics Not Working?
1. Check browser console for errors
2. Verify Measurement ID is correct
3. Check network requests to Google Analytics
4. Ensure environment variables are set correctly

### No Data in Reports?
1. Wait 24-48 hours for data to appear
2. Check Real-time reports for immediate data
3. Verify events are being sent correctly
4. Check GA4 property settings

### Custom Events Not Showing?
1. Verify event names match GA4 requirements
2. Check event parameters are correctly formatted
3. Use GA4 DebugView for real-time debugging
4. Ensure gtag is properly initialized

## 📞 Support

For analytics setup issues:
1. Check Google Analytics Help Center
2. Use GA4 DebugView for troubleshooting
3. Review browser console for JavaScript errors
4. Contact support with specific error messages

## 🎯 Success Metrics

Track these KPIs to measure platform success:

### User Growth
- Monthly Active Users (MAU)
- User Registration Rate
- User Retention (Day 1, 7, 30)

### Platform Usage
- Assessments Created per User
- Assessment Completion Rate
- Average Session Duration

### Feature Adoption
- AI Help Usage Rate
- Excel Upload Success Rate
- Dashboard Engagement

### Quality Metrics
- User Satisfaction (through behavior)
- Error Rates
- Performance Metrics

Remember: Analytics is about understanding your users and improving their experience, not just collecting data!