-- ==============================================================================
-- MIND OVER MONEY - Supabase / PostgreSQL Database Schema
-- ==============================================================================

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    volatility NUMERIC NOT NULL,
    sector TEXT NOT NULL,
    description TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    is_beginner_friendly BOOLEAN DEFAULT FALSE,
    extra_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', or 'D'
    explanation TEXT NOT NULL,
    coins INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES TABLE (Anonymous User Sessions)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    coins INTEGER DEFAULT 150,
    total_quiz_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUIZ ATTEMPTS TABLE (Records attempts & prevents repeat rewards)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    coins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_question_attempt UNIQUE (user_id, question_id)
);

-- 5. PRACTICE INVESTMENTS TABLE (Risk-free coin sandbox)
CREATE TABLE IF NOT EXISTS public.practice_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    coins_invested NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    current_price NUMERIC NOT NULL,
    profit_loss NUMERIC NOT NULL,
    scenario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_risk ON public.assets(risk_level);
CREATE INDEX IF NOT EXISTS idx_assets_beginner ON public.assets(is_beginner_friendly);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.practice_investments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_investments ENABLE ROW LEVEL SECURITY;

-- Trigger for automatic user_profiles creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, coins, total_quiz_score)
  VALUES (new.id, 150, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS Policies for Authenticated Users
-- Assets: Public Read
CREATE POLICY "Allow public read on assets" 
ON public.assets FOR SELECT TO anon, authenticated USING (true);

-- Quiz Questions: Public Read
CREATE POLICY "Allow public read on quiz_questions" 
ON public.quiz_questions FOR SELECT TO anon, authenticated USING (true);

-- User Profiles: Read and update own profile
CREATE POLICY "Users can read own profile" 
ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Quiz Attempts: Insert and read own attempts
CREATE POLICY "Users can insert own quiz attempts" 
ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own quiz attempts" 
ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Practice Investments: Insert and read own investments
CREATE POLICY "Users can insert own practice investments" 
ON public.practice_investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own practice investments" 
ON public.practice_investments FOR SELECT TO authenticated USING (auth.uid() = user_id);

