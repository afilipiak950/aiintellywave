
-- Create ai_training_jobs table to track background processing jobs
CREATE TABLE IF NOT EXISTS public.ai_training_jobs (
  jobId UUID PRIMARY KEY,
  status TEXT NOT NULL,
  url TEXT,
  progress INTEGER DEFAULT 0,
  pageCount INTEGER,
  domain TEXT,
  summary TEXT,
  error TEXT,
  faqs JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.ai_training_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select jobs
CREATE POLICY "Allow users to view jobs" ON public.ai_training_jobs
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Allow service role to insert/update jobs
CREATE POLICY "Allow service role to manage jobs" ON public.ai_training_jobs
FOR ALL USING (
  auth.role() = 'service_role'
);
