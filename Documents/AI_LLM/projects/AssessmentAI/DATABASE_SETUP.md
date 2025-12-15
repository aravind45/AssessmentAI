# Database Setup Guide

## Supabase Database Schema Setup

To set up the database tables for your AssessmentAI application, follow these steps:

### 1. Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project: `https://supabase.com/dashboard/project/chktzonseacamniddifq`

### 2. Run the SQL Schema

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** to execute the schema

### 3. Verify Tables Created

After running the SQL, you should see these tables in the **Table Editor**:

- `profiles` - User profile information
- `custom_questions` - User's uploaded questions
- `assessment_results` - User's test results and scores

### 4. Enable Row Level Security (RLS)

The schema automatically enables RLS with these policies:

**Profiles Table:**
- Users can only view/edit their own profile
- Automatic profile creation on user signup

**Custom Questions Table:**
- Users can only access their own questions
- Full CRUD operations for own questions

**Assessment Results Table:**
- Users can only view their own results
- Users can save new results

### 5. Test the Setup

You can test the setup by:

1. Registering a new user in your app
2. Checking if a profile is automatically created
3. Uploading some questions and verifying they're saved
4. Taking an assessment and checking if results are stored

### 6. Database Schema Overview

```sql
-- User profiles (extends auth.users)
profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users.id
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User's custom questions
custom_questions (
  id UUID PRIMARY KEY,
  user_id UUID,                  -- Links to auth.users.id
  assessment_type TEXT,          -- 'coding', 'personality', etc.
  question_data JSONB,           -- The actual question object
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User's assessment results
assessment_results (
  id UUID PRIMARY KEY,
  user_id UUID,                  -- Links to auth.users.id
  assessment_type TEXT,          -- 'coding', 'personality', etc.
  score INTEGER,                 -- Number of correct answers
  total_questions INTEGER,       -- Total questions in assessment
  time_taken INTEGER,            -- Time in seconds
  answers JSONB,                 -- User's answers
  results_data JSONB,            -- Detailed results, analysis, etc.
  created_at TIMESTAMP
)
```

### 7. Migration from localStorage

If you have existing data in localStorage, you'll need to:

1. Export questions from the current Question Manager
2. Re-upload them after logging in (they'll be saved to database)
3. Assessment results will start saving to database going forward

### 8. Backup and Maintenance

- Supabase automatically handles backups
- You can export data anytime from the Table Editor
- Monitor usage in the Supabase dashboard

## Troubleshooting

**If tables don't appear:**
- Check the SQL editor for any error messages
- Ensure you have the correct permissions
- Try running each CREATE TABLE statement individually

**If RLS policies fail:**
- Make sure authentication is working first
- Check that `auth.uid()` returns the correct user ID
- Test policies in the SQL editor

**If data isn't saving:**
- Check browser console for error messages
- Verify user is authenticated
- Check RLS policies are correctly applied

## Next Steps

After setting up the database:

1. Update your application to use `databaseQuestionManager` instead of `questionManager`
2. Test user registration and question upload
3. Implement assessment result saving
4. Add user dashboard to view saved results