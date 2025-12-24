-- =====================================================
-- ADMIN POLICIES FOR SUPABASE
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- Step 1: Create a function to check if user is admin
-- Replace 'your-admin-email@gmail.com' with your actual admin email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT email IN (
            'aravind45@gmail.com',  -- Add your admin emails here
            'admin@assessmentai.com'
        )
        FROM auth.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Step 2: Add Admin Policies for PROFILES table
-- =====================================================

-- Allow admins to view ALL profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete all profiles" ON public.profiles
    FOR DELETE USING (public.is_admin());

-- =====================================================
-- Step 3: Add Admin Policies for CUSTOM_ASSESSMENT_TYPES table
-- =====================================================

-- Allow admins to view ALL assessments
CREATE POLICY "Admins can view all assessment types" ON public.custom_assessment_types
    FOR SELECT USING (public.is_admin());

-- Allow admins to update any assessment
CREATE POLICY "Admins can update all assessment types" ON public.custom_assessment_types
    FOR UPDATE USING (public.is_admin());

-- Allow admins to delete any assessment
CREATE POLICY "Admins can delete all assessment types" ON public.custom_assessment_types
    FOR DELETE USING (public.is_admin());

-- Allow admins to insert assessments for any user
CREATE POLICY "Admins can insert assessment types" ON public.custom_assessment_types
    FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- Step 4: Add Admin Policies for CUSTOM_QUESTIONS table
-- =====================================================

-- Allow admins to view ALL questions
CREATE POLICY "Admins can view all questions" ON public.custom_questions
    FOR SELECT USING (public.is_admin());

-- Allow admins to update any question
CREATE POLICY "Admins can update all questions" ON public.custom_questions
    FOR UPDATE USING (public.is_admin());

-- Allow admins to delete any question
CREATE POLICY "Admins can delete all questions" ON public.custom_questions
    FOR DELETE USING (public.is_admin());

-- Allow admins to insert questions
CREATE POLICY "Admins can insert questions" ON public.custom_questions
    FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- Step 5: Add Admin Policies for ASSESSMENT_RESULTS table
-- =====================================================

-- Allow admins to view ALL results
CREATE POLICY "Admins can view all results" ON public.assessment_results
    FOR SELECT USING (public.is_admin());

-- Allow admins to delete any result
CREATE POLICY "Admins can delete all results" ON public.assessment_results
    FOR DELETE USING (public.is_admin());

-- =====================================================
-- VERIFICATION: Run this to check policies exist
-- =====================================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
