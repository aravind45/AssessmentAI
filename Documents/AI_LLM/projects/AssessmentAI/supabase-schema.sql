-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create custom_assessment_types table
CREATE TABLE IF NOT EXISTS public.custom_assessment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'FileText',
    color TEXT DEFAULT '#f6d55c',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Enable RLS on custom_assessment_types
ALTER TABLE public.custom_assessment_types ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_assessment_types
CREATE POLICY "Users can view own assessment types" ON public.custom_assessment_types
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own assessment types" ON public.custom_assessment_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment types" ON public.custom_assessment_types
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessment types" ON public.custom_assessment_types
    FOR DELETE USING (auth.uid() = user_id);

-- Create custom_questions table
CREATE TABLE IF NOT EXISTS public.custom_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_type TEXT NOT NULL,
    custom_assessment_id UUID REFERENCES public.custom_assessment_types(id) ON DELETE CASCADE,
    question_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on custom_questions
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_questions
CREATE POLICY "Users can view own questions" ON public.custom_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions" ON public.custom_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON public.custom_questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON public.custom_questions
    FOR DELETE USING (auth.uid() = user_id);

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER, -- in seconds
    answers JSONB NOT NULL,
    results_data JSONB, -- detailed results, inconsistency analysis, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on assessment_results
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_results
CREATE POLICY "Users can view own results" ON public.assessment_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON public.assessment_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_assessment_types_user_id ON public.custom_assessment_types(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_assessment_types_public ON public.custom_assessment_types(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_questions_user_id ON public.custom_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_questions_assessment_type ON public.custom_questions(assessment_type);
CREATE INDEX IF NOT EXISTS idx_custom_questions_custom_assessment_id ON public.custom_questions(custom_assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON public.assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_type ON public.assessment_results(assessment_type);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_questions_updated_at
    BEFORE UPDATE ON public.custom_questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_assessment_types_updated_at
    BEFORE UPDATE ON public.custom_assessment_types
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();