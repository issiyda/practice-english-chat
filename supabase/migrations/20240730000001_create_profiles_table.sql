-- Function to handle updated_at timestamp
-- This function will be used by triggers on tables with an updated_at column.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to table and columns
COMMENT ON TABLE public.profiles IS 'Stores application-specific user information linked to auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'Unique identifier for the profile.';
COMMENT ON COLUMN public.profiles.user_id IS 'Foreign key referencing auth.users.id. Cascades on delete.';
COMMENT ON COLUMN public.profiles.name IS 'Display name of the user.';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp of when the profile was created.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last update to the profile.';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile." ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 